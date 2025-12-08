import { useState, useEffect, useCallback } from "react"
import {
    trainerDashboardService,
    type Client,
    type Booking,
    type Earnings,
    type TrainerProfile,
    type TrainerSettings,
    type GIAMemory,
    type GIAConversation,
} from "@/lib/services/trainer-dashboard-service"

// ============================================
// CLIENTS HOOK
// ============================================

export function useClients() {
    const [clients, setClients] = useState<Client[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const refresh = useCallback(async () => {
        try {
            setIsLoading(true)
            const data = await trainerDashboardService.getClients()
            setClients(data)
            setError(null)
        } catch (err) {
            setError("Failed to load clients")
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        refresh()

        // Subscribe to real-time updates
        const unsubscribe = trainerDashboardService.subscribeToClients(setClients)
        return unsubscribe
    }, [refresh])

    const addClient = async (client: Omit<Client, "id">) => {
        const newClient = await trainerDashboardService.addClient(client)
        setClients(prev => [newClient, ...prev])
        return newClient
    }

    const updateClient = async (clientId: string, updates: Partial<Client>) => {
        await trainerDashboardService.updateClient(clientId, updates)
        setClients(prev => prev.map(c => c.id === clientId ? { ...c, ...updates } : c))
    }

    return {
        clients,
        isLoading,
        error,
        refresh,
        addClient,
        updateClient,
        totalClients: clients.length,
        activeClients: clients.filter(c => c.status === "active").length,
    }
}

// ============================================
// BOOKINGS HOOK
// ============================================

export function useBookings() {
    const [bookings, setBookings] = useState<Booking[]>([])
    const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const refresh = useCallback(async () => {
        try {
            setIsLoading(true)
            const [all, upcoming] = await Promise.all([
                trainerDashboardService.getBookings(),
                trainerDashboardService.getUpcomingBookings(10),
            ])
            setBookings(all)
            setUpcomingBookings(upcoming)
            setError(null)
        } catch (err) {
            setError("Failed to load bookings")
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        refresh()

        // Subscribe to real-time updates
        const unsubscribe = trainerDashboardService.subscribeToBookings((newBookings) => {
            setBookings(newBookings)
            // Filter for upcoming
            const today = new Date().toISOString().split("T")[0]
            setUpcomingBookings(
                newBookings
                    .filter(b => b.date >= today && b.status !== "canceled")
                    .slice(0, 10)
            )
        })
        return unsubscribe
    }, [refresh])

    const updateStatus = async (bookingId: string, status: Booking["status"]) => {
        await trainerDashboardService.updateBookingStatus(bookingId, status)
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b))
    }

    const pendingCount = bookings.filter(b => b.status === "pending").length

    return {
        bookings,
        upcomingBookings,
        isLoading,
        error,
        refresh,
        updateStatus,
        pendingCount,
        todayBookings: upcomingBookings.filter(b => b.date === new Date().toISOString().split("T")[0]),
    }
}

// ============================================
// EARNINGS HOOK
// ============================================

export function useEarnings() {
    const [earnings, setEarnings] = useState<Earnings>({
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        lastMonth: 0,
        total: 0,
        pending: 0,
    })
    const [isLoading, setIsLoading] = useState(true)

    const refresh = useCallback(async () => {
        try {
            setIsLoading(true)
            const data = await trainerDashboardService.getEarnings()
            setEarnings(data)
        } catch (err) {
            console.error("Failed to load earnings:", err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        refresh()
    }, [refresh])

    return { earnings, isLoading, refresh }
}

// ============================================
// PROFILE HOOK
// ============================================

export function useTrainerProfile() {
    const [profile, setProfile] = useState<TrainerProfile | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const refresh = useCallback(async () => {
        try {
            setIsLoading(true)
            const data = await trainerDashboardService.getProfile()
            setProfile(data)
        } catch (err) {
            console.error("Failed to load profile:", err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        refresh()
    }, [refresh])

    const updateProfile = async (updates: Partial<TrainerProfile>) => {
        await trainerDashboardService.updateProfile(updates)
        setProfile(prev => prev ? { ...prev, ...updates } : null)
    }

    return { profile, isLoading, refresh, updateProfile }
}

// ============================================
// SETTINGS HOOK
// ============================================

export function useTrainerSettings() {
    const [settings, setSettings] = useState<TrainerSettings | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const refresh = useCallback(async () => {
        try {
            setIsLoading(true)
            const data = await trainerDashboardService.getSettings()
            setSettings(data)
        } catch (err) {
            console.error("Failed to load settings:", err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        refresh()
    }, [refresh])

    const updateSettings = async (updates: Partial<TrainerSettings>) => {
        await trainerDashboardService.updateSettings(updates)
        setSettings(prev => prev ? { ...prev, ...updates } : null)
    }

    return { settings, isLoading, refresh, updateSettings }
}

// ============================================
// GIA MEMORY HOOK - Synced between mobile + web
// ============================================

export function useGIAMemory() {
    const [memories, setMemories] = useState<GIAMemory[]>([])
    const [conversations, setConversations] = useState<GIAConversation[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const refresh = useCallback(async () => {
        try {
            setIsLoading(true)
            const [mems, convos] = await Promise.all([
                trainerDashboardService.getGIAMemories(),
                trainerDashboardService.getGIAConversations(20),
            ])
            setMemories(mems)
            setConversations(convos)
        } catch (err) {
            console.error("Failed to load GIA data:", err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        refresh()
    }, [refresh])

    const addMemory = async (memory: Omit<GIAMemory, "id" | "createdAt">) => {
        const newMemory = await trainerDashboardService.addGIAMemory(memory)
        setMemories(prev => [newMemory, ...prev])
        return newMemory
    }

    const saveConversation = async (convo: Omit<GIAConversation, "id" | "createdAt">) => {
        const newConvo = await trainerDashboardService.saveGIAConversation(convo)
        setConversations(prev => [newConvo, ...prev])
        return newConvo
    }

    // Get memory context for GIA prompt
    const getMemoryContext = () => {
        const recentMemories = memories.slice(0, 10)
        return recentMemories.map(m => `[${m.type}] ${m.content}`).join("\n")
    }

    return {
        memories,
        conversations,
        isLoading,
        refresh,
        addMemory,
        saveConversation,
        getMemoryContext,
    }
}

// ============================================
// COMBINED DASHBOARD HOOK
// ============================================

export function useTrainerDashboard() {
    const clientsData = useClients()
    const bookingsData = useBookings()
    const earningsData = useEarnings()
    const profileData = useTrainerProfile()
    const settingsData = useTrainerSettings()
    const giaData = useGIAMemory()

    const isLoading =
        clientsData.isLoading ||
        bookingsData.isLoading ||
        earningsData.isLoading ||
        profileData.isLoading

    const refreshAll = async () => {
        await Promise.all([
            clientsData.refresh(),
            bookingsData.refresh(),
            earningsData.refresh(),
            profileData.refresh(),
            settingsData.refresh(),
            giaData.refresh(),
        ])
    }

    return {
        // Clients
        clients: clientsData.clients,
        totalClients: clientsData.totalClients,
        activeClients: clientsData.activeClients,
        addClient: clientsData.addClient,
        updateClient: clientsData.updateClient,

        // Bookings
        bookings: bookingsData.bookings,
        upcomingBookings: bookingsData.upcomingBookings,
        todayBookings: bookingsData.todayBookings,
        pendingCount: bookingsData.pendingCount,
        updateBookingStatus: bookingsData.updateStatus,

        // Earnings
        earnings: earningsData.earnings,

        // Profile
        profile: profileData.profile,
        updateProfile: profileData.updateProfile,

        // Settings
        settings: settingsData.settings,
        updateSettings: settingsData.updateSettings,

        // GIA
        giaMemories: giaData.memories,
        giaConversations: giaData.conversations,
        addGIAMemory: giaData.addMemory,
        saveGIAConversation: giaData.saveConversation,
        getGIAMemoryContext: giaData.getMemoryContext,

        // Meta
        isLoading,
        refreshAll,
    }
}
