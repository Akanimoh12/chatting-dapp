// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract ChainlinkPriceOracle is AutomationCompatibleInterface, Ownable {
    
    event PriceUpdated(
        string indexed pairName,
        int256 oldPrice,
        int256 newPrice,
        int256 percentageChange,
        uint256 timestamp
    );
    
    event BulkPriceUpdate(
        int256 btcUsdPrice,
        int256 ethUsdPrice,
        int256 btcEthPrice,
        int256 bnbEthPrice,
        uint256 timestamp
    );
    
    event UpdateIntervalChanged(uint256 oldInterval, uint256 newInterval);
    
    struct PriceData {
        int256 price;
        uint256 timestamp;
        uint80 roundId;
        uint8 decimals;
    }
    
    AggregatorV3Interface private immutable btcUsdPriceFeed;
    AggregatorV3Interface private immutable ethUsdPriceFeed;
    AggregatorV3Interface private immutable btcEthPriceFeed;
    AggregatorV3Interface private immutable bnbEthPriceFeed;
    
    mapping(string => PriceData) public priceData;
    mapping(string => int256) public previousPrices;
    
    uint256 public updateInterval;
    uint256 public lastUpdateTime;
    bool public automationEnabled;
    
    uint256 public totalUpdates;
    bool public emergencyPaused;
    
    uint256 private constant PERCENTAGE_MULTIPLIER = 10000;
    uint256 private constant DEFAULT_UPDATE_INTERVAL = 3600;
    
    constructor() Ownable(msg.sender) {
        btcUsdPriceFeed = AggregatorV3Interface(0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43);
        ethUsdPriceFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
        btcEthPriceFeed = AggregatorV3Interface(0x5fb1616F78dA7aFC9FF79e0371741a747D2a7F22);
        bnbEthPriceFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
        
        updateInterval = DEFAULT_UPDATE_INTERVAL;
        automationEnabled = true;
        lastUpdateTime = block.timestamp;
        
        _updateAllPrices();
    }
    
    function checkUpkeep(bytes calldata)
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        upkeepNeeded = automationEnabled && 
                      !emergencyPaused &&
                      (block.timestamp - lastUpdateTime) >= updateInterval;
        performData = "";
    }
    
    function performUpkeep(bytes calldata) external override {
        require(automationEnabled, "Automation is disabled");
        require(!emergencyPaused, "Contract is paused");
        require((block.timestamp - lastUpdateTime) >= updateInterval, "Update interval not reached");
        
        _updateAllPrices();
        lastUpdateTime = block.timestamp;
        totalUpdates++;
    }
    
    function _updateAllPrices() internal {
        int256 newBtcUsd = _updateSinglePrice("BTC/USD", btcUsdPriceFeed);
        int256 newEthUsd = _updateSinglePrice("ETH/USD", ethUsdPriceFeed);
        int256 newBtcEth = _updateSinglePrice("BTC/ETH", btcEthPriceFeed);
        int256 newBnbEth = _updateSinglePrice("BNB/ETH", bnbEthPriceFeed);
        
        emit BulkPriceUpdate(newBtcUsd, newEthUsd, newBtcEth, newBnbEth, block.timestamp);
    }
    
    function _updateSinglePrice(string memory pairName, AggregatorV3Interface priceFeed) 
        internal 
        returns (int256 newPrice) 
    {
        try priceFeed.latestRoundData() returns (
            uint80 roundId,
            int256 price,
            uint256,
            uint256 updatedAt,
            uint80
        ) {
            require(price > 0, string(abi.encodePacked("Invalid price for ", pairName)));
            require(updatedAt > 0, string(abi.encodePacked("Invalid timestamp for ", pairName)));
            
            uint8 decimals = priceFeed.decimals();
            int256 oldPrice = priceData[pairName].price;
            previousPrices[pairName] = oldPrice;
            
            priceData[pairName] = PriceData({
                price: price,
                timestamp: updatedAt,
                roundId: roundId,
                decimals: decimals
            });
            
            int256 percentageChange = 0;
            if (oldPrice > 0) {
                percentageChange = ((price - oldPrice) * int256(PERCENTAGE_MULTIPLIER)) / oldPrice;
            }
            
            emit PriceUpdated(pairName, oldPrice, price, percentageChange, block.timestamp);
            return price;
            
        } catch Error(string memory reason) {
            revert(string(abi.encodePacked("Price feed error for ", pairName, ": ", reason)));
        } catch {
            revert(string(abi.encodePacked("Failed to fetch price for ", pairName)));
        }
    }
    
    function manualUpdateAllPrices() external onlyOwner {
        require(!emergencyPaused, "Contract is paused");
        _updateAllPrices();
        lastUpdateTime = block.timestamp;
        totalUpdates++;
    }
    
    function manualUpdateSinglePrice(string memory pairName) external onlyOwner {
        require(!emergencyPaused, "Contract is paused");
        
        if (keccak256(bytes(pairName)) == keccak256(bytes("BTC/USD"))) {
            _updateSinglePrice(pairName, btcUsdPriceFeed);
        } else if (keccak256(bytes(pairName)) == keccak256(bytes("ETH/USD"))) {
            _updateSinglePrice(pairName, ethUsdPriceFeed);
        } else if (keccak256(bytes(pairName)) == keccak256(bytes("BTC/ETH"))) {
            _updateSinglePrice(pairName, btcEthPriceFeed);
        } else if (keccak256(bytes(pairName)) == keccak256(bytes("BNB/ETH"))) {
            _updateSinglePrice(pairName, bnbEthPriceFeed);
        } else {
            revert("Unsupported trading pair");
        }
    }
    
    function getLatestPrice(string memory pairName) 
        external 
        view 
        returns (int256 price, uint256 timestamp, uint8 decimals) 
    {
        PriceData memory data = priceData[pairName];
        return (data.price, data.timestamp, data.decimals);
    }
    
    function getPriceChangePercentage(string memory pairName) 
        external 
        view 
        returns (int256 percentageChange) 
    {
        int256 currentPrice = priceData[pairName].price;
        int256 previousPrice = previousPrices[pairName];
        
        if (previousPrice > 0) {
            percentageChange = ((currentPrice - previousPrice) * int256(PERCENTAGE_MULTIPLIER)) / previousPrice;
        }
        
        return percentageChange;
    }
    
    function getAllPrices() 
        external 
        view 
        returns (
            int256 btcUsd,
            int256 ethUsd,
            int256 btcEth,
            int256 bnbEth,
            uint256 lastUpdate
        ) 
    {
        return (
            priceData["BTC/USD"].price,
            priceData["ETH/USD"].price,
            priceData["BTC/ETH"].price,
            priceData["BNB/ETH"].price,
            lastUpdateTime
        );
    }
    
    function isPriceFeedHealthy(string memory pairName, uint256 maxAge) 
        external 
        view 
        returns (bool isHealthy) 
    {
        uint256 priceTimestamp = priceData[pairName].timestamp;
        return (block.timestamp - priceTimestamp) <= maxAge;
    }
    
    function setUpdateInterval(uint256 newInterval) external onlyOwner {
        require(newInterval >= 300, "Interval must be at least 5 minutes");
        require(newInterval <= 86400, "Interval must be at most 24 hours");
        
        uint256 oldInterval = updateInterval;
        updateInterval = newInterval;
        
        emit UpdateIntervalChanged(oldInterval, newInterval);
    }
    
    function setAutomationEnabled(bool enabled) external onlyOwner {
        automationEnabled = enabled;
    }
    
    function setEmergencyPaused(bool paused) external onlyOwner {
        emergencyPaused = paused;
    }
    
    function getContractStatus() 
        external 
        view 
        returns (
            uint256 interval,
            bool enabled,
            bool paused,
            uint256 lastUpdate,
            uint256 totalUpdateCount
        ) 
    {
        return (
            updateInterval,
            automationEnabled,
            emergencyPaused,
            lastUpdateTime,
            totalUpdates
        );
    }
    
    function timeUntilNextUpdate() external view returns (uint256 timeUntilUpdate) {
        uint256 timeSinceLastUpdate = block.timestamp - lastUpdateTime;
        if (timeSinceLastUpdate >= updateInterval) {
            return 0;
        }
        return updateInterval - timeSinceLastUpdate;
    }
    
    function getFormattedPrice(string memory pairName) 
        external 
        view 
        returns (string memory formattedPrice) 
    {
        PriceData memory data = priceData[pairName];
        uint256 absPrice = uint256(data.price < 0 ? -data.price : data.price);
        
        return string(abi.encodePacked(
            data.price < 0 ? "-" : "",
            _toString(absPrice / (10 ** data.decimals)),
            ".",
            _toString((absPrice % (10 ** data.decimals)))
        ));
    }
    
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}