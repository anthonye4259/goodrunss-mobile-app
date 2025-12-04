export interface Venue {
    id: string
    name: string
    type: string
    sport: string
    address: string
    city: string
    state: string
    zipCode: string
    coordinates: { lat: number; lon: number }
    rating: number
    reviews: number
    distance?: number
    amenities: string[]
    hours: string
    price: string
    images: string[]
    activePlayersNow?: number
    lastActivityTimestamp?: Date
}

export const BASKETBALL_VENUES: Venue[] = [
    {
        id: "bball-1",
        name: "Rucker Park",
        type: "Outdoor Court",
        sport: "Basketball",
        address: "280 W 155th St",
        city: "New York",
        state: "NY",
        zipCode: "10039",
        coordinates: { lat: 40.8303, lon: -73.9364 },
        rating: 4.8,
        reviews: 342,
        amenities: ["Outdoor", "Free", "Lighting", "Seating"],
        hours: "6:00 AM - 10:00 PM",
        price: "Free",
        images: ["/outdoor-basketball-court.png"],
        activePlayersNow: 8,
        lastActivityTimestamp: new Date(Date.now() - 5 * 60000),
    },
    {
        id: "bball-2",
        name: "Chelsea Piers Sports Center",
        type: "Indoor Court",
        sport: "Basketball",
        address: "62 Chelsea Piers",
        city: "New York",
        state: "NY",
        zipCode: "10011",
        coordinates: { lat: 40.7466, lon: -74.0072 },
        rating: 4.6,
        reviews: 189,
        amenities: ["Indoor", "Locker Rooms", "Pro Shop", "Parking"],
        hours: "6:00 AM - 11:00 PM",
        price: "$15 day pass",
        images: ["/indoor-basketball-court.png"],
        activePlayersNow: 12,
        lastActivityTimestamp: new Date(Date.now() - 2 * 60000),
    },
    {
        id: "bball-3",
        name: "West 4th Street Courts",
        type: "Outdoor Court",
        sport: "Basketball",
        address: "Sixth Ave & W 4th St",
        city: "New York",
        state: "NY",
        zipCode: "10012",
        coordinates: { lat: 40.7321, lon: -74.0008 },
        rating: 4.7,
        reviews: 256,
        amenities: ["Outdoor", "Free", "Seating", "Water Fountain"],
        hours: "24/7",
        price: "Free",
        images: ["/outdoor-basketball-court.png"],
        activePlayersNow: 4,
        lastActivityTimestamp: new Date(Date.now() - 15 * 60000),
    },
]

export const TENNIS_VENUES: Venue[] = [
    {
        id: "tennis-1",
        name: "Central Park Tennis Center",
        type: "Tennis Courts",
        sport: "Tennis",
        address: "Central Park West & 93rd St",
        city: "New York",
        state: "NY",
        zipCode: "10025",
        coordinates: { lat: 40.7914, lon: -73.9632 },
        rating: 4.5,
        reviews: 178,
        amenities: ["Clay Courts", "Hard Courts", "Pro Shop", "Lessons"],
        hours: "7:00 AM - 9:00 PM",
        price: "$15/hour",
        images: ["/tennis-courts.png"],
        activePlayersNow: 6,
        lastActivityTimestamp: new Date(Date.now() - 8 * 60000),
    },
    {
        id: "tennis-2",
        name: "USTA Billie Jean King National Tennis Center",
        type: "Tennis Complex",
        sport: "Tennis",
        address: "Flushing Meadows Corona Park",
        city: "Queens",
        state: "NY",
        zipCode: "11368",
        coordinates: { lat: 40.7498, lon: -73.8453 },
        rating: 4.9,
        reviews: 521,
        amenities: ["Indoor", "Outdoor", "Pro Shop", "Restaurant", "Parking"],
        hours: "6:00 AM - 10:00 PM",
        price: "$20/hour",
        images: ["/tennis-courts.png"],
        activePlayersNow: 14,
        lastActivityTimestamp: new Date(Date.now() - 3 * 60000),
    },
]

export const YOGA_VENUES: Venue[] = [
    {
        id: "yoga-1",
        name: "Y7 Studio Soho",
        type: "Yoga Studio",
        sport: "Yoga",
        address: "430 Lafayette St",
        city: "New York",
        state: "NY",
        zipCode: "10003",
        coordinates: { lat: 40.7290, lon: -73.9932 },
        rating: 4.7,
        reviews: 412,
        amenities: ["Heated", "Showers", "Mats Provided", "Lockers"],
        hours: "6:00 AM - 9:00 PM",
        price: "$30/class",
        images: ["/yoga-studio.png"],
        activePlayersNow: 18,
        lastActivityTimestamp: new Date(Date.now() - 1 * 60000),
    },
    {
        id: "yoga-2",
        name: "Sky Ting Yoga",
        type: "Yoga Studio",
        sport: "Yoga",
        address: "49 W 23rd St",
        city: "New York",
        state: "NY",
        zipCode: "10010",
        coordinates: { lat: 40.7425, lon: -73.9912 },
        rating: 4.8,
        reviews: 298,
        amenities: ["Natural Light", "Tea Bar", "Retail", "Workshops"],
        hours: "7:00 AM - 8:00 PM",
        price: "$35/class",
        images: ["/yoga-studio.png"],
        activePlayersNow: 12,
        lastActivityTimestamp: new Date(Date.now() - 4 * 60000),
    },
]

