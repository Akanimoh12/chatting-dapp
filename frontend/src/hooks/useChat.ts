import { useState, useEffect, useCallback } from 'react'
import { useWatchContractEvent, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { BOOMER_CHAT_ABI, CONTRACT_ADDRESS } from '../config/contracts'
import { useChatStore } from '../stores/chatStore'
import { useUserStore } from '../stores/userStore'
import { CacheManager } from '../utils/cache'
import type { Message, ChatUser } from '../types/chat'
import toast from 'react-hot-toast'

export interface SendMessageParams {
  content: string
  recipient?: string // For direct messages
  isGroupMessage: boolean
}

export const useChat = () => {
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  
  const { user } = useUserStore()
  const { 
    messages, 
    users, 
    addMessage, 
    addUser, 
    setMessages, 
    setUsers,
    optimisticMessages,
    addOptimisticMessage,
    removeOptimisticMessage
  } = useChatStore()

  const {
    writeContract,
    data: hash,
    isPending: isContractPending,
  } = useWriteContract()

  const {
    isLoading: isTransactionLoading,
    isSuccess: isTransactionSuccess,
    error: transactionError,
  } = useWaitForTransactionReceipt({
    hash,
  })

  // Load users from contract function ONLY (no historical events)
  const { data: contractUsers, isLoading: isLoadingUsers, refetch: refetchUsers } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: BOOMER_CHAT_ABI,
    functionName: 'getAllRegisteredUsers',
    query: {
      enabled: !!user?.isRegistered,
      staleTime: 30000, // Cache for 30 seconds
    }
  })

  // Load recent messages from contract function ONLY (no historical events)
  const { data: contractMessages, isLoading: isLoadingContractMessages, refetch: refetchMessages } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: BOOMER_CHAT_ABI,
    functionName: 'getGroupMessages',
    args: [0n, 20n], // Only get last 20 group messages
    query: {
      enabled: !!user?.isRegistered,
      staleTime: 10000, // Cache for 10 seconds
    }
  })

  // NOTE: Direct messages contract function requires specific other user address
  // For now, rely on real-time events and cache for direct messages
  // TODO: Implement user-specific direct message loading when we know the conversation partner

  // Initialize data from cache first, then contract
  useEffect(() => {
    if (!user?.isRegistered) return

    console.log('🚀 Initializing chat data...')
    
    // Load from cache immediately for instant UI
    if (CacheManager.isCacheFresh()) {
      console.log('📥 Using fresh cached data')
      const cachedMessages = CacheManager.loadMessages()
      const cachedUsers = CacheManager.loadUsers()
      
      if (cachedMessages.length > 0) setMessages(cachedMessages)
      if (cachedUsers.length > 0) setUsers(cachedUsers)
    } else {
      console.log('🔄 Cache expired, will load from contract')
    }
  }, [user?.isRegistered, setMessages, setUsers])

  // Process contract users data
  useEffect(() => {
    if (contractUsers && Array.isArray(contractUsers) && contractUsers.length > 0) {
      const [addresses, boomerNames, imageHashes, onlineStatuses] = contractUsers as [string[], string[], string[], boolean[]]
      
      const chatUsers: ChatUser[] = addresses.map((address, index) => ({
        address: address as string,
        username: boomerNames[index] as string,
        displayName: boomerNames[index] as string,
        bio: '',
        profileImageHash: imageHashes[index] as string,
        isOnline: onlineStatuses[index] as boolean,
        lastSeen: Date.now(),
      }))

      setUsers(chatUsers)
      CacheManager.saveUsers(chatUsers)
      console.log('✅ Loaded users from contract:', chatUsers.length)
    }
  }, [contractUsers, setUsers])

  // Process contract messages data and cached messages
  useEffect(() => {
    console.log('🔄 Processing contract data:', {
      hasGroupMessages: !!contractMessages,
      groupMessagesLength: contractMessages ? contractMessages.length : 0,
      userAddress: user?.address?.substring(0, 8)
    })
    
    // Start with cached messages
    const cachedMessages = CacheManager.loadMessages()
    let allMessages: Message[] = cachedMessages || []
    
    console.log('📦 Loaded from cache:', allMessages.length, 'messages')
    
    if (contractMessages) {
      // Process group messages from contract
      if (Array.isArray(contractMessages) && contractMessages.length > 0) {
        const [senders, messages, timestamps, messageIds] = contractMessages as [string[], string[], bigint[], bigint[]]
        
        console.log('📥 Processing contract group messages:', senders.length)
        for (let i = 0; i < senders.length; i++) {
          const groupMessage = {
            id: `group-${messageIds[i]}`,
            sender: senders[i].toLowerCase() as string, // Normalize to lowercase
            content: messages[i] as string,
            timestamp: Number(timestamps[i]) * 1000,
            isGroupMessage: true,
            isOwn: senders[i]?.toLowerCase() === user?.address?.toLowerCase(),
          }
          
          // Only add if not already in allMessages
          if (!allMessages.find(m => m.id === groupMessage.id)) {
            allMessages.push(groupMessage)
          }
        }
      }
    }

    // Direct messages come from real-time events and cache only
    // Contract function requires specific conversation partner address
    
    if (allMessages.length > 0) {
      allMessages.sort((a, b) => a.timestamp - b.timestamp)
      setMessages(allMessages)
      CacheManager.saveMessages(allMessages)
      console.log('✅ Loaded messages (group from contract + direct from cache):', allMessages.length)
    } else if (cachedMessages && cachedMessages.length > 0) {
      console.log('✅ Using cached messages only:', cachedMessages.length)
      setMessages(cachedMessages)
    }
  }, [contractMessages, setMessages, user?.address])

  // REAL-TIME EVENT LISTENERS (no historical data, only new events from now)
  useWatchContractEvent({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: BOOMER_CHAT_ABI,
    eventName: 'GroupMessageSent',
    onLogs(logs) {
      console.log('📨 New GroupMessageSent events:', logs.length)
      logs.forEach((log: any) => {
        const { sender, message, timestamp, messageId } = log.args
        const messageId_str = messageId.toString()
        
        // Check if message already exists to prevent duplicates
        const existingMessage = messages.find(m => m.id === `group-${messageId_str}`)
        if (existingMessage) {
          console.log('⚠️ Duplicate group message detected, skipping:', messageId_str)
          return
        }
        
        const messageObj: Message = {
          id: `group-${messageId_str}`,
          sender: sender as string,
          content: message as string,
          timestamp: Number(timestamp) * 1000,
          isGroupMessage: true,
          isOwn: sender?.toLowerCase() === user?.address?.toLowerCase(),
        }
        
        console.log('✅ Adding new group message:', messageObj.content.substring(0, 30))
        addMessage(messageObj)
        
        // Remove corresponding optimistic message - be more specific with matching
        const optimisticIndex = optimisticMessages.findIndex(m => 
          m.content === message && 
          m.sender.toLowerCase() === sender.toLowerCase() && 
          m.isGroupMessage === true &&
          m.isPending === true
        )
        if (optimisticIndex !== -1) {
          console.log('🗑️ Removing optimistic group message:', optimisticMessages[optimisticIndex].id)
          removeOptimisticMessage(optimisticMessages[optimisticIndex].id)
        } else {
          console.log('⚠️ Could not find matching optimistic group message to remove')
        }
      })
    },
  })

  useWatchContractEvent({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: BOOMER_CHAT_ABI,
    eventName: 'DirectMessageSent',
    onLogs(logs) {
      console.log('💬 New DirectMessageSent events:', logs.length)
      logs.forEach((log: any) => {
        const { sender, recipient, message, timestamp, messageId } = log.args
        const messageId_str = messageId.toString()
        
        // Check if message already exists to prevent duplicates
        const existingMessage = messages.find(m => m.id === `direct-${messageId_str}`)
        if (existingMessage) {
          console.log('⚠️ Duplicate direct message detected, skipping:', messageId_str)
          return
        }
        
        const messageObj: Message = {
          id: `direct-${messageId_str}`,
          sender: sender.toLowerCase() as string, // Normalize to lowercase
          recipient: recipient.toLowerCase() as string, // Normalize to lowercase
          content: message as string,
          timestamp: Number(timestamp) * 1000,
          isGroupMessage: false, // CRITICAL: Ensure this is false for direct messages
          isOwn: sender?.toLowerCase() === user?.address?.toLowerCase(),
        }
        
        console.log('✅ Adding new direct message:', {
          id: messageId_str,
          from: sender.substring(0, 8),
          to: recipient.substring(0, 8),
          content: messageObj.content.substring(0, 30),
          isGroupMessage: messageObj.isGroupMessage,
          isOwn: messageObj.isOwn,
          timestamp: messageObj.timestamp
        })
        
        console.log('📝 Current user context:', {
          userAddress: user?.address?.substring(0, 8),
          senderMatch: sender?.toLowerCase() === user?.address?.toLowerCase(),
          recipientMatch: recipient?.toLowerCase() === user?.address?.toLowerCase()
        })
        
        addMessage(messageObj)
        
        // Show toast notification for incoming direct messages
        if (!messageObj.isOwn) {
          const { users: currentUsers } = useChatStore.getState()
          const senderUser = currentUsers.find(u => u.address.toLowerCase() === sender.toLowerCase())
          toast.success(`New message from ${senderUser?.displayName || 'Unknown User'}`, {
            icon: '💬',
            duration: 3000,
          })
        }
        
        // Remove corresponding optimistic message - be more specific with matching
        const optimisticIndex = optimisticMessages.findIndex(m => 
          m.content === message && 
          m.sender.toLowerCase() === sender.toLowerCase() && 
          m.recipient?.toLowerCase() === recipient.toLowerCase() &&
          m.isGroupMessage === false &&
          m.isPending === true
        )
        if (optimisticIndex !== -1) {
          console.log('🗑️ Removing optimistic direct message:', optimisticMessages[optimisticIndex].id)
          removeOptimisticMessage(optimisticMessages[optimisticIndex].id)
        } else {
          console.log('⚠️ Could not find matching optimistic direct message to remove', {
            searchingFor: {
              content: message.substring(0, 20),
              sender: sender.toLowerCase().substring(0, 8),
              recipient: recipient.toLowerCase().substring(0, 8)
            },
            availableOptimistic: optimisticMessages.map(m => ({
              id: m.id.substring(0, 15),
              content: m.content.substring(0, 20),
              sender: m.sender.substring(0, 8),
              recipient: m.recipient?.substring(0, 8),
              isPending: m.isPending
            }))
          })
        }
      })
    },
  })

  useWatchContractEvent({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: BOOMER_CHAT_ABI,
    eventName: 'BoomerUserRegistered',
    onLogs(logs) {
      console.log('👤 New BoomerUserRegistered events:', logs.length)
      logs.forEach((log: any) => {
        const { user: userAddress, boomerName, ipfsImageHash } = log.args
        const chatUser: ChatUser = {
          address: userAddress as string,
          username: boomerName as string,
          displayName: boomerName as string,
          bio: '',
          profileImageHash: ipfsImageHash as string,
          isOnline: true,
          lastSeen: Date.now(),
        }
        addUser(chatUser)
        
        toast.success(`${boomerName} joined BoomerChat! 🎉`, {
          icon: '👋',
          duration: 4000,
        })
      })
    },
  })

  // Manual refresh function (uses contract functions, no events)
  const refreshData = useCallback(async () => {
    console.log('🔄 Manually refreshing data...')
    setIsLoadingMessages(true)
    
    try {
      await Promise.all([
        refetchUsers(),
        refetchMessages()
      ])
      console.log('✅ Data refreshed successfully')
    } catch (error) {
      console.error('❌ Failed to refresh data:', error)
    } finally {
      setIsLoadingMessages(false)
    }
  }, [refetchUsers, refetchMessages])

  // Send message function with optimistic updates
  const sendMessage = useCallback(async ({ content, recipient, isGroupMessage }: SendMessageParams) => {
    if (!user?.isRegistered) {
      toast.error('You must be registered to send messages')
      return
    }

    if (!content.trim()) {
      toast.error('Message cannot be empty')
      return
    }

    console.log('📤 Sending message:', { 
      content: content.substring(0, 30), 
      recipient: recipient?.substring(0, 8), 
      isGroupMessage,
      messageType: isGroupMessage ? 'GROUP' : 'DIRECT'
    })

    // Create optimistic message with explicit typing and validation
    const optimisticId = `optimistic-${Date.now()}-${Math.random()}`
    const optimisticMessage: Message = {
      id: optimisticId,
      sender: (user.address || '').toLowerCase(),
      recipient: isGroupMessage ? undefined : (recipient?.toLowerCase() || undefined),
      content: content.trim(),
      timestamp: Date.now(),
      isGroupMessage: Boolean(isGroupMessage), // Ensure boolean
      isOwn: true,
      isPending: true,
    }

    // Validate message structure
    if (!isGroupMessage && !recipient) {
      toast.error('Direct message requires recipient address')
      return
    }

    console.log('🔮 Creating optimistic message:', {
      id: optimisticId,
      isGroupMessage: optimisticMessage.isGroupMessage,
      recipient: optimisticMessage.recipient?.substring(0, 8),
      content: optimisticMessage.content.substring(0, 30),
      messageType: isGroupMessage ? 'GROUP' : 'DIRECT'
    })

    // Add optimistic message immediately
    addOptimisticMessage(optimisticMessage)

    try {
      setIsSendingMessage(true)

      if (isGroupMessage) {
        console.log('📡 Calling sendGroupMessage contract function')
        writeContract({
          address: CONTRACT_ADDRESS,
          abi: BOOMER_CHAT_ABI,
          functionName: 'sendGroupMessage',
          args: [content.trim()],
        })
      } else if (recipient) {
        console.log('📡 Calling sendDirectMessage contract function to:', recipient.substring(0, 8))
        writeContract({
          address: CONTRACT_ADDRESS,
          abi: BOOMER_CHAT_ABI,
          functionName: 'sendDirectMessage',
          args: [recipient as `0x${string}`, content.trim()],
        })
      } else {
        throw new Error('Direct message requires recipient address')
      }

    } catch (error) {
      console.error('❌ Failed to send message:', error)
      removeOptimisticMessage(optimisticId)
      toast.error('Failed to send message')
      setIsSendingMessage(false)
    }
  }, [user, addOptimisticMessage, removeOptimisticMessage, writeContract])

  // Handle transaction success
  useEffect(() => {
    if (isTransactionSuccess) {
      setIsSendingMessage(false)
      toast.success('Message sent!')
    }
  }, [isTransactionSuccess])

  // Handle transaction error
  useEffect(() => {
    if (transactionError) {
      setIsSendingMessage(false)
      toast.error('Transaction failed')
      // Remove all pending optimistic messages
      optimisticMessages
        .filter(m => m.isPending)
        .forEach(m => removeOptimisticMessage(m.id))
    }
  }, [transactionError, optimisticMessages, removeOptimisticMessage])

  return {
    messages: [...messages, ...optimisticMessages].sort((a, b) => a.timestamp - b.timestamp),
    users,
    isLoadingMessages: isLoadingMessages || isLoadingUsers || isLoadingContractMessages,
    isSendingMessage: isSendingMessage || isContractPending || isTransactionLoading,
    sendMessage,
    refreshData, // For manual refresh if needed
  }
}