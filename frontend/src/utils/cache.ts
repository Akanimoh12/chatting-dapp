import type { Message, ChatUser } from '../types/chat'

const CACHE_KEYS = {
  MESSAGES: 'boomer-chat-messages',
  USERS: 'boomer-chat-users',
  LAST_UPDATE: 'boomer-chat-last-update',
} as const

export const CacheManager = {
  // Save data to localStorage
  saveMessages: (messages: Message[]) => {
    try {
      localStorage.setItem(CACHE_KEYS.MESSAGES, JSON.stringify(messages))
      localStorage.setItem(CACHE_KEYS.LAST_UPDATE, Date.now().toString())
      console.log('💾 Cached messages:', messages.length)
    } catch (error) {
      console.warn('Failed to cache messages:', error)
    }
  },

  saveUsers: (users: ChatUser[]) => {
    try {
      localStorage.setItem(CACHE_KEYS.USERS, JSON.stringify(users))
      console.log('💾 Cached users:', users.length)
    } catch (error) {
      console.warn('Failed to cache users:', error)
    }
  },

  // Load data from localStorage
  loadMessages: (): Message[] => {
    try {
      const cached = localStorage.getItem(CACHE_KEYS.MESSAGES)
      const messages = cached ? JSON.parse(cached) : []
      console.log('📥 Loaded cached messages:', messages.length)
      return messages
    } catch (error) {
      console.warn('Failed to load cached messages:', error)
      return []
    }
  },

  loadUsers: (): ChatUser[] => {
    try {
      const cached = localStorage.getItem(CACHE_KEYS.USERS)
      const users = cached ? JSON.parse(cached) : []
      console.log('📥 Loaded cached users:', users.length)
      return users
    } catch (error) {
      console.warn('Failed to load cached users:', error)
      return []
    }
  },

  // Check if cache is fresh (less than 5 minutes old)
  isCacheFresh: (): boolean => {
    try {
      const lastUpdate = localStorage.getItem(CACHE_KEYS.LAST_UPDATE)
      if (!lastUpdate) return false
      
      const age = Date.now() - parseInt(lastUpdate)
      const isFresh = age < 5 * 60 * 1000 // 5 minutes
      console.log('🕐 Cache age:', Math.round(age / 1000), 'seconds, fresh:', isFresh)
      return isFresh
    } catch (error) {
      return false
    }
  },

  // Clear all cache
  clearAll: () => {
    Object.values(CACHE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
    console.log('🗑️ Cleared all cache')
  }
}