/**
 * GoodRunss Global Facility Types
 * 
 * The complete taxonomy for ALL recreational and wellness facilities worldwide
 * Used by Google Places API integration and mobile app
 */

// ===== SPORT TYPES =====
export type SportType =
  // Court Sports
  | "basketball"
  | "tennis"
  | "pickleball"
  | "racquetball"
  | "squash"
  | "volleyball"
  | "badminton"
  | "handball"
  // Field Sports
  | "soccer"
  | "football"
  | "baseball"
  | "softball"
  | "rugby"
  | "cricket"
  | "lacrosse"
  | "field_hockey"
  // Water Sports
  | "swimming"
  | "water_polo"
  | "diving"
  // Fitness & Wellness
  | "yoga"
  | "pilates"
  | "barre"
  | "spin"
  | "crossfit"
  | "boxing"
  | "kickboxing"
  | "martial_arts"
  | "dance"
  | "zumba"
  | "hiit"
  // Individual Sports
  | "golf"
  | "running"
  | "cycling"
  | "skating"
  | "skateboarding"
  | "climbing"
  | "bowling"
  // General
  | "gym"
  | "recreation"
  | "multi_sport"

// ===== FACILITY TYPES =====
export type FacilityType =
  // Courts
  | "outdoor_court"
  | "indoor_court"
  | "recreation_center_court"
  | "college_court"
  | "private_club_court"
  // Pools
  | "public_pool"
  | "private_pool"
  | "hotel_pool"
  | "college_pool"
  | "olympic_pool"
  | "lap_pool"
  | "community_pool"
  // Fields
  | "public_field"
  | "college_field"
  | "stadium"
  | "sports_complex"
  // Studios
  | "yoga_studio"
  | "pilates_studio"
  | "barre_studio"
  | "spin_studio"
  | "crossfit_box"
  | "boxing_gym"
  | "martial_arts_dojo"
  | "dance_studio"
  // Gyms
  | "commercial_gym"
  | "boutique_gym"
  | "college_gym"
  | "corporate_gym"
  | "24_hour_gym"
  // Tracks
  | "running_track"
  | "cycling_track"
  | "skatepark"
  // Clubs
  | "country_club"
  | "tennis_club"
  | "golf_club"
  | "sports_club"
  // Other
  | "recreation_center"
  | "community_center"
  | "golf_course"
  | "driving_range"
  | "climbing_gym"
  | "bowling_alley"
  | "park"
  // Recovery & Wellness (NEW!)
  | "physical_therapy"
  | "sports_medicine"
  | "chiropractic"
  | "massage_therapy"
  | "acupuncture"
  | "cryotherapy"
  | "float_spa"
  | "sauna_spa"
  | "recovery_studio"
  | "athletic_training"
  | "orthopedic_clinic"

// ===== ACCESS TYPES =====
export type AccessType =
  | "public"              // Open to everyone
  | "members_only"        // Requires membership
  | "students_only"       // College/school students
  | "hotel_guests"        // Hotel guests only
  | "day_pass"            // Pay per visit
  | "reservation"         // Booking required
  | "first_come"          // Walk-in, no reservation

// ===== VENUE INTERFACE =====
export interface Venue {
  // Core Identity
  id: string
  name: string
  description?: string

  // Location
  lat: number
  lng: number
  address: string
  city: string
  state?: string
  country: string
  zipCode?: string

  // Classification
  facilityType: FacilityType
  sportTypes: SportType[]  // Can support multiple sports
  accessType: AccessType

  // Organization (if applicable)
  institution?: string      // e.g., "UCLA", "YMCA"
  institutionType?: "college" | "university" | "high_school" | "ymca" | "community" | "private"
  
  // Contact & Hours
  phoneNumber?: string
  website?: string
  email?: string
  hours?: OperatingHours[]

  // Pricing
  pricing?: VenuePricing

  // Amenities & Features
  amenities: string[]
  features?: VenueFeatures

  // Quality & Ratings
  rating?: number
  reviewCount?: number
  goodRunssRating?: number
  qualityAttributes?: Record<string, number>

  // Media
  images: string[]
  coverImage?: string

  // Metadata
  verified: boolean
  googlePlaceId?: string
  createdAt: Date
  updatedAt: Date
  source: "google_places" | "manual" | "user_submitted"

  // Booking
  bookable: boolean
  bookingUrl?: string
  bookingPhone?: string

  // Additional
  distance?: number  // Calculated at query time
  popularity?: number
  trendingScore?: number
}

// ===== SUPPORTING TYPES =====
export interface OperatingHours {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6  // 0 = Sunday
  openTime: string   // "08:00"
  closeTime: string  // "22:00"
  closed?: boolean
}

export interface VenuePricing {
  dayPass?: number
  monthly?: number
  annual?: number
  perHour?: number
  currency: string
  description?: string
}

