import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAccount } from 'wagmi'
import { PixelatedButton } from '../components/ui/PixelatedButton'
import { PixelatedInput } from '../components/ui/PixelatedInput'
import { ImageUpload } from '../components/ui/ImageUpload'
import { UsernameValidator } from '../components/ui/UsernameValidator'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { RetroBackground } from '../components/ui/RetroBackground'
import { NetworkWarning } from '../components/ui/NetworkWarning'
import { useBoomerRegistration } from '../hooks/useBoomerRegistration'
import { useNetworkValidation } from '../hooks/useNetworkValidation'
import { CONTRACT_ADDRESS } from '../config/contracts'

interface FormData {
  username: string
  displayName: string
  bio: string
  profileImage?: File
}

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const { isConnected } = useAccount()
  const { isCorrectNetwork } = useNetworkValidation()
  
  const [formData, setFormData] = useState<FormData>({
    username: '',
    displayName: '',
    bio: '',
  })
  
  const [isUsernameValid, setIsUsernameValid] = useState(false)
  const [usernameError, setUsernameError] = useState<string>()
  
  const {
    isLoading,
    isComplete,
    error,
    registerUser,
    resetState,
  } = useBoomerRegistration()

  // Redirect if not connected
  if (!isConnected) {
    return (
      <>
        <NetworkWarning />
        <RetroBackground variant="matrix" intensity="high" />
        <div className="min-h-screen flex items-center justify-center p-4 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md mx-auto"
          >
            <div className="bg-black/40 backdrop-blur-lg border-2 border-red-500/50 rounded-lg p-8 crt-effect">
              <motion.div
                className="text-6xl mb-6"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ⚠️
              </motion.div>
              <h2 className="text-2xl font-pixel text-red-400 mb-4 text-shadow-neon">
                ACCESS DENIED
              </h2>
              <p className="text-text-secondary mb-6 font-retro">
                Neural link not established.<br />
                Please connect your cyber wallet to proceed.
              </p>
              <Link to="/">
                <PixelatedButton variant="danger" size="lg" neonGlow>
                  ← RETURN TO MAINFRAME
                </PixelatedButton>
              </Link>
            </div>
          </motion.div>
        </div>
      </>
    )
  }

  // Success screen
  if (isComplete) {
    return (
      <>
        <RetroBackground variant="grid" intensity="medium" />
        <div className="min-h-screen flex items-center justify-center p-4 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 15, stiffness: 300 }}
            className="text-center max-w-lg mx-auto"
          >
            <div className="bg-black/40 backdrop-blur-lg border-2 border-accent/50 rounded-lg p-8 crt-effect">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", damping: 10 }}
                className="text-8xl mb-6"
              >
                🎮
              </motion.div>
              
              <motion.h2
                className="text-4xl font-pixel text-accent mb-4 text-shadow-neon"
                animate={{
                  textShadow: [
                    '0 0 5px #00ff41, 0 0 10px #00ff41',
                    '0 0 20px #00ff41, 0 0 30px #00ff41',
                    '0 0 5px #00ff41, 0 0 10px #00ff41',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                INITIALIZATION
                <br />
                COMPLETE!
              </motion.h2>
              
              <p className="text-text-secondary mb-8 font-retro text-lg">
                Welcome to the neural network, cyber warrior!<br />
                Your <span className="text-neon-pink">.boomer</span> domain is now online.
              </p>
              
              <div className="space-y-4">
                <PixelatedButton
                  variant="neon"
                  size="xl"
                  onClick={() => navigate('/dashboard')}
                  className="w-full"
                  neonGlow
                >
                  ENTER THE MATRIX →
                </PixelatedButton>
                
                <button
                  onClick={() => {
                    resetState()
                    navigate('/')
                  }}
                  className="text-neon-cyan hover:text-neon-pink transition-colors font-mono underline"
                >
                  ← Return to Mainframe
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </>
    )
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    // Normalize username to lowercase and remove invalid characters
    if (field === 'username') {
      const normalizedValue = value
        .toLowerCase() // Convert to lowercase
        .replace(/[^a-z0-9_]/g, '') // Remove any characters that aren't lowercase letters, numbers, or underscores
      setFormData(prev => ({ ...prev, [field]: normalizedValue }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleImageSelect = (file: File) => {
    setFormData(prev => ({ ...prev, profileImage: file }))
  }

  const handleUsernameValidation = (isValid: boolean, error?: string) => {
    setIsUsernameValid(isValid)
    setUsernameError(error)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isUsernameValid) {
      return
    }

    try {
      await registerUser(formData, CONTRACT_ADDRESS as `0x${string}`)
    } catch (error) {
      console.error('Registration failed:', error)
    }
  }

  const isFormValid = 
    isUsernameValid && 
    !isLoading &&
    isCorrectNetwork

  return (
    <>
      <NetworkWarning />
      <RetroBackground variant="grid" intensity="medium" />
      
      <div className="min-h-screen p-4 relative">
        <div className="container mx-auto py-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <motion.h1
                className="text-5xl md:text-6xl font-pixel text-accent mb-4 text-shadow-neon"
                animate={{
                  textShadow: [
                    '0 0 5px #00ff41, 0 0 10px #00ff41',
                    '0 0 15px #00ff41, 0 0 25px #00ff41',
                    '0 0 5px #00ff41, 0 0 10px #00ff41',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                NEURAL LINK
                <br />
                <span className="text-neon-pink">REGISTRATION</span>
              </motion.h1>
              <p className="text-text-secondary font-retro text-lg">
                Initialize your cyber identity in the 
                <span className="text-neon-cyan"> .boomer </span>
                dimension
              </p>
            </motion.div>

            {/* Registration Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-black/40 backdrop-blur-lg rounded-lg p-8 border-2 border-accent/30 crt-effect"
            >
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Profile Image Upload */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-center"
                >
                  <label className="block text-accent font-pixel text-xl mb-4 text-shadow-glow">
                    AVATAR MATRIX (Optional)
                  </label>
                  <div className="flex justify-center">
                    <div className="relative">
                      <ImageUpload
                        onImageSelect={handleImageSelect}
                        isUploading={isLoading}
                      />
                      <div className="absolute inset-0 border-2 border-neon-cyan/30 rounded-lg animate-pulse pointer-events-none" />
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary mt-3 font-mono">
                    Data will be stored in the 
                    <span className="text-neon-orange"> IPFS </span>
                    decentralized matrix
                  </p>
                </motion.div>

                {/* Username */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-accent font-pixel text-xl mb-3 text-shadow-glow">
                    CYBER HANDLE <span className="text-red-400 animate-pulse">*</span>
                  </label>
                  <p className="text-text-secondary text-sm font-mono mb-2">
                    Only lowercase letters, numbers, and underscores allowed. Uppercase letters will be converted automatically.
                  </p>
                  <div className="relative">
                    <PixelatedInput
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      placeholder="cyber_warrior_1337"
                      className="w-full pr-24"
                      disabled={isLoading}
                      variant="neon"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <span className="text-neon-pink font-pixel text-lg">.boomer</span>
                    </div>
                  </div>
                  <UsernameValidator
                    username={formData.username}
                    contractAddress={CONTRACT_ADDRESS}
                    onValidationChange={handleUsernameValidation}
                    className="mt-3"
                  />
                </motion.div>

                {/* Display Name */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="block text-accent font-pixel text-xl mb-3 text-shadow-glow">
                    DISPLAY NAME <span className="text-red-400 animate-pulse">*</span>
                  </label>
                  <PixelatedInput
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    placeholder="Neo Anderson"
                    className="w-full"
                    disabled={isLoading}
                    variant="retro"
                  />
                  <p className="text-sm text-text-secondary mt-2 font-mono">
                    How other users will identify you in the matrix
                  </p>
                </motion.div>

                {/* Bio */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <label className="block text-accent font-pixel text-xl mb-3 text-shadow-glow">
                    BIO DATA (Optional)
                  </label>
                  <div className="relative">
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="I hack the mainframe and drink coffee..."
                      className="w-full px-6 py-4 bg-black/60 border-2 border-accent/30 rounded-lg text-accent placeholder-text-secondary/60 font-mono focus:border-neon-cyan focus:outline-none transition-all duration-300 resize-none crt-scanlines"
                      rows={4}
                      maxLength={200}
                      disabled={isLoading}
                    />
                    <div className="absolute bottom-3 right-3">
                      <span className="text-xs text-text-secondary font-mono">
                        {formData.bio.length}/200
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Error Display */}
                {(error || usernameError) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-500/20 border-2 border-red-500/50 rounded-lg p-4 crt-effect"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl animate-pulse">⚠️</span>
                      <p className="text-red-300 font-mono">{error || usernameError}</p>
                    </div>
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="space-y-6"
                >
                  <PixelatedButton
                    type="submit"
                    variant="neon"
                    size="xl"
                    disabled={!isFormValid}
                    className="w-full"
                    neonGlow
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-4">
                        <LoadingSpinner size="md" variant="matrix" color="neon-cyan" />
                        <span className="font-pixel">INITIALIZING NEURAL LINK...</span>
                      </div>
                    ) : !isCorrectNetwork ? (
                      <span className="font-pixel text-red-400">
                        WRONG NETWORK - SWITCH TO SEPOLIA
                      </span>
                    ) : (
                      <span className="font-pixel">
                        REGISTER .BOOMER DOMAIN (0.001 ETH)
                      </span>
                    )}
                  </PixelatedButton>

                  <div className="text-center">
                    <Link 
                      to="/" 
                      className="text-neon-cyan hover:text-neon-pink transition-colors font-mono underline"
                    >
                      ← Exit to Mainframe
                    </Link>
                  </div>
                </motion.div>
              </form>
            </motion.div>

            {/* Info Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-8 text-center"
            >
              <div className="bg-black/30 backdrop-blur-sm border border-accent/20 rounded-lg p-6">
                <p className="text-text-secondary font-mono leading-relaxed">
                  Neural link initialization requires a small energy fee to maintain network stability.<br />
                  Your <span className="text-neon-pink">.boomer</span> domain will be permanently encoded 
                  in the blockchain matrix! <span className="text-accent">🚀</span>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}