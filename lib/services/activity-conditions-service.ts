/**
 * Activity Conditions Service
 * 
 * Master conditions engine for ALL activities, combining:
 * - Weather data (OpenWeatherMap)
 * - Traffic patterns (ML-based prediction)
 * - Activity-specific recommendations
 * 
 * Provides "play score" and recommendations for:
 * - Tennis, Pickleball, Basketball, Golf, Running (outdoor)
 * - Yoga, Pilates, CrossFit (indoor preferred, but weather still matters)
 * - Swimming (water temp, UV)
 * - All venue types
 */

import { predictVenueTraffic, getTrafficTrend, type TrafficPrediction } from "../traffic-prediction"

// ============================================
// API CONFIGURATION
// ============================================

const WEATHER_API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || ""
const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather"
const ONECALL_API_URL = "https://api.openweathermap.org/data/2.5/onecall"

// ============================================
// TYPES
// ============================================

export type ActivityCategory =
    | "outdoor_court" // Tennis, Pickleball, Basketball
    | "outdoor_field" // Soccer, Football, Golf
    | "outdoor_water" // Swimming, Beach volleyball
    | "outdoor_cardio" // Running, Cycling
    | "indoor_gym" // CrossFit, Weight training
    | "indoor_studio" // Yoga, Pilates, Dance
    | "indoor_court" // Indoor basketball, racquetball

export interface WeatherConditions {
    temp: number // Fahrenheit
    feelsLike: number
    humidity: number
    windSpeed: number // mph
    windGust?: number
    uvIndex: number
    precipitation: number // mm
    conditions: string // "Clear", "Cloudy", "Rain", etc.
    conditionsIcon: string // Ionicons name
    sunrise: string
    sunset: string
    visibility: number // miles
}

export interface ActivityConditions {
    // Overall rating
    playScore: number // 0-100
    playRating: "perfect" | "great" | "good" | "fair" | "poor" | "closed"
    headline: string // "Perfect Tennis Weather! 🎾"
    recommendation: string // "Great conditions for outdoor play"

    // Weather
    weather: WeatherConditions
    weatherWarnings: string[]

    // Traffic
    traffic: TrafficPrediction
    trafficTrend: string

    // Activity-specific
    activityCategory: ActivityCategory
    specificTips: string[]
    bestTimeToday: string // "4-6 PM"

    // UV & Safety
    uvLevel: "low" | "moderate" | "high" | "very_high" | "extreme"
    safetyAlerts: string[]

    // Timestamps
    lastUpdated: string
    expiresAt: string
}

// ============================================
// ACTIVITY CATEGORY MAPPING
// ============================================

export function getActivityCategory(activity: string): ActivityCategory {
    const activityLower = activity.toLowerCase()

    // Outdoor courts
    if (["tennis", "pickleball", "outdoor basketball", "badminton", "volleyball"].some(a => activityLower.includes(a))) {
        return "outdoor_court"
    }

    // Outdoor fields
    if (["golf", "soccer", "football", "baseball", "softball", "ultimate frisbee", "lacrosse"].some(a => activityLower.includes(a))) {
        return "outdoor_field"
    }

    // Water activities
    if (["swimming", "beach", "surfing", "kayaking", "paddleboard", "water polo"].some(a => activityLower.includes(a))) {
        return "outdoor_water"
    }

    // Outdoor cardio
    if (["running", "jogging", "cycling", "hiking", "walking", "trail"].some(a => activityLower.includes(a))) {
        return "outdoor_cardio"
    }

    // Indoor studio
    if (["yoga", "pilates", "dance", "barre", "meditation", "stretching"].some(a => activityLower.includes(a))) {
        return "indoor_studio"
    }

    // Indoor gym
    if (["crossfit", "weight", "gym", "fitness", "strength", "boxing", "martial arts"].some(a => activityLower.includes(a))) {
        return "indoor_gym"
    }

    // Indoor court
    if (["racquetball", "squash", "indoor basketball", "indoor volleyball"].some(a => activityLower.includes(a))) {
        return "indoor_court"
    }

    return "indoor_gym" // Default
}

// ============================================
// WEATHER FETCHING
// ============================================

interface RawWeatherData {
    main: {
        temp: number
        feels_like: number
        humidity: number
    }
    wind: {
        speed: number
        gust?: number
    }
    weather: Array<{
        main: string
        description: string
        icon: string
    }>
    visibility: number
    sys: {
        sunrise: number
        sunset: number
    }
    rain?: { "1h"?: number }
    snow?: { "1h"?: number }
}

