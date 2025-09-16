import { useState, useEffect } from 'react'
import { useReadContract } from 'wagmi'
import { motion } from 'framer-motion'
import { BOOMER_CHAT_ABI } from '../../config/contracts'

interface UsernameValidatorProps {
  username: string
  contractAddress: `0x${string}`
  onValidationChange: (isValid: boolean, error?: string) => void
  className?: string
}

interface ValidationResult {
  isValid: boolean
  error?: string
  isChecking: boolean
}

export const UsernameValidator: React.FC<UsernameValidatorProps> = ({
  username,
  contractAddress,
  onValidationChange,
  className = '',
}) => {
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: false,
    isChecking: false,
  })

  // Check if username exists on contract
  const { data: isUsernameAvailable, isLoading: isContractLoading } = useReadContract({
    address: contractAddress,
    abi: BOOMER_CHAT_ABI,
    functionName: 'isBoomerNameAvailable',
    args: [username],
    query: {
      enabled: username.length >= 3, // Only check if username is at least 3 chars
    },
  })

  useEffect(() => {
    if (username.length === 0) {
      setValidation({ isValid: false, isChecking: false })
      onValidationChange(false)
      return
    }

    // Client-side validation
    const clientValidation = validateUsername(username)
    if (!clientValidation.isValid) {
      setValidation(clientValidation)
      onValidationChange(false, clientValidation.error)
      return
    }

    // Contract validation
    if (isContractLoading) {
      setValidation({ isValid: false, isChecking: true })
      onValidationChange(false, 'Checking availability...')
      return
    }

    if (isUsernameAvailable === false) {
      setValidation({ 
        isValid: false, 
        error: 'Username is already taken',
        isChecking: false 
      })
      onValidationChange(false, 'Username is already taken')
      return
    }

    // All validations passed
    setValidation({ isValid: true, isChecking: false })
    onValidationChange(true)
  }, [username, isUsernameAvailable, isContractLoading, onValidationChange])

  const validateUsername = (value: string): ValidationResult => {
    // Length check
    if (value.length < 3) {
      return { isValid: false, error: 'Username must be at least 3 characters', isChecking: false }
    }
    if (value.length > 20) {
      return { isValid: false, error: 'Username must be 20 characters or less', isChecking: false }
    }

    // Character check (lowercase letters, numbers, and underscore only - matching contract validation)
    if (!/^[a-z0-9_]+$/.test(value)) {
      return { isValid: false, error: 'Username can only contain lowercase letters, numbers, and underscores', isChecking: false }
    }

    // Must start with lowercase letter
    if (!/^[a-z]/.test(value)) {
      return { isValid: false, error: 'Username must start with a lowercase letter', isChecking: false }
    }

    // Reserved words check
    const reservedWords = ['admin', 'moderator', 'boomer', 'chat', 'system', 'null', 'undefined']
    if (reservedWords.includes(value.toLowerCase())) {
      return { isValid: false, error: 'This username is reserved', isChecking: false }
    }

    return { isValid: true, isChecking: false }
  }

  const getValidationIcon = () => {
    if (validation.isChecking) {
      return (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
      )
    }

    if (validation.isValid) {
      return (
        <motion.svg
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-4 h-4 text-green-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </motion.svg>
      )
    }

    if (validation.error && username.length > 0) {
      return (
        <motion.svg
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-4 h-4 text-red-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </motion.svg>
      )
    }

    return null
  }

  const getValidationMessage = () => {
    if (validation.isChecking) {
      return (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-blue-600 flex items-center gap-2 mt-1"
        >
          <div className="animate-spin rounded-full h-3 w-3 border border-blue-500 border-t-transparent"></div>
          Checking availability...
        </motion.p>
      )
    }

    if (validation.isValid && username.length > 0) {
      return (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-green-600 mt-1"
        >
          ✓ Username is available!
        </motion.p>
      )
    }

    if (validation.error && username.length > 0) {
      return (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-red-600 mt-1"
        >
          {validation.error}
        </motion.p>
      )
    }

    return null
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        {getValidationIcon()}
      </div>
      {getValidationMessage()}
    </div>
  )
}