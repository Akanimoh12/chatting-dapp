import { forwardRef } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '../../utils'

interface PixelatedInputProps extends Omit<HTMLMotionProps<"input">, 'ref'> {
  label?: string
  error?: string
  variant?: 'default' | 'retro' | 'neon'
}

export const PixelatedInput = forwardRef<HTMLInputElement, PixelatedInputProps>(
  ({ label, error, variant = 'default', className, ...props }, ref) => {
    const baseClasses = 'px-4 py-3 font-retro bg-black/60 border-2 text-text-primary placeholder-text-secondary focus:outline-none transition-all duration-300'
    
    const variantClasses = {
      default: 'border-gray-600 focus:border-accent',
      retro: 'border-neon-cyan/50 focus:border-neon-cyan crt-scanlines',
      neon: 'border-neon-pink/50 focus:border-neon-pink text-shadow-glow'
    }

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-pixel text-accent mb-2">
            {label}
          </label>
        )}
        <motion.input
          ref={ref}
          className={cn(baseClasses, variantClasses[variant], className)}
          whileFocus={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          {...props}
        />
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-red-400 font-retro"
          >
            {error}
          </motion.p>
        )}
      </div>
    )
  }
)

PixelatedInput.displayName = 'PixelatedInput'
