/**
 * Import Venues from JSON to Firebase
 * Uses the fetched data from venues-google-places.json
 */

const admin = require('firebase-admin')
const fs = require('fs')
const path = require('path')

// Configuration
const SERVICE_ACCOUNT_PATH = './goodrunss-ai-firebase-adminsdk-fbsvc-7bbeb674aa.json'
const DATA_FILE = './data/venues-google-places.json'
const COLLECTION_NAME = 'facilities'
const BATCH_SIZE = 400 // Firestore limit is 500

async function main() {
    console.log('🔥 GoodRunss Firebase Importer')
    console.log('=============================\n')

    // 1. Initialize Firebase
    const serviceAccountPath = path.resolve(SERVICE_ACCOUNT_PATH)
    if (!fs.existsSync(serviceAccountPath)) {
        console.error(`❌ Service account file not found: ${serviceAccountPath}`)
        process.exit(1)
    }

    const serviceAccount = require(serviceAccountPath)

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    })

    const db = admin.firestore()
    console.log('✓ Connected to Firestore')

    // 2. Load Data
    if (!fs.existsSync(DATA_FILE)) {
        console.error(`❌ Data file not found: ${DATA_FILE}`)
        process.exit(1)
    }

    const venues = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
    console.log(`✓ Loaded ${venues.length} venues from JSON\n`)

    // 3. Import in Batches
    let created = 0
    let updated = 0
    let failed = 0
    let skipped = 0

    // Optional: Check existing to avoid unnecessary writes
    // For now, we'll just overwrite/merge based on ID

    for (let i = 0; i < venues.length; i += BATCH_SIZE) {
        const batch = db.batch()
        const chunk = venues.slice(i, i + BATCH_SIZE)
        let batchCount = 0

        console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(venues.length / BATCH_SIZE)}...`)

        for (const venue of chunk) {
            if (!venue.googlePlaceId) {
                skipped++
                continue
            }

            // Use googlePlaceId as document ID to ensure uniqueness
            const docRef = db.collection(COLLECTION_NAME).doc(venue.googlePlaceId)

            // Add timestamps
            const data = {
                ...venue,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                // Only set createdAt if it doesn't exist (handled by merge: true)
            }

            batch.set(docRef, data, { merge: true })
            batchCount++
        }

        if (batchCount > 0) {
            try {
                await batch.commit()
                created += batchCount
                process.stdout.write(`  ✓ Committed ${batchCount} venues\n`)
            } catch (error) {
                console.error(`  ❌ Batch failed: ${error.message}`)
                failed += batchCount
            }
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 500))
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`✓ Import complete!`)
    console.log(`  Processed: ${created}`)
    console.log(`  Failed: ${failed}`)
    console.log(`  Skipped: ${skipped}`)
}

main().catch(console.error)
