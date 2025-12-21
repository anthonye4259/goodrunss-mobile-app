/**
 * Sport Intelligence Service
 * 
 * THE EDGE: Sport-specific predictions that feel native to each community.
 * 
 * Day 0 Strategy (Cold Start):
 * - Pre-seeded with expert knowledge of each sport's patterns
 * - Uses external signals (weather, time, holidays, population)
 * - Learns and improves with real user data
 * 
 * Each sport has unique:
 * - Terminology ("runs" vs "courts available")
 * - Peak patterns (basketball = evening, tennis = morning)
 * - Magic numbers (basketball needs 10 for full court)
 * - Weather sensitivity
 * - Culture (pickup vs scheduled)
 */

import { db } from "../firebase-config"
import {
    collection,
    query,
    where,
    getDocs,
    Timestamp,
    orderBy,
    limit
} from "firebase/firestore"
import type { WeatherFactors } from "../traffic-prediction"

// ============================================
// TYPES
// ============================================

export type Sport =
    | "basketball"
    | "tennis"
    | "pickleball"
    | "volleyball"
    | "golf"
    | "swimming"
    | "soccer"
    | "padel"
    | "racquetball"

export type ActivityLevel = "dead" | "quiet" | "active" | "busy" | "packed"

export type Atmosphere =
    | "competitive"     // Serious players, intense games
    | "social"          // Casual, friendly
    | "mixed"           // All levels
    | "family"          // Kids and families
    | "practice"        // Individual practice/lessons

export interface SportContext {
    sport: Sport

    // Activity
    activityLevel: ActivityLevel
    activityColor: string
    activityEmoji: string

    // Headlines (sport-specific language)
    headline: string              // "Runs are live" / "2 courts free"
    subheadline: string           // "8 players • Full court"

    // Timing
    waitTime: string | null       // "~5 min" / null
    bestTime: string              // "Now" / "7:30 PM"
    bestTimeReason: string        // "Fewer players" / "Courts open"

    // Recommendation
    recommendation: string        // "Good time to come"
    shouldCome: boolean           // true = good, false = try later

    // Atmosphere
    atmosphere: Atmosphere
    atmosphereLabel: string       // "Competitive runs" / "Social games"

    // Sport-specific info
    conditions: SportCondition[]
    magicNumber?: MagicNumber     // "8 of 10 players needed"
    sportTip?: string             // "Bring your own ball"

    // Confidence
    confidence: number            // 0-100
    confidenceLabel: string       // "Based on 47 reports this week"
    dataSource: "live" | "recent" | "predicted"

    // Weather context
    weatherImpact: string | null  // "Perfect conditions" / "Windy - affects play"
    weatherScore: number          // 0-100
}

export interface SportCondition {
    id: string
    label: string
    icon: string
    positive: boolean
}

export interface MagicNumber {
    current: number
    needed: number
    unit: string              // "players" / "courts" / "in rotation"
    label: string             // "Need 2 more for full court"
}

// ============================================
// SPORT CONFIGURATIONS (Pre-seeded Knowledge)
// ============================================

interface SportConfig {
    name: string
    emoji: string
    color: string

    // Terminology
    activeLabel: string           // "Runs are live" / "Courts in use"
    quietLabel: string            // "Courts available" / "No games"
    playersLabel: string          // "players" / "on court" / "in rotation"

    // Peak patterns (0-100 base score by hour)
    weekdayPattern: number[]      // 24 hours
    weekendPattern: number[]      // 24 hours

    // Magic numbers
    ideal: number                 // Ideal number for a game
    minimum: number               // Minimum to play
    perUnit: string               // "per court" / "per game"

    // Weather sensitivity
    tempIdealMin: number
    tempIdealMax: number
    windSensitive: boolean
    rainSensitive: boolean

    // Culture
    pickupFriendly: boolean
    typicalAtmosphere: Atmosphere

    // Demographics
    morningDemo: string           // "Serious players" / "Retirees"
    eveningDemo: string           // "After-work crowd" / "Families"

    // Event triggers (spikes during these)
    majorEvents: string[]         // ["March Madness", "NBA Playoffs"]
}

