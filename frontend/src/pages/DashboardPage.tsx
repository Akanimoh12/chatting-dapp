import React from 'react'
import { useAccount } from 'wagmi'
import { Navigate } from 'react-router-dom'
import { useUserStore } from '../stores/userStore'
import { ChatLayout } from '../components/chat/ChatLayout'

export const DashboardPage: React.FC = () => {
  const { isConnected } = useAccount()
  const { user } = useUserStore()

  // Redirect to landing if not connected
  if (!isConnected) {
    return <Navigate to="/" replace />
  }

  // Redirect to registration if not registered
  if (!user?.isRegistered) {
    return <Navigate to="/register" replace />
  }

  return <ChatLayout />
}