export interface VenueFeatures {
  // General
  parking?: boolean
  wheelchairAccessible?: boolean
  lockerRooms?: boolean
  showers?: boolean
  wifi?: boolean
  airConditioning?: boolean
  
  // Court/Field Specific
  indoor?: boolean
  outdoor?: boolean
  lighting?: boolean
  seating?: boolean
  scoreboards?: boolean
  
  // Pool Specific
  heated?: boolean
  lanes?: number
  depth?: string
  diving?: boolean
  
  // Gym/Studio Specific
  equipment?: string[]
  classes?: string[]
  personalTraining?: boolean
  childcare?: boolean
}

// ===== GOOGLE PLACES QUERY MAPPING =====
export const FACILITY_TYPE_TO_GOOGLE_PLACES_TYPES: Record<FacilityType, string[]> = {
  // Courts
  outdoor_court: ["park", "recreation_center"],
  indoor_court: ["gym", "recreation_center", "sports_complex"],
  recreation_center_court: ["recreation_center", "community_center"],
  college_court: ["university", "school"],
  private_club_court: ["sports_club", "country_club"],
  
  // Pools
  public_pool: ["swimming_pool", "public_bath"],
  private_pool: ["swimming_pool", "sports_club"],
  hotel_pool: ["lodging", "hotel"],
  college_pool: ["university", "school"],
  olympic_pool: ["swimming_pool", "sports_complex"],
  lap_pool: ["swimming_pool"],
  community_pool: ["swimming_pool", "community_center"],
  
  // Fields
  public_field: ["park", "recreation_center"],
  college_field: ["university", "school"],
  stadium: ["stadium", "sports_complex"],
  sports_complex: ["sports_complex"],
  
  // Studios
  yoga_studio: ["gym", "spa", "health"],
  pilates_studio: ["gym", "spa", "health"],
  barre_studio: ["gym", "spa", "health"],
  spin_studio: ["gym", "sports_complex"],
  crossfit_box: ["gym"],
  boxing_gym: ["gym"],
  martial_arts_dojo: ["gym", "sports_complex"],
  dance_studio: ["school", "sports_complex"],
  
  // Gyms
  commercial_gym: ["gym"],
  boutique_gym: ["gym", "health"],
  college_gym: ["university", "school"],
  corporate_gym: ["gym"],
  "24_hour_gym": ["gym"],
  
  // Tracks
  running_track: ["park", "stadium", "recreation_center"],
  cycling_track: ["sports_complex"],
  skatepark: ["park"],
  
  // Clubs
  country_club: ["country_club"],
  tennis_club: ["sports_club"],
  golf_club: ["golf_course"],
  sports_club: ["sports_club"],
  
  // Other
  recreation_center: ["recreation_center"],
  community_center: ["community_center"],
  golf_course: ["golf_course"],
  driving_range: ["golf_course"],
  climbing_gym: ["gym", "sports_complex"],
  bowling_alley: ["bowling_alley"],
  park: ["park"],
}

// ===== SEARCH KEYWORDS =====
export const SPORT_SEARCH_KEYWORDS: Record<SportType, string[]> = {
  basketball: ["basketball court", "basketball gym", "hoops"],
  tennis: ["tennis court", "tennis club"],
  pickleball: ["pickleball court", "pickleball club"],
  racquetball: ["racquetball court"],
  squash: ["squash court"],
  volleyball: ["volleyball court", "beach volleyball"],
  badminton: ["badminton court"],
  handball: ["handball court"],
  soccer: ["soccer field", "football pitch"],
  football: ["football field"],
  baseball: ["baseball field", "baseball diamond"],
  softball: ["softball field"],
  rugby: ["rugby field", "rugby pitch"],
  cricket: ["cricket ground", "cricket pitch"],
  lacrosse: ["lacrosse field"],
  field_hockey: ["field hockey"],
  swimming: ["swimming pool", "aquatic center"],
  water_polo: ["water polo pool"],
  diving: ["diving pool"],
  yoga: ["yoga studio", "yoga class"],
  pilates: ["pilates studio"],
  barre: ["barre studio", "barre class"],
  spin: ["spin studio", "cycling studio", "indoor cycling"],
  crossfit: ["crossfit box", "crossfit gym"],
  boxing: ["boxing gym", "boxing club"],
  kickboxing: ["kickboxing gym"],
  martial_arts: ["martial arts", "karate", "judo", "taekwondo", "jiu jitsu"],
  dance: ["dance studio"],
  zumba: ["zumba class", "dance fitness"],
  hiit: ["hiit gym", "boot camp"],
  golf: ["golf course", "golf club"],
  running: ["running track", "track"],
  cycling: ["cycling track", "velodrome"],
  skating: ["ice rink", "roller rink"],
  skateboarding: ["skate park"],
  climbing: ["climbing gym", "bouldering"],
  bowling: ["bowling alley"],
  gym: ["gym", "fitness center"],
  recreation: ["recreation center"],
  multi_sport: ["sports complex", "recreation center"],
}