const SPORT_CONFIGS: Record<Sport, SportConfig> = {
    basketball: {
        name: "Basketball",
        emoji: "🏀",
        color: "#F97316", // Orange

        activeLabel: "Runs are live",
        quietLabel: "Courts open",
        playersLabel: "players",

        // Peak: 6-9 PM weekdays, Sunday afternoon
        weekdayPattern: [
            0, 0, 0, 0, 0, 5,     // 12a-5a: dead
            15, 20, 15, 10, 10, 15, // 6a-11a: morning crew
            25, 30, 20, 15, 20, 35, // 12p-5p: lunch, after school
            70, 90, 95, 85, 60, 30, // 6p-11p: PEAK
            10, 5                   // 12a: late night
        ],
        weekendPattern: [
            0, 0, 0, 0, 0, 5,
            10, 15, 25, 45, 60, 70, // Morning builds
            75, 80, 85, 80, 75, 70, // Afternoon peak
            65, 60, 50, 40, 25, 15,
            5, 0
        ],

        ideal: 10,
        minimum: 6,
        perUnit: "for full court",

        tempIdealMin: 55,
        tempIdealMax: 85,
        windSensitive: false,
        rainSensitive: true,

        pickupFriendly: true,
        typicalAtmosphere: "competitive",

        morningDemo: "Early grinders",
        eveningDemo: "After-work runs",

        majorEvents: ["March Madness", "NBA Playoffs", "NBA Finals"],
    },

    tennis: {
        name: "Tennis",
        emoji: "🎾",
        color: "#22C55E", // Green

        activeLabel: "Courts in use",
        quietLabel: "Courts available",
        playersLabel: "on court",

        // Peak: Early morning, after work
        weekdayPattern: [
            0, 0, 0, 0, 0, 5,
            30, 60, 70, 50, 35, 30, // Morning peak
            25, 30, 25, 20, 25, 45, // Afternoon
            70, 75, 60, 40, 20, 10,
            5, 0
        ],
        weekendPattern: [
            0, 0, 0, 0, 0, 5,
            20, 45, 70, 85, 90, 85, // Weekend morning peak
            75, 70, 65, 60, 55, 50,
            45, 40, 30, 20, 10, 5,
            0, 0
        ],

        ideal: 4,
        minimum: 2,
        perUnit: "per court",

        tempIdealMin: 60,
        tempIdealMax: 85,
        windSensitive: true,  // Wind really affects tennis
        rainSensitive: true,

        pickupFriendly: false, // Usually reserved
        typicalAtmosphere: "social",

        morningDemo: "Club players",
        eveningDemo: "After-work leagues",

        majorEvents: ["US Open", "Wimbledon", "French Open", "Australian Open"],
    },

    pickleball: {
        name: "Pickleball",
        emoji: "🥒",
        color: "#8B5CF6", // Purple

        activeLabel: "Open play active",
        quietLabel: "Courts available",
        playersLabel: "in rotation",

        // Peak: Mid-morning (seniors), early evening (young)
        weekdayPattern: [
            0, 0, 0, 0, 0, 5,
            15, 30, 55, 75, 80, 70, // Morning peak (retirees)
            50, 40, 35, 30, 35, 55, // Afternoon lull
            70, 65, 50, 35, 15, 5,  // Evening bump
            0, 0
        ],
        weekendPattern: [
            0, 0, 0, 0, 0, 5,
            15, 35, 60, 80, 90, 85, // Weekend morning
            75, 70, 65, 60, 55, 50,
            45, 40, 30, 20, 10, 5,
            0, 0
        ],

        ideal: 4,
        minimum: 2,
        perUnit: "per court",

        tempIdealMin: 55,
        tempIdealMax: 90, // Pickleball players tough it out
        windSensitive: true,
        rainSensitive: true,

        pickupFriendly: true, // Very social, paddle-up system
        typicalAtmosphere: "social",

        morningDemo: "Retirees, serious players",
        eveningDemo: "Young professionals, beginners",

        majorEvents: ["US Open Pickleball", "PPA Tour"],
    },

    volleyball: {
        name: "Volleyball",
        emoji: "🏐",
        color: "#EAB308", // Yellow

        activeLabel: "Games running",
        quietLabel: "Courts open",
        playersLabel: "playing",

        weekdayPattern: [
            0, 0, 0, 0, 0, 5,
            10, 15, 20, 25, 30, 35,
            40, 45, 40, 35, 40, 55,
            70, 80, 75, 60, 40, 20,
            10, 5
        ],
        weekendPattern: [
            0, 0, 0, 0, 0, 5,
            10, 20, 35, 55, 75, 85, // Beach = hot day peak
            90, 85, 80, 75, 70, 60,
            50, 40, 30, 20, 10, 5,
            0, 0
        ],

        ideal: 12,
        minimum: 4,
        perUnit: "for 6v6",

        tempIdealMin: 65,
        tempIdealMax: 95, // Beach players love heat
        windSensitive: true,
        rainSensitive: true,

        pickupFriendly: true,
        typicalAtmosphere: "social",

        morningDemo: "Serious players",
        eveningDemo: "Social games, leagues",

        majorEvents: ["Olympics", "AVP Tour"],
    },

    golf: {
        name: "Golf",
        emoji: "⛳",
        color: "#166534", // Dark green

        activeLabel: "Course busy",
        quietLabel: "Tee times available",
        playersLabel: "on course",

        // Peak: Morning through afternoon
        weekdayPattern: [
            0, 0, 0, 0, 5, 20,
            50, 70, 80, 85, 80, 75,
            70, 65, 60, 50, 40, 25,
            15, 10, 5, 0, 0, 0,
            0, 0
        ],
        weekendPattern: [
            0, 0, 0, 0, 10, 35,
            65, 85, 95, 95, 90, 85,
            80, 75, 70, 60, 50, 35,
            20, 10, 5, 0, 0, 0,
            0, 0
        ],

        ideal: 4,
        minimum: 1,
        perUnit: "per group",

        tempIdealMin: 55,
        tempIdealMax: 88,
        windSensitive: true,
        rainSensitive: true,

        pickupFriendly: false, // Tee times
        typicalAtmosphere: "social",

        morningDemo: "Serious golfers",
        eveningDemo: "Twilight round",

        majorEvents: ["Masters", "US Open", "The Open", "PGA Championship"],
    },

    swimming: {
        name: "Swimming",
        emoji: "🏊",
        color: "#0EA5E9", // Sky blue

        activeLabel: "Lanes busy",
        quietLabel: "Lanes available",
        playersLabel: "swimmers",

        // Peak: Early morning (lap), afternoon (families)
        weekdayPattern: [
            0, 0, 0, 0, 10, 50,
            75, 70, 50, 30, 25, 30, // Early AM lap swimmers
            40, 55, 65, 70, 60, 50,  // Afternoon families
            40, 35, 25, 15, 5, 0,
            0, 0
        ],
        weekendPattern: [
            0, 0, 0, 0, 5, 25,
            40, 50, 55, 60, 75, 85, // Weekend family peak
            90, 90, 85, 80, 70, 55,
            40, 30, 20, 10, 5, 0,
            0, 0
        ],

        ideal: 2, // Per lane
        minimum: 1,
        perUnit: "per lane",

        tempIdealMin: 80, // For outdoor pools
        tempIdealMax: 100,
        windSensitive: false,
        rainSensitive: false, // "Already wet!"

        pickupFriendly: true,
        typicalAtmosphere: "mixed",

        morningDemo: "Lap swimmers, Masters",
        eveningDemo: "Families, rec swim",

        majorEvents: ["Olympics", "World Championships"],
    },

    soccer: {
        name: "Soccer",
        emoji: "⚽",
        color: "#16A34A", // Green

        activeLabel: "Games running",
        quietLabel: "Fields open",
        playersLabel: "players",

        weekdayPattern: [
            0, 0, 0, 0, 0, 5,
            10, 15, 15, 15, 20, 25,
            30, 35, 30, 30, 45, 65, // After school/work
            80, 85, 70, 50, 25, 10,
            5, 0
        ],
        weekendPattern: [
            0, 0, 0, 0, 0, 5,
            15, 35, 60, 80, 90, 90, // Youth games morning
            85, 80, 75, 70, 65, 55,
            45, 35, 25, 15, 10, 5,
            0, 0
        ],

        ideal: 22,
        minimum: 10,
        perUnit: "for full field",

        tempIdealMin: 50,
        tempIdealMax: 85,
        windSensitive: false,
        rainSensitive: false, // Soccer plays in rain

        pickupFriendly: true,
        typicalAtmosphere: "competitive",

        morningDemo: "Youth leagues",
        eveningDemo: "Adult pickup",

        majorEvents: ["World Cup", "Champions League", "MLS Playoffs"],
    },

    padel: {
        name: "Padel",
        emoji: "🎾",
        color: "#06B6D4", // Cyan

        activeLabel: "Courts active",
        quietLabel: "Courts available",
        playersLabel: "on court",

        weekdayPattern: [
            0, 0, 0, 0, 0, 5,
            20, 40, 50, 40, 35, 35,
            40, 45, 40, 35, 45, 60,
            75, 80, 70, 50, 30, 15,
            5, 0
        ],
        weekendPattern: [
            0, 0, 0, 0, 0, 5,
            15, 35, 55, 75, 85, 90,
            85, 80, 75, 70, 65, 55,
            45, 35, 25, 15, 10, 5,
            0, 0
        ],

        ideal: 4,
        minimum: 4, // Always doubles
        perUnit: "per court",

        tempIdealMin: 55,
        tempIdealMax: 90,
        windSensitive: false, // Enclosed courts
        rainSensitive: false,

        pickupFriendly: true,
        typicalAtmosphere: "social",

        morningDemo: "Regulars",
        eveningDemo: "After-work groups",

        majorEvents: ["World Padel Tour"],
    },

    racquetball: {
        name: "Racquetball",
        emoji: "🎾",
        color: "#DC2626", // Red

        activeLabel: "Courts in use",
        quietLabel: "Courts available",
        playersLabel: "playing",

        weekdayPattern: [
            0, 0, 0, 0, 5, 25,
            50, 60, 45, 30, 25, 35,
            50, 45, 35, 30, 40, 60,
            70, 65, 50, 35, 20, 10,
            5, 0
        ],
        weekendPattern: [
            0, 0, 0, 0, 5, 15,
            30, 50, 65, 75, 80, 75,
            70, 65, 60, 55, 50, 40,
            30, 25, 15, 10, 5, 0,
            0, 0
        ],

        ideal: 2,
        minimum: 2,
        perUnit: "per court",

        tempIdealMin: 60, // Indoor sport
        tempIdealMax: 100,
        windSensitive: false,
        rainSensitive: false,

        pickupFriendly: false, // Usually reserved
        typicalAtmosphere: "competitive",

        morningDemo: "Before-work grind",
        eveningDemo: "League nights",

        majorEvents: ["US Open Racquetball"],
    },
}

