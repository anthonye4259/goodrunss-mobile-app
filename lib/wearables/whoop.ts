/**
 * WHOOP API Integration
 * 
 * Connects to WHOOP wearable via their API
 * Provides recovery score, strain, sleep, and HRV data
 * 
 * API Docs: https://developer.whoop.com/
 */

import {
  WearableService,
  WearableConnection,
  HealthMetrics,
  SleepData,
  WorkoutData,
} from './types'

// ===== WHOOP API CONFIGURATION =====
const WHOOP_API_BASE = 'https://api.prod.whoop.com/developer/v1'
const WHOOP_AUTH_URL = 'https://api.prod.whoop.com/oauth/oauth2/auth'
const WHOOP_TOKEN_URL = 'https://api.prod.whoop.com/oauth/oauth2/token'

// OAuth scopes needed
export const WHOOP_SCOPES = [
  'read:recovery',
  'read:cycles',
  'read:sleep',
  'read:workout',
  'read:profile',
  'read:body_measurement',
]

// ===== WHOOP API TYPES =====
interface WhoopRecovery {
  cycle_id: number
  sleep_id: number
  user_id: number
  created_at: string
  updated_at: string
  score_state: string
  score: {
    user_calibrating: boolean
    recovery_score: number      // 0-100
    resting_heart_rate: number  // bpm
    hrv_rmssd_milli: number     // HRV in milliseconds
    spo2_percentage?: number    // Blood oxygen
    skin_temp_celsius?: number  // Skin temperature
  }
}

interface WhoopSleep {
  id: number
  user_id: number
  created_at: string
  updated_at: string
  start: string
  end: string
  timezone_offset: string
  nap: boolean
  score_state: string
  score: {
    stage_summary: {
      total_in_bed_time_milli: number
      total_awake_time_milli: number
      total_no_data_time_milli: number
      total_light_sleep_time_milli: number
      total_slow_wave_sleep_time_milli: number
      total_rem_sleep_time_milli: number
      sleep_cycle_count: number
      disturbance_count: number
    }
    sleep_needed: {
      baseline_milli: number
      need_from_sleep_debt_milli: number
      need_from_recent_strain_milli: number
      need_from_recent_nap_milli: number
    }
    respiratory_rate: number
    sleep_performance_percentage: number
    sleep_consistency_percentage: number
    sleep_efficiency_percentage: number
  }
}

interface WhoopWorkout {
  id: number
  user_id: number
  created_at: string
  updated_at: string
  start: string
  end: string
  timezone_offset: string
  sport_id: number
  score_state: string
  score: {
    strain: number              // 0-21
    average_heart_rate: number
    max_heart_rate: number
    kilojoule: number
    percent_recorded: number
    distance_meter?: number
    altitude_gain_meter?: number
    altitude_change_meter?: number
    zone_duration: {
      zone_zero_milli: number
      zone_one_milli: number
      zone_two_milli: number
      zone_three_milli: number
      zone_four_milli: number
      zone_five_milli: number
    }
  }
}

// ===== WHOOP SERVICE =====
export class WhoopService implements WearableService {
  private connected: boolean = false
  private lastSync: Date | null = null
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private userId: string | null = null

  // ===== CONNECTION (OAuth 2.0) =====

