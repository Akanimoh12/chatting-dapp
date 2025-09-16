/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'SF Mono', 'Courier New', 'monospace'],
        'pixel': ['Press Start 2P', 'Courier New', 'monospace'],
        'retro': ['VT323', 'Courier New', 'monospace'],
      },
      colors: {
        // Enhanced BoomerChat retro color palette
        'primary': '#000000',
        'secondary': '#FFFFFF', 
        'accent': '#00FF41',
        'error': '#FF0000',
        'warning': '#FFD700',
        'background': '#0D1117',
        'surface': '#161B22',
        'border': '#30363D',
        'text-primary': '#F0F6FC',
        'text-secondary': '#8B949E',
        'neon': {
          'pink': '#ff00ff',
          'cyan': '#00ffff',
          'green': '#00ff00',
          'orange': '#ff8000',
          'purple': '#8000ff',
          'blue': '#0066ff',
        },
        'retro': {
          'dark': '#1a0033',
          'purple': '#4a0080',
          'blue': '#0066cc',
          'cyan': '#00ccff',
          'green': '#00ff66',
          'yellow': '#ffff00',
          'orange': '#ff6600',
          'red': '#ff0066',
        },
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-accent': 'pulse-accent 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'typing': 'typing 1.5s ease-in-out infinite alternate',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'scan': 'scan 2s linear infinite',
        'glitch': 'glitch 0.3s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'pixel-fade': 'pixelFade 0.5s ease-in-out',
        'neon-pulse': 'neonPulse 1.5s ease-in-out infinite',
        'matrix-rain': 'matrixRain 20s linear infinite',
      },
      keyframes: {
        'pulse-accent': {
          '0%, 100%': {
            'box-shadow': '0 0 0 0 rgba(0, 255, 65, 0.7)',
          },
          '50%': {
            'box-shadow': '0 0 0 10px rgba(0, 255, 65, 0)',
          },
        },
        'typing': {
          '0%': { opacity: '0.5' },
          '100%': { opacity: '1' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor' },
          '100%': { boxShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor' },
        },
        scan: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        glitch: {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pixelFade: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        neonPulse: {
          '0%, 100%': { textShadow: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor' },
          '50%': { textShadow: '0 0 2px currentColor, 0 0 5px currentColor, 0 0 8px currentColor' },
        },
        matrixRain: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
      boxShadow: {
        'neon': '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor, 0 0 20px currentColor',
        'neon-sm': '0 0 2px currentColor, 0 0 5px currentColor, 0 0 10px currentColor',
        'neon-lg': '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor, 0 0 40px currentColor',
        'pixel': '4px 4px 0px rgba(0,0,0,0.3)',
        'pixel-lg': '8px 8px 0px rgba(0,0,0,0.3)',
        'retro': 'inset 0 1px 0 rgba(255,255,255,0.2), 0 1px 2px rgba(0,0,0,0.8)',
        'inner-glow': 'inset 0 0 10px rgba(0,255,65,0.3)',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.text-shadow-neon': {
          textShadow: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor',
        },
        '.text-shadow-pixel': {
          textShadow: '2px 2px 0px rgba(0,0,0,0.8)',
        },
        '.filter-pixelated': {
          imageRendering: 'pixelated',
          imageRendering: '-moz-crisp-edges',
          imageRendering: 'crisp-edges',
        },
        '.border-pixel': {
          borderStyle: 'solid',
          borderWidth: '2px',
          borderImage: 'linear-gradient(45deg, #00ff41, #ff00ff) 1',
        },
        '.scanline': {
          position: 'relative',
          overflow: 'hidden',
        },
        '.scanline::before': {
          content: '""',
          position: 'absolute',
          top: '0',
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(0,255,65,0.2), transparent)',
          animation: 'scan 2s linear infinite',
          pointerEvents: 'none',
        },
        '.crt-effect': {
          position: 'relative',
          overflow: 'hidden',
        },
        '.crt-effect::before': {
          content: '""',
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,65,0.03) 2px, rgba(0,255,65,0.03) 4px)',
          pointerEvents: 'none',
          zIndex: '10',
        },
        '.retro-grid': {
          backgroundImage: 'linear-gradient(rgba(0,255,65,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        },
        '.glitch-text': {
          position: 'relative',
        },
        '.glitch-text::before': {
          content: 'attr(data-text)',
          position: 'absolute',
          top: '0',
          left: '0',
          color: '#ff00ff',
          overflow: 'hidden',
          animation: 'glitch 0.3s ease-in-out infinite',
        },
        '.glitch-text::after': {
          content: 'attr(data-text)',
          position: 'absolute',
          top: '0',
          left: '0',
          color: '#00ffff',
          overflow: 'hidden',
          animation: 'glitch 0.3s ease-in-out infinite reverse',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}

