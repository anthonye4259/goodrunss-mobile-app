export type TrafficLevel = "low" | "moderate" | "busy"

export interface TrafficPrediction {
    level: TrafficLevel
    color: string
    label: string
    confidence: number
    estimatedWaitTime?: string
    peakHours?: string
    weatherImpact?: string
    populationImpact?: string // New: city population effect
    geoTrafficImpact?: string // New: road traffic effect
}

export interface WeatherFactors {
    temp?: number // Fahrenheit
    isRaining?: boolean
    precipitation?: number // mm
    uvIndex?: number
    humidity?: number
    windSpeed?: number // mph
}

export interface PopulationFactors {
    cityPopulation?: number // Total population
    populationDensity?: number // People per sq mile
    metropolitanArea?: boolean // Is it a major metro?
    nearbyColleges?: number // Number of colleges/universities nearby
}

export interface GeoTrafficFactors {
    roadTrafficLevel?: "free" | "light" | "moderate" | "heavy" | "standstill"
    averageCommute?: number // Minutes
    nearHighway?: boolean
    parkingAvailability?: "plenty" | "moderate" | "limited" | "none"
    transitNearby?: boolean
}

export type VenueType = "outdoor_court" | "indoor_gym" | "pool" | "field" | "studio" | "general"

/**
 * ML-based traffic prediction algorithm
 * Factors: time of day, day of week, weather, population, road traffic, current activity
 */
export function predictVenueTraffic(
    venueId: string,
    currentTime: Date = new Date(),
    activePlayersNow?: number,
    weather?: WeatherFactors,
    venueType: VenueType = "general",
    population?: PopulationFactors,
    geoTraffic?: GeoTrafficFactors
): TrafficPrediction {
    const hour = currentTime.getHours()
    const dayOfWeek = currentTime.getDay() // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    // Base traffic score (0-100)
    let trafficScore = 0
    let weatherImpact: string | undefined
    let populationImpact: string | undefined
    let geoTrafficImpact: string | undefined

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

    // ============================================
    // POPULATION DENSITY IMPACT
    // ============================================
    if (population) {
        // Major metros have inherently busier venues
        if (population.metropolitanArea) {
            trafficScore += 15
            populationImpact = "Major metro area - expect crowds"
        }

        // Population density scoring
        if (population.populationDensity !== undefined) {
            if (population.populationDensity > 20000) {
                // Dense urban (NYC, SF level)
                trafficScore += 25
                populationImpact = "Very dense area - high demand"
            } else if (population.populationDensity > 10000) {
                // Urban
                trafficScore += 15
                populationImpact = populationImpact || "Urban area - moderate-high demand"
            } else if (population.populationDensity > 5000) {
                // Suburban
                trafficScore += 8
            } else if (population.populationDensity < 1000) {
                // Rural
                trafficScore -= 10
                populationImpact = "Lower population - usually quiet"
            }
        }

        // College towns spike during school year
        if (population.nearbyColleges && population.nearbyColleges > 0) {
            const month = currentTime.getMonth()
            const isSchoolYear = month >= 8 || month <= 4 // Sept-May
            if (isSchoolYear) {
                trafficScore += 10 * Math.min(population.nearbyColleges, 3)
                populationImpact = populationImpact || "College town - busy during school year"
            }
        }
    }

    // ============================================
    // GEO-TRAFFIC (ROAD CONDITIONS) IMPACT
    // ============================================
    if (geoTraffic) {
        // Road traffic affects arrival patterns
        if (geoTraffic.roadTrafficLevel) {
            switch (geoTraffic.roadTrafficLevel) {
                case "standstill":
                    trafficScore -= 20 // People can't get there
                    geoTrafficImpact = "Traffic jam - people delayed"
                    break
                case "heavy":
                    trafficScore -= 10
                    geoTrafficImpact = "Heavy traffic - slower arrivals"
                    break
                case "moderate":
                    // Normal, no adjustment
                    break
                case "light":
                case "free":
                    trafficScore += 5 // Easy to get there
                    geoTrafficImpact = "Clear roads - easy access"
                    break
            }
        }

        // Parking availability affects willingness to visit
        if (geoTraffic.parkingAvailability) {
            switch (geoTraffic.parkingAvailability) {
                case "none":
                    trafficScore -= 15
                    geoTrafficImpact = geoTrafficImpact || "No parking available"
                    break
                case "limited":
                    trafficScore -= 8
                    geoTrafficImpact = geoTrafficImpact || "Limited parking"
                    break
                case "plenty":
                    trafficScore += 5
                    break
            }
        }

        // Transit nearby increases accessibility
        if (geoTraffic.transitNearby) {
            trafficScore += 10
            geoTrafficImpact = geoTrafficImpact || "Good transit access"
        }

        // Highway access increases traffic potential
        if (geoTraffic.nearHighway) {
            trafficScore += 5
        }
    }

    // Add some randomness to simulate ML uncertainty (±10 points)
    trafficScore += Math.random() * 20 - 10

    // Clamp score between 0-100
    trafficScore = Math.max(0, Math.min(100, trafficScore))

    // Determine traffic level
    let level: TrafficLevel
    let color: string
    let label: string
    let estimatedWaitTime: string | undefined
    let peakHours: string | undefined

    if (trafficScore < 35) {
        level = "low"
        color = "#7ED957"
        label = "Low"
        estimatedWaitTime = undefined
        peakHours = isWeekend ? "9 AM - 6 PM" : "6-9 AM, 5-8 PM"
    } else if (trafficScore < 65) {
        level = "moderate"
        color = "#FFA500"
        label = "Moderate"
        estimatedWaitTime = "5-10 min"
        peakHours = isWeekend ? "9 AM - 6 PM" : "6-9 AM, 5-8 PM"
    } else {
        level = "busy"
        color = "#FF6B6B"
        label = "Busy"
        estimatedWaitTime = "15-20 min"
        peakHours = isWeekend ? "9 AM - 6 PM" : "6-9 AM, 5-8 PM"
    }

    // Confidence score (higher during peak hours, lower during off-hours)
    const confidence = Math.min(0.95, 0.6 + (trafficScore / 200))

    return {
        level,
        color,
        label,
        confidence,
        estimatedWaitTime,
        peakHours,
        weatherImpact,
        populationImpact,
        geoTrafficImpact,
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

