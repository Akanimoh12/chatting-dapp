// IPFS utilities using Pinata for image uploads
export interface IPFSUploadResponse {
  ipfsHash: string;
  url: string;
}

export interface IPFSError {
  message: string;
  code?: string;
}

class IPFSService {
  private readonly pinataApiKey: string;
  private readonly pinataSecretKey: string;
  private readonly pinataJWT: string;
  private readonly pinataEndpoint = 'https://api.pinata.cloud';

  constructor() {
    this.pinataApiKey = import.meta.env.VITE_PINATA_API_KEY || '';
    this.pinataSecretKey = import.meta.env.VITE_PINATA_SECRET_KEY || '';
    this.pinataJWT = import.meta.env.VITE_PINATA_JWT || '';
  }

  /**
   * Upload file to IPFS via Pinata
   */
  async uploadFile(file: File, name?: string): Promise<IPFSUploadResponse> {
    if (!this.pinataJWT && !this.pinataApiKey) {
      throw new Error('Pinata credentials not configured')
    }

    const formData = new FormData()
    formData.append('file', file)
    
    if (name) {
      const metadata = JSON.stringify({
        name: name,
        keyvalues: {
          type: 'boomer-profile-image',
          timestamp: Date.now().toString()
        }
      })
      formData.append('pinataMetadata', metadata)
    }

    const options = JSON.stringify({
      cidVersion: 0,
    })
    formData.append('pinataOptions', options)

    try {
      const response = await fetch(`${this.pinataEndpoint}/pinning/pinFileToIPFS`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.details || 'Failed to upload to IPFS')
      }

      const data = await response.json()
      return {
        ipfsHash: data.IpfsHash,
        url: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`
      }
    } catch (error) {
      console.error('IPFS upload error:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to upload to IPFS')
    }
  }

  /**
   * Get file from IPFS
   */
  getFileUrl(ipfsHash: string): string {
    return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
  }

  /**
   * Test connection to Pinata
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.pinataEndpoint}/data/testAuthentication`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })
      return response.ok
    } catch {
      return false
    }
  }

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): Record<string, string> {
    if (this.pinataJWT) {
      return {
        'Authorization': `Bearer ${this.pinataJWT}`
      }
    } else {
      return {
        'pinata_api_key': this.pinataApiKey,
        'pinata_secret_api_key': this.pinataSecretKey
      }
    }
  }
}

// Create singleton instance
export const ipfsService = new IPFSService()

// Mock IPFS service for development/testing
class MockIPFSService {
  async uploadFile(file: File): Promise<IPFSUploadResponse> {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Generate a mock hash
    const mockHash = 'Qm' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    
    return {
      ipfsHash: mockHash,
      url: URL.createObjectURL(file) // Use blob URL for preview
    }
  }

  getFileUrl(ipfsHash: string): string {
    return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
  }

  async testConnection(): Promise<boolean> {
    return true
  }
}

// Export mock service for development
export const mockIPFSService = new MockIPFSService()

// Helper function to determine which service to use
export const getIPFSService = () => {
  const isDevelopment = import.meta.env.DEV
  const hasCredentials = import.meta.env.VITE_PINATA_JWT || import.meta.env.VITE_PINATA_API_KEY
  
  if (isDevelopment && !hasCredentials) {
    console.warn('Using mock IPFS service - configure Pinata credentials for real uploads')
    return mockIPFSService
  }
  
  return ipfsService
}