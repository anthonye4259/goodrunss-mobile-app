/**
 * Crowd Level Service (Waze-style)
 * Real-time busyness tracking for venues
 * 
 * "Court 3 is quiet right now"
 * "Peak hours: 6-8pm"
 * "Best time to visit: Tuesday 2pm"
 */

import { db } from "../firebase-config"

export type CrowdLevel = "quiet" | "moderate" | "busy" | "packed" | "unknown"

export interface VenueCrowdData {
    venueId: string
    currentLevel: CrowdLevel
    lastUpdated: Date

    // Historical patterns
    hourlyPattern: { [hour: string]: CrowdLevel }
    dailyPattern: { [day: string]: CrowdLevel }

    // Real-time signals
    activeCheckins: number
    activeBookings: number
    waitlistSize: number

    // Predictions
    peakHours: string[]
    bestTimes: { day: string; hour: string }[]
}

export interface CrowdCheckIn {
    id: string
    venueId: string
    courtId?: string
    userId: string
    crowdLevel: CrowdLevel
    note?: string
    timestamp: Date
}

const CHECKINS_COLLECTION = "crowd_checkins"

// Crowd level thresholds
const CROWD_THRESHOLDS = {
    quiet: { min: 0, max: 25 }, // 0-25% capacity
    moderate: { min: 25, max: 50 },
    busy: { min: 50, max: 75 },
    packed: { min: 75, max: 100 },
}

// Default hourly patterns (typical gym/court patterns)
const DEFAULT_HOURLY_PATTERNS: { [hour: number]: CrowdLevel } = {
    6: "quiet",
    7: "moderate",
    8: "moderate",
    9: "quiet",
    10: "quiet",
    11: "quiet",
    12: "moderate",
    13: "quiet",
    14: "quiet",
    15: "quiet",
    16: "moderate",
    17: "busy",
    18: "packed",
    19: "busy",
    20: "moderate",
    21: "quiet",
}

// Weekend patterns (different)
const WEEKEND_PATTERNS: { [hour: number]: CrowdLevel } = {
    7: "quiet",
    8: "moderate",
    9: "busy",
    10: "busy",
    11: "moderate",
    12: "moderate",
    13: "quiet",
    14: "quiet",
    15: "moderate",
    16: "moderate",
    17: "moderate",
    18: "quiet",
}

