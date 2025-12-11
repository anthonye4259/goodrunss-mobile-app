/**
 * Myrtle Beach Launch Courts Data
 * 
 * Pre-populated courts for the Myrtle Beach partner city launch.
 * These will be seeded into Firebase for launch.
 */

export interface LaunchCourt {
    id: string
    name: string
    address: string
    city: string
    state: string
    zipCode: string
    latitude: number
    longitude: number
    sportTypes: string[]
    amenities: string[]
    courtCount: number
    hasLights: boolean
    surface: "concrete" | "asphalt" | "wood" | "synthetic"
    isPublic: boolean
    hoursOpen?: string
    hoursClose?: string
}

// Actual Myrtle Beach area courts
export const MYRTLE_BEACH_COURTS: LaunchCourt[] = [
    {
        id: "mb-001",
        name: "Valor Park",
        address: "1120 Farrow Pkwy",
        city: "Myrtle Beach",
        state: "SC",
        zipCode: "29577",
        latitude: 33.7203,
        longitude: -78.8856,
        sportTypes: ["Basketball", "Tennis"],
        amenities: ["Parking", "Restrooms", "Water Fountain"],
        courtCount: 2,
        hasLights: true,
        surface: "asphalt",
        isPublic: true,
        hoursOpen: "6:00 AM",
        hoursClose: "10:00 PM",
    },
    {
        id: "mb-002",
        name: "Doug Shaw Memorial Stadium / Park",
        address: "1101 Oak St",
        city: "Myrtle Beach",
        state: "SC",
        zipCode: "29577",
        latitude: 33.6944,
        longitude: -78.8850,
        sportTypes: ["Basketball", "Baseball"],
        amenities: ["Parking", "Restrooms", "Bleachers"],
        courtCount: 1,
        hasLights: true,
        surface: "concrete",
        isPublic: true,
        hoursOpen: "6:00 AM",
        hoursClose: "11:00 PM",
    },
    {
        id: "mb-003",
        name: "Grand Park Athletic Complex",
        address: "1050 Pampas Dr",
        city: "Myrtle Beach",
        state: "SC",
        zipCode: "29577",
        latitude: 33.7294,
        longitude: -78.9044,
        sportTypes: ["Basketball", "Soccer", "Tennis"],
        amenities: ["Parking", "Restrooms", "Playground", "Walking Trail"],
        courtCount: 4,
        hasLights: true,
        surface: "asphalt",
        isPublic: true,
        hoursOpen: "6:00 AM",
        hoursClose: "10:00 PM",
    },
    {
        id: "mb-004",
        name: "Pepper Geddings Recreation Center",
        address: "3205 N Oak St",
        city: "Myrtle Beach",
        state: "SC",
        zipCode: "29577",
        latitude: 33.7123,
        longitude: -78.8711,
        sportTypes: ["Basketball", "Volleyball"],
        amenities: ["Indoor Courts", "AC", "Restrooms", "Parking"],
        courtCount: 2,
        hasLights: true,
        surface: "wood",
        isPublic: true,
        hoursOpen: "8:00 AM",
        hoursClose: "9:00 PM",
    },
    {
        id: "mb-005",
        name: "Market Common Basketball Courts",
        address: "1120 Farrow Pkwy",
        city: "Myrtle Beach",
        state: "SC",
        zipCode: "29577",
        latitude: 33.6711,
        longitude: -78.9300,
        sportTypes: ["Basketball"],
        amenities: ["Parking", "Nearby Restaurants"],
        courtCount: 2,
        hasLights: true,
        surface: "concrete",
        isPublic: true,
        hoursOpen: "Dawn",
        hoursClose: "11:00 PM",
    },
    {
        id: "mb-006",
        name: "Barc Park at Withers Preserve",
        address: "2199 Mallard Cover Dr",
        city: "Myrtle Beach",
        state: "SC",
        zipCode: "29579",
        latitude: 33.7456,
        longitude: -79.0011,
        sportTypes: ["Basketball", "Pickleball"],
        amenities: ["Dog Park", "Parking", "Playground", "Restrooms"],
        courtCount: 1,
        hasLights: false,
        surface: "concrete",
        isPublic: true,
        hoursOpen: "Dawn",
        hoursClose: "Dusk",
    },
    {
        id: "mb-007",
        name: "Conway Recreation Center",
        address: "1515 Mill Pond Rd",
        city: "Conway",
        state: "SC",
        zipCode: "29526",
        latitude: 33.8351,
        longitude: -79.0556,
        sportTypes: ["Basketball", "Tennis", "Pickleball"],
        amenities: ["Indoor Courts", "AC", "Parking", "Gym"],
        courtCount: 3,
        hasLights: true,
        surface: "wood",
        isPublic: true,
        hoursOpen: "6:00 AM",
        hoursClose: "9:00 PM",
    },
    {
        id: "mb-008",
        name: "Surfside Beach Town Hall Park",
        address: "115 Hwy 17 Business",
        city: "Surfside Beach",
        state: "SC",
        zipCode: "29575",
        latitude: 33.6089,
        longitude: -78.9756,
        sportTypes: ["Basketball"],
        amenities: ["Parking", "Playground"],
        courtCount: 1,
        hasLights: true,
        surface: "asphalt",
        isPublic: true,
        hoursOpen: "6:00 AM",
        hoursClose: "10:00 PM",
    },
    {
        id: "mb-009",
        name: "Socastee Park",
        address: "4600 Socastee Blvd",
        city: "Myrtle Beach",
        state: "SC",
        zipCode: "29588",
        latitude: 33.6545,
        longitude: -79.0234,
        sportTypes: ["Basketball", "Baseball", "Soccer"],
        amenities: ["Parking", "Restrooms", "Playground", "Concessions"],
        courtCount: 2,
        hasLights: true,
        surface: "asphalt",
        isPublic: true,
        hoursOpen: "6:00 AM",
        hoursClose: "10:00 PM",
    },
    {
        id: "mb-010",
        name: "The Courts at Myrtle Beach",
        address: "2850 Robert Grissom Pkwy",
        city: "Myrtle Beach",
        state: "SC",
        zipCode: "29577",
        latitude: 33.7512,
        longitude: -78.8123,
        sportTypes: ["Pickleball", "Tennis"],
        amenities: ["Pro Shop", "Lessons", "Parking", "Restrooms"],
        courtCount: 12,
        hasLights: true,
        surface: "synthetic",
        isPublic: false,
        hoursOpen: "7:00 AM",
        hoursClose: "9:00 PM",
    },
]

// Function to check if user is in Myrtle Beach area
export function isInMyrtleBeachArea(latitude: number, longitude: number): boolean {
    // Myrtle Beach bounding box (approximate)
    return (
        latitude >= 33.55 &&
        latitude <= 33.90 &&
        longitude >= -79.15 &&
        longitude <= -78.75
    )
}

// Get courts count for launch marketing
export function getMyrtleBeachStats() {
    return {
        totalCourts: MYRTLE_BEACH_COURTS.length,
        basketballCourts: MYRTLE_BEACH_COURTS.filter(c => c.sportTypes.includes("Basketball")).length,
        tennisCourts: MYRTLE_BEACH_COURTS.filter(c => c.sportTypes.includes("Tennis")).length,
        pickleballCourts: MYRTLE_BEACH_COURTS.filter(c => c.sportTypes.includes("Pickleball")).length,
        litCourts: MYRTLE_BEACH_COURTS.filter(c => c.hasLights).length,
    }
}
