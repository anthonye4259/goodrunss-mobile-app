/**
 * GoodRunss Global Facility Fetcher
 * 
 * Fetches ALL recreational and wellness facilities worldwide using Google Places API
 * Imports data directly into Firebase Firestore
 */

import axios from 'axios'
import { SportType, FacilityType, Venue, SPORT_SEARCH_KEYWORDS } from '../../lib/types/global-facilities'

// ===== CONFIGURATION =====
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || ''
const GOOGLE_PLACES_API_URL = 'https://maps.googleapis.com/maps/api/place'

// Default search radius (in meters) - 50km
const DEFAULT_SEARCH_RADIUS = 50000

// ===== TYPES =====
interface SearchLocation {
  lat: number
  lng: number
  name: string  // e.g., "New York", "Los Angeles"
  radius?: number
}

interface GooglePlaceResult {
  place_id: string
  name: string
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  formatted_address?: string
  types: string[]
  rating?: number
  user_ratings_total?: number
  opening_hours?: {
    open_now?: boolean
    weekday_text?: string[]
  }
  photos?: Array<{
    photo_reference: string
    height: number
    width: number
  }>
  business_status?: string
}

interface GooglePlaceDetails {
  place_id: string
  name: string
  formatted_address: string
  formatted_phone_number?: string
  website?: string
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  types: string[]
  rating?: number
  user_ratings_total?: number
  opening_hours?: {
    weekday_text?: string[]
    periods?: Array<{
      open: { day: number; time: string }
      close: { day: number; time: string }
    }>
  }
  photos?: Array<{
    photo_reference: string
    height: number
    width: number
  }>
  reviews?: Array<{
    rating: number
    text: string
    time: number
  }>
  price_level?: number
  address_components?: Array<{
    long_name: string
    short_name: string
    types: string[]
  }>
}

// ===== MAJOR US CITIES (STARTING POINT) =====
export const US_MAJOR_CITIES: SearchLocation[] = [
  { lat: 40.7128, lng: -74.0060, name: "New York, NY" },
  { lat: 34.0522, lng: -118.2437, name: "Los Angeles, CA" },
  { lat: 41.8781, lng: -87.6298, name: "Chicago, IL" },
  { lat: 29.7604, lng: -95.3698, name: "Houston, TX" },
  { lat: 33.4484, lng: -112.0740, name: "Phoenix, AZ" },
  { lat: 39.9526, lng: -75.1652, name: "Philadelphia, PA" },
  { lat: 29.4241, lng: -98.4936, name: "San Antonio, TX" },
  { lat: 32.7767, lng: -96.7970, name: "Dallas, TX" },
  { lat: 37.3382, lng: -121.8863, name: "San Jose, CA" },
  { lat: 30.2672, lng: -97.7431, name: "Austin, TX" },
  { lat: 30.3322, lng: -81.6557, name: "Jacksonville, FL" },
  { lat: 37.7749, lng: -122.4194, name: "San Francisco, CA" },
  { lat: 39.7392, lng: -104.9903, name: "Denver, CO" },
  { lat: 38.9072, lng: -77.0369, name: "Washington, DC" },
  { lat: 42.3601, lng: -71.0589, name: "Boston, MA" },
  { lat: 47.6062, lng: -122.3321, name: "Seattle, WA" },
  { lat: 25.7617, lng: -80.1918, name: "Miami, FL" },
  { lat: 33.7490, lng: -84.3880, name: "Atlanta, GA" },
  { lat: 45.5152, lng: -122.6784, name: "Portland, OR" },
  { lat: 36.1699, lng: -115.1398, name: "Las Vegas, NV" },
]

// ===== TOP 50 US COLLEGES/UNIVERSITIES =====
export const US_TOP_COLLEGES: SearchLocation[] = [
  { lat: 42.3736, lng: -71.1097, name: "Harvard University", radius: 5000 },
  { lat: 42.3601, lng: -71.0942, name: "MIT", radius: 5000 },
  { lat: 40.3440, lng: -74.6514, name: "Princeton University", radius: 5000 },
  { lat: 41.3163, lng: -72.9223, name: "Yale University", radius: 5000 },
  { lat: 37.4275, lng: -122.1697, name: "Stanford University", radius: 5000 },
  { lat: 34.0689, lng: -118.4452, name: "UCLA", radius: 5000 },
  { lat: 34.0224, lng: -118.2851, name: "USC", radius: 5000 },
  { lat: 37.8719, lng: -122.2585, name: "UC Berkeley", radius: 5000 },
  { lat: 42.2780, lng: -83.7382, name: "University of Michigan", radius: 5000 },
  { lat: 30.2849, lng: -97.7341, name: "University of Texas at Austin", radius: 5000 },
  { lat: 40.8075, lng: -73.9626, name: "Columbia University", radius: 5000 },
  { lat: 41.7886, lng: -87.5987, name: "University of Chicago", radius: 5000 },
  { lat: 36.0014, lng: -78.9382, name: "Duke University", radius: 5000 },
  { lat: 41.8268, lng: -71.4025, name: "Brown University", radius: 5000 },
  { lat: 39.9496, lng: -75.1914, name: "University of Pennsylvania", radius: 5000 },
  { lat: 42.0565, lng: -87.6753, name: "Northwestern University", radius: 5000 },
  { lat: 43.0731, lng: -89.4012, name: "University of Wisconsin", radius: 5000 },
  { lat: 35.9049, lng: -79.0469, name: "UNC Chapel Hill", radius: 5000 },
  { lat: 33.7756, lng: -84.3963, name: "Georgia Tech", radius: 5000 },
  { lat: 38.8977, lng: -77.0365, name: "Georgetown University", radius: 5000 },
]

