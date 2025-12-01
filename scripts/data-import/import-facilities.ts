#!/usr/bin/env ts-node

/**
 * GoodRunss Global Facility Import Script
 * 
 * Usage:
 *   npm run import-facilities -- --sport basketball --cities us-major
 *   npm run import-facilities -- --sport swimming --cities us-major --import
 *   npm run import-facilities -- --sport all --cities us-colleges --import
 * 
 * Options:
 *   --sport <type>      Sport type to fetch (or 'all')
 *   --cities <preset>   City preset: us-major, us-colleges, or custom
 *   --import            Import to Firebase (default: just save to JSON)
 *   --output <path>     Output JSON file path (default: ./data/facilities.json)
 *   --help              Show help
 */

import { Command } from 'commander'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
import {
  GlobalFacilityFetcher,
  fetchFacilitiesForCities,
  US_MAJOR_CITIES,
  US_TOP_COLLEGES,
} from './google-places-fetcher'
import { FirebaseFacilityImporter } from './firebase-importer'
import { SportType, FacilityType } from '../../lib/types/global-facilities'

// Load environment variables
dotenv.config()

// ===== CONFIGURATION =====
const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY || ''
const FIREBASE_SERVICE_ACCOUNT = process.env.FIREBASE_SERVICE_ACCOUNT_PATH

// Sport to FacilityType mapping (simplified)
const SPORT_TO_FACILITY: Record<string, FacilityType> = {
  basketball: 'outdoor_court',
  tennis: 'outdoor_court',
  pickleball: 'outdoor_court',
  racquetball: 'indoor_court',
  squash: 'indoor_court',
  volleyball: 'outdoor_court',
  soccer: 'public_field',
  football: 'public_field',
  baseball: 'public_field',
  swimming: 'public_pool',
  yoga: 'yoga_studio',
  pilates: 'pilates_studio',
  crossfit: 'crossfit_box',
  gym: 'commercial_gym',
  golf: 'golf_course',
  // Recovery facilities
  physical_therapy: 'physical_therapy',
  pt: 'physical_therapy',
  sports_medicine: 'sports_medicine',
  chiropractic: 'chiropractic',
  chiropractor: 'chiropractic',
  massage: 'massage_therapy',
  massage_therapy: 'massage_therapy',
  acupuncture: 'acupuncture',
  cryotherapy: 'cryotherapy',
  cryo: 'cryotherapy',
  float: 'float_spa',
  float_spa: 'float_spa',
  sauna: 'sauna_spa',
  recovery: 'recovery_studio',
  orthopedic: 'orthopedic_clinic',
}

// ===== CLI SETUP =====
const program = new Command()

program
  .name('import-facilities')
  .description('Import global recreational and wellness facilities from Google Places API')
  .version('1.0.0')

program
  .option('-s, --sport <type>', 'Sport type to fetch (e.g., basketball, swimming, or "all")')
  .option('-c, --cities <preset>', 'City preset: us-major, us-colleges, or path to JSON file', 'us-major')
  .option('-i, --import', 'Import to Firebase (default: save to JSON only)', false)
  .option('-o, --output <path>', 'Output JSON file path', './data/facilities.json')
  .option('--dry-run', 'Fetch but don\'t save anywhere (for testing)', false)
  .option('--limit <number>', 'Limit results per city (for testing)', '20')

program.parse(process.argv)

const options = program.opts()

