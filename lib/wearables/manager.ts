/**
 * Wearables Manager
 * 
 * Unified interface for managing all wearable integrations
 * Combines data from Apple Watch, WHOOP, and Oura
 */

import { appleHealthService, AppleHealthService } from './apple-health'
import { whoopService, WhoopService } from './whoop'
import { ouraService, OuraService } from './oura'
import {
  WearableProvider,
  WearableConnection,
  HealthMetrics,
  SleepData,
  WorkoutData,
  RecoveryCalculation,
} from './types'

// ===== WEARABLES MANAGER =====
export class WearablesManager {
  private appleHealth: AppleHealthService
  private whoop: WhoopService
  private oura: OuraService

  constructor() {
    this.appleHealth = appleHealthService
    this.whoop = whoopService
    this.oura = ouraService
  }

  // ===== CONNECTION MANAGEMENT =====

  /**
   * Connect a specific wearable
   */
  async connect(provider: WearableProvider): Promise<boolean> {
    switch (provider) {
      case 'apple_watch':
        return this.appleHealth.connect()
      case 'whoop':
        return this.whoop.connect()
      case 'oura':
        return this.oura.connect()
      default:
        console.warn(`Provider ${provider} not supported yet`)
        return false
    }
  }

  /**
   * Disconnect a specific wearable
   */
  async disconnect(provider: WearableProvider): Promise<void> {
    switch (provider) {
      case 'apple_watch':
        return this.appleHealth.disconnect()
      case 'whoop':
        return this.whoop.disconnect()
      case 'oura':
        return this.oura.disconnect()
    }
  }

  /**
   * Get all connected wearables
   */
  getConnectedWearables(): WearableConnection[] {
    const connections: WearableConnection[] = []

    if (this.appleHealth.isConnected()) {
      connections.push(this.appleHealth.getConnectionStatus())
    }
    if (this.whoop.isConnected()) {
      connections.push(this.whoop.getConnectionStatus())
    }
    if (this.oura.isConnected()) {
      connections.push(this.oura.getConnectionStatus())
    }

    return connections
  }

  /**
   * Check if any wearable is connected
   */
  hasConnectedWearable(): boolean {
    return (
      this.appleHealth.isConnected() ||
      this.whoop.isConnected() ||
      this.oura.isConnected()
    )
  }

  /**
   * Check if a specific wearable is connected
   */
  isConnected(provider: WearableProvider): boolean {
    switch (provider) {
      case 'apple_watch':
        return this.appleHealth.isConnected()
      case 'whoop':
        return this.whoop.isConnected()
      case 'oura':
        return this.oura.isConnected()
      default:
        return false
    }
  }

  // ===== DATA FETCHING =====

  /**
   * Fetch health metrics from all connected wearables
   */
  async fetchAllMetrics(date: Date = new Date()): Promise<HealthMetrics[]> {
    const metrics: HealthMetrics[] = []

    if (this.appleHealth.isConnected()) {
      const data = await this.appleHealth.fetchHealthMetrics(date)
      if (data) metrics.push(data)
    }

    if (this.whoop.isConnected()) {
      const data = await this.whoop.fetchHealthMetrics(date)
      if (data) metrics.push(data)
    }

    if (this.oura.isConnected()) {
      const data = await this.oura.fetchHealthMetrics(date)
      if (data) metrics.push(data)
    }

    return metrics
  }

  /**
   * Fetch merged health metrics (combines data from all sources)
   */
  async fetchMergedMetrics(date: Date = new Date()): Promise<HealthMetrics | null> {
    const allMetrics = await this.fetchAllMetrics(date)
    
    if (allMetrics.length === 0) return null

    // Merge metrics (prioritize in order: WHOOP, Oura, Apple)
    const merged: HealthMetrics = {
      date,
      syncedAt: new Date(),
    }

    for (const metrics of allMetrics.reverse()) { // Reverse for priority
      Object.keys(metrics).forEach(key => {
        if (metrics[key as keyof HealthMetrics] !== undefined) {
          (merged as any)[key] = metrics[key as keyof HealthMetrics]
        }
      })
    }

    return merged
  }

