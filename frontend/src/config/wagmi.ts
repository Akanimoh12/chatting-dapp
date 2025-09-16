import { http } from 'wagmi'
import { sepolia, mainnet } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

export const config = getDefaultConfig({
  appName: 'BoomerChat dApp',
  projectId: 'demo-project-id', // You can get a real one from WalletConnect Cloud
  chains: [sepolia, mainnet],
  transports: {
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
})

export const SUPPORTED_CHAIN_ID = sepolia.id
export const SUPPORTED_CHAIN = sepolia