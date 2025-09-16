import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatTimestamp(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp * 1000 // Convert to milliseconds

  if (diff < 60000) { // Less than 1 minute
    return 'just now'
  } else if (diff < 3600000) { // Less than 1 hour
    const minutes = Math.floor(diff / 60000)
    return `${minutes}m ago`
  } else if (diff < 86400000) { // Less than 1 day
    const hours = Math.floor(diff / 3600000)
    return `${hours}h ago`
  } else {
    const days = Math.floor(diff / 86400000)
    return `${days}d ago`
  }
}

export function getIpfsUrl(hash: string): string {
  if (!hash) return '/default-avatar.png'
  return `https://gateway.pinata.cloud/ipfs/${hash}`
}

export function validateBoomerName(name: string): { isValid: boolean; error?: string } {
  if (!name) {
    return { isValid: false, error: 'Name is required' }
  }
  
  if (name.length < 3) {
    return { isValid: false, error: 'Name must be at least 3 characters' }
  }
  
  if (name.length > 20) {
    return { isValid: false, error: 'Name must be less than 20 characters' }
  }
  
  // Check format: only lowercase letters, numbers, and underscores
  const validPattern = /^[a-z0-9_]+$/
  if (!validPattern.test(name)) {
    return { isValid: false, error: 'Name can only contain lowercase letters, numbers, and underscores' }
  }
  
  return { isValid: true }
}

export function validateMessage(message: string): { isValid: boolean; error?: string } {
  if (!message.trim()) {
    return { isValid: false, error: 'Message cannot be empty' }
  }
  
  if (message.length > 280) {
    return { isValid: false, error: 'Message cannot exceed 280 characters' }
  }
  
  return { isValid: true }
}

export function generateTempId(): string {
  return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function isValidImage(file: File): { isValid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Only JPEG, PNG, GIF, and WebP images are allowed' }
  }
  
  if (file.size > maxSize) {
    return { isValid: false, error: 'Image must be less than 5MB' }
  }
  
  return { isValid: true }
}

export function compressImage(file: File, maxWidth: number = 400, quality: number = 0.8): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    
    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      
      canvas.toBlob((blob) => {
        const compressedFile = new File([blob!], file.name, {
          type: file.type,
          lastModified: Date.now()
        })
        resolve(compressedFile)
      }, file.type, quality)
    }
    
    img.src = URL.createObjectURL(file)
  })
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export const APP_CONFIG = {
  CHAIN_ID: 11155111, // Sepolia
  REGISTRATION_FEE: '0.001', // ETH
  MAX_MESSAGE_LENGTH: 280,
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  IPFS_GATEWAY: 'https://gateway.pinata.cloud/ipfs/',
  DEFAULT_AVATAR: '/default-avatar.png',
} as const