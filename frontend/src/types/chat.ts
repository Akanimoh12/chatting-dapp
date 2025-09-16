export interface Message {
  id: string
  sender: string
  recipient?: string // For direct messages
  content: string
  timestamp: number
  isGroupMessage: boolean
  isOwn?: boolean
  isPending?: boolean // For optimistic updates
}

export interface ChatUser {
  address: string
  username: string
  displayName: string
  bio: string
  profileImageHash: string
  isOnline: boolean
  lastSeen: number
}