import React, { useState } from 'react'
import { motion } from 'framer-motion'
import type { ChatUser } from '../../types/chat'
import { getIPFSService } from '../../utils/ipfs'

interface ChatHeaderProps {
  isGroupChat: boolean
  chatUser?: ChatUser | null
  messageCount: number
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  isGroupChat,
  chatUser,
  messageCount,
}) => {
  const ipfsService = getIPFSService()
  const [showBio, setShowBio] = useState(false)

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-black/40 backdrop-blur-lg border-b-2 border-neon-cyan/30 p-4 crt-effect relative overflow-hidden"
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <motion.div
          className="w-full h-full"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(0, 255, 65, 0.1) 10px,
              rgba(0, 255, 65, 0.1) 20px
            )`
          }}
          animate={{ x: [0, 40] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="flex items-center gap-4 relative z-10">
        {/* Enhanced Avatar */}
        <div className="relative">
          {isGroupChat ? (
            <motion.div
              className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center border-2 border-accent animate-pulse-glow"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
            </motion.div>
          ) : chatUser?.profileImageHash ? (
            <motion.img
              src={ipfsService.getFileUrl(chatUser.profileImageHash)}
              alt={chatUser.displayName}
              className="w-12 h-12 rounded-full object-cover border-2 border-accent crt-effect"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          ) : (
            <motion.div
              className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-pink to-neon-orange flex items-center justify-center border-2 border-accent text-shadow-neon"
              whileHover={{ scale: 1.1, rotate: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="text-black font-pixel text-lg">
                {chatUser?.displayName?.[0] || '?'}
              </span>
            </motion.div>
          )}

          {/* Enhanced Online Status */}
          {!isGroupChat && chatUser && (
            <motion.div
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black ${
                chatUser.isOnline ? 'bg-accent' : 'bg-gray-500'
              }`}
              animate={chatUser.isOnline ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>

        {/* Enhanced Chat Info */}
        <div className="flex-1 min-w-0">
          <motion.h2
            className="text-accent font-pixel text-lg truncate text-shadow-glow mb-1"
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {isGroupChat ? 'GLOBAL MATRIX' : chatUser?.displayName || 'UNKNOWN_USER'}
          </motion.h2>
          <div className="flex items-center gap-2 text-neon-cyan text-sm font-retro">
            {isGroupChat ? (
              <motion.span
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {messageCount} TRANSMISSIONS
              </motion.span>
            ) : (
              <>
                <span className="text-neon-pink">
                  {chatUser?.username ? `${chatUser.username}.boomer` : formatAddress(chatUser?.address || '')}
                </span>
                {chatUser && (
                  <>
                    <span className="text-accent">•</span>
                    <div className="flex items-center gap-1">
                      <motion.div
                        className={`w-2 h-2 rounded-full ${
                          chatUser.isOnline ? 'bg-accent' : 'bg-gray-500'
                        }`}
                        animate={chatUser.isOnline ? { opacity: [0.5, 1, 0.5] } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      <span className="text-xs uppercase tracking-wider">
                        {chatUser.isOnline ? 'NEURAL_LINK_ACTIVE' : 'DISCONNECTED'}
                      </span>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Enhanced Action Buttons */}
        <div className="flex items-center gap-2">
          {!isGroupChat && chatUser?.bio && (
            <motion.button
              className="p-2 text-neon-cyan hover:text-accent bg-black/30 hover:bg-black/50 border border-neon-cyan/30 hover:border-accent/50 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowBio(!showBio)}
              title={`Bio: ${chatUser.bio}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.button>
          )}

          <motion.button
            className="p-2 text-neon-cyan hover:text-accent bg-black/30 hover:bg-black/50 border border-neon-cyan/30 hover:border-accent/50 transition-all duration-300"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            title="System Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </motion.button>
        </div>
      </div>

      {/* Enhanced Bio Display */}
      {!isGroupChat && chatUser?.bio && showBio && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-3 pt-3 border-t border-neon-cyan/30"
        >
          <div className="bg-black/20 border border-neon-pink/30 rounded p-3 crt-effect">
            <p className="text-neon-pink text-sm font-retro">
              <span className="text-accent font-pixel text-xs">BIO_DATA:</span><br />
              "{chatUser.bio}"
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}