// ===== MAIN FETCHER CLASS =====
export class GlobalFacilityFetcher {
  private apiKey: string
  private fetchedPlaceIds: Set<string> = new Set()

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * Search for facilities by sport type and location
   */
  async searchBySportAndLocation(
    sport: SportType,
    location: SearchLocation,
    options?: {
      maxResults?: number
      includeClosed?: boolean
    }
  ): Promise<GooglePlaceResult[]> {
    const keywords = SPORT_SEARCH_KEYWORDS[sport]
    const results: GooglePlaceResult[] = []

    for (const keyword of keywords) {
      try {
        const searchResults = await this.nearbySearch(
          location.lat,
          location.lng,
          keyword,
          location.radius || DEFAULT_SEARCH_RADIUS
        )

        // Filter duplicates and add to results
        for (const result of searchResults) {
          if (!this.fetchedPlaceIds.has(result.place_id)) {
            this.fetchedPlaceIds.add(result.place_id)
            results.push(result)
          }
        }

        // Rate limiting: Wait 100ms between requests to avoid quota issues
        await this.sleep(100)

      } catch (error) {
        console.error(`Error searching for ${keyword} in ${location.name}:`, error)
      }
    }

    // Limit results if specified
    if (options?.maxResults) {
      return results.slice(0, options.maxResults)
    }

    return results
  }

  /**
   * Fetch detailed information for a place
   */
  async getPlaceDetails(placeId: string): Promise<GooglePlaceDetails | null> {
    try {
      const response = await axios.get(`${GOOGLE_PLACES_API_URL}/details/json`, {
        params: {
          place_id: placeId,
          fields: 'place_id,name,formatted_address,formatted_phone_number,website,geometry,types,rating,user_ratings_total,opening_hours,photos,reviews,price_level,address_components',
          key: this.apiKey,
        },
      })

      if (response.data.status === 'OK') {
        return response.data.result
      } else {
        console.error(`Error fetching details for ${placeId}:`, response.data.status)
        return null
      }
    } catch (error) {
      console.error(`Error fetching place details:`, error)
      return null
    }
  }

  /**
   * Convert Google Place to GoodRunss Venue format
   */
  async convertToVenue(
    placeDetails: GooglePlaceDetails,
    sport: SportType,
    facilityType: FacilityType
  ): Promise<Venue> {
    // Extract address components
    const addressComponents = placeDetails.address_components || []
    const city = addressComponents.find(c => c.types.includes('locality'))?.long_name || ''
    const state = addressComponents.find(c => c.types.includes('administrative_area_level_1'))?.short_name
    const country = addressComponents.find(c => c.types.includes('country'))?.short_name || 'US'
    const zipCode = addressComponents.find(c => c.types.includes('postal_code'))?.long_name

    // Build image URLs from photos
    const images = placeDetails.photos?.slice(0, 5).map(photo => 
      this.getPhotoUrl(photo.photo_reference, 800)
    ) || []

    // Determine institution type from Google types
    const institutionType = this.detectInstitutionType(placeDetails.types)
    const institution = institutionType ? this.extractInstitutionName(placeDetails.name) : undefined

    // Convert opening hours
    const hours = this.parseOpeningHours(placeDetails.opening_hours?.periods)

    // Extract amenities from reviews/types
    const amenities = this.extractAmenities(placeDetails)

    const venue: Venue = {
      id: placeDetails.place_id,
      name: placeDetails.name,
      description: `${sport} facility in ${city}`,

      // Location
      lat: placeDetails.geometry.location.lat,
      lng: placeDetails.geometry.location.lng,
      address: placeDetails.formatted_address,
      city,
      state,
      country,
      zipCode,

      // Classification
      facilityType,
      sportTypes: [sport],
      accessType: this.detectAccessType(placeDetails, institutionType),

      // Organization
      institution,
      institutionType,

      // Contact
      phoneNumber: placeDetails.formatted_phone_number,
      website: placeDetails.website,
      hours,

      // Pricing
      pricing: placeDetails.price_level ? {
        currency: 'USD',
        description: this.getPriceLevelDescription(placeDetails.price_level),
      } : undefined,

      // Amenities
      amenities,

      // Quality & Ratings
      rating: placeDetails.rating,
      reviewCount: placeDetails.user_ratings_total,

      // Media
      images,
      coverImage: images[0],

      // Metadata
      verified: false,
      googlePlaceId: placeDetails.place_id,
      createdAt: new Date(),
      updatedAt: new Date(),
      source: 'google_places',

      // Booking
      bookable: false,
    }

    return venue
  }

