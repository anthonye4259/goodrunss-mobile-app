import { db, auth } from "@/lib/firebase-config"
import AsyncStorage from "@react-native-async-storage/async-storage"

// ============================================
// TRAINER DASHBOARD DATA TYPES
// Shared between mobile app and web dashboard
// ============================================

export interface Client {
    id: string
    name: string
    email?: string
    phone?: string
    avatar?: string
    joinedAt: string
    lastSessionAt?: string
    totalSessions: number
    totalSpent: number
    notes?: string
    tags?: string[]
    status: "active" | "inactive" | "pending"
}

export interface Booking {
    id: string
    clientId: string
    clientName: string
    trainerId: string
    date: string
    time: string
    duration: number // minutes
    activity: string
    location?: string
    notes?: string
    status: "pending" | "confirmed" | "completed" | "canceled"
    paymentStatus: "pending" | "paid" | "refunded"
    amount: number
    createdAt: string
    updatedAt?: string
    platformFee?: number
    netPayout?: number
    isFirstSession?: boolean
}

// Import Subscription Service for Fee Logic
import { subscriptionService } from "./subscription-service"

export interface Earnings {
    today: number
    thisWeek: number
    thisMonth: number
    lastMonth: number
    total: number
    pending: number
}

export interface TrainerProfile {
    id: string
    name: string
    email: string
    phone?: string
    avatar?: string
    bio?: string
    activities: string[]
    hourlyRate: number
    location?: {
        city: string
        state: string
        country: string
    }
    rating: number
    reviewCount: number
    isPro: boolean
    createdAt: string
}

export interface TrainerSettings {
    notifications: {
        newBooking: boolean
        bookingReminder: boolean
        clientMessage: boolean
        paymentReceived: boolean
        weeklyReport: boolean
    }
    availability: {
        [day: string]: { start: string; end: string }[] // e.g., "monday": [{ start: "09:00", end: "17:00" }]
    }
    autoAcceptBookings: boolean
    requireDeposit: boolean
    depositAmount?: number
    cancellationPolicy?: string
}

export interface GIAMemory {
    id: string
    type: "preference" | "context" | "insight" | "goal"
    content: string
    category?: string
    createdAt: string
    updatedAt?: string
    source: "mobile" | "web" | "auto"
}

export interface GIAConversation {
    id: string
    messages: {
        role: "user" | "assistant"
        content: string
        timestamp: string
    }[]
    summary?: string
    platform: "mobile" | "web"
    createdAt: string
}

// ============================================
// TRAINER DASHBOARD SERVICE
// Syncs data between mobile app and web dashboard
// ============================================

class TrainerDashboardService {
    private static instance: TrainerDashboardService
    private userId: string | null = null

    private constructor() { }

    static getInstance(): TrainerDashboardService {
        if (!TrainerDashboardService.instance) {
            TrainerDashboardService.instance = new TrainerDashboardService()
        }
        return TrainerDashboardService.instance
    }

    async initialize(): Promise<void> {
        this.userId = auth?.currentUser?.uid || await AsyncStorage.getItem("userId")
    }

    private async ensureUserId(): Promise<string> {
        if (!this.userId) {
            await this.initialize()
        }
        if (!this.userId) {
            throw new Error("User not authenticated")
        }
        return this.userId
    }

    // ============================================
    // CLIENTS
    // ============================================

