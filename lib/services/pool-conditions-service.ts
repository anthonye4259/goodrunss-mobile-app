/**
 * Pool Conditions Service
 * 
 * Provides real-time pool/swim conditions using weather data:
 * - Estimated water temperature (from air temp)
 * - UV index and sun safety
 * - "Perfect for swimming!" messaging
 * - Crowd level estimates
 * 
 * Uses OpenWeatherMap free tier (1,000 calls/day)
 * Falls back to seasonal estimates if no API key
 */

const WEATHER_API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || ""
const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather"

// ============================================
// TYPES
// ============================================

export interface PoolConditions {
    waterTemp: number // Fahrenheit
    waterTempDisplay: string // "78°F"
    airTemp: number
    airTempDisplay: string
    feelsLike: number
    uvIndex: number
    uvLevel: "low" | "moderate" | "high" | "very_high" | "extreme"
    uvWarning?: string
    humidity: number
    conditions: string // "Sunny", "Partly Cloudy", etc.
    conditionsIcon: string // Ionicons name
    swimRating: "perfect" | "good" | "okay" | "cold" | "closed"
    swimMessage: string // "Perfect for swimming! ☀️"
    crowdLevel: "empty" | "light" | "moderate" | "busy" | "packed"
    crowdMessage: string
    isOutdoor: boolean
    lastUpdated: string
}

export interface WeatherData {
    temp: number
    feels_like: number
    humidity: number
    description: string
    icon: string
    uvi?: number
}

// ============================================
// WATER TEMP ESTIMATION
// ============================================

/**
 * Estimate water temperature from air temperature
 * Outdoor pools are typically 5-10°F cooler than air in summer
 * Heated pools maintain 78-82°F
 */
function estimateWaterTemp(airTemp: number, isHeated: boolean = false): number {
    if (isHeated) {
        return 80 // Standard heated pool temp
    }

    // Outdoor pool estimation based on air temp
    // Water temp lags behind air temp by several degrees
    if (airTemp >= 95) return 85
    if (airTemp >= 90) return 82
    if (airTemp >= 85) return 80
    if (airTemp >= 80) return 78
    if (airTemp >= 75) return 75
    if (airTemp >= 70) return 72
    if (airTemp >= 65) return 68
    if (airTemp >= 60) return 65
    return 60 // Too cold!
}

// ============================================
// UV INDEX HANDLING
// ============================================

function getUVLevel(uvi: number): PoolConditions["uvLevel"] {
    if (uvi <= 2) return "low"
    if (uvi <= 5) return "moderate"
    if (uvi <= 7) return "high"
    if (uvi <= 10) return "very_high"
    return "extreme"
}

function getUVWarning(uvi: number): string | undefined {
    if (uvi >= 8) return "🧴 Very high UV! Sunscreen required"
    if (uvi >= 6) return "☀️ High UV - wear sunscreen"
    if (uvi >= 3) return "Apply sunscreen if swimming long"
    return undefined
}

// ============================================
// SWIM RATING
// ============================================

function getSwimRating(waterTemp: number, conditions: string): PoolConditions["swimRating"] {
    const badConditions = ["rain", "storm", "thunder", "snow"]
    if (badConditions.some(c => conditions.toLowerCase().includes(c))) {
        return "closed"
    }

    if (waterTemp >= 78) return "perfect"
    if (waterTemp >= 74) return "good"
    if (waterTemp >= 70) return "okay"
    return "cold"
}

function getSwimMessage(rating: PoolConditions["swimRating"], waterTemp: number): string {
    switch (rating) {
        case "perfect": return "Perfect for swimming! ☀️🏊"
        case "good": return "Great pool day! 🌤️"
        case "okay": return "Refreshing swim conditions 💧"
        case "cold": return `Chilly at ${waterTemp}°F 🥶`
        case "closed": return "Pool may be closed - check hours ⚠️"
    }
}

// ============================================
// CROWD ESTIMATION
// ============================================

function estimateCrowdLevel(hour: number, dayOfWeek: number): PoolConditions["crowdLevel"] {
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    // Peak hours
    if (isWeekend) {
        if (hour >= 11 && hour <= 15) return "packed"
        if (hour >= 10 && hour <= 17) return "busy"
        if (hour >= 9 && hour <= 18) return "moderate"
        return "light"
    } else {
        // Weekdays
        if (hour >= 12 && hour <= 14) return "moderate" // Lunch crowd
        if (hour >= 16 && hour <= 19) return "busy" // After work/school
        if (hour >= 10 && hour <= 11) return "light"
        if (hour >= 6 && hour <= 8) return "moderate" // Morning swimmers
        return "empty"
    }
}

function getCrowdMessage(level: PoolConditions["crowdLevel"]): string {
    switch (level) {
        case "empty": return "Almost empty right now"
        case "light": return "Light crowd - plenty of lanes"
        case "moderate": return "Moderate crowd"
        case "busy": return "Busy - expect to share lanes"
        case "packed": return "Peak time - very crowded"
    }
}

// ============================================
// CONDITIONS ICON MAPPING
// ============================================