export const PILATES_VENUES: Venue[] = [
    {
        id: "pilates-1",
        name: "SLT Tribeca",
        type: "Pilates Studio",
        sport: "Pilates",
        address: "75 Murray St",
        city: "New York",
        state: "NY",
        zipCode: "10007",
        coordinates: { lat: 40.7155, lon: -74.0129 },
        rating: 4.6,
        reviews: 234,
        amenities: ["Megaformers", "Showers", "Retail", "Towels"],
        hours: "6:00 AM - 8:00 PM",
        price: "$38/class",
        images: ["/pilates-studio.png"],
        activePlayersNow: 15,
        lastActivityTimestamp: new Date(Date.now() - 6 * 60000),
    },
]

export const GOLF_VENUES: Venue[] = [
    {
        id: "golf-1",
        name: "Bethpage Black Course",
        type: "Golf Course",
        sport: "Golf",
        address: "99 Quaker Meeting House Rd",
        city: "Farmingdale",
        state: "NY",
        zipCode: "11735",
        coordinates: { lat: 40.7445, lon: -73.4579 },
        rating: 4.9,
        reviews: 678,
        amenities: ["Pro Shop", "Driving Range", "Restaurant", "Cart Rental"],
        hours: "6:00 AM - 7:00 PM",
        price: "$65 green fee",
        images: ["/golf-course.png"],
        activePlayersNow: 24,
        lastActivityTimestamp: new Date(Date.now() - 10 * 60000),
    },
]

export const PICKLEBALL_VENUES: Venue[] = [
    {
        id: "pickle-1",
        name: "Chicken N Pickle NYC",
        type: "Pickleball Courts",
        sport: "Pickleball",
        address: "22 Boerum Pl",
        city: "Brooklyn",
        state: "NY",
        zipCode: "11201",
        coordinates: { lat: 40.6912, lon: -73.9900 },
        rating: 4.7,
        reviews: 189,
        amenities: ["Indoor", "Outdoor", "Restaurant", "Bar", "Parking"],
        hours: "10:00 AM - 11:00 PM",
        price: "$20/hour",
        images: ["/pickleball-courts.png"],
        activePlayersNow: 16,
        lastActivityTimestamp: new Date(Date.now() - 7 * 60000),
    },
]

export const PADEL_VENUES: Venue[] = [
    {
        id: "padel-1",
        name: "Padel Haus NYC",
        type: "Padel Courts",
        sport: "Padel",
        address: "120 North 11th St",
        city: "Brooklyn",
        state: "NY",
        zipCode: "11249",
        coordinates: { lat: 40.7214, lon: -73.9577 },
        rating: 4.8,
        reviews: 156,
        amenities: ["Indoor", "Pro Shop", "Locker Rooms", "Lessons"],
        hours: "7:00 AM - 11:00 PM",
        price: "$60/hour",
        images: ["/padel-court.png"],
        activePlayersNow: 12,
        lastActivityTimestamp: new Date(Date.now() - 5 * 60000),
    },
]

export const RACQUETBALL_VENUES: Venue[] = [
    {
        id: "racquet-1",
        name: "Equinox Sports Club",
        type: "Racquetball Courts",
        sport: "Racquetball",
        address: "344 Amsterdam Ave",
        city: "New York",
        state: "NY",
        zipCode: "10024",
        coordinates: { lat: 40.7823, lon: -73.9792 },
        rating: 4.7,
        reviews: 89,
        amenities: ["Indoor", "Pro Shop", "Locker Rooms", "Sauna"],
        hours: "5:00 AM - 11:00 PM",
        price: "$30/hour (members)",
        images: ["/racquetball-court.png"],
        activePlayersNow: 6,
        lastActivityTimestamp: new Date(Date.now() - 10 * 60000),
    },
]

export function getVenuesForSport(sport: string): Venue[] {
    const venueMap: Record<string, Venue[]> = {
        Basketball: BASKETBALL_VENUES,
        Tennis: TENNIS_VENUES,
        Yoga: YOGA_VENUES,
        Pilates: PILATES_VENUES,
        Golf: GOLF_VENUES,
        Pickleball: PICKLEBALL_VENUES,
        Padel: PADEL_VENUES,
        Racquetball: RACQUETBALL_VENUES,
    }
    return venueMap[sport] || []
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
