import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AnimatePresence } from 'framer-motion'
import { config } from './config/wagmi'
import { LandingPage } from './pages/LandingPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { useUserRegistration } from './hooks/useUserRegistration'

const queryClient = new QueryClient()

const AppContent: React.FC = () => {
  // Initialize user registration status
  useUserRegistration()

  return (
    <div className="min-h-screen bg-background text-text-primary crt-screen">
      <Router>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </AnimatePresence>
      </Router>
      
      {/* Enhanced Retro Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(0, 0, 0, 0.9)',
            color: '#00ff41',
            border: '2px solid #00ff41',
            borderRadius: '8px',
            backdropFilter: 'blur(10px)',
            fontFamily: 'JetBrains Mono, Courier New, monospace',
            fontSize: '14px',
            boxShadow: '0 0 20px rgba(0, 255, 65, 0.3), inset 0 0 20px rgba(0, 255, 65, 0.1)',
            maxWidth: '400px',
          },
          success: {
            style: {
              border: '2px solid #00ff41',
              color: '#00ff41',
              boxShadow: '0 0 20px rgba(0, 255, 65, 0.5)',
            },
            iconTheme: {
              primary: '#00ff41',
              secondary: 'rgba(0, 0, 0, 0.9)',
            },
          },
          error: {
            style: {
              border: '2px solid #ff0040',
              color: '#ff0040',
              boxShadow: '0 0 20px rgba(255, 0, 64, 0.5)',
            },
            iconTheme: {
              primary: '#ff0040',
              secondary: 'rgba(0, 0, 0, 0.9)',
            },
          },
          loading: {
            style: {
              border: '2px solid #00d4ff',
              color: '#00d4ff',
              boxShadow: '0 0 20px rgba(0, 212, 255, 0.5)',
            },
            iconTheme: {
              primary: '#00d4ff',
              secondary: 'rgba(0, 0, 0, 0.9)',
            },
          },
        }}
      />

      {/* Global CRT Effect Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5" />
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0, 255, 65, 0.1) 2px,
              rgba(0, 255, 65, 0.1) 4px
            )`,
          }}
        />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <WagmiProvider config={config as any}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#00ff41',
            accentColorForeground: 'black',
            borderRadius: 'medium',
            fontStack: 'system',
            overlayBlur: 'small',
          })}
          modalSize="wide"
        >
          <AppContent />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