  /**
   * Nearby search using Google Places API
   */
  private async nearbySearch(
    lat: number,
    lng: number,
    keyword: string,
    radius: number
  ): Promise<GooglePlaceResult[]> {
    try {
      const response = await axios.get(`${GOOGLE_PLACES_API_URL}/nearbysearch/json`, {
        params: {
          location: `${lat},${lng}`,
          radius,
          keyword,
          key: this.apiKey,
        },
      })

      if (response.data.status === 'OK') {
        return response.data.results
      } else {
        console.log(`Search returned status: ${response.data.status}`)
        return []
      }
    } catch (error) {
      console.error(`Error in nearby search:`, error)
      return []
    }
  }

  /**
   * Get photo URL from photo reference
   */
  private getPhotoUrl(photoReference: string, maxWidth: number = 800): string {
    return `${GOOGLE_PLACES_API_URL}/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${this.apiKey}`
  }

  /**
   * Detect institution type from Google types
   */
  private detectInstitutionType(types: string[]): 'college' | 'university' | 'high_school' | 'ymca' | 'community' | 'private' | undefined {
    if (types.includes('university')) return 'university'
    if (types.includes('school')) return 'college'
    if (types.includes('secondary_school')) return 'high_school'
    if (types.includes('health')) return 'community'
    return undefined
  }

  /**
   * Extract institution name (e.g., "UCLA" from "UCLA Recreation Center")
   */
  private extractInstitutionName(name: string): string | undefined {
    // Common patterns
    const patterns = [
      /^([A-Z]{2,})\s/,  // Acronyms like "UCLA ", "MIT "
      /^(.*?University)/i,
      /^(.*?College)/i,
      /YMCA/i,
    ]

    for (const pattern of patterns) {
      const match = name.match(pattern)
      if (match) return match[1] || match[0]
    }

    return undefined
  }

  /**
   * Detect access type from place details
   */
  private detectAccessType(
    details: GooglePlaceDetails,
    institutionType?: string
  ): Venue['accessType'] {
    if (institutionType === 'university' || institutionType === 'college') {
      return 'students_only'
    }
    if (details.types.includes('lodging') || details.types.includes('hotel')) {
      return 'hotel_guests'
    }
    if (details.types.includes('country_club') || details.types.includes('sports_club')) {
      return 'members_only'
    }
    return 'public'
  }

  /**
   * Parse Google opening hours to our format
   */
  private parseOpeningHours(periods: any[] | undefined): Venue['hours'] {
    if (!periods) return undefined

    return periods.map(period => ({
      dayOfWeek: period.open.day as 0 | 1 | 2 | 3 | 4 | 5 | 6,
      openTime: period.open.time,
      closeTime: period.close?.time || '23:59',
    }))
  }

  /**
   * Extract amenities from place details
   */
  private extractAmenities(details: GooglePlaceDetails): string[] {
    const amenities: string[] = []

    // Based on types
    if (details.types.includes('parking')) amenities.push('Parking')
    
    // Common amenities
    amenities.push('Restrooms', 'Water Fountain')

    return amenities
  }

  /**
   * Get price level description
   */
  private getPriceLevelDescription(priceLevel: number): string {
    const levels = ['Free', 'Inexpensive', 'Moderate', 'Expensive', 'Very Expensive']
    return levels[priceLevel] || 'Unknown'
  }

  /**
   * Sleep utility for rate limiting
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Reset fetched place IDs (for new search session)
   */
  resetCache(): void {
    this.fetchedPlaceIds.clear()
  }
}

// ===== HELPER FUNCTION: BATCH FETCH FOR MULTIPLE CITIES =====
export async function fetchFacilitiesForCities(
  apiKey: string,
  sports: SportType[],
  locations: SearchLocation[],
  facilityType: FacilityType,
  onProgress?: (progress: { current: number; total: number; facility: string }) => void
): Promise<Venue[]> {
  const fetcher = new GlobalFacilityFetcher(apiKey)
  const allVenues: Venue[] = []

  let progress = 0
  const total = sports.length * locations.length

  for (const sport of sports) {
    for (const location of locations) {
      progress++
      
      console.log(`\n[${progress}/${total}] Fetching ${sport} facilities in ${location.name}...`)
      
      if (onProgress) {
        onProgress({ current: progress, total, facility: `${sport} in ${location.name}` })
      }

      try {
        // Search for places
        const places = await fetcher.searchBySportAndLocation(sport, location, { maxResults: 20 })
        
        console.log(`  Found ${places.length} ${sport} facilities`)

        // Get details and convert to venues
        for (const place of places) {
          const details = await fetcher.getPlaceDetails(place.place_id)
          if (details) {
            const venue = await fetcher.convertToVenue(details, sport, facilityType)
            allVenues.push(venue)
          }

          // Rate limiting
          await fetcher['sleep'](150)
        }

      } catch (error) {
        console.error(`Error fetching ${sport} in ${location.name}:`, error)
      }

      // Pause between cities to avoid rate limits
      await fetcher['sleep'](500)
    }
  }

  return allVenues
}

// Export for use in scripts
export default GlobalFacilityFetcher

