/**
 * Dashboard Integration Hooks
 * 
 * React hooks for trainers to access their dashboard data from mobile
 */

import { useState, useEffect, useCallback } from "react"
import DashboardAPI, {
    DashboardSession,
    DashboardClient,
    DashboardAnalytics,
    WaitlistEntry,
    GroupClass,
    Conversation,
    Message,
    RetentionStats,
    AtRiskClient,
    SessionPackage,
} from "@/lib/services/dashboard-api"

// ============================================
// SESSIONS
// ============================================

/**
 * Hook for trainer's sessions
 */
export function useTrainerSessions() {
    const [sessions, setSessions] = useState<DashboardSession[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const refresh = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await DashboardAPI.getTrainerSessions()
            setSessions(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        refresh()
    }, [refresh])

    const updateStatus = async (sessionId: string, status: DashboardSession["status"]) => {
        const success = await DashboardAPI.updateSessionStatus(sessionId, status)
        if (success) {
            setSessions(prev =>
                prev.map(s => s.id === sessionId ? { ...s, status } : s)
            )
        }
        return success
    }

    return {
        sessions,
        loading,
        error,
        refresh,
        updateStatus,
        upcomingSessions: sessions.filter(s => s.status === "scheduled"),
        completedSessions: sessions.filter(s => s.status === "completed"),
    }
}

// ============================================
// CLIENTS
// ============================================

/**
 * Hook for trainer's clients
 */
export function useTrainerClients() {
    const [clients, setClients] = useState<DashboardClient[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const refresh = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await DashboardAPI.getTrainerClients()
            setClients(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        refresh()
    }, [refresh])

    return {
        clients,
        loading,
        error,
        refresh,
        activeClients: clients.filter(c => c.status === "active"),
        inactiveClients: clients.filter(c => c.status === "inactive"),
        totalClients: clients.length,
    }
}

// ============================================
// ANALYTICS
// ============================================

/**
 * Hook for trainer's analytics dashboard
 */
export function useTrainerAnalytics() {
    const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const refresh = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await DashboardAPI.getTrainerAnalytics()
            setAnalytics(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        refresh()
    }, [refresh])

    return { analytics, loading, error, refresh }
}

// ============================================
// WAITLIST
// ============================================

/**
 * Hook for trainer's waitlist management
 */
