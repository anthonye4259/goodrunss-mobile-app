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
    | "manual" // No integration, manual entry

export interface IntegrationConfig {
    type: IntegrationType
    apiKey?: string
    apiSecret?: string
    organizationId?: string  // For CourtReserve
    venueSlug?: string       // For PodPlay
    webhookSecret?: string
    isActive: boolean
    lastSyncAt?: string
    syncErrors?: string[]
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

    private getClient(config: IntegrationConfig): CourtReserveClient | PodPlayClient | null {
        switch (config.type) {
            case "courtreserve":
                if (!config.apiKey || !config.organizationId) return null
                return new CourtReserveClient(config.apiKey, config.organizationId)
            
            case "podplay":
                if (!config.apiKey || !config.venueSlug) return null
                return new PodPlayClient(config.apiKey, config.venueSlug)
            
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

            if (client instanceof CourtReserveClient) {
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
    // SUPPORTED INTEGRATIONS LIST
    // ============================================

    getSupportedIntegrations(): { id: IntegrationType; name: string; logo: string; apiDocsUrl: string }[] {
        return [
            {
                id: "courtreserve",
                name: "CourtReserve",
                logo: "https://courtreserve.com/logo.png",
                apiDocsUrl: "https://courtreserve.com/api-docs",
            },
            {
                id: "podplay",
                name: "PodPlay",
                logo: "https://podplay.app/logo.png",
                apiDocsUrl: "https://help.podplay.app/api-quickstart",
            },
            {
                id: "opencourt",
                name: "OpenCourt",
                logo: "https://opencourt.co/logo.png",
                apiDocsUrl: "https://opencourt.co/developers",
            },
            {
                id: "supersaas",
                name: "SuperSaaS",
                logo: "https://supersaas.com/logo.png",
                apiDocsUrl: "https://www.supersaas.com/info/dev",
            },
            {
                id: "omnify",
                name: "Omnify",
                logo: "https://getomnify.com/logo.png",
                apiDocsUrl: "https://getomnify.com/api",
            },
        ]
    }
}

export const externalIntegrationService = ExternalIntegrationService.getInstance()
