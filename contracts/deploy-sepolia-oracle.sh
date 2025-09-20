#!/bin/bash

# Deploy Price Oracle System to Ethereum Sepolia
# This script deploys the Chainlink price oracle and integration contracts

echo "🚀 Deploying Chainlink Price Oracle System to Ethereum Sepolia..."
echo "=================================================="

# Check if required environment variables are set
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: PRIVATE_KEY environment variable not set"
    echo "Please set your private key in the .env file"
    exit 1
fi

if [ -z "$SEPOLIA_RPC_URL" ]; then
    echo "❌ Error: SEPOLIA_RPC_URL environment variable not set"
    echo "Please set your Sepolia RPC URL in the .env file"
    exit 1
fi

echo "📋 Configuration:"
echo "Network: Ethereum Sepolia"
echo "RPC URL: $SEPOLIA_RPC_URL"
echo "Deployer: $(cast wallet address --private-key $PRIVATE_KEY)"
echo ""

echo "💰 Checking ETH balance..."
BALANCE=$(cast balance $(cast wallet address --private-key $PRIVATE_KEY) --rpc-url $SEPOLIA_RPC_URL)
echo "Balance: $(cast --from-wei $BALANCE) ETH"

if [ "$(echo "$BALANCE < 100000000000000000" | bc)" -eq 1 ]; then
    echo "⚠️  Warning: Low ETH balance. You may need more Sepolia ETH for deployment."
    echo "Get Sepolia ETH from: https://faucets.chain.link/"
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "🔧 Compiling contracts..."
forge build

if [ $? -ne 0 ]; then
    echo "❌ Compilation failed"
    exit 1
fi

echo "✅ Compilation successful"
echo ""

echo "📦 Deploying contracts..."
forge script script/DeployPriceOracle.s.sol:DeployPriceOracle \
    --rpc-url $SEPOLIA_RPC_URL \
    --private-key $PRIVATE_KEY \
    --broadcast \
    --verify \
    --etherscan-api-key $ETHERSCAN_API_KEY \
    -vvvv

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment successful!"
    echo ""
    echo "📋 Important Next Steps:"
    echo "1. Save the deployed contract addresses"
    echo "2. Register price bot in BoomerChatRegistry"
    echo "3. Set up Chainlink Automation at https://automation.chain.link/"
    echo "4. Fund your automation upkeep with LINK tokens"
    echo "5. Test the price alert system"
    echo ""
    echo "📚 Documentation:"
    echo "- Chainlink Data Feeds: https://docs.chain.link/data-feeds"
    echo "- Chainlink Automation: https://docs.chain.link/chainlink-automation"
    echo "- LINK Token Faucet: https://faucets.chain.link/"
else
    echo "❌ Deployment failed"
    exit 1
fi