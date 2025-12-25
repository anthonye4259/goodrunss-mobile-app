/**
 * External Court Management Integrations
 * 
 * Syncs with existing facility management systems:
 * - CourtReserve
 * - PodPlay
 * - OpenCourt
 * - SuperSaaS
 * - Omnify
 * 
 * This allows facilities to use GoodRunss as a discovery/marketing channel
 * while keeping their existing booking system as the source of truth.
 */

import { db } from "@/lib/firebase-config"
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"

// ============================================
// INTEGRATION TYPES
// ============================================

export type IntegrationType =
    | "courtreserve"
    | "podplay"
    | "opencourt"
    | "supersaas"
    | "omnify"
    | "calendarsync"  // iCal/Google Calendar sync
    | "manual" // No integration, manual entry

export interface IntegrationConfig {
    type: IntegrationType
    apiKey?: string
    apiSecret?: string
    organizationId?: string  // For CourtReserve
    venueSlug?: string       // For PodPlay
    calendarUrl?: string     // For CalendarSync
    webhookSecret?: string
    isActive: boolean
    lastSyncAt?: string
    syncErrors?: string[]
    syncTrigger?: number     // For manual sync trigger
}

export interface ExternalBooking {
    externalId: string
    courtId: string
    courtName: string
    date: string           // YYYY-MM-DD
    startTime: string      // HH:MM
    endTime: string        // HH:MM
    status: "available" | "booked" | "blocked"
    bookedBy?: string
    price?: number         // in cents
}

export interface ExternalCourt {
    externalId: string
    name: string
    sport: string
    indoor: boolean
    surface?: string       // "hard", "clay", "grass"
}

// ============================================
// COURTRESERVE INTEGRATION
// ============================================

class CourtReserveClient {
    private baseUrl = "https://api.courtreserve.com/v1"
    private apiKey: string
    private organizationId: string

    constructor(apiKey: string, organizationId: string) {
        this.apiKey = apiKey
        this.organizationId = organizationId
    }

    private async request(endpoint: string, options: RequestInit = {}) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: {
                "Authorization": `Bearer ${this.apiKey}`,
                "Content-Type": "application/json",
                "X-Organization-Id": this.organizationId,
                ...options.headers,
            },
        })

        if (!response.ok) {
            throw new Error(`CourtReserve API error: ${response.status}`)
        }

        return response.json()
    }

    async getCourts(): Promise<ExternalCourt[]> {
        const data = await this.request("/courts")
        return data.courts.map((c: any) => ({
            externalId: c.id,
            name: c.name,
            sport: c.sport_type,
            indoor: c.indoor,
            surface: c.surface,
        }))
    }

    async getAvailability(date: string): Promise<ExternalBooking[]> {
        const data = await this.request(`/availability?date=${date}`)
        return data.slots.map((s: any) => ({
            externalId: s.id,
            courtId: s.court_id,
            courtName: s.court_name,
            date: s.date,
            startTime: s.start_time,
            endTime: s.end_time,
            status: s.is_available ? "available" : "booked",
            bookedBy: s.member_name,
            price: s.price_cents,
        }))
    }

    async createBooking(courtId: string, date: string, startTime: string, endTime: string, customerEmail: string): Promise<string> {
        const data = await this.request("/reservations", {
            method: "POST",
            body: JSON.stringify({
                court_id: courtId,
                date,
                start_time: startTime,
                end_time: endTime,
                customer_email: customerEmail,
            }),
        })
        return data.reservation_id
    }
}

// ============================================
// PODPLAY INTEGRATION
// ============================================

class PodPlayClient {
    private baseUrl = "https://api.podplay.app/v1"
    private apiKey: string
    private venueSlug: string

    constructor(apiKey: string, venueSlug: string) {
        this.apiKey = apiKey
        this.venueSlug = venueSlug
    }

    private async request(endpoint: string, options: RequestInit = {}) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: {
                "X-API-Key": this.apiKey,
                "Content-Type": "application/json",
                ...options.headers,
            },
        })

        if (!response.ok) {
            throw new Error(`PodPlay API error: ${response.status}`)
        }

        return response.json()
    }

    async getCourts(): Promise<ExternalCourt[]> {
        const data = await this.request(`/venues/${this.venueSlug}/courts`)
        return data.map((c: any) => ({
            externalId: c.id,
            name: c.display_name,
            sport: c.sport,
            indoor: c.is_indoor,
            surface: c.surface_type,
        }))
    }

    async getAvailability(date: string): Promise<ExternalBooking[]> {
        const data = await this.request(`/venues/${this.venueSlug}/availability?date=${date}`)
        return data.time_slots.map((s: any) => ({
            externalId: s.slot_id,
            courtId: s.court_id,
            courtName: s.court_name,
            date,
            startTime: s.start,
            endTime: s.end,
            status: s.available ? "available" : "booked",
            price: s.price * 100, // Convert to cents
        }))
    }

    async createBooking(courtId: string, date: string, startTime: string, customerEmail: string): Promise<string> {
        const data = await this.request(`/venues/${this.venueSlug}/bookings`, {
            method: "POST",
            body: JSON.stringify({
                court_id: courtId,
                date,
                time: startTime,
                email: customerEmail,
            }),
        })
        return data.booking_id
    }
}

