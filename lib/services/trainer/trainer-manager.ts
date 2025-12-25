import { db } from "@/lib/firebase-config"
import { collection, query, where, getDocs, getDoc, doc, updateDoc, getCountFromServer, getAggregateFromServer, sum, average } from "firebase/firestore"

// ============================================
// MANAGER TYPES
// ============================================

export interface TrainerStats {
    totalEarnings: number
    pendingEarnings: number
    completedSessions: number
    upcomingSessions: number
    totalClients: number
    rating: number
    reviewCount: number
}

// ============================================
// TRAINER MANAGER SERVICE
// (Dashboard, Stats, Facilities)
// ============================================

class TrainerManagerService {
    private static instance: TrainerManagerService

    private constructor() { }

    static getInstance(): TrainerManagerService {
        if (!TrainerManagerService.instance) {
            TrainerManagerService.instance = new TrainerManagerService()
        }
        return TrainerManagerService.instance
    }

    // ============================================
    // DASHBOARD STATS
    // ============================================

    async getTrainerStats(trainerId: string): Promise<TrainerStats> {
        if (!db) return this.getMockStats()

        try {
            const bookingsRef = collection(db, "bookings")

            // 1. Session Counts
            const completedQuery = query(
                bookingsRef,
                where("trainerId", "==", trainerId),
                where("status", "==", "completed")
            )
            const upcomingQuery = query(
                bookingsRef,
                where("trainerId", "==", trainerId),
                where("status", "in", ["confirmed", "pending"])
            )

            const [completedSnap, upcomingSnap] = await Promise.all([
                getCountFromServer(completedQuery),
                getCountFromServer(upcomingQuery)
            ])

            // 2. Earnings (Aggregation)
            // Note: getAggregateFromServer (sum) is efficient for large collections
            const earningsSnap = await getAggregateFromServer(completedQuery, {
                total: sum("price")
            })

            // 3. Profile Stats
            const trainerDoc = await getDoc(doc(db, "trainers", trainerId))
            const trainerData = trainerDoc.data()

            return {
                totalEarnings: earningsSnap.data().total || 0,
                pendingEarnings: 0, // Calculate from upcoming if needed
                completedSessions: completedSnap.data().count,
                upcomingSessions: upcomingSnap.data().count,
                totalClients: 0, // Can query unique userIds if critical
                rating: trainerData?.rating || 5.0,
                reviewCount: trainerData?.reviewCount || 0
            }

        } catch (error) {
            console.error("Error fetching trainer stats:", error)
            return this.getMockStats()
        }
    }

    // ============================================
    // FACILITY MANAGEMENT
    // ============================================

    async getMyFacilities(trainerId: string): Promise<any[]> {
        // Logic to fetch facilities where trainer is authorized/renting
        // Placeholder for now as this was in trainer-rental-service
        return []
    }

    private getMockStats(): TrainerStats {
        return {
            totalEarnings: 0,
            pendingEarnings: 0,
            completedSessions: 0,
            upcomingSessions: 0,
            totalClients: 0,
            rating: 5.0,
            reviewCount: 0
        }
    }
}

export const trainerManagerService = TrainerManagerService.getInstance()