  /**
   * Fetch sleep data from all connected wearables
   */
  async fetchAllSleepData(date: Date = new Date()): Promise<SleepData[]> {
    const sleepData: SleepData[] = []

    if (this.appleHealth.isConnected()) {
      const data = await this.appleHealth.fetchSleepData(date)
      if (data) sleepData.push(data)
    }

    if (this.whoop.isConnected()) {
      const data = await this.whoop.fetchSleepData(date)
      if (data) sleepData.push(data)
    }

    if (this.oura.isConnected()) {
      const data = await this.oura.fetchSleepData(date)
      if (data) sleepData.push(data)
    }

    return sleepData
  }

  /**
   * Fetch workouts from all sources
   */
  async fetchAllWorkouts(startDate: Date, endDate: Date): Promise<WorkoutData[]> {
    const workouts: WorkoutData[] = []

    if (this.appleHealth.isConnected()) {
      const data = await this.appleHealth.fetchWorkouts(startDate, endDate)
      workouts.push(...data)
    }

    if (this.whoop.isConnected()) {
      const data = await this.whoop.fetchWorkouts(startDate, endDate)
      workouts.push(...data)
    }

    if (this.oura.isConnected()) {
      const data = await this.oura.fetchWorkouts(startDate, endDate)
      workouts.push(...data)
    }

    // Sort by start time
    return workouts.sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    )
  }

  // ===== RECOVERY CALCULATION =====

  /**
   * Calculate unified recovery score from all wearable data
   */
  async calculateRecoveryScore(date: Date = new Date()): Promise<RecoveryCalculation> {
    const metrics = await this.fetchMergedMetrics(date)
    const sleepData = await this.fetchAllSleepData(date)
    const connectedWearables = this.getConnectedWearables()

    let overallScore = 50 // Base score

    const components = {
      hrv: 50,
      restingHR: 50,
      sleep: 50,
      sleepConsistency: 50,
      activity: 50,
    }

    if (metrics) {
      // HRV Score (higher is better)
      if (metrics.heartRateVariability) {
        components.hrv = Math.min(100, (metrics.heartRateVariability / 80) * 100)
      }

      // Resting HR Score (lower is better, 40-80 range)
      if (metrics.restingHeartRate) {
        components.restingHR = Math.max(0, 100 - ((metrics.restingHeartRate - 40) / 40) * 100)
      }

      // Sleep Score
      if (metrics.sleepScore) {
        components.sleep = metrics.sleepScore
      } else if (metrics.sleepDuration) {
        // 7-9 hours is ideal
        const hours = metrics.sleepDuration / 60
        if (hours >= 7 && hours <= 9) {
          components.sleep = 90
        } else if (hours >= 6 && hours <= 10) {
          components.sleep = 70
        } else {
          components.sleep = 50
        }
      }

      // Activity Score (use existing recovery/readiness if available)
      if (metrics.recoveryScore) {
        components.activity = metrics.recoveryScore
      } else if (metrics.readinessScore) {
        components.activity = metrics.readinessScore
      }
    }

    // Calculate overall score (weighted average)
    overallScore = Math.round(
      components.hrv * 0.25 +
      components.restingHR * 0.15 +
      components.sleep * 0.35 +
      components.sleepConsistency * 0.1 +
      components.activity * 0.15
    )

    // Determine trend (would need historical data in production)
    const trend: 'improving' | 'stable' | 'declining' = 'stable'

    // Generate recommendation
    let recommendation: 'rest' | 'light' | 'moderate' | 'intense'
    if (overallScore >= 80) {
      recommendation = 'intense'
    } else if (overallScore >= 60) {
      recommendation = 'moderate'
    } else if (overallScore >= 40) {
      recommendation = 'light'
    } else {
      recommendation = 'rest'
    }

    return {
      overallScore,
      components,
      trend,
      recommendation,
      calculatedAt: new Date(),
      dataSource: connectedWearables.map(c => c.provider),
    }
  }

  // ===== SYNC ALL =====

  /**
   * Sync all connected wearables
   */
  async syncAll(): Promise<void> {
    console.log('🔄 Syncing all wearables...')

    const promises: Promise<void>[] = []

    if (this.appleHealth.isConnected()) {
      promises.push(this.appleHealth.syncAll())
    }
    if (this.whoop.isConnected()) {
      promises.push(this.whoop.syncAll())
    }
    if (this.oura.isConnected()) {
      promises.push(this.oura.syncAll())
    }

    await Promise.all(promises)
    console.log('✅ All wearables synced')
  }
}

// Singleton instance
export const wearablesManager = new WearablesManager()

export default WearablesManager







