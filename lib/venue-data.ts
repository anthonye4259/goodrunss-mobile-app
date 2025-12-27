/**
 * Real Venue Data from Google Places API
 * Loaded from data/venues-google-places.json
 */

import { Activity } from "./activity-content"
import realVenuesData from "../data/venues-google-places.json"

export interface Venue {
    id: string
    googlePlaceId?: string
    name: string
    type?: string
    sport: string
    address: string
    city?: string
    state?: string
    zipCode?: string
    coordinates?: { lat: number; lon: number }
    lat?: number
    lng?: number
    rating: number
    reviews?: number
    reviewCount?: number
    amenities?: string[]
    hours?: string
    price?: string
    images: string[]
    photos?: string[]
    activePlayersNow?: number
    lastActivityTimestamp?: Date
    isOpen?: boolean
    source?: string
    distance?: number
    isBookable?: boolean
}

// Map sport names from Google Places format to our Activity format
const sportMapping: Record<string, Activity> = {
    basketball: "Basketball",
    tennis: "Tennis",
    pickleball: "Pickleball",
    padel: "Padel",
    racquetball: "Racquetball",
    volleyball: "Volleyball",
    golf: "Golf",
    soccer: "Soccer",
    swimming: "Swimming",
    yoga: "Yoga",
    pilates: "Pilates",
}

// Convert real venues to our app format
function convertVenue(v: any): Venue {
    return {
        id: v.id,
        googlePlaceId: v.googlePlaceId,
        name: v.name,
        type: v.sport?.charAt(0).toUpperCase() + v.sport?.slice(1) + " Venue",
        sport: sportMapping[v.sport] || v.sport,
        address: v.address,
        coordinates: v.lat && v.lng ? { lat: v.lat, lon: v.lng } : undefined,
        lat: v.lat,
        lng: v.lng,
        rating: v.rating || 4.0,
        reviews: v.reviewCount || 0,
        reviewCount: v.reviewCount || 0,
        images: v.photos || [],
        photos: v.photos || [],
        isOpen: v.isOpen,
        source: v.source,
        // Mock active players (will be replaced with real-time data later)
        activePlayersNow: Math.floor(Math.random() * 15) + 1,
        lastActivityTimestamp: new Date(Date.now() - Math.random() * 30 * 60000),
    }
}

// Convert all real venues
const allRealVenues: Venue[] = (realVenuesData as any[]).map(convertVenue)

// Group venues by sport
export const BASKETBALL_VENUES = allRealVenues.filter(v => v.sport === "Basketball")
export const TENNIS_VENUES = allRealVenues.filter(v => v.sport === "Tennis")
export const PICKLEBALL_VENUES = allRealVenues.filter(v => v.sport === "Pickleball")
export const PADEL_VENUES = allRealVenues.filter(v => v.sport === "Padel")
export const RACQUETBALL_VENUES = allRealVenues.filter(v => v.sport === "Racquetball")
export const VOLLEYBALL_VENUES = allRealVenues.filter(v => v.sport === "Volleyball")
export const GOLF_VENUES = allRealVenues.filter(v => v.sport === "Golf")
export const SOCCER_VENUES = allRealVenues.filter(v => v.sport === "Soccer")
export const SWIMMING_VENUES = allRealVenues.filter(v => v.sport === "Swimming")
export const YOGA_VENUES = allRealVenues.filter(v => v.sport === "Yoga")
export const PILATES_VENUES = allRealVenues.filter(v => v.sport === "Pilates")

export function getVenuesForSport(sport: string): Venue[] {
    const venueMap: Record<string, Venue[]> = {
        Basketball: BASKETBALL_VENUES,
        Tennis: TENNIS_VENUES,
        Pickleball: PICKLEBALL_VENUES,
        Padel: PADEL_VENUES,
        Racquetball: RACQUETBALL_VENUES,
        Volleyball: VOLLEYBALL_VENUES,
        Golf: GOLF_VENUES,
        Soccer: SOCCER_VENUES,
        Swimming: SWIMMING_VENUES,
        Yoga: YOGA_VENUES,
        Pilates: PILATES_VENUES,
    }
    return venueMap[sport] || []
}

export function getAllVenues(): Venue[] {
    return allRealVenues
}

export function getVenueById(id: string): Venue | undefined {
    return allRealVenues.find(v => v.id === id)
}

export function calculateDistance(
    userLat: number,
    userLon: number,
    venueLat: number,
    venueLon: number
): number {
    const R = 3959 // Earth's radius in miles
    const dLat = ((venueLat - userLat) * Math.PI) / 180
    const dLon = ((venueLon - userLon) * Math.PI) / 180
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((userLat * Math.PI) / 180) *
        Math.cos((venueLat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

// Stats
console.log(`[GoodRunss] Loaded ${allRealVenues.length} real venues from Google Places`)
