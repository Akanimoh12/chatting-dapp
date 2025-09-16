export interface BoomerProfile {
  boomerName: string;
  ipfsImageHash: string;
  registrationTime: number;
  isOnline: boolean;
}

export interface Message {
  id: string;
  sender: `0x${string}`;
  content: string;
  timestamp: number;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  recipient?: `0x${string}`; // Optional for direct messages
}

export interface DirectMessage extends Message {
  recipient: `0x${string}`;
}

export interface User {
  address: `0x${string}`;
  boomerName: string;
  profileImage: string;
  isOnline: boolean;
  registrationTime: number;
}

export interface ChatState {
  activeChat: 'group' | `0x${string}`;
  groupMessages: Message[];
  directMessages: Map<string, Message[]>;
  typingUsers: Set<string>;
  onlineUsers: Set<string>;
  isLoading: boolean;
  lastMessageTimestamp: number;
}

export interface UserState {
  currentUser: User | null;
  allUsers: User[];
  isRegistered: boolean;
  registrationStatus: 'idle' | 'checking' | 'registering' | 'complete' | 'failed';
}

export interface WalletState {
  isConnected: boolean;
  address: `0x${string}` | null;
  chainId: number | null;
  balance: string;
  isConnecting: boolean;
  error: string | null;
}

// Contract event types
export interface BoomerUserRegisteredEvent {
  user: `0x${string}`;
  boomerName: string;
  ipfsImageHash: string;
  timestamp: bigint;
}

export interface GroupMessageSentEvent {
  sender: `0x${string}`;
  message: string;
  timestamp: bigint;
  messageId: bigint;
}

export interface DirectMessageSentEvent {
  sender: `0x${string}`;
  recipient: `0x${string}`;
  message: string;
  timestamp: bigint;
  messageId: bigint;
}

export interface UserOnlineStatusChangedEvent {
  user: `0x${string}`;
  isOnline: boolean;
  timestamp: bigint;
}

export interface ProfileImageUpdatedEvent {
  user: `0x${string}`;
  oldImageHash: string;
  newImageHash: string;
  timestamp: bigint;
}