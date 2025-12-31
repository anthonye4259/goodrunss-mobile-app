/**
 * Court Status Service - "Waze for Rec Sports"
 * 
 * Aggregates all data sources into a simple, real-time status:
 * - Check-ins (who's there now)
 * - User reports (crowdsourced conditions)
 * - ML predictions (time/weather/population)
 * - Weather conditions
 * 
 * Outputs simple traffic-light style status:
 * EMPTY -> LIGHT -> MODERATE -> BUSY -> PACKED (color-coded)
 */

import { db } from "../firebase-config"
import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    limit,
    Timestamp,
    addDoc,
    serverTimestamp
} from "firebase/firestore"
import { predictVenueTraffic, type VenueType, type WeatherFactors } from "../traffic-prediction"

// ============================================
// TYPES
// ============================================

export type CrowdLevel = "empty" | "light" | "moderate" | "busy" | "packed"

export interface CourtStatus {
    venueId: string
    venueName?: string

    // Primary status
    crowdLevel: CrowdLevel
    crowdColor: string
    crowdLabel: string
    crowdIcon: string  // Icon for crowd level display

    // Timing
    lastReportedAt: Date | null
    dataFreshness: "live" | "recent" | "stale" | "no_data"
    minutesSinceUpdate: number | null

    // Confidence (based on data quality)
    confidence: number          // 0-100
    confidenceLabel: string     // "High", "Medium", "Low"
    reportCount24h: number      // Reports in last 24h

    // Real-time data
    activeCheckIns: number
    recentReports: QuickReport[]

    // Predictions
    predictedWait: string       // "No wait", "5 min", "15+ min"
    bestTimeToVisit: string     // "Now", "7 PM", "Tomorrow morning"
    trend: "increasing" | "steady" | "decreasing"

    // Conditions
    conditions: CourtCondition[]
    hasIssues: boolean
    weatherScore: number        // 0-100 (100 = perfect)
    weatherSummary: string      // "Perfect conditions", "Hot 🔥", etc.
}

export interface QuickReport {
    id: string
    userId: string
    crowdLevel: CrowdLevel
    conditions?: string[]       // ["Lights on", "Wet courts", "Nets up"]
    note?: string
    createdAt: Date
    verified: boolean           // If from check-in location
}

export interface CourtCondition {
    type: string
    label: string
    icon: string
    positive: boolean           // Good or bad condition
}

// ============================================
// CROWD LEVEL MAPPING
// ============================================

const CROWD_LEVELS: Record<CrowdLevel, { color: string; label: string; waitTime: string; icon: string }> = {
    empty: { color: "#22C55E", label: "Empty", waitTime: "No wait", icon: "leaf-outline" },
    light: { color: "#EAB308", label: "Light", waitTime: "No wait", icon: "people-outline" },
    moderate: { color: "#F97316", label: "Moderate", waitTime: "~5 min", icon: "people" },
    busy: { color: "#EF4444", label: "Busy", waitTime: "10-15 min", icon: "alert-circle-outline" },
    packed: { color: "#DC2626", label: "Full", waitTime: "15+ min", icon: "flame-outline" },
}

// ============================================
// CONDITION TYPES
// ============================================

const CONDITION_TYPES: Record<string, CourtCondition> = {
    lights_on: { type: "lights_on", label: "Lights on", icon: "bulb-outline", positive: true },
    lights_off: { type: "lights_off", label: "Lights off", icon: "moon-outline", positive: false },
    wet_courts: { type: "wet_courts", label: "Wet courts", icon: "water-outline", positive: false },
    dry_courts: { type: "dry_courts", label: "Dry courts", icon: "sunny-outline", positive: true },
    nets_up: { type: "nets_up", label: "Nets up", icon: "tennisball-outline", positive: true },
    nets_down: { type: "nets_down", label: "Nets down", icon: "close-outline", positive: false },
    clean: { type: "clean", label: "Clean", icon: "sparkles-outline", positive: true },
    dirty: { type: "dirty", label: "Needs cleaning", icon: "trash-outline", positive: false },
    games_running: { type: "games_running", label: "Games running", icon: "basketball-outline", positive: true },
    reserved: { type: "reserved", label: "Reserved", icon: "calendar-outline", positive: false },
}

