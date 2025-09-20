import { http } from 'wagmi'
import { defineChain } from 'viem'
import { sepolia } from 'viem/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

// Define Lisk Sepolia chain
export const liskSepolia = defineChain({
  id: 4202,
  name: 'Lisk Sepolia Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Sepolia Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://rpc.sepolia-api.lisk.com'] },
    public: { http: ['https://rpc.sepolia-api.lisk.com'] },
  },
  blockExplorers: {
    default: { name: 'Lisk Sepolia Explorer', url: 'https://sepolia-blockscout.lisk.com' },
  },
  testnet: true,
})

export const config = getDefaultConfig({
  appName: 'BoomerChat dApp',
  projectId: 'demo-project-id', // You can get a real one from WalletConnect Cloud
  chains: [sepolia, liskSepolia], // Support both Ethereum Sepolia and Lisk Sepolia
  transports: {
    [sepolia.id]: http('https://sepolia.drpc.org', {
      batch: true,
      retryCount: 3,
    }),
    [liskSepolia.id]: http('https://rpc.sepolia-api.lisk.com', {
      batch: true,
      retryCount: 3,
      retryDelay: 1000,
    }),
  },
})

export const SUPPORTED_CHAIN_ID = liskSepolia.id
export const SUPPORTED_CHAIN = liskSepolia