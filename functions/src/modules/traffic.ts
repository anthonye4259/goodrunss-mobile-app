import * as functions from "firebase-functions"
import * as admin from "firebase-admin"

// GLOBAL CITY DATABASE - 50+ major cities worldwide with population density
const GLOBAL_CITIES: Record<string, { name: string; density: number; population: number; country: string }> = {
    // USA - Major metros
    "40.7,-74.0": { name: "New York", density: 27016, population: 8400000, country: "US" },
    "34.1,-118.2": { name: "Los Angeles", density: 8092, population: 3900000, country: "US" },
    "41.9,-87.6": { name: "Chicago", density: 11841, population: 2700000, country: "US" },
    "29.8,-95.4": { name: "Houston", density: 3613, population: 2300000, country: "US" },
    "33.4,-112.1": { name: "Phoenix", density: 3120, population: 1680000, country: "US" },
    "39.9,-75.2": { name: "Philadelphia", density: 11379, population: 1580000, country: "US" },
    "37.8,-122.4": { name: "San Francisco", density: 18569, population: 870000, country: "US" },
    "47.6,-122.3": { name: "Seattle", density: 8775, population: 750000, country: "US" },
    "25.8,-80.2": { name: "Miami", density: 12139, population: 470000, country: "US" },
    "42.4,-71.1": { name: "Boston", density: 14165, population: 690000, country: "US" },
    "33.8,-84.4": { name: "Atlanta", density: 3667, population: 500000, country: "US" },
    "32.8,-96.8": { name: "Dallas", density: 3866, population: 1340000, country: "US" },
    "36.2,-115.1": { name: "Las Vegas", density: 4527, population: 640000, country: "US" },
    "39.7,-104.9": { name: "Denver", density: 4520, population: 730000, country: "US" },
    "30.3,-97.7": { name: "Austin", density: 3006, population: 980000, country: "US" },

    // Europe
    "51.5,-0.1": { name: "London", density: 5900, population: 8900000, country: "GB" },
    "48.9,2.3": { name: "Paris", density: 21000, population: 2100000, country: "FR" },
    "52.5,13.4": { name: "Berlin", density: 4200, population: 3600000, country: "DE" },
    "40.4,-3.7": { name: "Madrid", density: 5400, population: 3300000, country: "ES" },
    "41.4,2.2": { name: "Barcelona", density: 16000, population: 1600000, country: "ES" },
    "41.9,12.5": { name: "Rome", density: 2200, population: 2900000, country: "IT" },
    "45.5,9.2": { name: "Milan", density: 7500, population: 1400000, country: "IT" },
    "52.4,4.9": { name: "Amsterdam", density: 5200, population: 870000, country: "NL" },
    "50.8,4.4": { name: "Brussels", density: 7400, population: 180000, country: "BE" },
    "59.3,18.1": { name: "Stockholm", density: 5200, population: 980000, country: "SE" },
    "55.7,12.6": { name: "Copenhagen", density: 7100, population: 630000, country: "DK" },
    "48.2,16.4": { name: "Vienna", density: 4600, population: 1900000, country: "AT" },
    "47.4,8.5": { name: "Zurich", density: 4700, population: 430000, country: "CH" },
    "53.3,-6.3": { name: "Dublin", density: 4600, population: 550000, country: "IE" },
    "55.8,37.6": { name: "Moscow", density: 4900, population: 12500000, country: "RU" },

    // Asia
    "35.7,139.7": { name: "Tokyo", density: 6400, population: 13900000, country: "JP" },
    "37.6,127.0": { name: "Seoul", density: 16000, population: 9700000, country: "KR" },
    "31.2,121.5": { name: "Shanghai", density: 3800, population: 24200000, country: "CN" },
    "39.9,116.4": { name: "Beijing", density: 1300, population: 21500000, country: "CN" },
    "22.3,114.2": { name: "Hong Kong", density: 6800, population: 7500000, country: "HK" },
    "1.3,103.8": { name: "Singapore", density: 8300, population: 5700000, country: "SG" },
    "25.0,121.5": { name: "Taipei", density: 9600, population: 2600000, country: "TW" },
    "13.8,100.5": { name: "Bangkok", density: 5300, population: 10500000, country: "TH" },
    "28.6,77.2": { name: "Delhi", density: 11300, population: 16700000, country: "IN" },
    "19.1,72.9": { name: "Mumbai", density: 20000, population: 12500000, country: "IN" },

    // Middle East
    "25.0,55.3": { name: "Dubai", density: 860, population: 3400000, country: "AE" },
    "31.8,35.2": { name: "Jerusalem", density: 7600, population: 950000, country: "IL" },
    "32.1,34.8": { name: "Tel Aviv", density: 8300, population: 460000, country: "IL" },

    // Oceania
    "-33.9,151.2": { name: "Sydney", density: 2100, population: 5300000, country: "AU" },
    "-37.8,145.0": { name: "Melbourne", density: 1700, population: 5000000, country: "AU" },
    "-36.8,174.8": { name: "Auckland", density: 1400, population: 1660000, country: "NZ" },

    // South America
    "-23.5,-46.6": { name: "São Paulo", density: 7400, population: 12300000, country: "BR" },
    "-22.9,-43.2": { name: "Rio de Janeiro", density: 5400, population: 6700000, country: "BR" },
    "-34.6,-58.4": { name: "Buenos Aires", density: 14500, population: 3100000, country: "AR" },
    "-33.4,-70.6": { name: "Santiago", density: 8800, population: 5600000, country: "CL" },
    "4.7,-74.1": { name: "Bogotá", density: 4500, population: 7900000, country: "CO" },

    // North America (non-US)
    "43.7,-79.4": { name: "Toronto", density: 4300, population: 2900000, country: "CA" },
    "45.5,-73.6": { name: "Montreal", density: 4900, population: 1800000, country: "CA" },
    "49.3,-123.1": { name: "Vancouver", density: 5500, population: 680000, country: "CA" },
    "19.4,-99.1": { name: "Mexico City", density: 6000, population: 21900000, country: "MX" },

    // Africa
    "-33.9,18.4": { name: "Cape Town", density: 1500, population: 4600000, country: "ZA" },
    "-26.2,28.0": { name: "Johannesburg", density: 2900, population: 5800000, country: "ZA" },
    "30.0,31.2": { name: "Cairo", density: 19400, population: 10200000, country: "EG" },
    "-1.3,36.8": { name: "Nairobi", density: 4500, population: 4700000, country: "KE" },
}

