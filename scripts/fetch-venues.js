/**
 * Simple Google Places Import Script
 * Fetches venues and saves to JSON
 */

require('dotenv').config()
const axios = require('axios')
const fs = require('fs')

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY
const GOOGLE_PLACES_URL = 'https://maps.googleapis.com/maps/api/place'

// Major US Cities
const US_CITIES = [
    { lat: 40.7128, lng: -74.0060, name: "New York, NY" },
    { lat: 34.0522, lng: -118.2437, name: "Los Angeles, CA" },
    { lat: 41.8781, lng: -87.6298, name: "Chicago, IL" },
    { lat: 29.7604, lng: -95.3698, name: "Houston, TX" },
    { lat: 25.7617, lng: -80.1918, name: "Miami, FL" },
]

// Sport search keywords
const SPORTS = {
    basketball: ["basketball court", "basketball gym"],
    tennis: ["tennis court", "tennis club"],
    pickleball: ["pickleball court"],
    padel: ["padel court", "padel club"],
    racquetball: ["racquetball court"],
    volleyball: ["volleyball court", "beach volleyball"],
    golf: ["golf course", "driving range"],
    soccer: ["soccer field", "football pitch"],
    swimming: ["swimming pool", "aquatic center"],
    yoga: ["yoga studio"],
    pilates: ["pilates studio"],
}

async function searchPlaces(lat, lng, keyword) {
    try {
        const response = await axios.get(`${GOOGLE_PLACES_URL}/nearbysearch/json`, {
            params: {
                location: `${lat},${lng}`,
                radius: 50000, // 50km
                keyword,
                key: GOOGLE_API_KEY,
            },
        })

        if (response.data.status === 'OK') {
            return response.data.results
        }
        console.log(`Status: ${response.data.status}`)
        return []
    } catch (error) {
        console.error(`Error: ${error.message}`)
        return []
    }
}

function convertToVenue(place, sport) {
    return {
        id: place.place_id,
        googlePlaceId: place.place_id,
        name: place.name,
        address: place.vicinity || place.formatted_address || '',
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        sport: sport,
        sportTypes: [sport],
        rating: place.rating || 0,
        reviewCount: place.user_ratings_total || 0,
        photos: place.photos?.slice(0, 3).map(p =>
            `${GOOGLE_PLACES_URL}/photo?maxwidth=800&photo_reference=${p.photo_reference}&key=${GOOGLE_API_KEY}`
        ) || [],
        isOpen: place.opening_hours?.open_now,
        source: 'google_places',
        fetchedAt: new Date().toISOString(),
    }
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
    console.log('🌎 GoodRunss Venue Fetcher')
    console.log('==========================\n')

    if (!GOOGLE_API_KEY) {
        console.error('❌ GOOGLE_PLACES_API_KEY not found in .env')
        process.exit(1)
    }

    console.log('✓ API Key found\n')

    const allVenues = []
    const seenIds = new Set()

    for (const sport of Object.keys(SPORTS)) {
        console.log(`\n━━━ ${sport.toUpperCase()} ━━━`)

        for (const city of US_CITIES) {
            for (const keyword of SPORTS[sport]) {
                console.log(`  Searching "${keyword}" in ${city.name}...`)

                const places = await searchPlaces(city.lat, city.lng, keyword)

                for (const place of places) {
                    if (!seenIds.has(place.place_id)) {
                        seenIds.add(place.place_id)
                        allVenues.push(convertToVenue(place, sport))
                    }
                }

                console.log(`    Found ${places.length} places`)
                await sleep(200) // Rate limiting
            }
        }
    }

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`✓ Total unique venues: ${allVenues.length}`)

    // Save to JSON
    const outputPath = './data/venues-google-places.json'
    if (!fs.existsSync('./data')) {
        fs.mkdirSync('./data')
    }
    fs.writeFileSync(outputPath, JSON.stringify(allVenues, null, 2))
    console.log(`💾 Saved to ${outputPath}`)

    // Show summary by sport
    console.log('\n📊 Summary by sport:')
    const bySport = {}
    allVenues.forEach(v => {
        bySport[v.sport] = (bySport[v.sport] || 0) + 1
    })
    Object.entries(bySport)
        .sort((a, b) => b[1] - a[1])
        .forEach(([sport, count]) => {
            console.log(`  ${sport}: ${count}`)
        })
}

main().catch(console.error)
