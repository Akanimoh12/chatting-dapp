import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useChat } from '../../hooks/useChat'

interface MessageInputProps {
  isGroupChat: boolean
  recipient?: string | null
  placeholder: string
}

export const MessageInput: React.FC<MessageInputProps> = ({
  isGroupChat,
  recipient,
  placeholder,
}) => {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { sendMessage, isSendingMessage } = useChat()

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }, [message])

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!message.trim() || isSendingMessage) return

    const messageContent = message.trim()
    setMessage('')
    setIsTyping(false)

    try {
      await sendMessage({
        content: messageContent,
        recipient: recipient || undefined,
        isGroupMessage: isGroupChat,
      })
    } catch (error) {
      console.error('Failed to send message:', error)
      // Restore message on failure
      setMessage(messageContent)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    setIsTyping(e.target.value.length > 0)
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-black/40 backdrop-blur-lg border-t-2 border-neon-cyan/30 p-4 crt-effect relative overflow-hidden"
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <motion.div
          className="w-full h-full"
          style={{
            backgroundImage: `repeating-linear-gradient(
              90deg,
              transparent,
              transparent 20px,
              rgba(0, 255, 65, 0.1) 20px,
              rgba(0, 255, 65, 0.1) 40px
            )`
          }}
          animate={{ x: [0, -40] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <form onSubmit={handleSubmit} className="flex items-end gap-3 relative z-10">
        {/* Enhanced Message Input */}
        <div className="flex-1 relative">
          <motion.textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isSendingMessage}
            className="w-full px-4 py-3 bg-black/60 border-2 border-neon-cyan/50 text-accent placeholder-neon-cyan/60 font-retro focus:border-accent focus:outline-none transition-all resize-none max-h-30 scrollbar-thin scrollbar-thumb-accent scrollbar-track-transparent disabled:opacity-50 crt-scanlines"
            rows={1}
            maxLength={500}
            whileFocus={{ scale: 1.02, borderColor: "#00ff41" }}
            transition={{ duration: 0.2 }}
            style={{
              borderRadius: '8px',
              caretColor: '#00ff41',
            }}
          />
          
          {/* Enhanced Character Count */}
          {message.length > 400 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute -top-8 right-2 text-xs text-neon-orange font-mono bg-black/60 px-2 py-1 border border-neon-orange/50"
            >
              {message.length}/500
            </motion.div>
          )}

          {/* Input Glow Effect */}
          <motion.div
            className="absolute inset-0 border-2 border-accent opacity-0 pointer-events-none"
            animate={message.trim() ? { opacity: [0, 0.3, 0] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ borderRadius: '8px' }}
          />
        </div>

        {/* Enhanced Emoji Button */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.1, rotate: 10 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            const emojis = ['😀', '😂', '❤️', '👍', '👎', '🔥', '💯', '🚀', '🎉', '💀', '🎮', '⚡', '💎', '🌟']
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]
            setMessage(prev => prev + randomEmoji)
            textareaRef.current?.focus()
          }}
          className="p-3 text-neon-pink hover:text-accent bg-black/40 hover:bg-black/60 border border-neon-pink/50 hover:border-accent/50 transition-all duration-300"
          title="Neural Emoji Injection"
          style={{ borderRadius: '8px' }}
        >
          <motion.svg
            className="w-6 h-6"
            fill="currentColor"
            viewBox="0 0 20 20"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z"
              clipRule="evenodd"
            />
          </motion.svg>
        </motion.button>

        {/* Enhanced Send Button */}
        <motion.button
          type="submit"
          disabled={!message.trim() || isSendingMessage}
          whileHover={message.trim() && !isSendingMessage ? { scale: 1.05 } : {}}
          whileTap={message.trim() && !isSendingMessage ? { scale: 0.95 } : {}}
          className={`p-3 transition-all font-pixel text-sm border-2 ${
            message.trim() && !isSendingMessage
              ? 'bg-gradient-to-r from-accent to-neon-cyan text-black border-accent hover:from-neon-cyan hover:to-accent animate-pulse-glow'
              : 'bg-gray-600/50 text-gray-400 border-gray-600/50 cursor-not-allowed'
          }`}
          style={{ borderRadius: '8px' }}
        >
          {isSendingMessage ? (
            <div className="flex items-center gap-2">
              <motion.div
                className="w-5 h-5 border-2 border-current border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                style={{ borderRadius: '50%' }}
              />
              <span className="text-xs">TRANSMITTING</span>
            </div>
          ) : (
            <motion.div
              className="flex items-center gap-1"
              whileHover={{ x: 2 }}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
              <span className="hidden sm:inline text-xs">SEND</span>
            </motion.div>
          )}
        </motion.button>
      </form>

      {/* Enhanced Typing Indicator */}
      {isTyping && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="mt-3 text-xs text-neon-cyan font-retro relative z-10"
        >
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            [ENTER] = TRANSMIT • [SHIFT+ENTER] = NEW_LINE
          </motion.span>
        </motion.div>
      )}
    </motion.div>
  )
}