function getConditionsIcon(weatherIcon: string): string {
    const iconMap: Record<string, string> = {
        "01d": "sunny",
        "01n": "moon",
        "02d": "partly-sunny",
        "02n": "cloudy-night",
        "03d": "cloud",
        "03n": "cloud",
        "04d": "cloudy",
        "04n": "cloudy",
        "09d": "rainy",
        "09n": "rainy",
        "10d": "rainy",
        "10n": "rainy",
        "11d": "thunderstorm",
        "11n": "thunderstorm",
        "13d": "snow",
        "13n": "snow",
        "50d": "cloudy",
        "50n": "cloudy",
    }
    return iconMap[weatherIcon] || "sunny"
}

// ============================================
// MAIN API
// ============================================

/**
 * Get pool conditions for a location
 */
export async function getPoolConditions(
    lat: number,
    lon: number,
    isHeated: boolean = false,
    isOutdoor: boolean = true
): Promise<PoolConditions> {
    const now = new Date()
    const hour = now.getHours()
    const dayOfWeek = now.getDay()

    // Try to get real weather data
    let weatherData: WeatherData | null = null

    if (WEATHER_API_KEY) {
        try {
            const response = await fetch(
                `${WEATHER_API_URL}?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=imperial`
            )
            if (response.ok) {
                const data = await response.json()
                weatherData = {
                    temp: Math.round(data.main.temp),
                    feels_like: Math.round(data.main.feels_like),
                    humidity: data.main.humidity,
                    description: data.weather[0]?.description || "Clear",
                    icon: data.weather[0]?.icon || "01d",
                    uvi: data.uvi, // May not be in basic endpoint
                }
            }
        } catch (error) {
            console.warn("[PoolConditions] Weather API failed, using estimates:", error)
        }
    }

    // Use weather data or seasonal estimates
    const airTemp = weatherData?.temp || getSeasonalTemp(now.getMonth())
    const feelsLike = weatherData?.feels_like || airTemp
    const humidity = weatherData?.humidity || 50
    const conditions = weatherData?.description || "Clear"
    const conditionsIcon = getConditionsIcon(weatherData?.icon || "01d")

    // Calculate water temp
    const waterTemp = isOutdoor ? estimateWaterTemp(airTemp, isHeated) : 80 // Indoor pools are heated

    // UV index (estimate if not provided - higher in summer, peak at noon)
    const uvIndex = weatherData?.uvi || estimateUV(now.getMonth(), hour)

    // Ratings and messages
    const uvLevel = getUVLevel(uvIndex)
    const swimRating = getSwimRating(waterTemp, conditions)
    const crowdLevel = estimateCrowdLevel(hour, dayOfWeek)

    return {
        waterTemp,
        waterTempDisplay: `${waterTemp}°F`,
        airTemp,
        airTempDisplay: `${airTemp}°F`,
        feelsLike,
        uvIndex: Math.round(uvIndex),
        uvLevel,
        uvWarning: getUVWarning(uvIndex),
        humidity,
        conditions: capitalizeWords(conditions),
        conditionsIcon,
        swimRating,
        swimMessage: getSwimMessage(swimRating, waterTemp),
        crowdLevel,
        crowdMessage: getCrowdMessage(crowdLevel),
        isOutdoor,
        lastUpdated: now.toISOString(),
    }
}

// ============================================
// FALLBACK ESTIMATES
// ============================================

function getSeasonalTemp(month: number): number {
    // Northern hemisphere seasonal averages
    const temps = [45, 48, 55, 65, 75, 85, 90, 88, 82, 70, 55, 48]
    return temps[month] || 72
}

function estimateUV(month: number, hour: number): number {
    // Base UV by month (peak in summer)
    const monthlyBase = [2, 3, 4, 5, 7, 9, 10, 9, 7, 5, 3, 2]
    const base = monthlyBase[month] || 5

    // Adjust for time of day
    if (hour < 10 || hour > 16) return Math.max(1, base - 3)
    if (hour >= 11 && hour <= 14) return base
    return base - 1
}

function capitalizeWords(str: string): string {
    return str.replace(/\b\w/g, c => c.toUpperCase())
}

// ============================================
// QUICK STATS FOR DISPLAY
// ============================================

export function getPoolQuickStats(conditions: PoolConditions) {
    return [
        { icon: "water", label: "Water", value: conditions.waterTempDisplay, color: "#06B6D4" },
        { icon: "sunny", label: "UV Index", value: conditions.uvIndex.toString(), color: "#FBBF24" },
        { icon: "people", label: "Crowd", value: conditions.crowdLevel, color: "#8B5CF6" },
        { icon: "thermometer", label: "Air", value: conditions.airTempDisplay, color: "#EF4444" },
    ]
}

/**
 * Example usage:
 * 
 * const conditions = await getPoolConditions(34.0522, -118.2437) // LA coords
 * // Returns:
 * // {
 * //   waterTemp: 80,
 * //   waterTempDisplay: "80°F",
 * //   swimRating: "perfect",
 * //   swimMessage: "Perfect for swimming! ☀️🏊",
 * //   uvIndex: 8,
 * //   uvWarning: "🧴 Very high UV! Sunscreen required",
 * //   crowdLevel: "moderate",
 * //   ...
 * // }
 */
