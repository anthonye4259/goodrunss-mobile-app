/**
 * GoodRunss Deep Dive Venue Fetcher
 * 
 * Focused on the 7 PARTNER CITIES only:
 * - New York, NY
 * - Los Angeles, CA
 * - Chicago, IL
 * - Miami, FL
 * - Atlanta, GA
 * - Houston, TX
 * - Dallas, TX
 * 
 * Goes DEEP with:
 * - Multiple neighborhood coordinates per city
 * - Multiple search radii (tight + wide)
 * - All sport types + more keywords
 * - Text search for additional venues
 */

require('dotenv').config()
const axios = require('axios')
const fs = require('fs')

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY
const GOOGLE_PLACES_URL = 'https://maps.googleapis.com/maps/api/place'

// 7 PARTNER CITIES with MULTIPLE NEIGHBORHOODS
const PARTNER_CITIES = {
    "New York, NY": [
        { lat: 40.7580, lng: -73.9855, area: "Midtown Manhattan" },
        { lat: 40.7831, lng: -73.9712, area: "Upper West Side" },
        { lat: 40.7736, lng: -73.9566, area: "Upper East Side" },
        { lat: 40.7282, lng: -73.7949, area: "Queens" },
        { lat: 40.6892, lng: -73.9857, area: "Brooklyn" },
        { lat: 40.8448, lng: -73.8648, area: "Bronx" },
        { lat: 40.5795, lng: -74.1502, area: "Staten Island" },
        { lat: 40.7128, lng: -74.0060, area: "Downtown Manhattan" },
    ],
    "Los Angeles, CA": [
        { lat: 34.0522, lng: -118.2437, area: "Downtown LA" },
        { lat: 34.1478, lng: -118.1445, area: "Pasadena" },
        { lat: 33.9425, lng: -118.4081, area: "LAX/Westchester" },
        { lat: 34.0195, lng: -118.4912, area: "Santa Monica" },
        { lat: 34.1017, lng: -118.3267, area: "Hollywood" },
        { lat: 34.0736, lng: -118.4004, area: "Beverly Hills" },
        { lat: 33.7701, lng: -118.1937, area: "Long Beach" },
        { lat: 34.2011, lng: -118.5970, area: "Calabasas" },
    ],
    "Chicago, IL": [
        { lat: 41.8781, lng: -87.6298, area: "The Loop" },
        { lat: 41.8827, lng: -87.6233, area: "Millennium Park" },
        { lat: 41.8927, lng: -87.6087, area: "River North" },
        { lat: 41.9533, lng: -87.6553, area: "Lakeview" },
        { lat: 41.9256, lng: -87.6530, area: "Lincoln Park" },
        { lat: 41.7943, lng: -87.5907, area: "Hyde Park" },
        { lat: 41.8119, lng: -87.6782, area: "Pilsen" },
        { lat: 41.8858, lng: -87.6229, area: "Near North Side" },
    ],
    "Miami, FL": [
        { lat: 25.7617, lng: -80.1918, area: "Downtown Miami" },
        { lat: 25.7907, lng: -80.1300, area: "Miami Beach" },
        { lat: 25.8519, lng: -80.1854, area: "Miami Shores" },
        { lat: 25.7250, lng: -80.2625, area: "Coral Gables" },
        { lat: 25.8103, lng: -80.1245, area: "North Beach" },
        { lat: 25.9017, lng: -80.1223, area: "Aventura" },
        { lat: 25.6953, lng: -80.1646, area: "Coconut Grove" },
        { lat: 25.7823, lng: -80.2994, area: "Doral" },
    ],
    "Atlanta, GA": [
        { lat: 33.7490, lng: -84.3880, area: "Downtown Atlanta" },
        { lat: 33.7573, lng: -84.3963, area: "Midtown" },
        { lat: 33.8480, lng: -84.3733, area: "Buckhead" },
        { lat: 33.8069, lng: -84.1678, area: "Stone Mountain" },
        { lat: 33.7718, lng: -84.2957, area: "Decatur" },
        { lat: 33.6895, lng: -84.4440, area: "East Point" },
        { lat: 33.9519, lng: -84.5470, area: "Marietta" },
        { lat: 33.7765, lng: -84.3823, area: "Virginia-Highland" },
    ],
    "Houston, TX": [
        { lat: 29.7604, lng: -95.3698, area: "Downtown Houston" },
        { lat: 29.7473, lng: -95.4020, area: "Montrose" },
        { lat: 29.7174, lng: -95.4018, area: "Rice Village" },
        { lat: 29.7752, lng: -95.4142, area: "Heights" },
        { lat: 29.7324, lng: -95.3513, area: "EaDo" },
        { lat: 29.7516, lng: -95.3587, area: "Midtown" },
        { lat: 29.7604, lng: -95.5555, area: "Memorial" },
        { lat: 29.7025, lng: -95.5344, area: "Galleria Area" },
    ],
    "Dallas, TX": [
        { lat: 32.7767, lng: -96.7970, area: "Downtown Dallas" },
        { lat: 32.8140, lng: -96.7485, area: "Lakewood" },
        { lat: 32.7866, lng: -96.8219, area: "Uptown" },
        { lat: 32.8998, lng: -96.7503, area: "Lake Highlands" },
        { lat: 32.8474, lng: -96.8386, area: "Love Field" },
        { lat: 32.7231, lng: -96.8488, area: "Oak Cliff" },
        { lat: 32.9126, lng: -96.7678, area: "Richardson" },
        { lat: 32.8204, lng: -96.8716, area: "Design District" },
    ],
}