// ===== MAIN FUNCTION =====
async function main() {
  console.log('🌎 GoodRunss Global Facility Importer')
  console.log('=====================================\n')

  // Validate API key
  if (!GOOGLE_API_KEY) {
    console.error('❌ Error: GOOGLE_PLACES_API_KEY not set in environment')
    console.error('   Add it to your .env file or set as environment variable')
    process.exit(1)
  }

  // Determine sports to fetch
  let sportsToFetch: SportType[] = []
  if (options.sport === 'all') {
    // Fetch all sports (limit for demo)
    sportsToFetch = ['basketball', 'tennis', 'swimming', 'soccer', 'yoga', 'gym']
    console.log('📊 Fetching ALL major sports')
  } else if (options.sport === 'recovery') {
    // Fetch all recovery facilities
    sportsToFetch = ['physical_therapy', 'sports_medicine', 'chiropractic', 'massage', 'cryotherapy'] as any[]
    console.log('🏥 Fetching ALL recovery facilities')
  } else if (options.sport) {
    sportsToFetch = [options.sport as SportType]
    console.log(`📊 Fetching: ${options.sport}`)
  } else {
    console.error('❌ Error: --sport option is required')
    program.help()
  }

  // Determine cities
  let cities = US_MAJOR_CITIES
  if (options.cities === 'us-colleges') {
    cities = US_TOP_COLLEGES
    console.log('🎓 Target: Top 50 US Colleges')
  } else if (options.cities === 'us-major') {
    cities = US_MAJOR_CITIES
    console.log('🏙️  Target: 20 Major US Cities')
  } else {
    // Custom JSON file
    try {
      cities = JSON.parse(fs.readFileSync(options.cities, 'utf8'))
      console.log(`📍 Target: Custom locations from ${options.cities}`)
    } catch (error) {
      console.error(`❌ Error loading cities file: ${error}`)
      process.exit(1)
    }
  }

  console.log(`🔍 Total searches: ${sportsToFetch.length * cities.length}\n`)

  // Confirm before proceeding (if importing)
  if (options.import && !options.dryRun) {
    console.log('⚠️  WARNING: This will import data to Firebase!')
    console.log('   Press Ctrl+C to cancel, or wait 3 seconds to continue...\n')
    await sleep(3000)
  }

  // Start fetching
  console.log('🚀 Starting fetch...\n')
  const startTime = Date.now()

  const allVenues: any[] = []

  for (const sport of sportsToFetch) {
    const facilityType = SPORT_TO_FACILITY[sport] || 'recreation_center'
    
    console.log(`\n━━━ ${sport.toUpperCase()} ━━━`)
    
    const venues = await fetchFacilitiesForCities(
      GOOGLE_API_KEY,
      [sport],
      cities,
      facilityType,
      (progress) => {
        process.stdout.write(`\r  Progress: ${progress.current}/${progress.total} - ${progress.facility}`)
      }
    )

    console.log(`\n  ✓ Found ${venues.length} ${sport} facilities`)
    allVenues.push(...venues)

    // Rate limiting between sports
    await sleep(1000)
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`✓ Fetch complete in ${elapsed}s`)
  console.log(`  Total facilities found: ${allVenues.length}`)

  // Stop here if dry run
  if (options.dryRun) {
    console.log('\n🏁 Dry run complete - no data saved')
    return
  }

  // Save to JSON file
  console.log(`\n💾 Saving to ${options.output}...`)
  const outputDir = path.dirname(options.output)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  fs.writeFileSync(options.output, JSON.stringify(allVenues, null, 2), 'utf8')
  console.log(`  ✓ Saved ${allVenues.length} facilities`)

  // Import to Firebase if requested
  if (options.import) {
    console.log(`\n🔥 Importing to Firebase...`)
    
    const importer = new FirebaseFacilityImporter(FIREBASE_SERVICE_ACCOUNT)
    const result = await importer.importVenues(allVenues)
    
    console.log('\n━━━ Import Summary ━━━')
    console.log(`  Created: ${result.created}`)
    console.log(`  Updated: ${result.updated}`)
    console.log(`  Failed: ${result.failed}`)

    // Show stats
    console.log('\n📊 Database Stats:')
    const stats = await importer.getStats()
    console.log(`  Total facilities: ${stats.total}`)
    console.log(`  By sport:`)
    Object.entries(stats.bySport)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .forEach(([sport, count]) => {
        console.log(`    ${sport}: ${count}`)
      })
  }

  console.log('\n✅ All done!\n')
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ===== RUN =====
main().catch(error => {
  console.error('\n❌ Fatal error:', error)
  process.exit(1)
})

