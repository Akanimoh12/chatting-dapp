import { useReadContract, useReadContracts, useWatchContractEvent } from 'wagmi'
import { useState } from 'react'
import { 
  getPriceOracleAddresses, 
  PRICE_ORACLE_ABI, 
  PRICE_INTEGRATION_ABI 
} from '../config/contracts'

export interface PriceData {
  pair: string
  price: string
  timestamp: number
  decimals: number
  percentageChange: number
  formattedPrice: string
}

export interface AllPricesData {
  btcUsd: string
  ethUsd: string
  btcEth: string
  bnbEth: string
  lastUpdate: number
}

export function usePriceOracle(chainId: number) {
  const [priceUpdates, setPriceUpdates] = useState<PriceData[]>([])
  const addresses = getPriceOracleAddresses(chainId)

  console.log('usePriceOracle - chainId:', chainId) // Debug log
  console.log('usePriceOracle - addresses:', addresses) // Debug log

  // Get all current prices
  const { data: allPrices, isLoading: pricesLoading, refetch: refetchPrices } = useReadContract({
    address: addresses?.chainlinkPriceOracle as `0x${string}`,
    abi: PRICE_ORACLE_ABI,
    functionName: 'getAllPrices',
    query: {
      enabled: !!addresses,
    }
  })

  // Get individual price data for supported pairs
  const pairs = ['BTC/USD', 'ETH/USD', 'BTC/ETH', 'BNB/ETH']
  
  const { data: individualPrices, isLoading: individualLoading } = useReadContracts({
    contracts: addresses ? pairs.flatMap(pair => [
      {
        address: addresses.chainlinkPriceOracle as `0x${string}`,
        abi: PRICE_ORACLE_ABI,
        functionName: 'getLatestPrice',
        args: [pair],
      },
      {
        address: addresses.chainlinkPriceOracle as `0x${string}`,
        abi: PRICE_ORACLE_ABI,
        functionName: 'getPriceChangePercentage',
        args: [pair],
      },
      {
        address: addresses.chainlinkPriceOracle as `0x${string}`,
        abi: PRICE_ORACLE_ABI,
        functionName: 'getFormattedPrice',
        args: [pair],
      }
    ]) : [],
    query: {
      enabled: !!addresses,
    }
  })

  // Watch for price update events
  useWatchContractEvent({
    address: addresses?.chainlinkPriceOracle as `0x${string}`,
    abi: PRICE_ORACLE_ABI,
    eventName: 'PriceUpdated',
    enabled: !!addresses,
    onLogs(logs) {
      logs.forEach((log) => {
        const { pairName, newPrice, percentageChange, timestamp } = log.args
        if (pairName && newPrice && timestamp) {
          const newUpdate: PriceData = {
            pair: pairName,
            price: newPrice.toString(),
            timestamp: Number(timestamp),
            decimals: 8, // Default for most Chainlink feeds
            percentageChange: Number(percentageChange) / 100, // Convert from basis points
            formattedPrice: formatPrice(newPrice, 8)
          }
          
          setPriceUpdates(prev => [newUpdate, ...prev.slice(0, 9)]) // Keep last 10 updates
        }
      })
    },
  })

  // Process individual price data
  const processedPrices: PriceData[] = []
  if (individualPrices && !individualLoading) {
    for (let i = 0; i < pairs.length; i++) {
      const priceIndex = i * 3
      const changeIndex = i * 3 + 1
      const formattedIndex = i * 3 + 2
      
      const priceResult = individualPrices[priceIndex]
      const changeResult = individualPrices[changeIndex]
      const formattedResult = individualPrices[formattedIndex]
      
      if (priceResult?.result && changeResult?.result && formattedResult?.result) {
        const priceData = priceResult.result as unknown as [bigint, bigint, number]
        const [price, timestamp, decimals] = priceData
        const percentageChange = changeResult.result as unknown as bigint
        const formattedPrice = formattedResult.result as unknown as string
        
        processedPrices.push({
          pair: pairs[i],
          price: price.toString(),
          timestamp: Number(timestamp),
          decimals,
          percentageChange: Number(percentageChange) / 100, // Convert from basis points
          formattedPrice
        })
      }
    }
  }

  return {
    allPrices: allPrices as [bigint, bigint, bigint, bigint, bigint] | undefined,
    individualPrices: processedPrices,
    priceUpdates,
    isLoading: pricesLoading || individualLoading,
    refetchPrices,
  }
}

export function usePriceIntegration(chainId: number) {
  const addresses = getPriceOracleAddresses(chainId)

  // Get integration status
  const { data: integrationStatus, isLoading: statusLoading, refetch: refetchStatus } = useReadContract({
    address: addresses?.priceChatIntegration as `0x${string}`,
    abi: PRICE_INTEGRATION_ABI,
    functionName: 'getIntegrationStatus',
    query: {
      enabled: !!addresses,
    }
  })

  // Watch for price alert events
  const [alertHistory, setAlertHistory] = useState<Array<{
    pair: string
    priceChange: number
    newPrice: string
    timestamp: number
  }>>([])

  useWatchContractEvent({
    address: addresses?.priceChatIntegration as `0x${string}`,
    abi: PRICE_INTEGRATION_ABI,
    eventName: 'PriceAlertPosted',
    enabled: !!addresses,
    onLogs(logs) {
      logs.forEach((log) => {
        const { pairName, priceChange, newPrice } = log.args
        if (pairName && priceChange && newPrice) {
          const alert = {
            pair: pairName,
            priceChange: Number(priceChange) / 100, // Convert from basis points
            newPrice: newPrice.toString(),
            timestamp: Date.now()
          }
          
          setAlertHistory(prev => [alert, ...prev.slice(0, 19)]) // Keep last 20 alerts
        }
      })
    },
  })

  const status = integrationStatus as [boolean, boolean, boolean, bigint, bigint] | undefined

  return {
    integrationStatus: status ? {
      alertsEnabled: status[0],
      summariesEnabled: status[1],
      botRegistered: status[2],
      minInterval: Number(status[3]),
      lastSummary: Number(status[4])
    } : undefined,
    alertHistory,
    isLoading: statusLoading,
    refetchStatus,
  }
}

// Utility function to format price
function formatPrice(price: bigint, decimals: number): string {
  const divisor = BigInt(10 ** decimals)
  const wholePart = price / divisor
  const fractionalPart = price % divisor
  
  if (fractionalPart === 0n) {
    return wholePart.toString()
  }
  
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0')
  return `${wholePart}.${fractionalStr.replace(/0+$/, '')}`
}

// Custom hook for price display formatting
export function useFormattedPrice(price: string | bigint, decimals: number = 8) {
  return formatPrice(typeof price === 'string' ? BigInt(price) : price, decimals)
}