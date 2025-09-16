import { useEffect } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { useUserStore } from '../stores/userStore'
import { BOOMER_CHAT_ABI, CONTRACT_ADDRESS } from '../config/contracts'

export const useUserRegistration = () => {
  const { address, isConnected } = useAccount()
  const { user, setUser, clearUser } = useUserStore()

  // Check if user is registered
  const { data: isRegistered, isLoading: isCheckingRegistration } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: BOOMER_CHAT_ABI,
    functionName: 'isRegisteredBoomerUser',
    args: [address!],
    query: {
      enabled: !!address && isConnected,
    },
  })

  // Get user profile data if registered
  const { data: profileData } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: BOOMER_CHAT_ABI,
    functionName: 'getBoomerProfile',
    args: [address!],
    query: {
      enabled: !!address && isConnected && Boolean(isRegistered),
    },
  })

  useEffect(() => {
    if (!isConnected) {
      clearUser()
      return
    }

    if (isRegistered && profileData) {
      // profileData is a tuple: [boomerName, ipfsImageHash, registrationTime, isOnline]
      const [boomerName, ipfsImageHash] = profileData as [string, string, bigint, boolean]
      
      setUser({
        address,
        isRegistered: true,
        username: boomerName,
        displayName: boomerName, // boomerName already includes .boomer suffix from contract
        bio: '', // Contract doesn't store bio
        profileImageHash: ipfsImageHash,
      })
    } else if (!isCheckingRegistration && isConnected) {
      // User not registered
      setUser({
        address,
        isRegistered: false,
        username: '',
        displayName: '',
        bio: '',
        profileImageHash: '',
      })
    }
  }, [isRegistered, profileData, isConnected, address, isCheckingRegistration, setUser, clearUser])

  return {
    user,
    isCheckingRegistration,
    isRegistered: user?.isRegistered ?? false,
  }
}