/**
 * Dashboard API Client
 * 
 * Connects mobile app to GoodRunss Trainer Dashboard API
 * Used for trainers accessing their dashboard data from mobile
 */

import AsyncStorage from "@react-native-async-storage/async-storage"
import { auth } from "@/lib/firebase-config"

// Dashboard API base URL
const DASHBOARD_API_URL = process.env.EXPO_PUBLIC_DASHBOARD_API_URL || "https://studios.goodrunss.com"

// Cache keys
const TOKEN_CACHE_KEY = "@dashboard_auth_token"

interface APIResponse<T> {
    success: boolean
    data?: T
    error?: string
}

/**
 * Get auth token for dashboard API calls
 */
async function getAuthToken(): Promise<string | null> {
    try {
        // Try to get Firebase token first
        const currentUser = auth?.currentUser
        if (currentUser) {
            return await currentUser.getIdToken()
        }

        // Fall back to cached token
        return await AsyncStorage.getItem(TOKEN_CACHE_KEY)
    } catch (error) {
        console.error("[DashboardAPI] getAuthToken error:", error)
        return null
    }
}

/**
 * Make authenticated API call to dashboard
 */
async function apiCall<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<APIResponse<T>> {
    try {
        const token = await getAuthToken()

        const response = await fetch(`${DASHBOARD_API_URL}/api${endpoint}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {}),
                ...options.headers,
            },
        })

        const data = await response.json()

        if (!response.ok) {
            return { success: false, error: data.error || "API call failed" }
        }

        return { success: true, data }
    } catch (error: any) {
        console.error(`[DashboardAPI] ${endpoint} error:`, error)
        return { success: false, error: error.message || "Network error" }
    }
}

// ============================================
// SESSIONS API
// ============================================

export interface DashboardSession {
    id: string
    trainerId: string
    clientId: string
    clientName: string
    clientEmail: string
    date: string
    startTime: string
    endTime: string
    duration: number
    status: "scheduled" | "completed" | "cancelled" | "no_show"
    notes?: string
    price: number
    paid: boolean
}

/**
 * Get trainer's upcoming sessions
 */
export async function getTrainerSessions(): Promise<DashboardSession[]> {
    const result = await apiCall<{ sessions: DashboardSession[] }>("/sessions")
    return result.data?.sessions || []
}

/**
 * Get single session details
 */
export async function getSessionById(sessionId: string): Promise<DashboardSession | null> {
    const result = await apiCall<{ session: DashboardSession }>(`/sessions/${sessionId}`)
    return result.data?.session || null
}

/**
 * Update session status
 */
export async function updateSessionStatus(
    sessionId: string,
    status: DashboardSession["status"]
): Promise<boolean> {
    const result = await apiCall(`/sessions/${sessionId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
    })
    return result.success
}

// ============================================
// CLIENTS API
// ============================================

export interface DashboardClient {
    id: string
    name: string
    email: string
    phone?: string
    goals?: string
    notes?: string
    totalSessions: number
    lastSessionDate?: string
    status: "active" | "inactive" | "churned"
}

/**
 * Get trainer's clients
 */
export async function getTrainerClients(): Promise<DashboardClient[]> {
    const result = await apiCall<{ clients: DashboardClient[] }>("/clients")
    return result.data?.clients || []
}

/**
 * Get single client details
 */
export async function getClientById(clientId: string): Promise<DashboardClient | null> {
    const result = await apiCall<{ client: DashboardClient }>(`/clients/${clientId}`)
    return result.data?.client || null
}

// ============================================
// ANALYTICS API
// ============================================

export interface DashboardAnalytics {
    totalRevenue: number
    monthlyRevenue: number
    totalSessions: number
    monthlySessions: number
    totalClients: number
    activeClients: number
    retentionRate: number
    noShowRate: number
}

/**
 * Get trainer's analytics
 */
export async function getTrainerAnalytics(): Promise<DashboardAnalytics | null> {
    const result = await apiCall<DashboardAnalytics>("/analytics")
    return result.data || null
}

// ============================================
// WAITLIST API
// ============================================

export interface WaitlistEntry {
    id: string
    clientId: string
    clientName: string
    requestedDate: string
    requestedTime: string
    duration: number
    status: "pending" | "notified" | "converted" | "expired"
    createdAt: string
}

/**
 * Get trainer's waitlist
 */
export async function getTrainerWaitlist(): Promise<WaitlistEntry[]> {
    const result = await apiCall<{ entries: WaitlistEntry[] }>("/waitlist")
    return result.data?.entries || []
}

/**
 * Notify waitlist client of opening
 */
export async function notifyWaitlistClient(waitlistId: string): Promise<boolean> {
    const result = await apiCall("/waitlist", {
        method: "PATCH",
        body: JSON.stringify({ waitlistId, action: "notify" }),
    })
    return result.success
}

/**
 * Convert waitlist to booked session
 */
export async function convertWaitlistToSession(waitlistId: string): Promise<boolean> {
    const result = await apiCall("/waitlist", {
        method: "PATCH",
        body: JSON.stringify({ waitlistId, action: "convert" }),
    })
    return result.success
}

// ============================================
// GROUP CLASSES API
// ============================================

export interface GroupClass {
    id: string
    title: string
    description?: string
    scheduledAt: string
    duration: number
    capacity: number
    enrolled: number
    price: number
    location?: string
    status: "upcoming" | "in_progress" | "completed" | "cancelled"
}

/**
 * Get trainer's group classes
 */
export async function getTrainerGroupClasses(): Promise<GroupClass[]> {
    const result = await apiCall<{ classes: GroupClass[] }>("/group-classes")
    return result.data?.classes || []
}

/**
 * Create new group class
 */
export async function createGroupClass(data: Omit<GroupClass, "id" | "enrolled" | "status">): Promise<string | null> {
    const result = await apiCall<{ classId: string }>("/group-classes", {
        method: "POST",
        body: JSON.stringify(data),
    })
    return result.data?.classId || null
}

// ============================================
// REMINDERS API
// ============================================

export interface ReminderSettings {
    enabled: boolean
    timing24hr: boolean
    timing1hr: boolean
    customMessage?: string
}

/**
 * Get reminder settings
 */
export async function getReminderSettings(): Promise<ReminderSettings | null> {
    const result = await apiCall<ReminderSettings>("/reminders")
    return result.data || null
}

/**
 * Update reminder settings
 */
export async function updateReminderSettings(settings: Partial<ReminderSettings>): Promise<boolean> {
    const result = await apiCall("/reminders", {
        method: "PATCH",
        body: JSON.stringify(settings),
    })
    return result.success
}

/**
 * Send manual reminder
 */
export async function sendManualReminder(sessionId: string, customMessage?: string): Promise<boolean> {
    const result = await apiCall("/reminders", {
        method: "POST",
        body: JSON.stringify({ sessionId, customMessage }),
    })
    return result.success
}

// ============================================
// MESSAGES API
// ============================================

export interface Message {
    id: string
    senderId: string
    receiverId: string
    content: string
    createdAt: string
    read: boolean
}

export interface Conversation {
    id: string
    participantId: string
    participantName: string
    lastMessage?: string
    lastMessageAt?: string
    unreadCount: number
}

/**
 * Get trainer's conversations
 */
export async function getConversations(): Promise<Conversation[]> {
    const result = await apiCall<{ conversations: Conversation[] }>("/messages")
    return result.data?.conversations || []
}

/**
 * Get messages in a conversation
 */
export async function getMessages(conversationId: string): Promise<Message[]> {
    const result = await apiCall<{ messages: Message[] }>(`/messages/${conversationId}`)
    return result.data?.messages || []
}

/**
 * Send a message
 */
export async function sendMessage(receiverId: string, content: string): Promise<boolean> {
    const result = await apiCall("/messages", {
        method: "POST",
        body: JSON.stringify({ receiverId, content }),
    })
    return result.success
}

// ============================================
// RETENTION API
// ============================================

export interface RetentionStats {
    retentionRate: number
    churnRate: number
    activeClients: number
    atRiskClients: number
    inactiveClients: number
    churnedClients: number
}

export interface AtRiskClient {
    id: string
    name: string
    email: string
    lastSessionDate: string
    daysInactive: number
    riskLevel: "medium" | "high" | "critical"
}

/**
 * Get retention analytics
 */
export async function getRetentionStats(): Promise<RetentionStats | null> {
    const result = await apiCall<RetentionStats>("/retention")
    return result.data || null
}

/**
 * Get at-risk clients
 */
export async function getAtRiskClients(): Promise<AtRiskClient[]> {
    const result = await apiCall<{ clients: AtRiskClient[] }>("/retention?atRisk=true")
    return result.data?.clients || []
}

/**
 * Send re-engagement campaign
 */
export async function sendReengagementCampaign(
    clientIds: string[],
    subject: string,
    message: string,
    offerType?: string
): Promise<boolean> {
    const result = await apiCall("/retention", {
        method: "POST",
        body: JSON.stringify({ clientIds, subject, message, offerType }),
    })
    return result.success
}

// ============================================
// PACKAGES API
// ============================================

export interface SessionPackage {
    id: string
    clientId: string
    clientName: string
    totalSessions: number
    usedSessions: number
    remainingSessions: number
    price: number
    expiresAt?: string
    status: "active" | "complete" | "expired"
}

/**
 * Get trainer's packages
 */
export async function getTrainerPackages(): Promise<SessionPackage[]> {
    const result = await apiCall<{ packages: SessionPackage[] }>("/packages")
    return result.data?.packages || []
}

/**
 * Use a session from package
 */
export async function usePackageSession(packageId: string): Promise<boolean> {
    const result = await apiCall("/packages", {
        method: "PATCH",
        body: JSON.stringify({ packageId, action: "use" }),
    })
    return result.success
}

// ============================================
// GIA AI API
// ============================================

export interface GiaCapability {
    id: string
    name: string
    description: string
    category: string
}

/**
 * Get available GIA capabilities
 */
export async function getGiaCapabilities(): Promise<GiaCapability[]> {
    const result = await apiCall<{ capabilities: GiaCapability[] }>("/gia/capabilities")
    return result.data?.capabilities || []
}

/**
 * Generate content with GIA
 */
export async function generateWithGia(
    tool: string,
    input: Record<string, any>
): Promise<string | null> {
    const result = await apiCall<{ content: string }>(`/gia/${tool}`, {
        method: "POST",
        body: JSON.stringify(input),
    })
    return result.data?.content || null
}

// ============================================
// AVAILABILITY API
// ============================================

export interface AvailabilitySlot {
    dayOfWeek: number // 0-6 (Sunday-Saturday)
    startTime: string // "09:00"
    endTime: string // "17:00"
}

/**
 * Get trainer's availability
 */
export async function getTrainerAvailability(): Promise<AvailabilitySlot[]> {
    const result = await apiCall<{ slots: AvailabilitySlot[] }>("/availability")
    return result.data?.slots || []
}

/**
 * Update trainer's availability
 */
export async function updateTrainerAvailability(slots: AvailabilitySlot[]): Promise<boolean> {
    const result = await apiCall("/availability", {
        method: "PUT",
        body: JSON.stringify({ slots }),
    })
    return result.success
}

// ============================================
// PUBLIC BOOKING API (for clients)
// ============================================

/**
 * Get trainer's public booking page data
 */
export async function getPublicTrainerProfile(trainerSlug: string): Promise<any | null> {
    const result = await apiCall(`/public/trainer/${trainerSlug}`)
    return result.data || null
}

/**
 * Get public availability for booking
 */
export async function getPublicAvailability(trainerId: string, date: string): Promise<string[]> {
    const result = await apiCall<{ times: string[] }>(`/public/availability?trainerId=${trainerId}&date=${date}`)
    return result.data?.times || []
}

/**
 * Create public booking (client books without account)
 */
export async function createPublicBooking(data: {
    trainerId: string
    date: string
    time: string
    duration: number
    clientName: string
    clientEmail: string
    clientPhone?: string
    notes?: string
}): Promise<{ bookingId: string; paymentUrl?: string } | null> {
    const result = await apiCall<{ bookingId: string; paymentUrl: string }>("/public/book", {
        method: "POST",
        body: JSON.stringify(data),
    })
    return result.data || null
}

export default {
    // Sessions
    getTrainerSessions,
    getSessionById,
    updateSessionStatus,

    // Clients
    getTrainerClients,
    getClientById,

    // Analytics
    getTrainerAnalytics,

    // Waitlist
    getTrainerWaitlist,
    notifyWaitlistClient,
    convertWaitlistToSession,

    // Group Classes
    getTrainerGroupClasses,
    createGroupClass,

    // Reminders
    getReminderSettings,
    updateReminderSettings,
    sendManualReminder,

    // Messages
    getConversations,
    getMessages,
    sendMessage,

    // Retention
    getRetentionStats,
    getAtRiskClients,
    sendReengagementCampaign,

    // Packages
    getTrainerPackages,
    usePackageSession,

    // GIA
    getGiaCapabilities,
    generateWithGia,

    // Availability
    getTrainerAvailability,
    updateTrainerAvailability,

    // Public
    getPublicTrainerProfile,
    getPublicAvailability,
    createPublicBooking,
}
