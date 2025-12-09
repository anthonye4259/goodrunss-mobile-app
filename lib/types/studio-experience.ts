/**
 * Studio & Experience Types
 * 
 * Types for studio profiles, vibe preferences, and equipment tracking
 */

// ============================================
// STUDIO PROFILE
// ============================================

export interface Studio {
    id: string
    name: string
    description?: string
    logoUrl?: string
    coverPhotoUrl?: string

    // Location
    address: string
    city: string
    state: string
    zipCode: string
    lat: number
    lon: number

    // Vibe & Atmosphere
    vibe: StudioVibe
    musicStyle: MusicStyle[]
    ambiance: AmbianceLevel

    // What they offer
    modalities: string[] // yoga, pilates_reformer, etc.
    amenities: StudioAmenity[]

    // Equipment (for reformer scarcity tracking)
    equipment: EquipmentInventory

    // ClassPass stance
    classPassStatus: "accepts" | "limited" | "never"
    directBookingOnly: boolean

    // Instructor roster
    instructorIds: string[]
    headInstructorId?: string

    // Ratings
    rating: number
    reviewCount: number

    // Pricing
    dropInPrice: number // cents
    membershipStartsAt?: number // cents/month

    // Hours
    hours: StudioHours

    // Metadata
    createdAt: Date
    updatedAt: Date
    isVerified: boolean
}

// ============================================
// VIBE & ATMOSPHERE
// ============================================

export type StudioVibe =
    | "calm_meditative"      // Soft, peaceful, zen
    | "energetic_upbeat"     // High energy, motivating
    | "intense_challenging"  // Push your limits
    | "community_social"     // Fun, group-focused
    | "boutique_luxe"        // Premium, spa-like
    | "no_frills_workout"    // Just here to sweat

export const VIBE_DISPLAY: Record<StudioVibe, { label: string; emoji: string; description: string }> = {
    calm_meditative: {
        label: "Calm & Meditative",
        emoji: "🧘",
        description: "Peaceful, zen atmosphere with soft music"
    },
    energetic_upbeat: {
        label: "Energetic & Upbeat",
        emoji: "🔥",
        description: "High energy with motivating instructors"
    },
    intense_challenging: {
        label: "Intense & Challenging",
        emoji: "💪",
        description: "Push your limits, no easy days"
    },
    community_social: {
        label: "Community & Social",
        emoji: "👥",
        description: "Fun, social vibe with group energy"
    },
    boutique_luxe: {
        label: "Boutique Luxe",
        emoji: "✨",
        description: "Premium experience, spa-like amenities"
    },
    no_frills_workout: {
        label: "No Frills Workout",
        emoji: "🏋️",
        description: "Focus on the workout, not the extras"
    },
}

export type MusicStyle =
    | "edm_house"
    | "hip_hop_rnb"
    | "pop_top40"
    | "indie_alternative"
    | "classical_instrumental"
    | "lo_fi_chill"
    | "rock_metal"
    | "latin_reggaeton"
    | "no_music"

export const MUSIC_DISPLAY: Record<MusicStyle, { label: string; emoji: string }> = {
    edm_house: { label: "EDM / House", emoji: "🎧" },
    hip_hop_rnb: { label: "Hip Hop / R&B", emoji: "🎤" },
    pop_top40: { label: "Pop / Top 40", emoji: "🎵" },
    indie_alternative: { label: "Indie / Alternative", emoji: "🎸" },
    classical_instrumental: { label: "Classical / Instrumental", emoji: "🎻" },
    lo_fi_chill: { label: "Lo-Fi / Chill", emoji: "🌙" },
    rock_metal: { label: "Rock / Metal", emoji: "🤘" },
    latin_reggaeton: { label: "Latin / Reggaeton", emoji: "💃" },
    no_music: { label: "No Music / Silent", emoji: "🤫" },
}

export type AmbianceLevel = "dim_candlelit" | "bright_energizing" | "natural_light" | "club_vibes"

export const AMBIANCE_DISPLAY: Record<AmbianceLevel, { label: string; emoji: string }> = {
    dim_candlelit: { label: "Dim & Candlelit", emoji: "🕯️" },
    bright_energizing: { label: "Bright & Energizing", emoji: "☀️" },
    natural_light: { label: "Natural Light", emoji: "🌿" },
    club_vibes: { label: "Club Vibes", emoji: "🪩" },
}

// ============================================
// AMENITIES
// ============================================

export type StudioAmenity =
    | "showers"
    | "lockers"
    | "towels"
    | "mat_rental"
    | "water_station"
    | "retail_shop"
    | "smoothie_bar"
    | "sauna"
    | "cold_plunge"
    | "parking"
    | "childcare"

export const AMENITY_DISPLAY: Record<StudioAmenity, { label: string; emoji: string }> = {
    showers: { label: "Showers", emoji: "🚿" },
    lockers: { label: "Lockers", emoji: "🔐" },
    towels: { label: "Towels Provided", emoji: "🧺" },
    mat_rental: { label: "Mat Rental", emoji: "🧘" },
    water_station: { label: "Water Station", emoji: "💧" },
    retail_shop: { label: "Retail Shop", emoji: "🛍️" },
    smoothie_bar: { label: "Smoothie Bar", emoji: "🥤" },
    sauna: { label: "Sauna", emoji: "🧖" },
    cold_plunge: { label: "Cold Plunge", emoji: "🧊" },
    parking: { label: "Parking", emoji: "🅿️" },
    childcare: { label: "Childcare", emoji: "👶" },
}

