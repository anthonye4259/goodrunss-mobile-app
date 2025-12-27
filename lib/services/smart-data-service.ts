/**
 * Smart Data Provider
 * Fetches real data from Firestore when available, falls back to realistic seed data
 * so the app looks live from day 1 without users knowing it's fake.
 */

import { db } from "@/lib/firebase-config"
import { collection, getDocs, query, where, limit, orderBy } from "firebase/firestore"

// ============================================
// REALISTIC SEED DATA (Real Venues w/ Simulated Traffic)
// ============================================

const SEED_VENUES = [
    { id: "v1", name: "Piedmont Park Courts", sport: "Basketball", lat: 33.7879, lng: -84.3738, city: "Atlanta", rating: 4.8, reviewCount: 127, activePlayersNow: 8, coverImage: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400", isBookable: false },
    { id: "v2", name: "Grant Park Tennis Center", sport: "Tennis", lat: 33.7407, lng: -84.3704, city: "Atlanta", rating: 4.6, reviewCount: 89, activePlayersNow: 4, coverImage: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400", isBookable: false },
    { id: "v3", name: "Buckhead Pickleball Club", sport: "Pickleball", lat: 33.8387, lng: -84.3803, city: "Atlanta", rating: 4.9, reviewCount: 203, activePlayersNow: 12, coverImage: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400", isBookable: false },
    { id: "v4", name: "Market Street Courts", sport: "Basketball", lat: 33.6901, lng: -78.8867, city: "Myrtle Beach", rating: 4.5, reviewCount: 45, activePlayersNow: 3, coverImage: "https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=400", isBookable: false },
    { id: "v5", name: "Golden Gate Tennis", sport: "Tennis", lat: 37.7694, lng: -122.4862, city: "San Francisco", rating: 4.7, reviewCount: 156, activePlayersNow: 6, coverImage: "https://images.unsplash.com/photo-1551773188-0801da12ddae?w=400", isBookable: false },
    { id: "v6", name: "Central Park Courts", sport: "Basketball", lat: 40.7829, lng: -73.9654, city: "New York", rating: 4.9, reviewCount: 312, activePlayersNow: 15, coverImage: "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=400", isBookable: false },
    { id: "v7", name: "Brooklyn Bridge Park", sport: "Pickleball", lat: 40.7024, lng: -73.9969, city: "New York", rating: 4.8, reviewCount: 189, activePlayersNow: 9, coverImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", isBookable: false },
    { id: "v8", name: "Zilker Park Tennis", sport: "Tennis", lat: 30.2672, lng: -97.7431, city: "Austin", rating: 4.6, reviewCount: 78, activePlayersNow: 5, coverImage: "https://images.unsplash.com/photo-1595435934532-34a03ec5dc0e?w=400", isBookable: false },
]

// NOTE: Trainers must be REAL. No fake trainers for players.
// SEED_TRAINERS removed.

const SEED_ACTIVITY = [
    { userId: "u1", userName: "Alex M.", action: "checked in", venue: "Piedmont Park Courts", timeAgo: "2 min ago", avatar: "A" },
    { userId: "u2", userName: "Jordan K.", action: "reported", venue: "Grant Park Tennis", timeAgo: "5 min ago", avatar: "J" },
    { userId: "u3", userName: "Taylor S.", action: "booked", venue: "Buckhead Pickleball", timeAgo: "12 min ago", avatar: "T" },
    { userId: "u4", userName: "Morgan L.", action: "checked in", venue: "Central Park Courts", timeAgo: "18 min ago", avatar: "M" },
]

// ============================================
// SMART DATA SERVICE
// ============================================

class SmartDataService {
    private static instance: SmartDataService

    static getInstance(): SmartDataService {
        if (!SmartDataService.instance) {
            SmartDataService.instance = new SmartDataService()
        }
        return SmartDataService.instance
    }

    // ============================================
    // VENUES - Real + Seed Blend (for Traffic Data)
    // ============================================

    async getVenuesNear(lat: number, lng: number, sport?: string): Promise<any[]> {
        try {
            if (!db) return this.getSeedVenues(sport)

            // Try real data first
            const q = query(
                collection(db, "venues"),
                limit(20)
            )
            const snapshot = await getDocs(q)

            if (snapshot.empty) {
                // Return seed venues so we show "traffic" and existence even if not fully onboarded
                return this.getSeedVenues(sport)
            }

            // Blend: Real venues + some seed IF needed to fill map (User preference: ensure venues show)
            const realVenues = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            const seedForRegion = this.getSeedVenues(sport).slice(0, 5)

            // Dedupe by name
            const seen = new Set(realVenues.map(v => v.name))
            const blended = [...realVenues, ...seedForRegion.filter(s => !seen.has(s.name))]

            return blended
        } catch (error) {
            console.log("Falling back to seeded venues (simulated traffic):", error)
            return this.getSeedVenues(sport)
        }
    }

    private getSeedVenues(sport?: string): any[] {
        // Add dynamic "active now" based on time (SIMULATED PREDICTIONS)
        const hour = new Date().getHours()
        return SEED_VENUES
            .filter(v => !sport || v.sport === sport)
            .map(v => ({
                ...v,
                activePlayersNow: this.getRealisticActivityCount(hour),
                lastReportedAt: new Date(Date.now() - Math.random() * 3600000).toISOString()
            }))
    }

    private getRealisticActivityCount(hour: number): number {
        // Peak hours = more activity
        if (hour >= 17 && hour <= 20) return Math.floor(Math.random() * 12) + 5 // 5-16
        if (hour >= 10 && hour <= 16) return Math.floor(Math.random() * 8) + 2 // 2-9
        return Math.floor(Math.random() * 4) // 0-3 off-peak
    }

    // ============================================
    // TRAINERS - Real Only (STRICT)
    // ============================================

    async getTrainers(city?: string, sport?: string): Promise<any[]> {
        try {
            if (!db) return []

            const q = query(
                collection(db, "trainers"),
                where("isListed", "==", true),
                limit(20)
            )
            const snapshot = await getDocs(q)

            if (snapshot.empty) {
                // STRICT: No fake trainers
                return []
            }

            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        } catch (error) {
            console.error("Error fetching trainers:", error)
            return []
        }
    }

    // ============================================
    // LIVE ACTIVITY FEED - Real + Simulated Blend
    // ============================================

    async getRecentActivity(): Promise<any[]> {
        try {
            if (!db) return SEED_ACTIVITY

            const q = query(
                collection(db, "activity"),
                orderBy("createdAt", "desc"),
                limit(10)
            )
            const snapshot = await getDocs(q)

            if (snapshot.empty) return SEED_ACTIVITY

            return snapshot.docs.map(doc => doc.data())
        } catch {
            return SEED_ACTIVITY
        }
    }

    // ============================================
    // USER STATS - Smart Defaults / Simulated
    // ============================================

    async getUserStats(userId: string): Promise<{ activityScore: number, recoveryScore: number, kcalBurned: number, activeHours: number }> {
        try {
            if (!db || !userId) return this.getSimulatedStats()

            // Try to fetch real stats needed here
            return this.getSimulatedStats()
        } catch {
            return this.getSimulatedStats()
        }
    }

    private getSimulatedStats() {
        // User requested "fake predictions and activity" early on is fine
        return {
            activityScore: Math.floor(Math.random() * 15) + 80, // 80-95
            recoveryScore: Math.floor(Math.random() * 20) + 70, // 70-90
            kcalBurned: Math.floor(Math.random() * 500) + 800, // 800-1300
            activeHours: parseFloat((Math.random() * 2 + 3).toFixed(1)) // 3-5h
        }
    }
}

export const smartDataService = SmartDataService.getInstance()
export { SEED_VENUES, SEED_ACTIVITY }
