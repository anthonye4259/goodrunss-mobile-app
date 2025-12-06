/**
 * Fetch major gym chains and fitness facilities using Google Places API
 * Targets: LA Fitness, YMCA, Lifetime Fitness, 24 Hour Fitness, etc.
 */

const axios = require('axios');
const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin
const serviceAccount = require('/Users/anthonyedwards/Downloads/goodrunss-ai-firebase-adminsdk-fbsvc-7bbeb674aa.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

// Major gym chains WITH basketball courts/sports facilities
const GYM_CHAINS = [
    'LA Fitness',
    'YMCA',
    'Lifetime Fitness',
    '24 Hour Fitness',
    'Gold\'s Gym',
    'Equinox',
    'Crunch Fitness',
    'Life Time Athletic',
];

// Expanded US cities to capture more LA Fitness locations
const CITIES = [
    // Major metros
    { name: 'New York, NY', lat: 40.7128, lng: -74.0060 },
    { name: 'Los Angeles, CA', lat: 34.0522, lng: -118.2437 },
    { name: 'Chicago, IL', lat: 41.8781, lng: -87.6298 },
    { name: 'Houston, TX', lat: 29.7604, lng: -95.3698 },
    { name: 'Phoenix, AZ', lat: 33.4484, lng: -112.0740 },
    { name: 'Philadelphia, PA', lat: 39.9526, lng: -75.1652 },
    { name: 'San Antonio, TX', lat: 29.4241, lng: -98.4936 },
    { name: 'San Diego, CA', lat: 32.7157, lng: -117.1611 },
    { name: 'Dallas, TX', lat: 32.7767, lng: -96.7970 },
    { name: 'San Jose, CA', lat: 37.3382, lng: -121.8863 },
    { name: 'Austin, TX', lat: 30.2672, lng: -97.7431 },
    { name: 'Jacksonville, FL', lat: 30.3322, lng: -81.6557 },
    { name: 'Fort Worth, TX', lat: 32.7555, lng: -97.3308 },
    { name: 'Columbus, OH', lat: 39.9612, lng: -82.9988 },
    { name: 'Charlotte, NC', lat: 35.2271, lng: -80.8431 },
    { name: 'San Francisco, CA', lat: 37.7749, lng: -122.4194 },
    { name: 'Indianapolis, IN', lat: 39.7684, lng: -86.1581 },
    { name: 'Seattle, WA', lat: 47.6062, lng: -122.3321 },
    { name: 'Denver, CO', lat: 39.7392, lng: -104.9903 },
    { name: 'Washington, DC', lat: 38.9072, lng: -77.0369 },
    { name: 'Boston, MA', lat: 42.3601, lng: -71.0589 },
    { name: 'Nashville, TN', lat: 36.1627, lng: -86.7816 },
    { name: 'Baltimore, MD', lat: 39.2904, lng: -76.6122 },
    { name: 'Oklahoma City, OK', lat: 35.4676, lng: -97.5164 },
    { name: 'Portland, OR', lat: 45.5152, lng: -122.6784 },
    { name: 'Las Vegas, NV', lat: 36.1699, lng: -115.1398 },
    { name: 'Milwaukee, WI', lat: 43.0389, lng: -87.9065 },
    { name: 'Albuquerque, NM', lat: 35.0844, lng: -106.6504 },
    { name: 'Tucson, AZ', lat: 32.2226, lng: -110.9747 },
    { name: 'Fresno, CA', lat: 36.7378, lng: -119.7871 },
    { name: 'Sacramento, CA', lat: 38.5816, lng: -121.4944 },
    { name: 'Mesa, AZ', lat: 33.4152, lng: -111.8315 },
    { name: 'Kansas City, MO', lat: 39.0997, lng: -94.5786 },
    { name: 'Atlanta, GA', lat: 33.7490, lng: -84.3880 },
    { name: 'Miami, FL', lat: 25.7617, lng: -80.1918 },
    { name: 'Raleigh, NC', lat: 35.7796, lng: -78.6382 },
    { name: 'Omaha, NE', lat: 41.2565, lng: -95.9345 },
    { name: 'Colorado Springs, CO', lat: 38.8339, lng: -104.8214 },
    { name: 'Virginia Beach, VA', lat: 36.8529, lng: -75.9780 },
    { name: 'Long Beach, CA', lat: 33.7701, lng: -118.1937 },
    { name: 'Oakland, CA', lat: 37.8044, lng: -122.2712 },
    { name: 'Minneapolis, MN', lat: 44.9778, lng: -93.2650 },
    { name: 'Tampa, FL', lat: 27.9506, lng: -82.4572 },
    { name: 'Arlington, TX', lat: 32.7357, lng: -97.1081 },
    { name: 'New Orleans, LA', lat: 29.9511, lng: -90.0715 },
];

async function searchGymChain(chainName, city) {
    try {
        const query = `${chainName} in ${city.name}`;
        console.log(`\n🔍 Searching: ${query}`);

        const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
            params: {
                query,
                key: GOOGLE_PLACES_API_KEY,
                type: 'gym',
            }
        });

        if (response.data.status !== 'OK') {
            console.log(`⚠️  No results for ${query}`);
            return [];
        }

        console.log(`✅ Found ${response.data.results.length} locations`);
        return response.data.results;
    } catch (error) {
        console.error(`❌ Error searching ${chainName}:`, error.message);
        return [];
    }
}

