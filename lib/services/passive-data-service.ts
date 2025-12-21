/**
 * Passive Data Capture Service
 * 
 * Captures data from every interaction, even passive ones.
 * This is how the flywheel compounds.
 * 
 * Every open, every view, every second near a court = data.
 */

import AsyncStorage from "@react-native-async-storage/async-storage"
import { db } from "../firebase-config"
import {
    collection,
    addDoc,
    serverTimestamp,
    increment,
    doc,
    setDoc,
    updateDoc
} from "firebase/firestore"
import * as Location from "expo-location"

// ============================================
// TYPES
// ============================================

export interface DataPoint {
    type: DataPointType
    venueId?: string
    lat?: number
    lng?: number
    timestamp: Date
    userId?: string
    metadata?: Record<string, any>
}

export type DataPointType =
    | "app_open"           // Opened app
    | "venue_view"         // Viewed venue page
    | "venue_time"         // Time spent on venue page
    | "near_venue"         // Detected near a venue
    | "check_in"           // Explicit check-in
    | "check_out"          // Left venue
    | "search"             // Searched for courts
    | "share"              // Shared venue
    | "invite"             // Sent game invite
    | "report"             // Submitted report

// ============================================
// MAIN SERVICE
// ============================================

class PassiveDataService {
    private static instance: PassiveDataService
    private sessionId: string = ""
    private venueViewStart: Map<string, number> = new Map()

    static getInstance(): PassiveDataService {
        if (!PassiveDataService.instance) {
            PassiveDataService.instance = new PassiveDataService()
        }
        return PassiveDataService.instance
    }

    constructor() {
        this.sessionId = this.generateSessionId()
    }

    // ============================================
    // CAPTURE METHODS
    // ============================================

    async captureAppOpen(userId?: string): Promise<void> {
        await this.capture({
            type: "app_open",
            timestamp: new Date(),
            userId,
            metadata: { sessionId: this.sessionId },
        })

        // Also capture location if available
        await this.captureLocationPassive(userId)
    }

    async captureVenueView(venueId: string, userId?: string): Promise<void> {
        // Start timing
        this.venueViewStart.set(venueId, Date.now())

        await this.capture({
            type: "venue_view",
            venueId,
            timestamp: new Date(),
            userId,
        })

        // Increment venue view count
        await this.incrementVenueStat(venueId, "views")
    }

    async captureVenueExit(venueId: string, userId?: string): Promise<void> {
        const startTime = this.venueViewStart.get(venueId)
        if (!startTime) return

        const duration = Math.floor((Date.now() - startTime) / 1000) // seconds
        this.venueViewStart.delete(venueId)

        await this.capture({
            type: "venue_time",
            venueId,
            timestamp: new Date(),
            userId,
            metadata: { durationSeconds: duration },
        })

        // Long view = high interest
        if (duration > 30) {
            await this.incrementVenueStat(venueId, "engagedViews")
        }
    }

    async captureSearch(query: string, sport?: string, userId?: string): Promise<void> {
        await this.capture({
            type: "search",
            timestamp: new Date(),
            userId,
            metadata: { query, sport },
        })
    }

    async captureShare(venueId: string, userId?: string): Promise<void> {
        await this.capture({
            type: "share",
            venueId,
            timestamp: new Date(),
            userId,
        })

        await this.incrementVenueStat(venueId, "shares")
    }

    async captureInvite(venueId: string, userId?: string): Promise<void> {
        await this.capture({
            type: "invite",
            venueId,
            timestamp: new Date(),
            userId,
        })

        await this.incrementVenueStat(venueId, "invites")
    }

    async captureCheckIn(venueId: string, userId: string): Promise<void> {
        await this.capture({
            type: "check_in",
            venueId,
            timestamp: new Date(),
            userId,
        })

        await this.incrementVenueStat(venueId, "checkIns")
        await this.incrementVenueStat(venueId, "totalVisits")
    }

    async captureCheckOut(venueId: string, userId: string, durationMinutes: number): Promise<void> {
        await this.capture({
            type: "check_out",
            venueId,
            timestamp: new Date(),
            userId,
            metadata: { durationMinutes },
        })
    }

    async captureReport(venueId: string, userId: string, reportType: string): Promise<void> {
        await this.capture({
            type: "report",
            venueId,
            timestamp: new Date(),
            userId,
            metadata: { reportType },
        })

        await this.incrementVenueStat(venueId, "reports")
    }

    // ============================================
    // PASSIVE LOCATION CAPTURE
    // ============================================

