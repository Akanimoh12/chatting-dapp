import { useAccount } from 'wagmi'
import { usePriceOracle, usePriceIntegration } from '../../hooks/usePriceOracle'

interface PriceDisplayProps {
  className?: string
}

export function PriceDisplay({ className = '' }: PriceDisplayProps) {
  const { chainId } = useAccount()
  const currentChainId = chainId || 11155111 // Default to Sepolia
  
  const { 
    individualPrices, 
    isLoading: pricesLoading,
    refetchPrices 
  } = usePriceOracle(currentChainId)
  
  const { 
    integrationStatus
  } = usePriceIntegration(currentChainId)

  if (pricesLoading) {
    return (
      <div className={`p-3 ${className}`}>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex justify-between items-center">
                <div className="h-4 bg-white/20 rounded w-16"></div>
                <div className="h-4 bg-white/20 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!individualPrices.length) {
    return (
      <div className={`p-3 ${className}`}>
        <div className="text-center text-blue-200 text-sm">
          <div className="mb-2">🔗</div>
          <div>Switch to Sepolia</div>
          <div>to view prices</div>
        </div>
      </div>
    )
  }

  const formatPercentageChange = (change: number) => {
    const sign = change >= 0 ? '+' : ''
    const color = change >= 0 ? 'text-green-400' : 'text-red-400'
    return (
      <span className={`${color} font-bold text-xs`}>
        {sign}{change.toFixed(2)}%
      </span>
    )
  }

  const getPairIcon = (pair: string) => {
    switch (pair) {
      case 'BTC/USD': return '₿'
      case 'ETH/USD': return 'Ξ'
      case 'BTC/ETH': return '₿/Ξ'
      case 'BNB/ETH': return '🟡'
      default: return '💰'
    }
  }

  const formatPrice = (priceData: any) => {
    const price = parseFloat(priceData.formattedPrice)
    if (price > 1000) {
      return `$${(price / 1000).toFixed(1)}K`
    }
    return `$${price.toFixed(2)}`
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-white font-bold text-sm tracking-wide">
          💹 LIVE PRICES
        </h4>
        <button
          onClick={() => refetchPrices()}
          className="text-blue-300 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
          title="Refresh Prices"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {/* Price Cards */}
      <div className="space-y-2">
        {individualPrices.map((priceData) => (
          <div 
            key={priceData.pair} 
            className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 hover:bg-white/15 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg" title={priceData.pair}>
                  {getPairIcon(priceData.pair)}
                </span>
                <div>
                  <div className="text-white font-bold text-sm">
                    {priceData.pair.split('/')[0]}
                  </div>
                  <div className="text-blue-200 text-xs">
                    /{priceData.pair.split('/')[1]}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-white font-bold text-sm">
                  {priceData.pair.includes('ETH') && !priceData.pair.includes('USD') 
                    ? `${parseFloat(priceData.formattedPrice).toFixed(4)} ETH`
                    : formatPrice(priceData)
                  }
                </div>
                <div>
                  {formatPercentageChange(priceData.percentageChange)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Automation Status */}
      {integrationStatus && (
        <div className="mt-3 pt-3 border-t border-white/20">
          <div className="flex items-center justify-between">
            <span className="text-blue-200 text-xs font-medium">Automation</span>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                integrationStatus.alertsEnabled && integrationStatus.botRegistered 
                  ? 'bg-green-400' 
                  : 'bg-yellow-400'
              }`}></div>
              <span className="text-xs text-blue-200">
                {integrationStatus.alertsEnabled && integrationStatus.botRegistered 
                  ? 'Active' 
                  : 'Setup'
                }
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Last Update */}
      <div className="text-center text-blue-300 text-xs mt-2 opacity-75">
        Updated via Chainlink Oracles
      </div>
    </div>
  )
}