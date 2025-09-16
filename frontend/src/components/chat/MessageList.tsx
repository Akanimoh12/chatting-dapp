import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Message } from '../../types/chat'
import { MessageBubble } from './MessageBubble'

interface MessageListProps {
  messages: Message[]
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.timestamp).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)
    return groups
  }, {} as Record<string, Message[]>)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {Object.entries(groupedMessages).map(([date, dayMessages]) => (
          <motion.div
            key={date}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Date Separator */}
            <div className="flex items-center justify-center">
              <div className="bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
                <span className="text-blue-200 text-xs font-medium">
                  {formatDate(date)}
                </span>
              </div>
            </div>

            {/* Messages for this day */}
            <div className="space-y-2">
              {dayMessages.map((message, index) => {
                const prevMessage = dayMessages[index - 1]
                const showAvatar = !prevMessage || 
                  prevMessage.sender !== message.sender ||
                  message.timestamp - prevMessage.timestamp > 300000 // 5 minutes

                return (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    showAvatar={showAvatar}
                  />
                )
              })}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}