import { useEffect } from 'react'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { toast } from 'react-hot-toast'
import { SUPPORTED_CHAIN_ID, SUPPORTED_CHAIN } from '../config/wagmi'

export const useNetworkValidation = () => {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain, isPending: isSwitching } = useSwitchChain()

  const isCorrectNetwork = chainId === SUPPORTED_CHAIN_ID
  const isWrongNetwork = isConnected && !isCorrectNetwork

  const switchToSepolia = () => {
    if (!switchChain) {
      toast.error('Network switching not supported by this wallet')
      return
    }

    switchChain(
      { chainId: SUPPORTED_CHAIN_ID },
      {
        onSuccess: () => {
          toast.success(`Successfully switched to ${SUPPORTED_CHAIN.name}`)
        },
        onError: (error) => {
          console.error('Network switch failed:', error)
          toast.error('Failed to switch network. Please try manually.')
        },
      }
    )
  }

  // Show network warning toast when on wrong network
  useEffect(() => {
    if (isWrongNetwork) {
      const currentChainName = chainId === 1 ? 'Ethereum Mainnet' : `Chain ${chainId}`
      
      toast.error(
        `Wrong network detected! Please switch to ${SUPPORTED_CHAIN.name}.\nCurrently on: ${currentChainName}`,
        {
          duration: 8000,
          id: 'network-warning', // Prevent multiple toasts
        }
      )
    }
  }, [isWrongNetwork, chainId])

  return {
    isConnected,
    isCorrectNetwork,
    isWrongNetwork,
    currentChainId: chainId,
    supportedChainId: SUPPORTED_CHAIN_ID,
    supportedChainName: SUPPORTED_CHAIN.name,
    switchToSepolia,
    isSwitching,
  }
}