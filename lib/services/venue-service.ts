import { db } from "../firebase-config"
import { collection, query, where, getDocs, limit, orderBy, doc, getDoc, updateDoc, addDoc, increment, serverTimestamp } from "firebase/firestore"
import { Venue } from "../venue-data"

const VENUES_COLLECTION = "facilities"

export interface GeoPoint {
    lat: number
    lng: number
}

export const venueService = {
    /**
     * Fetch venues within a radius (in km) of a center point
     * Uses a bounding box approach for Firestore querying
     */
    async getVenuesNearby(
        center: GeoPoint,
        radiusKm: number = 50,
        sport?: string,
        limitCount: number = 20
    ): Promise<Venue[]> {
        if (!db) {
            console.warn("Firestore not initialized, falling back to local data")
            return []
        }

        // Calculate bounding box
        const latDelta = radiusKm / 111.12 // 1 deg lat ~ 111.12 km
        const lngDelta = radiusKm / (111.12 * Math.cos(center.lat * (Math.PI / 180)))

        const minLat = center.lat - latDelta
        const maxLat = center.lat + latDelta
        const minLng = center.lng - lngDelta
        const maxLng = center.lng + lngDelta

        try {
            let q = query(
                collection(db, VENUES_COLLECTION),
                where("lat", ">=", minLat),
                where("lat", "<=", maxLat)
            )

            if (sport) {
                // Note: Firestore requires composite index for inequality on 'lat' + equality on 'sport'
                // If index is missing, this might fail. We can filter by sport client-side if needed.
                // For now, let's try filtering client-side to avoid index issues during dev.
            }

            const snapshot = await getDocs(q)

            const venues: Venue[] = []

            snapshot.forEach((doc) => {
                const data = doc.data() as any

                // Client-side filtering for Longitude (Firestore limitation)
                if (data.lng >= minLng && data.lng <= maxLng) {
                    // Client-side filtering for Sport
                    if (sport && data.sport !== sport && !data.sportTypes?.includes(sport)) {
                        return
                    }

                    venues.push({
                        id: doc.id,
                        ...data,
                        // Calculate distance
                        distance: calculateDistance(center.lat, center.lng, data.lat, data.lng)
                    })
                }
            })

            // Sort by distance
            venues.sort((a, b) => (a.distance || 0) - (b.distance || 0))

            return venues.slice(0, limitCount)
        } catch (error) {
            console.error("Error fetching venues:", error)
            return []
        }
    },

    /**
   * Get a single venue by ID
   */
    async getVenueById(id: string): Promise<Venue | null> {
        if (!db) return null

        try {
            const docRef = doc(db, VENUES_COLLECTION, id)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as Venue
            }
        } catch (error) {
            console.error("Error fetching venue details:", error)
        }
        return null
    },

    /**
     * Check in to a venue
     */
    async checkIn(venueId: string, userId: string): Promise<boolean> {
        if (!db) return false

        try {
            const venueRef = doc(db, VENUES_COLLECTION, venueId)

            // 1. Increment active players
            await updateDoc(venueRef, {
                activePlayersNow: increment(1),
                lastActivityTimestamp: serverTimestamp()
            })

            // 2. Add to checkins subcollection
            await addDoc(collection(db, VENUES_COLLECTION, venueId, "checkins"), {
                userId,
                timestamp: serverTimestamp()
            })

            return true
        } catch (error) {
            console.error("Error checking in:", error)
            return false
        }
    },

    /**
     * Add a review to a venue
     */
    async addReview(venueId: string, userId: string, rating: number, text: string): Promise<boolean> {
        if (!db) return false

        try {
            const venueRef = doc(db, VENUES_COLLECTION, venueId)

            // 1. Add review to subcollection
            await addDoc(collection(db, VENUES_COLLECTION, venueId, "reviews"), {
                userId,
                rating,
                text,
                timestamp: serverTimestamp()
            })

            // 2. Update average rating (simplified: just updating count for now, 
            // ideally use a cloud function or transaction for average)
            await updateDoc(venueRef, {
                reviewCount: increment(1)
                // Note: Updating actual 'rating' average requires reading old average or using Cloud Functions
            })

            return true
        } catch (error) {
            console.error("Error adding review:", error)
            return false
        }
    },

    /**
     * Get active check-ins for a venue
     */
    async getVenueCheckIns(venueId: string): Promise<any[]> {
        if (!db) return []

        try {
            const checkInsRef = collection(db, VENUES_COLLECTION, venueId, "checkins")
            // Get check-ins from last 2 hours
            const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)

            const q = query(
                checkInsRef,
                where("timestamp", ">=", twoHoursAgo),
                orderBy("timestamp", "desc")
            )

            const snapshot = await getDocs(q)
            const checkIns: any[] = []

            snapshot.forEach((doc) => {
                checkIns.push({
                    id: doc.id,
                    ...doc.data()
                })
            })

            return checkIns
        } catch (error) {
            console.error("Error fetching check-ins:", error)
            return []
        }
    },

    /**
     * Get player alerts for a venue
     */
    async getVenueAlerts(venueId: string): Promise<any[]> {
        if (!db) return []

        try {
            const alertsRef = collection(db, VENUES_COLLECTION, venueId, "alerts")
            // Get alerts from last hour
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

            const q = query(
                alertsRef,
                where("timestamp", ">=", oneHourAgo),
                where("status", "==", "active"),
                orderBy("timestamp", "desc")
            )

            const snapshot = await getDocs(q)
            const alerts: any[] = []

            snapshot.forEach((doc) => {
                alerts.push({
                    id: doc.id,
                    ...doc.data()
                })
            })

            return alerts
        } catch (error) {
            console.error("Error fetching alerts:", error)
            return []
        }
    },

    /**
     * Create a "Need Players" alert for a venue
     */
    async createPlayerAlert(
        venueId: string,
        userId: string,
        userName: string,
        playersNeeded: number,
        skillLevel: string,
        sport: string,
        message?: string
    ): Promise<boolean> {
        if (!db) return false

        try {
            const alertsRef = collection(db, VENUES_COLLECTION, venueId, "alerts")

            // Create alert that expires in 2 hours
            const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000)

            await addDoc(alertsRef, {
                userId,
                userName,
                playersNeeded,
                skillLevel,
                sport,
                message: message || "",
                timestamp: serverTimestamp(),
                expiresAt,
                status: "active"
            })

            return true
        } catch (error) {
            console.error("Error creating player alert:", error)
            return false
        }
    },

    /**
     * Submit a facility report
     */
    async submitReport(
        venueId: string | null,
        userId: string,
        category: string,
        condition: string,
        details: string,
        crowdLevel?: string,
        ageGroup?: string,
        skillLevel?: string,
        photos?: string[]
    ): Promise<boolean> {
        if (!db) return false

        try {
            const reportsRef = collection(db, "reports")

            await addDoc(reportsRef, {
                venueId: venueId || null,
                userId,
                category,
                condition,
                details,
                crowdLevel: crowdLevel || null,
                ageGroup: ageGroup || null,
                skillLevel: skillLevel || null,
                photos: photos || [],
                timestamp: serverTimestamp(),
                status: "pending",
                verified: false
            })

            return true
        } catch (error) {
            console.error("Error submitting report:", error)
        }
    },

    /**
     * Propose a new venue (Crowdsourcing)
     */
    async submitVenueProposal(
        userId: string,
        name: string,
        sport: string,
        lat: number,
        lng: number,
        description: string,
        photos: string[]
    ): Promise<string | null> {
        if (!db) return null

        try {
            const proposalsRef = collection(db, "venue_proposals")

            const docRef = await addDoc(proposalsRef, {
                submittedBy: userId,
                name,
                sport, // Main sport
                lat,
                lng,
                description,
                photos,
                status: "pending_review",
                createdAt: serverTimestamp()
            })

            return docRef.id
        } catch (error) {
            console.error("Error submitting proposal:", error)
            return null
        }
    },

    /**
     * Get all venues (for global heat map)
     */
    async getAllVenues(limitCount: number = 500): Promise<Venue[]> {
        if (!db) return []

        try {
            const q = query(
                collection(db, VENUES_COLLECTION),
                limit(limitCount)
            )

            const snapshot = await getDocs(q)
            const venues: Venue[] = []

            snapshot.forEach((doc) => {
                venues.push({
                    id: doc.id,
                    ...doc.data()
                } as Venue)
            })

            return venues
        } catch (error) {
            console.error("Error fetching all venues:", error)
            return []
        }
    },

    /**
     * Get venues with real-time activity data (for heat map)
     * Uses ActivitySimulator for realistic player counts
     */
    async getVenuesWithActivity(): Promise<any[]> {
        const venues = await this.getAllVenues()
        const { ActivitySimulator } = await import('./activity-simulator')
        const simulator = ActivitySimulator.getInstance()

        // Add simulated activity to each venue
        const venuesWithActivity = venues.map(venue => {
            const activePlayersNow = simulator.generatePlayerCount(venue)

            return {
                ...venue,
                activePlayersNow,
                crowdLevel: simulator.getCrowdLevel(activePlayersNow),
            }
        })

        return venuesWithActivity
    }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959 // Radius of the earth in miles
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c // Distance in miles
}

function deg2rad(deg: number): number {
    return deg * (Math.PI / 180)
}
