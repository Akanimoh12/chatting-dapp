import React from 'react'
import { motion } from 'framer-motion'
import { useNetworkValidation } from '../../hooks/useNetworkValidation'

export const NetworkWarning: React.FC = () => {
  const { isWrongNetwork, supportedChainName, switchToSepolia, isSwitching } = useNetworkValidation()

  if (!isWrongNetwork) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-600 to-red-700 border-b-2 border-red-400"
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-white animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-white font-mono text-sm">
                ⚠️ Wrong Network Detected! This dApp requires {supportedChainName}.
              </p>
            </div>
          </div>
          
          <button
            onClick={switchToSepolia}
            disabled={isSwitching}
            className="bg-white text-red-600 hover:bg-red-50 font-mono font-semibold px-4 py-2 rounded border-2 border-white hover:border-red-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSwitching ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                <span>Switching...</span>
              </>
            ) : (
              <span>Switch to {supportedChainName}</span>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  )
}