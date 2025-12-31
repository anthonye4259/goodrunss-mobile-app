/**
 * Remote Training Service
 * 
 * Handles all remote training operations:
 * - Creating/managing remote services (trainer side)
 * - Booking remote services (player side)
 * - Video upload/feedback flow
 * - Live session scheduling
 */

import AsyncStorage from "@react-native-async-storage/async-storage"
import { db, auth } from "@/lib/firebase-config"
import type {
    RemoteService,
    RemoteServiceType,
    RemoteBooking,
    RemoteBookingStatus,
    TrainerInternationalProfile,
    TravelPlan,
} from "@/lib/types/remote-training"

// ============================================
// STORAGE KEYS
// ============================================

const STORAGE_KEYS = {
    MY_REMOTE_SERVICES: "@goodrunss_my_remote_services",
    MY_REMOTE_BOOKINGS: "@goodrunss_my_remote_bookings",
    TRAVEL_PLAN: "@goodrunss_travel_plan",
}

// ============================================
// REMOTE TRAINING SERVICE
// ============================================

class RemoteTrainingService {
    private static instance: RemoteTrainingService

    private constructor() { }

    static getInstance(): RemoteTrainingService {
        if (!RemoteTrainingService.instance) {
            RemoteTrainingService.instance = new RemoteTrainingService()
        }
        return RemoteTrainingService.instance
    }

    // ============================================
    // TRAINER: SERVICE MANAGEMENT
    // ============================================

