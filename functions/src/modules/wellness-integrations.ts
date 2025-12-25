/**
 * Wellness Integration Cloud Functions
 * 
 * Fully automated integration with Mindbody, Glofox, Momence:
 * 1. Auto-sync classes on connect
 * 2. Background sync every 30 minutes
 * 3. Push bookings to external system on creation
 * 4. Receive webhooks for cancellations
 */

import * as functions from "firebase-functions"
import * as admin from "firebase-admin"

// ============================================
// TYPES
// ============================================

interface WellnessIntegrationConfig {
    type: "mindbody" | "glofox" | "momence" | "calendarsync" | "manual"
    apiKey?: string
    siteId?: string        // Mindbody
    branchId?: string      // Glofox
    companyUuid?: string   // Momence
    calendarUrl?: string
    isActive: boolean
    lastSyncAt?: string
    syncErrors?: string[]
}

interface WellnessClass {
    externalId: string
    name: string
    instructor: string
    startTime: string
    endTime: string
    date: string
    capacity: number
    spotsLeft: number
    category: string
}

// ============================================
// API CLIENTS
// ============================================

class MindbodyAPI {
    private baseUrl = "https://api.mindbodyonline.com/public/v6"
    private apiKey: string
    private siteId: string

    constructor(apiKey: string, siteId: string) {
        this.apiKey = apiKey
        this.siteId = siteId
    }

    async getClasses(startDate: string, endDate: string): Promise<WellnessClass[]> {
        const response = await fetch(
            `${this.baseUrl}/class/classes?startDate=${startDate}&endDate=${endDate}`,
            {
                headers: {
                    "Api-Key": this.apiKey,
                    "SiteId": this.siteId,
                    "Content-Type": "application/json",
                },
            }
        )

        if (!response.ok) {
            throw new Error(`Mindbody API error: ${response.status}`)
        }

        const data = await response.json()
        return data.Classes?.map((c: any) => ({
            externalId: c.Id?.toString(),
            name: c.ClassName,
            instructor: c.Staff?.Name || "TBD",
            startTime: c.StartDateTime,
            endTime: c.EndDateTime,
            date: c.StartDateTime?.split("T")[0],
            capacity: c.MaxCapacity,
            spotsLeft: c.MaxCapacity - (c.TotalBooked || 0),
            category: c.ClassDescription?.Category || "fitness",
        })) || []
    }

    async bookClass(classId: string, clientId: string): Promise<{ success: boolean; visitId?: string; error?: string }> {
        try {
            const response = await fetch(`${this.baseUrl}/class/addclienttoclass`, {
                method: "POST",
                headers: {
                    "Api-Key": this.apiKey,
                    "SiteId": this.siteId,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ClassId: parseInt(classId),
                    ClientId: clientId,
                    RequirePayment: false,
                    Waitlist: false,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                return { success: false, error: data.Message || "Booking failed" }
            }

            return { success: true, visitId: data.Visit?.Id?.toString() }
        } catch (error: any) {
            return { success: false, error: error.message }
        }
    }

    async cancelBooking(visitId: string): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await fetch(`${this.baseUrl}/class/removeclientfromclass`, {
                method: "POST",
                headers: {
                    "Api-Key": this.apiKey,
                    "SiteId": this.siteId,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    VisitId: parseInt(visitId),
                }),
            })

            if (!response.ok) {
                const data = await response.json()
                return { success: false, error: data.Message }
            }

            return { success: true }
        } catch (error: any) {
            return { success: false, error: error.message }
        }
    }
}

class GlofoxAPI {
    private baseUrl = "https://api.glofox.com/v1"
    private apiKey: string
    private branchId: string

    constructor(apiKey: string, branchId: string) {
        this.apiKey = apiKey
        this.branchId = branchId
    }

