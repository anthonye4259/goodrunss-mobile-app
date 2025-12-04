/**
 * GoodRunss Injury Prevention & Recovery Types
 * 
 * Comprehensive type system for the trillion-dollar recovery industry
 */

// ===== BODY PARTS =====
export type BodyPart =
  // Upper Body
  | "neck"
  | "shoulder_left"
  | "shoulder_right"
  | "upper_back"
  | "lower_back"
  | "chest"
  | "bicep_left"
  | "bicep_right"
  | "tricep_left"
  | "tricep_right"
  | "forearm_left"
  | "forearm_right"
  | "wrist_left"
  | "wrist_right"
  | "elbow_left"
  | "elbow_right"
  // Core
  | "abs"
  | "obliques"
  | "hip_left"
  | "hip_right"
  | "glutes"
  // Lower Body
  | "quad_left"
  | "quad_right"
  | "hamstring_left"
  | "hamstring_right"
  | "groin"
  | "it_band_left"
  | "it_band_right"
  | "knee_left"
  | "knee_right"
  | "calf_left"
  | "calf_right"
  | "shin_left"
  | "shin_right"
  | "ankle_left"
  | "ankle_right"
  | "foot_left"
  | "foot_right"
  | "achilles_left"
  | "achilles_right"

// ===== INJURY TYPES =====
export type InjuryType =
  | "strain"           // Muscle pull
  | "sprain"           // Ligament injury
  | "tendinitis"       // Tendon inflammation
  | "bursitis"         // Bursa inflammation
  | "fracture"         // Bone break
  | "dislocation"      // Joint displacement
  | "contusion"        // Bruise
  | "overuse"          // Repetitive strain
  | "soreness"         // General muscle soreness
  | "tightness"        // Muscle tightness
  | "inflammation"     // General inflammation
  | "other"

// ===== SEVERITY LEVELS =====
export type Severity = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

// ===== RECOVERY MODALITIES =====
export type RecoveryModality =
  | "stretching"
  | "foam_rolling"
  | "massage"
  | "ice"
  | "heat"
  | "compression"
  | "elevation"
  | "rest"
  | "active_recovery"
  | "sleep"
  | "hydration"
  | "nutrition"
  | "supplements"
  | "cryotherapy"
  | "sauna"
  | "contrast_therapy"
  | "physical_therapy"
  | "chiropractic"
  | "acupuncture"
  | "cupping"
  | "tens"
  | "percussion"  // Massage gun
  | "compression_boots"

// ===== WARMUP TYPES =====
export type WarmupType =
  | "dynamic_stretch"
  | "static_stretch"
  | "activation"
  | "mobility"
  | "cardio"
  | "sport_specific"

// ===== EXERCISE INTERFACES =====
export interface Exercise {
  id: string
  name: string
  description: string
  instructions: string[]
  targetBodyParts: BodyPart[]
  duration?: number          // seconds
  reps?: number
  sets?: number
  imageUrl?: string
  videoUrl?: string
  difficulty: "beginner" | "intermediate" | "advanced"
  equipment?: string[]
  tips?: string[]
  commonMistakes?: string[]
}

