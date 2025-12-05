/**
 * Seed script to populate database with simulated activity
 * Run this once to make the app look live from day 1
 */

import { ActivitySimulator } from '../lib/services/activity-simulator'
import { ReviewGenerator } from '../lib/services/review-generator'
import { venueService } from '../lib/services/venue-service'
import { db } from '../lib/firebase-config'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

async function seedActivityData() {
    console.log('🌱 Seeding activity data...')

    const simulator = ActivitySimulator.getInstance()
    const reviewGen = ReviewGenerator.getInstance()

    // Get all venues
    const venues = await venueService.getAllVenues(100)
    console.log(`Found ${venues.length} venues`)

    let totalReviews = 0
    let totalCheckIns = 0

    for (const venue of venues) {
        console.log(`\n📍 Processing: ${venue.name}`)

        // 1. Generate reviews (5-15 per venue)
        const reviewCount = Math.floor(Math.random() * 10) + 5
        console.log(`  Generating ${reviewCount} reviews...`)

        try {
            const reviews = await reviewGen.generateVenueReviews(venue, reviewCount)

            for (const review of reviews) {
                await addDoc(collection(db, 'facilities', venue.id, 'reviews'), {
                    ...review,
                    timestamp: review.timestamp,
                })
            }

            totalReviews += reviewCount
            console.log(`  ✅ Added ${reviewCount} reviews`)
        } catch (error) {
            console.log(`  ⚠️  Skipping reviews (error):`, error.message)
        }

        // 2. Generate current check-ins
        const playerCount = simulator.generatePlayerCount(venue)
        if (playerCount > 0) {
            console.log(`  Generating ${playerCount} check-ins...`)

            const checkIns = simulator.generateCheckIns(venue, playerCount)

            for (const checkIn of checkIns) {
                await addDoc(collection(db, 'facilities', venue.id, 'checkins'), {
                    userId: checkIn.userId,
                    timestamp: checkIn.timestamp,
                    sport: checkIn.sport,
                })
            }

            totalCheckIns += playerCount
            console.log(`  ✅ Added ${playerCount} check-ins`)
        }

        // 3. Generate "Need Players" alert (30% chance)
        const alert = simulator.generateNeedPlayersAlert(venue)
        if (alert) {
            const alertTime = new Date(Date.now() - alert.minutesAgo * 60 * 1000)

            await addDoc(collection(db, 'facilities', venue.id, 'alerts'), {
                userName: alert.userName,
                playersNeeded: alert.playersNeeded,
                skillLevel: alert.skillLevel,
                sport: venue.sport,
                timestamp: alertTime,
                expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
                status: 'active',
            })

            console.log(`  ✅ Added "Need Players" alert`)
        }

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100))
    }

    console.log('\n\n✨ Seeding complete!')
    console.log(`📊 Total reviews: ${totalReviews}`)
    console.log(`👥 Total check-ins: ${totalCheckIns}`)
    console.log('\n🎉 Your app now looks LIVE!')
}

// Run the seed script
seedActivityData().catch(console.error)
