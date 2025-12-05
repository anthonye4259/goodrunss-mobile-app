/**
 * Oura Ring API Integration
 * 
 * Connects to Oura Ring via their API
 * Provides readiness score, sleep analysis, and activity data
 * 
 * API Docs: https://cloud.ouraring.com/docs/
 */

import {
  WearableService,
  WearableConnection,
  HealthMetrics,
  SleepData,
  WorkoutData,
} from './types'

// ===== OURA API CONFIGURATION =====
const OURA_API_BASE = 'https://api.ouraring.com/v2'
const OURA_AUTH_URL = 'https://cloud.ouraring.com/oauth/authorize'
const OURA_TOKEN_URL = 'https://api.ouraring.com/oauth/token'

// OAuth scopes
export const OURA_SCOPES = [
  'daily',
  'personal',
  'heartrate',
  'workout',
  'session',
]

// ===== OURA API TYPES =====
interface OuraReadiness {
  id: string
  day: string
  score: number                    // 0-100 Readiness score
  temperature_deviation: number    // Celsius from baseline
  temperature_trend_deviation: number
  contributors: {
    activity_balance: number
    body_temperature: number
    hrv_balance: number
    previous_day_activity: number
    previous_night: number
    recovery_index: number
    resting_heart_rate: number
    sleep_balance: number
  }
}

interface OuraSleep {
  id: string
  day: string
  score: number                    // 0-100 Sleep score
  bedtime_start: string
  bedtime_end: string
  time_in_bed: number              // seconds
  total_sleep_duration: number     // seconds
  awake_time: number               // seconds
  light_sleep_duration: number     // seconds
  rem_sleep_duration: number       // seconds
  deep_sleep_duration: number      // seconds
  restless_periods: number
  efficiency: number               // percentage
  latency: number                  // seconds to fall asleep
  average_heart_rate: number
  lowest_heart_rate: number
  average_hrv: number
  respiratory_rate: number
  contributors: {
    deep_sleep: number
    efficiency: number
    latency: number
    rem_sleep: number
    restfulness: number
    timing: number
    total_sleep: number
  }
}

interface OuraActivity {
  id: string
  day: string
  score: number                    // 0-100 Activity score
  active_calories: number
  total_calories: number
  steps: number
  equivalent_walking_distance: number  // meters
  high_activity_met_minutes: number
  medium_activity_met_minutes: number
  low_activity_met_minutes: number
  sedentary_met_minutes: number
  target_calories: number
  target_meters: number
  contributors: {
    meet_daily_targets: number
    move_every_hour: number
    recovery_time: number
    stay_active: number
    training_frequency: number
    training_volume: number
  }
}

interface OuraHeartRate {
  bpm: number
  source: string
  timestamp: string
}

// ===== OURA SERVICE =====
export class OuraService implements WearableService {
  private connected: boolean = false
  private lastSync: Date | null = null
  private accessToken: string | null = null
  private refreshToken: string | null = null

  // ===== CONNECTION (OAuth 2.0) =====

