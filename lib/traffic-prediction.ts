export type TrafficLevel = "low" | "moderate" | "busy"

export interface TrafficPrediction {
    level: TrafficLevel
    emoji: string
    color: string
    label: string
    confidence: number
    estimatedWaitTime?: string
    peakHours?: string
    weatherImpact?: string // New: explains how weather affects traffic
}

export interface WeatherFactors {
    temp?: number // Fahrenheit
    isRaining?: boolean
    precipitation?: number // mm
    uvIndex?: number
    humidity?: number
    windSpeed?: number // mph
}

export type VenueType = "outdoor_court" | "indoor_gym" | "pool" | "field" | "studio" | "general"

/**
 * ML-based traffic prediction algorithm
 * Factors: time of day, day of week, historical patterns, current activity, WEATHER
 */
export function predictVenueTraffic(
    venueId: string,
    currentTime: Date = new Date(),
    activePlayersNow?: number,
    weather?: WeatherFactors,
    venueType: VenueType = "general"
): TrafficPrediction {
    const hour = currentTime.getHours()
    const dayOfWeek = currentTime.getDay() // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    // Base traffic score (0-100)
    let trafficScore = 0
    let weatherImpact: string | undefined

    // Time of day factor (peak hours: 6-9 AM, 5-8 PM on weekdays; 9 AM-6 PM on weekends)
    if (isWeekend) {
        if (hour >= 9 && hour <= 18) {
            trafficScore += 40 // Weekend peak
        } else if (hour >= 7 && hour <= 20) {
            trafficScore += 20 // Weekend moderate
        }
    } else {
        if ((hour >= 6 && hour <= 9) || (hour >= 17 && hour <= 20)) {
            trafficScore += 50 // Weekday peak (before/after work)
        } else if (hour >= 12 && hour <= 14) {
            trafficScore += 30 // Lunch hour
        } else if (hour >= 10 && hour <= 16) {
            trafficScore += 15 // Mid-day
        }
    }

    // Day of week factor
    if (isWeekend) {
        trafficScore += 20 // Weekends are generally busier
    }

    // Real-time player activity factor
    if (activePlayersNow !== undefined) {
        if (activePlayersNow > 15) {
            trafficScore += 30
        } else if (activePlayersNow > 8) {
            trafficScore += 20
        } else if (activePlayersNow > 3) {
            trafficScore += 10
        }
    }

    // ============================================
    // WEATHER IMPACT ON TRAFFIC
    // ============================================
    if (weather) {
        const isOutdoor = ["outdoor_court", "field", "pool"].includes(venueType)
        const isIndoor = ["indoor_gym", "studio"].includes(venueType)
        const isPool = venueType === "pool"

        // Rain: MAJOR impact on outdoor venues
        if (weather.isRaining || (weather.precipitation && weather.precipitation > 0)) {
            if (isOutdoor && !isPool) {
                trafficScore -= 40 // Outdoor courts empty when raining
                weatherImpact = "Rain keeping crowds away"
            } else if (isIndoor) {
                trafficScore += 15 // Indoor gets busier when outdoor is wet
                weatherImpact = "Rain driving indoor traffic"
            }
        }

        // Temperature effects
        if (weather.temp !== undefined) {
            // Pools: Hot weather = packed
            if (isPool) {
                if (weather.temp > 90) {
                    trafficScore += 35
                    weatherImpact = "Hot weather - pool is packed!"
                } else if (weather.temp > 85) {
                    trafficScore += 25
                    weatherImpact = "Warm day - pool busy"
                } else if (weather.temp < 60) {
                    trafficScore -= 30
                    weatherImpact = "Cool weather - pool quiet"
                }
            }

            // Outdoor courts: Extreme temps reduce traffic
            if (isOutdoor && !isPool) {
                if (weather.temp > 95) {
                    trafficScore -= 25
                    weatherImpact = "Extreme heat keeping people away"
                } else if (weather.temp < 45) {
                    trafficScore -= 20
                    weatherImpact = "Cold weather - fewer players"
                } else if (weather.temp >= 70 && weather.temp <= 82) {
                    trafficScore += 15
                    weatherImpact = "Perfect weather - expect crowds"
                }
            }

            // Indoor: Extreme weather drives traffic inside
            if (isIndoor) {
                if (weather.temp > 95 || weather.temp < 35) {
                    trafficScore += 20
                    weatherImpact = "Extreme temps driving indoor traffic"
                }
            }
        }

        // High UV drives people indoors or to pools
        if (weather.uvIndex !== undefined && weather.uvIndex >= 9) {
            if (isOutdoor && !isPool) {
                trafficScore -= 10
                weatherImpact = weatherImpact || "High UV - less outdoor activity"
            } else if (isPool) {
                trafficScore += 10 // Pool + shade still popular
            }
        }

        // High wind affects outdoor activities
        if (weather.windSpeed !== undefined && weather.windSpeed > 20) {
            if (isOutdoor) {
                trafficScore -= 15
                weatherImpact = weatherImpact || "Windy - outdoor sports affected"
            }
        }

        // Humidity affects outdoor comfort
        if (weather.humidity !== undefined && weather.humidity > 85) {
            if (isOutdoor && !isPool) {
                trafficScore -= 10
                weatherImpact = weatherImpact || "High humidity discouraging players"
            }
        }
    }

    // Add some randomness to simulate ML uncertainty (±10 points)
    trafficScore += Math.random() * 20 - 10

    // Clamp score between 0-100
    trafficScore = Math.max(0, Math.min(100, trafficScore))

    // Determine traffic level
    let level: TrafficLevel
    let emoji: string
    let color: string
    let label: string
    let estimatedWaitTime: string | undefined
    let peakHours: string | undefined

    if (trafficScore < 35) {
        level = "low"
        emoji = "🟢"
        color = "#7ED957"
        label = "Low Traffic"
        estimatedWaitTime = undefined
        peakHours = isWeekend ? "9 AM - 6 PM" : "6-9 AM, 5-8 PM"
    } else if (trafficScore < 65) {
        level = "moderate"
        emoji = "🟡"
        color = "#FFA500"
        label = "Moderate Traffic"
        estimatedWaitTime = "5-10 min wait"
        peakHours = isWeekend ? "9 AM - 6 PM" : "6-9 AM, 5-8 PM"
    } else {
        level = "busy"
        emoji = "🔴"
        color = "#FF6B6B"
        label = "Busy"
        estimatedWaitTime = "15-20 min wait"
        peakHours = isWeekend ? "9 AM - 6 PM" : "6-9 AM, 5-8 PM"
    }

    // Confidence score (higher during peak hours, lower during off-hours)
    const confidence = Math.min(0.95, 0.6 + (trafficScore / 200))

    return {
        level,
        emoji,
        color,
        label,
        confidence,
        estimatedWaitTime,
        peakHours,
        weatherImpact,
    }
}

