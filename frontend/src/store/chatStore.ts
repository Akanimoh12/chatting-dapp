import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { ChatState, Message } from '../types'
import { generateTempId } from '../utils'

interface ChatStore extends ChatState {
  // Actions
  setActiveChat: (chatId: 'group' | `0x${string}`) => void
  addMessage: (message: Message) => void
  addOptimisticMessage: (content: string, recipient?: `0x${string}`) => string
  updateMessageStatus: (messageId: string, status: Message['status']) => void
  removeMessage: (messageId: string) => void
  setGroupMessages: (messages: Message[]) => void
  setDirectMessages: (recipient: string, messages: Message[]) => void
  addTypingUser: (user: string) => void
  removeTypingUser: (user: string) => void
  setOnlineUsers: (users: Set<string>) => void
  addOnlineUser: (user: string) => void
  removeOnlineUser: (user: string) => void
  setLoading: (isLoading: boolean) => void
  updateLastMessageTimestamp: (timestamp: number) => void
  reset: () => void
}

const initialState: ChatState = {
  activeChat: 'group',
  groupMessages: [],
  directMessages: new Map(),
  typingUsers: new Set(),
  onlineUsers: new Set(),
  isLoading: false,
  lastMessageTimestamp: 0,
}

export const useChatStore = create<ChatStore>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      setActiveChat: (chatId) => 
        set({ activeChat: chatId }, false, 'setActiveChat'),
      
      addMessage: (message) => {
        const state = get()
        
        if (message.recipient) {
          // Direct message
          const chatKey = message.recipient === state.activeChat 
            ? message.sender 
            : message.recipient
          const currentDMs = state.directMessages.get(chatKey) || []
          const newDirectMessages = new Map(state.directMessages)
          newDirectMessages.set(chatKey, [...currentDMs, message])
          
          set({ 
            directMessages: newDirectMessages,
            lastMessageTimestamp: message.timestamp 
          }, false, 'addDirectMessage')
        } else {
          // Group message
          set(
            (state) => ({
              groupMessages: [...state.groupMessages, message],
              lastMessageTimestamp: message.timestamp
            }),
            false,
            'addGroupMessage'
          )
        }
      },
      
      addOptimisticMessage: (content, recipient) => {
        const tempId = generateTempId()
        const message: Message = {
          id: tempId,
          sender: '0x' as `0x${string}`, // Will be set by the component
          content,
          timestamp: Math.floor(Date.now() / 1000),
          status: 'pending',
          ...(recipient && { recipient })
        }
        
        get().addMessage(message)
        return tempId
      },
      
      updateMessageStatus: (messageId, status) => 
        set(
          (state) => {
            // Update in group messages
            const updatedGroupMessages = state.groupMessages.map(msg =>
              msg.id === messageId ? { ...msg, status } : msg
            )
            
            // Update in direct messages
            const updatedDirectMessages = new Map()
            state.directMessages.forEach((messages, key) => {
              const updatedMessages = messages.map(msg =>
                msg.id === messageId ? { ...msg, status } : msg
              )
              updatedDirectMessages.set(key, updatedMessages)
            })
            
            return {
              groupMessages: updatedGroupMessages,
              directMessages: updatedDirectMessages
            }
          },
          false,
          'updateMessageStatus'
        ),
      
      removeMessage: (messageId) => 
        set(
          (state) => {
            // Remove from group messages
            const updatedGroupMessages = state.groupMessages.filter(msg => msg.id !== messageId)
            
            // Remove from direct messages
            const updatedDirectMessages = new Map()
            state.directMessages.forEach((messages, key) => {
              const updatedMessages = messages.filter(msg => msg.id !== messageId)
              updatedDirectMessages.set(key, updatedMessages)
            })
            
            return {
              groupMessages: updatedGroupMessages,
              directMessages: updatedDirectMessages
            }
          },
          false,
          'removeMessage'
        ),
      
      setGroupMessages: (messages) => 
        set({ groupMessages: messages }, false, 'setGroupMessages'),
      
      setDirectMessages: (recipient, messages) => 
        set(
          (state) => {
            const newDirectMessages = new Map(state.directMessages)
            newDirectMessages.set(recipient, messages)
            return { directMessages: newDirectMessages }
          },
          false,
          'setDirectMessages'
        ),
      
      addTypingUser: (user) => 
        set(
          (state) => ({
            typingUsers: new Set([...state.typingUsers, user])
          }),
          false,
          'addTypingUser'
        ),
      
      removeTypingUser: (user) => 
        set(
          (state) => {
            const newTypingUsers = new Set(state.typingUsers)
            newTypingUsers.delete(user)
            return { typingUsers: newTypingUsers }
          },
          false,
          'removeTypingUser'
        ),
      
      setOnlineUsers: (users) => 
        set({ onlineUsers: users }, false, 'setOnlineUsers'),
      
      addOnlineUser: (user) => 
        set(
          (state) => ({
            onlineUsers: new Set([...state.onlineUsers, user])
          }),
          false,
          'addOnlineUser'
        ),
      
      removeOnlineUser: (user) => 
        set(
          (state) => {
            const newOnlineUsers = new Set(state.onlineUsers)
            newOnlineUsers.delete(user)
            return { onlineUsers: newOnlineUsers }
          },
          false,
          'removeOnlineUser'
        ),
      
      setLoading: (isLoading) => 
        set({ isLoading }, false, 'setLoading'),
      
      updateLastMessageTimestamp: (timestamp) => 
        set({ lastMessageTimestamp: timestamp }, false, 'updateLastMessageTimestamp'),
      
      reset: () => 
        set(initialState, false, 'reset'),
    }),
    {
      name: 'chat-store',
    }
  )
)