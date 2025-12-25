import { db } from "@/lib/firebase-config"
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, updateDoc, onSnapshot } from "firebase/firestore"

// ============================================
// BOOKING TYPES
// ============================================

export interface TrainerBooking {
    id: string
    trainerId: string
    userId: string
    userName: string
    userEmail?: string
    
    // Schedule
    date: string // ISO Date String
    startTime: string // "09:00"
    duration: number // minutes
    endTime: string // Calculated
    
    // Details
    price: number // in cents
    status: "pending" | "confirmed" | "completed" | "cancelled" | "declined"
    paymentStatus: "unpaid" | "paid" | "refunded"
    paymentIntentId?: string
    notes?: string
    
    // Location
    location?: string
    
    createdAt: any
}

// ============================================
// TRAINER BOOKING SERVICE
// ============================================

class TrainerBookingService {
    private static instance: TrainerBookingService

    private constructor() { }

    static getInstance(): TrainerBookingService {
        if (!TrainerBookingService.instance) {
            TrainerBookingService.instance = new TrainerBookingService()
        }
        return TrainerBookingService.instance
    }

    // ============================================
    // CREATE BOOKING
    // ============================================

    async createBooking(bookingReq: Omit<TrainerBooking, "id" | "status" | "paymentStatus" | "createdAt" | "endTime">): Promise<string> {
        if (!db) throw new Error("Database not initialized")

        try {
            // Calculate end time
            const startHour = parseInt(bookingReq.startTime.split(":")[0])
            const startMin = parseInt(bookingReq.startTime.split(":")[1])
            const totalMin = startHour * 60 + startMin + bookingReq.duration
            const endHour = Math.floor(totalMin / 60)
            const endMin = totalMin % 60
            const endTime = `${endHour.toString().padStart(2, "0")}:${endMin.toString().padStart(2, "0")}`

            const bookingData = {
                ...bookingReq,
                endTime,
                status: "pending",
                paymentStatus: "unpaid",
                createdAt: serverTimestamp(),
            }

            const docRef = await addDoc(collection(db, "bookings"), bookingData)
            return docRef.id
        } catch (error) {
            console.error("Error creating booking:", error)
            throw error
        }
    }

    // ============================================
    // FETCH BOOKINGS
    // ============================================

    async getTrainerBookings(trainerId: string, date?: string): Promise<TrainerBooking[]> {
        if (!db) return []

        try {
            let q = query(
                collection(db, "bookings"),
                where("trainerId", "==", trainerId)
            )

            // Optional: Filter by date if provided
            // Note: In a real app, you might want to query a range or sort by date
            
            const snapshot = await getDocs(q)
            let bookings = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as TrainerBooking))

            if (date) {
                bookings = bookings.filter(b => b.date.startsWith(date))
            }

            return bookings.sort((a, b) => b.date.localeCompare(a.date))
        } catch (error) {
            console.error("Error fetching trainer bookings:", error)
            return []
        }
    }

    async getUserBookings(userId: string): Promise<TrainerBooking[]> {
        if (!db) return []

        try {
            const q = query(
                collection(db, "bookings"),
                where("userId", "==", userId)
            )

            const snapshot = await getDocs(q)
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as TrainerBooking)).sort((a, b) => b.date.localeCompare(a.date))
        } catch (error) {
            console.error("Error fetching user bookings:", error)
            return []
        }
    }

    // ============================================
    // BOOKING ACTIONS
    // ============================================

    async updateStatus(bookingId: string, status: TrainerBooking["status"]): Promise<void> {
        if (!db) return
        await updateDoc(doc(db, "bookings", bookingId), { status })
    }

    async cancelBooking(bookingId: string): Promise<void> {
        await this.updateStatus(bookingId, "cancelled")
    }

    // listenToBookings (Realtime, optional helper)
    subscribeToTrainerBookings(trainerId: string, callback: (bookings: TrainerBooking[]) => void): () => void {
        if (!db) return () => {}
        
        const q = query(
            collection(db, "bookings"),
            where("trainerId", "==", trainerId)
        )

        return onSnapshot(q, (snapshot) => {
            const bookings = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as TrainerBooking))
            callback(bookings)
        })
    }
}

export const trainerBookingService = TrainerBookingService.getInstance()
