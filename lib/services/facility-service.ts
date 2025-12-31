/**
 * Facility Service
 * Handles facility claiming, management, and court availability
 */

import { db } from "../firebase-config"

// Firestore collection names
const FACILITIES_COLLECTION = "claimed_facilities"
const COURTS_COLLECTION = "courts"

export interface OperatingHours {
    [day: string]: {
        open: string
        close: string
        closed: boolean
    }
}

export type SubscriptionTier = "free" | "premium"
export type TeamRole = "owner" | "manager" | "staff"

// Team member for facility access delegation
export interface FacilityTeamMember {
    id: string
    email: string
    name: string
    role: TeamRole
    userId?: string // Linked Firebase user ID when accepted
    invitedAt: Date
    acceptedAt?: Date
    status: "pending" | "active"
}

export interface ClaimedFacility {
    id: string
    venueId: string // Reference to original venue
    ownerId: string // User who claimed it
    businessName: string
    businessPhone: string
    businessEmail: string
    address?: string
    city?: string
    state?: string
    zipCode?: string
    sports?: string[]
    verified: boolean
    verificationMethod?: "phone" | "email" | "document"
    stripeAccountId?: string // For Stripe Connect payouts
    takeRatePercent: number // 8% for free, 5% for premium

    // Visual Trust
    description?: string
    coverPhoto?: string
    amenities?: string[]

    // Operating Hours
    operatingHours?: OperatingHours
    blockedDates?: string[] // Holidays, maintenance

    // Subscription
    subscriptionTier: SubscriptionTier
    subscriptionExpiresAt?: Date
    stripeSubscriptionId?: string

    // Booking Settings
    autoAcceptBookings: boolean // If true, skip pending flow and confirm immediately

    // Notifications
    notifyOnBooking: boolean
    notifyOnCancellation: boolean
    dailySummary: boolean

    // Cancellation Policy
    cancellationWindowHours: number // e.g., 24 = refund if cancelled 24h before

    // Team (for employee access)
    team?: FacilityTeamMember[]

    createdAt: Date
    updatedAt: Date
}

export interface Court {
    id: string
    facilityId: string
    name: string // "Court 1", "Court A", etc.
    type: string // "Indoor", "Outdoor"
    surface?: string // "Hard", "Clay", "Grass"
    hourlyRate: number // In cents
    isActive: boolean
}

export interface TimeSlot {
    startTime: string // "09:00"
    endTime: string // "10:00"
    isAvailable: boolean
    bookingId?: string
}

export interface CourtAvailability {
    courtId: string
    date: string // "2025-12-25"
    slots: TimeSlot[]
}

