import { http } from 'wagmi'
import { sepolia, mainnet } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

export const config = getDefaultConfig({
  appName: 'BoomerChat dApp',
  projectId: 'demo-project-id', // You can get a real one from WalletConnect Cloud
  chains: [sepolia, mainnet],
  transports: {
    [sepolia.id]: http('https://eth-sepolia.g.alchemy.com/v2/RyUpg4QFZGXfE_6vvXCPbhC8uy6etzmV', {
      batch: true,
      retryCount: 2,
      retryDelay: 1000,
    }),
    [mainnet.id]: http(),
  },
})

export const SUPPORTED_CHAIN_ID = sepolia.id
export const SUPPORTED_CHAIN = sepolia