    async captureLocationPassive(userId?: string): Promise<void> {
        try {
            const { status } = await Location.getForegroundPermissionsAsync()
            if (status !== "granted") return

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            })

            await this.capture({
                type: "near_venue",
                lat: location.coords.latitude,
                lng: location.coords.longitude,
                timestamp: new Date(),
                userId,
                metadata: {
                    accuracy: location.coords.accuracy,
                    passive: true,
                },
            })
        } catch (error) {
            // Silent fail - passive capture shouldn't interrupt UX
            console.log("[PassiveData] Location capture failed:", error)
        }
    }

    // ============================================
    // CORE CAPTURE
    // ============================================

    private async capture(dataPoint: DataPoint): Promise<void> {
        // Save locally first (fast)
        await this.saveLocally(dataPoint)

        // Then sync to Firebase (background)
        this.syncToFirebase(dataPoint).catch(console.error)
    }

    private async saveLocally(dataPoint: DataPoint): Promise<void> {
        try {
            const key = `datapoints_${Date.now()}`
            await AsyncStorage.setItem(key, JSON.stringify(dataPoint))
        } catch (error) {
            console.error("[PassiveData] Local save error:", error)
        }
    }

    private async syncToFirebase(dataPoint: DataPoint): Promise<void> {
        if (!db) return

        try {
            await addDoc(collection(db, "dataPoints"), {
                ...dataPoint,
                timestamp: serverTimestamp(),
                sessionId: this.sessionId,
            })
        } catch (error) {
            console.error("[PassiveData] Firebase sync error:", error)
        }
    }

    // ============================================
    // VENUE STATS
    // ============================================

    private async incrementVenueStat(venueId: string, stat: string): Promise<void> {
        if (!db) return

        try {
            const today = new Date().toISOString().split("T")[0] // YYYY-MM-DD
            const docRef = doc(db, "venueStats", `${venueId}_${today}`)

            await setDoc(docRef, {
                venueId,
                date: today,
                [stat]: increment(1),
                updatedAt: serverTimestamp(),
            }, { merge: true })
        } catch (error) {
            console.error("[PassiveData] Stat increment error:", error)
        }
    }

    // ============================================
    // HELPERS
    // ============================================

    private generateSessionId(): string {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    // ============================================
    // GET VENUE STATS (for display)
    // ============================================

    async getVenueActivity(venueId: string): Promise<{
        todayViews: number
        todayCheckIns: number
        todayShares: number
        isActive: boolean
    }> {
        // Returns stats for display
        // Even if 0, we show mock data in the UI
        // This just returns real data to supplement

        const today = new Date().toISOString().split("T")[0]
        const docRef = doc(db!, "venueStats", `${venueId}_${today}`)

        try {
            const { getDoc } = await import("firebase/firestore")
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                const data = docSnap.data()
                return {
                    todayViews: data.views || 0,
                    todayCheckIns: data.checkIns || 0,
                    todayShares: data.shares || 0,
                    isActive: (data.checkIns || 0) > 0,
                }
            }
        } catch (error) {
            console.error("[PassiveData] Get stats error:", error)
        }

        return {
            todayViews: 0,
            todayCheckIns: 0,
            todayShares: 0,
            isActive: false,
        }
    }
}

// ============================================
// EXPORTS
// ============================================

export const passiveDataService = PassiveDataService.getInstance()

export const captureAppOpen = (userId?: string) =>
    passiveDataService.captureAppOpen(userId)

export const captureVenueView = (venueId: string, userId?: string) =>
    passiveDataService.captureVenueView(venueId, userId)

export const captureVenueExit = (venueId: string, userId?: string) =>
    passiveDataService.captureVenueExit(venueId, userId)

export const captureSearch = (query: string, sport?: string, userId?: string) =>
    passiveDataService.captureSearch(query, sport, userId)

export const captureShare = (venueId: string, userId?: string) =>
    passiveDataService.captureShare(venueId, userId)

export const captureInvite = (venueId: string, userId?: string) =>
    passiveDataService.captureInvite(venueId, userId)

export const captureCheckIn = (venueId: string, userId: string) =>
    passiveDataService.captureCheckIn(venueId, userId)

export const captureCheckOut = (venueId: string, userId: string, durationMinutes: number) =>
    passiveDataService.captureCheckOut(venueId, userId, durationMinutes)

export const captureReport = (venueId: string, userId: string, reportType: string) =>
    passiveDataService.captureReport(venueId, userId, reportType)

export const getVenueActivity = (venueId: string) =>
    passiveDataService.getVenueActivity(venueId)