async function fetchWeather(lat: number, lon: number): Promise<WeatherConditions | null> {
    if (!WEATHER_API_KEY) {
        return getSeasonalWeatherEstimate()
    }

    try {
        const response = await fetch(
            `${WEATHER_API_URL}?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=imperial`
        )

        if (!response.ok) {
            console.warn("[ActivityConditions] Weather API failed")
            return getSeasonalWeatherEstimate()
        }

        const data: RawWeatherData = await response.json()

        // Try to get UV from OneCall API
        let uvIndex = 5 // Default moderate
        try {
            const uvResponse = await fetch(
                `${ONECALL_API_URL}?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily&appid=${WEATHER_API_KEY}&units=imperial`
            )
            if (uvResponse.ok) {
                const uvData = await uvResponse.json()
                uvIndex = uvData.current?.uvi || 5
            }
        } catch {
            // UV fetch failed, use estimate
        }

        return {
            temp: Math.round(data.main.temp),
            feelsLike: Math.round(data.main.feels_like),
            humidity: data.main.humidity,
            windSpeed: Math.round(data.wind.speed),
            windGust: data.wind.gust ? Math.round(data.wind.gust) : undefined,
            uvIndex: Math.round(uvIndex),
            precipitation: (data.rain?.["1h"] || 0) + (data.snow?.["1h"] || 0),
            conditions: data.weather[0]?.main || "Clear",
            conditionsIcon: mapWeatherIcon(data.weather[0]?.icon || "01d"),
            sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
            sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
            visibility: Math.round(data.visibility / 1609.34), // Convert meters to miles
        }
    } catch (error) {
        console.error("[ActivityConditions] Error fetching weather:", error)
        return getSeasonalWeatherEstimate()
    }
}

function mapWeatherIcon(openWeatherIcon: string): string {
    const iconMap: Record<string, string> = {
        "01d": "sunny", "01n": "moon",
        "02d": "partly-sunny", "02n": "cloudy-night",
        "03d": "cloud", "03n": "cloud",
        "04d": "cloudy", "04n": "cloudy",
        "09d": "rainy", "09n": "rainy",
        "10d": "rainy", "10n": "rainy",
        "11d": "thunderstorm", "11n": "thunderstorm",
        "13d": "snow", "13n": "snow",
        "50d": "cloudy", "50n": "cloudy",
    }
    return iconMap[openWeatherIcon] || "sunny"
}

function getSeasonalWeatherEstimate(): WeatherConditions {
    const now = new Date()
    const month = now.getMonth()
    const hour = now.getHours()

    // Seasonal temperature estimates (Northern Hemisphere)
    const monthlyTemps = [42, 45, 55, 65, 75, 85, 90, 88, 80, 68, 55, 45]
    const baseTemp = monthlyTemps[month]

    // Adjust for time of day (cooler morning/evening)
    let temp = baseTemp
    if (hour < 10 || hour > 18) temp -= 10
    else if (hour >= 13 && hour <= 16) temp += 5

    // Estimate UV based on month and time
    const monthlyUV = [2, 3, 4, 6, 8, 10, 11, 10, 8, 5, 3, 2]
    let uv = monthlyUV[month]
    if (hour < 10 || hour > 16) uv = Math.max(1, uv - 4)

    return {
        temp: Math.round(temp),
        feelsLike: Math.round(temp),
        humidity: 50,
        windSpeed: 5,
        uvIndex: uv,
        precipitation: 0,
        conditions: "Clear",
        conditionsIcon: "sunny",
        sunrise: "6:30 AM",
        sunset: "7:30 PM",
        visibility: 10,
    }
}

// ============================================
// PLAY SCORE CALCULATION
// ============================================

function calculatePlayScore(
    weather: WeatherConditions,
    category: ActivityCategory,
    traffic: TrafficPrediction
): { score: number; factors: string[] } {
    let score = 100
    const factors: string[] = []

    // Indoor activities are less affected by weather
    const isOutdoor = ["outdoor_court", "outdoor_field", "outdoor_water", "outdoor_cardio"].includes(category)

    if (isOutdoor) {
        // Temperature scoring
        const idealTemp = category === "outdoor_cardio" ? 60 : 72
        const tempDiff = Math.abs(weather.temp - idealTemp)
        if (tempDiff > 20) {
            score -= 30
            factors.push(weather.temp > idealTemp ? "Too hot" : "Too cold")
        } else if (tempDiff > 10) {
            score -= 15
        }

        // Rain = major deduction for most outdoor
        if (weather.precipitation > 0) {
            score -= 40
            factors.push("Rain expected")
        }

        // Wind affects tennis, golf, running
        if (weather.windSpeed > 15) {
            score -= 20
            factors.push("High winds")
        } else if (weather.windSpeed > 10) {
            score -= 10
        }

        // Humidity
        if (weather.humidity > 80) {
            score -= 15
            factors.push("High humidity")
        }

        // Extreme UV
        if (weather.uvIndex >= 8) {
            score -= 10
            factors.push("Very high UV")
        }

        // Visibility (for running, cycling)
        if (weather.visibility < 3) {
            score -= 15
            factors.push("Low visibility")
        }
    } else {
        // Indoor activities
        // Still affected by extreme weather (people don't want to travel)
        if (weather.precipitation > 5) {
            score -= 10
            factors.push("Rain may affect travel")
        }
        if (weather.temp < 20 || weather.temp > 100) {
            score -= 10
            factors.push("Extreme temps")
        }
    }

    // Traffic affects all activities
    if (traffic.level === "busy") {
        score -= 15
    } else if (traffic.level === "moderate") {
        score -= 5
    }

    return { score: Math.max(0, Math.min(100, score)), factors }
}