// ============================================
// MAIN SERVICE
// ============================================

class CourtStatusService {
    private static instance: CourtStatusService
    private cache: Map<string, { status: CourtStatus; fetchedAt: number }> = new Map()
    private readonly CACHE_TTL = 2 * 60 * 1000 // 2 minutes

    static getInstance(): CourtStatusService {
        if (!CourtStatusService.instance) {
            CourtStatusService.instance = new CourtStatusService()
        }
        return CourtStatusService.instance
    }

    // ============================================
    // GET COURT STATUS (Main API)
    // ============================================

    async getCourtStatus(
        venueId: string,
        venueName?: string,
        venueType: VenueType = "outdoor_court",
        userLocation?: { lat: number; lng: number },
        weather?: WeatherFactors
    ): Promise<CourtStatus> {
        // Check cache
        const cached = this.cache.get(venueId)
        if (cached && Date.now() - cached.fetchedAt < this.CACHE_TTL) {
            return cached.status
        }

        // Fetch all data sources in parallel
        const [checkIns, reports, prediction] = await Promise.all([
            this.getActiveCheckIns(venueId),
            this.getRecentReports(venueId),
            this.getPrediction(venueId, venueType, weather),
        ])

        // Calculate aggregated crowd level
        const crowdLevel = this.calculateCrowdLevel(checkIns, reports, prediction)
        const crowd = CROWD_LEVELS[crowdLevel]

        // Determine data freshness
        const latestReport = reports[0]
        const lastReportedAt = latestReport?.createdAt || null
        const minutesSinceUpdate = lastReportedAt
            ? Math.floor((Date.now() - lastReportedAt.getTime()) / 60000)
            : null
        const dataFreshness = this.getDataFreshness(minutesSinceUpdate, checkIns)

        // Calculate confidence
        const { confidence, confidenceLabel } = this.calculateConfidence(
            checkIns,
            reports.length,
            minutesSinceUpdate,
            dataFreshness
        )

        // Extract conditions from recent reports
        const conditions = this.extractConditions(reports)

        // Calculate weather score (simple 0-100)
        const weatherScore = prediction.weatherImpact
            ? (prediction.level === "low" ? 90 : prediction.level === "moderate" ? 60 : 30)
            : 70

        // Build status object
        const status: CourtStatus = {
            venueId,
            venueName,

            crowdLevel,
            crowdColor: crowd.color,
            crowdLabel: crowd.label,
            crowdIcon: crowd.icon,

            lastReportedAt,
            dataFreshness,
            minutesSinceUpdate,

            confidence,
            confidenceLabel,
            reportCount24h: reports.length,

            activeCheckIns: checkIns,
            recentReports: reports.slice(0, 5),

            predictedWait: crowd.waitTime,
            bestTimeToVisit: this.getBestTime(venueId, venueType, weather),
            trend: this.getTrend(reports),

            conditions,
            hasIssues: conditions.some(c => !c.positive),
            weatherScore,
            weatherSummary: prediction.weatherImpact || "Good conditions",
        }

        // Cache
        this.cache.set(venueId, { status, fetchedAt: Date.now() })

        return status
    }

    // ============================================
    // QUICK REPORT SUBMISSION
    // ============================================

