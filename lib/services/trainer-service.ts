import { db } from "../firebase-config"
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore"

const TRAINERS_COLLECTION = "trainers"
const BOOKINGS_COLLECTION = "bookings"

export interface Trainer {
    id: string
    name: string
    sport: string[]
    rating: number
    reviews: number
    price: number
    location: string
    bio?: string
    specialties?: string[]
    availability?: string[]
}

export const trainerService = {
    /**
     * Get trainers by sport
     */
    async getTrainersBySport(sport: string, limitCount: number = 20): Promise<Trainer[]> {
        if (!db) return []

        try {
            const q = query(
                collection(db, TRAINERS_COLLECTION),
                where("sport", "array-contains", sport)
            )

            const snapshot = await getDocs(q)
            const trainers: Trainer[] = []

            snapshot.forEach((doc) => {
                trainers.push({
                    id: doc.id,
                    ...doc.data()
                } as Trainer)
            })

            return trainers
        } catch (error) {
            console.error("Error fetching trainers:", error)
            return []
        }
    },

    /**
     * Get trainer by ID
     */
    async getTrainerById(trainerId: string): Promise<Trainer | null> {
        if (!db) return null

        try {
            const trainerRef = doc(db, TRAINERS_COLLECTION, trainerId)
            const trainerDoc = await getDoc(trainerRef)

            if (trainerDoc.exists()) {
                return {
                    id: trainerDoc.id,
                    ...trainerDoc.data()
                } as Trainer
            }

            return null
        } catch (error) {
            console.error("Error fetching trainer:", error)
            return null
        }
    },

    /**
     * Create a booking
     */
    async createBooking(
        trainerId: string,
        userId: string,
        userName: string,
        date: Date,
        duration: number,
        notes?: string
    ): Promise<boolean> {
        if (!db) return false

        try {
            const bookingsRef = collection(db, BOOKINGS_COLLECTION)

            await addDoc(bookingsRef, {
                trainerId,
                userId,
                userName,
                date: date.toISOString(),
                duration,
                notes: notes || "",
                timestamp: serverTimestamp(),
                status: "pending",
                paid: false
            })

            return true
        } catch (error) {
            console.error("Error creating booking:", error)
            return false
        }
    },

    /**
     * Get user's bookings
     */
    async getUserBookings(userId: string): Promise<any[]> {
        if (!db) return []

        try {
            const q = query(
                collection(db, BOOKINGS_COLLECTION),
                where("userId", "==", userId)
            )

            const snapshot = await getDocs(q)
            const bookings: any[] = []

            snapshot.forEach((doc) => {
                bookings.push({
                    id: doc.id,
                    ...doc.data()
                })
            })

            return bookings
        } catch (error) {
            console.error("Error fetching bookings:", error)
            return []
        }
    }
}
