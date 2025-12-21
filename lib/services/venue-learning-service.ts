/**
 * Venue Learning Service - THE ACCURACY FLYWHEEL
 * 
 * Makes predictions smarter over time by:
 * - Tracking predicted vs actual activity
 * - Learning venue-specific patterns
 * - Building per-venue confidence
 * 
 * Each venue develops its own "personality":
 * - "League night Wednesdays"
 * - "Dead on Mondays"
 * - "Morning regulars 6-8 AM"
 */

import { db } from "../firebase-config"
import {
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    increment,
    arrayUnion,
    Timestamp,
    query,
    where,
    getDocs,
    orderBy,
    limit
} from "firebase/firestore"
import type { ActivityLevel, Sport } from "./sport-intelligence-service"

// ============================================
// TYPES
// ============================================

export interface VenueProfile {
    venueId: string
    sport: Sport

    // Learned patterns (deviation from base)
    patternAdjustments: {
        weekday: number[]     // 24 hours, -50 to +50 adjustment
        weekend: number[]
    }

    // Special patterns detected
    specialPatterns: VenuePattern[]

    // Accuracy tracking
    accuracy: {
        totalPredictions: number
        correctPredictions: number
        accuracyRate: number     // 0-100
        lastUpdated: string
    }

    // Confidence level
    confidence: "low" | "medium" | "high" | "very_high"
    dataPoints: number

    // Insights from pattern detection
    insights: string[]          // "Busy Wednesdays", "Morning regulars", etc.

    // Metadata
    createdAt: string
    updatedAt: string
}

export interface VenuePattern {
    id: string
    type: "recurring" | "one_time" | "seasonal"
    name: string                // "League Night", "Morning Regulars"
    dayOfWeek?: number          // 0-6
    hourStart: number
    hourEnd: number
    adjustment: number          // -50 to +50
    confidence: number          // 0-100
    occurrences: number         // How many times detected
}

export interface ActivityDataPoint {
    venueId: string
    sport: Sport
    timestamp: Date
    dayOfWeek: number
    hour: number
    predictedLevel: ActivityLevel
    actualLevel: ActivityLevel
    wasAccurate: boolean
    source: "user_report" | "check_in" | "validation"
}

export interface PredictionValidation {
    venueId: string
    predictionTime: Date
    visitTime: Date
    predictedLevel: ActivityLevel
    actualLevel: ActivityLevel | null
    wasAccurate: boolean | null
    userId: string
}

// ============================================
// ACTIVITY LEVEL HELPERS
// ============================================

const ACTIVITY_SCORES: Record<ActivityLevel, number> = {
    dead: 0,
    quiet: 25,
    active: 50,
    busy: 75,
    packed: 100,
}

function activityLevelToScore(level: ActivityLevel): number {
    return ACTIVITY_SCORES[level]
}

function scoreToActivityLevel(score: number): ActivityLevel {
    if (score < 12) return "dead"
    if (score < 37) return "quiet"
    if (score < 62) return "active"
    if (score < 87) return "busy"
    return "packed"
}

function isPredictionAccurate(predicted: ActivityLevel, actual: ActivityLevel): boolean {
    const predScore = ACTIVITY_SCORES[predicted]
    const actualScore = ACTIVITY_SCORES[actual]
    // Within 25 points = accurate (one level off is OK)
    return Math.abs(predScore - actualScore) <= 25
}

// ============================================
// MAIN SERVICE
// ============================================

class VenueLearningService {
    private static instance: VenueLearningService
    private profileCache: Map<string, VenueProfile> = new Map()

    static getInstance(): VenueLearningService {
        if (!VenueLearningService.instance) {
            VenueLearningService.instance = new VenueLearningService()
        }
        return VenueLearningService.instance
    }

    // ============================================
    // GET VENUE PROFILE
    // ============================================

    async getVenueProfile(venueId: string, sport: Sport): Promise<VenueProfile> {
        const cacheKey = `${venueId}-${sport}`

        // Check cache
        if (this.profileCache.has(cacheKey)) {
            return this.profileCache.get(cacheKey)!
        }

        if (!db) {
            return this.createEmptyProfile(venueId, sport)
        }

        try {
            const docRef = doc(db, "venueProfiles", cacheKey)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                const profile = docSnap.data() as VenueProfile
                this.profileCache.set(cacheKey, profile)
                return profile
            }
        } catch (error) {
            console.error("[VenueLearning] Error fetching profile:", error)
        }