function getPlayRating(score: number): ActivityConditions["playRating"] {
    if (score >= 90) return "perfect"
    if (score >= 75) return "great"
    if (score >= 60) return "good"
    if (score >= 40) return "fair"
    if (score >= 20) return "poor"
    return "closed"
}

// ============================================
// ACTIVITY-SPECIFIC TIPS
// ============================================

function getActivityTips(
    activity: string,
    category: ActivityCategory,
    weather: WeatherConditions,
    traffic: TrafficPrediction
): string[] {
    const tips: string[] = []

    // Weather-based tips
    if (weather.uvIndex >= 6) {
        tips.push("🧴 Apply sunscreen before heading out")
    }
    if (weather.temp > 85) {
        tips.push("💧 Stay hydrated, bring extra water")
    }
    if (weather.temp < 50) {
        tips.push("🧥 Dress in layers for warmth")
    }
    if (weather.humidity > 70) {
        tips.push("💦 Expect to sweat more in this humidity")
    }
    if (weather.windSpeed > 10) {
        tips.push("🌬️ Wind may affect ball trajectory")
    }

    // Activity-specific tips
    switch (category) {
        case "outdoor_court":
            if (weather.conditions.toLowerCase().includes("cloud")) {
                tips.push("☁️ Good for avoiding sun glare")
            }
            break
        case "outdoor_water":
            tips.push(`🌊 Estimated water temp: ${Math.round(weather.temp - 8)}°F`)
            break
        case "outdoor_cardio":
            if (weather.temp > 80) {
                tips.push("🏃 Consider early morning or evening run")
            }
            break
        case "indoor_studio":
            tips.push("🧘 Studio maintains ideal temperature")
            break
    }

    // Traffic-based tips
    if (traffic.level === "busy") {
        tips.push("⏰ Consider off-peak hours for less crowds")
    }

    return tips.slice(0, 4) // Max 4 tips
}

function getHeadline(
    activity: string,
    rating: ActivityConditions["playRating"],
    weather: WeatherConditions
): string {
    const activityEmojis: Record<string, string> = {
        tennis: "🎾", pickleball: "🏓", basketball: "🏀", golf: "⛳",
        running: "🏃", swimming: "🏊", yoga: "🧘", pilates: "💪",
        crossfit: "🏋️", cycling: "🚴", soccer: "⚽", volleyball: "🏐",
    }

    const emoji = activityEmojis[activity.toLowerCase()] || "🏆"

    switch (rating) {
        case "perfect":
            return `Perfect ${activity} Weather! ${emoji}`
        case "great":
            return `Great Day for ${activity}! ${emoji}`
        case "good":
            return `Good Conditions for ${activity} ${emoji}`
        case "fair":
            return `Playable Conditions ${emoji}`
        case "poor":
            return `Consider Indoor Alternative Today`
        case "closed":
            return `Poor Weather - Check Indoor Options`
    }
}

function getBestTimeToday(
    category: ActivityCategory,
    weather: WeatherConditions,
    currentHour: number
): string {
    const isOutdoor = ["outdoor_court", "outdoor_field", "outdoor_water", "outdoor_cardio"].includes(category)

    if (!isOutdoor) {
        return "Anytime - Indoor venue"
    }

    // Hot weather = early morning or evening
    if (weather.temp > 85) {
        if (currentHour < 10) return "Now - 10 AM (before heat)"
        if (currentHour >= 17) return "Now - before sunset"
        return "Early morning or after 5 PM"
    }

    // Cold weather = midday warmest
    if (weather.temp < 55) {
        if (currentHour >= 12 && currentHour <= 15) return "Now - warmest part of day"
        return "12-3 PM (warmest temps)"
    }

    // Nice weather = most of day
    return "Most of the day - great conditions!"
}

function getUVLevel(uvi: number): ActivityConditions["uvLevel"] {
    if (uvi <= 2) return "low"
    if (uvi <= 5) return "moderate"
    if (uvi <= 7) return "high"
    if (uvi <= 10) return "very_high"
    return "extreme"
}

