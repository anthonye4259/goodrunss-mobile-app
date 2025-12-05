/**
 * GoodRunss Global Venue Fetcher (Expanded)
 * Fetches venues from US + Global cities
 */

require('dotenv').config()
const axios = require('axios')
const fs = require('fs')

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY
const GOOGLE_PLACES_URL = 'https://maps.googleapis.com/maps/api/place'

// EXPANDED CITIES - US + Global
const CITIES = [
    // US - Major Cities (expanded)
    { lat: 40.7128, lng: -74.0060, name: "New York, NY" },
    { lat: 34.0522, lng: -118.2437, name: "Los Angeles, CA" },
    { lat: 41.8781, lng: -87.6298, name: "Chicago, IL" },
    { lat: 29.7604, lng: -95.3698, name: "Houston, TX" },
    { lat: 25.7617, lng: -80.1918, name: "Miami, FL" },
    { lat: 37.7749, lng: -122.4194, name: "San Francisco, CA" },
    { lat: 47.6062, lng: -122.3321, name: "Seattle, WA" },
    { lat: 39.7392, lng: -104.9903, name: "Denver, CO" },
    { lat: 42.3601, lng: -71.0589, name: "Boston, MA" },
    { lat: 33.7490, lng: -84.3880, name: "Atlanta, GA" },
    { lat: 33.4484, lng: -112.0740, name: "Phoenix, AZ" },
    { lat: 32.7767, lng: -96.7970, name: "Dallas, TX" },
    { lat: 30.2672, lng: -97.7431, name: "Austin, TX" },
    { lat: 38.9072, lng: -77.0369, name: "Washington, DC" },
    { lat: 45.5152, lng: -122.6784, name: "Portland, OR" },
    { lat: 36.1699, lng: -115.1398, name: "Las Vegas, NV" },
    { lat: 32.7157, lng: -117.1611, name: "San Diego, CA" },
    { lat: 35.2271, lng: -80.8431, name: "Charlotte, NC" },
    { lat: 39.9612, lng: -82.9988, name: "Columbus, OH" },
    { lat: 44.9778, lng: -93.2650, name: "Minneapolis, MN" },

    // Global - Europe
    { lat: 51.5074, lng: -0.1278, name: "London, UK" },
    { lat: 48.8566, lng: 2.3522, name: "Paris, France" },
    { lat: 52.5200, lng: 13.4050, name: "Berlin, Germany" },
    { lat: 41.9028, lng: 12.4964, name: "Rome, Italy" },
    { lat: 40.4168, lng: -3.7038, name: "Madrid, Spain" },
    { lat: 41.3851, lng: 2.1734, name: "Barcelona, Spain" },
    { lat: 52.3676, lng: 4.9041, name: "Amsterdam, Netherlands" },

    // Global - Middle East
    { lat: 25.2048, lng: 55.2708, name: "Dubai, UAE" },
    { lat: 24.4539, lng: 54.3773, name: "Abu Dhabi, UAE" },
    { lat: 25.2854, lng: 51.5310, name: "Doha, Qatar" },
    { lat: 26.2285, lng: 50.5860, name: "Manama, Bahrain" },

    // Global - Asia Pacific
    { lat: 1.3521, lng: 103.8198, name: "Singapore" },
    { lat: 22.3193, lng: 114.1694, name: "Hong Kong" },
    { lat: 35.6762, lng: 139.6503, name: "Tokyo, Japan" },
    { lat: 37.5665, lng: 126.9780, name: "Seoul, South Korea" },
    { lat: -33.8688, lng: 151.2093, name: "Sydney, Australia" },
    { lat: -37.8136, lng: 144.9631, name: "Melbourne, Australia" },

    // Global - Americas
    { lat: 43.6532, lng: -79.3832, name: "Toronto, Canada" },
    { lat: 45.5017, lng: -73.5673, name: "Montreal, Canada" },
    { lat: 49.2827, lng: -123.1207, name: "Vancouver, Canada" },
    { lat: 19.4326, lng: -99.1332, name: "Mexico City, Mexico" },
    { lat: -22.9068, lng: -43.1729, name: "Rio de Janeiro, Brazil" },
    { lat: -23.5505, lng: -46.6333, name: "São Paulo, Brazil" },
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
                radius: 50000,
                keyword,
                key: GOOGLE_API_KEY,
            },
        })

        if (response.data.status === 'OK') {
            return response.data.results
        }
        if (response.data.status !== 'ZERO_RESULTS') {
            console.log(`  Status: ${response.data.status}`)
        }
        return []
    } catch (error) {
        console.error(`  Error: ${error.message}`)
        return []
    }
}

function convertToVenue(place, sport, cityName) {
    return {
        id: place.place_id,
        googlePlaceId: place.place_id,
        name: place.name,
        address: place.vicinity || place.formatted_address || '',
        city: cityName,
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
    console.log('🌍 GoodRunss Global Venue Fetcher')
    console.log('===================================\n')

    if (!GOOGLE_API_KEY) {
        console.error('❌ GOOGLE_PLACES_API_KEY not found in .env')
        process.exit(1)
    }

    console.log(`✓ API Key found`)
    console.log(`📍 Fetching from ${CITIES.length} cities worldwide\n`)

    const allVenues = []
    const seenIds = new Set()

    // Load existing venues to avoid duplicates
    const existingPath = './data/venues-google-places.json'
    if (fs.existsSync(existingPath)) {
        const existing = JSON.parse(fs.readFileSync(existingPath, 'utf8'))
        existing.forEach(v => seenIds.add(v.id))
        allVenues.push(...existing)
        console.log(`📂 Loaded ${existing.length} existing venues\n`)
    }

    let newVenues = 0

    for (const city of CITIES) {
        console.log(`\n🏙️  ${city.name}`)

        for (const sport of Object.keys(SPORTS)) {
            for (const keyword of SPORTS[sport]) {
                process.stdout.write(`  🔍 ${sport}...`)

                const places = await searchPlaces(city.lat, city.lng, keyword)
                let added = 0

                for (const place of places) {
                    if (!seenIds.has(place.place_id)) {
                        seenIds.add(place.place_id)
                        allVenues.push(convertToVenue(place, sport, city.name))
                        added++
                        newVenues++
                    }
                }

                console.log(` +${added}`)
                await sleep(150) // Rate limiting
            }
        }
    }

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`✓ New venues added: ${newVenues}`)
    console.log(`✓ Total venues: ${allVenues.length}`)

    // Save to JSON
    const outputPath = './data/venues-google-places.json'
    if (!fs.existsSync('./data')) {
        fs.mkdirSync('./data')
    }
    fs.writeFileSync(outputPath, JSON.stringify(allVenues, null, 2))
    console.log(`💾 Saved to ${outputPath}`)

    // Show summary by region
    console.log('\n📊 Summary by region:')
    const byCity = {}
    allVenues.forEach(v => {
        const city = v.city || 'Unknown'
        byCity[city] = (byCity[city] || 0) + 1
    })
    Object.entries(byCity)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .forEach(([city, count]) => {
            console.log(`  ${city}: ${count}`)
        })
}

main().catch(console.error)