// ============================================
// ACTIVITY LEVEL MAPPING
// ============================================

const ACTIVITY_LEVELS: Record<ActivityLevel, { color: string; emoji: string }> = {
    dead: { color: "#6B7280", emoji: "⚪" },
    quiet: { color: "#22C55E", emoji: "🟢" },
    active: { color: "#EAB308", emoji: "🟡" },
    busy: { color: "#F97316", emoji: "🟠" },
    packed: { color: "#EF4444", emoji: "🔴" },
}

// ============================================
// MAIN SERVICE
// ============================================

class SportIntelligenceService {
    private static instance: SportIntelligenceService

    static getInstance(): SportIntelligenceService {
        if (!SportIntelligenceService.instance) {
            SportIntelligenceService.instance = new SportIntelligenceService()
        }
        return SportIntelligenceService.instance
    }

    // ============================================
    // GET SPORT CONTEXT (Main API)
    // ============================================

    async getSportContext(
        venueId: string,
        sport: Sport,
        weather?: WeatherFactors,
        activeCheckIns?: number,
        recentReportLevel?: ActivityLevel
    ): Promise<SportContext> {
        const config = SPORT_CONFIGS[sport]
        const now = new Date()
        const hour = now.getHours()
        const isWeekend = now.getDay() === 0 || now.getDay() === 6

        // Calculate base score from patterns (Day 0 knowledge)
        const pattern = isWeekend ? config.weekendPattern : config.weekdayPattern
        let baseScore = pattern[hour] || 30

        // Apply weather adjustments
        const { weatherScore, weatherImpact } = this.calculateWeatherImpact(weather, config)
        baseScore = baseScore * (weatherScore / 100)

        // Apply real-time data if available
        if (recentReportLevel) {
            baseScore = this.applyReportBoost(baseScore, recentReportLevel)
        }

        // Determine activity level
        const activityLevel = this.scoreToActivityLevel(baseScore)
        const { color: activityColor, emoji: activityEmoji } = ACTIVITY_LEVELS[activityLevel]

        // Generate sport-specific headlines
        const { headline, subheadline } = this.generateHeadlines(
            sport,
            activityLevel,
            activeCheckIns,
            config
        )

        // Calculate wait time
        const waitTime = this.estimateWaitTime(activityLevel, config)

        // Find best time
        const { bestTime, bestTimeReason } = this.findBestTime(sport, hour, pattern, weather)

        // Generate recommendation
        const { recommendation, shouldCome } = this.generateRecommendation(
            activityLevel,
            config,
            weather
        )

        // Determine atmosphere
        const atmosphere = this.determineAtmosphere(hour, isWeekend, config)
        const atmosphereLabel = this.getAtmosphereLabel(atmosphere, sport)

        // Build magic number if we have check-in data
        const magicNumber = activeCheckIns !== undefined
            ? this.buildMagicNumber(activeCheckIns, config)
            : undefined

        // Get conditions
        const conditions = this.buildConditions(weather, config)

        // Sport tip
        const sportTip = this.getSportTip(sport, hour, isWeekend, weather)

        // Confidence (lower if no real data)
        const hasRealData = activeCheckIns !== undefined || recentReportLevel !== undefined
        const confidence = hasRealData ? 75 : 55
        const confidenceLabel = hasRealData
            ? "Based on recent activity"
            : "Based on typical patterns"

        return {
            sport,
            activityLevel,
            activityColor,
            activityEmoji,
            headline,
            subheadline,
            waitTime,
            bestTime,
            bestTimeReason,
            recommendation,
            shouldCome,
            atmosphere,
            atmosphereLabel,
            conditions,
            magicNumber,
            sportTip,
            confidence,
            confidenceLabel,
            dataSource: hasRealData ? "recent" : "predicted",
            weatherImpact,
            weatherScore,
        }
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    private calculateWeatherImpact(
        weather: WeatherFactors | undefined,
        config: SportConfig
    ): { weatherScore: number; weatherImpact: string | null } {
        if (!weather) {
            return { weatherScore: 80, weatherImpact: null }
        }

        let score = 100
        let impact: string | null = null

        // Temperature
        if (weather.temp !== undefined) {
            if (weather.temp >= config.tempIdealMin && weather.temp <= config.tempIdealMax) {
                score += 5
                impact = "Perfect weather"
            } else if (weather.temp > config.tempIdealMax + 10) {
                score -= 25
                impact = `Hot (${Math.round(weather.temp)}°F)`
            } else if (weather.temp < config.tempIdealMin - 10) {
                score -= 25
                impact = `Cold (${Math.round(weather.temp)}°F)`
            }
        }

        // Rain
        if (weather.isRaining && config.rainSensitive) {
            score -= 50
            impact = "Rain - limited outdoor play"
        }

        // Wind
        if (weather.windSpeed && weather.windSpeed > 15 && config.windSensitive) {
            score -= 20
            impact = impact || `Windy (${Math.round(weather.windSpeed)} mph)`
        }

        return {
            weatherScore: Math.max(20, Math.min(100, score)),
            weatherImpact: impact,
        }
    }

    private applyReportBoost(baseScore: number, reportLevel: ActivityLevel): number {
        const boosts: Record<ActivityLevel, number> = {
            dead: -30,
            quiet: -15,
            active: 0,
            busy: 20,
            packed: 40,
        }
        return Math.max(0, Math.min(100, baseScore + boosts[reportLevel]))
    }

    private scoreToActivityLevel(score: number): ActivityLevel {
        if (score < 15) return "dead"
        if (score < 35) return "quiet"
        if (score < 60) return "active"
        if (score < 80) return "busy"
        return "packed"
    }

    private generateHeadlines(
        sport: Sport,
        level: ActivityLevel,
        checkIns: number | undefined,
        config: SportConfig
    ): { headline: string; subheadline: string } {
        const sportEmoji = config.emoji

        // Sport-specific headlines
        if (sport === "basketball") {
            if (level === "packed" || level === "busy") {
                return {
                    headline: `${sportEmoji} RUNS ARE LIVE`,
                    subheadline: checkIns
                        ? `${checkIns} ${config.playersLabel} • ${checkIns >= 10 ? "Full court running" : "Half court games"}`
                        : "Full court games running"
                }
            } else if (level === "active") {
                return {
                    headline: `${sportEmoji} Some Action`,
                    subheadline: checkIns
                        ? `${checkIns} ${config.playersLabel} on court`
                        : "Games forming"
                }
            } else {
                return {
                    headline: `${sportEmoji} Courts Open`,
                    subheadline: "Great time to shoot around"
                }
            }
        }

        if (sport === "tennis" || sport === "padel") {
            if (level === "packed" || level === "busy") {
                return {
                    headline: `${sportEmoji} Courts Busy`,
                    subheadline: "Expect a wait for courts"
                }
            } else if (level === "active") {
                return {
                    headline: `${sportEmoji} Some Courts Free`,
                    subheadline: "Good availability"
                }
            } else {
                return {
                    headline: `${sportEmoji} Courts Available`,
                    subheadline: "Plenty of open courts"
                }
            }
        }

        if (sport === "pickleball") {
            if (level === "packed" || level === "busy") {
                return {
                    headline: `${sportEmoji} Open Play Active`,
                    subheadline: checkIns
                        ? `${checkIns} in rotation • Put your paddle up!`
                        : "Paddles are stacked"
                }
            } else if (level === "active") {
                return {
                    headline: `${sportEmoji} Games Forming`,
                    subheadline: "Quick to get on court"
                }
            } else {
                return {
                    headline: `${sportEmoji} Courts Available`,
                    subheadline: "No wait - jump right in"
                }
            }
        }

        if (sport === "swimming") {
            if (level === "packed" || level === "busy") {
                return {
                    headline: `${sportEmoji} Lanes Busy`,
                    subheadline: "Circle swim likely"
                }
            } else if (level === "active") {
                return {
                    headline: `${sportEmoji} Moderate Activity`,
                    subheadline: "Some lanes available"
                }
            } else {
                return {
                    headline: `${sportEmoji} Lanes Open`,
                    subheadline: "Great time for laps"
                }
            }
        }

        // Generic fallback
        const label = level === "packed" || level === "busy"
            ? config.activeLabel
            : config.quietLabel

        return {
            headline: `${sportEmoji} ${label.toUpperCase()}`,
            subheadline: checkIns
                ? `${checkIns} ${config.playersLabel}`
                : level === "quiet" ? "Low activity" : "Moderate activity"
        }
    }

    private estimateWaitTime(level: ActivityLevel, config: SportConfig): string | null {
        switch (level) {
            case "dead":
            case "quiet":
                return null
            case "active":
                return config.pickupFriendly ? "~5 min" : null
            case "busy":
                return "10-15 min"
            case "packed":
                return "20+ min"
        }
    }

    private findBestTime(
        sport: Sport,
        currentHour: number,
        pattern: number[],
        weather?: WeatherFactors
    ): { bestTime: string; bestTimeReason: string } {
        // Check next 6 hours for lowest score
        let bestHour = currentHour
        let lowestScore = 100

        for (let h = 0; h <= 6; h++) {
            const checkHour = (currentHour + h) % 24
            const score = pattern[checkHour] || 50

            if (score < lowestScore && checkHour >= 6) { // Don't recommend before 6 AM
                lowestScore = score
                bestHour = checkHour
            }
        }

        if (bestHour === currentHour && lowestScore < 50) {
            return { bestTime: "Now ✨", bestTimeReason: "Low activity right now" }
        }

        const formatHour = (h: number) => {
            const ampm = h >= 12 ? "PM" : "AM"
            const hour12 = h % 12 || 12
            return `${hour12} ${ampm}`
        }

        return {
            bestTime: formatHour(bestHour),
            bestTimeReason: lowestScore < 30 ? "Usually quiet" : "Fewer people expected"
        }
    }

    private generateRecommendation(
        level: ActivityLevel,
        config: SportConfig,
        weather?: WeatherFactors
    ): { recommendation: string; shouldCome: boolean } {
        if (weather?.isRaining && config.rainSensitive) {
            return { recommendation: "Check back after rain", shouldCome: false }
        }

        switch (level) {
            case "dead":
                return {
                    recommendation: config.pickupFriendly
                        ? "Great for practice, might be hard to find a game"
                        : "Wide open - come anytime",
                    shouldCome: true
                }
            case "quiet":
                return {
                    recommendation: "Good time to come - low crowds",
                    shouldCome: true
                }
            case "active":
                return {
                    recommendation: config.pickupFriendly
                        ? "Games likely forming - good balance"
                        : "Some activity - should be able to get court",
                    shouldCome: true
                }
            case "busy":
                return {
                    recommendation: config.pickupFriendly
                        ? "Action is good, but expect to wait for next"
                        : "Courts filling up - might wait",
                    shouldCome: true
                }
            case "packed":
                return {
                    recommendation: "Very busy - try off-peak hours for less wait",
                    shouldCome: false
                }
        }
    }

    private determineAtmosphere(
        hour: number,
        isWeekend: boolean,
        config: SportConfig
    ): Atmosphere {
        // Early morning = serious
        if (hour >= 5 && hour <= 8) {
            return "competitive"
        }

        // Mid-morning weekday = often practice/lessons
        if (!isWeekend && hour >= 9 && hour <= 11) {
            return "practice"
        }

        // Afternoon = mixed/families
        if (hour >= 14 && hour <= 17) {
            return isWeekend ? "family" : "mixed"
        }

        // Evening = based on sport
        return config.typicalAtmosphere
    }

    private getAtmosphereLabel(atmosphere: Atmosphere, sport: Sport): string {
        const labels: Record<Atmosphere, string> = {
            competitive: sport === "basketball" ? "Competitive runs" : "Serious players",
            social: "Casual, social games",
            mixed: "All skill levels",
            family: "Family-friendly",
            practice: "Practice & lessons",
        }
        return labels[atmosphere]
    }

    private buildMagicNumber(checkIns: number, config: SportConfig): MagicNumber | undefined {
        const needed = config.ideal - checkIns

        if (needed <= 0) {
            return {
                current: checkIns,
                needed: 0,
                unit: config.playersLabel,
                label: `Full game ready! (${checkIns}+ here)`,
            }
        }

        return {
            current: checkIns,
            needed: config.ideal,
            unit: config.playersLabel,
            label: `Need ${needed} more ${config.perUnit}`,
        }
    }

    private buildConditions(
        weather: WeatherFactors | undefined,
        config: SportConfig
    ): SportCondition[] {
        const conditions: SportCondition[] = []

        if (weather) {
            if (weather.temp !== undefined) {
                if (weather.temp >= config.tempIdealMin && weather.temp <= config.tempIdealMax) {
                    conditions.push({
                        id: "perfect_temp",
                        label: `${Math.round(weather.temp)}°F`,
                        icon: "☀️",
                        positive: true,
                    })
                }
            }

            if (config.windSensitive && weather.windSpeed !== undefined) {
                if (weather.windSpeed < 10) {
                    conditions.push({
                        id: "low_wind",
                        label: "Low wind",
                        icon: "🍃",
                        positive: true,
                    })
                } else if (weather.windSpeed > 15) {
                    conditions.push({
                        id: "high_wind",
                        label: `${Math.round(weather.windSpeed)} mph wind`,
                        icon: "💨",
                        positive: false,
                    })
                }
            }
        }

        return conditions
    }

    private getSportTip(
        sport: Sport,
        hour: number,
        isWeekend: boolean,
        weather?: WeatherFactors
    ): string | undefined {
        // Contextual tips
        if (sport === "basketball" && hour >= 18 && hour <= 21) {
            return "Prime time for runs - bring your A game"
        }

        if (sport === "tennis" && weather?.windSpeed && weather.windSpeed > 12) {
            return "Windy conditions - adjust your toss"
        }

        if (sport === "pickleball" && hour >= 9 && hour <= 11 && !isWeekend) {
            return "Weekday mornings are popular with regulars"
        }

        if (sport === "swimming" && hour >= 5 && hour <= 7) {
            return "Early bird lap swim - fast lanes on left"
        }

        return undefined
    }

    // ============================================
    // GET CONFIG (for UI)
    // ============================================

    getSportConfig(sport: Sport): SportConfig {
        return SPORT_CONFIGS[sport]
    }

    getAllSports(): Sport[] {
        return Object.keys(SPORT_CONFIGS) as Sport[]
    }
}

// ============================================
// EXPORTS
// ============================================

export const sportIntelligenceService = SportIntelligenceService.getInstance()

export const getSportContext = (
    venueId: string,
    sport: Sport,
    weather?: WeatherFactors,
    activeCheckIns?: number,
    recentReportLevel?: ActivityLevel
) => sportIntelligenceService.getSportContext(venueId, sport, weather, activeCheckIns, recentReportLevel)

export const getSportConfig = (sport: Sport) => sportIntelligenceService.getSportConfig(sport)