// Comprehensive sport keywords
const SPORTS = {
    basketball: ["basketball court", "basketball gym", "indoor basketball", "outdoor basketball", "rec center basketball"],
    tennis: ["tennis court", "tennis club", "tennis center", "public tennis", "private tennis club"],
    pickleball: ["pickleball court", "pickleball club", "indoor pickleball"],
    volleyball: ["volleyball court", "beach volleyball", "indoor volleyball", "sand volleyball"],
    soccer: ["soccer field", "soccer complex", "futsal", "indoor soccer"],
    swimming: ["swimming pool", "aquatic center", "lap pool", "community pool", "YMCA pool"],
    gym: ["fitness center", "gym", "recreation center", "YMCA", "24 hour fitness", "LA Fitness", "Planet Fitness"],
    golf: ["golf course", "driving range", "golf club", "mini golf", "top golf"],
    yoga: ["yoga studio", "hot yoga", "power yoga"],
    crossfit: ["crossfit gym", "crossfit box"],
}

// Search radii to use (meters)
const SEARCH_RADII = [5000, 15000, 30000] // 5km, 15km, 30km

async function searchPlaces(lat, lng, keyword, radius) {
    try {
        const response = await axios.get(`${GOOGLE_PLACES_URL}/nearbysearch/json`, {
            params: {
                location: `${lat},${lng}`,
                radius,
                keyword,
                key: GOOGLE_API_KEY,
            },
        })

        if (response.data.status === 'OK') {
            return response.data.results
        }
        return []
    } catch (error) {
        console.error(`  Error: ${error.message}`)
        return []
    }
}

async function textSearchPlaces(query, lat, lng) {
    try {
        const response = await axios.get(`${GOOGLE_PLACES_URL}/textsearch/json`, {
            params: {
                query,
                location: `${lat},${lng}`,
                radius: 50000,
                key: GOOGLE_API_KEY,
            },
        })

        if (response.data.status === 'OK') {
            return response.data.results
        }
        return []
    } catch (error) {
        return []
    }
}

function convertToVenue(place, sport, cityName, neighborhood) {
    return {
        id: place.place_id,
        googlePlaceId: place.place_id,
        name: place.name,
        address: place.vicinity || place.formatted_address || '',
        city: cityName,
        neighborhood: neighborhood,
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        sport: sport,
        sportTypes: [sport],
        rating: place.rating || 0,
        reviewCount: place.user_ratings_total || 0,
        priceLevel: place.price_level,
        photos: place.photos?.slice(0, 5).map(p =>
            `${GOOGLE_PLACES_URL}/photo?maxwidth=800&photo_reference=${p.photo_reference}&key=${GOOGLE_API_KEY}`
        ) || [],
        isOpen: place.opening_hours?.open_now,
        types: place.types || [],
        source: 'google_places_deep',
        fetchedAt: new Date().toISOString(),
    }
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
    console.log('🎯 GoodRunss DEEP DIVE Venue Fetcher')
    console.log('====================================')
    console.log('Target: 7 Partner Cities ONLY')
    console.log('====================================\n')

    if (!GOOGLE_API_KEY) {
        console.error('❌ GOOGLE_PLACES_API_KEY not found in .env')
        process.exit(1)
    }

    const allVenues = []
    const seenIds = new Set()
    let newVenues = 0

    for (const [cityName, neighborhoods] of Object.entries(PARTNER_CITIES)) {
        console.log(`\n\n🏙️  ========== ${cityName} ==========`)

        for (const neighborhood of neighborhoods) {
            console.log(`\n  📍 ${neighborhood.area}`)

            for (const sport of Object.keys(SPORTS)) {
                for (const keyword of SPORTS[sport]) {
                    for (const radius of SEARCH_RADII) {
                        const places = await searchPlaces(neighborhood.lat, neighborhood.lng, keyword, radius)
                        let added = 0

                        for (const place of places) {
                            if (!seenIds.has(place.place_id)) {
                                seenIds.add(place.place_id)
                                allVenues.push(convertToVenue(place, sport, cityName, neighborhood.area))
                                added++
                                newVenues++
                            }
                        }

                        if (added > 0) {
                            process.stdout.write(`    ${sport}: +${added} `)
                        }
                        await sleep(100)
                    }
                }
            }
            console.log('')
        }

        // City summary
        const cityVenues = allVenues.filter(v => v.city === cityName)
        console.log(`  ✅ ${cityName} Total: ${cityVenues.length} venues`)
    }

    console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`🎉 DEEP DIVE COMPLETE`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`✓ Total venues found: ${allVenues.length}`)

    // Save to JSON
    const outputPath = './data/venues-partner-cities-deep.json'
    if (!fs.existsSync('./data')) {
        fs.mkdirSync('./data')
    }
    fs.writeFileSync(outputPath, JSON.stringify(allVenues, null, 2))
    console.log(`💾 Saved to ${outputPath}`)

    // Summary by city
    console.log('\n📊 Summary by city:')
    for (const cityName of Object.keys(PARTNER_CITIES)) {
        const count = allVenues.filter(v => v.city === cityName).length
        console.log(`  ${cityName}: ${count} venues`)
    }

    // Summary by sport
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
