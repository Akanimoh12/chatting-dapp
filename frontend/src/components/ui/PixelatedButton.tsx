import React from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '../../utils'

interface PixelatedButtonProps extends Omit<HTMLMotionProps<"button">, 'children'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'neon' | 'retro'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  isLoading?: boolean
  glitch?: boolean
  neonGlow?: boolean
  children: React.ReactNode
}

export const PixelatedButton: React.FC<PixelatedButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  glitch = false,
  neonGlow = false,
  children,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = `
    relative font-pixel uppercase tracking-wider
    border-2 transition-all duration-200
    focus:outline-none focus:ring-0
    transform-gpu filter-pixelated
    ${disabled || isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
  `

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  }

  const variantClasses = {
    primary: `
      bg-accent border-accent text-black
      hover:bg-neon-cyan hover:border-neon-cyan hover:text-black
      active:bg-accent/80
      shadow-neon-sm hover:shadow-neon
    `,
    secondary: `
      bg-transparent border-text-primary text-text-primary
      hover:bg-text-primary hover:text-black
      active:bg-text-secondary
    `,
    danger: `
      bg-error border-error text-white
      hover:bg-neon-pink hover:border-neon-pink
      active:bg-error/80
      shadow-neon-sm hover:shadow-neon
    `,
    neon: `
      bg-transparent border-neon-cyan text-neon-cyan
      hover:bg-neon-cyan hover:text-black
      shadow-neon hover:shadow-neon-lg
      animate-glow
    `,
    retro: `
      bg-retro-purple border-retro-cyan text-retro-cyan
      hover:bg-retro-cyan hover:text-retro-purple
      shadow-pixel hover:shadow-pixel-lg
    `,
  }

  const buttonClasses = cn(
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    neonGlow && 'animate-neon-pulse',
    glitch && 'animate-glitch',
    className
  )

  return (
    <motion.button
      className={buttonClasses}
      disabled={disabled || isLoading}
      whileHover={!disabled && !isLoading ? { 
        scale: 1.05,
        rotateZ: [-0.5, 0.5, -0.5, 0],
        transition: { duration: 0.3 }
      } : {}}
      whileTap={!disabled && !isLoading ? { 
        scale: 0.95,
        transition: { duration: 0.1 }
      } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: "spring" }}
      {...props}
    >
      {/* Scanline effect */}
      <div className="scanline absolute inset-0 rounded-inherit pointer-events-none" />
      
      {/* Loading overlay */}
      {isLoading && (
        <motion.div
          className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-inherit"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 bg-current rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [1, 0.5, 1],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Content with glitch effect */}
      <span className={glitch ? 'glitch-text' : ''} data-text={children}>
        {children}
      </span>

      {/* Corner decorations */}
      <div className="absolute -top-0.5 -left-0.5 w-2 h-2 border-t border-l border-current opacity-60" />
      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 border-t border-r border-current opacity-60" />
      <div className="absolute -bottom-0.5 -left-0.5 w-2 h-2 border-b border-l border-current opacity-60" />
      <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 border-b border-r border-current opacity-60" />
    </motion.button>
  )
}