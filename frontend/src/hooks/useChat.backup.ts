import { useState, useEffect, useCallback } from 'react'
import { usePublicClient, useWatchContractEvent, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseAbiItem } from 'viem'
import { BOOMER_CHAT_ABI, CONTRACT_ADDRESS } from '../config/contracts'
import { useChatStore } from '../stores/chatStore'
import { useUserStore } from '../stores/userStore'
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
  
  const publicClient = usePublicClient()
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

  // Watch for new group messages
  useWatchContractEvent({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: BOOMER_CHAT_ABI,
    eventName: 'GroupMessageSent',
    onLogs(logs) {
      logs.forEach((log: any) => {
        const { sender, message, timestamp, messageId } = log.args
        const messageObj: Message = {
          id: `group-${messageId}`,
          sender: sender as string,
          content: message as string,
          timestamp: Number(timestamp) * 1000, // Convert to milliseconds
          isGroupMessage: true,
          isOwn: sender?.toLowerCase() === user?.address?.toLowerCase(),
        }
        addMessage(messageObj)
        
        // Remove optimistic message if it exists
        const optimistic = optimisticMessages.find(m => 
          m.content === message && m.sender === sender
        )
        if (optimistic) {
          removeOptimisticMessage(optimistic.id)
        }
      })
    },
  })

  // Watch for new direct messages
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: BOOMER_CHAT_ABI,
    eventName: 'DirectMessageSent',
    onLogs(logs) {
      console.log('New DirectMessageSent events received:', logs)
      logs.forEach((log: any) => {
        const { sender, recipient, message, timestamp, messageId } = log.args
        console.log('Processing direct message:', { sender, recipient, message, messageId })
        
        const messageObj: Message = {
          id: `direct-${messageId}`,
          sender: sender as string,
          recipient: recipient as string,
          content: message as string,
          timestamp: Number(timestamp) * 1000, // Convert to milliseconds
          isGroupMessage: false,
          isOwn: sender?.toLowerCase() === user?.address?.toLowerCase(),
        }
        addMessage(messageObj)
        
        // Show toast notification for direct messages
        if (!messageObj.isOwn) {
          // Get user from current users state
          const { users: currentUsers } = useChatStore.getState()
          const senderUser = currentUsers.find(u => u.address.toLowerCase() === sender.toLowerCase())
          toast.success(`New message from ${senderUser?.displayName || 'Unknown User'}`, {
            icon: '💬',
            duration: 3000,
          })
        }
        
        // Remove optimistic message if it exists
        const optimistic = optimisticMessages.find(m => 
          m.content === message && m.sender === sender && m.recipient === recipient
        )
        if (optimistic) {
          removeOptimisticMessage(optimistic.id)
        }
      })
    },
  })

  // Watch for new user registrations
  useWatchContractEvent({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: BOOMER_CHAT_ABI,
    eventName: 'BoomerUserRegistered',
    onLogs(logs) {
      logs.forEach((log: any) => {
        const { user: userAddress, boomerName, ipfsImageHash } = log.args
        const chatUser: ChatUser = {
          address: userAddress as string,
          username: boomerName as string,
          displayName: boomerName as string, // boomerName already includes .boomer suffix from contract
          bio: '', // Contract doesn't store bio
          profileImageHash: ipfsImageHash as string,
          isOnline: true,
          lastSeen: Date.now(),
        }
        addUser(chatUser)
        
        // Show welcome message for new users
        toast.success(`${boomerName} joined BoomerChat! 🎉`, {
          icon: '👋',
          duration: 4000,
        })
      })
    },
  })

  // Load historical messages
  const loadMessages = useCallback(async () => {
    if (!publicClient) return
    
    setIsLoadingMessages(true)
    
    try {
      console.log('Loading messages from contract...')
      
      // Try to get messages using contract functions first (more reliable and efficient)
      const contract = {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: BOOMER_CHAT_ABI,
      }

      try {
        console.log('Fetching messages from contract functions...')
        
        // Get group messages from contract
        const groupResult = await publicClient.readContract({
          ...contract,
          functionName: 'getGroupMessages',
          args: [0n, 50n], // Get first 50 messages (reduced for performance)
        })

        // Get direct messages from contract
        const directResult = await publicClient.readContract({
          ...contract,
          functionName: 'getDirectMessages',
          args: [0n, 50n], // Get first 50 direct messages (reduced for performance)
        })

        const allMessages: Message[] = []

        // Process group messages
        if (groupResult) {
          const [senders, messages, timestamps, messageIds] = groupResult as [string[], string[], bigint[], bigint[]]
          
          for (let i = 0; i < senders.length; i++) {
            allMessages.push({
              id: `group-${messageIds[i]}`,
              sender: senders[i] as string,
              content: messages[i] as string,
              timestamp: Number(timestamps[i]) * 1000, // Convert to milliseconds
              isGroupMessage: true,
              isOwn: senders[i]?.toLowerCase() === user?.address?.toLowerCase(),
            })
          }
        }

        // Process direct messages
        if (directResult) {
          const [senders, recipients, messages, timestamps, messageIds] = directResult as [string[], string[], string[], bigint[], bigint[]]
          
          for (let i = 0; i < senders.length; i++) {
            allMessages.push({
              id: `direct-${messageIds[i]}`,
              sender: senders[i] as string,
              recipient: recipients[i] as string,
              content: messages[i] as string,
              timestamp: Number(timestamps[i]) * 1000, // Convert to milliseconds
              isGroupMessage: false,
              isOwn: senders[i]?.toLowerCase() === user?.address?.toLowerCase(),
            })
          }
        }

        // Sort by timestamp
        allMessages.sort((a, b) => a.timestamp - b.timestamp)
        setMessages(allMessages)
        console.log('Loaded messages from contract functions:', allMessages)
        console.log('Direct messages found:', allMessages.filter(m => !m.isGroupMessage))
        return // Exit early since we got data from contract functions
        
      } catch (contractError) {
        console.log('Contract function failed, falling back to recent events only:', contractError)
      }

      // Fallback: Get messages from RECENT events only (not 'earliest')
      const currentBlock = await publicClient.getBlockNumber()
      const fromBlock = currentBlock - 10000n // Only fetch last ~10k blocks (about 24-48 hours)
      
      console.log('Fetching events from block:', fromBlock, 'to latest')

      const groupLogs = await publicClient.getLogs({
        address: CONTRACT_ADDRESS,
        event: parseAbiItem('event GroupMessageSent(address indexed sender, string message, uint256 timestamp, uint256 messageId)'),
        fromBlock,
        toBlock: 'latest',
      })

      // Get direct messages
      const directLogs = await publicClient.getLogs({
        address: CONTRACT_ADDRESS,
        event: parseAbiItem('event DirectMessageSent(address indexed sender, address indexed recipient, string message, uint256 timestamp, uint256 messageId)'),
        fromBlock,
        toBlock: 'latest',
      })

      const allMessages: Message[] = []

      // Process group messages
      groupLogs.forEach((log: any) => {
        const { sender, message, timestamp, messageId } = log.args
        allMessages.push({
          id: `group-${messageId}`,
          sender: sender as string,
          content: message as string,
          timestamp: Number(timestamp) * 1000, // Convert to milliseconds
          isGroupMessage: true,
          isOwn: sender?.toLowerCase() === user?.address?.toLowerCase(),
        })
      })

      // Process direct messages
      directLogs.forEach((log: any) => {
        const { sender, recipient, message, timestamp, messageId } = log.args
        console.log('Processing direct message from events:', { sender, recipient, message, messageId })
        allMessages.push({
          id: `direct-${messageId}`,
          sender: sender as string,
          recipient: recipient as string,
          content: message as string,
          timestamp: Number(timestamp) * 1000, // Convert to milliseconds
          isGroupMessage: false,
          isOwn: sender?.toLowerCase() === user?.address?.toLowerCase(),
        })
      })

      // Sort by timestamp
      allMessages.sort((a, b) => a.timestamp - b.timestamp)
      setMessages(allMessages)
      console.log('Loaded messages from recent events:', allMessages)

    } catch (error) {
      console.error('Failed to load messages:', error)
      // Don't show error toast since this is not critical
    } finally {
      setIsLoadingMessages(false)
    }
  }, [publicClient, user?.address, setMessages])

  // Load users
  const loadUsers = useCallback(async () => {
    if (!publicClient) {
      console.log('No publicClient available for loading users')
      return
    }
    
    console.log('Starting to load users from contract...')
    
    try {
      // First, try to get users from the contract's getAllRegisteredUsers function
      const contract = {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: BOOMER_CHAT_ABI,
      }

      console.log('Calling getAllRegisteredUsers with contract:', CONTRACT_ADDRESS)
      const result = await publicClient.readContract({
        ...contract,
        functionName: 'getAllRegisteredUsers',
      })

      console.log('getAllRegisteredUsers result:', result)

      if (result) {
        const [addresses, boomerNames, imageHashes, onlineStatuses] = result as [string[], string[], string[], boolean[]]
        
        const chatUsers: ChatUser[] = addresses.map((address, index) => ({
          address: address as string,
          username: boomerNames[index] as string,
          displayName: boomerNames[index] as string, // boomerNames already includes .boomer suffix from contract
          bio: '', // Contract doesn't store bio
          profileImageHash: imageHashes[index] as string,
          isOnline: onlineStatuses[index] as boolean,
          lastSeen: Date.now(),
        }))

        setUsers(chatUsers)
        console.log('Loaded users from contract:', chatUsers)
        return
      }

      // Fallback: Get user registrations from RECENT events only
      const currentBlock = await publicClient.getBlockNumber()
      const fromBlock = currentBlock - 50000n // Only fetch last ~50k blocks for user registrations
      
      console.log('Fallback: Fetching user registration events from block:', fromBlock)

      const userLogs = await publicClient.getLogs({
        address: CONTRACT_ADDRESS,
        event: parseAbiItem('event BoomerUserRegistered(address indexed user, string boomerName, string ipfsImageHash, uint256 timestamp)'),
        fromBlock,
        toBlock: 'latest',
      })

      console.log('User registration events found:', userLogs.length)

      const chatUsers: ChatUser[] = userLogs.map((log) => {
        const { user: userAddress, boomerName, ipfsImageHash } = log.args
        return {
          address: userAddress as string,
          username: boomerName as string,
          displayName: boomerName as string, // boomerName already includes .boomer suffix from contract
          bio: '', // Contract doesn't store bio
          profileImageHash: ipfsImageHash as string,
          isOnline: true, // We'll implement real online status later
          lastSeen: Date.now(),
        }
      })

      setUsers(chatUsers)
      console.log('Loaded users from events:', chatUsers)
    } catch (error) {
      console.error('Failed to load users:', error)
    }
  }, [publicClient, setUsers])

  // Send message function
  const sendMessage = async ({ content, recipient, isGroupMessage }: SendMessageParams) => {
    if (!user?.isRegistered) {
      toast.error('You must be registered to send messages')
      return
    }

    if (!content.trim()) {
      toast.error('Message cannot be empty')
      return
    }

    console.log('Sending message:', { content, recipient, isGroupMessage })

    // Create optimistic message
    const optimisticId = `optimistic-${Date.now()}-${Math.random()}`
    const optimisticMessage: Message = {
      id: optimisticId,
      sender: user.address || '',
      recipient,
      content: content.trim(),
      timestamp: Date.now(),
      isGroupMessage,
      isOwn: true,
      isPending: true,
    }

    // Add optimistic message immediately
    addOptimisticMessage(optimisticMessage)
    console.log('Added optimistic message:', optimisticMessage)

    try {
      setIsSendingMessage(true)

      if (isGroupMessage) {
        console.log('Sending group message...')
        writeContract({
          address: CONTRACT_ADDRESS,
          abi: BOOMER_CHAT_ABI,
          functionName: 'sendGroupMessage',
          args: [content.trim()],
        })
      } else if (recipient) {
        console.log('Sending direct message to:', recipient)
        writeContract({
          address: CONTRACT_ADDRESS,
          abi: BOOMER_CHAT_ABI,
          functionName: 'sendDirectMessage',
          args: [recipient as `0x${string}`, content.trim()],
        })
      }

    } catch (error) {
      console.error('Failed to send message:', error)
      removeOptimisticMessage(optimisticId)
      toast.error('Failed to send message')
      setIsSendingMessage(false)
    }
  }

  // Handle transaction success
  useEffect(() => {
    if (isTransactionSuccess) {
      setIsSendingMessage(false)
      // Optimistic message will be replaced by the real one from the event
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

  // Load initial data
  useEffect(() => {
    if (publicClient && user?.isRegistered) {
      loadMessages()
      loadUsers()
    }
  }, [publicClient, user?.isRegistered, loadMessages, loadUsers])

  return {
    messages: [...messages, ...optimisticMessages].sort((a, b) => a.timestamp - b.timestamp),
    users,
    isLoadingMessages,
    isSendingMessage: isSendingMessage || isContractPending || isTransactionLoading,
    sendMessage,
    loadMessages,
    loadUsers,
  }
}