    /**
     * Get all remote services for the current trainer
     */
    async getMyServices(): Promise<RemoteService[]> {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.MY_REMOTE_SERVICES)
        return stored ? JSON.parse(stored) : []
    }

    /**
     * Create a new remote service
     */
    async createService(service: Omit<RemoteService, "id" | "trainerId" | "createdAt" | "updatedAt">): Promise<RemoteService> {
        const services = await this.getMyServices()
        const userId = auth?.currentUser?.uid || "local_trainer"

        const newService: RemoteService = {
            ...service,
            id: `service_${Date.now()}`,
            trainerId: userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }

        services.push(newService)
        await AsyncStorage.setItem(STORAGE_KEYS.MY_REMOTE_SERVICES, JSON.stringify(services))

        // Sync to Firestore if available
        if (db) {
            try {
                const { doc, setDoc, collection } = await import("firebase/firestore")
                await setDoc(doc(collection(db, "remote_services"), newService.id), newService)
            } catch (error) {
                console.error("Failed to sync service to Firestore:", error)
            }
        }

        return newService
    }

    /**
     * Update an existing remote service
     */
    async updateService(serviceId: string, updates: Partial<RemoteService>): Promise<RemoteService | null> {
        const services = await this.getMyServices()
        const index = services.findIndex(s => s.id === serviceId)

        if (index === -1) return null

        services[index] = {
            ...services[index],
            ...updates,
            updatedAt: new Date().toISOString(),
        }

        await AsyncStorage.setItem(STORAGE_KEYS.MY_REMOTE_SERVICES, JSON.stringify(services))
        return services[index]
    }

    /**
     * Delete a remote service
     */
    async deleteService(serviceId: string): Promise<boolean> {
        const services = await this.getMyServices()
        const filtered = services.filter(s => s.id !== serviceId)

        if (filtered.length === services.length) return false

        await AsyncStorage.setItem(STORAGE_KEYS.MY_REMOTE_SERVICES, JSON.stringify(filtered))
        return true
    }

    // ============================================
    // PLAYER: SERVICE DISCOVERY
    // ============================================

    /**
     * Get all remote services for a specific trainer
     */
    async getTrainerServices(trainerId: string): Promise<RemoteService[]> {
        // In production, this would query Firestore
        // For now, return mock data
        return [
            {
                id: "svc_1",
                trainerId,
                type: "video_analysis",
                name: "Swing Analysis",
                description: "Upload a video of your swing and I'll send detailed feedback within 48 hours.",
                price: 35,
                currency: "USD",
                deliveryTime: "48 hours",
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: "svc_2",
                trainerId,
                type: "live_session",
                name: "1:1 Video Coaching",
                description: "Live video session where we work on technique in real-time.",
                price: 75,
                currency: "USD",
                duration: 60,
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: "svc_3",
                trainerId,
                type: "training_plan",
                name: "Monthly Training Plan",
                description: "Custom drill program tailored to your goals, updated weekly.",
                price: 99,
                currency: "USD",
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        ]
    }

    /**
     * Search for trainers with remote services
     */
    async searchRemoteTrainers(filters: {
        sport?: string
        city?: string
        serviceType?: RemoteServiceType
        language?: string
        maxPrice?: number
    }): Promise<any[]> {
        // In production, this would query Firestore with filters
        // For now, return mock data
        return [
            {
                id: "trainer_1",
                name: "Carlos Martinez",
                sport: "Padel",
                city: "Marbella",
                country: "Spain",
                rating: 4.9,
                reviewCount: 127,
                languages: ["English", "Spanish"],
                isInternationalTrainer: true,
                remoteServicesEnabled: true,
                avatar: null,
            },
            {
                id: "trainer_2",
                name: "Ahmed Al-Rashid",
                sport: "Tennis",
                city: "Dubai",
                country: "UAE",
                rating: 4.8,
                reviewCount: 89,
                languages: ["English", "Arabic"],
                isInternationalTrainer: true,
                remoteServicesEnabled: true,
                avatar: null,
            },
        ]
    }

    // ============================================
    // PLAYER: BOOKING FLOW
    // ============================================

    /**
     * Book a remote service
     */
    async bookService(
        service: RemoteService,
        options: {
            scheduledAt?: string // For live sessions
            notes?: string
        }
    ): Promise<RemoteBooking> {
        const userId = auth?.currentUser?.uid || "local_player"
        const bookings = await this.getMyBookings()

        const booking: RemoteBooking = {
            id: `booking_${Date.now()}`,
            serviceId: service.id,
            service,
            playerId: userId,
            trainerId: service.trainerId,
            status: service.type === "live_session" ? "pending_payment" : "pending_upload",
            scheduledAt: options.scheduledAt,
            notes: options.notes,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }

        bookings.push(booking)
        await AsyncStorage.setItem(STORAGE_KEYS.MY_REMOTE_BOOKINGS, JSON.stringify(bookings))

        // Sync to Firestore
        if (db) {
            try {
                const { doc, setDoc, collection } = await import("firebase/firestore")
                await setDoc(doc(collection(db, "remote_bookings"), booking.id), booking)
            } catch (error) {
                console.error("Failed to sync booking to Firestore:", error)
            }
        }

        return booking
    }

    /**
     * Get all bookings for the current user
     */
    async getMyBookings(): Promise<RemoteBooking[]> {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.MY_REMOTE_BOOKINGS)
        return stored ? JSON.parse(stored) : []
    }

    /**
     * Upload video for analysis
     */
    async uploadVideoForBooking(bookingId: string, videoUri: string): Promise<boolean> {
        const bookings = await this.getMyBookings()
        const index = bookings.findIndex(b => b.id === bookingId)

        if (index === -1) return false

        // In production, upload to cloud storage and get URL
        bookings[index].playerVideoUrl = videoUri
        bookings[index].status = "pending_review"
        bookings[index].updatedAt = new Date().toISOString()

        await AsyncStorage.setItem(STORAGE_KEYS.MY_REMOTE_BOOKINGS, JSON.stringify(bookings))
        return true
    }

    // ============================================
    // TRAINER: BOOKING MANAGEMENT
    // ============================================

    /**
     * Get bookings for the current trainer (video inbox)
     */
    async getTrainerBookings(): Promise<RemoteBooking[]> {
        // In production, query Firestore for trainerId
        const allBookings = await this.getMyBookings()
        const userId = auth?.currentUser?.uid || "local_trainer"
        return allBookings.filter(b => b.trainerId === userId)
    }

    /**
     * Send feedback for a booking
     */
    async sendFeedback(
        bookingId: string,
        feedback: {
            videoUrl?: string
            text?: string
        }
    ): Promise<boolean> {
        const bookings = await this.getMyBookings()
        const index = bookings.findIndex(b => b.id === bookingId)

        if (index === -1) return false

        bookings[index].coachFeedbackUrl = feedback.videoUrl
        bookings[index].coachFeedbackText = feedback.text
        bookings[index].status = "feedback_sent"
        bookings[index].updatedAt = new Date().toISOString()

        await AsyncStorage.setItem(STORAGE_KEYS.MY_REMOTE_BOOKINGS, JSON.stringify(bookings))
        return true
    }

    // ============================================
    // TRAVEL MODE
    // ============================================

    /**
     * Set travel plan for the user
     */
    async setTravelPlan(plan: Omit<TravelPlan, "userId" | "createdAt">): Promise<TravelPlan> {
        const userId = auth?.currentUser?.uid || "local_user"

        const travelPlan: TravelPlan = {
            ...plan,
            userId,
            createdAt: new Date().toISOString(),
        }

        await AsyncStorage.setItem(STORAGE_KEYS.TRAVEL_PLAN, JSON.stringify(travelPlan))
        return travelPlan
    }

    /**
     * Get current travel plan
     */
    async getTravelPlan(): Promise<TravelPlan | null> {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.TRAVEL_PLAN)
        return stored ? JSON.parse(stored) : null
    }

    /**
     * Clear travel plan
     */
    async clearTravelPlan(): Promise<void> {
        await AsyncStorage.removeItem(STORAGE_KEYS.TRAVEL_PLAN)
    }
}

export const remoteTrainingService = RemoteTrainingService.getInstance()
