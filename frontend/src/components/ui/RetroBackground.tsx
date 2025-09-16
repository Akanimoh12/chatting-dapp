import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface RetroBackgroundProps {
  variant?: 'matrix' | 'grid' | 'stars' | 'gradient'
  intensity?: 'low' | 'medium' | 'high'
  className?: string
}

export const RetroBackground: React.FC<RetroBackgroundProps> = ({
  variant = 'gradient',
  intensity = 'medium',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (variant === 'matrix' && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?'
      const fontSize = 14
      const columns = canvas.width / fontSize

      const drops: number[] = []
      for (let x = 0; x < columns; x++) {
        drops[x] = 1
      }

      const intensitySettings = {
        low: { speed: 50, opacity: 0.1 },
        medium: { speed: 35, opacity: 0.15 },
        high: { speed: 20, opacity: 0.2 },
      }

      const settings = intensitySettings[intensity]

      function draw() {
        if (!ctx || !canvas) return

        ctx.fillStyle = `rgba(0, 0, 0, ${1 - settings.opacity})`
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.fillStyle = '#00ff41'
        ctx.font = `${fontSize}px monospace`

        for (let i = 0; i < drops.length; i++) {
          const text = characters[Math.floor(Math.random() * characters.length)]
          ctx.fillText(text, i * fontSize, drops[i] * fontSize)

          if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0
          }
          drops[i]++
        }
      }

      const interval = setInterval(draw, settings.speed)

      const handleResize = () => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }

      window.addEventListener('resize', handleResize)

      return () => {
        clearInterval(interval)
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [variant, intensity])

  const getBackgroundClasses = () => {
    switch (variant) {
      case 'matrix':
        return 'bg-black'
      case 'grid':
        return 'bg-gradient-to-br from-retro-dark via-retro-purple to-retro-blue retro-grid'
      case 'stars':
        return 'bg-gradient-to-br from-black via-retro-dark to-retro-purple'
      case 'gradient':
      default:
        return 'bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900'
    }
  }

  return (
    <div className={`fixed inset-0 -z-10 ${getBackgroundClasses()} ${className}`}>
      {variant === 'matrix' && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full opacity-60"
        />
      )}

      {variant === 'stars' && (
        <div className="absolute inset-0">
          {Array.from({ length: 100 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      )}

      {variant === 'grid' && (
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full" 
               style={{
                 backgroundImage: `
                   linear-gradient(rgba(0,255,65,0.3) 1px, transparent 1px),
                   linear-gradient(90deg, rgba(0,255,65,0.3) 1px, transparent 1px)
                 `,
                 backgroundSize: '50px 50px'
               }}
          />
        </div>
      )}

      {/* Scanline overlay for all variants */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full opacity-10"
             style={{
               background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,65,0.1) 2px, rgba(0,255,65,0.1) 4px)'
             }}
        />
      </div>

      {/* Vignette effect */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/50 pointer-events-none" />
    </div>
  )
}