/**
 * Wellness Instructor Types
 * 
 * Type definitions for the instructor following system
 */

// ============================================
// INSTRUCTOR
// ============================================

export interface Instructor {
    id: string
    userId: string // Firebase Auth UID
    displayName: string
    tagline: string // AI-generated: "Vinyasa Queen"
    bio: string
    photoUrl: string
    coverPhotoUrl?: string

    // What they teach
    modalities: InstructorModality[]
    primaryModality: InstructorModality

    // Where they teach
    studios: string[] // Studio IDs
    studioNames: string[] // Denormalized for display

    // Ratings
    rating: number // 1-5
    reviewCount: number

    // Following
    followerCount: number

    // Private sessions
    privateSessionsEnabled: boolean
    hourlyRate?: number // in cents
    availability?: AvailabilitySlot[]
    locationOptions?: ("instructor" | "client" | "virtual")[]
    instantBook: boolean

    // Payments
    stripeAccountId?: string
    stripeOnboarded: boolean

    // Metadata
    createdAt: Date
    updatedAt: Date

    // Location (for search)
    location?: {
        city: string
        state: string
        lat: number
        lon: number
    }
}

export type InstructorModality =
    | "yoga"
    | "pilates_mat"
    | "pilates_reformer"
    | "barre"
    | "meditation"
    | "hiit"
    | "strength"
    | "cycling"
    | "dance"
    | "boxing"
    | "other"

export const MODALITY_DISPLAY_NAMES: Record<InstructorModality, string> = {
    yoga: "Yoga",
    pilates_mat: "Pilates (Mat)",
    pilates_reformer: "Pilates (Reformer)",
    barre: "Barre",
    meditation: "Meditation",
    hiit: "HIIT",
    strength: "Strength Training",
    cycling: "Cycling",
    dance: "Dance",
    boxing: "Boxing",
    other: "Other",
}

export interface AvailabilitySlot {
    dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6 // 0 = Sunday
    startHour: number // 0-23
    endHour: number
}

// ============================================
// FOLLOW RELATIONSHIP
// ============================================

export interface Follow {
    id: string
    clientId: string // User following
    instructorId: string // Instructor being followed
    createdAt: Date
    notificationsEnabled: boolean // Get push for new classes
}

// ============================================
// WELLNESS CLASS
// ============================================

export interface WellnessClass {
    id: string
    instructorId: string
    studioId?: string // null for pop-ups

    // Basic info
    title: string
    description?: string
    modality: InstructorModality

    // Schedule
    startTime: Date
    duration: number // minutes
    isRecurring: boolean
    recurrenceRule?: string // RRULE format

    // Capacity
    capacity: number
    bookedCount: number
    waitlistCount: number
    isFull: boolean

    // Pricing
    price: number // in cents, 0 = free
    isPaid: boolean

    // Location
    locationType: "studio" | "outdoor" | "virtual" | "private"
    address?: string
    virtualLink?: string

    // Denormalized for queries
    instructorName: string
    instructorPhotoUrl: string
    studioName?: string

    // Metadata
    createdAt: Date
    updatedAt: Date
    status: "upcoming" | "in_progress" | "completed" | "cancelled"
}

// ============================================
// WAITLIST
// ============================================

export interface WaitlistEntry {
    id: string
    classId: string
    clientId: string
    position: number
    createdAt: Date
    autoBook: boolean // Auto-confirm if spot opens
    notified: boolean // Has been notified of opening
    notifiedAt?: Date
}

// ============================================
// PRIVATE BOOKING
// ============================================

export interface PrivateBooking {
    id: string
    instructorId: string
    clientId: string

    // Schedule
    startTime: Date
    duration: number // minutes

    // Location
    locationType: "instructor" | "client" | "virtual"
    address?: string
    virtualLink?: string
    notes?: string

    // Payment
    totalAmount: number // cents
    instructorPayout: number // 85%
    platformFee: number // 15%
    paymentIntentId: string
    paymentStatus: "pending" | "paid" | "refunded"

    // Status
    status: "pending" | "confirmed" | "completed" | "cancelled"
    confirmedAt?: Date
    cancelledAt?: Date
    cancellationReason?: string

    // Metadata
    createdAt: Date
    updatedAt: Date
}

// ============================================
// HELPERS
// ============================================

export function getModalityEmoji(modality: InstructorModality): string {
    const emojis: Record<InstructorModality, string> = {
        yoga: "🧘",
        pilates_mat: "🤸",
        pilates_reformer: "💪",
        barre: "🩰",
        meditation: "🧘‍♀️",
        hiit: "🔥",
        strength: "🏋️",
        cycling: "🚴",
        dance: "💃",
        boxing: "🥊",
        other: "✨",
    }
    return emojis[modality] || "✨"
}

export function formatHourlyRate(cents: number): string {
    return `$${(cents / 100).toFixed(0)}/hr`
}
