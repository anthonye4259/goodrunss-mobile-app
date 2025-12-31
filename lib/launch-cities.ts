/**
 * Launch Cities Configuration
 * Only these cities have booking enabled
 */

export const LAUNCH_CITIES = [
    // USA
    { id: "atlanta", name: "Atlanta", state: "GA", country: "USA", aliases: ["atl"], timezone: "America/New_York" },
    { id: "myrtle-beach", name: "Myrtle Beach", state: "SC", country: "USA", aliases: ["mb", "myrtle"], timezone: "America/New_York" },
    { id: "san-francisco", name: "San Francisco", state: "CA", country: "USA", aliases: ["sf", "san fran"], timezone: "America/Los_Angeles" },
    { id: "new-york", name: "New York City", state: "NY", country: "USA", aliases: ["nyc", "new york", "manhattan", "brooklyn"], timezone: "America/New_York" },
    { id: "austin", name: "Austin", state: "TX", country: "USA", aliases: [], timezone: "America/Chicago" },
    { id: "phoenix", name: "Phoenix", state: "AZ", country: "USA", aliases: [], timezone: "America/Phoenix" },
    { id: "miami", name: "Miami", state: "FL", country: "USA", aliases: ["mia"], timezone: "America/New_York" },

    // UK
    { id: "london", name: "London", state: "", country: "UK", aliases: ["ldn"], timezone: "Europe/London" },
    { id: "manchester", name: "Manchester", state: "", country: "UK", aliases: ["manc"], timezone: "Europe/London" },

    // Spain
    { id: "barcelona", name: "Barcelona", state: "", country: "Spain", aliases: ["bcn"], timezone: "Europe/Madrid" },
    { id: "madrid", name: "Madrid", state: "", country: "Spain", aliases: [], timezone: "Europe/Madrid" },
    { id: "marbella", name: "Marbella", state: "", country: "Spain", aliases: [], timezone: "Europe/Madrid" },

    // UAE
    { id: "dubai", name: "Dubai", state: "", country: "UAE", aliases: ["dxb"], timezone: "Asia/Dubai" },
    { id: "abu-dhabi", name: "Abu Dhabi", state: "", country: "UAE", aliases: ["auh"], timezone: "Asia/Dubai" },

    // Portugal
    { id: "lisbon", name: "Lisbon", state: "", country: "Portugal", aliases: ["lisboa"], timezone: "Europe/Lisbon" },
    { id: "algarve", name: "Algarve", state: "", country: "Portugal", aliases: [], timezone: "Europe/Lisbon" },
] as const

export type LaunchCityId = typeof LAUNCH_CITIES[number]["id"]

/**
 * Priority Launch Cities for Extreme Marketing Push
 * These cities get 2x referral bonuses and special features
 */
export const PRIORITY_LAUNCH_CITIES: LaunchCityId[] = [
    "myrtle-beach",
    "new-york",
    "san-francisco",
]

/**
 * Check if a city is a priority launch city
 */
export function isPriorityCity(cityId?: string): boolean {
    if (!cityId) return false
    return PRIORITY_LAUNCH_CITIES.includes(cityId as LaunchCityId)
}

/**
 * Get referral multiplier for a city
 * Priority cities get 2x, others get 1x
 */
export function getReferralMultiplier(cityId?: string): number {
    return isPriorityCity(cityId) ? 2 : 1
}

/**
 * Check if a city has booking enabled
 */
export function isBookingEnabled(city?: string, state?: string): boolean {
    if (!city) return false

    const normalizedCity = city.toLowerCase().trim()
    const normalizedState = state?.toLowerCase().trim()

    return LAUNCH_CITIES.some(launchCity => {
        // Match by city name
        if (launchCity.name.toLowerCase() === normalizedCity) return true

        // Match by alias
        if (launchCity.aliases.some(alias => alias === normalizedCity)) return true

        // Match by city + state
        if (normalizedState && launchCity.state.toLowerCase() === normalizedState) {
            if (launchCity.name.toLowerCase().includes(normalizedCity)) return true
        }

        return false
    })
}

/**
 * Get launch city info if booking is enabled
 */
export function getLaunchCity(city?: string): typeof LAUNCH_CITIES[number] | null {
    if (!city) return null

    const normalizedCity = city.toLowerCase().trim()

    return LAUNCH_CITIES.find(launchCity => {
        if (launchCity.name.toLowerCase() === normalizedCity) return true
        if (launchCity.aliases.some(alias => alias === normalizedCity)) return true
        return false
    }) || null
}

/**
 * Sports/activities that support facility booking
 */
export const BOOKABLE_SPORTS = [
    // Racquet Sports
    "Tennis",
    "Pickleball",
    "Padel",
    "Racquetball",
    // Wellness Studios
    "Pilates",
    "Yoga",
] as const

export type BookableSport = typeof BOOKABLE_SPORTS[number]

/**
 * Check if a sport supports facility booking
 */
export function isBookableSport(sport?: string): boolean {
    if (!sport) return false
    return BOOKABLE_SPORTS.some(s => s.toLowerCase() === sport.toLowerCase())
}

/**
 * Get the category of a bookable sport
 */
export function getBookableCategory(sport?: string): "racquet" | "wellness" | null {
    if (!sport) return null
    const normalized = sport.toLowerCase()

    if (["tennis", "pickleball", "padel", "racquetball"].includes(normalized)) {
        return "racquet"
    }
    if (["pilates", "yoga"].includes(normalized)) {
        return "wellness"
    }
    return null
}
