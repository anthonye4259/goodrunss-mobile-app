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
    { id: "v3", name: "Buckhead Pickleball Club", sport: "Pickleball", lat: 33.8387, lng: -84.3803, city: "Atlanta", rating: 4.9, reviewCount: 203, activePlayersNow: 12, coverImage: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400", isBookable: false },

    // =====================================================================
    // MYRTLE BEACH "SURREAL" DATASET - COMPREHENSIVE COVERAGE (30+ Venues)
    // =====================================================================

    // --- CITY OF MYRTLE BEACH (CORE) ---
    { id: "mb_core_1", name: "Myrtle Beach Sports Center", sport: "Basketball", lat: 33.7153, lng: -78.8778, city: "Myrtle Beach", rating: 4.9, reviewCount: 312, activePlayersNow: 24, coverImage: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=400", isBookable: true },
    { id: "mb_core_2", name: "Pepper Geddings Rec Center", sport: "Pickleball", lat: 33.7042, lng: -78.8727, city: "Myrtle Beach", rating: 4.8, reviewCount: 145, activePlayersNow: 18, coverImage: "https://images.unsplash.com/photo-1626245347209-322475e7a9dd?w=400", isBookable: true },
    { id: "mb_core_3", name: "Mary C. Canty Recreation Center", sport: "Basketball", lat: 33.7011, lng: -78.8833, city: "Myrtle Beach", rating: 4.7, reviewCount: 112, activePlayersNow: 14, coverImage: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400", isBookable: false },
    { id: "mb_core_4", name: "Doug Shaw Memorial Stadium", sport: "Soccer", lat: 33.7027, lng: -78.8744, city: "Myrtle Beach", rating: 4.8, reviewCount: 156, activePlayersNow: 22, coverImage: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=400", isBookable: false },
    { id: "mb_core_5", name: "Ned Donkle Complex", sport: "Tennis", lat: 33.7226, lng: -78.8624, city: "Myrtle Beach", rating: 4.6, reviewCount: 88, activePlayersNow: 8, coverImage: "https://images.unsplash.com/photo-1595435934532-34a03ec5dc0e?w=400", isBookable: false },
    { id: "mb_core_6", name: "Midway Park", sport: "Tennis", lat: 33.6749, lng: -78.9160, city: "Myrtle Beach", rating: 4.5, reviewCount: 64, activePlayersNow: 6, coverImage: "https://images.unsplash.com/photo-1551773188-0801da12ddae?w=400", isBookable: false },
    { id: "mb_core_7", name: "Grand Park Athletic Complex", sport: "Soccer", lat: 33.6708, lng: -78.9407, city: "Myrtle Beach", rating: 4.9, reviewCount: 420, activePlayersNow: 45, coverImage: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400", isBookable: true },
    { id: "mb_core_8", name: "Crabtree Memorial Gym", sport: "Basketball", lat: 33.6708, lng: -78.9407, city: "Myrtle Beach", rating: 4.7, reviewCount: 95, activePlayersNow: 12, coverImage: "https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=400", isBookable: true },
    { id: "mb_core_9", name: "Ashley Booth Field", sport: "Baseball", lat: 33.7020, lng: -78.8740, city: "Myrtle Beach", rating: 4.4, reviewCount: 30, activePlayersNow: 0, coverImage: "https://images.unsplash.com/photo-1531315630201-bb15dbbe16d6?w=400", isBookable: false },
    { id: "mb_core_10", name: "Market Common Fields", sport: "Soccer", lat: 33.6680, lng: -78.9380, city: "Myrtle Beach", rating: 4.8, reviewCount: 210, activePlayersNow: 28, coverImage: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400", isBookable: false },
    { id: "mb_core_11", name: "Savannah's Playground", sport: "Other", lat: 33.6685, lng: -78.9390, city: "Myrtle Beach", rating: 4.9, reviewCount: 500, activePlayersNow: 40, coverImage: "https://images.unsplash.com/photo-1596464716127-f9a0859b4bce?w=400", isBookable: false },
    { id: "mb_core_12", name: "Withers Swash Park", sport: "Other", lat: 33.6850, lng: -78.8900, city: "Myrtle Beach", rating: 4.3, reviewCount: 45, activePlayersNow: 5, coverImage: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400", isBookable: false },

    // --- NORTH MYRTLE BEACH (NMB) ---
    { id: "nmb_1", name: "NMB Park & Sports Complex", sport: "Pickleball", lat: 33.8242, lng: -78.7233, city: "North Myrtle Beach", rating: 5.0, reviewCount: 600, activePlayersNow: 55, coverImage: "https://images.unsplash.com/photo-1626245347209-322475e7a9dd?w=400", isBookable: true },
    { id: "nmb_2", name: "J. Bryan Floyd Community Center", sport: "Pickleball", lat: 33.8242, lng: -78.6833, city: "North Myrtle Beach", rating: 4.8, reviewCount: 130, activePlayersNow: 22, coverImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", isBookable: true },
    { id: "nmb_3", name: "Central Park NMB", sport: "Tennis", lat: 33.8164, lng: -78.6966, city: "North Myrtle Beach", rating: 4.6, reviewCount: 88, activePlayersNow: 6, coverImage: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400", isBookable: false },
    { id: "nmb_4", name: "McLean Park", sport: "Tennis", lat: 33.8190, lng: -78.6890, city: "North Myrtle Beach", rating: 4.7, reviewCount: 92, activePlayersNow: 8, coverImage: "https://images.unsplash.com/photo-1595435934532-34a03ec5dc0e?w=400", isBookable: false },
    { id: "nmb_5", name: "Possum Trot Park", sport: "Other", lat: 33.8100, lng: -78.7000, city: "North Myrtle Beach", rating: 4.4, reviewCount: 30, activePlayersNow: 4, coverImage: "https://images.unsplash.com/photo-1596464716127-f9a0859b4bce?w=400", isBookable: false },

    // --- SURFSIDE & GARDEN CITY ---
    { id: "surf_1", name: "Fuller Park", sport: "Tennis", lat: 33.6080, lng: -78.9720, city: "Surfside Beach", rating: 4.5, reviewCount: 55, activePlayersNow: 6, coverImage: "https://images.unsplash.com/photo-1551773188-0801da12ddae?w=400", isBookable: false },
    { id: "surf_2", name: "Huckabee Recreation Complex", sport: "Baseball", lat: 33.6150, lng: -78.9800, city: "Surfside Beach", rating: 4.6, reviewCount: 70, activePlayersNow: 12, coverImage: "https://images.unsplash.com/photo-1531315630201-bb15dbbe16d6?w=400", isBookable: false },
    { id: "surf_3", name: "Surfside Tennis Center", sport: "Tennis", lat: 33.6050, lng: -78.9680, city: "Surfside Beach", rating: 4.7, reviewCount: 82, activePlayersNow: 10, coverImage: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400", isBookable: false },
    { id: "surf_4", name: "W.O. Martin Field", sport: "Soccer", lat: 33.6120, lng: -78.9750, city: "Surfside Beach", rating: 4.3, reviewCount: 40, activePlayersNow: 8, coverImage: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=400", isBookable: false },

    // --- CONWAY & CAROLINA FOREST (NEARBY) ---
    { id: "ccu_1", name: "Coastal Carolina Rec Center", sport: "Basketball", lat: 33.7930, lng: -79.0120, city: "Conway", rating: 4.9, reviewCount: 450, activePlayersNow: 60, coverImage: "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=400", isBookable: false },
    { id: "conway_1", name: "Conway Recreation Center", sport: "Basketball", lat: 33.8450, lng: -79.0430, city: "Conway", rating: 4.6, reviewCount: 110, activePlayersNow: 15, coverImage: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=400", isBookable: true },
    { id: "conway_2", name: "Smith Jones Park", sport: "Tennis", lat: 33.8320, lng: -79.0500, city: "Conway", rating: 4.4, reviewCount: 45, activePlayersNow: 4, coverImage: "https://images.unsplash.com/photo-1595435934532-34a03ec5dc0e?w=400", isBookable: false },
    { id: "cf_1", name: "Carolina Forest Rec Center", sport: "Basketball", lat: 33.7550, lng: -78.9650, city: "Myrtle Beach", rating: 4.8, reviewCount: 230, activePlayersNow: 25, coverImage: "https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=400", isBookable: true },
    { id: "cf_2", name: "Palmetto Adventure Land", sport: "Other", lat: 33.7600, lng: -78.9600, city: "Myrtle Beach", rating: 4.7, reviewCount: 300, activePlayersNow: 30, coverImage: "https://images.unsplash.com/photo-1596464716127-f9a0859b4bce?w=400", isBookable: false },

    // --- PREMIUM/CLUBS ---
    { id: "club_1", name: "Grande Dunes Tennis Club", sport: "Tennis", lat: 33.7620, lng: -78.8250, city: "Myrtle Beach", rating: 5.0, reviewCount: 120, activePlayersNow: 14, coverImage: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400", isBookable: false },
    { id: "club_2", name: "The Dunes Golf & Beach Club", sport: "Tennis", lat: 33.7500, lng: -78.8100, city: "Myrtle Beach", rating: 5.0, reviewCount: 350, activePlayersNow: 18, coverImage: "https://images.unsplash.com/photo-1551773188-0801da12ddae?w=400", isBookable: false },
    { id: "club_3", name: "Prestwick Tennis Club", sport: "Tennis", lat: 33.6300, lng: -78.9600, city: "Myrtle Beach", rating: 4.8, reviewCount: 88, activePlayersNow: 10, coverImage: "https://images.unsplash.com/photo-1595435934532-34a03ec5dc0e?w=400", isBookable: false },
    { id: "club_4", name: "Claire Chapin Epps YMCA", sport: "Pickleball", lat: 33.7400, lng: -78.8600, city: "Myrtle Beach", rating: 4.7, reviewCount: 180, activePlayersNow: 35, coverImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", isBookable: true },
    { id: "club_5", name: "78Fitness", sport: "Basketball", lat: 33.7800, lng: -78.7800, city: "Myrtle Beach", rating: 4.9, reviewCount: 150, activePlayersNow: 20, coverImage: "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=400", isBookable: true },
    { id: "club_6", name: "X Gym Sports Mall", sport: "Other", lat: 33.7100, lng: -78.8900, city: "Myrtle Beach", rating: 4.6, reviewCount: 90, activePlayersNow: 16, coverImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400", isBookable: true },

    // --- OTHER REGIONAL ---
    { id: "others_1", name: "Socastee Recreation Park", sport: "Other", lat: 33.6800, lng: -79.0000, city: "Myrtle Beach", rating: 4.5, reviewCount: 75, activePlayersNow: 12, coverImage: "https://images.unsplash.com/photo-1596464716127-f9a0859b4bce?w=400", isBookable: false },
    { id: "others_2", name: "Michael Morris Graham Park", sport: "Baseball", lat: 33.9100, lng: -79.2000, city: "Aynor", rating: 4.4, reviewCount: 35, activePlayersNow: 8, coverImage: "https://images.unsplash.com/photo-1531315630201-bb15dbbe16d6?w=400", isBookable: false },
    { id: "others_3", name: "Myrtle Beach State Park", sport: "Other", lat: 33.6500, lng: -78.9200, city: "Myrtle Beach", rating: 4.8, reviewCount: 1200, activePlayersNow: 50, coverImage: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400", isBookable: false },

    // --- SAN FRANCISCO (SEED) ---
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
            const realVenues = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any))
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
