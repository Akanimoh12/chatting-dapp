// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "./ChainlinkPriceOracle.sol";
import "./BoomerChatRegistry.sol";

contract PriceChatIntegration is Ownable {
    
    event PriceAlertPosted(
        string indexed pairName,
        int256 priceChange,
        int256 newPrice,
        uint256 messageId
    );
    
    event HourlySummaryPosted(uint256 messageId, uint256 timestamp);
    
    event AlertThresholdUpdated(
        string indexed pairName,
        uint256 oldThreshold,
        uint256 newThreshold
    );
    
    ChainlinkPriceOracle public immutable priceOracle;
    BoomerChatRegistry public immutable chatRegistry;
    
    mapping(string => uint256) public alertThresholds;
    mapping(string => bool) public pairEnabled;
    mapping(string => uint256) public lastAlertTime;
    
    uint256 public minTimeBetweenAlerts;
    uint256 public lastHourlySummary;
    bool public alertsEnabled;
    bool public hourlySummaryEnabled;
    
    address public priceBot;
    bool public isBotRegistered;
    
    uint256 private constant BASIS_POINTS = 10000;
    uint256 private constant DEFAULT_THRESHOLD = 500;
    uint256 private constant MIN_ALERT_INTERVAL = 300;
    uint256 private constant HOUR_IN_SECONDS = 3600;
    
    string[] private supportedPairs = ["BTC/USD", "ETH/USD", "BTC/ETH", "BNB/ETH"];
    
    constructor(
        address _priceOracle,
        address _chatRegistry,
        address _priceBot
    ) Ownable(msg.sender) {
        require(_priceOracle != address(0), "Invalid oracle address");
        require(_chatRegistry != address(0), "Invalid chat address");
        require(_priceBot != address(0), "Invalid bot address");
        
        priceOracle = ChainlinkPriceOracle(_priceOracle);
        chatRegistry = BoomerChatRegistry(_chatRegistry);
        priceBot = _priceBot;
        
        alertsEnabled = true;
        hourlySummaryEnabled = true;
        minTimeBetweenAlerts = MIN_ALERT_INTERVAL;
        lastHourlySummary = block.timestamp;
        
        for (uint i = 0; i < supportedPairs.length; i++) {
            alertThresholds[supportedPairs[i]] = DEFAULT_THRESHOLD;
            pairEnabled[supportedPairs[i]] = true;
        }
    }
    
    function registerPriceBot() external onlyOwner {
        require(!isBotRegistered, "Bot already registered");
        
        try chatRegistry.registerBoomerUser{value: 0.01 ether}("PriceBot", "QmPriceBotHash") {
            isBotRegistered = true;
        } catch Error(string memory reason) {
            revert(string(abi.encodePacked("Bot registration failed: ", reason)));
        }
    }
    
    function checkAndPostPriceAlerts() external {
        require(alertsEnabled, "Alerts are disabled");
        require(isBotRegistered, "Bot not registered");
        
        for (uint i = 0; i < supportedPairs.length; i++) {
            string memory pairName = supportedPairs[i];
            
            if (!pairEnabled[pairName]) continue;
            if (block.timestamp - lastAlertTime[pairName] < minTimeBetweenAlerts) continue;
            
            int256 percentageChange = priceOracle.getPriceChangePercentage(pairName);
            uint256 absChange = uint256(percentageChange < 0 ? -percentageChange : percentageChange);
            
            if (absChange >= alertThresholds[pairName]) {
                _postPriceAlert(pairName, percentageChange);
            }
        }
    }
    
    function _postPriceAlert(string memory pairName, int256 percentageChange) internal {
        (int256 currentPrice, , uint8 decimals) = priceOracle.getLatestPrice(pairName);
        
        string memory alertMessage = _formatPriceAlert(pairName, percentageChange, currentPrice, decimals);
        
        try chatRegistry.sendGroupMessage(alertMessage) {
            lastAlertTime[pairName] = block.timestamp;
            emit PriceAlertPosted(pairName, percentageChange, currentPrice, 0);
        } catch Error(string memory reason) {
            revert(string(abi.encodePacked("Failed to post alert: ", reason)));
        }
    }
    
    function _formatPriceAlert(
        string memory pairName,
        int256 percentageChange,
        int256 currentPrice,
        uint8 decimals
    ) internal view returns (string memory) {
        string memory direction = percentageChange >= 0 ? "UP" : "DOWN";
        string memory emoji = percentageChange >= 0 ? "[UP]" : "[DOWN]";
        
        uint256 absChange = uint256(percentageChange < 0 ? -percentageChange : percentageChange);
        string memory changeStr = _formatPercentage(absChange);
        string memory priceStr = _formatPrice(currentPrice, decimals);
        
        return string(abi.encodePacked(
            emoji, " PRICE ALERT: ", pairName, " ", direction, " ", changeStr, "%\n",
            "Current Price: $", priceStr, "\n",
            "Time: ", _getTimeString()
        ));
    }
    
    function postHourlySummary() external {
        require(hourlySummaryEnabled, "Hourly summaries disabled");
        require(isBotRegistered, "Bot not registered");
        require(block.timestamp - lastHourlySummary >= HOUR_IN_SECONDS, "Too early for summary");
        
        string memory summaryMessage = _formatHourlySummary();
        
        try chatRegistry.sendGroupMessage(summaryMessage) {
            lastHourlySummary = block.timestamp;
            emit HourlySummaryPosted(0, block.timestamp);
        } catch Error(string memory reason) {
            revert(string(abi.encodePacked("Failed to post summary: ", reason)));
        }
    }
    
    function _formatHourlySummary() internal view returns (string memory) {
        string memory summary = string(abi.encodePacked(
            "[CHART] HOURLY PRICE SUMMARY\n",
            "================================\n",
            "[BTC] BTC/USD: $", priceOracle.getFormattedPrice("BTC/USD"), "\n",
            "[ETH] ETH/USD: $", priceOracle.getFormattedPrice("ETH/USD"), "\n",
            "[BTC/ETH] BTC/ETH: ", priceOracle.getFormattedPrice("BTC/ETH"), " ETH\n",
            "[BNB] BNB/ETH: ", priceOracle.getFormattedPrice("BNB/ETH"), " ETH\n",
            "================================\n",
            "Last Update: ", _getTimeString()
        ));
        
        return summary;
    }
    
    function _formatPercentage(uint256 basisPoints) internal pure returns (string memory) {
        uint256 wholePart = basisPoints / 100;
        uint256 decimalPart = basisPoints % 100;
        
        if (decimalPart == 0) {
            return _toString(wholePart);
        } else {
            return string(abi.encodePacked(_toString(wholePart), ".", _toString(decimalPart)));
        }
    }
    
    function _formatPrice(int256 price, uint8 decimals) internal pure returns (string memory) {
        uint256 absPrice = uint256(price < 0 ? -price : price);
        uint256 wholePart = absPrice / (10 ** decimals);
        uint256 decimalPart = absPrice % (10 ** decimals);
        
        return string(abi.encodePacked(
            price < 0 ? "-" : "",
            _toString(wholePart),
            ".",
            _toString(decimalPart)
        ));
    }
    
    function _getTimeString() internal view returns (string memory) {
        return _toString(block.timestamp);
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
    
    function setAlertThreshold(string memory pairName, uint256 thresholdBasisPoints) external onlyOwner {
        require(thresholdBasisPoints >= 10, "Threshold too low"); 
        require(thresholdBasisPoints <= 5000, "Threshold too high");
        require(pairEnabled[pairName], "Pair not supported");
        
        uint256 oldThreshold = alertThresholds[pairName];
        alertThresholds[pairName] = thresholdBasisPoints;
        
        emit AlertThresholdUpdated(pairName, oldThreshold, thresholdBasisPoints);
    }
    
    function setPairEnabled(string memory pairName, bool enabled) external onlyOwner {
        pairEnabled[pairName] = enabled;
    }
    
    function setAlertsEnabled(bool enabled) external onlyOwner {
        alertsEnabled = enabled;
    }
    
    function setHourlySummaryEnabled(bool enabled) external onlyOwner {
        hourlySummaryEnabled = enabled;
    }
    
    function setMinTimeBetweenAlerts(uint256 timeInSeconds) external onlyOwner {
        require(timeInSeconds >= 60, "Minimum 1 minute");
        require(timeInSeconds <= 3600, "Maximum 1 hour");
        minTimeBetweenAlerts = timeInSeconds;
    }
    
    function updatePriceBot(address newPriceBot) external onlyOwner {
        require(newPriceBot != address(0), "Invalid address");
        priceBot = newPriceBot;
        isBotRegistered = false;
    }
    
    function manualPriceCheck() external onlyOwner {
        require(alertsEnabled, "Alerts are disabled");
        require(isBotRegistered, "Bot not registered");
        
        for (uint i = 0; i < supportedPairs.length; i++) {
            string memory pairName = supportedPairs[i];
            
            if (!pairEnabled[pairName]) continue;
            if (block.timestamp - lastAlertTime[pairName] < minTimeBetweenAlerts) continue;
            
            int256 percentageChange = priceOracle.getPriceChangePercentage(pairName);
            uint256 absChange = uint256(percentageChange < 0 ? -percentageChange : percentageChange);
            
            if (absChange >= alertThresholds[pairName]) {
                _postPriceAlert(pairName, percentageChange);
            }
        }
    }
    
    function manualHourlySummary() external onlyOwner {
        require(isBotRegistered, "Bot not registered");
        string memory summaryMessage = _formatHourlySummary();
        
        try chatRegistry.sendGroupMessage(summaryMessage) {
            emit HourlySummaryPosted(0, block.timestamp);
        } catch Error(string memory reason) {
            revert(string(abi.encodePacked("Failed to post manual summary: ", reason)));
        }
    }
    
    function getIntegrationStatus() 
        external 
        view 
        returns (
            bool alerts,
            bool summaries,
            bool botRegistered,
            uint256 minInterval,
            uint256 lastSummary
        ) 
    {
        return (
            alertsEnabled,
            hourlySummaryEnabled,
            isBotRegistered,
            minTimeBetweenAlerts,
            lastHourlySummary
        );
    }
    
    function getPairConfiguration(string memory pairName) 
        external 
        view 
        returns (
            bool enabled,
            uint256 threshold,
            uint256 lastAlert
        ) 
    {
        return (
            pairEnabled[pairName],
            alertThresholds[pairName],
            lastAlertTime[pairName]
        );
    }
    
    function getAllPairConfigurations() 
        external 
        view 
        returns (
            string[] memory pairs,
            bool[] memory enabled,
            uint256[] memory thresholds
        ) 
    {
        pairs = new string[](supportedPairs.length);
        enabled = new bool[](supportedPairs.length);
        thresholds = new uint256[](supportedPairs.length);
        
        for (uint i = 0; i < supportedPairs.length; i++) {
            pairs[i] = supportedPairs[i];
            enabled[i] = pairEnabled[supportedPairs[i]];
            thresholds[i] = alertThresholds[supportedPairs[i]];
        }
        
        return (pairs, enabled, thresholds);
    }
    
    function timeUntilNextSummary() external view returns (uint256) {
        uint256 timeSinceLastSummary = block.timestamp - lastHourlySummary;
        if (timeSinceLastSummary >= HOUR_IN_SECONDS) {
            return 0;
        }
        return HOUR_IN_SECONDS - timeSinceLastSummary;
    }
    
    function canPostAlert(string memory pairName) external view returns (bool) {
        if (!alertsEnabled || !pairEnabled[pairName] || !isBotRegistered) {
            return false;
        }
        
        return block.timestamp - lastAlertTime[pairName] >= minTimeBetweenAlerts;
    }
    
    function simulatePriceAlert(string memory pairName) 
        external 
        view 
        returns (string memory alertMessage, bool wouldTrigger) 
    {
        int256 percentageChange = priceOracle.getPriceChangePercentage(pairName);
        uint256 absChange = uint256(percentageChange < 0 ? -percentageChange : percentageChange);
        
        bool canAlert = alertsEnabled && pairEnabled[pairName] && isBotRegistered &&
                       block.timestamp - lastAlertTime[pairName] >= minTimeBetweenAlerts;
        
        wouldTrigger = absChange >= alertThresholds[pairName] && canAlert;
        
        if (wouldTrigger) {
            (int256 currentPrice, , uint8 decimals) = priceOracle.getLatestPrice(pairName);
            alertMessage = _formatPriceAlert(pairName, percentageChange, currentPrice, decimals);
        }
        
        return (alertMessage, wouldTrigger);
    }
}