  async connect(): Promise<boolean> {
    try {
      console.log('🟢 Initiating WHOOP OAuth flow...')
      
      // In production, this would:
      // 1. Open OAuth URL in browser/WebView
      // 2. User authorizes
      // 3. Receive auth code
      // 4. Exchange for access token
      
      // const authUrl = `${WHOOP_AUTH_URL}?` + new URLSearchParams({
      //   client_id: WHOOP_CLIENT_ID,
      //   redirect_uri: WHOOP_REDIRECT_URI,
      //   scope: WHOOP_SCOPES.join(' '),
      //   response_type: 'code',
      //   state: generateState(),
      // })
      // await Linking.openURL(authUrl)

      // Mock successful connection
      this.connected = true
      this.accessToken = 'mock_whoop_token'
      this.lastSync = new Date()
      
      console.log('✅ WHOOP connected successfully')
      return true
    } catch (error) {
      console.error('❌ Failed to connect to WHOOP:', error)
      this.connected = false
      return false
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false
    this.accessToken = null
    this.refreshToken = null
    this.userId = null
    this.lastSync = null
    console.log('🟢 WHOOP disconnected')
  }

  isConnected(): boolean {
    return this.connected
  }

  getConnectionStatus(): WearableConnection {
    return {
      provider: 'whoop',
      connected: this.connected,
      lastSynced: this.lastSync || undefined,
      userId: this.userId || undefined,
      accessToken: this.accessToken || undefined,
    }
  }

  // ===== DATA FETCHING =====

  async fetchHealthMetrics(date: Date = new Date()): Promise<HealthMetrics | null> {
    if (!this.connected) {
      console.warn('WHOOP not connected')
      return null
    }

    try {
      // In production:
      // const recovery = await this.fetchRecovery(date)
      // const sleep = await this.fetchSleepData(date)

      // Mock WHOOP data
      const metrics: HealthMetrics = {
        heartRateVariability: 52,
        restingHeartRate: 54,
        bloodOxygen: 97,
        
        sleepDuration: 7.2 * 60, // minutes
        sleepScore: 78,
        deepSleep: 85,
        remSleep: 95,
        lightSleep: 210,
        awakeTime: 42,
        sleepEfficiency: 88,
        
        recoveryScore: 72,      // WHOOP's key metric!
        strainScore: 12.5,      // WHOOP strain 0-21
        
        respiratoryRate: 14.2,
        
        date: date,
        syncedAt: new Date(),
      }

      this.lastSync = new Date()
      return metrics
    } catch (error) {
      console.error('Error fetching WHOOP metrics:', error)
      return null
    }
  }

  async fetchSleepData(date: Date = new Date()): Promise<SleepData | null> {
    if (!this.connected) return null

    try {
      // In production:
      // const response = await fetch(`${WHOOP_API_BASE}/activity/sleep`, {
      //   headers: { Authorization: `Bearer ${this.accessToken}` },
      // })
      // const data: WhoopSleep[] = await response.json()

      // Mock data
      const sleepData: SleepData = {
        id: `whoop-sleep-${date.toISOString()}`,
        startTime: new Date(date.setHours(22, 45, 0, 0)),
        endTime: new Date(date.setHours(6, 15, 0, 0)),
        duration: 450,
        score: 78,
        
        stages: {
          deep: 85,      // Slow wave sleep
          rem: 95,
          light: 210,
          awake: 42,
        },
        
        metrics: {
          efficiency: 88,
          latency: 15,
          restlessness: 12,
          respiratoryRate: 14.2,
          heartRate: {
            average: 52,
            min: 46,
            max: 68,
          },
          hrv: 52,
        },
        
        source: 'whoop',
      }

      return sleepData
    } catch (error) {
      console.error('Error fetching WHOOP sleep:', error)
      return null
    }
  }

  async fetchWorkouts(startDate: Date, endDate: Date): Promise<WorkoutData[]> {
    if (!this.connected) return []

    try {
      // In production:
      // const response = await fetch(`${WHOOP_API_BASE}/activity/workout`, {
      //   headers: { Authorization: `Bearer ${this.accessToken}` },
      // })

      // Mock data
      const workouts: WorkoutData[] = [
        {
          id: 'whoop-workout-1',
          type: 'Running',
          startTime: new Date(),
          endTime: new Date(),
          duration: 42,
          metrics: {
            calories: 520,
            distance: 7200,
            heartRate: {
              average: 158,
              max: 182,
            },
            strain: 14.2, // WHOOP strain score
          },
          source: 'whoop',
        },
      ]

      return workouts
    } catch (error) {
      console.error('Error fetching WHOOP workouts:', error)
      return []
    }
  }

  /**
   * Fetch WHOOP Recovery score (their main metric)
   */
  async fetchRecovery(date: Date = new Date()): Promise<WhoopRecovery | null> {
    if (!this.connected) return null

    try {
      // In production:
      // const response = await fetch(`${WHOOP_API_BASE}/recovery`, {
      //   headers: { Authorization: `Bearer ${this.accessToken}` },
      // })
      // return await response.json()

      // Mock recovery data
      return {
        cycle_id: 123456,
        sleep_id: 789012,
        user_id: 111222,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        score_state: 'SCORED',
        score: {
          user_calibrating: false,
          recovery_score: 72,
          resting_heart_rate: 54,
          hrv_rmssd_milli: 52,
          spo2_percentage: 97,
          skin_temp_celsius: 33.2,
        },
      }
    } catch (error) {
      console.error('Error fetching WHOOP recovery:', error)
      return null
    }
  }

  async syncAll(): Promise<void> {
    if (!this.connected) {
      throw new Error('WHOOP not connected')
    }

    console.log('🔄 Syncing all WHOOP data...')
    
    await this.fetchHealthMetrics()
    await this.fetchSleepData()
    await this.fetchRecovery()
    await this.fetchWorkouts(
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      new Date()
    )

    this.lastSync = new Date()
    console.log('✅ WHOOP sync complete')
  }

  getLastSyncTime(): Date | null {
    return this.lastSync
  }

  // ===== WHOOP-SPECIFIC METHODS =====

  /**
   * Get strain recommendation based on recovery
   */
  getStrainRecommendation(recoveryScore: number): {
    maxStrain: number
    recommendation: string
  } {
    if (recoveryScore >= 67) {
      return {
        maxStrain: 21,
        recommendation: 'Green - Go hard! Your body is ready for high strain.',
      }
    } else if (recoveryScore >= 34) {
      return {
        maxStrain: 14,
        recommendation: 'Yellow - Moderate strain OK. Listen to your body.',
      }
    } else {
      return {
        maxStrain: 8,
        recommendation: 'Red - Take it easy. Focus on recovery today.',
      }
    }
  }

  /**
   * Calculate if user is calibrating (first 4 days)
   */
  isCalibrating(): boolean {
    // In production, check user's WHOOP account age
    return false
  }
}

// Singleton instance
export const whoopService = new WhoopService()

export default WhoopService

