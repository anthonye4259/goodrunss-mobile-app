/**
 * Court Integration Cloud Functions
 * 
 * Fully automated integration with CourtReserve, PodPlay, OpenCourt:
 * 1. Auto-sync courts on connect
 * 2. Background sync every 15 minutes
 * 3. Push bookings to external system on creation
 * 4. Receive webhooks for cancellations
 */

import * as functions from "firebase-functions"
import * as admin from "firebase-admin"

// ============================================
// TYPES
// ============================================

interface CourtIntegrationConfig {
    type: "courtreserve" | "podplay" | "opencourt" | "manual"
    apiKey?: string
    apiSecret?: string
    organizationId?: string  // CourtReserve / OpenCourt
    venueSlug?: string       // PodPlay
    isActive: boolean
    lastSyncAt?: string
    syncErrors?: string[]
}

interface ExternalCourt {
    externalId: string
    name: string
    sport: string
    indoor: boolean
    surface?: string
}

interface ExternalSlot {
    externalId: string
    courtId: string
    courtName: string
    date: string
    startTime: string
    endTime: string
    status: "available" | "booked" | "blocked"
    price?: number
}

// ============================================
// API CLIENTS
// ============================================

class CourtReserveAPI {
    private baseUrl = "https://api.courtreserve.com/v1"
    private apiKey: string
    private organizationId: string

    constructor(apiKey: string, organizationId: string) {
        this.apiKey = apiKey
        this.organizationId = organizationId
    }

    async getCourts(): Promise<ExternalCourt[]> {
        const response = await fetch(`${this.baseUrl}/courts`, {
            headers: {
                "Authorization": `Bearer ${this.apiKey}`,
                "X-Organization-Id": this.organizationId,
                "Content-Type": "application/json",
            },
        })

        if (!response.ok) throw new Error(`CourtReserve API error: ${response.status}`)

        const data = await response.json()
        return data.courts?.map((c: any) => ({
            externalId: c.id,
            name: c.name,
            sport: c.sport_type,
            indoor: c.indoor,
            surface: c.surface,
        })) || []
    }

    async getAvailability(date: string): Promise<ExternalSlot[]> {
        const response = await fetch(`${this.baseUrl}/availability?date=${date}`, {
            headers: {
                "Authorization": `Bearer ${this.apiKey}`,
                "X-Organization-Id": this.organizationId,
                "Content-Type": "application/json",
            },
        })

        if (!response.ok) throw new Error(`CourtReserve API error: ${response.status}`)

        const data = await response.json()
        return data.slots?.map((s: any) => ({
            externalId: s.id,
            courtId: s.court_id,
            courtName: s.court_name,
            date: s.date,
            startTime: s.start_time,
            endTime: s.end_time,
            status: s.is_available ? "available" : "booked",
            price: s.price_cents,
        })) || []
    }