    async submitQuickReport(
        venueId: string,
        userId: string,
        crowdLevel: CrowdLevel,
        conditions?: string[],
        note?: string,
        isVerified: boolean = false
    ): Promise<boolean> {
        if (!db) return false

        try {
            await addDoc(collection(db, "courtReports"), {
                venueId,
                userId,
                crowdLevel,
                conditions: conditions || [],
                note: note || null,
                createdAt: serverTimestamp(),
                verified: isVerified,
                source: "quick_report",
            })

            // Invalidate cache
            this.cache.delete(venueId)

            console.log("[CourtStatus] Quick report submitted for", venueId)
            return true
        } catch (error) {
            console.error("[CourtStatus] Error submitting report:", error)
            return false
        }
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    private async getActiveCheckIns(venueId: string): Promise<number> {
        if (!db) return 0

        try {
            // Check-ins in last 2 hours
            const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
            const q = query(
                collection(db, "checkIns"),
                where("venueId", "==", venueId),
                where("createdAt", ">=", Timestamp.fromDate(twoHoursAgo)),
                where("status", "==", "active")
            )

            const snapshot = await getDocs(q)
            return snapshot.size
        } catch (error) {
            console.error("[CourtStatus] Error fetching check-ins:", error)
            return 0
        }
    }

    private async getRecentReports(venueId: string): Promise<QuickReport[]> {
        if (!db) return []

        try {
            // Reports in last 24 hours
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
            const q = query(
                collection(db, "courtReports"),
                where("venueId", "==", venueId),
                where("createdAt", ">=", Timestamp.fromDate(oneDayAgo)),
                orderBy("createdAt", "desc"),
                limit(20)
            )

            const snapshot = await getDocs(q)
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
            })) as QuickReport[]
        } catch (error) {
            console.error("[CourtStatus] Error fetching reports:", error)
            return []
        }
    }

    private getPrediction(
        venueId: string,
        venueType: VenueType,
        weather?: WeatherFactors
    ) {
        return predictVenueTraffic(venueId, new Date(), undefined, weather, venueType)
    }

    private calculateCrowdLevel(
        checkIns: number,
        reports: QuickReport[],
        prediction: { level: string }
    ): CrowdLevel {
        // Weight: Real-time data > Recent reports > ML prediction

        // If we have recent reports (< 30 min), trust them most
        const recentReport = reports.find(r =>
            (Date.now() - r.createdAt.getTime()) < 30 * 60 * 1000
        )

        if (recentReport) {
            // Recent report takes precedence
            return recentReport.crowdLevel
        }

        // Otherwise, combine check-ins and prediction
        let score = 0

        // Check-ins factor (0-50 points)
        if (checkIns >= 10) score += 50
        else if (checkIns >= 5) score += 35
        else if (checkIns >= 2) score += 20
        else if (checkIns >= 1) score += 10

        // ML prediction factor (0-50 points)
        if (prediction.level === "busy") score += 50
        else if (prediction.level === "moderate") score += 30
        else score += 10

        // Map score to crowd level
        if (score < 20) return "empty"
        if (score < 40) return "light"
        if (score < 60) return "moderate"
        if (score < 80) return "busy"
        return "packed"
    }

    private getDataFreshness(
        minutesSinceUpdate: number | null,
        checkIns: number
    ): CourtStatus["dataFreshness"] {
        if (checkIns > 0) return "live"
        if (minutesSinceUpdate === null) return "no_data"
        if (minutesSinceUpdate < 15) return "recent"
        if (minutesSinceUpdate < 60) return "recent"
        return "stale"
    }

    private calculateConfidence(
        checkIns: number,
        reportCount: number,
        minutesSinceUpdate: number | null,
        freshness: CourtStatus["dataFreshness"]
    ): { confidence: number; confidenceLabel: string } {
        let confidence = 50 // Base

        // Active check-ins boost confidence
        confidence += Math.min(checkIns * 10, 30)

        // Report count boosts confidence
        confidence += Math.min(reportCount * 5, 20)

        // Freshness affects confidence
        if (freshness === "live") confidence += 20
        else if (freshness === "recent") confidence += 10
        else if (freshness === "stale") confidence -= 20
        else if (freshness === "no_data") confidence -= 30

        confidence = Math.max(0, Math.min(100, confidence))

        const confidenceLabel = confidence >= 70 ? "High" : confidence >= 40 ? "Medium" : "Low"

        return { confidence, confidenceLabel }
    }

    private extractConditions(reports: QuickReport[]): CourtCondition[] {
        const conditionCounts = new Map<string, number>()

        // Count occurrences of each condition in recent reports
        for (const report of reports.slice(0, 10)) {
            for (const condition of report.conditions || []) {
                conditionCounts.set(condition, (conditionCounts.get(condition) || 0) + 1)
            }
        }

        // Return conditions that appear in at least 2 reports (or most recent)
        const conditions: CourtCondition[] = []
        for (const [type, count] of conditionCounts) {
            if (CONDITION_TYPES[type] && (count >= 2 || reports.length <= 2)) {
                conditions.push(CONDITION_TYPES[type])
            }
        }

        return conditions
    }

    private getBestTime(
        venueId: string,
        venueType: VenueType,
        weather?: WeatherFactors
    ): string {
        const now = new Date()
        const hour = now.getHours()

        // Check next 6 hours
        for (let h = 0; h <= 6; h++) {
            const testTime = new Date(now.getTime() + h * 60 * 60 * 1000)
            const prediction = predictVenueTraffic(venueId, testTime, undefined, weather, venueType)

            if (prediction.level === "low") {
                if (h === 0) return "Now"
                const futureHour = testTime.getHours()
                const ampm = futureHour >= 12 ? "PM" : "AM"
                const hour12 = futureHour % 12 || 12
                return `${hour12} ${ampm}`
            }
        }

        return "Tomorrow morning"
    }

    private getTrend(reports: QuickReport[]): CourtStatus["trend"] {
        if (reports.length < 2) return "steady"

        const recentLevels = reports.slice(0, 3).map(r => this.crowdLevelToNumber(r.crowdLevel))
        const olderLevels = reports.slice(3, 6).map(r => this.crowdLevelToNumber(r.crowdLevel))

        if (olderLevels.length === 0) return "steady"

        const recentAvg = recentLevels.reduce((a, b) => a + b, 0) / recentLevels.length
        const olderAvg = olderLevels.reduce((a, b) => a + b, 0) / olderLevels.length

        if (recentAvg > olderAvg + 0.5) return "increasing"
        if (recentAvg < olderAvg - 0.5) return "decreasing"
        return "steady"
    }

    private crowdLevelToNumber(level: CrowdLevel): number {
        const map: Record<CrowdLevel, number> = {
            empty: 0,
            light: 1,
            moderate: 2,
            busy: 3,
            packed: 4,
        }
        return map[level]
    }

    // ============================================
    // BULK STATUS FOR MAP VIEW
    // ============================================

    async getStatusForMultipleVenues(
        venueIds: string[],
        venueType: VenueType = "outdoor_court"
    ): Promise<Map<string, CourtStatus>> {
        const results = new Map<string, CourtStatus>()

        // Fetch in parallel (limit to 10 at a time)
        const chunks = []
        for (let i = 0; i < venueIds.length; i += 10) {
            chunks.push(venueIds.slice(i, i + 10))
        }

        for (const chunk of chunks) {
            const statuses = await Promise.all(
                chunk.map(id => this.getCourtStatus(id, undefined, venueType))
            )
            chunk.forEach((id, i) => results.set(id, statuses[i]))
        }

        return results
    }

    // Clear cache (useful for testing/refresh)
    clearCache(): void {
        this.cache.clear()
    }
}

// ============================================
// EXPORTS
// ============================================

export const courtStatusService = CourtStatusService.getInstance()

// Convenience functions
export const getCourtStatus = (
    venueId: string,
    venueName?: string,
    venueType?: VenueType,
    weather?: WeatherFactors
) => courtStatusService.getCourtStatus(venueId, venueName, venueType, undefined, weather)

export const submitQuickReport = (
    venueId: string,
    userId: string,
    crowdLevel: CrowdLevel,
    conditions?: string[],
    note?: string
) => courtStatusService.submitQuickReport(venueId, userId, crowdLevel, conditions, note)
