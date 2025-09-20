import { useReadContract } from 'wagmi'
import { PRICE_ORACLE_ABI } from '../../config/contracts'

export function SimplePriceTest() {
  const { data: prices, isLoading, error } = useReadContract({
    address: '0x4B001ec1F48dAE2883Fa2Dba87bE7ADc66F1B3f7',
    abi: PRICE_ORACLE_ABI,
    functionName: 'getAllPrices',
    chainId: 11155111, // Sepolia
  })

  console.log('SimplePriceTest - Loading:', isLoading)
  console.log('SimplePriceTest - Error:', error)
  console.log('SimplePriceTest - Prices:', prices)

  if (isLoading) {
    return <div className="text-white p-4">Loading prices...</div>
  }

  if (error) {
    return (
      <div className="text-red-400 p-4">
        <p>Error loading prices:</p>
        <p className="text-xs">{error.message}</p>
      </div>
    )
  }

  if (prices) {
    const [btcUsd, ethUsd, btcEth, bnbEth, lastUpdate] = prices as [bigint, bigint, bigint, bigint, bigint]
    
    return (
      <div className="text-white p-4 space-y-2">
        <h3 className="font-bold">Live Crypto Prices</h3>
        <div className="text-sm space-y-1">
          <p>BTC/USD: ${(Number(btcUsd) / 1e8).toLocaleString()}</p>
          <p>ETH/USD: ${(Number(ethUsd) / 1e8).toLocaleString()}</p>
          <p>BTC/ETH: {(Number(btcEth) / 1e18).toFixed(2)} ETH</p>
          <p>BNB/ETH: ${(Number(bnbEth) / 1e8).toLocaleString()}</p>
          <p className="text-xs text-gray-400">
            Last Update: {new Date(Number(lastUpdate) * 1000).toLocaleTimeString()}
          </p>
        </div>
      </div>
    )
  }

  return <div className="text-gray-400 p-4">No price data available</div>
}