// ============================================
// EQUIPMENT TRACKING (Reformer Scarcity)
// ============================================

export interface EquipmentInventory {
    reformers: number
    megaformers: number
    mats: number
    bikes: number
    treadmills: number
    rowers: number

    // Real-time availability
    reformersAvailableNow?: number
    lastUpdated?: Date
}

export interface ReformerAvailability {
    studioId: string
    classId: string
    totalReformers: number
    bookedReformers: number
    availableReformers: number
    waitlistCount: number

    // Demand tracking
    averageWaitlistSize: number // historical
    bookedOutDays: number // how many days in advance it books out
    demandLevel: "low" | "medium" | "high" | "extreme"
}

/**
 * Get demand level text
 */
export function getDemandText(level: ReformerAvailability["demandLevel"]): { text: string; color: string } {
    switch (level) {
        case "low":
            return { text: "Usually available", color: "#22C55E" }
        case "medium":
            return { text: "Book 1-2 days ahead", color: "#FBBF24" }
        case "high":
            return { text: "Book 3+ days ahead", color: "#F97316" }
        case "extreme":
            return { text: "Waitlist common", color: "#EF4444" }
    }
}

// ============================================
// STUDIO HOURS
// ============================================

export interface StudioHours {
    monday: DayHours
    tuesday: DayHours
    wednesday: DayHours
    thursday: DayHours
    friday: DayHours
    saturday: DayHours
    sunday: DayHours
}

export interface DayHours {
    isOpen: boolean
    openTime?: string // "06:00"
    closeTime?: string // "21:00"
}

// ============================================
// USER VIBE PREFERENCES
// ============================================

export interface UserVibePreferences {
    preferredVibes: StudioVibe[]
    preferredMusic: MusicStyle[]
    preferredAmbiance: AmbianceLevel[]

    // Dealbreakers
    mustHaveAmenities: StudioAmenity[]
    avoidAmenities?: StudioAmenity[]

    // ClassPass stance
    avoidClassPassStudios: boolean // "I want studios that don't use ClassPass"
}

// ============================================
// INSTRUCTOR VIBE (extends instructor profile)
// ============================================

export interface InstructorVibe {
    teachingStyle: TeachingStyle
    musicPreference: MusicStyle[]
    energyLevel: "calm" | "moderate" | "high" | "intense"
    motivationStyle: "encouraging" | "tough_love" | "technical" | "spiritual"
    classSize: "intimate" | "medium" | "large"
}

export type TeachingStyle =
    | "hands_on_adjustments"
    | "verbal_cues_only"
    | "demo_focused"
    | "flow_minimal_talking"
    | "detailed_alignment"

export const TEACHING_STYLE_DISPLAY: Record<TeachingStyle, string> = {
    hands_on_adjustments: "Hands-on Adjustments",
    verbal_cues_only: "Verbal Cues Only",
    demo_focused: "Demo-focused",
    flow_minimal_talking: "Flow (Minimal Talking)",
    detailed_alignment: "Detailed Alignment",
}

// ============================================
// ANTI-CLASSPASS FEATURES
// ============================================

export interface StudioClassPassSettings {
    // Studios that hate ClassPass can use these
    acceptsClassPass: boolean
    classPassLimit?: number // Max ClassPass spots per class
    classPassBlackoutTimes?: string[] // "5:30 PM", "6:00 PM" - prime times blocked
    preferDirectBooking: boolean
    directBookingDiscount?: number // Percent discount for direct vs ClassPass

    // Badge display
    showNoClassPassBadge: boolean // Proudly display "No ClassPass"
}

/**
 * Check if studio should show "No ClassPass" badge
 */
export function shouldShowNoClassPassBadge(settings: StudioClassPassSettings): boolean {
    return !settings.acceptsClassPass && settings.showNoClassPassBadge
}

// ============================================
// VIBE MATCHING
// ============================================

/**
 * Calculate vibe match score between user preferences and studio/instructor
 */
export function calculateVibeMatch(
    userPrefs: UserVibePreferences,
    studioVibe: StudioVibe,
    studioMusic: MusicStyle[],
    studioAmbiance: AmbianceLevel
): number {
    let score = 0
    let maxScore = 0

    // Vibe match (40% weight)
    maxScore += 40
    if (userPrefs.preferredVibes.includes(studioVibe)) {
        score += 40
    }

    // Music match (30% weight)
    maxScore += 30
    const musicMatches = userPrefs.preferredMusic.filter(m => studioMusic.includes(m)).length
    if (userPrefs.preferredMusic.length > 0) {
        score += (musicMatches / userPrefs.preferredMusic.length) * 30
    }

    // Ambiance match (20% weight)
    maxScore += 20
    if (userPrefs.preferredAmbiance.includes(studioAmbiance)) {
        score += 20
    }

    // ClassPass preference (10% weight)
    maxScore += 10
    // This would need studio data to calculate

    return Math.round((score / maxScore) * 100)
}

export function getVibeMatchLabel(score: number): { label: string; emoji: string; color: string } {
    if (score >= 90) return { label: "Perfect Match", emoji: "💯", color: "#22C55E" }
    if (score >= 70) return { label: "Great Match", emoji: "✨", color: "#7ED957" }
    if (score >= 50) return { label: "Good Match", emoji: "👍", color: "#FBBF24" }
    if (score >= 30) return { label: "Okay Match", emoji: "🤷", color: "#F97316" }
    return { label: "Not Your Vibe", emoji: "😕", color: "#EF4444" }
}
