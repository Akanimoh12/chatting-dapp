// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  // Sepolia testnet - Your deployed BoomerChatRegistry contract
  11155111: '0x6f457540f0F38e564b680b9b7c90393C46b4A8cb', // Deployed BoomerChatRegistry on Sepolia
  // Mainnet (when ready)
  1: '0x0000000000000000000000000000000000000000',
} as const

// Get contract address for current network
export const getContractAddress = (chainId: number): string => {
  return CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] || CONTRACT_ADDRESSES[11155111]
}

// Default to Sepolia for development
export const CONTRACT_ADDRESS = '0x6767Dd3830A88DED122c5dA4d05D052227097886'

// Contract ABI (Application Binary Interface) - JSON format for better wagmi compatibility
export const BOOMER_CHAT_ABI = [
  {
    "type": "function",
    "name": "registerBoomerUser",
    "inputs": [
      {"name": "boomerName", "type": "string", "internalType": "string"},
      {"name": "ipfsImageHash", "type": "string", "internalType": "string"}
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "isRegisteredBoomerUser",
    "inputs": [{"name": "user", "type": "address", "internalType": "address"}],
    "outputs": [{"name": "", "type": "bool", "internalType": "bool"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getBoomerProfile",
    "inputs": [{"name": "user", "type": "address", "internalType": "address"}],
    "outputs": [
      {"name": "boomerName", "type": "string", "internalType": "string"},
      {"name": "ipfsImageHash", "type": "string", "internalType": "string"},
      {"name": "registrationTime", "type": "uint256", "internalType": "uint256"},
      {"name": "isOnline", "type": "bool", "internalType": "bool"}
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getBoomerUserByName",
    "inputs": [{"name": "boomerName", "type": "string", "internalType": "string"}],
    "outputs": [{"name": "", "type": "address", "internalType": "address"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isBoomerNameAvailable",
    "inputs": [{"name": "boomerName", "type": "string", "internalType": "string"}],
    "outputs": [{"name": "", "type": "bool", "internalType": "bool"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "sendGroupMessage",
    "inputs": [{"name": "message", "type": "string", "internalType": "string"}],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "sendDirectMessage",
    "inputs": [
      {"name": "recipient", "type": "address", "internalType": "address"},
      {"name": "message", "type": "string", "internalType": "string"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getGroupMessages",
    "inputs": [
      {"name": "offset", "type": "uint256", "internalType": "uint256"},
      {"name": "limit", "type": "uint256", "internalType": "uint256"}
    ],
    "outputs": [
      {"name": "senders", "type": "address[]", "internalType": "address[]"},
      {"name": "messages", "type": "string[]", "internalType": "string[]"},
      {"name": "timestamps", "type": "uint256[]", "internalType": "uint256[]"},
      {"name": "messageIds", "type": "uint256[]", "internalType": "uint256[]"}
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getDirectMessages",
    "inputs": [
      {"name": "otherUser", "type": "address", "internalType": "address"},
      {"name": "offset", "type": "uint256", "internalType": "uint256"},
      {"name": "limit", "type": "uint256", "internalType": "uint256"}
    ],
    "outputs": [
      {"name": "senders", "type": "address[]", "internalType": "address[]"},
      {"name": "messages", "type": "string[]", "internalType": "string[]"},
      {"name": "timestamps", "type": "uint256[]", "internalType": "uint256[]"},
      {"name": "messageIds", "type": "uint256[]", "internalType": "uint256[]"}
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "updateProfileImage",
    "inputs": [{"name": "newIpfsImageHash", "type": "string", "internalType": "string"}],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "updateOnlineStatus",
    "inputs": [{"name": "isOnline", "type": "bool", "internalType": "bool"}],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "registrationFee",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getUserCount",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getGroupMessageCount",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getDirectMessageCount",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getAllRegisteredUsers",
    "inputs": [],
    "outputs": [
      {"name": "users", "type": "address[]", "internalType": "address[]"},
      {"name": "boomerNames", "type": "string[]", "internalType": "string[]"},
      {"name": "imageHashes", "type": "string[]", "internalType": "string[]"},
      {"name": "onlineStatuses", "type": "bool[]", "internalType": "bool[]"}
    ],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "BoomerUserRegistered",
    "inputs": [
      {"name": "user", "type": "address", "indexed": true, "internalType": "address"},
      {"name": "boomerName", "type": "string", "indexed": false, "internalType": "string"},
      {"name": "ipfsImageHash", "type": "string", "indexed": false, "internalType": "string"},
      {"name": "timestamp", "type": "uint256", "indexed": false, "internalType": "uint256"}
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "GroupMessageSent",
    "inputs": [
      {"name": "sender", "type": "address", "indexed": true, "internalType": "address"},
      {"name": "message", "type": "string", "indexed": false, "internalType": "string"},
      {"name": "timestamp", "type": "uint256", "indexed": false, "internalType": "uint256"},
      {"name": "messageId", "type": "uint256", "indexed": false, "internalType": "uint256"}
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "DirectMessageSent",
    "inputs": [
      {"name": "sender", "type": "address", "indexed": true, "internalType": "address"},
      {"name": "recipient", "type": "address", "indexed": true, "internalType": "address"},
      {"name": "message", "type": "string", "indexed": false, "internalType": "string"},
      {"name": "timestamp", "type": "uint256", "indexed": false, "internalType": "uint256"},
      {"name": "messageId", "type": "uint256", "indexed": false, "internalType": "uint256"}
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ProfileImageUpdated",
    "inputs": [
      {"name": "user", "type": "address", "indexed": true, "internalType": "address"},
      {"name": "oldImageHash", "type": "string", "indexed": false, "internalType": "string"},
      {"name": "newImageHash", "type": "string", "indexed": false, "internalType": "string"},
      {"name": "timestamp", "type": "uint256", "indexed": false, "internalType": "uint256"}
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "UserOnlineStatusChanged",
    "inputs": [
      {"name": "user", "type": "address", "indexed": true, "internalType": "address"},
      {"name": "isOnline", "type": "bool", "indexed": false, "internalType": "bool"},
      {"name": "timestamp", "type": "uint256", "indexed": false, "internalType": "uint256"}
    ],
    "anonymous": false
  }
] as const// Registration fee (0.001 ETH)
export const REGISTRATION_FEE = '0.001'