/**
 * Wearable Integration Types
 * 
 * Common types for Apple Watch, Whoop, and Oura integrations
 */

// ===== WEARABLE PROVIDERS =====
export type WearableProvider = 'apple_watch' | 'whoop' | 'oura' | 'fitbit' | 'garmin'

// ===== CONNECTION STATUS =====
export interface WearableConnection {
  provider: WearableProvider
  connected: boolean
  lastSynced?: Date
  userId?: string
  accessToken?: string
  refreshToken?: string
  expiresAt?: Date
}

// ===== HEALTH METRICS =====
export interface HealthMetrics {
  // Heart
  heartRate?: number              // Current or resting HR (bpm)
  restingHeartRate?: number       // Resting HR (bpm)
  heartRateVariability?: number   // HRV in milliseconds
  
  // Sleep
  sleepDuration?: number          // Total sleep in minutes
  sleepScore?: number             // 0-100 score
  deepSleep?: number              // Deep sleep minutes
  remSleep?: number               // REM sleep minutes
  lightSleep?: number             // Light sleep minutes
  awakeTime?: number              // Time awake in minutes
  sleepEfficiency?: number        // Percentage
  
  // Activity
  steps?: number
  activeCalories?: number
  totalCalories?: number
  exerciseMinutes?: number
  standHours?: number
  distance?: number               // In meters
  
  // Recovery
  recoveryScore?: number          // 0-100 (Whoop/Oura style)
  strainScore?: number            // 0-21 (Whoop style)
  readinessScore?: number         // 0-100 (Oura style)
  
  // Body
  bodyTemperature?: number        // Celsius deviation from baseline
  respiratoryRate?: number        // Breaths per minute
  bloodOxygen?: number            // SpO2 percentage
  
  // Timestamps
  date: Date
  syncedAt: Date
}

// ===== SLEEP DATA =====
export interface SleepData {
  id: string
  startTime: Date
  endTime: Date
  duration: number                // Minutes
  score?: number                  // 0-100
  
  stages?: {
    deep: number                  // Minutes
    rem: number
    light: number
    awake: number
  }
  
  metrics?: {
    efficiency?: number           // Percentage
    latency?: number              // Time to fall asleep (minutes)
    restlessness?: number         // Movement score
    respiratoryRate?: number
    heartRate?: {
      average: number
      min: number
      max: number
    }
    hrv?: number
  }
  
  source: WearableProvider
}

// ===== WORKOUT DATA =====
export interface WorkoutData {
  id: string
  type: string                    // Running, Cycling, Strength, etc.
  startTime: Date
  endTime: Date
  duration: number                // Minutes
  
  metrics?: {
    calories?: number
    distance?: number             // Meters
    heartRate?: {
      average: number
      max: number
    }
    strain?: number               // Whoop style
    pace?: number                 // Minutes per km
  }
  
  source: WearableProvider
}

// ===== RECOVERY CALCULATION =====
export interface RecoveryCalculation {
  overallScore: number            // 0-100
  
  components: {
    hrv: number                   // 0-100
    restingHR: number             // 0-100 (lower is better)
    sleep: number                 // 0-100
    sleepConsistency: number      // 0-100
    activity: number              // 0-100 (balanced is best)
  }
  
  trend: 'improving' | 'stable' | 'declining'
  recommendation: 'rest' | 'light' | 'moderate' | 'intense'
  
  calculatedAt: Date
  dataSource: WearableProvider[]
}

// ===== WEARABLE SERVICE INTERFACE =====
export interface WearableService {
  // Connection
  connect(): Promise<boolean>
  disconnect(): Promise<void>
  isConnected(): boolean
  getConnectionStatus(): WearableConnection
  
  // Data Fetching
  fetchHealthMetrics(date?: Date): Promise<HealthMetrics | null>
  fetchSleepData(date?: Date): Promise<SleepData | null>
  fetchWorkouts(startDate: Date, endDate: Date): Promise<WorkoutData[]>
  
  // Sync
  syncAll(): Promise<void>
  getLastSyncTime(): Date | null
}

// ===== DISPLAY NAMES =====
export const WEARABLE_DISPLAY_NAMES: Record<WearableProvider, string> = {
  apple_watch: 'Apple Watch',
  whoop: 'WHOOP',
  oura: 'Oura Ring',
  fitbit: 'Fitbit',
  garmin: 'Garmin',
}

export const WEARABLE_COLORS: Record<WearableProvider, string> = {
  apple_watch: '#FF2D55',
  whoop: '#00DC5A',
  oura: '#C4A052',
  fitbit: '#00B0B9',
  garmin: '#007CC3',
}







