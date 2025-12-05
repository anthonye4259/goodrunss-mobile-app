/**
 * useWearables Hook
 * 
 * React hook for managing wearable connections and data
 */

import { useState, useEffect, useCallback } from 'react'
import { wearablesManager } from '../wearables/manager'
import {
  WearableProvider,
  WearableConnection,
  HealthMetrics,
  SleepData,
  RecoveryCalculation,
} from '../wearables/types'

// ===== HOOK RETURN TYPE =====
interface UseWearablesReturn {
  // Connection state
  connections: WearableConnection[]
  hasConnectedWearable: boolean
  isConnecting: boolean
  
  // Data
  healthMetrics: HealthMetrics | null
  sleepData: SleepData | null
  recoveryScore: RecoveryCalculation | null
  
  // Actions
  connect: (provider: WearableProvider) => Promise<boolean>
  disconnect: (provider: WearableProvider) => Promise<void>
  refresh: () => Promise<void>
  
  // Status
  isLoading: boolean
  error: Error | null
  lastSynced: Date | null
}

// ===== HOOK =====
export function useWearables(): UseWearablesReturn {
  const [connections, setConnections] = useState<WearableConnection[]>([])
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics | null>(null)
  const [sleepData, setSleepData] = useState<SleepData | null>(null)
  const [recoveryScore, setRecoveryScore] = useState<RecoveryCalculation | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [lastSynced, setLastSynced] = useState<Date | null>(null)

  // Check connections on mount
  useEffect(() => {
    updateConnections()
  }, [])

  // Update connection list
  const updateConnections = useCallback(() => {
    const connectedWearables = wearablesManager.getConnectedWearables()
    setConnections(connectedWearables)
  }, [])

  // Connect to a wearable
  const connect = useCallback(async (provider: WearableProvider): Promise<boolean> => {
    setIsConnecting(true)
    setError(null)

    try {
      const success = await wearablesManager.connect(provider)
      updateConnections()
      
      if (success) {
        // Auto-fetch data after connecting
        await refresh()
      }
      
      return success
    } catch (err) {
      setError(err as Error)
      return false
    } finally {
      setIsConnecting(false)
    }
  }, [])

  // Disconnect from a wearable
  const disconnect = useCallback(async (provider: WearableProvider): Promise<void> => {
    try {
      await wearablesManager.disconnect(provider)
      updateConnections()
    } catch (err) {
      setError(err as Error)
    }
  }, [])

  // Refresh all data
  const refresh = useCallback(async (): Promise<void> => {
    if (!wearablesManager.hasConnectedWearable()) return

    setIsLoading(true)
    setError(null)

    try {
      // Sync all wearables
      await wearablesManager.syncAll()

      // Fetch merged metrics
      const metrics = await wearablesManager.fetchMergedMetrics()
      setHealthMetrics(metrics)

      // Fetch sleep data (get most recent)
      const allSleep = await wearablesManager.fetchAllSleepData()
      if (allSleep.length > 0) {
        setSleepData(allSleep[0])
      }

      // Calculate recovery score
      const recovery = await wearablesManager.calculateRecoveryScore()
      setRecoveryScore(recovery)

      setLastSynced(new Date())
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    connections,
    hasConnectedWearable: wearablesManager.hasConnectedWearable(),
    isConnecting,
    healthMetrics,
    sleepData,
    recoveryScore,
    connect,
    disconnect,
    refresh,
    isLoading,
    error,
    lastSynced,
  }
}

// ===== CONVENIENCE HOOKS =====

/**
 * Hook for just recovery score
 */
export function useRecoveryScore(): {
  score: RecoveryCalculation | null
  isLoading: boolean
  refresh: () => Promise<void>
} {
  const { recoveryScore, isLoading, refresh } = useWearables()
  
  return {
    score: recoveryScore,
    isLoading,
    refresh,
  }
}

/**
 * Hook for checking if a specific wearable is connected
 */
export function useWearableConnection(provider: WearableProvider): {
  isConnected: boolean
  connect: () => Promise<boolean>
  disconnect: () => Promise<void>
  isConnecting: boolean
} {
  const { connections, connect, disconnect, isConnecting } = useWearables()
  
  const isConnected = connections.some(c => c.provider === provider && c.connected)
  
  return {
    isConnected,
    connect: () => connect(provider),
    disconnect: () => disconnect(provider),
    isConnecting,
  }
}

export default useWearables








