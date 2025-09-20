// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  // Ethereum Sepolia testnet - Active deployment with price oracle
  11155111: '0x6C74B43b04C17322c5DfCE754b1d321EF7DF1a2c', // BoomerChatRegistry on Sepolia
  
  // Lisk Sepolia testnet
  4202: '0x6C74B43b04C17322c5DfCE754b1d321EF7DF1a2c', // Deployed BoomerChatRegistry on Lisk Sepolia
  
  // Mainnet (when ready)
  1: '0x0000000000000000000000000000000000000000',
} as const

// Price Oracle addresses on Sepolia
export const PRICE_ORACLE_ADDRESSES = {
  11155111: {
    chainlinkPriceOracle: '0x4B001ec1F48dAE2883Fa2Dba87bE7ADc66F1B3f7',
    priceChatIntegration: '0xBeC8dD4CA8b227c04BCD23EB4Bcf3bCE4E5BF795'
  }
} as const

// Get contract address for current network
export const getContractAddress = (chainId: number): string => {
  return CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] || CONTRACT_ADDRESSES[11155111]
}

// Get price oracle addresses for current network
export const getPriceOracleAddresses = (chainId: number) => {
  return PRICE_ORACLE_ADDRESSES[chainId as keyof typeof PRICE_ORACLE_ADDRESSES]
}

// Default to Ethereum Sepolia for development
export const CONTRACT_ADDRESS = '0x6C74B43b04C17322c5DfCE754b1d321EF7DF1a2c'

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
] as const

// Chainlink Price Oracle ABI
export const PRICE_ORACLE_ABI = [
  {
    "type": "function",
    "name": "getLatestPrice",
    "inputs": [{"name": "pairName", "type": "string"}],
    "outputs": [
      {"name": "price", "type": "int256"},
      {"name": "timestamp", "type": "uint256"},
      {"name": "decimals", "type": "uint8"}
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getAllPrices",
    "inputs": [],
    "outputs": [
      {"name": "btcUsd", "type": "int256"},
      {"name": "ethUsd", "type": "int256"},
      {"name": "btcEth", "type": "int256"},
      {"name": "bnbEth", "type": "int256"},
      {"name": "lastUpdate", "type": "uint256"}
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getPriceChangePercentage",
    "inputs": [{"name": "pairName", "type": "string"}],
    "outputs": [{"name": "percentageChange", "type": "int256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getFormattedPrice",
    "inputs": [{"name": "pairName", "type": "string"}],
    "outputs": [{"name": "formattedPrice", "type": "string"}],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "PriceUpdated",
    "inputs": [
      {"name": "pairName", "type": "string", "indexed": true},
      {"name": "oldPrice", "type": "int256", "indexed": false},
      {"name": "newPrice", "type": "int256", "indexed": false},
      {"name": "percentageChange", "type": "int256", "indexed": false},
      {"name": "timestamp", "type": "uint256", "indexed": false}
    ],
    "anonymous": false
  }
] as const

// Price Chat Integration ABI
export const PRICE_INTEGRATION_ABI = [
  {
    "type": "function",
    "name": "getIntegrationStatus",
    "inputs": [],
    "outputs": [
      {"name": "alerts", "type": "bool"},
      {"name": "summaries", "type": "bool"},
      {"name": "botRegistered", "type": "bool"},
      {"name": "minInterval", "type": "uint256"},
      {"name": "lastSummary", "type": "uint256"}
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "checkAndPostPriceAlerts",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "postHourlySummary",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "PriceAlertPosted",
    "inputs": [
      {"name": "pairName", "type": "string", "indexed": true},
      {"name": "priceChange", "type": "int256", "indexed": false},
      {"name": "newPrice", "type": "int256", "indexed": false},
      {"name": "messageId", "type": "uint256", "indexed": false}
    ],
    "anonymous": false
  }
] as const

// Registration fee (0.001 ETH)
export const REGISTRATION_FEE = '0.001'