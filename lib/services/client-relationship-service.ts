/**
 * Client Relationship Service
 * 
 * Tracks how each client was acquired by a trainer:
 * - "existing" = trainer's pre-existing client (0% platform fee)
 * - "marketplace" = found trainer through GoodRunss platform
 * 
 * After first completed marketplace booking, relationship becomes "repeat" (5% fee)
 */

import { db } from "@/lib/firebase-config"

// Relationship types
export type ClientSource = "existing" | "marketplace"
export type BookingFeeType = "existing" | "marketplace" | "repeat"

export interface ClientRelationship {
    id: string                      // trainerId_clientId
    trainerId: string
    clientId: string
    clientEmail?: string
    clientName?: string
    source: ClientSource            // How they originally met
    isRepeat: boolean               // Has completed a marketplace booking before
    firstMarketplaceBookingId: string | null
    firstMarketplaceBookingDate: Date | null
    totalBookings: number
    createdAt: Date
    updatedAt: Date
}

// Helper to generate relationship ID
export function getRelationshipId(trainerId: string, clientId: string): string {
    return `${trainerId}_${clientId}`
}

/**
 * Get the relationship between a trainer and client
 */
export async function getClientRelationship(
    trainerId: string,
    clientId: string
): Promise<ClientRelationship | null> {
    if (!db) return null

    try {
        const { doc, getDoc } = await import("firebase/firestore")

        const relationshipId = getRelationshipId(trainerId, clientId)
        const docRef = doc(db, "clientRelationships", relationshipId)
        const docSnap = await getDoc(docRef)

        if (!docSnap.exists()) {
            return null
        }

        const data = docSnap.data()
        return {
            id: docSnap.id,
            trainerId: data.trainerId,
            clientId: data.clientId,
            clientEmail: data.clientEmail,
            clientName: data.clientName,
            source: data.source,
            isRepeat: data.isRepeat || false,
            firstMarketplaceBookingId: data.firstMarketplaceBookingId || null,
            firstMarketplaceBookingDate: data.firstMarketplaceBookingDate?.toDate() || null,
            totalBookings: data.totalBookings || 0,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
        }
    } catch (error) {
        console.error("[ClientRelationshipService] getClientRelationship error:", error)
        return null
    }
}

/**
 * Determine the fee type for a booking
 * 
 * Logic:
 * - If relationship exists and source is "existing" → 0% (existing)
 * - If relationship exists and isRepeat is true → 5% (repeat)
 * - If no relationship or first marketplace booking → 15% (marketplace)
 */
export async function determineBookingFeeType(
    trainerId: string,
    clientId: string
): Promise<BookingFeeType> {
    const relationship = await getClientRelationship(trainerId, clientId)

    if (!relationship) {
        // New client from marketplace
        return "marketplace"
    }

    if (relationship.source === "existing") {
        // Trainer's pre-existing client
        return "existing"
    }

    if (relationship.isRepeat) {
        // Has completed at least one marketplace booking before
        return "repeat"
    }

    // First booking with this trainer through marketplace
    return "marketplace"
}

/**
 * Record a new marketplace booking
 * Called when a booking is created through the platform
 */
export async function recordMarketplaceBooking(
    trainerId: string,
    clientId: string,
    bookingId: string,
    clientEmail?: string,
    clientName?: string
): Promise<void> {
    if (!db) return

    try {
        const { doc, getDoc, setDoc, updateDoc, Timestamp } = await import("firebase/firestore")

        const relationshipId = getRelationshipId(trainerId, clientId)
        const docRef = doc(db, "clientRelationships", relationshipId)
        const docSnap = await getDoc(docRef)

        if (!docSnap.exists()) {
            // Create new relationship - first marketplace booking
            await setDoc(docRef, {
                trainerId,
                clientId,
                clientEmail: clientEmail || null,
                clientName: clientName || null,
                source: "marketplace",
                isRepeat: false,  // Will become true after first completed booking
                firstMarketplaceBookingId: bookingId,
                firstMarketplaceBookingDate: Timestamp.now(),
                totalBookings: 1,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            })
            console.log(`[ClientRelationshipService] Created new marketplace relationship: ${relationshipId}`)
        } else {
            // Update existing relationship
            const currentData = docSnap.data()
            await updateDoc(docRef, {
                totalBookings: (currentData.totalBookings || 0) + 1,
                clientEmail: clientEmail || currentData.clientEmail,
                clientName: clientName || currentData.clientName,
                updatedAt: Timestamp.now(),
            })
            console.log(`[ClientRelationshipService] Updated relationship: ${relationshipId}`)
        }
    } catch (error) {
        console.error("[ClientRelationshipService] recordMarketplaceBooking error:", error)
    }
}