function getWeatherWarnings(weather: WeatherConditions, category: ActivityCategory): string[] {
    const warnings: string[] = []

    if (weather.precipitation > 0) {
        warnings.push("🌧️ Rain in forecast")
    }
    if (weather.conditions.toLowerCase().includes("thunder")) {
        warnings.push("⛈️ Thunderstorm warning - seek shelter")
    }
    if (weather.temp > 95) {
        warnings.push("🌡️ Extreme heat - limit outdoor activity")
    }
    if (weather.temp < 32) {
        warnings.push("❄️ Freezing temperatures")
    }
    if (weather.uvIndex >= 8) {
        warnings.push("☀️ Very high UV - protect your skin")
    }
    if (weather.windGust && weather.windGust > 30) {
        warnings.push("💨 Wind gusts may affect play")
    }

    return warnings
}

function getSafetyAlerts(weather: WeatherConditions): string[] {
    const alerts: string[] = []

    if (weather.uvIndex >= 6) {
        alerts.push("Apply SPF 30+ sunscreen")
    }
    if (weather.temp > 90 || (weather.temp > 85 && weather.humidity > 70)) {
        alerts.push("Heat advisory - take frequent breaks")
    }
    if (weather.conditions.toLowerCase().includes("thunder")) {
        alerts.push("Avoid open areas during lightning")
    }

    return alerts
}

// ============================================
// MAIN API
// ============================================

/**
 * Get comprehensive conditions for any activity at a location
 */
export async function getActivityConditions(
    activity: string,
    lat: number,
    lon: number,
    venueId?: string
): Promise<ActivityConditions> {
    const now = new Date()
    const currentHour = now.getHours()

    // Get weather
    const weather = await fetchWeather(lat, lon) || getSeasonalWeatherEstimate()

    // Get traffic
    const traffic = predictVenueTraffic(venueId || "default", now)
    const trafficTrendMessage = getTrafficTrend(venueId || "default", now)

    // Determine activity category
    const category = getActivityCategory(activity)

    // Calculate play score
    const { score, factors } = calculatePlayScore(weather, category, traffic)
    const rating = getPlayRating(score)

    // Generate content
    const headline = getHeadline(activity, rating, weather)
    const tips = getActivityTips(activity, category, weather, traffic)
    const warnings = getWeatherWarnings(weather, category)
    const safetyAlerts = getSafetyAlerts(weather)
    const bestTime = getBestTimeToday(category, weather, currentHour)

    // Generate recommendation
    let recommendation = ""
    if (rating === "perfect" || rating === "great") {
        recommendation = `Excellent conditions for ${activity}. Get out there!`
    } else if (rating === "good") {
        recommendation = `Good conditions with minor considerations: ${factors.join(", ") || "nothing major"}`
    } else if (rating === "fair") {
        recommendation = `Playable but check conditions: ${factors.join(", ")}`
    } else {
        recommendation = `Consider indoor alternatives today. ${factors.join(", ")}`
    }

    return {
        playScore: score,
        playRating: rating,
        headline,
        recommendation,
        weather,
        weatherWarnings: warnings,
        traffic,
        trafficTrend: trafficTrendMessage,
        activityCategory: category,
        specificTips: tips,
        bestTimeToday: bestTime,
        uvLevel: getUVLevel(weather.uvIndex),
        safetyAlerts,
        lastUpdated: now.toISOString(),
        expiresAt: new Date(now.getTime() + 30 * 60 * 1000).toISOString(), // 30 min cache
    }
}

/**
 * Quick conditions check - returns just the essentials
 */
export async function getQuickConditions(
    activity: string,
    lat: number,
    lon: number
): Promise<{ score: number; rating: string; headline: string; icon: string }> {
    const conditions = await getActivityConditions(activity, lat, lon)
    return {
        score: conditions.playScore,
        rating: conditions.playRating,
        headline: conditions.headline,
        icon: conditions.weather.conditionsIcon,
    }
}

/**
 * Get conditions for multiple activities at once
 */
export async function getMultiActivityConditions(
    activities: string[],
    lat: number,
    lon: number
): Promise<Record<string, { score: number; rating: string; headline: string }>> {
    const results: Record<string, { score: number; rating: string; headline: string }> = {}

    // Weather is the same for all, just calculate different scores
    const weather = await fetchWeather(lat, lon) || getSeasonalWeatherEstimate()
    const traffic = predictVenueTraffic("default", new Date())

    for (const activity of activities) {
        const category = getActivityCategory(activity)
        const { score } = calculatePlayScore(weather, category, traffic)
        const rating = getPlayRating(score)
        results[activity] = {
            score,
            rating,
            headline: getHeadline(activity, rating, weather),
        }
    }

    return results
}