    async getClasses(date: string): Promise<WellnessClass[]> {
        const response = await fetch(
            `${this.baseUrl}/branches/${this.branchId}/sessions?date=${date}`,
            {
                headers: {
                    "Authorization": `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json",
                },
            }
        )

        if (!response.ok) {
            throw new Error(`Glofox API error: ${response.status}`)
        }

        const data = await response.json()
        return data.sessions?.map((s: any) => ({
            externalId: s.id,
            name: s.name,
            instructor: s.instructor_name || "TBD",
            startTime: s.start_time,
            endTime: s.end_time,
            date,
            capacity: s.capacity,
            spotsLeft: s.spots_remaining,
            category: s.category || "fitness",
        })) || []
    }

    async bookClass(sessionId: string, memberId: string): Promise<{ success: boolean; bookingId?: string; error?: string }> {
        try {
            const response = await fetch(`${this.baseUrl}/sessions/${sessionId}/bookings`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    member_id: memberId,
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

class MomenceAPI {
    private baseUrl = "https://api.momence.com/v1"
    private apiKey: string
    private companyUuid: string

    constructor(apiKey: string, companyUuid: string) {
        this.apiKey = apiKey
        this.companyUuid = companyUuid
    }

    async getClasses(startDate: string, endDate: string): Promise<WellnessClass[]> {
        const response = await fetch(
            `${this.baseUrl}/companies/${this.companyUuid}/classes?start=${startDate}&end=${endDate}`,
            {
                headers: {
                    "X-API-Key": this.apiKey,
                    "Content-Type": "application/json",
                },
            }
        )

        if (!response.ok) {
            throw new Error(`Momence API error: ${response.status}`)
        }

        const data = await response.json()
        return data.classes?.map((c: any) => ({
            externalId: c.id,
            name: c.title,
            instructor: c.instructor?.name || "TBD",
            startTime: c.start_time,
            endTime: c.end_time,
            date: c.date,
            capacity: c.max_capacity,
            spotsLeft: c.spots_available,
            category: c.category || "yoga",
        })) || []
    }

    async bookClass(classId: string, email: string, name: string): Promise<{ success: boolean; bookingId?: string; error?: string }> {
        try {
            const response = await fetch(`${this.baseUrl}/classes/${classId}/registrations`, {
                method: "POST",
                headers: {
                    "X-API-Key": this.apiKey,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    name,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                return { success: false, error: data.message || "Booking failed" }
            }

            return { success: true, bookingId: data.registration_id }
        } catch (error: any) {
            return { success: false, error: error.message }
        }
    }
}

// ============================================
// HELPER: GET API CLIENT
// ============================================

function getApiClient(config: WellnessIntegrationConfig) {
    switch (config.type) {
        case "mindbody":
            if (!config.apiKey || !config.siteId) return null
            return new MindbodyAPI(config.apiKey, config.siteId)
        case "glofox":
            if (!config.apiKey || !config.branchId) return null
            return new GlofoxAPI(config.apiKey, config.branchId)
        case "momence":
            if (!config.apiKey || !config.companyUuid) return null
            return new MomenceAPI(config.apiKey, config.companyUuid)
        default:
            return null
    }
}

// ============================================
// CLOUD FUNCTION: SYNC CLASSES ON CONNECT
// ============================================

export const syncWellnessClassesOnConnect = functions.firestore
    .document("studioIntegrations/{studioId}")
    .onWrite(async (change, context) => {
        const { studioId } = context.params
        const after = change.after.data() as WellnessIntegrationConfig | undefined

        // Only sync if integration is active and not manual
        if (!after || !after.isActive || after.type === "manual" || after.type === "calendarsync") {
            return
        }

        try {
            const client = getApiClient(after)
            if (!client) {
                functions.logger.error("Invalid integration config for studio:", studioId)
                return
            }

            // Get classes for next 14 days
            const today = new Date()
            const endDate = new Date()
            endDate.setDate(today.getDate() + 14)

            const startStr = today.toISOString().split("T")[0]
            const endStr = endDate.toISOString().split("T")[0]

            let classes: WellnessClass[] = []

            if (client instanceof MindbodyAPI || client instanceof MomenceAPI) {
                classes = await client.getClasses(startStr, endStr)
            } else if (client instanceof GlofoxAPI) {
                // Glofox needs day-by-day fetching
                for (let d = new Date(today); d <= endDate; d.setDate(d.getDate() + 1)) {
                    const dayStr = d.toISOString().split("T")[0]
                    const dayClasses = await client.getClasses(dayStr)
                    classes.push(...dayClasses)
                }
            }

            // Store classes in Firestore
            const batch = admin.firestore().batch()

            // Clear existing synced classes
            const existingClasses = await admin.firestore()
                .collection("studios")
                .doc(studioId)
                .collection("classes")
                .where("source", "==", "integration")
                .get()

            existingClasses.docs.forEach(doc => batch.delete(doc.ref))

            // Add new classes
            for (const cls of classes) {
                const classRef = admin.firestore()
                    .collection("studios")
                    .doc(studioId)
                    .collection("classes")
                    .doc(cls.externalId)

                batch.set(classRef, {
                    ...cls,
                    source: "integration",
                    integrationType: after.type,
                    syncedAt: admin.firestore.FieldValue.serverTimestamp(),
                })
            }

            // Update last sync time
            batch.update(admin.firestore().collection("studioIntegrations").doc(studioId), {
                lastSyncAt: new Date().toISOString(),
                syncErrors: [],
            })

            await batch.commit()

            functions.logger.info("Wellness classes synced", {
                studioId,
                platform: after.type,
                classCount: classes.length,
            })
        } catch (error: any) {
            functions.logger.error("Error syncing wellness classes:", error)

            // Store error
            await admin.firestore()
                .collection("studioIntegrations")
                .doc(studioId)
                .update({
                    syncErrors: admin.firestore.FieldValue.arrayUnion(error.message),
                })
        }
    })

// ============================================
// CLOUD FUNCTION: SCHEDULED SYNC (Every 30 min)
// ============================================

export const scheduledWellnessSync = functions.pubsub
    .schedule("every 30 minutes")
    .onRun(async () => {
        const integrations = await admin.firestore()
            .collection("studioIntegrations")
            .where("isActive", "==", true)
            .get()

        for (const doc of integrations.docs) {
            const config = doc.data() as WellnessIntegrationConfig
            if (config.type === "manual" || config.type === "calendarsync") continue

            try {
                const client = getApiClient(config)
                if (!client) continue

                const today = new Date()
                const endDate = new Date()
                endDate.setDate(today.getDate() + 14)

                const startStr = today.toISOString().split("T")[0]
                const endStr = endDate.toISOString().split("T")[0]

                let classes: WellnessClass[] = []

                if (client instanceof MindbodyAPI || client instanceof MomenceAPI) {
                    classes = await client.getClasses(startStr, endStr)
                } else if (client instanceof GlofoxAPI) {
                    for (let d = new Date(today); d <= endDate; d.setDate(d.getDate() + 1)) {
                        const dayStr = d.toISOString().split("T")[0]
                        const dayClasses = await client.getClasses(dayStr)
                        classes.push(...dayClasses)
                    }
                }

                // Update classes in Firestore
                const batch = admin.firestore().batch()

                for (const cls of classes) {
                    const classRef = admin.firestore()
                        .collection("studios")
                        .doc(doc.id)
                        .collection("classes")
                        .doc(cls.externalId)

                    batch.set(classRef, {
                        ...cls,
                        source: "integration",
                        integrationType: config.type,
                        syncedAt: admin.firestore.FieldValue.serverTimestamp(),
                    }, { merge: true })
                }

                batch.update(doc.ref, {
                    lastSyncAt: new Date().toISOString(),
                })

                await batch.commit()

                functions.logger.info("Scheduled sync completed", {
                    studioId: doc.id,
                    classCount: classes.length,
                })
            } catch (error: any) {
                functions.logger.error("Scheduled sync error:", { studioId: doc.id, error: error.message })
            }
        }
    })

// ============================================
// CLOUD FUNCTION: HOURLY CALENDAR SYNC (iCal)
// ============================================

export const hourlyCalendarSync = functions.pubsub
    .schedule("every 1 hours")
    .onRun(async () => {
        // Sync both wellness and court calendar integrations

        // Wellness calendars
        const wellnessIntegrations = await admin.firestore()
            .collection("studioIntegrations")
            .where("isActive", "==", true)
            .where("type", "==", "calendarsync")
            .get()

        for (const doc of wellnessIntegrations.docs) {
            const config = doc.data()
            if (!config.calendarUrl) continue

            try {
                // Fetch and parse iCal
                const response = await fetch(config.calendarUrl)
                if (!response.ok) {
                    throw new Error(`Calendar fetch failed: ${response.status}`)
                }

                const icalText = await response.text()
                const events = parseICalEvents(icalText)

                // Store events as classes
                const batch = admin.firestore().batch()

                for (const event of events) {
                    const classRef = admin.firestore()
                        .collection("studios")
                        .doc(doc.id)
                        .collection("classes")
                        .doc(event.uid)

                    batch.set(classRef, {
                        externalId: event.uid,
                        name: event.summary,
                        instructor: event.organizer || "TBD",
                        startTime: event.start,
                        endTime: event.end,
                        date: event.start.split("T")[0],
                        description: event.description,
                        location: event.location,
                        source: "calendar",
                        integrationType: "calendarsync",
                        syncedAt: admin.firestore.FieldValue.serverTimestamp(),
                    }, { merge: true })
                }

                batch.update(doc.ref, {
                    lastSyncAt: new Date().toISOString(),
                })

                await batch.commit()

                functions.logger.info("Calendar sync completed", {
                    studioId: doc.id,
                    eventCount: events.length,
                })
            } catch (error: any) {
                functions.logger.error("Calendar sync error:", { studioId: doc.id, error: error.message })
                await doc.ref.update({
                    syncErrors: admin.firestore.FieldValue.arrayUnion(error.message),
                })
            }
        }

        // Court calendars (facilityIntegrations)
        const courtIntegrations = await admin.firestore()
            .collection("facilityIntegrations")
            .where("isActive", "==", true)
            .where("type", "==", "calendarsync")
            .get()

        for (const doc of courtIntegrations.docs) {
            const config = doc.data()
            if (!config.calendarUrl) continue

            try {
                const response = await fetch(config.calendarUrl)
                if (!response.ok) {
                    throw new Error(`Calendar fetch failed: ${response.status}`)
                }

                const icalText = await response.text()
                const events = parseICalEvents(icalText)

                const batch = admin.firestore().batch()

                for (const event of events) {
                    // Events = blocked times / existing bookings
                    const slotRef = admin.firestore()
                        .collection("venues")
                        .doc(doc.id)
                        .collection("availability")
                        .doc(event.uid)

                    batch.set(slotRef, {
                        externalId: event.uid,
                        date: event.start.split("T")[0],
                        startTime: event.start,
                        endTime: event.end,
                        status: "blocked",
                        title: event.summary,
                        source: "calendar",
                        syncedAt: admin.firestore.FieldValue.serverTimestamp(),
                    }, { merge: true })
                }

                batch.update(doc.ref, {
                    lastSyncAt: new Date().toISOString(),
                })

                await batch.commit()

                functions.logger.info("Court calendar sync completed", {
                    facilityId: doc.id,
                    eventCount: events.length,
                })
            } catch (error: any) {
                functions.logger.error("Court calendar sync error:", { facilityId: doc.id, error: error.message })
            }
        }
    })

// Simple iCal parser
function parseICalEvents(icalText: string): Array<{
    uid: string
    summary: string
    start: string
    end: string
    description?: string
    location?: string
    organizer?: string
}> {
    const events: Array<any> = []
    const lines = icalText.split(/\r?\n/)
    let currentEvent: any = null

    for (const line of lines) {
        if (line === "BEGIN:VEVENT") {
            currentEvent = {}
        } else if (line === "END:VEVENT" && currentEvent) {
            if (currentEvent.uid && currentEvent.start) {
                events.push(currentEvent)
            }
            currentEvent = null
        } else if (currentEvent) {
            const [key, ...valueParts] = line.split(":")
            const value = valueParts.join(":")
            const cleanKey = key.split(";")[0]

            switch (cleanKey) {
                case "UID":
                    currentEvent.uid = value
                    break
                case "SUMMARY":
                    currentEvent.summary = value
                    break
                case "DTSTART":
                    currentEvent.start = parseICalDate(value)
                    break
                case "DTEND":
                    currentEvent.end = parseICalDate(value)
                    break
                case "DESCRIPTION":
                    currentEvent.description = value
                    break
                case "LOCATION":
                    currentEvent.location = value
                    break
                case "ORGANIZER":
                    currentEvent.organizer = value.replace(/.*CN=([^;:]+).*/, "$1")
                    break
            }
        }
    }

    return events
}

function parseICalDate(value: string): string {
    // Handle formats like 20241225T140000Z or 20241225
    if (value.includes("T")) {
        const year = value.substring(0, 4)
        const month = value.substring(4, 6)
        const day = value.substring(6, 8)
        const hour = value.substring(9, 11)
        const min = value.substring(11, 13)
        return `${year}-${month}-${day}T${hour}:${min}:00`
    } else {
        const year = value.substring(0, 4)
        const month = value.substring(4, 6)
        const day = value.substring(6, 8)
        return `${year}-${month}-${day}T00:00:00`
    }
}

// ============================================
// CLOUD FUNCTION: PUSH BOOKING ON CREATION
// ============================================

export const pushWellnessBooking = functions.firestore
    .document("class_bookings/{bookingId}")
    .onCreate(async (snap, context) => {
        const booking = snap.data()
        const { bookingId } = context.params

        // Skip if not from a class with integration
        if (!booking.studioId || !booking.externalClassId) {
            functions.logger.info("Booking not from integrated class, skipping push")
            return
        }

        try {
            // Get studio integration config
            const integrationDoc = await admin.firestore()
                .collection("studioIntegrations")
                .doc(booking.studioId)
                .get()

            if (!integrationDoc.exists) {
                functions.logger.info("No integration for studio, skipping push")
                return
            }

            const config = integrationDoc.data() as WellnessIntegrationConfig
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

            // Push to external system
            let result: { success: boolean; bookingId?: string; visitId?: string; error?: string }

            if (client instanceof MindbodyAPI) {
                // Mindbody needs a client ID - create on their side if needed
                result = await client.bookClass(
                    booking.externalClassId,
                    userData.mindbodyClientId || booking.userId
                )
            } else if (client instanceof GlofoxAPI) {
                result = await client.bookClass(
                    booking.externalClassId,
                    userData.glofoxMemberId || booking.userId
                )
            } else if (client instanceof MomenceAPI) {
                result = await client.bookClass(
                    booking.externalClassId,
                    userData.email || booking.email,
                    userData.name || booking.userName
                )
            } else {
                result = { success: false, error: "Unknown integration type" }
            }

            // Update booking with sync status
            await snap.ref.update({
                externalSyncStatus: result.success ? "synced" : "failed",
                externalBookingId: result.bookingId || result.visitId || null,
                externalSyncError: result.error || null,
                externalSyncedAt: result.success ? admin.firestore.FieldValue.serverTimestamp() : null,
            })

            if (result.success) {
                functions.logger.info("Booking pushed to external system", {
                    bookingId,
                    externalId: result.bookingId || result.visitId,
                })
            } else {
                functions.logger.error("Failed to push booking", {
                    bookingId,
                    error: result.error,
                })
            }
        } catch (error: any) {
            functions.logger.error("Error pushing booking:", error)
            await snap.ref.update({
                externalSyncStatus: "error",
                externalSyncError: error.message,
            })
        }
    })

// ============================================
// HTTP WEBHOOK: Receive external updates
// ============================================

export const wellnessWebhook = functions.https.onRequest(async (req, res) => {
    if (req.method !== "POST") {
        res.status(405).send("Method not allowed")
        return
    }

    const { platform: _platform, event, data } = req.body

    try {
        switch (event) {
            case "booking.cancelled":
                // External system cancelled a booking
                const bookingQuery = await admin.firestore()
                    .collection("class_bookings")
                    .where("externalBookingId", "==", data.bookingId)
                    .limit(1)
                    .get()

                if (!bookingQuery.empty) {
                    await bookingQuery.docs[0].ref.update({
                        status: "cancelled",
                        cancelledBy: "external",
                        cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
                    })

                    // Refund if applicable
                    // TODO: Handle refund logic
                }
                break

            case "class.updated":
                // Class details changed (time, instructor, etc.)
                const classRef = admin.firestore()
                    .collection("studios")
                    .doc(data.studioId)
                    .collection("classes")
                    .doc(data.classId)

                await classRef.update({
                    name: data.name,
                    instructor: data.instructor,
                    startTime: data.startTime,
                    endTime: data.endTime,
                    spotsLeft: data.spotsLeft,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                })
                break

            case "class.cancelled":
                // Class was cancelled entirely
                // Notify all booked users
                const classBookings = await admin.firestore()
                    .collection("class_bookings")
                    .where("externalClassId", "==", data.classId)
                    .where("status", "==", "confirmed")
                    .get()

                for (const booking of classBookings.docs) {
                    await booking.ref.update({
                        status: "cancelled",
                        cancelledBy: "studio",
                        cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
                    })

                    // Send push notification
                    const bookingData = booking.data()
                    const userTokens = await admin.firestore()
                        .collection("users")
                        .doc(bookingData.userId)
                        .collection("deviceTokens")
                        .get()

                    const tokens = userTokens.docs.map(d => d.data().token).filter(Boolean)
                    if (tokens.length > 0) {
                        await admin.messaging().sendEachForMulticast({
                            notification: {
                                title: "Class Cancelled",
                                body: `${data.className} has been cancelled. You'll be refunded.`,
                            },
                            data: {
                                type: "class_cancelled",
                                bookingId: booking.id,
                            },
                            tokens,
                        })
                    }
                }
                break
        }

        res.status(200).json({ received: true })
    } catch (error: any) {
        functions.logger.error("Webhook error:", error)
        res.status(500).json({ error: error.message })
    }
})