export interface WarmupRoutine {
  id: string
  name: string
  description: string
  sport?: string           // e.g., "basketball", "tennis", "running"
  type: WarmupType
  duration: number         // total minutes
  exercises: WarmupExercise[]
  targetBodyParts: BodyPart[]
  difficulty: "beginner" | "intermediate" | "advanced"
  imageUrl?: string
  videoUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface WarmupExercise extends Exercise {
  order: number
  restAfter?: number       // seconds
}

export interface RecoveryRoutine {
  id: string
  name: string
  description: string
  sport?: string
  activityType?: string    // e.g., "strength", "cardio", "hiit"
  duration: number         // total minutes
  exercises: RecoveryExercise[]
  modalities: RecoveryModality[]
  targetBodyParts: BodyPart[]
  bestTimeToPerform: "immediately_after" | "2_hours_after" | "next_morning" | "rest_day"
  imageUrl?: string
  videoUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface RecoveryExercise extends Exercise {
  order: number
  holdDuration?: number    // seconds for static stretches
  restAfter?: number
}

// ===== SORENESS TRACKING =====
export interface SorenessEntry {
  id: string
  userId: string
  date: Date
  bodyParts: SorenessBodyPart[]
  overallSoreness: Severity
  notes?: string
  relatedActivity?: string
  sleepQuality?: Severity
  energyLevel?: Severity
  stressLevel?: Severity
  createdAt: Date
}

export interface SorenessBodyPart {
  bodyPart: BodyPart
  severity: Severity
  type: "soreness" | "tightness" | "pain" | "injury"
  notes?: string
}

// ===== INJURY TRACKING =====
export interface InjuryEntry {
  id: string
  userId: string
  bodyPart: BodyPart
  injuryType: InjuryType
  severity: Severity
  dateOccurred: Date
  dateRecovered?: Date
  status: "active" | "recovering" | "recovered" | "chronic"
  description: string
  howItHappened?: string
  treatment?: string[]
  notes?: string
  doctorVisited?: boolean
  physicalTherapy?: boolean
  createdAt: Date
  updatedAt: Date
}

// ===== RECOVERY SCORE =====
export interface RecoveryScore {
  id: string
  userId: string
  date: Date
  overallScore: number     // 0-100
  components: {
    sleep: number          // 0-100
    soreness: number       // 0-100 (inverted - less soreness = higher)
    hrv?: number           // 0-100
    restingHR?: number     // 0-100
    activity: number       // 0-100 (balanced activity)
    hydration?: number     // 0-100
    nutrition?: number     // 0-100
    stress?: number        // 0-100 (inverted - less stress = higher)
  }
  recommendation: RecoveryRecommendation
  createdAt: Date
}

export interface RecoveryRecommendation {
  intensity: "rest" | "light" | "moderate" | "high"
  message: string
  suggestedActivities: string[]
  suggestedRecovery: RecoveryModality[]
  warnings?: string[]
}

// ===== PREVENTION ASSESSMENT =====
export interface InjuryRiskAssessment {
  id: string
  userId: string
  date: Date
  sport: string
  overallRisk: "low" | "moderate" | "high"
  riskScore: number        // 0-100
  riskFactors: RiskFactor[]
  recommendations: string[]
  preventionPlan?: PreventionPlan
  createdAt: Date
}

export interface RiskFactor {
  factor: string
  description: string
  severity: "low" | "moderate" | "high"
  bodyParts?: BodyPart[]
  recommendation: string
}

export interface PreventionPlan {
  id: string
  userId: string
  startDate: Date
  endDate?: Date
  dailyRoutines: DailyRoutine[]
  weeklyGoals: string[]
  focusAreas: BodyPart[]
  notes?: string
}

export interface DailyRoutine {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6
  warmupRoutineId?: string
  recoveryRoutineId?: string
  mobilityRoutineId?: string
  notes?: string
}

// ===== RECOVERY FACILITIES =====
export type RecoveryFacilityType =
  | "physical_therapy"
  | "sports_medicine"
  | "chiropractic"
  | "massage_therapy"
  | "acupuncture"
  | "cryotherapy"
  | "sauna_spa"
  | "recovery_studio"
  | "athletic_training"

export interface RecoveryFacility {
  id: string
  name: string
  facilityType: RecoveryFacilityType
  address: string
  city: string
  state: string
  zipCode: string
  lat: number
  lng: number
  phoneNumber?: string
  website?: string
  rating?: number
  reviewCount?: number
  services: string[]
  specialties: string[]
  insuranceAccepted?: string[]
  pricing?: {
    consultation?: number
    session?: number
    package?: number
    currency: string
  }
  hours?: {
    dayOfWeek: number
    openTime: string
    closeTime: string
  }[]
  images: string[]
  verified: boolean
  googlePlaceId?: string
  createdAt: Date
  updatedAt: Date
}

// ===== RECOVERY PROFESSIONAL =====
export type RecoveryProfessionalType =
  | "physical_therapist"
  | "sports_medicine_doctor"
  | "orthopedist"
  | "chiropractor"
  | "massage_therapist"
  | "athletic_trainer"
  | "acupuncturist"
  | "sports_psychologist"

export interface RecoveryProfessional {
  id: string
  name: string
  title: string
  professionalType: RecoveryProfessionalType
  credentials: string[]
  specialties: string[]
  bio: string
  yearsExperience: number
  facilityId?: string
  facilityName?: string
  rating?: number
  reviewCount?: number
  insuranceAccepted?: string[]
  pricing?: {
    consultation?: number
    session?: number
    currency: string
  }
  availability?: {
    dayOfWeek: number
    slots: string[]
  }[]
  imageUrl?: string
  verified: boolean
  createdAt: Date
  updatedAt: Date
}

// ===== WEARABLE INTEGRATION =====
export interface WearableRecoveryData {
  userId: string
  date: Date
  source: "apple_watch" | "whoop" | "oura" | "fitbit" | "garmin" | "polar"
  metrics: {
    hrv?: number            // Heart Rate Variability (ms)
    restingHR?: number      // Resting Heart Rate (bpm)
    sleepScore?: number     // 0-100
    sleepDuration?: number  // minutes
    deepSleepDuration?: number
    remSleepDuration?: number
    respiratoryRate?: number
    bodyTemperature?: number
    bloodOxygen?: number
    strain?: number         // Whoop-style strain score
    calories?: number
    activeCalories?: number
    steps?: number
  }
  rawData?: any
  syncedAt: Date
}

// ===== DISPLAY NAMES =====
export const BODY_PART_DISPLAY_NAMES: Record<BodyPart, string> = {
  neck: "Neck",
  shoulder_left: "Left Shoulder",
  shoulder_right: "Right Shoulder",
  upper_back: "Upper Back",
  lower_back: "Lower Back",
  chest: "Chest",
  bicep_left: "Left Bicep",
  bicep_right: "Right Bicep",
  tricep_left: "Left Tricep",
  tricep_right: "Right Tricep",
  forearm_left: "Left Forearm",
  forearm_right: "Right Forearm",
  wrist_left: "Left Wrist",
  wrist_right: "Right Wrist",
  elbow_left: "Left Elbow",
  elbow_right: "Right Elbow",
  abs: "Abs",
  obliques: "Obliques",
  hip_left: "Left Hip",
  hip_right: "Right Hip",
  glutes: "Glutes",
  quad_left: "Left Quad",
  quad_right: "Right Quad",
  hamstring_left: "Left Hamstring",
  hamstring_right: "Right Hamstring",
  groin: "Groin",
  it_band_left: "Left IT Band",
  it_band_right: "Right IT Band",
  knee_left: "Left Knee",
  knee_right: "Right Knee",
  calf_left: "Left Calf",
  calf_right: "Right Calf",
  shin_left: "Left Shin",
  shin_right: "Right Shin",
  ankle_left: "Left Ankle",
  ankle_right: "Right Ankle",
  foot_left: "Left Foot",
  foot_right: "Right Foot",
  achilles_left: "Left Achilles",
  achilles_right: "Right Achilles",
}

export const RECOVERY_MODALITY_DISPLAY_NAMES: Record<RecoveryModality, string> = {
  stretching: "Stretching",
  foam_rolling: "Foam Rolling",
  massage: "Massage",
  ice: "Ice/Cold Therapy",
  heat: "Heat Therapy",
  compression: "Compression",
  elevation: "Elevation",
  rest: "Rest",
  active_recovery: "Active Recovery",
  sleep: "Sleep",
  hydration: "Hydration",
  nutrition: "Nutrition",
  supplements: "Supplements",
  cryotherapy: "Cryotherapy",
  sauna: "Sauna",
  contrast_therapy: "Contrast Therapy",
  physical_therapy: "Physical Therapy",
  chiropractic: "Chiropractic",
  acupuncture: "Acupuncture",
  cupping: "Cupping",
  tens: "TENS",
  percussion: "Percussion (Massage Gun)",
  compression_boots: "Compression Boots",
}

export const INJURY_TYPE_DISPLAY_NAMES: Record<InjuryType, string> = {
  strain: "Muscle Strain",
  sprain: "Ligament Sprain",
  tendinitis: "Tendinitis",
  bursitis: "Bursitis",
  fracture: "Fracture",
  dislocation: "Dislocation",
  contusion: "Contusion (Bruise)",
  overuse: "Overuse Injury",
  soreness: "Muscle Soreness",
  tightness: "Muscle Tightness",
  inflammation: "Inflammation",
  other: "Other",
}

// ===== SPORT-SPECIFIC INJURY RISK AREAS =====
export const SPORT_INJURY_RISK_AREAS: Record<string, BodyPart[]> = {
  basketball: ["ankle_left", "ankle_right", "knee_left", "knee_right", "lower_back", "shoulder_left", "shoulder_right"],
  tennis: ["shoulder_right", "elbow_right", "wrist_right", "knee_left", "knee_right", "lower_back", "ankle_left", "ankle_right"],
  running: ["knee_left", "knee_right", "shin_left", "shin_right", "achilles_left", "achilles_right", "hip_left", "hip_right", "it_band_left", "it_band_right"],
  swimming: ["shoulder_left", "shoulder_right", "neck", "lower_back", "knee_left", "knee_right"],
  soccer: ["ankle_left", "ankle_right", "knee_left", "knee_right", "groin", "hamstring_left", "hamstring_right", "quad_left", "quad_right"],
  golf: ["lower_back", "shoulder_left", "elbow_left", "wrist_left", "hip_left", "knee_left"],
  yoga: ["lower_back", "hip_left", "hip_right", "shoulder_left", "shoulder_right", "wrist_left", "wrist_right", "hamstring_left", "hamstring_right"],
  weightlifting: ["lower_back", "shoulder_left", "shoulder_right", "knee_left", "knee_right", "wrist_left", "wrist_right", "elbow_left", "elbow_right"],
  crossfit: ["lower_back", "shoulder_left", "shoulder_right", "knee_left", "knee_right", "wrist_left", "wrist_right", "ankle_left", "ankle_right"],
  cycling: ["knee_left", "knee_right", "lower_back", "neck", "wrist_left", "wrist_right", "hip_left", "hip_right"],
}

// ===== RECOVERY RECOMMENDATIONS BY ACTIVITY =====
export const ACTIVITY_RECOVERY_RECOMMENDATIONS: Record<string, {
  modalities: RecoveryModality[]
  duration: number
  focus: BodyPart[]
}> = {
  basketball: {
    modalities: ["stretching", "foam_rolling", "ice", "hydration", "sleep"],
    duration: 15,
    focus: ["ankle_left", "ankle_right", "knee_left", "knee_right", "calf_left", "calf_right", "quad_left", "quad_right"],
  },
  tennis: {
    modalities: ["stretching", "foam_rolling", "ice", "massage", "hydration"],
    duration: 20,
    focus: ["shoulder_right", "forearm_right", "lower_back", "calf_left", "calf_right"],
  },
  running: {
    modalities: ["stretching", "foam_rolling", "compression", "hydration", "nutrition"],
    duration: 15,
    focus: ["quad_left", "quad_right", "hamstring_left", "hamstring_right", "calf_left", "calf_right", "it_band_left", "it_band_right"],
  },
  swimming: {
    modalities: ["stretching", "foam_rolling", "heat", "massage"],
    duration: 10,
    focus: ["shoulder_left", "shoulder_right", "upper_back", "lower_back"],
  },
  yoga: {
    modalities: ["stretching", "rest", "hydration"],
    duration: 5,
    focus: ["hip_left", "hip_right", "lower_back"],
  },
  weightlifting: {
    modalities: ["stretching", "foam_rolling", "nutrition", "sleep", "active_recovery"],
    duration: 15,
    focus: ["chest", "upper_back", "lower_back", "quad_left", "quad_right", "hamstring_left", "hamstring_right"],
  },
}