// ============================================
// OPENCOURT INTEGRATION
// ============================================

class OpenCourtClient {
    private baseUrl = "https://api.opencourt.co/v1"
    private apiKey: string
    private clubId: string

    constructor(apiKey: string, clubId: string) {
        this.apiKey = apiKey
        this.clubId = clubId
    }

    private async request(endpoint: string, options: RequestInit = {}) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: {
                "Authorization": `Bearer ${this.apiKey}`,
                "Content-Type": "application/json",
                ...options.headers,
            },
        })

        if (!response.ok) {
            throw new Error(`OpenCourt API error: ${response.status}`)
        }

        return response.json()
    }

    async getCourts(): Promise<ExternalCourt[]> {
        const data = await this.request(`/clubs/${this.clubId}/courts`)
        return data.courts.map((c: any) => ({
            externalId: c.id,
            name: c.name,
            sport: c.sport_type || "Tennis",
            indoor: c.indoor || false,
            surface: c.surface,
        }))
    }

    async getAvailability(date: string): Promise<ExternalBooking[]> {
        const data = await this.request(`/clubs/${this.clubId}/availability?date=${date}`)
        return data.slots.map((s: any) => ({
            externalId: s.id,
            courtId: s.court_id,
            courtName: s.court_name,
            date,
            startTime: s.start_time,
            endTime: s.end_time,
            status: s.available ? "available" : "booked",
            price: s.price_cents,
        }))
    }

    async createBooking(courtId: string, date: string, startTime: string, endTime: string, customerEmail: string): Promise<string> {
        const data = await this.request(`/clubs/${this.clubId}/bookings`, {
            method: "POST",
            body: JSON.stringify({
                court_id: courtId,
                date,
                start_time: startTime,
                end_time: endTime,
                customer_email: customerEmail,
            }),
        })
        return data.booking_id
    }
}

// ============================================
// WELLNESS STUDIO INTEGRATIONS
// (ClassPass model: Mindbody, Glofox, Momence)
// ============================================

export interface WellnessClass {
    externalId: string
    name: string
    instructor: string
    startTime: string
    endTime: string
    date: string
    capacity: number
    spotsLeft: number
    category: string // yoga, pilates, spin, etc.
}

export interface WellnessIntegrationConfig {
    type: "mindbody" | "glofox" | "momence" | "calendarsync" | "manual"
    apiKey?: string
    siteId?: string        // Mindbody
    branchId?: string      // Glofox
    companyUuid?: string   // Momence
    calendarUrl?: string   // CalendarSync (iCal/Google)
    isActive: boolean
    lastSyncAt?: string
}

class MindbodyClient {
    private baseUrl = "https://api.mindbodyonline.com/public/v6"
    private apiKey: string
    private siteId: string

    constructor(apiKey: string, siteId: string) {
        this.apiKey = apiKey
        this.siteId = siteId
    }

    private async request(endpoint: string) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            headers: {
                "Api-Key": this.apiKey,
                "SiteId": this.siteId,
                "Content-Type": "application/json",
            },
        })

        if (!response.ok) {
            throw new Error(`Mindbody API error: ${response.status}`)
        }

        return response.json()
    }

    async getClasses(startDate: string, endDate: string): Promise<WellnessClass[]> {
        const data = await this.request(`/class/classes?startDate=${startDate}&endDate=${endDate}`)
        return data.Classes.map((c: any) => ({
            externalId: c.Id.toString(),
            name: c.ClassName,
            instructor: c.Staff?.Name || "TBD",
            startTime: c.StartDateTime,
            endTime: c.EndDateTime,
            date: c.StartDateTime.split("T")[0],
            capacity: c.MaxCapacity,
            spotsLeft: c.MaxCapacity - (c.TotalBooked || 0),
            category: c.ClassDescription?.Category || "fitness",
        }))
    }

    async bookClass(classId: string, clientId: string): Promise<string> {
        // Mindbody uses a visit-based booking system
        const response = await fetch(`${this.baseUrl}/class/addclienttoclass`, {
            method: "POST",
            headers: {
                "Api-Key": this.apiKey,
                "SiteId": this.siteId,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ClassId: classId,
                ClientId: clientId,
            }),
        })

        if (!response.ok) throw new Error("Booking failed")
        const data = await response.json()
        return data.Visit?.Id?.toString() || classId
    }
}