    async getClients(): Promise<Client[]> {
        const userId = await this.ensureUserId()

        if (!db) {
            // Fallback to local storage
            const stored = await AsyncStorage.getItem(`@trainer_clients_${userId}`)
            return stored ? JSON.parse(stored) : []
        }

        try {
            const { collection, getDocs, orderBy, query } = await import("firebase/firestore")
            const q = query(
                collection(db, "trainers", userId, "clients"),
                orderBy("lastSessionAt", "desc")
            )
            const snapshot = await getDocs(q)
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client))
        } catch (error) {
            console.error("Error fetching clients:", error)
            return []
        }
    }

    async addClient(client: Omit<Client, "id">): Promise<Client> {
        const userId = await this.ensureUserId()

        if (!db) {
            const newClient = { ...client, id: `client_${Date.now()}` }
            const clients = await this.getClients()
            clients.push(newClient)
            await AsyncStorage.setItem(`@trainer_clients_${userId}`, JSON.stringify(clients))
            return newClient
        }

        try {
            const { collection, addDoc, serverTimestamp } = await import("firebase/firestore")
            const docRef = await addDoc(collection(db, "trainers", userId, "clients"), {
                ...client,
                createdAt: serverTimestamp(),
            })
            return { ...client, id: docRef.id }
        } catch (error) {
            console.error("Error adding client:", error)
            throw error
        }
    }

    async updateClient(clientId: string, updates: Partial<Client>): Promise<void> {
        const userId = await this.ensureUserId()

        if (!db) {
            const clients = await this.getClients()
            const index = clients.findIndex(c => c.id === clientId)
            if (index !== -1) {
                clients[index] = { ...clients[index], ...updates }
                await AsyncStorage.setItem(`@trainer_clients_${userId}`, JSON.stringify(clients))
            }
            return
        }

        try {
            const { doc, updateDoc, serverTimestamp } = await import("firebase/firestore")
            await updateDoc(doc(db, "trainers", userId, "clients", clientId), {
                ...updates,
                updatedAt: serverTimestamp(),
            })
        } catch (error) {
            console.error("Error updating client:", error)
            throw error
        }
    }

    // ============================================
    // BOOKINGS
    // ============================================

    async addBooking(booking: Omit<Booking, "id" | "createdAt" | "platformFee" | "netPayout" | "isFirstSession" | "updatedAt">): Promise<Booking> {
        const userId = await this.ensureUserId()

        // 1. Calculate Fees
        let feeRate = 0.15 // Default 15% for Free Tier
        const isPro = await subscriptionService.isPro()

        // Check for previous bookings (Rebook Logic)
        const previousBookings = await this.getBookings()
        const isFirstSession = !previousBookings.some(b =>
            b.clientId === booking.clientId &&
            (b.status === "completed" || b.status === "confirmed")
        )

        if (isPro) {
            if (isFirstSession) {
                feeRate = 0.06 // 6% for first-time SaaS bookings
            } else {
                feeRate = 0.04 // 4% for re-bookings (SaaS)
            }
        }

        const platformFee = booking.amount * feeRate
        const netPayout = booking.amount - platformFee

        const newBooking = {
            ...booking,
            id: `booking_${Date.now()}`,
            platformFee,
            netPayout,
            isFirstSession,
            createdAt: new Date().toISOString(),
            status: booking.status || "pending",
            paymentStatus: booking.paymentStatus || "pending"
        } as Booking

        if (!db) {
            const bookings = await this.getBookings()
            bookings.push(newBooking)
            await AsyncStorage.setItem(`@trainer_bookings_${userId}`, JSON.stringify(bookings))

            // Should also update Earnings here if paid
            if (newBooking.paymentStatus === 'paid') {
                // this.updateEarnings(netPayout) // Placeholder
            }

            return newBooking
        }

        try {
            const { collection, addDoc, serverTimestamp } = await import("firebase/firestore")
            const docRef = await addDoc(collection(db, "trainers", userId, "bookings"), {
                ...newBooking,
                createdAt: serverTimestamp(),
            })

            return { ...newBooking, id: docRef.id }
        } catch (error) {
            console.error("Error adding booking:", error)
            throw error
        }
    }

    async getBookings(status?: Booking["status"]): Promise<Booking[]> {
        const userId = await this.ensureUserId()

        if (!db) {
            const stored = await AsyncStorage.getItem(`@trainer_bookings_${userId}`)
            const bookings: Booking[] = stored ? JSON.parse(stored) : []
            return status ? bookings.filter(b => b.status === status) : bookings
        }

        try {
            const { collection, getDocs, orderBy, query, where } = await import("firebase/firestore")
            let q = query(
                collection(db, "trainers", userId, "bookings"),
                orderBy("date", "desc")
            )
            if (status) {
                q = query(q, where("status", "==", status))
            }
            const snapshot = await getDocs(q)
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking))
        } catch (error) {
            console.error("Error fetching bookings:", error)
            return []
        }
    }

    async getUpcomingBookings(limit: number = 10): Promise<Booking[]> {
        const userId = await this.ensureUserId()
        const today = new Date().toISOString().split("T")[0]

        if (!db) {
            const bookings = await this.getBookings()
            return bookings
                .filter(b => b.date >= today && b.status !== "canceled")
                .slice(0, limit)
        }

        try {
            const { collection, getDocs, orderBy, query, where, limit: fbLimit } = await import("firebase/firestore")
            const q = query(
                collection(db, "trainers", userId, "bookings"),
                where("date", ">=", today),
                where("status", "in", ["pending", "confirmed"]),
                orderBy("date", "asc"),
                fbLimit(limit)
            )
            const snapshot = await getDocs(q)
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking))
        } catch (error) {
            console.error("Error fetching upcoming bookings:", error)
            return []
        }
    }

    async updateBookingStatus(bookingId: string, status: Booking["status"]): Promise<void> {
        const userId = await this.ensureUserId()

        if (!db) {
            const bookings = await this.getBookings()
            const index = bookings.findIndex(b => b.id === bookingId)
            if (index !== -1) {
                bookings[index].status = status
                await AsyncStorage.setItem(`@trainer_bookings_${userId}`, JSON.stringify(bookings))
            }
            return
        }

        try {
            const { doc, updateDoc, serverTimestamp } = await import("firebase/firestore")
            await updateDoc(doc(db, "trainers", userId, "bookings", bookingId), {
                status,
                updatedAt: serverTimestamp(),
            })
        } catch (error) {
            console.error("Error updating booking status:", error)
            throw error
        }
    }

    // ============================================
    // EARNINGS
    // ============================================

    async getEarnings(): Promise<Earnings> {
        const userId = await this.ensureUserId()

        if (!db) {
            const stored = await AsyncStorage.getItem(`@trainer_earnings_${userId}`)
            return stored ? JSON.parse(stored) : {
                today: 0,
                thisWeek: 0,
                thisMonth: 0,
                lastMonth: 0,
                total: 0,
                pending: 0,
            }
        }

        try {
            const { doc, getDoc } = await import("firebase/firestore")
            const earningsDoc = await getDoc(doc(db, "trainers", userId, "stats", "earnings"))
            if (earningsDoc.exists()) {
                return earningsDoc.data() as Earnings
            }
            return { today: 0, thisWeek: 0, thisMonth: 0, lastMonth: 0, total: 0, pending: 0 }
        } catch (error) {
            console.error("Error fetching earnings:", error)
            return { today: 0, thisWeek: 0, thisMonth: 0, lastMonth: 0, total: 0, pending: 0 }
        }
    }

    // ============================================
    // TRAINER PROFILE
    // ============================================

    async getProfile(): Promise<TrainerProfile | null> {
        const userId = await this.ensureUserId()

        if (!db) {
            const stored = await AsyncStorage.getItem(`@trainer_profile_${userId}`)
            return stored ? JSON.parse(stored) : null
        }

        try {
            const { doc, getDoc } = await import("firebase/firestore")
            const profileDoc = await getDoc(doc(db, "trainers", userId))
            if (profileDoc.exists()) {
                return { id: profileDoc.id, ...profileDoc.data() } as TrainerProfile
            }
            return null
        } catch (error) {
            console.error("Error fetching profile:", error)
            return null
        }
    }

    async updateProfile(updates: Partial<TrainerProfile>): Promise<void> {
        const userId = await this.ensureUserId()

        if (!db) {
            const profile = await this.getProfile()
            if (profile) {
                await AsyncStorage.setItem(`@trainer_profile_${userId}`, JSON.stringify({
                    ...profile,
                    ...updates,
                }))
            }
            return
        }

        try {
            const { doc, updateDoc, serverTimestamp } = await import("firebase/firestore")
            await updateDoc(doc(db, "trainers", userId), {
                ...updates,
                updatedAt: serverTimestamp(),
            })
        } catch (error) {
            console.error("Error updating profile:", error)
            throw error
        }
    }

    // ============================================
    // SETTINGS
    // ============================================

    async getSettings(): Promise<TrainerSettings> {
        const userId = await this.ensureUserId()
        const defaultSettings: TrainerSettings = {
            notifications: {
                newBooking: true,
                bookingReminder: true,
                clientMessage: true,
                paymentReceived: true,
                weeklyReport: true,
            },
            availability: {},
            autoAcceptBookings: false,
            requireDeposit: false,
        }

        if (!db) {
            const stored = await AsyncStorage.getItem(`@trainer_settings_${userId}`)
            return stored ? JSON.parse(stored) : defaultSettings
        }

        try {
            const { doc, getDoc } = await import("firebase/firestore")
            const settingsDoc = await getDoc(doc(db, "trainers", userId, "settings", "preferences"))
            if (settingsDoc.exists()) {
                return settingsDoc.data() as TrainerSettings
            }
            return defaultSettings
        } catch (error) {
            console.error("Error fetching settings:", error)
            return defaultSettings
        }
    }

    async updateSettings(updates: Partial<TrainerSettings>): Promise<void> {
        const userId = await this.ensureUserId()

        if (!db) {
            const settings = await this.getSettings()
            await AsyncStorage.setItem(`@trainer_settings_${userId}`, JSON.stringify({
                ...settings,
                ...updates,
            }))
            return
        }

        try {
            const { doc, setDoc, serverTimestamp } = await import("firebase/firestore")
            const settings = await this.getSettings()
            await setDoc(doc(db, "trainers", userId, "settings", "preferences"), {
                ...settings,
                ...updates,
                updatedAt: serverTimestamp(),
            })
        } catch (error) {
            console.error("Error updating settings:", error)
            throw error
        }
    }

    // ============================================
    // GIA MEMORY - Shared between mobile and web
    // ============================================

    async getGIAMemories(): Promise<GIAMemory[]> {
        const userId = await this.ensureUserId()

        if (!db) {
            const stored = await AsyncStorage.getItem(`@gia_memories_${userId}`)
            return stored ? JSON.parse(stored) : []
        }

        try {
            const { collection, getDocs, orderBy, query } = await import("firebase/firestore")
            const q = query(
                collection(db, "users", userId, "giaMemories"),
                orderBy("createdAt", "desc")
            )
            const snapshot = await getDocs(q)
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GIAMemory))
        } catch (error) {
            console.error("Error fetching GIA memories:", error)
            return []
        }
    }

    async addGIAMemory(memory: Omit<GIAMemory, "id" | "createdAt">): Promise<GIAMemory> {
        const userId = await this.ensureUserId()
        const newMemory: GIAMemory = {
            ...memory,
            id: `memory_${Date.now()}`,
            createdAt: new Date().toISOString(),
        }

        if (!db) {
            const memories = await this.getGIAMemories()
            memories.unshift(newMemory)
            await AsyncStorage.setItem(`@gia_memories_${userId}`, JSON.stringify(memories))
            return newMemory
        }

        try {
            const { collection, addDoc, serverTimestamp } = await import("firebase/firestore")
            const docRef = await addDoc(collection(db, "users", userId, "giaMemories"), {
                ...memory,
                createdAt: serverTimestamp(),
            })
            return { ...newMemory, id: docRef.id }
        } catch (error) {
            console.error("Error adding GIA memory:", error)
            throw error
        }
    }

    async getGIAConversations(limit: number = 20): Promise<GIAConversation[]> {
        const userId = await this.ensureUserId()

        if (!db) {
            const stored = await AsyncStorage.getItem(`@gia_conversations_${userId}`)
            const convos: GIAConversation[] = stored ? JSON.parse(stored) : []
            return convos.slice(0, limit)
        }

        try {
            const { collection, getDocs, orderBy, query, limit: fbLimit } = await import("firebase/firestore")
            const q = query(
                collection(db, "users", userId, "giaConversations"),
                orderBy("createdAt", "desc"),
                fbLimit(limit)
            )
            const snapshot = await getDocs(q)
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GIAConversation))
        } catch (error) {
            console.error("Error fetching GIA conversations:", error)
            return []
        }
    }

    async saveGIAConversation(conversation: Omit<GIAConversation, "id" | "createdAt">): Promise<GIAConversation> {
        const userId = await this.ensureUserId()
        const newConvo: GIAConversation = {
            ...conversation,
            id: `convo_${Date.now()}`,
            createdAt: new Date().toISOString(),
        }

        if (!db) {
            const convos = await this.getGIAConversations(100)
            convos.unshift(newConvo)
            // Keep only last 100 conversations locally
            await AsyncStorage.setItem(`@gia_conversations_${userId}`, JSON.stringify(convos.slice(0, 100)))
            return newConvo
        }

        try {
            const { collection, addDoc, serverTimestamp } = await import("firebase/firestore")
            const docRef = await addDoc(collection(db, "users", userId, "giaConversations"), {
                ...conversation,
                createdAt: serverTimestamp(),
            })
            return { ...newConvo, id: docRef.id }
        } catch (error) {
            console.error("Error saving GIA conversation:", error)
            throw error
        }
    }

    // ============================================
    // REAL-TIME SYNC
    // ============================================

    subscribeToBookings(callback: (bookings: Booking[]) => void): () => void {
        if (!db) {
            // No real-time updates without Firebase
            return () => { }
        }

        const unsubscribe = async () => {
            const userId = await this.ensureUserId()
            const { collection, onSnapshot, orderBy, query } = await import("firebase/firestore")

            return onSnapshot(
                query(collection(db, "trainers", userId, "bookings"), orderBy("date", "desc")),
                (snapshot) => {
                    const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking))
                    callback(bookings)
                }
            )
        }

        let unsub: (() => void) | null = null
        unsubscribe().then(fn => { unsub = fn })

        return () => {
            if (unsub) unsub()
        }
    }

    subscribeToClients(callback: (clients: Client[]) => void): () => void {
        if (!db) {
            return () => { }
        }

        const unsubscribe = async () => {
            const userId = await this.ensureUserId()
            const { collection, onSnapshot, orderBy, query } = await import("firebase/firestore")

            return onSnapshot(
                query(collection(db, "trainers", userId, "clients"), orderBy("lastSessionAt", "desc")),
                (snapshot) => {
                    const clients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client))
                    callback(clients)
                }
            )
        }

        let unsub: (() => void) | null = null
        unsubscribe().then(fn => { unsub = fn })

        return () => {
            if (unsub) unsub()
        }
    }
}

// Export singleton
export const trainerDashboardService = TrainerDashboardService.getInstance()

// Export types for web dashboard
export type {
    Client,
    Booking,
    Earnings,
    TrainerProfile,
    TrainerSettings,
    GIAMemory,
    GIAConversation,
}
