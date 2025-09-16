import React from 'react'
import { motion } from 'framer-motion'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'circle' | 'dots' | 'bars' | 'pixel' | 'matrix'
  color?: 'accent' | 'neon-cyan' | 'neon-pink' | 'neon-orange' | 'white'
  className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'circle',
  color = 'accent',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  }

  const colorClasses = {
    accent: 'text-accent',
    'neon-cyan': 'text-neon-cyan',
    'neon-pink': 'text-neon-pink',
    'neon-orange': 'text-neon-orange',
    white: 'text-white',
  }

  if (variant === 'circle') {
    return (
      <motion.div
        className={`border-2 border-current border-t-transparent rounded-full ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    )
  }

  return (
    <motion.div
      className={`border-2 border-current border-t-transparent rounded-full ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  )
}