class GlofoxClient {
    private baseUrl = "https://api.glofox.com/v1"
    private apiKey: string
    private branchId: string

    constructor(apiKey: string, branchId: string) {
        this.apiKey = apiKey
        this.branchId = branchId
    }

    private async request(endpoint: string) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            headers: {
                "Authorization": `Bearer ${this.apiKey}`,
                "Content-Type": "application/json",
            },
        })

        if (!response.ok) throw new Error(`Glofox API error: ${response.status}`)
        return response.json()
    }

    async getClasses(date: string): Promise<WellnessClass[]> {
        const data = await this.request(`/branches/${this.branchId}/sessions?date=${date}`)
        return data.sessions.map((s: any) => ({
            externalId: s.id,
            name: s.name,
            instructor: s.instructor_name || "TBD",
            startTime: s.start_time,
            endTime: s.end_time,
            date,
            capacity: s.capacity,
            spotsLeft: s.spots_remaining,
            category: s.category || "fitness",
        }))
    }
}

class MomenceClient {
    private baseUrl = "https://api.momence.com/v1"
    private apiKey: string
    private companyUuid: string

    constructor(apiKey: string, companyUuid: string) {
        this.apiKey = apiKey
        this.companyUuid = companyUuid
    }

    private async request(endpoint: string) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            headers: {
                "X-API-Key": this.apiKey,
                "Content-Type": "application/json",
            },
        })

        if (!response.ok) throw new Error(`Momence API error: ${response.status}`)
        return response.json()
    }

    async getClasses(startDate: string, endDate: string): Promise<WellnessClass[]> {
        const data = await this.request(`/companies/${this.companyUuid}/classes?start=${startDate}&end=${endDate}`)
        return data.classes.map((c: any) => ({
            externalId: c.id,
            name: c.title,
            instructor: c.instructor?.name || "TBD",
            startTime: c.start_time,
            endTime: c.end_time,
            date: c.date,
            capacity: c.max_capacity,
            spotsLeft: c.spots_available,
            category: c.category || "yoga",
        }))
    }
}

// CalendarSync for studios without API integration
class CalendarSyncClient {
    private calendarUrl: string

    constructor(calendarUrl: string) {
        this.calendarUrl = calendarUrl
    }

    async getEvents(): Promise<WellnessClass[]> {
        // Fetch iCal/Google Calendar feed and parse events
        // In production, use a library like ical.js
        const response = await fetch(this.calendarUrl)
        const icsData = await response.text()

        // Basic parsing (production should use proper iCal parser)
        const events: WellnessClass[] = []
        // Parse VEVENT blocks...

        return events
    }
}

// ============================================
// MAIN INTEGRATION SERVICE
// ============================================

class ExternalIntegrationService {
    private static instance: ExternalIntegrationService

    static getInstance(): ExternalIntegrationService {
        if (!ExternalIntegrationService.instance) {
            ExternalIntegrationService.instance = new ExternalIntegrationService()
        }
        return ExternalIntegrationService.instance
    }

    // ============================================
    // CONFIG MANAGEMENT
    // ============================================

    async saveIntegrationConfig(facilityId: string, config: IntegrationConfig): Promise<void> {
        if (!db) return

        await setDoc(doc(db, "facilityIntegrations", facilityId), {
            ...config,
            updatedAt: serverTimestamp(),
        })
    }

    async getIntegrationConfig(facilityId: string): Promise<IntegrationConfig | null> {
        if (!db) return null

        const snap = await getDoc(doc(db, "facilityIntegrations", facilityId))
        if (snap.exists()) {
            return snap.data() as IntegrationConfig
        }
        return null
    }

    // ============================================
    // CLIENT FACTORY
    // ============================================

    private getClient(config: IntegrationConfig): CourtReserveClient | PodPlayClient | OpenCourtClient | null {
        switch (config.type) {
            case "courtreserve":
                if (!config.apiKey || !config.organizationId) return null
                return new CourtReserveClient(config.apiKey, config.organizationId)

            case "podplay":
                if (!config.apiKey || !config.venueSlug) return null
                return new PodPlayClient(config.apiKey, config.venueSlug)

            case "opencourt":
                if (!config.apiKey || !config.organizationId) return null
                return new OpenCourtClient(config.apiKey, config.organizationId)

            default:
                return null
        }
    }

