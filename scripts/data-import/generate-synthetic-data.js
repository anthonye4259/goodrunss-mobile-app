const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const admin = require('firebase-admin');

// Load env
dotenv.config();

// ===== CONFIGURATION =====
const VENUES_PER_CITY = 25; // per city
const FIREBASE_SERVICE_ACCOUNT = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

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
];

const FACILITY_TYPES = [
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
];

// Helper for UUID
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function generateRandomVenue(city) {
    const template = FACILITY_TYPES[Math.floor(Math.random() * FACILITY_TYPES.length)];
    const suffix = template.nameSuffixes[Math.floor(Math.random() * template.nameSuffixes.length)];

    // Random offset ~10km
    const latOffset = (Math.random() - 0.5) * 0.1;
    const lngOffset = (Math.random() - 0.5) * 0.1;

    const namePrefixes = ["Central", "North", "South", "West", "Downtown", "Victory", "Elite", "Premier", "City", "Urban"];
    const namePrefix = namePrefixes[Math.floor(Math.random() * namePrefixes.length)];

    const venueName = `${namePrefix} ${city.name} ${suffix}`;

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
        zipCode: "10001",

        facilityType: template.type,
        sportTypes: template.sports,
        accessType: Math.random() > 0.7 ? 'members_only' : 'public',

        rating: 3.5 + (Math.random() * 1.5),
        reviewCount: Math.floor(Math.random() * 200),

        verified: true,
        bookable: Math.random() > 0.5,
        amenities: ["Parking", "Restrooms", "Water Fountain", "Locker Room"],

        createdAt: admin.firestore.Timestamp.now(), // Firestore timestamp
        updatedAt: admin.firestore.Timestamp.now(),
        source: 'synthetic_seed',
        images: [],
        coverImage: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2669&auto=format&fit=crop"
    };
}

async function main() {
    console.log('🏭 GoodRunss Synthetic Data Generator (JS)');
    console.log('=====================================\n');

    // 1. Generate Data
    const allVenues = [];
    CITIES.forEach(city => {
        console.log(` Generating ${VENUES_PER_CITY} venues for ${city.name}...`);
        for (let i = 0; i < VENUES_PER_CITY; i++) {
            allVenues.push(generateRandomVenue(city));
        }
    });

    console.log(`\n✅ Generated ${allVenues.length} venues total.`);

    // 2. Import to Firebase
    if (process.argv.includes('--import')) {
        console.log('\n🔥 Importing to Firebase...');

        // Init Admin
        if (!admin.apps.length) {
            try {
                const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
                    ? require(path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH))
                    : undefined;

                admin.initializeApp({
                    credential: serviceAccount
                        ? admin.credential.cert(serviceAccount)
                        : admin.credential.applicationDefault()
                });
                console.log("Firebase Admin Initialized.");
            } catch (e) {
                console.error("Failed to init Firebase Admin:", e.message);
                process.exit(1);
            }
        }

        const db = admin.firestore();
        const batchSize = 400; // max 500
        let batch = db.batch();
        let count = 0;
        let totalImported = 0;

        for (const venue of allVenues) {
            const ref = db.collection('facilities').doc(); // Auto ID
            // Flatten Venue object for Firestore (remove undefined)
            const data = JSON.parse(JSON.stringify(venue));
            // Restore timestamps
            data.createdAt = admin.firestore.FieldValue.serverTimestamp();
            data.updatedAt = admin.firestore.FieldValue.serverTimestamp();

            batch.set(ref, data);
            count++;

            if (count >= batchSize) {
                await batch.commit();
                totalImported += count;
                console.log(` Committed batch of ${count} venues.`);
                batch = db.batch();
                count = 0;
            }
        }

        if (count > 0) {
            await batch.commit();
            totalImported += count;
            console.log(` Committed final batch of ${count} venues.`);
        }

        console.log(`\n🎉 Successfully imported ${totalImported} venues to Firestore!`);
    } else {
        // Save JSON for inspection
        const outputPath = path.resolve(__dirname, '../../data/synthetic_facilities.json');
        fs.writeFileSync(outputPath, JSON.stringify(allVenues, null, 2));
        console.log(`💾 Saved local JSON to ${outputPath} (Run with --import to upload)`);
    }
}

main().catch(console.error);