async function getPlaceDetails(placeId) {
    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
            params: {
                place_id: placeId,
                fields: 'name,formatted_address,geometry,rating,user_ratings_total,photos,opening_hours,formatted_phone_number,website,types',
                key: GOOGLE_PLACES_API_KEY,
            }
        });

        if (response.data.result) {
            // Add place_id to the result since it's not returned by the API
            response.data.result.place_id = placeId;
        }

        return response.data.result;
    } catch (error) {
        console.error(`❌ Error fetching details:`, error.message);
        return null;
    }
}

function determineAvailableSports(name, types) {
    const nameLower = name.toLowerCase();
    const sports = [];

    // Basketball - almost all gyms have this
    sports.push('Basketball');

    // Swimming - almost all have pools
    sports.push('Swimming');

    // Check for specific amenities in name
    if (nameLower.includes('yoga') || types.includes('yoga_studio')) {
        sports.push('Yoga');
    }
    if (nameLower.includes('pilates')) {
        sports.push('Pilates');
    }
    if (nameLower.includes('racquet') || nameLower.includes('racquetball')) {
        sports.push('Racquetball');
    }

    // Chain-specific sports
    if (nameLower.includes('ymca')) {
        // YMCA typically has extensive facilities
        sports.push('Volleyball', 'Racquetball');
    }

    if (nameLower.includes('lifetime') || nameLower.includes('life time')) {
        // Lifetime Fitness has premium facilities
        sports.push('Tennis', 'Pickleball', 'Racquetball', 'Volleyball');
    }

    if (nameLower.includes('la fitness')) {
        // LA Fitness often has racquetball
        sports.push('Racquetball');
        // Some have basketball courts (already added above)
    }

    if (nameLower.includes('24 hour fitness')) {
        // 24 Hour Fitness sometimes has basketball and pools
        // Already added above
    }

    if (nameLower.includes('equinox')) {
        // Equinox premium facilities
        sports.push('Yoga', 'Pilates');
    }

    if (nameLower.includes('gold')) {
        // Gold's Gym - basic facilities
        // Basketball and Swimming already added
    }

    return [...new Set(sports)]; // Remove duplicates
}

async function saveVenueToFirestore(venue, chainName) {
    try {
        // Validate required fields
        if (!venue.place_id || !venue.name || !venue.formatted_address || !venue.geometry) {
            console.log(`  ⏭️  Skipping: Missing required data`);
            return false;
        }

        const sports = determineAvailableSports(venue.name, venue.types || []);
        const primarySport = sports[0] || 'Basketball';

        // Extract city from address
        const addressParts = venue.formatted_address.split(',');
        const city = addressParts[addressParts.length - 2]?.trim() || '';
        const state = addressParts[addressParts.length - 1]?.trim().split(' ')[0] || '';

        const venueData = {
            googlePlaceId: venue.place_id,
            name: venue.name,
            type: 'gym',
            chain: chainName,
            sport: primarySport,
            sportTypes: sports,
            address: venue.formatted_address,
            city,
            state,
            lat: venue.geometry.location.lat,
            lng: venue.geometry.location.lng,
            rating: venue.rating || 4.0,
            reviewCount: venue.user_ratings_total || 0,
            phone: venue.formatted_phone_number || '',
            website: venue.website || '',
            hours: venue.opening_hours?.weekday_text?.join(', ') || 'Hours vary',
            photos: venue.photos?.slice(0, 5).map(photo =>
                `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
            ) || [],
            amenities: ['Parking', 'Locker Rooms', 'Showers', 'Equipment'],
            price: 'Membership Required',
            source: 'google_places',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            activePlayersNow: 0,
        };

        // Only add isOpen if it's defined
        if (venue.opening_hours?.open_now !== undefined) {
            venueData.isOpen = venue.opening_hours.open_now;
        }

        // Check if venue already exists
        const existingVenue = await db.collection('facilities')
            .where('googlePlaceId', '==', venue.place_id)
            .get();

        if (!existingVenue.empty) {
            console.log(`  ⏭️  Already exists: ${venue.name}`);
            return false;
        }

        await db.collection('facilities').add(venueData);
        console.log(`  ✅ Added: ${venue.name} (${sports.join(', ')})`);
        return true;
    } catch (error) {
        console.error(`  ❌ Error saving venue:`, error.message);
        return false;
    }
}

async function fetchAllGymChains() {
    console.log('🏋️ Starting gym chain import...\n');
    console.log(`📍 Searching ${GYM_CHAINS.length} chains in ${CITIES.length} cities\n`);

    let totalAdded = 0;
    let totalFound = 0;

    for (const chain of GYM_CHAINS) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`🏢 Processing: ${chain}`);
        console.log('='.repeat(60));

        for (const city of CITIES) {
            // Search for this chain in this city
            const results = await searchGymChain(chain, city);
            totalFound += results.length;

            // Get details and save each location
            for (const result of results) {
                const details = await getPlaceDetails(result.place_id);
                if (details) {
                    const added = await saveVenueToFirestore(details, chain);
                    if (added) totalAdded++;
                }

                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, 200));
            }

            // Rate limiting between cities
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    console.log('\n\n' + '='.repeat(60));
    console.log('✨ Import Complete!');
    console.log('='.repeat(60));
    console.log(`📊 Total locations found: ${totalFound}`);
    console.log(`✅ New venues added: ${totalAdded}`);
    console.log(`⏭️  Skipped (already exist): ${totalFound - totalAdded}`);
}

// Run the import
fetchAllGymChains()
    .then(() => {
        console.log('\n🎉 Done!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Fatal error:', error);
        process.exit(1);
    });