  async connect(): Promise<boolean> {
    try {
      console.log('💍 Initiating Oura OAuth flow...')
      
      // In production:
      // 1. Open OAuth URL
      // 2. User authorizes
      // 3. Exchange code for token

      // Mock successful connection
      this.connected = true
      this.accessToken = 'mock_oura_token'
      this.lastSync = new Date()
      
      console.log('✅ Oura Ring connected successfully')
      return true
    } catch (error) {
      console.error('❌ Failed to connect to Oura:', error)
      this.connected = false
      return false
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false
    this.accessToken = null
    this.refreshToken = null
    this.lastSync = null
    console.log('💍 Oura Ring disconnected')
  }

  isConnected(): boolean {
    return this.connected
  }

  getConnectionStatus(): WearableConnection {
    return {
      provider: 'oura',
      connected: this.connected,
      lastSynced: this.lastSync || undefined,
      accessToken: this.accessToken || undefined,
    }
  }

  // ===== DATA FETCHING =====

  async fetchHealthMetrics(date: Date = new Date()): Promise<HealthMetrics | null> {
    if (!this.connected) {
      console.warn('Oura not connected')
      return null
    }

    try {
      const dateStr = date.toISOString().split('T')[0]
      
      // In production:
      // const readiness = await this.fetchReadiness(dateStr)
      // const sleep = await this.fetchSleepData(date)
      // const activity = await this.fetchActivity(dateStr)

      // Mock Oura data
      const metrics: HealthMetrics = {
        heartRateVariability: 48,
        restingHeartRate: 56,
        
        sleepDuration: 7.8 * 60, // minutes
        sleepScore: 85,
        deepSleep: 95,
        remSleep: 110,
        lightSleep: 240,
        awakeTime: 23,
        sleepEfficiency: 92,
        
        steps: 9245,
        activeCalories: 485,
        totalCalories: 2280,
        
        readinessScore: 78,     // Oura's key metric!
        
        bodyTemperature: -0.2,  // Deviation from baseline
        respiratoryRate: 13.8,
        
        date: date,
        syncedAt: new Date(),
      }

      this.lastSync = new Date()
      return metrics
    } catch (error) {
      console.error('Error fetching Oura metrics:', error)
      return null
    }
  }

  async fetchSleepData(date: Date = new Date()): Promise<SleepData | null> {
    if (!this.connected) return null

    try {
      const dateStr = date.toISOString().split('T')[0]
      
      // In production:
      // const response = await fetch(`${OURA_API_BASE}/usercollection/sleep?start_date=${dateStr}&end_date=${dateStr}`, {
      //   headers: { Authorization: `Bearer ${this.accessToken}` },
      // })

      // Mock data
      const sleepData: SleepData = {
        id: `oura-sleep-${dateStr}`,
        startTime: new Date(date.setHours(22, 30, 0, 0)),
        endTime: new Date(date.setHours(6, 45, 0, 0)),
        duration: 495, // 8.25 hours
        score: 85,
        
        stages: {
          deep: 95,
          rem: 110,
          light: 240,
          awake: 23,
        },
        
        metrics: {
          efficiency: 92,
          latency: 8,
          restlessness: 8,
          respiratoryRate: 13.8,
          heartRate: {
            average: 54,
            min: 46,
            max: 65,
          },
          hrv: 48,
        },
        
        source: 'oura',
      }

      return sleepData
    } catch (error) {
      console.error('Error fetching Oura sleep:', error)
      return null
    }
  }

  async fetchWorkouts(startDate: Date, endDate: Date): Promise<WorkoutData[]> {
    if (!this.connected) return []

    try {
      // In production:
      // const response = await fetch(`${OURA_API_BASE}/usercollection/workout`, {
      //   headers: { Authorization: `Bearer ${this.accessToken}` },
      // })

      // Mock data
      const workouts: WorkoutData[] = [
        {
          id: 'oura-workout-1',
          type: 'Running',
          startTime: new Date(),
          endTime: new Date(),
          duration: 38,
          metrics: {
            calories: 420,
            distance: 6100,
            heartRate: {
              average: 155,
              max: 178,
            },
          },
          source: 'oura',
        },
      ]

      return workouts
    } catch (error) {
      console.error('Error fetching Oura workouts:', error)
      return []
    }
  }

  /**
   * Fetch Oura Readiness score (their key metric)
   */
  async fetchReadiness(date: string): Promise<OuraReadiness | null> {
    if (!this.connected) return null

    try {
      // In production:
      // const response = await fetch(`${OURA_API_BASE}/usercollection/daily_readiness?start_date=${date}&end_date=${date}`, {
      //   headers: { Authorization: `Bearer ${this.accessToken}` },
      // })

      // Mock readiness data
      return {
        id: `readiness-${date}`,
        day: date,
        score: 78,
        temperature_deviation: -0.2,
        temperature_trend_deviation: 0.1,
        contributors: {
          activity_balance: 82,
          body_temperature: 90,
          hrv_balance: 75,
          previous_day_activity: 80,
          previous_night: 85,
          recovery_index: 72,
          resting_heart_rate: 78,
          sleep_balance: 80,
        },
      }
    } catch (error) {
      console.error('Error fetching Oura readiness:', error)
      return null
    }
  }

  /**
   * Fetch Oura Activity data
   */
  async fetchActivity(date: string): Promise<OuraActivity | null> {
    if (!this.connected) return null

    try {
      // Mock activity data
      return {
        id: `activity-${date}`,
        day: date,
        score: 85,
        active_calories: 485,
        total_calories: 2280,
        steps: 9245,
        equivalent_walking_distance: 7200,
        high_activity_met_minutes: 25,
        medium_activity_met_minutes: 45,
        low_activity_met_minutes: 180,
        sedentary_met_minutes: 540,
        target_calories: 500,
        target_meters: 8000,
        contributors: {
          meet_daily_targets: 90,
          move_every_hour: 75,
          recovery_time: 85,
          stay_active: 80,
          training_frequency: 85,
          training_volume: 78,
        },
      }
    } catch (error) {
      console.error('Error fetching Oura activity:', error)
      return null
    }
  }

  async syncAll(): Promise<void> {
    if (!this.connected) {
      throw new Error('Oura not connected')
    }

    console.log('🔄 Syncing all Oura data...')
    
    const today = new Date().toISOString().split('T')[0]
    
    await this.fetchHealthMetrics()
    await this.fetchSleepData()
    await this.fetchReadiness(today)
    await this.fetchActivity(today)
    await this.fetchWorkouts(
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      new Date()
    )

    this.lastSync = new Date()
    console.log('✅ Oura sync complete')
  }

  getLastSyncTime(): Date | null {
    return this.lastSync
  }

  // ===== OURA-SPECIFIC METHODS =====

  /**
   * Interpret readiness score for recommendations
   */
  getReadinessRecommendation(readinessScore: number): {
    status: 'optimal' | 'good' | 'pay_attention' | 'rest'
    recommendation: string
  } {
    if (readinessScore >= 85) {
      return {
        status: 'optimal',
        recommendation: 'Excellent! Your body is well-recovered. Great day for intense training.',
      }
    } else if (readinessScore >= 70) {
      return {
        status: 'good',
        recommendation: 'Good recovery. Normal training is fine today.',
      }
    } else if (readinessScore >= 60) {
      return {
        status: 'pay_attention',
        recommendation: 'Pay attention to how you feel. Consider lighter activity.',
      }
    } else {
      return {
        status: 'rest',
        recommendation: 'Rest recommended. Focus on sleep and recovery.',
      }
    }
  }

  /**
   * Check body temperature for illness detection
   */
  checkTemperature(deviation: number): {
    status: 'normal' | 'elevated' | 'warning'
    message: string
  } {
    if (Math.abs(deviation) <= 0.5) {
      return { status: 'normal', message: 'Body temperature is normal.' }
    } else if (deviation > 0.5 && deviation < 1.0) {
      return { status: 'elevated', message: 'Slightly elevated. Monitor how you feel.' }
    } else {
      return { status: 'warning', message: 'Temperature deviation detected. Consider rest.' }
    }
  }
}

// Singleton instance
export const ouraService = new OuraService()

export default OuraService








