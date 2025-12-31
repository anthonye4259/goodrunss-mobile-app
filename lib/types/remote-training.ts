/**
 * Remote Training Types
 * 
 * Data models for the remote training marketplace:
 * - Video Analysis
 * - Live Sessions
 * - Training Plans
 * - Form Check Subscriptions
 * - Match Prep
 * - Mental Game Coaching
 */

// ============================================
// REMOTE SERVICE TYPES
// ============================================

export type RemoteServiceType =
    | "video_analysis"
    | "live_session"
    | "training_plan"
    | "form_check_subscription"
    | "match_prep"
    | "mental_game"

export interface RemoteService {
    id: string
    trainerId: string
    type: RemoteServiceType
    name: string
    description: string
    price: number // Trainer sets their own
    currency: string // USD, EUR, GBP, AED
    duration?: number // minutes (for live sessions)
    deliveryTime?: string // "24-48 hours" (for async)
    sessionsIncluded?: number // for subscriptions (e.g., 5 videos/month)
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export const SERVICE_TYPE_LABELS: Record<RemoteServiceType, string> = {
    video_analysis: "Video Analysis",
    live_session: "Live Session",
    training_plan: "Training Plan",
    form_check_subscription: "Form Check Subscription",
    match_prep: "Match Prep",
    mental_game: "Mental Game Coaching",
}

export const SERVICE_TYPE_ICONS: Record<RemoteServiceType, string> = {
    video_analysis: "videocam",
    live_session: "video",
    training_plan: "document-text",
    form_check_subscription: "repeat",
    match_prep: "clipboard",
    mental_game: "brain",
}

export const SERVICE_TYPE_COLORS: Record<RemoteServiceType, string> = {
    video_analysis: "#3B82F6",
    live_session: "#22C55E",
    training_plan: "#F59E0B",
    form_check_subscription: "#8B5CF6",
    match_prep: "#EF4444",
    mental_game: "#EC4899",
}

// ============================================
// REMOTE BOOKING TYPES
// ============================================

export type RemoteBookingStatus =
    | "pending_payment"
    | "pending_upload"      // Player needs to upload video
    | "pending_review"      // Coach reviewing video
    | "in_progress"         // For live sessions or ongoing plans
    | "feedback_sent"       // Coach sent feedback
    | "completed"
    | "cancelled"
    | "refunded"

export interface RemoteBooking {
    id: string
    serviceId: string
    service: RemoteService
    playerId: string
    trainerId: string
    status: RemoteBookingStatus
    scheduledAt?: string // For live sessions
    playerVideoUrl?: string // Uploaded video for analysis
    coachFeedbackUrl?: string // Coach's feedback video
    coachFeedbackText?: string // Written feedback
    meetingUrl?: string // Zoom/Daily.co link for live sessions
    notes?: string // Player notes for coach
    createdAt: string
    updatedAt: string
    completedAt?: string
}

// ============================================
// ENHANCED TRAINER PROFILE
// ============================================

export type Language =
    | "English"
    | "Spanish"
    | "French"
    | "Portuguese"
    | "Arabic"
    | "German"
    | "Italian"
    | "Mandarin"
    | "Japanese"
    | "Korean"
    | "Russian"
    | "Dutch"

export interface TrainerInternationalProfile {
    // International Features
    languagesSpoken: Language[]
    timezone: string
    isInternationalTrainer: boolean
    destinationProfile?: {
        tagline: string // "Train with me in Dubai"
        aboutLocation: string // Why train here
        localTips?: string // Insider tips for visiting players
    }

    // Remote Training
    remoteServicesEnabled: boolean
    remoteServices: RemoteService[]

    // Verification
    isVerified: boolean
    videoIntroUrl?: string // Coach intro video
}

// ============================================
// TRAVEL MODE
// ============================================

export interface TravelPlan {
    userId: string
    destination: string // City ID
    arrivalDate: string
    departureDate: string
    sportsInterested: string[]
    lookingFor: ("trainers" | "courts" | "partners")[]
    notes?: string
    createdAt: string
}

// ============================================
// CURRENCY SUPPORT
// ============================================

export const SUPPORTED_CURRENCIES = [
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "GBP", symbol: "£", name: "British Pound" },
    { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
] as const

export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number]["code"]

export function getCurrencySymbol(code: string): string {
    const currency = SUPPORTED_CURRENCIES.find(c => c.code === code)
    return currency?.symbol || "$"
}

export function formatPrice(amount: number, currency: string): string {
    const symbol = getCurrencySymbol(currency)
    return `${symbol}${amount.toFixed(2)}`
}