export const facilityService = {
    /**
     * Claim a facility (owner registration)
     * Now supports auto-creating venue and extended options
     */
    async claimFacility(
        data: {
            venueId: string
            ownerId: string
            businessName: string
            businessPhone: string
            businessEmail: string
            address?: string
            city?: string
            state?: string
            zipCode?: string
            sports?: string[]
            operatingHours?: OperatingHours
        }
    ): Promise<string | null> {
        if (!db) {
            throw new Error("Database not available")
        }

        // Check if already claimed (skip for new venues)
        if (!data.venueId.startsWith("new-")) {
            const existingQuery = db.collection(FACILITIES_COLLECTION)
                .where("venueId", "==", data.venueId)
                .limit(1)

            const existing = await existingQuery.get()
            if (!existing.empty) {
                throw new Error("This facility has already been claimed")
            }
        }

        const facilityData: Omit<ClaimedFacility, "id"> = {
            venueId: data.venueId,
            ownerId: data.ownerId,
            businessName: data.businessName,
            businessPhone: data.businessPhone,
            businessEmail: data.businessEmail,
            address: data.address,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
            sports: data.sports,
            verified: false,
            takeRatePercent: 8, // Default 8%, 5% for premium
            operatingHours: data.operatingHours,
            subscriptionTier: "free",
            autoAcceptBookings: true, // Default to autopilot mode
            notifyOnBooking: true,
            notifyOnCancellation: true,
            dailySummary: false,
            cancellationWindowHours: 24,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        const docRef = await db.collection(FACILITIES_COLLECTION).add(facilityData)
        return docRef.id
    },

    /**
     * Get facilities owned by a user
     */
    async getFacilitiesByOwner(userId: string): Promise<ClaimedFacility[]> {
        if (!db) return []

        try {
            const query = db.collection(FACILITIES_COLLECTION)
                .where("ownerId", "==", userId)

            const snapshot = await query.get()
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
            })) as ClaimedFacility[]
        } catch (error) {
            console.error("Error getting facilities:", error)
            return []
        }
    },

    /**
     * Check if a venue has been claimed
     */
    async isVenueClaimed(venueId: string): Promise<boolean> {
        if (!db) return false

        try {
            const query = db.collection(FACILITIES_COLLECTION)
                .where("venueId", "==", venueId)
                .where("verified", "==", true)
                .limit(1)

            const snapshot = await query.get()
            return !snapshot.empty
        } catch (error) {
            console.error("Error checking claim:", error)
            return false
        }
    },

    /**
     * Get claimed facility by venue ID
     */
    async getClaimedFacility(venueId: string): Promise<ClaimedFacility | null> {
        if (!db) return null

        try {
            const query = db.collection(FACILITIES_COLLECTION)
                .where("venueId", "==", venueId)
                .limit(1)

            const snapshot = await query.get()
            if (snapshot.empty) return null

            const doc = snapshot.docs[0]
            return {
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
            } as ClaimedFacility
        } catch (error) {
            console.error("Error getting facility:", error)
            return null
        }
    },

    /**
     * Verify facility (after phone verification)
     */
    async verifyFacility(facilityId: string): Promise<boolean> {
        if (!db) return false

        try {
            await db.collection(FACILITIES_COLLECTION).doc(facilityId).update({
                verified: true,
                verificationMethod: "phone",
                updatedAt: new Date(),
            })
            return true
        } catch (error) {
            console.error("Error verifying facility:", error)
            return false
        }
    },

    /**
     * Add a court to a facility
     */
    async addCourt(
        facilityId: string,
        courtInfo: {
            name: string
            type: string
            surface?: string
            hourlyRate: number
        }
    ): Promise<string | null> {
        if (!db) return null

        try {
            const courtData: Omit<Court, "id"> = {
                facilityId,
                name: courtInfo.name,
                type: courtInfo.type,
                surface: courtInfo.surface,
                hourlyRate: courtInfo.hourlyRate,
                isActive: true,
            }

            const docRef = await db.collection(COURTS_COLLECTION).add(courtData)
            return docRef.id
        } catch (error) {
            console.error("Error adding court:", error)
            return null
        }
    },

    /**
     * Get courts for a facility
     */
    async getCourts(facilityId: string): Promise<Court[]> {
        if (!db) return []

        try {
            const query = db.collection(COURTS_COLLECTION)
                .where("facilityId", "==", facilityId)
                .where("isActive", "==", true)

            const snapshot = await query.get()
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as Court[]
        } catch (error) {
            console.error("Error getting courts:", error)
            return []
        }
    },

    /**
     * Update Stripe Connect account ID
     */
    async setStripeAccount(facilityId: string, stripeAccountId: string): Promise<boolean> {
        if (!db) return false

        try {
            await db.collection(FACILITIES_COLLECTION).doc(facilityId).update({
                stripeAccountId,
                updatedAt: new Date(),
            })
            return true
        } catch (error) {
            console.error("Error setting Stripe account:", error)
            return false
        }
    },

    /**
     * Update a court's details
     */
    async updateCourt(
        courtId: string,
        updates: {
            name?: string
            type?: string
            surface?: string
            hourlyRate?: number
        }
    ): Promise<boolean> {
        if (!db) return false

        try {
            await db.collection(COURTS_COLLECTION).doc(courtId).update(updates)
            return true
        } catch (error) {
            console.error("Error updating court:", error)
            return false
        }
    },

    /**
     * Delete (deactivate) a court
     */
    async deleteCourt(courtId: string): Promise<boolean> {
        if (!db) return false

        try {
            await db.collection(COURTS_COLLECTION).doc(courtId).update({
                isActive: false,
            })
            return true
        } catch (error) {
            console.error("Error deleting court:", error)
            return false
        }
    },

    /**
     * Check if a venue is claimed and by whom
     */
    async getClaimStatus(venueId: string): Promise<{
        isClaimed: boolean
        isOwnedByUser: boolean
        facilityId?: string
    }> {
        if (!db) return { isClaimed: false, isOwnedByUser: false }

        try {
            const query = db.collection(FACILITIES_COLLECTION)
                .where("venueId", "==", venueId)
                .limit(1)

            const snapshot = await query.get()
            if (snapshot.empty) {
                return { isClaimed: false, isOwnedByUser: false }
            }

            const doc = snapshot.docs[0]
            return {
                isClaimed: true,
                isOwnedByUser: false, // Caller needs to check this with their userId
                facilityId: doc.id,
            }
        } catch (error) {
            console.error("Error getting claim status:", error)
            return { isClaimed: false, isOwnedByUser: false }
        }
    },

    /**
     * Add a blocked date (holiday, maintenance, etc.)
     */
    async addBlockedDate(facilityId: string, date: string): Promise<boolean> {
        if (!db) return false

        try {
            const docRef = db.collection(FACILITIES_COLLECTION).doc(facilityId)
            const doc = await docRef.get()
            const currentDates = doc.data()?.blockedDates || []

            if (!currentDates.includes(date)) {
                await docRef.update({
                    blockedDates: [...currentDates, date],
                    updatedAt: new Date(),
                })
            }
            return true
        } catch (error) {
            console.error("Error adding blocked date:", error)
            return false
        }
    },

    /**
     * Remove a blocked date
     */
    async removeBlockedDate(facilityId: string, date: string): Promise<boolean> {
        if (!db) return false

        try {
            const docRef = db.collection(FACILITIES_COLLECTION).doc(facilityId)
            const doc = await docRef.get()
            const currentDates = doc.data()?.blockedDates || []

            await docRef.update({
                blockedDates: currentDates.filter((d: string) => d !== date),
                updatedAt: new Date(),
            })
            return true
        } catch (error) {
            console.error("Error removing blocked date:", error)
            return false
        }
    },

    /**
     * Update notification settings
     */
    async updateNotificationSettings(
        facilityId: string,
        settings: {
            notifyOnBooking?: boolean
            notifyOnCancellation?: boolean
            dailySummary?: boolean
        }
    ): Promise<boolean> {
        if (!db) return false

        try {
            await db.collection(FACILITIES_COLLECTION).doc(facilityId).update({
                ...settings,
                updatedAt: new Date(),
            })
            return true
        } catch (error) {
            console.error("Error updating notification settings:", error)
            return false
        }
    },

    /**
     * Update operating hours
     */
    async updateOperatingHours(
        facilityId: string,
        operatingHours: { [day: string]: { open: string; close: string; closed: boolean } }
    ): Promise<boolean> {
        if (!db) return false

        try {
            await db.collection(FACILITIES_COLLECTION).doc(facilityId).update({
                operatingHours,
                updatedAt: new Date(),
            })
            return true
        } catch (error) {
            console.error("Error updating operating hours:", error)
            return false
        }
    },

    /**
     * Update cancellation policy
     */
    async updateCancellationPolicy(
        facilityId: string,
        cancellationWindowHours: number
    ): Promise<boolean> {
        if (!db) return false

        try {
            await db.collection(FACILITIES_COLLECTION).doc(facilityId).update({
                cancellationWindowHours,
                updatedAt: new Date(),
            })
            return true
        } catch (error) {
            console.error("Error updating cancellation policy:", error)
            return false
        }
    },

    /**
     * Update auto-accept setting (autopilot mode)
     */
    async updateAutoAcceptSetting(
        facilityId: string,
        autoAccept: boolean
    ): Promise<boolean> {
        if (!db) return false

        try {
            await db.collection(FACILITIES_COLLECTION).doc(facilityId).update({
                autoAcceptBookings: autoAccept,
                updatedAt: new Date(),
            })
            return true
        } catch (error) {
            console.error("Error updating auto-accept:", error)
            return false
        }
    },

    /**
     * Invite a team member to the facility
     */
    async inviteTeamMember(
        facilityId: string,
        email: string,
        name: string,
        role: TeamRole
    ): Promise<string | null> {
        if (!db) return null

        try {
            const docRef = db.collection(FACILITIES_COLLECTION).doc(facilityId)
            const doc = await docRef.get()
            const currentTeam = doc.data()?.team || []

            // Check if already invited
            if (currentTeam.find((m: FacilityTeamMember) => m.email === email)) {
                console.warn("Team member already invited:", email)
                return null
            }

            const memberId = `member-${Date.now()}`
            const newMember: FacilityTeamMember = {
                id: memberId,
                email,
                name,
                role,
                invitedAt: new Date(),
                status: "pending",
            }

            await docRef.update({
                team: [...currentTeam, newMember],
                updatedAt: new Date(),
            })

            return memberId
        } catch (error) {
            console.error("Error inviting team member:", error)
            return null
        }
    },

    /**
     * Remove a team member
     */
    async removeTeamMember(facilityId: string, memberId: string): Promise<boolean> {
        if (!db) return false

        try {
            const docRef = db.collection(FACILITIES_COLLECTION).doc(facilityId)
            const doc = await docRef.get()
            const currentTeam = doc.data()?.team || []

            await docRef.update({
                team: currentTeam.filter((m: FacilityTeamMember) => m.id !== memberId),
                updatedAt: new Date(),
            })
            return true
        } catch (error) {
            console.error("Error removing team member:", error)
            return false
        }
    },

    /**
     * Update a team member's role
     */
    async updateTeamMemberRole(
        facilityId: string,
        memberId: string,
        newRole: TeamRole
    ): Promise<boolean> {
        if (!db) return false

        try {
            const docRef = db.collection(FACILITIES_COLLECTION).doc(facilityId)
            const doc = await docRef.get()
            const currentTeam = doc.data()?.team || []

            const updatedTeam = currentTeam.map((m: FacilityTeamMember) =>
                m.id === memberId ? { ...m, role: newRole } : m
            )

            await docRef.update({
                team: updatedTeam,
                updatedAt: new Date(),
            })
            return true
        } catch (error) {
            console.error("Error updating team role:", error)
            return false
        }
    },

    /**
     * Accept team invitation (link user to team member)
     */
    async acceptTeamInvite(
        facilityId: string,
        memberId: string,
        userId: string
    ): Promise<boolean> {
        if (!db) return false

        try {
            const docRef = db.collection(FACILITIES_COLLECTION).doc(facilityId)
            const doc = await docRef.get()
            const currentTeam = doc.data()?.team || []

            const updatedTeam = currentTeam.map((m: FacilityTeamMember) =>
                m.id === memberId
                    ? { ...m, userId, status: "active", acceptedAt: new Date() }
                    : m
            )

            await docRef.update({
                team: updatedTeam,
                updatedAt: new Date(),
            })
            return true
        } catch (error) {
            console.error("Error accepting invite:", error)
            return false
        }
    },

    /**
     * Get user's role for a facility (checks owner and team)
     */
    async getUserFacilityRole(
        userId: string,
        facilityId: string
    ): Promise<TeamRole | null> {
        if (!db) return null

        try {
            const docRef = db.collection(FACILITIES_COLLECTION).doc(facilityId)
            const doc = await docRef.get()
            if (!doc.exists) return null

            const data = doc.data()

            // Check if owner
            if (data?.ownerId === userId) return "owner"

            // Check team
            const teamMember = data?.team?.find(
                (m: FacilityTeamMember) => m.userId === userId && m.status === "active"
            )
            return teamMember?.role || null
        } catch (error) {
            console.error("Error getting user role:", error)
            return null
        }
    },

    /**
     * Get all facilities a user has access to (owner or team member)
     */
    async getUserAccessibleFacilities(userId: string): Promise<ClaimedFacility[]> {
        if (!db) return []

        try {
            // Get owned facilities
            const ownedQuery = db.collection(FACILITIES_COLLECTION)
                .where("ownerId", "==", userId)
            const ownedSnapshot = await ownedQuery.get()

            const owned = ownedSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
            })) as ClaimedFacility[]

            // Note: Firestore doesn't support array-contains with nested objects well
            // In production, you'd use a separate collection for team memberships
            // For now, we return just owned facilities
            return owned
        } catch (error) {
            console.error("Error getting accessible facilities:", error)
            return []
        }
    },

    /**
     * Update facility profile (Visual Trust Layer)
     */
    async updateFacilityProfile(
        facilityId: string,
        updates: {
            businessName?: string
            description?: string
            coverPhoto?: string
            amenities?: string[]
        }
    ): Promise<boolean> {
        if (!db) return false

        try {
            const updateData: any = {
                updatedAt: new Date()
            }
            if (updates.businessName) updateData.businessName = updates.businessName
            if (updates.description) updateData.description = updates.description
            if (updates.coverPhoto) updateData.coverPhoto = updates.coverPhoto
            if (updates.amenities) updateData.amenities = updates.amenities

            await db.collection(FACILITIES_COLLECTION).doc(facilityId).update(updateData)
            return true
        } catch (error) {
            console.error("Error updating facility profile:", error)
            return false
        }
    },
}

export default facilityService
