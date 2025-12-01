/**
 * GoodRunss Firebase Facility Importer
 * 
 * Imports facilities into Firebase Firestore
 * Handles batch writes, deduplication, and updates
 */

import admin from 'firebase-admin'
import { Venue } from '../../lib/types/global-facilities'
import * as fs from 'fs'
import * as path from 'path'

// ===== FIREBASE SETUP =====
export class FirebaseFacilityImporter {
  private db: admin.firestore.Firestore
  private facilityCollection: string = 'facilities'
  
  constructor(serviceAccountPath?: string) {
    // Initialize Firebase Admin if not already initialized
    if (!admin.apps.length) {
      const serviceAccount = serviceAccountPath 
        ? JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))
        : undefined

      admin.initializeApp({
        credential: serviceAccount 
          ? admin.credential.cert(serviceAccount)
          : admin.credential.applicationDefault(),
      })
    }

    this.db = admin.firestore()
  }

  /**
   * Import a single venue
   */
  async importVenue(venue: Venue): Promise<void> {
    try {
      // Check if venue already exists by Google Place ID
      if (venue.googlePlaceId) {
        const existing = await this.db
          .collection(this.facilityCollection)
          .where('googlePlaceId', '==', venue.googlePlaceId)
          .limit(1)
          .get()

        if (!existing.empty) {
          // Update existing venue
          const docId = existing.docs[0].id
          await this.db.collection(this.facilityCollection).doc(docId).update({
            ...venue,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          })
          console.log(`  ✓ Updated: ${venue.name}`)
          return
        }
      }

      // Create new venue
      await this.db.collection(this.facilityCollection).add({
        ...venue,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })
      
      console.log(`  ✓ Created: ${venue.name}`)
    } catch (error) {
      console.error(`  ✗ Error importing ${venue.name}:`, error)
    }
  }

  /**
   * Import multiple venues in batches
   */
  async importVenues(venues: Venue[], batchSize: number = 500): Promise<{
    created: number
    updated: number
    failed: number
  }> {
    let created = 0
    let updated = 0
    let failed = 0

    console.log(`\nStarting import of ${venues.length} venues...`)
    console.log(`Batch size: ${batchSize}`)

    // Process in batches
    for (let i = 0; i < venues.length; i += batchSize) {
      const batch = venues.slice(i, i + batchSize)
      console.log(`\nProcessing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(venues.length / batchSize)}`)
      
      for (const venue of batch) {
        try {
          // Check if exists
          let existingDoc = null
          if (venue.googlePlaceId) {
            const query = await this.db
              .collection(this.facilityCollection)
              .where('googlePlaceId', '==', venue.googlePlaceId)
              .limit(1)
              .get()
            
            existingDoc = query.empty ? null : query.docs[0]
          }

          if (existingDoc) {
            // Update existing
            await existingDoc.ref.update({
              ...venue,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            })
            updated++
          } else {
            // Create new
            await this.db.collection(this.facilityCollection).add({
              ...venue,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            })
            created++
          }

          // Progress indicator
          if ((created + updated + failed) % 50 === 0) {
            console.log(`  Progress: ${created + updated + failed}/${venues.length} (${created} created, ${updated} updated, ${failed} failed)`)
          }

        } catch (error) {
          console.error(`  Error processing ${venue.name}:`, error)
          failed++
        }
      }

      // Wait between batches to avoid rate limits
      if (i + batchSize < venues.length) {
        await this.sleep(1000)
      }
    }

    console.log(`\n✓ Import complete!`)
    console.log(`  Created: ${created}`)
    console.log(`  Updated: ${updated}`)
    console.log(`  Failed: ${failed}`)

    return { created, updated, failed }
  }

  /**
   * Query facilities by sport type
   */
  async getFacilitiesBySport(sport: string): Promise<Venue[]> {
    const snapshot = await this.db
      .collection(this.facilityCollection)
      .where('sportTypes', 'array-contains', sport)
      .get()

    return snapshot.docs.map(doc => doc.data() as Venue)
  }

  /**
   * Query facilities by location (within radius)
   */
  async getFacilitiesNearby(
    lat: number,
    lng: number,
    radiusKm: number = 10
  ): Promise<Venue[]> {
    // Simple bounding box query
    // For production, use Geohash or GeoFirestore for better performance
    const latDelta = radiusKm / 111.12 // 1 degree latitude ≈ 111.12 km
    const lngDelta = radiusKm / (111.12 * Math.cos(lat * Math.PI / 180))

    const snapshot = await this.db
      .collection(this.facilityCollection)
      .where('lat', '>=', lat - latDelta)
      .where('lat', '<=', lat + latDelta)
      .get()

    // Filter by longitude and calculate distance
    const facilities = snapshot.docs
      .map(doc => doc.data() as Venue)
      .filter(venue => {
        return venue.lng >= lng - lngDelta && venue.lng <= lng + lngDelta
      })
      .map(venue => ({
        ...venue,
        distance: this.calculateDistance(lat, lng, venue.lat, venue.lng),
      }))
      .filter(venue => venue.distance! <= radiusKm)
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))

    return facilities
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  /**
   * Delete all facilities (for testing/cleanup)
   */
  async deleteAllFacilities(): Promise<number> {
    console.warn('⚠️  Deleting all facilities...')
    
    const snapshot = await this.db.collection(this.facilityCollection).get()
    const batch = this.db.batch()
    let count = 0

    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref)
      count++
    })

    await batch.commit()
    console.log(`✓ Deleted ${count} facilities`)
    
    return count
  }

  /**
   * Get facility statistics
   */
  async getStats(): Promise<{
    total: number
    bySport: Record<string, number>
    byFacilityType: Record<string, number>
    bySource: Record<string, number>
  }> {
    const snapshot = await this.db.collection(this.facilityCollection).get()
    const facilities = snapshot.docs.map(doc => doc.data() as Venue)

    const stats = {
      total: facilities.length,
      bySport: {} as Record<string, number>,
      byFacilityType: {} as Record<string, number>,
      bySource: {} as Record<string, number>,
    }

    facilities.forEach(facility => {
      // Count by sport
      facility.sportTypes.forEach(sport => {
        stats.bySport[sport] = (stats.bySport[sport] || 0) + 1
      })

      // Count by facility type
      stats.byFacilityType[facility.facilityType] = 
        (stats.byFacilityType[facility.facilityType] || 0) + 1

      // Count by source
      stats.bySource[facility.source] = 
        (stats.bySource[facility.source] || 0) + 1
    })

    return stats
  }

  /**
   * Export facilities to JSON file
   */
  async exportToFile(outputPath: string): Promise<void> {
    console.log(`Exporting facilities to ${outputPath}...`)
    
    const snapshot = await this.db.collection(this.facilityCollection).get()
    const facilities = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))

    fs.writeFileSync(
      outputPath,
      JSON.stringify(facilities, null, 2),
      'utf8'
    )

    console.log(`✓ Exported ${facilities.length} facilities`)
  }

  /**
   * Import from JSON file
   */
  async importFromFile(inputPath: string): Promise<void> {
    console.log(`Importing facilities from ${inputPath}...`)
    
    const data = fs.readFileSync(inputPath, 'utf8')
    const facilities = JSON.parse(data) as Venue[]

    await this.importVenues(facilities)
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Export for use in scripts
export default FirebaseFacilityImporter