    // ============================================
    // SYNC OPERATIONS
    // ============================================

    async syncCourts(facilityId: string): Promise<ExternalCourt[]> {
        const config = await this.getIntegrationConfig(facilityId)
        if (!config || !config.isActive) return []

        const client = this.getClient(config)
        if (!client) return []

        try {
            const courts = await client.getCourts()

            // Update last sync time
            await updateDoc(doc(db!, "facilityIntegrations", facilityId), {
                lastSyncAt: new Date().toISOString(),
            })

            return courts
        } catch (error) {
            console.error("Court sync error:", error)
            return []
        }
    }

    async getAvailability(facilityId: string, date: string): Promise<ExternalBooking[]> {
        const config = await this.getIntegrationConfig(facilityId)
        if (!config || !config.isActive) return []

        const client = this.getClient(config)
        if (!client) return []

        try {
            return await client.getAvailability(date)
        } catch (error) {
            console.error("Availability sync error:", error)
            return []
        }
    }

    async createExternalBooking(
        facilityId: string,
        courtId: string,
        date: string,
        startTime: string,
        endTime: string,
        customerEmail: string
    ): Promise<{ success: boolean; externalId?: string; error?: string }> {
        const config = await this.getIntegrationConfig(facilityId)
        if (!config || !config.isActive) {
            return { success: false, error: "Integration not configured" }
        }

        const client = this.getClient(config)
        if (!client) {
            return { success: false, error: "Invalid integration configuration" }
        }

        try {
            let externalId: string

            if (client instanceof CourtReserveClient || client instanceof OpenCourtClient) {
                externalId = await client.createBooking(courtId, date, startTime, endTime, customerEmail)
            } else {
                externalId = await client.createBooking(courtId, date, startTime, customerEmail)
            }

            return { success: true, externalId }
        } catch (error: any) {
            return { success: false, error: error.message }
        }
    }

    // ============================================
    // SUPPORTED INTEGRATIONS LIST (COURTS)
    // ============================================

    getSupportedIntegrations(): { id: IntegrationType | "calendarsync"; name: string; logo: string; apiDocsUrl: string; comingSoon: boolean; description: string }[] {
        return [
            {
                id: "calendarsync",
                name: "Calendar Sync",
                logo: "https://calendar.google.com/favicon.ico",
                apiDocsUrl: "",
                comingSoon: false,
                description: "Sync via iCal/Google Calendar URL (every hour)",
            },
            {
                id: "courtreserve",
                name: "CourtReserve",
                logo: "https://courtreserve.com/logo.png",
                apiDocsUrl: "https://courtreserve.com/api-docs",
                comingSoon: true,
                description: "Requires Scale or Enterprise plan",
            },
            {
                id: "podplay",
                name: "PodPlay",
                logo: "https://podplay.app/logo.png",
                apiDocsUrl: "https://help.podplay.app/api-quickstart",
                comingSoon: true,
                description: "Requires Professional plan",
            },
            {
                id: "opencourt",
                name: "OpenCourt",
                logo: "https://opencourt.co/logo.png",
                apiDocsUrl: "https://opencourt.co/contact",
                comingSoon: true,
                description: "API access by request",
            },
        ]
    }

    // ============================================
    // SUPPORTED INTEGRATIONS LIST (WELLNESS/CLASSPASS MODEL)
    // ============================================

    getSupportedWellnessIntegrations(): { id: string; name: string; logo: string; apiDocsUrl: string; method: string; comingSoon: boolean; description: string }[] {
        return [
            {
                id: "mindbody",
                name: "Mindbody",
                logo: "https://mindbodyonline.com/logo.png",
                apiDocsUrl: "https://developers.mindbodyonline.com",
                method: "API Integration",
                comingSoon: false,
                description: "Free under 5K calls/month",
            },
            {
                id: "calendarsync",
                name: "Calendar Sync",
                logo: "https://calendar.google.com/favicon.ico",
                apiDocsUrl: "",
                method: "iCal/Google Calendar URL",
                comingSoon: false,
                description: "Sync schedule via calendar URL (every hour)",
            },
            {
                id: "glofox",
                name: "Glofox",
                logo: "https://glofox.com/logo.png",
                apiDocsUrl: "https://support.glofox.com/api",
                method: "API Integration",
                comingSoon: true,
                description: "Requires Enterprise plan",
            },
            {
                id: "momence",
                name: "Momence",
                logo: "https://momence.com/logo.png",
                apiDocsUrl: "https://help.momence.com/integrations",
                method: "API Integration",
                comingSoon: true,
                description: "Coming soon",
            },
        ]
    }
}

export const externalIntegrationService = ExternalIntegrationService.getInstance()


