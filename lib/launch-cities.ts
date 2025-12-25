/**
 * Launch Cities Configuration
 * Only these cities have booking enabled
 */

export const LAUNCH_CITIES = [
    { id: "atlanta", name: "Atlanta", state: "GA", aliases: ["atl"] },
    { id: "myrtle-beach", name: "Myrtle Beach", state: "SC", aliases: ["mb", "myrtle"] },
    { id: "san-francisco", name: "San Francisco", state: "CA", aliases: ["sf", "san fran"] },
    { id: "new-york", name: "New York City", state: "NY", aliases: ["nyc", "new york", "manhattan", "brooklyn"] },
    { id: "austin", name: "Austin", state: "TX", aliases: [] },
    { id: "phoenix", name: "Phoenix", state: "AZ", aliases: [] },
    { id: "miami", name: "Miami", state: "FL", aliases: ["mia"] },
] as const

export type LaunchCityId = typeof LAUNCH_CITIES[number]["id"]

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
