import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { PixelatedButton } from '../components/ui/PixelatedButton'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { RetroBackground } from '../components/ui/RetroBackground'
import { NetworkWarning } from '../components/ui/NetworkWarning'
import { useUserRegistration } from '../hooks/useUserRegistration'
import { useNetworkValidation } from '../hooks/useNetworkValidation'

export const LandingPage: React.FC = () => {
  const navigate = useNavigate()
  const { address, isConnected } = useAccount()
  const { user, isCheckingRegistration } = useUserRegistration()
  const { isCorrectNetwork } = useNetworkValidation()

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  // Auto-redirect logic
  React.useEffect(() => {
    if (isConnected && user?.isRegistered && !isCheckingRegistration && isCorrectNetwork) {
      navigate('/dashboard')
    }
  }, [isConnected, user?.isRegistered, isCheckingRegistration, isCorrectNetwork, navigate])

  return (
    <>
      <NetworkWarning />
      <RetroBackground variant="matrix" intensity="medium" />
      
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            {/* Title with glitch effect */}
            <motion.h1
              className="text-6xl md:text-8xl font-pixel text-accent mb-6 text-shadow-neon"
              animate={{
                textShadow: [
                  '0 0 5px #00ff41, 0 0 10px #00ff41, 0 0 15px #00ff41',
                  '0 0 10px #00ff41, 0 0 20px #00ff41, 0 0 30px #00ff41',
                  '0 0 5px #00ff41, 0 0 10px #00ff41, 0 0 15px #00ff41',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              BOOMER
              <motion.span 
                className="block text-neon-cyan"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                CHAT
              </motion.span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-xl md:text-2xl text-text-secondary font-retro mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              The most exclusive retro chat experience on the blockchain.
              <br />
              <span className="text-neon-pink">Claim your .boomer domain today!</span>
            </motion.p>
          </motion.div>

          {/* Status Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Connection Status */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="bg-black/30 backdrop-blur-lg border border-white/10 rounded-lg p-6 crt-effect"
            >
              <h3 className="text-accent font-pixel text-lg mb-4">CONNECTION</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Status:</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      isConnected ? 'bg-accent animate-pulse' : 'bg-gray-500'
                    }`} />
                    <span className={isConnected ? 'text-accent' : 'text-gray-400'}>
                      {isConnected ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </div>
                </div>
                {isConnected && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Wallet:</span>
                    <span className="text-neon-cyan font-mono text-sm">
                      {formatAddress(address!)}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Registration Status */}
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="bg-black/30 backdrop-blur-lg border border-white/10 rounded-lg p-6 crt-effect"
            >
              <h3 className="text-neon-pink font-pixel text-lg mb-4">REGISTRATION</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Domain:</span>
                  <span className={user?.isRegistered ? 'text-accent' : 'text-gray-400'}>
                    {user?.isRegistered ? `${user.username}.boomer` : 'Not claimed'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Status:</span>
                  <div className="flex items-center gap-2">
                    {isCheckingRegistration ? (
                      <LoadingSpinner size="sm" variant="dots" color="neon-cyan" />
                    ) : (
                      <>
                        <div className={`w-2 h-2 rounded-full ${
                          user?.isRegistered ? 'bg-accent animate-pulse' : 'bg-gray-500'
                        }`} />
                        <span className={user?.isRegistered ? 'text-accent' : 'text-gray-400'}>
                          {user?.isRegistered ? 'REGISTERED' : 'UNREGISTERED'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Network Status */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="bg-black/30 backdrop-blur-lg border border-white/10 rounded-lg p-6 crt-effect"
            >
              <h3 className="text-neon-orange font-pixel text-lg mb-4">NETWORK</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Chain:</span>
                  <span className="text-neon-orange">SEPOLIA</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Protocol:</span>
                  <span className="text-accent">ETHEREUM</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="space-y-6"
          >
            {!isConnected ? (
              <div className="space-y-4 flex flex-col items-center">
                {/* Use default RainbowKit ConnectButton */}
                <ConnectButton />
                
                <p className="text-text-secondary text-sm font-mono text-center max-w-md">
                  Connect your wallet to access the BoomerChat network.<br />
                  Make sure you're on Sepolia testnet.
                </p>
              </div>
            ) : user?.isRegistered ? (
              <div className="space-y-4">
                <PixelatedButton
                  variant="primary"
                  size="xl"
                  onClick={() => navigate('/dashboard')}
                  neonGlow
                  className="mx-auto min-w-64"
                >
                  ENTER CHAT ROOM
                </PixelatedButton>
                
                <div className="flex items-center justify-center gap-4">
                  <span className="text-text-secondary">Connected as {user.displayName}</span>
                  <ConnectButton />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Link to="/register">
                  <PixelatedButton
                    variant="retro"
                    size="xl"
                    neonGlow
                    className="mx-auto min-w-64"
                  >
                    REGISTER .BOOMER
                  </PixelatedButton>
                </Link>
                
                <div className="flex items-center justify-center gap-4">
                  <span className="text-text-secondary">Connected: {formatAddress(address!)}</span>
                  <ConnectButton />
                </div>
              </div>
            )}
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mt-20 grid md:grid-cols-3 gap-8"
          >
            {[
              { icon: '🔒', title: 'DECENTRALIZED', desc: 'No servers, no censorship' },
              { icon: '⚡', title: 'REAL-TIME', desc: 'Zero page reloads' },
              { icon: '🎮', title: 'RETRO VIBES', desc: 'Pure 80s nostalgia' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="text-center"
                whileHover={{ scale: 1.05, rotateY: 5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-4xl mb-4 animate-float" style={{ animationDelay: `${i * 0.5}s` }}>
                  {feature.icon}
                </div>
                <h4 className="font-pixel text-accent text-lg mb-2">{feature.title}</h4>
                <p className="text-text-secondary">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </>
  )
}