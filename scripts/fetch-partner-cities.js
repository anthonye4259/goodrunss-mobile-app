/**
 * GoodRunss PARTNER CITIES Deep Dive Venue Fetcher
 * 
 * THE 8 PARTNER CITIES:
 * 1. Atlanta, GA
 * 2. Myrtle Beach, SC (PAYING PARTNER!)
 * 3. San Francisco, CA
 * 4. New York City, NY
 * 5. Miami, FL
 * 6. Scottsdale, AZ
 * 7. Austin, TX
 * 8. Los Angeles, CA
 * 
 * Goes DEEP with:
 * - Multiple neighborhood coordinates per city
 * - Multiple search radii (tight + wide)
 * - All sport types + comprehensive keywords
 */

require('dotenv').config()
const axios = require('axios')
const fs = require('fs')

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY
const GOOGLE_PLACES_URL = 'https://maps.googleapis.com/maps/api/place'

// 8 PARTNER CITIES with MULTIPLE NEIGHBORHOODS
const PARTNER_CITIES = {
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
    "Myrtle Beach, SC": [
        { lat: 33.6891, lng: -78.8867, area: "Downtown Myrtle Beach" },
        { lat: 33.7093, lng: -78.8745, area: "North Myrtle Beach" },
        { lat: 33.6500, lng: -78.9389, area: "South Myrtle Beach" },
        { lat: 33.7685, lng: -78.7811, area: "Little River" },
        { lat: 33.5479, lng: -79.0478, area: "Murrells Inlet" },
        { lat: 33.6954, lng: -78.9206, area: "Broadway at the Beach" },
        { lat: 33.6623, lng: -78.9156, area: "Market Common" },
        { lat: 33.6078, lng: -79.0167, area: "Garden City Beach" },
    ],
    "San Francisco, CA": [
        { lat: 37.7749, lng: -122.4194, area: "Downtown SF" },
        { lat: 37.7879, lng: -122.4074, area: "Financial District" },
        { lat: 37.7573, lng: -122.4211, area: "Mission District" },
        { lat: 37.7852, lng: -122.4380, area: "Pacific Heights" },
        { lat: 37.7694, lng: -122.4862, area: "Golden Gate Park" },
        { lat: 37.8024, lng: -122.4058, area: "North Beach" },
        { lat: 37.7599, lng: -122.3877, area: "Potrero Hill" },
        { lat: 37.7352, lng: -122.4721, area: "Sunset District" },
    ],
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
    "Scottsdale, AZ": [
        { lat: 33.4942, lng: -111.9261, area: "Downtown Scottsdale" },
        { lat: 33.5092, lng: -111.8937, area: "Old Town" },
        { lat: 33.5803, lng: -111.8882, area: "North Scottsdale" },
        { lat: 33.6312, lng: -111.8226, area: "DC Ranch" },
        { lat: 33.4559, lng: -111.9466, area: "South Scottsdale" },
        { lat: 33.5553, lng: -111.8478, area: "Gainey Ranch" },
        { lat: 33.6631, lng: -111.7231, area: "Desert Mountain" },
        { lat: 33.5370, lng: -111.9268, area: "McCormick Ranch" },
    ],
    "Austin, TX": [
        { lat: 30.2672, lng: -97.7431, area: "Downtown Austin" },
        { lat: 30.2949, lng: -97.7421, area: "North Loop" },
        { lat: 30.2500, lng: -97.7500, area: "South Congress" },
        { lat: 30.3074, lng: -97.7536, area: "Hyde Park" },
        { lat: 30.2684, lng: -97.7631, area: "Clarksville" },
        { lat: 30.3849, lng: -97.7193, area: "The Domain" },
        { lat: 30.2270, lng: -97.7567, area: "Zilker" },
        { lat: 30.3554, lng: -97.7383, area: "Mueller" },
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
}

// Comprehensive sport keywords
const SPORTS = {
    basketball: ["basketball court", "basketball gym", "indoor basketball", "recreation center basketball"],
    tennis: ["tennis court", "tennis club", "tennis center", "public tennis"],
    pickleball: ["pickleball court", "pickleball club", "indoor pickleball"],
    volleyball: ["volleyball court", "beach volleyball", "indoor volleyball", "sand volleyball"],
    soccer: ["soccer field", "soccer complex", "futsal", "indoor soccer"],
    swimming: ["swimming pool", "aquatic center", "lap pool", "community pool", "YMCA"],
    gym: ["fitness center", "gym", "recreation center", "YMCA", "24 hour fitness", "LA Fitness"],
    golf: ["golf course", "driving range", "golf club", "top golf"],
    yoga: ["yoga studio", "hot yoga", "power yoga"],
    crossfit: ["crossfit gym", "crossfit box"],
}

// Search radii to use (meters)
const SEARCH_RADII = [5000, 15000, 30000]

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
        source: 'google_places_partner',
        fetchedAt: new Date().toISOString(),
    }
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
    console.log('🎯 GoodRunss PARTNER CITIES Deep Dive')
    console.log('=====================================')
    console.log('8 Partner Cities:')
    console.log('  1. Atlanta, GA')
    console.log('  2. Myrtle Beach, SC ⭐ PAYING PARTNER')
    console.log('  3. San Francisco, CA')
    console.log('  4. New York City, NY')
    console.log('  5. Miami, FL')
    console.log('  6. Scottsdale, AZ')
    console.log('  7. Austin, TX')
    console.log('  8. Los Angeles, CA')
    console.log('=====================================\n')

    if (!GOOGLE_API_KEY) {
        console.error('❌ GOOGLE_PLACES_API_KEY not found in .env')
        process.exit(1)
    }

    const allVenues = []
    const seenIds = new Set()
    let newVenues = 0

    for (const [cityName, neighborhoods] of Object.entries(PARTNER_CITIES)) {
        const isPaying = cityName.includes('Myrtle Beach')
        console.log(`\n\n🏙️  ========== ${cityName} ${isPaying ? '⭐ PAYING' : ''} ==========`)

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
    console.log(`🎉 PARTNER CITIES DEEP DIVE COMPLETE`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`✓ Total venues found: ${allVenues.length}`)

    // Save to JSON
    const outputPath = './data/venues-partner-cities.json'
    if (!fs.existsSync('./data')) {
        fs.mkdirSync('./data')
    }
    fs.writeFileSync(outputPath, JSON.stringify(allVenues, null, 2))
    console.log(`💾 Saved to ${outputPath}`)

    // Summary by city
    console.log('\n📊 Summary by city:')
    for (const cityName of Object.keys(PARTNER_CITIES)) {
        const count = allVenues.filter(v => v.city === cityName).length
        const isPaying = cityName.includes('Myrtle Beach')
        console.log(`  ${cityName}: ${count} venues${isPaying ? ' ⭐' : ''}`)
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
