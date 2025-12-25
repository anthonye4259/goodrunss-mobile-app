#!/usr/bin/env ts-node

/**
 * GoodRunss Synthetic Data Generator
 * 
 * Generates realistic Venue data for top 8 US cities without needing Google API.
 * Ensures the app has critical mass of data for launch markets.
 */

import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'
import { FirebaseFacilityImporter } from './firebase-importer'
import { Venue, FacilityType, SportType } from '../../lib/types/global-facilities'

dotenv.config()

// ===== CONFIGURATION =====
const VENUES_PER_CITY = 25 // 25 venues * 8 cities = 200 venues
const FIREBASE_SERVICE_ACCOUNT = process.env.FIREBASE_SERVICE_ACCOUNT_PATH

// ===== TOP 8 CITIES =====
const CITIES = [
    { name: "New York", state: "NY", lat: 40.7128, lng: -74.0060 },
    { name: "Los Angeles", state: "CA", lat: 34.0522, lng: -118.2437 },
    { name: "Chicago", state: "IL", lat: 41.8781, lng: -87.6298 },
    { name: "Houston", state: "TX", lat: 29.7604, lng: -95.3698 },
    { name: "Phoenix", state: "AZ", lat: 33.4484, lng: -112.0740 },
    { name: "Philadelphia", state: "PA", lat: 39.9526, lng: -75.1652 },
    { name: "San Antonio", state: "TX", lat: 29.4241, lng: -98.4936 },
    { name: "Dallas", state: "TX", lat: 32.7767, lng: -96.7970 }
]

const FACILITY_TYPES: Array<{ type: FacilityType, sports: SportType[], nameSuffixes: string[] }> = [
    {
        type: 'outdoor_court',
        sports: ['basketball', 'tennis', 'pickleball'],
        nameSuffixes: ["Park Courts", "Community Center", "Recreation Park", "Outdoor Courts"]
    },
    {
        type: 'indoor_court',
        sports: ['basketball', 'volleyball', 'badminton'],
        nameSuffixes: ["Sportsplex", "Indoor Arena", "Fieldhouse", "Gymnasium"]
    },
    {
        type: 'commercial_gym',
        sports: ['gym', 'yoga', 'crossfit'],
        nameSuffixes: ["Fitness", "Athletic Club", "Gym", "Performance Center"]
    },
    {
        type: 'public_field',
        sports: ['soccer', 'football', 'baseball'],
        nameSuffixes: ["Fields", "Sports Park", "Soccer Complex", "Memorial Park"]
    }
]

// ===== GENERATOR =====

function generateRandomVenue(city: typeof CITIES[0]): any {
    const template = FACILITY_TYPES[Math.floor(Math.random() * FACILITY_TYPES.length)]
    const suffix = template.nameSuffixes[Math.floor(Math.random() * template.nameSuffixes.length)]

    // Random offset from city center (within ~10km)
    const latOffset = (Math.random() - 0.5) * 0.1
    const lngOffset = (Math.random() - 0.5) * 0.1

    const namePrefixes = ["Central", "North", "South", "West", "Downtown", "Victory", "Elite", "Premier", "City", "Urban"]
    const namePrefix = namePrefixes[Math.floor(Math.random() * namePrefixes.length)]

    const venueName = `${namePrefix} ${city.name} ${suffix}`

    return {
        id: uuidv4(),
        name: venueName,
        description: `Premier ${template.sports[0]} facility in ${city.name}. Open to public.`,
        lat: city.lat + latOffset,
        lng: city.lng + lngOffset,
        address: `${Math.floor(Math.random() * 9000) + 100} Main St, ${city.name}, ${city.state} ${Math.floor(Math.random() * 89999) + 10000}`,
        city: city.name,
        state: city.state,
        country: "US",
        zipCode: "10001", // Dummy

        facilityType: template.type,
        sportTypes: template.sports,
        accessType: Math.random() > 0.7 ? 'members_only' : 'public',

        rating: 3.5 + (Math.random() * 1.5), // 3.5 to 5.0
        reviewCount: Math.floor(Math.random() * 200),

        verified: true,
        bookable: Math.random() > 0.5,

        amenities: ["Parking", "Restrooms", "Water Fountain", "Locker Room"],

        createdAt: new Date(),
        updatedAt: new Date(),
        source: 'synthetic_seed',
        images: [],
        coverImage: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2669&auto=format&fit=crop" // Generic sport image
    }
}

async function main() {
    console.log('🏭 GoodRunss Synthetic Data Generator')
    console.log('=====================================\n')

    const allVenues: any[] = []

    CITIES.forEach(city => {
        console.log(` Generating ${VENUES_PER_CITY} venues for ${city.name}...`)
        for (let i = 0; i < VENUES_PER_CITY; i++) {
            allVenues.push(generateRandomVenue(city))
        }
    })

    console.log(`\n✅ Generated ${allVenues.length} venues total.`)

    // Save to JSON
    const outputPath = path.resolve(__dirname, '../../data/synthetic_facilities.json')
    fs.writeFileSync(outputPath, JSON.stringify(allVenues, null, 2))
    console.log(`💾 Saved to ${outputPath}`)

    // Import to Firebase
    if (process.argv.includes('--import')) {
        console.log('\n🔥 Importing to Firebase...')
        try {
            const importer = new FirebaseFacilityImporter(FIREBASE_SERVICE_ACCOUNT)
            await importer.importVenues(allVenues)
        } catch (e) {
            console.error("Import failed (check credentials?):", e)
        }
    } else {
        console.log("\n(Run with --import to upload to Firestore)")
    }
}

main().catch(console.error)
