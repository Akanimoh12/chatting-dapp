import React from 'react'
import { motion } from 'framer-motion'
import { ChatSidebar } from './ChatSidebar'
import { ChatWindow } from './ChatWindow'

export const ChatLayout: React.FC = () => {
  return (
    <div className="h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-80 bg-black/30 backdrop-blur-lg border-r border-white/10 flex flex-col"
      >
        <ChatSidebar />
      </motion.div>

      {/* Main Chat Area */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="flex-1 flex flex-col"
      >
        <ChatWindow />
      </motion.div>
    </div>
  )
}