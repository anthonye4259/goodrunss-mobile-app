/**
 * Build 169 Venue Seeding Script
 * 
 * Seeds venues for Columbia SC, Charlotte NC, and Houston TX
 * Run with: node scripts/seed-build169-venues.js
 */

const admin = require('firebase-admin')
const path = require('path')

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '../functions/service-account.json')
try {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(require(serviceAccountPath))
        })
    }
} catch (e) {
    console.error('Error loading service account:', e.message)
    console.log('\nMake sure functions/service-account.json exists.')
    process.exit(1)
}

const db = admin.firestore()

// Columbia, SC Basketball Courts (approximate coordinates)
const columbiaVenues = [
    { name: "Killian Rec Park", city: "Columbia", state: "SC", sports: ["basketball"], type: "rec_center", lat: 34.0626, lng: -80.9012 },
    { name: "North Springs Rec", city: "Columbia", state: "SC", sports: ["basketball"], type: "rec_center", lat: 34.0892, lng: -81.0541 },
    { name: "Polo Rec", city: "Columbia", state: "SC", sports: ["basketball"], type: "rec_center", lat: 34.0756, lng: -80.9523 },
    { name: "Blythwood Rec", city: "Blythewood", state: "SC", sports: ["basketball"], type: "rec_center", lat: 34.2146, lng: -80.9792 },
    { name: "Tri-City Leisure Center", city: "Columbia", state: "SC", sports: ["basketball"], type: "rec_center", lat: 33.9612, lng: -81.1256 },
    { name: "Crane Creek Community Center", city: "Columbia", state: "SC", sports: ["basketball"], type: "community_center", lat: 34.0234, lng: -80.8934 },
    { name: "Martin Luther King Jr. Park", city: "Columbia", state: "SC", sports: ["basketball"], type: "park", lat: 34.0024, lng: -81.0412 },
    { name: "Drew Wellness Center", city: "Columbia", state: "SC", sports: ["basketball"], type: "gym", lat: 34.0156, lng: -81.0234 },
]

// Charlotte, NC Basketball Courts (approximate coordinates)
const charlotteVenues = [
    { name: "Stratford Richardson YMCA", city: "Charlotte", state: "NC", sports: ["basketball"], type: "ymca", lat: 35.1534, lng: -80.8123 },
    { name: "Eastway Regional Rec Center", city: "Charlotte", state: "NC", sports: ["basketball"], type: "rec_center", lat: 35.2312, lng: -80.7523 },
    { name: "Bette Rae Thomas Rec Center", city: "Charlotte", state: "NC", sports: ["basketball"], type: "rec_center", lat: 35.2456, lng: -80.8934 },
    { name: "West Charlotte Rec Center", city: "Charlotte", state: "NC", sports: ["basketball"], type: "rec_center", lat: 35.2367, lng: -80.8923 },
    { name: "Wallace Pruitt Rec Center", city: "Charlotte", state: "NC", sports: ["basketball"], type: "rec_center", lat: 35.2189, lng: -80.8756 },
    { name: "Tom Sykes Rec Center", city: "Charlotte", state: "NC", sports: ["basketball"], type: "rec_center", lat: 35.2078, lng: -80.8543 },
    { name: "Tuckaseegee Rec Center", city: "Charlotte", state: "NC", sports: ["basketball"], type: "rec_center", lat: 35.2234, lng: -80.9012 },
    { name: "Ivory Baker Rec Center", city: "Charlotte", state: "NC", sports: ["basketball"], type: "rec_center", lat: 35.1967, lng: -80.8678 },
    { name: "South View Rec Center", city: "Charlotte", state: "NC", sports: ["basketball"], type: "rec_center", lat: 35.1856, lng: -80.8234 },
    { name: "Mallard Creek Rec Center", city: "Charlotte", state: "NC", sports: ["basketball"], type: "rec_center", lat: 35.3123, lng: -80.7456 },
    { name: "Sugar Creek Rec Center", city: "Charlotte", state: "NC", sports: ["basketball"], type: "rec_center", lat: 35.2567, lng: -80.8123 },
    { name: "Dowd YMCA", city: "Charlotte", state: "NC", sports: ["basketball"], type: "ymca", lat: 35.2278, lng: -80.8456 },
]

// Houston, TX Fitness Venues (approximate coordinates)
const houstonVenues = [
    { name: "Revival Pilates", city: "Houston", state: "TX", sports: ["pilates"], type: "studio", lat: 29.7534, lng: -95.3623 },
    { name: "Train Station Gym", city: "Houston", state: "TX", sports: ["gym", "strength"], type: "gym", lat: 29.7612, lng: -95.3512 },
    { name: "James Jefferson Training", city: "Houston", state: "TX", sports: ["personal_training"], type: "gym", lat: 29.7456, lng: -95.3789 },
]

const allVenues = [...columbiaVenues, ...charlotteVenues, ...houstonVenues]

async function seedVenues() {
    console.log(`\n🏀 Seeding ${allVenues.length} venues for Build 169...\n`)

    const batch = db.batch()
    let count = 0

    for (const venue of allVenues) {
        const venueId = venue.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
        const ref = db.collection('facilities').doc(venueId)

        const venueDoc = {
            id: venueId,
            name: venue.name,
            address: `${venue.city}, ${venue.state}`,
            city: venue.city,
            state: venue.state,
            country: "USA",
            sports: venue.sports,
            facilityType: venue.type,
            coordinates: {
                lat: venue.lat,
                lng: venue.lng,
            },
            source: "manual-seed",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            isVerified: true,
            crowdStatus: {
                level: "unknown",
                lastUpdated: null,
                reportCount: 0,
            },
        }

        batch.set(ref, venueDoc, { merge: true })
        count++
        console.log(`  ✓ ${venue.name} (${venue.city}, ${venue.state})`)
    }

    await batch.commit()
    console.log(`\n✅ Successfully seeded ${count} venues!\n`)

    // Summary by city
    console.log("Summary:")
    console.log(`  • Columbia, SC: ${columbiaVenues.length} venues`)
    console.log(`  • Charlotte, NC: ${charlotteVenues.length} venues`)
    console.log(`  • Houston, TX: ${houstonVenues.length} venues`)
}

seedVenues()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error seeding venues:", error)
        process.exit(1)
    })