    async createBooking(courtId: string, date: string, startTime: string, endTime: string, customerEmail: string): Promise<{ success: boolean; reservationId?: string; error?: string }> {
        try {
            const response = await fetch(`${this.baseUrl}/reservations`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this.apiKey}`,
                    "X-Organization-Id": this.organizationId,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    court_id: courtId,
                    date,
                    start_time: startTime,
                    end_time: endTime,
                    customer_email: customerEmail,
                    source: "goodrunss",
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                return { success: false, error: data.message || "Booking failed" }
            }

            return { success: true, reservationId: data.reservation_id }
        } catch (error: any) {
            return { success: false, error: error.message }
        }
    }

    async cancelBooking(reservationId: string): Promise<boolean> {
        const response = await fetch(`${this.baseUrl}/reservations/${reservationId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${this.apiKey}`,
                "X-Organization-Id": this.organizationId,
            },
        })
        return response.ok
    }
}

class PodPlayAPI {
    private baseUrl = "https://api.podplay.app/v1"
    private apiKey: string
    private venueSlug: string

    constructor(apiKey: string, venueSlug: string) {
        this.apiKey = apiKey
        this.venueSlug = venueSlug
    }

    async getCourts(): Promise<ExternalCourt[]> {
        const response = await fetch(`${this.baseUrl}/venues/${this.venueSlug}/courts`, {
            headers: {
                "X-API-Key": this.apiKey,
                "Content-Type": "application/json",
            },
        })

        if (!response.ok) throw new Error(`PodPlay API error: ${response.status}`)

        const data = await response.json()
        return data?.map((c: any) => ({
            externalId: c.id,
            name: c.display_name,
            sport: c.sport,
            indoor: c.is_indoor,
            surface: c.surface_type,
        })) || []
    }

    async getAvailability(date: string): Promise<ExternalSlot[]> {
        const response = await fetch(`${this.baseUrl}/venues/${this.venueSlug}/availability?date=${date}`, {
            headers: {
                "X-API-Key": this.apiKey,
                "Content-Type": "application/json",
            },
        })

        if (!response.ok) throw new Error(`PodPlay API error: ${response.status}`)

        const data = await response.json()
        return data.time_slots?.map((s: any) => ({
            externalId: s.slot_id,
            courtId: s.court_id,
            courtName: s.court_name,
            date,
            startTime: s.start,
            endTime: s.end,
            status: s.available ? "available" : "booked",
            price: s.price * 100, // Convert to cents
        })) || []
    }

    async createBooking(courtId: string, date: string, startTime: string, customerEmail: string): Promise<{ success: boolean; bookingId?: string; error?: string }> {
        try {
            const response = await fetch(`${this.baseUrl}/venues/${this.venueSlug}/bookings`, {
                method: "POST",
                headers: {
                    "X-API-Key": this.apiKey,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    court_id: courtId,
                    date,
                    time: startTime,
                    email: customerEmail,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                return { success: false, error: data.error || "Booking failed" }
            }

            return { success: true, bookingId: data.booking_id }
        } catch (error: any) {
            return { success: false, error: error.message }
        }
    }
}

class OpenCourtAPI {
    private baseUrl = "https://api.opencourt.co/v1"
    private apiKey: string
    private clubId: string

    constructor(apiKey: string, clubId: string) {
        this.apiKey = apiKey
        this.clubId = clubId
    }

    async getCourts(): Promise<ExternalCourt[]> {
        const response = await fetch(`${this.baseUrl}/clubs/${this.clubId}/courts`, {
            headers: {
                "Authorization": `Bearer ${this.apiKey}`,
                "Content-Type": "application/json",
            },
        })

        if (!response.ok) throw new Error(`OpenCourt API error: ${response.status}`)

        const data = await response.json()
        return data.courts?.map((c: any) => ({
            externalId: c.id,
            name: c.name,
            sport: c.sport_type || "Tennis",
            indoor: c.indoor || false,
            surface: c.surface,
        })) || []
    }

    async getAvailability(date: string): Promise<ExternalSlot[]> {
        const response = await fetch(`${this.baseUrl}/clubs/${this.clubId}/availability?date=${date}`, {
            headers: {
                "Authorization": `Bearer ${this.apiKey}`,
                "Content-Type": "application/json",
            },
        })

        if (!response.ok) throw new Error(`OpenCourt API error: ${response.status}`)

        const data = await response.json()
        return data.slots?.map((s: any) => ({
            externalId: s.id,
            courtId: s.court_id,
            courtName: s.court_name,
            date,
            startTime: s.start_time,
            endTime: s.end_time,
            status: s.available ? "available" : "booked",
            price: s.price_cents,
        })) || []
    }

    async createBooking(courtId: string, date: string, startTime: string, endTime: string, customerEmail: string): Promise<{ success: boolean; bookingId?: string; error?: string }> {
        try {
            const response = await fetch(`${this.baseUrl}/clubs/${this.clubId}/bookings`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    court_id: courtId,
                    date,
                    start_time: startTime,
                    end_time: endTime,
                    customer_email: customerEmail,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                return { success: false, error: data.message || "Booking failed" }
            }

            return { success: true, bookingId: data.booking_id }
        } catch (error: any) {
            return { success: false, error: error.message }
        }
    }
}

// ============================================
// HELPER: GET API CLIENT
// ============================================

function getApiClient(config: CourtIntegrationConfig): CourtReserveAPI | PodPlayAPI | OpenCourtAPI | null {
    switch (config.type) {
        case "courtreserve":
            if (!config.apiKey || !config.organizationId) return null
            return new CourtReserveAPI(config.apiKey, config.organizationId)
        case "podplay":
            if (!config.apiKey || !config.venueSlug) return null
            return new PodPlayAPI(config.apiKey, config.venueSlug)
        case "opencourt":
            if (!config.apiKey || !config.organizationId) return null
            return new OpenCourtAPI(config.apiKey, config.organizationId)
        default:
            return null
    }
}

// ============================================
// CLOUD FUNCTION: SYNC COURTS ON CONNECT
// ============================================

export const syncCourtsOnConnect = functions.firestore
    .document("facilityIntegrations/{facilityId}")
    .onWrite(async (change, context) => {
        const { facilityId } = context.params
        const after = change.after.data() as CourtIntegrationConfig | undefined

        // Only sync if integration is active and not manual
        if (!after || !after.isActive || after.type === "manual") {
            return
        }

        try {
            const client = getApiClient(after)
            if (!client) {
                functions.logger.error("Invalid integration config for facility:", facilityId)
                return
            }

            // Get all courts
            const courts = await client.getCourts()

            // Get availability for next 7 days
            const allSlots: ExternalSlot[] = []
            for (let i = 0; i < 7; i++) {
                const d = new Date()
                d.setDate(d.getDate() + i)
                const dateStr = d.toISOString().split("T")[0]

                const daySlots = await client.getAvailability(dateStr)
                allSlots.push(...daySlots)
            }

            // Store courts in Firestore
            const batch = admin.firestore().batch()

            // Clear existing synced courts
            const existingCourts = await admin.firestore()
                .collection("venues")
                .doc(facilityId)
                .collection("courts")
                .where("source", "==", "integration")
                .get()

            existingCourts.docs.forEach(doc => batch.delete(doc.ref))

            // Add new courts
            for (const court of courts) {
                const courtRef = admin.firestore()
                    .collection("venues")
                    .doc(facilityId)
                    .collection("courts")
                    .doc(court.externalId)

                batch.set(courtRef, {
                    ...court,
                    source: "integration",
                    integrationType: after.type,
                    syncedAt: admin.firestore.FieldValue.serverTimestamp(),
                })
            }

            // Store availability
            for (const slot of allSlots) {
                const slotRef = admin.firestore()
                    .collection("venues")
                    .doc(facilityId)
                    .collection("availability")
                    .doc(`${slot.date}_${slot.courtId}_${slot.startTime}`)

                batch.set(slotRef, {
                    ...slot,
                    source: "integration",
                    syncedAt: admin.firestore.FieldValue.serverTimestamp(),
                })
            }

            // Update last sync time
            batch.update(admin.firestore().collection("facilityIntegrations").doc(facilityId), {
                lastSyncAt: new Date().toISOString(),
                syncErrors: [],
            })

            await batch.commit()

            functions.logger.info("Courts synced", {
                facilityId,
                platform: after.type,
                courtCount: courts.length,
                slotCount: allSlots.length,
            })
        } catch (error: any) {
            functions.logger.error("Error syncing courts:", error)

            await admin.firestore()
                .collection("facilityIntegrations")
                .doc(facilityId)
                .update({
                    syncErrors: admin.firestore.FieldValue.arrayUnion(error.message),
                })
        }
    })

// ============================================
// CLOUD FUNCTION: SCHEDULED SYNC (Every 15 min)
// ============================================

export const scheduledCourtSync = functions.pubsub
    .schedule("every 15 minutes")
    .onRun(async () => {
        const integrations = await admin.firestore()
            .collection("facilityIntegrations")
            .where("isActive", "==", true)
            .get()

        for (const doc of integrations.docs) {
            const config = doc.data() as CourtIntegrationConfig
            if (config.type === "manual") continue

            try {
                const client = getApiClient(config)
                if (!client) continue

                // Sync availability for next 7 days
                const allSlots: ExternalSlot[] = []
                for (let i = 0; i < 7; i++) {
                    const d = new Date()
                    d.setDate(d.getDate() + i)
                    const dateStr = d.toISOString().split("T")[0]

                    const daySlots = await client.getAvailability(dateStr)
                    allSlots.push(...daySlots)
                }

                // Update availability in Firestore
                const batch = admin.firestore().batch()

                for (const slot of allSlots) {
                    const slotRef = admin.firestore()
                        .collection("venues")
                        .doc(doc.id)
                        .collection("availability")
                        .doc(`${slot.date}_${slot.courtId}_${slot.startTime}`)

                    batch.set(slotRef, {
                        ...slot,
                        source: "integration",
                        syncedAt: admin.firestore.FieldValue.serverTimestamp(),
                    }, { merge: true })
                }

                batch.update(doc.ref, {
                    lastSyncAt: new Date().toISOString(),
                })

                await batch.commit()

                functions.logger.info("Scheduled court sync completed", {
                    facilityId: doc.id,
                    slotCount: allSlots.length,
                })
            } catch (error: any) {
                functions.logger.error("Scheduled court sync error:", { facilityId: doc.id, error: error.message })
            }
        }
    })

// ============================================
// CLOUD FUNCTION: PUSH BOOKING ON CREATION
// ============================================

export const pushCourtBooking = functions.firestore
    .document("court_bookings/{bookingId}")
    .onCreate(async (snap, context) => {
        const booking = snap.data()
        const { bookingId } = context.params

        // Skip if not from a facility with integration
        if (!booking.venueId) {
            functions.logger.info("Booking has no venueId, skipping push")
            return
        }

        try {
            // Get facility integration config
            const integrationDoc = await admin.firestore()
                .collection("facilityIntegrations")
                .doc(booking.venueId)
                .get()

            if (!integrationDoc.exists) {
                functions.logger.info("No integration for facility, skipping push")
                return
            }

            const config = integrationDoc.data() as CourtIntegrationConfig
            if (!config.isActive || config.type === "manual") {
                return
            }

            const client = getApiClient(config)
            if (!client) {
                functions.logger.error("Could not create API client for booking push")
                return
            }

            // Get user info
            const userDoc = await admin.firestore()
                .collection("users")
                .doc(booking.userId)
                .get()
            const userData = userDoc.data() || {}
            const customerEmail = userData.email || booking.email || "guest@goodrunss.com"

            // Push to external system
            let result: { success: boolean; reservationId?: string; bookingId?: string; error?: string }

            if (client instanceof CourtReserveAPI) {
                result = await client.createBooking(
                    booking.courtId || booking.externalCourtId,
                    booking.date,
                    booking.startTime,
                    booking.endTime,
                    customerEmail
                )
            } else if (client instanceof PodPlayAPI) {
                result = await client.createBooking(
                    booking.courtId || booking.externalCourtId,
                    booking.date,
                    booking.startTime,
                    customerEmail
                )
            } else if (client instanceof OpenCourtAPI) {
                result = await client.createBooking(
                    booking.courtId || booking.externalCourtId,
                    booking.date,
                    booking.startTime,
                    booking.endTime,
                    customerEmail
                )
            } else {
                result = { success: false, error: "Unknown integration type" }
            }

            // Update booking with sync status
            await snap.ref.update({
                externalSyncStatus: result.success ? "synced" : "failed",
                externalBookingId: result.reservationId || result.bookingId || null,
                externalSyncError: result.error || null,
                externalSyncedAt: result.success ? admin.firestore.FieldValue.serverTimestamp() : null,
            })

            if (result.success) {
                functions.logger.info("Court booking pushed to external system", {
                    bookingId,
                    externalId: result.reservationId || result.bookingId,
                })
            } else {
                functions.logger.error("Failed to push court booking", {
                    bookingId,
                    error: result.error,
                })
            }
        } catch (error: any) {
            functions.logger.error("Error pushing court booking:", error)
            await snap.ref.update({
                externalSyncStatus: "error",
                externalSyncError: error.message,
            })
        }
    })

// ============================================
// HTTP WEBHOOK: Receive external updates
// ============================================

export const courtWebhook = functions.https.onRequest(async (req, res) => {
    if (req.method !== "POST") {
        res.status(405).send("Method not allowed")
        return
    }

    const { platform, event, data } = req.body

    try {
        switch (event) {
            case "reservation.cancelled":
                // External system cancelled a booking
                const bookingQuery = await admin.firestore()
                    .collection("court_bookings")
                    .where("externalBookingId", "==", data.reservationId || data.bookingId)
                    .limit(1)
                    .get()

                if (!bookingQuery.empty) {
                    await bookingQuery.docs[0].ref.update({
                        status: "cancelled",
                        cancelledBy: "external",
                        cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
                    })

                    // Trigger waitlist processing
                    // This is handled by the processSpotOpening function
                }
                break

            case "availability.updated":
                // Slot became available or unavailable
                const slotRef = admin.firestore()
                    .collection("venues")
                    .doc(data.facilityId)
                    .collection("availability")
                    .doc(`${data.date}_${data.courtId}_${data.startTime}`)

                await slotRef.update({
                    status: data.available ? "available" : "booked",
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                })
                break

            case "court.updated":
                // Court details changed
                const courtRef = admin.firestore()
                    .collection("venues")
                    .doc(data.facilityId)
                    .collection("courts")
                    .doc(data.courtId)

                await courtRef.update({
                    name: data.name,
                    surface: data.surface,
                    indoor: data.indoor,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                })
                break
        }

        res.status(200).json({ received: true })
    } catch (error: any) {
        functions.logger.error("Court webhook error:", error)
        res.status(500).json({ error: error.message })
    }
})
