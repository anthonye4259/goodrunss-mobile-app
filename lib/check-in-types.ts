export interface CheckIn {
  id: string
  userId: string
  userName: string
  venueId: string
  venueName: string
  sport: string
  timestamp: Date
  isPublic: boolean
  needsPlayers?: boolean
  playersNeeded?: number
  skillLevel?: string
}

export interface PlayerAlert {
  id: string
  type: "check-in" | "need-players"
  userId: string
  userName?: string // Only for need-players alerts
  venueId: string
  venueName: string
  sport: string
  timestamp: Date
  playersNeeded?: number
  skillLevel?: string
  distance?: string
  expiresAt: Date
}

export interface PSAAlert {
  id: string
  userId: string
  userName: string
  message: string
  sport?: string
  venueId?: string
  venueName?: string
  timestamp: Date
  expiresAt: Date
  radius: number // miles
}

export type VenueType = "recreational" | "studio"

export interface Venue {
  id: string
  name: string
  type: VenueType // Added venue type
  address: string
  sports: string[]
  amenities: string[]
  rating: number
  pricePerHour?: number
  imageUrl?: string
  hours?: {
    open: string
    close: string
  }
  coordinates?: {
    latitude: number
    longitude: number
  }
}