export const crowdLevelService = {
    /**
     * Get current crowd level for a venue
     */
    async getCurrentLevel(venueId: string): Promise<{
        level: CrowdLevel
        label: string
        color: string
        message: string
    }> {
        if (!db) {
            return this.formatCrowdLevel("unknown")
        }

        try {
            const { collection, query, where, orderBy, limit, getDocs } = await import("firebase/firestore")

            const now = new Date()
            const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

            // Get recent check-ins
            const checkinsQuery = query(
                collection(db, CHECKINS_COLLECTION),
                where("venueId", "==", venueId),
                where("timestamp", ">=", oneHourAgo),
                orderBy("timestamp", "desc"),
                limit(10)
            )

            const snapshot = await getDocs(checkinsQuery)

            if (snapshot.empty) {
                // No recent check-ins, use predicted pattern
                return this.formatCrowdLevel(this.getPredictedLevel())
            }

            // Calculate average from recent check-ins
            const levelCounts: { [key in CrowdLevel]: number } = {
                quiet: 0,
                moderate: 0,
                busy: 0,
                packed: 0,
                unknown: 0,
            }

            snapshot.docs.forEach(doc => {
                const level = doc.data().crowdLevel as CrowdLevel
                levelCounts[level]++
            })

            // Get most common level
            const level = Object.entries(levelCounts)
                .filter(([k]) => k !== "unknown")
                .sort((a, b) => b[1] - a[1])[0][0] as CrowdLevel

            return this.formatCrowdLevel(level)
        } catch (error) {
            console.error("Error getting crowd level:", error)
            return this.formatCrowdLevel(this.getPredictedLevel())
        }
    },

    /**
     * Get predicted level based on current time
     */
    getPredictedLevel(): CrowdLevel {
        const now = new Date()
        const hour = now.getHours()
        const isWeekend = now.getDay() === 0 || now.getDay() === 6

        const patterns = isWeekend ? WEEKEND_PATTERNS : DEFAULT_HOURLY_PATTERNS
        return patterns[hour] || "unknown"
    },

    /**
     * Format crowd level for display
     */
    formatCrowdLevel(level: CrowdLevel): {
        level: CrowdLevel
        label: string
        color: string
        message: string
    } {
        switch (level) {
            case "quiet":
                return {
                    level,
                    label: "Quiet",
                    color: "#6B9B5A",
                    message: "Great time to visit! Plenty of availability.",
                }
            case "moderate":
                return {
                    level,
                    label: "Moderate",
                    color: "#FFD700",
                    message: "Some activity. Book ahead to be safe.",
                }
            case "busy":
                return {
                    level,
                    label: "Busy",
                    color: "#FF9500",
                    message: "Popular right now. Expect some wait times.",
                }
            case "packed":
                return {
                    level,
                    label: "Packed",
                    color: "#FF6B6B",
                    message: "Very busy! Consider booking a different time.",
                }
            default:
                return {
                    level: "unknown",
                    label: "Unknown",
                    color: "#888",
                    message: "No recent crowd data available.",
                }
        }
    },

    /**
     * Submit crowd check-in (Waze-style contribution)
     */
    async submitCheckIn(
        venueId: string,
        userId: string,
        crowdLevel: CrowdLevel,
        courtId?: string,
        note?: string
    ): Promise<string | null> {
        if (!db) return null

        try {
            const { collection, addDoc, serverTimestamp } = await import("firebase/firestore")

            const docRef = await addDoc(collection(db, CHECKINS_COLLECTION), {
                venueId,
                userId,
                courtId,
                crowdLevel,
                note,
                timestamp: serverTimestamp(),
            })

            return docRef.id
        } catch (error) {
            console.error("Error submitting check-in:", error)
            return null
        }
    },

    /**
     * Get best times to visit (based on historical data)
     */
    async getBestTimes(venueId: string): Promise<{
        bestTime: { day: string; hour: string; level: CrowdLevel }
        peakHours: { hour: string; level: CrowdLevel }[]
        quietHours: { hour: string; level: CrowdLevel }[]
    }> {
        // In production, this would analyze historical check-ins
        // For now, use default patterns

        const quietHours = Object.entries(DEFAULT_HOURLY_PATTERNS)
            .filter(([, level]) => level === "quiet")
            .map(([hour]) => ({
                hour: `${parseInt(hour)}:00`,
                level: "quiet" as CrowdLevel,
            }))

        const peakHours = Object.entries(DEFAULT_HOURLY_PATTERNS)
            .filter(([, level]) => level === "busy" || level === "packed")
            .map(([hour]) => ({
                hour: `${parseInt(hour)}:00`,
                level: DEFAULT_HOURLY_PATTERNS[parseInt(hour)],
            }))

        return {
            bestTime: {
                day: "Tuesday",
                hour: "2:00 PM",
                level: "quiet",
            },
            peakHours,
            quietHours,
        }
    },

    /**
     * Get hourly crowd chart data
     */
    getHourlyCrowdChart(isWeekend: boolean = false): {
        hour: number
        level: CrowdLevel
        percentage: number
    }[] {
        const patterns = isWeekend ? WEEKEND_PATTERNS : DEFAULT_HOURLY_PATTERNS

        return Object.entries(patterns).map(([hour, level]) => ({
            hour: parseInt(hour),
            level,
            percentage: this.levelToPercentage(level),
        }))
    },

    /**
     * Convert level to percentage for charts
     */
    levelToPercentage(level: CrowdLevel): number {
        switch (level) {
            case "quiet": return 20
            case "moderate": return 45
            case "busy": return 70
            case "packed": return 90
            default: return 0
        }
    },

    /**
     * Get crowd summary for venue card badge
     */
    async getCrowdBadge(venueId: string): Promise<{
        text: string
        color: string
        icon: string
    }> {
        const { level, color } = await this.getCurrentLevel(venueId)

        const badges: { [key in CrowdLevel]: { text: string; icon: string } } = {
            quiet: { text: "Quiet now", icon: "checkmark-circle" },
            moderate: { text: "Some activity", icon: "time" },
            busy: { text: "Busy", icon: "people" },
            packed: { text: "Very busy", icon: "alert-circle" },
            unknown: { text: "", icon: "" },
        }

        return {
            text: badges[level].text,
            color,
            icon: badges[level].icon,
        }
    },

    /**
     * Get multiple venues' crowd levels at once
     */
    async getBulkCrowdLevels(venueIds: string[]): Promise<{
        [venueId: string]: {
            level: CrowdLevel
            label: string
            color: string
        }
    }> {
        const results: { [venueId: string]: { level: CrowdLevel; label: string; color: string } } = {}

        // In production, this would be a batch query
        // For now, use predicted levels for efficiency
        const predictedLevel = this.getPredictedLevel()
        const formatted = this.formatCrowdLevel(predictedLevel)

        for (const venueId of venueIds) {
            results[venueId] = {
                level: formatted.level,
                label: formatted.label,
                color: formatted.color,
            }
        }

        return results
    },
}

export default crowdLevelService