// ===== DISPLAY NAMES =====
export const SPORT_DISPLAY_NAMES: Record<SportType, string> = {
  basketball: "Basketball",
  tennis: "Tennis",
  pickleball: "Pickleball",
  racquetball: "Racquetball",
  squash: "Squash",
  volleyball: "Volleyball",
  badminton: "Badminton",
  handball: "Handball",
  soccer: "Soccer",
  football: "Football",
  baseball: "Baseball",
  softball: "Softball",
  rugby: "Rugby",
  cricket: "Cricket",
  lacrosse: "Lacrosse",
  field_hockey: "Field Hockey",
  swimming: "Swimming",
  water_polo: "Water Polo",
  diving: "Diving",
  yoga: "Yoga",
  pilates: "Pilates",
  barre: "Barre",
  spin: "Spin",
  crossfit: "CrossFit",
  boxing: "Boxing",
  kickboxing: "Kickboxing",
  martial_arts: "Martial Arts",
  dance: "Dance",
  zumba: "Zumba",
  hiit: "HIIT",
  golf: "Golf",
  running: "Running",
  cycling: "Cycling",
  skating: "Skating",
  skateboarding: "Skateboarding",
  climbing: "Climbing",
  bowling: "Bowling",
  gym: "Gym",
  recreation: "Recreation",
  multi_sport: "Multi-Sport",
}

export const FACILITY_DISPLAY_NAMES: Record<FacilityType, string> = {
  outdoor_court: "Outdoor Court",
  indoor_court: "Indoor Court",
  recreation_center_court: "Recreation Center Court",
  college_court: "College Court",
  private_club_court: "Private Club Court",
  public_pool: "Public Pool",
  private_pool: "Private Pool",
  hotel_pool: "Hotel Pool",
  college_pool: "College Pool",
  olympic_pool: "Olympic Pool",
  lap_pool: "Lap Pool",
  community_pool: "Community Pool",
  public_field: "Public Field",
  college_field: "College Field",
  stadium: "Stadium",
  sports_complex: "Sports Complex",
  yoga_studio: "Yoga Studio",
  pilates_studio: "Pilates Studio",
  barre_studio: "Barre Studio",
  spin_studio: "Spin Studio",
  crossfit_box: "CrossFit Box",
  boxing_gym: "Boxing Gym",
  martial_arts_dojo: "Martial Arts Dojo",
  dance_studio: "Dance Studio",
  commercial_gym: "Commercial Gym",
  boutique_gym: "Boutique Gym",
  college_gym: "College Gym",
  corporate_gym: "Corporate Gym",
  "24_hour_gym": "24 Hour Gym",
  running_track: "Running Track",
  cycling_track: "Cycling Track",
  skatepark: "Skate Park",
  country_club: "Country Club",
  tennis_club: "Tennis Club",
  golf_club: "Golf Club",
  sports_club: "Sports Club",
  recreation_center: "Recreation Center",
  community_center: "Community Center",
  golf_course: "Golf Course",
  driving_range: "Driving Range",
  climbing_gym: "Climbing Gym",
  bowling_alley: "Bowling Alley",
  park: "Park",
  // Recovery & Wellness
  physical_therapy: "Physical Therapy",
  sports_medicine: "Sports Medicine",
  chiropractic: "Chiropractic",
  massage_therapy: "Massage Therapy",
  acupuncture: "Acupuncture",
  cryotherapy: "Cryotherapy",
  float_spa: "Float Spa",
  sauna_spa: "Sauna & Spa",
  recovery_studio: "Recovery Studio",
  athletic_training: "Athletic Training",
  orthopedic_clinic: "Orthopedic Clinic",
}

// ===== RECOVERY FACILITY SEARCH KEYWORDS =====
export const RECOVERY_SEARCH_KEYWORDS: Record<string, string[]> = {
  physical_therapy: ["physical therapy", "PT clinic", "physiotherapy", "physical therapist"],
  sports_medicine: ["sports medicine", "sports doctor", "sports clinic", "athletic medicine"],
  chiropractic: ["chiropractor", "chiropractic", "spinal adjustment"],
  massage_therapy: ["massage therapy", "sports massage", "deep tissue massage", "massage therapist"],
  acupuncture: ["acupuncture", "acupuncturist", "dry needling"],
  cryotherapy: ["cryotherapy", "cryo spa", "cold therapy", "whole body cryotherapy"],
  float_spa: ["float spa", "sensory deprivation", "float tank", "flotation therapy"],
  sauna_spa: ["sauna", "infrared sauna", "spa", "steam room"],
  recovery_studio: ["recovery studio", "athletic recovery", "recovery lounge", "normatec"],
  athletic_training: ["athletic trainer", "sports training facility"],
  orthopedic_clinic: ["orthopedic", "orthopedist", "bone doctor", "joint specialist"],
}

