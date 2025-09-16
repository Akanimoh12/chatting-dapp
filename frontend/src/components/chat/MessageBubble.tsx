import React from 'react'
import { motion } from 'framer-motion'
import type { Message } from '../../types/chat'
import { useChatStore } from '../../stores/chatStore'
import { getIPFSService } from '../../utils/ipfs'

interface MessageBubbleProps {
  message: Message
  showAvatar: boolean
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  showAvatar,
}) => {
  const { users } = useChatStore()
  const ipfsService = getIPFSService()

  const sender = users.find(u => u.address === message.sender)
  const isOwn = message.isOwn

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ 
        opacity: message.isPending ? 0.7 : 1, 
        y: 0, 
        scale: 1 
      }}
      transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
      className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
    >
      {/* Enhanced Avatar */}
      <div className={`flex-shrink-0 ${showAvatar ? '' : 'invisible'}`}>
        {sender?.profileImageHash ? (
          <motion.img
            src={ipfsService.getFileUrl(sender.profileImageHash)}
            alt={sender.displayName}
            className="w-8 h-8 rounded-full object-cover border border-accent crt-effect"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          />
        ) : (
          <motion.div
            className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center border border-accent"
            whileHover={{ scale: 1.1, rotate: -5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <span className="text-black font-pixel text-xs">
              {sender?.displayName?.[0] || message.sender[2]?.toUpperCase() || '?'}
            </span>
          </motion.div>
        )}
      </div>

      {/* Message Content */}
      <div className={`flex flex-col max-w-xs lg:max-w-md ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Enhanced Sender Name */}
        {!isOwn && showAvatar && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-neon-cyan text-xs font-retro mb-1 px-1 uppercase tracking-wider"
          >
            {sender?.displayName || formatAddress(message.sender)}
          </motion.div>
        )}

        {/* Enhanced Message Bubble */}
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className={`relative px-4 py-3 backdrop-blur-sm border-2 crt-effect ${
            isOwn
              ? 'bg-gradient-to-br from-accent/20 to-neon-cyan/20 border-accent text-accent ml-auto'
              : 'bg-gradient-to-br from-black/60 to-black/40 border-neon-cyan/50 text-text-primary'
          } ${showAvatar ? '' : 'mt-1'}`}
          style={{
            borderRadius: isOwn ? '18px 4px 18px 18px' : '4px 18px 18px 18px'
          }}
        >
          {/* Message Text with Retro Font */}
          <p className="text-sm leading-relaxed break-words font-retro">
            {message.content}
          </p>

          {/* Enhanced Timestamp */}
          <div className={`text-xs mt-2 flex items-center gap-2 font-mono ${
            isOwn ? 'text-neon-cyan/80' : 'text-neon-pink/80'
          }`}>
            <motion.span
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {formatTime(message.timestamp)}
            </motion.span>
            
            {/* Enhanced Pending Indicator */}
            {message.isPending && (
              <motion.div
                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                transition={{ 
                  rotate: { duration: 1, repeat: Infinity, ease: "linear" },
                  scale: { duration: 0.5, repeat: Infinity }
                }}
                className="w-3 h-3 text-neon-orange"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.div>
            )}

            {/* Enhanced Delivered Indicator */}
            {isOwn && !message.isPending && (
              <motion.svg
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                className="w-3 h-3 text-accent"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </motion.svg>
            )}
          </div>

          {/* Enhanced Message Tail with Glow */}
          {showAvatar && (
            <div
              className={`absolute top-3 w-3 h-3 transform rotate-45 ${
                isOwn
                  ? 'bg-gradient-to-br from-accent/20 to-neon-cyan/20 border border-accent -right-1'
                  : 'bg-gradient-to-br from-black/60 to-black/40 border border-neon-cyan/50 -left-1'
              }`}
            />
          )}

          {/* Subtle Glow Effect */}
          <motion.div
            className={`absolute inset-0 rounded-full opacity-20 ${
              isOwn ? 'bg-accent' : 'bg-neon-cyan'
            }`}
            animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{
              borderRadius: isOwn ? '18px 4px 18px 18px' : '4px 18px 18px 18px'
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  )
}