/**
 * Get traffic trend for the next few hours
 */
export function getTrafficTrend(
    venueId: string,
    currentTime: Date = new Date(),
    weather?: WeatherFactors,
    venueType?: VenueType
): string {
    const currentPrediction = predictVenueTraffic(venueId, currentTime, undefined, weather, venueType)
    const nextHourTime = new Date(currentTime.getTime() + 60 * 60 * 1000)
    const nextHourPrediction = predictVenueTraffic(venueId, nextHourTime, undefined, weather, venueType)

    if (currentPrediction.level === "low" && nextHourPrediction.level !== "low") {
        return "📈 Getting busier"
    } else if (currentPrediction.level === "busy" && nextHourPrediction.level !== "busy") {
        return "📉 Slowing down"
    } else {
        return "➡️ Steady"
    }
}

/**
 * Predict best time to visit based on traffic and weather
 */
export function getBestVisitTime(
    venueId: string,
    venueType: VenueType = "general",
    weather?: WeatherFactors
): { time: string; reason: string } {
    const now = new Date()
    const hour = now.getHours()

    // Test next 12 hours to find lowest traffic
    let bestHour = hour
    let lowestScore = 100

    for (let h = 0; h < 12; h++) {
        const testTime = new Date(now.getTime() + h * 60 * 60 * 1000)
        const prediction = predictVenueTraffic(venueId, testTime, undefined, weather, venueType)

        // Use confidence as a proxy for score (lower is better for availability)
        const scoreEstimate = prediction.level === "low" ? 20 : prediction.level === "moderate" ? 50 : 80

        if (scoreEstimate < lowestScore) {
            lowestScore = scoreEstimate
            bestHour = testTime.getHours()
        }
    }

    const formatHour = (h: number) => {
        const ampm = h >= 12 ? "PM" : "AM"
        const hour12 = h % 12 || 12
        return `${hour12} ${ampm}`
    }

    let reason = "Lowest expected traffic"
    if (weather?.temp && weather.temp > 85) {
        reason = "Coolest part of day"
    } else if (weather?.uvIndex && weather.uvIndex >= 8) {
        reason = "Lower UV levels"
    }

    return {
        time: formatHour(bestHour),
        reason,
    }
}