        return this.createEmptyProfile(venueId, sport)
    }

    private createEmptyProfile(venueId: string, sport: Sport): VenueProfile {
        return {
            venueId,
            sport,
            patternAdjustments: {
                weekday: new Array(24).fill(0),
                weekend: new Array(24).fill(0),
            },
            specialPatterns: [],
            accuracy: {
                totalPredictions: 0,
                correctPredictions: 0,
                accuracyRate: 0,
                lastUpdated: new Date().toISOString(),
            },
            confidence: "low",
            dataPoints: 0,
            insights: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
    }

    // ============================================
    // GET PATTERN ADJUSTMENT
    // ============================================

    async getPatternAdjustment(
        venueId: string,
        sport: Sport,
        isWeekend: boolean,
        hour: number
    ): Promise<number> {
        const profile = await this.getVenueProfile(venueId, sport)
        const pattern = isWeekend
            ? profile.patternAdjustments.weekend
            : profile.patternAdjustments.weekday

        return pattern[hour] || 0
    }

    // ============================================
    // RECORD ACTIVITY (Learning)
    // ============================================

    async recordActivity(dataPoint: ActivityDataPoint): Promise<void> {
        if (!db) return

        const cacheKey = `${dataPoint.venueId}-${dataPoint.sport}`

        try {
            // Record the data point
            await setDoc(
                doc(collection(db, "activityDataPoints")),
                {
                    ...dataPoint,
                    timestamp: Timestamp.fromDate(dataPoint.timestamp),
                    createdAt: Timestamp.now(),
                }
            )

            // Update venue profile
            await this.updateVenueProfile(dataPoint)

            // Clear cache
            this.profileCache.delete(cacheKey)

            console.log("[VenueLearning] Recorded activity:", dataPoint)
        } catch (error) {
            console.error("[VenueLearning] Error recording activity:", error)
        }
    }

    private async updateVenueProfile(dataPoint: ActivityDataPoint): Promise<void> {
        if (!db) return

        const cacheKey = `${dataPoint.venueId}-${dataPoint.sport}`
        const docRef = doc(db, "venueProfiles", cacheKey)

        try {
            const profile = await this.getVenueProfile(dataPoint.venueId, dataPoint.sport)

            // Calculate adjustment based on prediction error
            const predScore = activityLevelToScore(dataPoint.predictedLevel)
            const actualScore = activityLevelToScore(dataPoint.actualLevel)
            const error = actualScore - predScore

            // Dampen the adjustment (learn slowly, prevent overfitting)
            const adjustment = error * 0.1

            // Update the appropriate hour in the pattern
            const isWeekend = dataPoint.dayOfWeek === 0 || dataPoint.dayOfWeek === 6
            const pattern = isWeekend
                ? [...profile.patternAdjustments.weekend]
                : [...profile.patternAdjustments.weekday]

            // Apply adjustment with decay (max ±50)
            pattern[dataPoint.hour] = Math.max(-50, Math.min(50,
                pattern[dataPoint.hour] + adjustment
            ))

            // Update accuracy
            const newTotal = profile.accuracy.totalPredictions + 1
            const newCorrect = profile.accuracy.correctPredictions + (dataPoint.wasAccurate ? 1 : 0)
            const newAccuracy = Math.round((newCorrect / newTotal) * 100)

            // Determine confidence level
            const newDataPoints = profile.dataPoints + 1
            let confidence: VenueProfile["confidence"] = "low"
            if (newDataPoints >= 100) confidence = "very_high"
            else if (newDataPoints >= 50) confidence = "high"
            else if (newDataPoints >= 20) confidence = "medium"

            // Generate insights
            const insights = this.generateInsights(
                isWeekend ? profile.patternAdjustments.weekday : pattern,
                isWeekend ? pattern : profile.patternAdjustments.weekend,
                dataPoint.sport
            )

            // Save updated profile
            await setDoc(docRef, {
                venueId: dataPoint.venueId,
                sport: dataPoint.sport,
                patternAdjustments: {
                    weekday: isWeekend ? profile.patternAdjustments.weekday : pattern,
                    weekend: isWeekend ? pattern : profile.patternAdjustments.weekend,
                },
                specialPatterns: profile.specialPatterns,
                accuracy: {
                    totalPredictions: newTotal,
                    correctPredictions: newCorrect,
                    accuracyRate: newAccuracy,
                    lastUpdated: new Date().toISOString(),
                },
                confidence,
                dataPoints: newDataPoints,
                insights,
                createdAt: profile.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            })

        } catch (error) {
            console.error("[VenueLearning] Error updating profile:", error)
        }
    }

    // ============================================
    // GENERATE INSIGHTS
    // ============================================

    private generateInsights(
        weekdayPattern: number[],
        weekendPattern: number[],
        sport: Sport
    ): string[] {
        const insights: string[] = []

        // Find peak hours
        const weekdayPeak = this.findPeakHours(weekdayPattern)
        const weekendPeak = this.findPeakHours(weekendPattern)

        if (weekdayPeak.adjustment > 20) {
            insights.push(`Busier than usual ${this.formatHourRange(weekdayPeak.start, weekdayPeak.end)} weekdays`)
        }
        if (weekdayPeak.adjustment < -20) {
            insights.push(`Quieter than usual ${this.formatHourRange(weekdayPeak.start, weekdayPeak.end)} weekdays`)
        }

        if (weekendPeak.adjustment > 20) {
            insights.push(`Weekend peak: ${this.formatHourRange(weekendPeak.start, weekendPeak.end)}`)
        }

        // Morning vs evening pattern
        const morningAvg = weekdayPattern.slice(6, 10).reduce((a, b) => a + b, 0) / 4
        const eveningAvg = weekdayPattern.slice(17, 21).reduce((a, b) => a + b, 0) / 4

        if (morningAvg > eveningAvg + 15) {
            insights.push("Morning crowd here")
        } else if (eveningAvg > morningAvg + 15) {
            insights.push("Evening crowd favorite")
        }

        return insights.slice(0, 3) // Max 3 insights
    }

    private findPeakHours(pattern: number[]): { start: number; end: number; adjustment: number } {
        let maxSum = -Infinity
        let peakStart = 0
        let peakEnd = 0
        let peakAdjustment = 0

        // Sliding window of 3 hours
        for (let i = 0; i < 22; i++) {
            const sum = pattern[i] + pattern[i + 1] + pattern[i + 2]
            if (sum > maxSum) {
                maxSum = sum
                peakStart = i
                peakEnd = i + 2
                peakAdjustment = sum / 3
            }
        }

        return { start: peakStart, end: peakEnd, adjustment: peakAdjustment }
    }

    private formatHourRange(start: number, end: number): string {
        const format = (h: number) => {
            const ampm = h >= 12 ? "PM" : "AM"
            const hour12 = h % 12 || 12
            return `${hour12}${ampm}`
        }
        return `${format(start)}-${format(end)}`
    }

    // ============================================
    // VALIDATION SYSTEM
    // ============================================

    async recordValidation(validation: PredictionValidation): Promise<void> {
        if (!db) return

        try {
            // Store validation
            await setDoc(
                doc(collection(db, "predictionValidations")),
                {
                    ...validation,
                    predictionTime: Timestamp.fromDate(validation.predictionTime),
                    visitTime: Timestamp.fromDate(validation.visitTime),
                    createdAt: Timestamp.now(),
                }
            )

            // If user provided actual level, record as activity data point
            if (validation.actualLevel !== null) {
                const visitDate = validation.visitTime
                await this.recordActivity({
                    venueId: validation.venueId,
                    sport: "basketball", // TODO: Pass sport through
                    timestamp: visitDate,
                    dayOfWeek: visitDate.getDay(),
                    hour: visitDate.getHours(),
                    predictedLevel: validation.predictedLevel,
                    actualLevel: validation.actualLevel,
                    wasAccurate: validation.wasAccurate || false,
                    source: "validation",
                })
            }

            console.log("[VenueLearning] Recorded validation")
        } catch (error) {
            console.error("[VenueLearning] Error recording validation:", error)
        }
    }

    // ============================================
    // GET VENUE ACCURACY STATS
    // ============================================

    async getVenueAccuracy(venueId: string, sport: Sport): Promise<{
        accuracy: number
        confidence: string
        dataPoints: number
        insights: string[]
    }> {
        const profile = await this.getVenueProfile(venueId, sport)

        return {
            accuracy: profile.accuracy.accuracyRate,
            confidence: profile.confidence,
            dataPoints: profile.dataPoints,
            insights: profile.insights,
        }
    }

    // ============================================
    // DETECT SPECIAL PATTERNS
    // ============================================

    async detectSpecialPatterns(venueId: string, sport: Sport): Promise<VenuePattern[]> {
        if (!db) return []

        try {
            // Get last 30 days of data
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

            const q = query(
                collection(db, "activityDataPoints"),
                where("venueId", "==", venueId),
                where("sport", "==", sport),
                where("timestamp", ">=", Timestamp.fromDate(thirtyDaysAgo)),
                orderBy("timestamp", "desc"),
                limit(200)
            )

            const snapshot = await getDocs(q)
            const dataPoints = snapshot.docs.map(doc => doc.data() as ActivityDataPoint)

            // Group by day of week and hour
            const patterns: Map<string, number[]> = new Map()

            for (const dp of dataPoints) {
                const key = `${dp.dayOfWeek}-${dp.hour}`
                if (!patterns.has(key)) {
                    patterns.set(key, [])
                }
                patterns.get(key)!.push(activityLevelToScore(dp.actualLevel))
            }

            // Detect recurring patterns (high variance = potential pattern)
            const detectedPatterns: VenuePattern[] = []

            for (const [key, scores] of patterns) {
                if (scores.length >= 3) {
                    const avg = scores.reduce((a, b) => a + b, 0) / scores.length
                    const [dayOfWeek, hour] = key.split("-").map(Number)

                    // If consistently high or low, it's a pattern
                    if (avg > 70) {
                        detectedPatterns.push({
                            id: key,
                            type: "recurring",
                            name: this.generatePatternName(dayOfWeek, hour, "high"),
                            dayOfWeek,
                            hourStart: hour,
                            hourEnd: hour + 1,
                            adjustment: 25,
                            confidence: Math.min(100, scores.length * 15),
                            occurrences: scores.length,
                        })
                    } else if (avg < 30) {
                        detectedPatterns.push({
                            id: key,
                            type: "recurring",
                            name: this.generatePatternName(dayOfWeek, hour, "low"),
                            dayOfWeek,
                            hourStart: hour,
                            hourEnd: hour + 1,
                            adjustment: -20,
                            confidence: Math.min(100, scores.length * 15),
                            occurrences: scores.length,
                        })
                    }
                }
            }

            return detectedPatterns

        } catch (error) {
            console.error("[VenueLearning] Error detecting patterns:", error)
            return []
        }
    }

    private generatePatternName(dayOfWeek: number, hour: number, type: "high" | "low"): string {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        const day = days[dayOfWeek]

        if (type === "high") {
            if (hour >= 18 && hour <= 21) return `${day} Evening Rush`
            if (hour >= 6 && hour <= 9) return `${day} Morning Crew`
            return `${day} Peak`
        } else {
            return `Quiet ${day}s`
        }
    }

    // Clear cache
    clearCache(): void {
        this.profileCache.clear()
    }
}

// ============================================
// EXPORTS
// ============================================

export const venueLearningService = VenueLearningService.getInstance()

export const getVenueProfile = (venueId: string, sport: Sport) =>
    venueLearningService.getVenueProfile(venueId, sport)

export const getPatternAdjustment = (
    venueId: string,
    sport: Sport,
    isWeekend: boolean,
    hour: number
) => venueLearningService.getPatternAdjustment(venueId, sport, isWeekend, hour)

export const recordActivity = (dataPoint: ActivityDataPoint) =>
    venueLearningService.recordActivity(dataPoint)

export const recordValidation = (validation: PredictionValidation) =>
    venueLearningService.recordValidation(validation)

export const getVenueAccuracy = (venueId: string, sport: Sport) =>
    venueLearningService.getVenueAccuracy(venueId, sport)
