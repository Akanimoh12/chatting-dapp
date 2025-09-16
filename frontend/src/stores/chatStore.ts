import { create } from 'zustand'
import type { Message, ChatUser } from '../types/chat'

interface ChatStore {
  messages: Message[]
  users: ChatUser[]
  activeChat: string | null // null for group chat, address for DM
  optimisticMessages: Message[] // For immediate UI updates
  addMessage: (message: Message) => void
  addUser: (user: ChatUser) => void
  setActiveChat: (chat: string | null) => void
  setMessages: (messages: Message[]) => void
  setUsers: (users: ChatUser[]) => void
  addOptimisticMessage: (message: Message) => void
  removeOptimisticMessage: (messageId: string) => void
  clearOptimisticMessages: () => void
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  users: [],
  activeChat: null, // Start with group chat
  optimisticMessages: [],

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  addUser: (user) =>
    set((state) => ({
      users: state.users.some(u => u.address === user.address) 
        ? state.users.map(u => u.address === user.address ? user : u)
        : [...state.users, user],
    })),

  setActiveChat: (chat) =>
    set(() => ({
      activeChat: chat,
    })),

  setMessages: (messages) =>
    set(() => ({
      messages,
    })),

  setUsers: (users) =>
    set(() => ({
      users,
    })),

  addOptimisticMessage: (message) =>
    set((state) => ({
      optimisticMessages: [...state.optimisticMessages, message],
    })),

  removeOptimisticMessage: (messageId) =>
    set((state) => ({
      optimisticMessages: state.optimisticMessages.filter(m => m.id !== messageId),
    })),

  clearOptimisticMessages: () =>
    set(() => ({
      optimisticMessages: [],
    })),
}))