import { createConfig, http } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors'

// Environment variables (these will be set via .env file)
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id'

export const config = createConfig({
  chains: [sepolia],
  connectors: [
    injected(),
    coinbaseWallet({ 
      appName: 'BoomerChat',
      appLogoUrl: '/boomer-logo.png'
    }),
    walletConnect({ 
      projectId,
      metadata: {
        name: 'BoomerChat',
        description: 'On-chain chat dApp with .boomer ENS',
        url: 'https://boomerchat.app',
        icons: ['https://boomerchat.app/logo.png']
      }
    }),
  ],
  transports: {
    [sepolia.id]: http(import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/demo'),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}