export function useTrainerWaitlist() {
    const [entries, setEntries] = useState<WaitlistEntry[]>([])
    const [loading, setLoading] = useState(true)

    const refresh = useCallback(async () => {
        setLoading(true)
        try {
            const data = await DashboardAPI.getTrainerWaitlist()
            setEntries(data)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        refresh()
    }, [refresh])

    const notifyClient = async (waitlistId: string) => {
        const success = await DashboardAPI.notifyWaitlistClient(waitlistId)
        if (success) {
            await refresh()
        }
        return success
    }

    const convertToSession = async (waitlistId: string) => {
        const success = await DashboardAPI.convertWaitlistToSession(waitlistId)
        if (success) {
            await refresh()
        }
        return success
    }

    return {
        entries,
        loading,
        refresh,
        notifyClient,
        convertToSession,
        pendingCount: entries.filter(e => e.status === "pending").length,
    }
}

// ============================================
// GROUP CLASSES
// ============================================

/**
 * Hook for trainer's group classes
 */
export function useTrainerGroupClasses() {
    const [classes, setClasses] = useState<GroupClass[]>([])
    const [loading, setLoading] = useState(true)

    const refresh = useCallback(async () => {
        setLoading(true)
        try {
            const data = await DashboardAPI.getTrainerGroupClasses()
            setClasses(data)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        refresh()
    }, [refresh])

    const createClass = async (data: Omit<GroupClass, "id" | "enrolled" | "status">) => {
        const classId = await DashboardAPI.createGroupClass(data)
        if (classId) {
            await refresh()
        }
        return classId
    }

    return {
        classes,
        loading,
        refresh,
        createClass,
        upcomingClasses: classes.filter(c => c.status === "upcoming"),
    }
}

// ============================================
// MESSAGES
// ============================================

/**
 * Hook for trainer's conversations
 */
export function useTrainerConversations() {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [loading, setLoading] = useState(true)

    const refresh = useCallback(async () => {
        setLoading(true)
        try {
            const data = await DashboardAPI.getConversations()
            setConversations(data)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        refresh()
    }, [refresh])

    const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0)

    return { conversations, loading, refresh, totalUnread }
}

/**
 * Hook for a single conversation
 */
export function useConversation(conversationId: string) {
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(true)

    const refresh = useCallback(async () => {
        setLoading(true)
        try {
            const data = await DashboardAPI.getMessages(conversationId)
            setMessages(data)
        } finally {
            setLoading(false)
        }
    }, [conversationId])

    useEffect(() => {
        refresh()
    }, [refresh])

    const send = async (receiverId: string, content: string) => {
        const success = await DashboardAPI.sendMessage(receiverId, content)
        if (success) {
            await refresh()
        }
        return success
    }

    return { messages, loading, refresh, send }
}

// ============================================
// RETENTION
// ============================================

/**
 * Hook for retention analytics
 */
export function useRetention() {
    const [stats, setStats] = useState<RetentionStats | null>(null)
    const [atRiskClients, setAtRiskClients] = useState<AtRiskClient[]>([])
    const [loading, setLoading] = useState(true)

    const refresh = useCallback(async () => {
        setLoading(true)
        try {
            const [statsData, clientsData] = await Promise.all([
                DashboardAPI.getRetentionStats(),
                DashboardAPI.getAtRiskClients(),
            ])
            setStats(statsData)
            setAtRiskClients(clientsData)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        refresh()
    }, [refresh])

    const sendReengagement = async (
        clientIds: string[],
        subject: string,
        message: string,
        offerType?: string
    ) => {
        return DashboardAPI.sendReengagementCampaign(clientIds, subject, message, offerType)
    }

    return {
        stats,
        atRiskClients,
        loading,
        refresh,
        sendReengagement,
    }
}

// ============================================
// PACKAGES
// ============================================

/**
 * Hook for trainer's session packages
 */
export function useTrainerPackages() {
    const [packages, setPackages] = useState<SessionPackage[]>([])
    const [loading, setLoading] = useState(true)

    const refresh = useCallback(async () => {
        setLoading(true)
        try {
            const data = await DashboardAPI.getTrainerPackages()
            setPackages(data)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        refresh()
    }, [refresh])

    const useSession = async (packageId: string) => {
        const success = await DashboardAPI.usePackageSession(packageId)
        if (success) {
            await refresh()
        }
        return success
    }

    return {
        packages,
        loading,
        refresh,
        useSession,
        activePackages: packages.filter(p => p.status === "active"),
    }
}

// ============================================
// REMINDERS
// ============================================

/**
 * Hook for reminder settings
 */
export function useReminderSettings() {
    const [settings, setSettings] = useState({
        enabled: true,
        timing24hr: true,
        timing1hr: true,
        customMessage: "",
    })
    const [loading, setLoading] = useState(true)

    const refresh = useCallback(async () => {
        setLoading(true)
        try {
            const data = await DashboardAPI.getReminderSettings()
            if (data) setSettings(data)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        refresh()
    }, [refresh])

    const update = async (newSettings: Partial<typeof settings>) => {
        const success = await DashboardAPI.updateReminderSettings(newSettings)
        if (success) {
            setSettings(prev => ({ ...prev, ...newSettings }))
        }
        return success
    }

    const sendManual = async (sessionId: string, customMessage?: string) => {
        return DashboardAPI.sendManualReminder(sessionId, customMessage)
    }

    return { settings, loading, refresh, update, sendManual }
}

// ============================================
// QUICK STATS HOOK
// ============================================

/**
 * Hook for quick dashboard stats (for home screen widget)
 */
export function useDashboardQuickStats() {
    const [stats, setStats] = useState({
        todaySessions: 0,
        weekRevenue: 0,
        activeClients: 0,
        waitlistCount: 0,
        unreadMessages: 0,
    })
    const [loading, setLoading] = useState(true)

    const refresh = useCallback(async () => {
        setLoading(true)
        try {
            const [sessions, analytics, waitlist, conversations] = await Promise.all([
                DashboardAPI.getTrainerSessions(),
                DashboardAPI.getTrainerAnalytics(),
                DashboardAPI.getTrainerWaitlist(),
                DashboardAPI.getConversations(),
            ])

            const today = new Date().toISOString().split("T")[0]
            const todaySessions = sessions.filter(s =>
                s.date === today && s.status === "scheduled"
            ).length

            setStats({
                todaySessions,
                weekRevenue: analytics?.monthlyRevenue || 0,
                activeClients: analytics?.activeClients || 0,
                waitlistCount: waitlist.filter(w => w.status === "pending").length,
                unreadMessages: conversations.reduce((sum, c) => sum + c.unreadCount, 0),
            })
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        refresh()
    }, [refresh])

    return { stats, loading, refresh }
}

export default {
    useTrainerSessions,
    useTrainerClients,
    useTrainerAnalytics,
    useTrainerWaitlist,
    useTrainerGroupClasses,
    useTrainerConversations,
    useConversation,
    useRetention,
    useTrainerPackages,
    useReminderSettings,
    useDashboardQuickStats,
}
