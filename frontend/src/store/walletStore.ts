import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { WalletState } from '../types'

interface WalletStore extends WalletState {
  // Actions
  setConnection: (isConnected: boolean, address?: `0x${string}`) => void
  setChainId: (chainId: number) => void
  setBalance: (balance: string) => void
  setConnecting: (isConnecting: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState: WalletState = {
  isConnected: false,
  address: null,
  chainId: null,
  balance: '0',
  isConnecting: false,
  error: null,
}

export const useWalletStore = create<WalletStore>()(
  devtools(
    (set) => ({
      ...initialState,
      
      setConnection: (isConnected, address) => 
        set({ isConnected, address: address || null }, false, 'setConnection'),
      
      setChainId: (chainId) => 
        set({ chainId }, false, 'setChainId'),
      
      setBalance: (balance) => 
        set({ balance }, false, 'setBalance'),
      
      setConnecting: (isConnecting) => 
        set({ isConnecting }, false, 'setConnecting'),
      
      setError: (error) => 
        set({ error }, false, 'setError'),
      
      reset: () => 
        set(initialState, false, 'reset'),
    }),
    {
      name: 'wallet-store',
    }
  )
)