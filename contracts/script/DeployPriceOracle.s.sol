// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {ChainlinkPriceOracle} from "../src/ChainlinkPriceOracle.sol";
import {PriceChatIntegration} from "../src/PriceChatIntegration.sol";
import {BoomerChatRegistry} from "../src/BoomerChatRegistry.sol";

/**
 * @title DeployPriceOracle
 * @notice Deployment script for Chainlink Price Oracle system
 * @dev Deploys both the price oracle and chat integration contracts
 * 
 * Deployment Process:
 * 1. Deploy ChainlinkPriceOracle contract
 * 2. Deploy PriceChatIntegration contract  
 * 3. Set up initial configuration
 * 4. Verify contract interactions
 * 
 * Prerequisites:
 * - BoomerChatRegistry must already be deployed
 * - Price bot address must be registered in BoomerChat
 * - Deployer must have sufficient ETH for gas
 * 
 * Network: Ethereum Sepolia Testnet
 * Chainlink Feeds: BTC/USD, ETH/USD, BTC/ETH, BNB/ETH
 */
contract DeployPriceOracle is Script {
    
    // Configuration Constants
    address constant EXISTING_CHAT_CONTRACT = 0x6C74B43b04C17322c5DfCE754b1d321EF7DF1a2c; // Your deployed BoomerChatRegistry
    
    // Price bot configuration - this address should be registered in BoomerChat
    address constant PRICE_BOT_ADDRESS = 0x58C25c26666B31241C67Cf7B9a82e325eB07c342; // Your deployer address for now
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("=== CHAINLINK PRICE ORACLE DEPLOYMENT ===");
        console.log("Deployer:", deployer);
        console.log("Existing Chat Contract:", EXISTING_CHAT_CONTRACT);
        console.log("Price Bot Address:", PRICE_BOT_ADDRESS);
        console.log("");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Step 1: Deploy ChainlinkPriceOracle
        console.log("1. Deploying ChainlinkPriceOracle...");
        ChainlinkPriceOracle priceOracle = new ChainlinkPriceOracle();
        console.log("   ChainlinkPriceOracle deployed to:", address(priceOracle));
        
        // Step 2: Deploy PriceChatIntegration
        console.log("2. Deploying PriceChatIntegration...");
        PriceChatIntegration integration = new PriceChatIntegration(
            address(priceOracle),
            EXISTING_CHAT_CONTRACT,
            PRICE_BOT_ADDRESS
        );
        console.log("   PriceChatIntegration deployed to:", address(integration));
        
        // Step 3: Configure the system
        console.log("3. Configuring price oracle system...");
        
        // Set custom alert thresholds (5% for BTC/ETH, 3% for ETH/USD, etc.)
        integration.setAlertThreshold("BTC/USD", 300);  // 3% threshold
        integration.setAlertThreshold("ETH/USD", 300);  // 3% threshold  
        integration.setAlertThreshold("BTC/ETH", 500);  // 5% threshold
        integration.setAlertThreshold("BNB/ETH", 500);  // 5% threshold
        
        // Set minimum time between alerts to 10 minutes
        integration.setMinTimeBetweenAlerts(600); // 10 minutes
        
        console.log("   Alert thresholds configured");
        console.log("   BTC/USD & ETH/USD: 3% threshold");
        console.log("   BTC/ETH & BNB/ETH: 5% threshold");
        console.log("   Minimum alert interval: 10 minutes");
        
        vm.stopBroadcast();
        
        // Step 4: Display contract information
        console.log("");
        console.log("=== DEPLOYMENT SUMMARY ===");
        console.log("ChainlinkPriceOracle:", address(priceOracle));
        console.log("PriceChatIntegration:", address(integration));
        console.log("BoomerChatRegistry:", EXISTING_CHAT_CONTRACT);
        console.log("");
        
        // Step 5: Display initial prices (view calls)
        console.log("=== INITIAL PRICE DATA ===");
        try priceOracle.getAllPrices() returns (
            int256 btcUsd,
            int256 ethUsd,
            int256 btcEth,
            int256 bnbEth,
            uint256 lastUpdate
        ) {
            console.log("BTC/USD:", _formatPrice(btcUsd, 8));
            console.log("ETH/USD:", _formatPrice(ethUsd, 8));
            console.log("BTC/ETH:", _formatPrice(btcEth, 18));
            console.log("BNB/ETH:", _formatPrice(bnbEth, 18));
            console.log("Last Update:", lastUpdate);
        } catch {
            console.log("Could not fetch initial prices (normal for fresh deployment)");
        }
        
        // Step 6: Display next steps
        console.log("");
        console.log("=== NEXT STEPS ===");
        console.log("1. Register the price bot address in BoomerChatRegistry:");
        console.log("   - Call registerBoomerUser() with bot address");
        console.log("   - Use a unique .boomer name like 'pricebot.boomer'");
        console.log("");
        console.log("2. Set up Chainlink Automation (Upkeep):");
        console.log("   - Visit https://automation.chain.link/");
        console.log("   - Create new upkeep for ChainlinkPriceOracle");
        console.log("   - Target contract:", address(priceOracle));
        console.log("   - Trigger: Time-based (every 1 hour)");
        console.log("   - Gas limit: 500,000");
        console.log("");
        console.log("3. Fund the Automation Upkeep:");
        console.log("   - Add LINK tokens to your upkeep balance");
        console.log("   - Recommended: 10-20 LINK for testing");
        console.log("");
        console.log("4. Test the integration:");
        console.log("   - Call integration.checkAndPostPriceAlerts()");
        console.log("   - Call integration.postHourlySummary()");
        console.log("   - Monitor chat for price messages");
        console.log("");
        console.log("5. Monitor and maintain:");
        console.log("   - Check automation balance regularly");
        console.log("   - Monitor price feed health");
        console.log("   - Adjust alert thresholds as needed");
        
        console.log("");
        console.log("=== USEFUL COMMANDS ===");
        console.log("Check price oracle status:");
        console.log("cast call", address(priceOracle), "getContractStatus()(uint256,bool,bool,uint256,uint256)");
        console.log("");
        console.log("Check integration status:");
        console.log("cast call", address(integration), "getIntegrationStatus()(bool,bool,bool,uint256,uint256)");
        console.log("");
        console.log("Manual price update:");
        console.log("cast send", address(priceOracle), "manualUpdateAllPrices()" "--private-key $PRIVATE_KEY");
        console.log("");
        console.log("Test price alert:");
        console.log("cast send", address(integration), "checkAndPostPriceAlerts()" "--private-key $PRIVATE_KEY");
    }
    
    /**
     * @notice Helper function to format prices for console output
     * @param price Raw price value
     * @param decimals Number of decimals
     * @return Formatted price string
     */
    function _formatPrice(int256 price, uint8 decimals) internal pure returns (string memory) {
        if (price == 0) return "0";
        
        uint256 absPrice = uint256(price < 0 ? -price : price);
        uint256 wholePart = absPrice / (10 ** decimals);
        uint256 fractionalPart = absPrice % (10 ** decimals);
        
        // Show 2 decimal places for display
        fractionalPart = fractionalPart / (10 ** (decimals - 2));
        
        return string(abi.encodePacked(
            price < 0 ? "-" : "",
            vm.toString(wholePart),
            ".",
            fractionalPart < 10 ? "0" : "",
            vm.toString(fractionalPart)
        ));
    }
}