/**
 * Mark relationship as repeat after first completed booking
 * Called when a marketplace booking is completed (paid + session done)
 */
export async function markAsRepeatClient(
    trainerId: string,
    clientId: string
): Promise<void> {
    if (!db) return

    try {
        const { doc, updateDoc, Timestamp } = await import("firebase/firestore")

        const relationshipId = getRelationshipId(trainerId, clientId)
        const docRef = doc(db, "clientRelationships", relationshipId)

        await updateDoc(docRef, {
            isRepeat: true,
            updatedAt: Timestamp.now(),
        })

        console.log(`[ClientRelationshipService] Marked as repeat: ${relationshipId}`)
    } catch (error) {
        console.error("[ClientRelationshipService] markAsRepeatClient error:", error)
    }
}

/**
 * Mark a client as existing (trainer's pre-existing client)
 * Used when trainer manually imports clients
 */
export async function markAsExistingClient(
    trainerId: string,
    clientId: string,
    clientEmail?: string,
    clientName?: string
): Promise<void> {
    if (!db) return

    try {
        const { doc, setDoc, Timestamp } = await import("firebase/firestore")

        const relationshipId = getRelationshipId(trainerId, clientId)
        const docRef = doc(db, "clientRelationships", relationshipId)

        await setDoc(docRef, {
            trainerId,
            clientId,
            clientEmail: clientEmail || null,
            clientName: clientName || null,
            source: "existing",
            isRepeat: false, // Not applicable for existing clients
            firstMarketplaceBookingId: null,
            firstMarketplaceBookingDate: null,
            totalBookings: 0,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        }, { merge: true })

        console.log(`[ClientRelationshipService] Marked as existing client: ${relationshipId}`)
    } catch (error) {
        console.error("[ClientRelationshipService] markAsExistingClient error:", error)
    }
}

/**
 * Check if a client email belongs to an existing client of this trainer
 * Useful for auto-detection when client signs up
 */
export async function isExistingClientByEmail(
    trainerId: string,
    clientEmail: string
): Promise<boolean> {
    if (!db) return false

    try {
        const { collection, query, where, getDocs } = await import("firebase/firestore")

        const q = query(
            collection(db, "clientRelationships"),
            where("trainerId", "==", trainerId),
            where("clientEmail", "==", clientEmail.toLowerCase()),
            where("source", "==", "existing")
        )

        const snapshot = await getDocs(q)
        return !snapshot.empty
    } catch (error) {
        console.error("[ClientRelationshipService] isExistingClientByEmail error:", error)
        return false
    }
}

/**
 * Get all relationships for a trainer
 * Used for trainer dashboard
 */
export async function getTrainerClientRelationships(
    trainerId: string
): Promise<ClientRelationship[]> {
    if (!db) return []

    try {
        const { collection, query, where, orderBy, getDocs } = await import("firebase/firestore")

        const q = query(
            collection(db, "clientRelationships"),
            where("trainerId", "==", trainerId),
            orderBy("updatedAt", "desc")
        )

        const snapshot = await getDocs(q)
        return snapshot.docs.map(doc => {
            const data = doc.data()
            return {
                id: doc.id,
                trainerId: data.trainerId,
                clientId: data.clientId,
                clientEmail: data.clientEmail,
                clientName: data.clientName,
                source: data.source,
                isRepeat: data.isRepeat || false,
                firstMarketplaceBookingId: data.firstMarketplaceBookingId || null,
                firstMarketplaceBookingDate: data.firstMarketplaceBookingDate?.toDate() || null,
                totalBookings: data.totalBookings || 0,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            }
        })
    } catch (error) {
        console.error("[ClientRelationshipService] getTrainerClientRelationships error:", error)
        return []
    }
}
