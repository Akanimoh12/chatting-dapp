# BoomerChat dApp

A decentralized chat application with .boomer domain registration on Ethereum.

## Live Demo
[BoomerChat dApp](http://localhost:5175) *(Development Server)*

## Features
- **.boomer Domain Registration**: Claim your unique .boomer username
- **On-chain Messaging**: All messages stored permanently on blockchain
- **Group & Private Chat**: Public group chat and private direct messaging
- **IPFS Profile Images**: Decentralized profile picture storage
- **Real-time Updates**: Live chat using blockchain events

## 🛠 Tech Stack
- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Blockchain**: Ethereum (Sepolia Testnet)
- **Smart Contract**: Solidity + Foundry
- **Wallet**: RainbowKit + Wagmi
- **Storage**: IPFS for profile images

## Contract Addresses
- **Sepolia Testnet**: [`0x6767Dd3830A88DED122c5dA4d05D052227097886`](https://sepolia.etherscan.io/address/0x6767Dd3830A88DED122c5dA4d05D052227097886)
- **Explorer**: [View on Etherscan](https://sepolia.etherscan.io/address/0x6767Dd3830A88DED122c5dA4d05D052227097886)

## Quick Start

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Contracts
```bash
cd contracts
forge build
forge test
```

## 📝 Usage
1. Connect your wallet (MetaMask recommended)
2. Switch to Sepolia testnet
3. Register your .boomer username
4. Start chatting on-chain!

## 🧪 Testing
- Connect wallet to Sepolia testnet
- Get test ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
- Registration fee: 0.001 ETH