function isSchoolInSession(countryCode: string): boolean {
    const now = new Date()
    const month = now.getMonth()

    // Southern hemisphere countries (Feb-Nov school year)
    const southernCountries = ["AU", "NZ", "AR", "CL", "ZA", "BR"]
    if (southernCountries.includes(countryCode)) {
        return month >= 1 && month <= 10
    }

    // Northern hemisphere (Sept-June)
    if (month >= 8 || month <= 4) return true
    if (month === 5 && now.getDate() <= 15) return true
    return false
}

// function getCityKey(lat: number, lon: number): string {
//    return `${lat.toFixed(1)},${lon.toFixed(1)}`
// }

interface TrafficResult {
    level: "low" | "moderate" | "busy"
    emoji: string
    color: string
    label: string
    waitTime: string | null
    weatherImpact: string | null
    populationImpact: string | null
    geoTrafficImpact: string | null
    updatedAt: admin.firestore.FieldValue
}

function calculateTrafficPrediction(
    venueId: string,
    lat: number,
    lon: number,
    venueType: string,
    currentTime: Date
): TrafficResult {
    const hour = currentTime.getHours()
    const dayOfWeek = currentTime.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    let trafficScore = 0
    let weatherImpact: string | null = null
    let populationImpact: string | null = null
    let geoTrafficImpact: string | null = null

    // 1. BASE: Time of Day (0-10) - Universal human behavior
    if (hour >= 17 && hour <= 20) trafficScore += 8 // Peak after work
    else if (hour >= 12 && hour <= 13) trafficScore += 5 // Lunch
    else if (hour >= 6 && hour <= 9) trafficScore += 4 // Morning
    else if (hour >= 22 || hour <= 5) trafficScore += 1 // Late night
    else trafficScore += 3

    // 2. MODIFIER: Weekend vs Weekday
    if (isWeekend) {
        if (hour >= 10 && hour <= 16) trafficScore += 4 // Weekend daytime is busy
        else trafficScore += 1
    }

    // 3. MODIFIER: Geo-Population Density (Using our database)
    // We fuzzy match closest city
    let closestCity = null
    let minDist = Infinity

    for (const [key, city] of Object.entries(GLOBAL_CITIES)) {
        const [cLat, cLon] = key.split(",").map(Number)
        const d = Math.sqrt(Math.pow(cLat - lat, 2) + Math.pow(cLon - lon, 2))
        if (d < 5 && d < minDist) { // Within ~300 miles
            minDist = d
            closestCity = city
        }
    }

    if (closestCity) {
        // Higher density = higher base traffic
        if (closestCity.density > 15000) {
            trafficScore += 3
            populationImpact = `High density zone (near ${closestCity.name})`
        } else if (closestCity.density > 8000) {
            trafficScore += 2
            populationImpact = `Urban zone (near ${closestCity.name})`
        }

        // 4. MODIFIER: School Year (Country specific)
        if (isSchoolInSession(closestCity.country) && (hour >= 14 && hour <= 16) && !isWeekend) {
            trafficScore += 3 // Schools out bump
        }
    }

    // 5. MODIFIER: Venue Type
    if (venueType === "tennis" || venueType === "pickleball") {
        if (isWeekend && hour >= 9 && hour <= 12) trafficScore += 3 // Morning rush
    }

    // Normalize Score (0-20 scale -> Low/Mod/Busy)
    let level: "low" | "moderate" | "busy" = "low"
    let emoji = ""
    let color = "#22C55E"
    let label = "Quiet"
    let waitTime: string | null = "No wait"

    if (trafficScore >= 14) {
        level = "busy"
        emoji = ""
        color = "#EF4444"
        label = "Busy"
        waitTime = "20-40 min wait"
    } else if (trafficScore >= 8) {
        level = "moderate"
        emoji = ""
        color = "#EAB308"
        label = "Active"
        waitTime = "5-15 min wait"
    }

    return {
        level,
        emoji,
        color,
        label,
        waitTime,
        weatherImpact,
        populationImpact,
        geoTrafficImpact, // emoji key kept for schema compatibility but empty
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
}

/**
 * 24/7 Traffic Prediction Engine
 * Scheduled function to update traffic predictions
 */
export const updateTrafficPredictions = functions.pubsub.schedule("every 30 minutes").onRun(async (context) => {
    try {
        const db = admin.firestore()
        const venuesSnapshot = await db.collection("venues").get()
        const now = new Date()

        const batch = db.batch()
        let count = 0

        for (const doc of venuesSnapshot.docs) {
            const venue = doc.data()
            if (!venue.lat || !venue.lng) continue

            const prediction = calculateTrafficPrediction(
                doc.id,
                venue.lat,
                venue.lng,
                venue.sport || "general",
                now
            )

            const ref = db.collection("venues").doc(doc.id).collection("liveStatus").doc("current")
            batch.set(ref, prediction, { merge: true })
            count++

            if (count >= 400) {
                await batch.commit()
                count = 0
            }
        }

        if (count > 0) {
            await batch.commit()
        }

        functions.logger.info("Updated traffic predictions", { count: venuesSnapshot.size })
        return null
    } catch (error) {
        functions.logger.error("Error updating traffic predictions", error)
        return null
    }
})
