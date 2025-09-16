import { useRef, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useChatStore } from '../../stores/chatStore'
import { useUserStore } from '../../stores/userStore'
import { ChatHeader } from './ChatHeader'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { useChat } from '../../hooks/useChat'

export const ChatWindow: React.FC = () => {
  const { activeChat } = useChatStore()
  const { user } = useUserStore()
  const { messages, users, isLoadingMessages } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Get current chat messages with enhanced filtering and debugging
  const currentMessages = useMemo(() => {
    console.log('🔍 Filtering messages. Total:', messages.length, 'ActiveChat:', activeChat ? `direct:${activeChat.substring(0, 8)}` : 'group')
    console.log('📋 All messages:', messages.map(m => ({
      id: m.id.substring(0, 15),
      isGroupMessage: m.isGroupMessage,
      sender: m.sender?.substring(0, 8),
      recipient: m.recipient?.substring(0, 8),
      content: m.content.substring(0, 20),
      isPending: m.isPending
    })))
    
    if (activeChat === null) {
      // Group chat: show only messages with isGroupMessage === true
      const filtered = messages.filter(m => {
        const isGroup = Boolean(m.isGroupMessage === true)
        const hasNoRecipient = !m.recipient || m.recipient === undefined
        const isValidGroup = isGroup && hasNoRecipient
        
        console.log('Group filter:', { 
          id: m.id.substring(0, 15), 
          isGroupMessage: m.isGroupMessage, 
          isGroup, 
          hasNoRecipient,
          isValidGroup,
          content: m.content.substring(0, 20) 
        })
        return isValidGroup
      })
      
      console.log('✅ Group chat filtered:', filtered.length, 'messages')
      return filtered
    } else {
      // Direct chat: show only messages between current user and activeChat
      const filtered = messages.filter(m => {
        const isDirect = Boolean(m.isGroupMessage === false)
        const hasRecipient = Boolean(m.recipient)
        const normalizedSender = m.sender?.toLowerCase()
        const normalizedRecipient = m.recipient?.toLowerCase()
        const normalizedUser = user?.address?.toLowerCase()
        const normalizedActiveChat = activeChat?.toLowerCase()
        
        const isConversationMember = isDirect && hasRecipient && 
          ((normalizedSender === normalizedUser && normalizedRecipient === normalizedActiveChat) ||
           (normalizedSender === normalizedActiveChat && normalizedRecipient === normalizedUser))
           
        console.log('Direct filter:', { 
          id: m.id.substring(0, 15), 
          isGroupMessage: m.isGroupMessage, 
          isDirect, 
          hasRecipient,
          isConversationMember,
          normalizedSender: normalizedSender?.substring(0, 8),
          normalizedRecipient: normalizedRecipient?.substring(0, 8),
          normalizedActiveChat: normalizedActiveChat?.substring(0, 8),
          normalizedUser: normalizedUser?.substring(0, 8),
          content: m.content.substring(0, 20)
        })
        return isConversationMember
      })
      
      console.log('✅ Direct chat filtered:', filtered.length, 'messages for', activeChat.substring(0, 8))
      return filtered
    }
  }, [messages, activeChat, user?.address])

  // Get current chat user
  const currentChatUser = activeChat ? users.find(u => u.address === activeChat) : null

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentMessages])

  if (!user?.isRegistered) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Registration Required</h2>
          <p className="text-blue-200">
            You must register your .boomer domain to access the chat
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-black/10">
      {/* Chat Header */}
      <ChatHeader 
        isGroupChat={activeChat === null}
        chatUser={currentChatUser}
        messageCount={currentMessages.length}
      />

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden relative">
        {isLoadingMessages ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-400 border-t-transparent mx-auto mb-4"></div>
              <p>Loading messages...</p>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto px-4 py-4 space-y-4">
            {currentMessages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-white"
                >
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-xl font-bold mb-2">
                    {activeChat === null ? 'Welcome to Global Chat!' : `Chat with ${currentChatUser?.displayName}`}
                  </h3>
                  <p className="text-blue-200">
                    {activeChat === null 
                      ? 'Start a conversation with all boomers'
                      : 'Send your first message to start the conversation'
                    }
                  </p>
                </motion.div>
              </div>
            ) : (
              <MessageList messages={currentMessages} />
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <MessageInput
        isGroupChat={activeChat === null}
        recipient={activeChat}
        placeholder={
          activeChat === null
            ? 'Message all boomers...'
            : `Message ${currentChatUser?.displayName || 'user'}...`
        }
      />
    </div>
  )
}