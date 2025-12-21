/**
 * Share & Invite Service
 * 
 * The viral loop: "Going to play, who's in?"
 * One tap → Share link → Friends join
 */

import * as Sharing from "expo-sharing"
import * as Linking from "expo-linking"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { db } from "../firebase-config"
import {
    collection,
    addDoc,
    serverTimestamp,
    query,
    where,
    getDocs,
    doc,
    getDoc
} from "firebase/firestore"

// ============================================
// TYPES
// ============================================

export interface GameInvite {
    id: string
    venueId: string
    venueName: string
    sport: string
    hostId: string
    hostName: string
    time: Date
    message?: string
    respondents: string[]
    status: "open" | "full" | "cancelled" | "completed"
    createdAt: Date
}

export interface ShareLink {
    url: string
    type: "venue" | "invite" | "profile"
    payload: Record<string, string>
}

// ============================================
// MAIN SERVICE
// ============================================

class ShareInviteService {
    private static instance: ShareInviteService
    private baseUrl = "https://goodrunss.app"

    static getInstance(): ShareInviteService {
        if (!ShareInviteService.instance) {
            ShareInviteService.instance = new ShareInviteService()
        }
        return ShareInviteService.instance
    }

    // ============================================
    // CREATE GAME INVITE
    // ============================================

    async createGameInvite(
        venueId: string,
        venueName: string,
        sport: string,
        hostId: string,
        hostName: string,
        time: Date,
        message?: string
    ): Promise<GameInvite | null> {
        if (!db) return null

        try {
            const docRef = await addDoc(collection(db, "gameInvites"), {
                venueId,
                venueName,
                sport,
                hostId,
                hostName,
                time,
                message: message || "",
                respondents: [],
                status: "open",
                createdAt: serverTimestamp(),
            })

            return {
                id: docRef.id,
                venueId,
                venueName,
                sport,
                hostId,
                hostName,
                time,
                message,
                respondents: [],
                status: "open",
                createdAt: new Date(),
            }
        } catch (error) {
            console.error("[ShareInvite] Error creating invite:", error)
            return null
        }
    }

    // ============================================
    // GENERATE SHARE LINK
    // ============================================

    generateVenueLink(venueId: string, venueName: string): ShareLink {
        const params = new URLSearchParams({
            v: venueId,
            n: encodeURIComponent(venueName),
        })

        return {
            url: `${this.baseUrl}/venue?${params.toString()}`,
            type: "venue",
            payload: { venueId, venueName },
        }
    }

    generateInviteLink(invite: GameInvite): ShareLink {
        const params = new URLSearchParams({
            i: invite.id,
            v: invite.venueId,
            h: invite.hostName,
        })

        return {
            url: `${this.baseUrl}/join?${params.toString()}`,
            type: "invite",
            payload: {
                inviteId: invite.id,
                venueId: invite.venueId,
                hostName: invite.hostName,
            },
        }
    }

    // ============================================
    // SHARE FUNCTIONS
    // ============================================

    async shareVenue(venueId: string, venueName: string): Promise<boolean> {
        const link = this.generateVenueLink(venueId, venueName)
        const message = `Check out ${venueName} on GoodRunss\n${link.url}`

        return this.share(message)
    }

    async shareGameInvite(invite: GameInvite): Promise<boolean> {
        const link = this.generateInviteLink(invite)
        const timeStr = this.formatTime(invite.time)

        const message = invite.message
            ? `${invite.message}\n\n${timeStr} at ${invite.venueName}\n${link.url}`
            : `${invite.hostName} is heading to ${invite.venueName} at ${timeStr}. Who's in?\n${link.url}`

        return this.share(message)
    }

    async shareQuickInvite(
        venueId: string,
        venueName: string,
        sport: string,
        hostId: string,
        hostName: string
    ): Promise<boolean> {
        // Create invite for now
        const invite = await this.createGameInvite(
            venueId,
            venueName,
            sport,
            hostId,
            hostName,
            new Date()
        )

        if (!invite) {
            // Fallback to venue share
            return this.shareVenue(venueId, venueName)
        }

        return this.shareGameInvite(invite)
    }

    private async share(message: string): Promise<boolean> {
        try {
            if (await Sharing.isAvailableAsync()) {
                // Note: expo-sharing shares files, for text we use Linking
                await Linking.openURL(`sms:&body=${encodeURIComponent(message)}`)
                return true
            } else {
                console.log("[ShareInvite] Sharing not available")
                return false
            }
        } catch (error) {
            console.error("[ShareInvite] Share error:", error)
            return false
        }
    }

    // ============================================
    // GET INVITE
    // ============================================

    async getInvite(inviteId: string): Promise<GameInvite | null> {
        if (!db) return null

        try {
            const docRef = doc(db, "gameInvites", inviteId)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                const data = docSnap.data()
                return {
                    id: docSnap.id,
                    ...data,
                    time: data.time?.toDate?.() || new Date(),
                    createdAt: data.createdAt?.toDate?.() || new Date(),
                } as GameInvite
            }
        } catch (error) {
            console.error("[ShareInvite] Error getting invite:", error)
        }

        return null
    }

    // ============================================
    // RESPOND TO INVITE
    // ============================================

    async respondToInvite(inviteId: string, userId: string, response: "in" | "out"): Promise<boolean> {
        if (!db) return false

        try {
            const docRef = doc(db, "gameInvites", inviteId)
            const docSnap = await getDoc(docRef)

            if (!docSnap.exists()) return false

            const data = docSnap.data()
            const respondents = data.respondents || []

            if (response === "in" && !respondents.includes(userId)) {
                respondents.push(userId)
            } else if (response === "out") {
                const index = respondents.indexOf(userId)
                if (index > -1) respondents.splice(index, 1)
            }

            await addDoc(collection(db, "inviteResponses"), {
                inviteId,
                userId,
                response,
                timestamp: serverTimestamp(),
            })

            return true
        } catch (error) {
            console.error("[ShareInvite] Error responding:", error)
            return false
        }
    }

    // ============================================
    // HELPER
    // ============================================

    private formatTime(date: Date): string {
        return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    }
}

// ============================================
// EXPORTS
// ============================================

export const shareInviteService = ShareInviteService.getInstance()

export const shareVenue = (venueId: string, venueName: string) =>
    shareInviteService.shareVenue(venueId, venueName)

export const shareQuickInvite = (
    venueId: string,
    venueName: string,
    sport: string,
    hostId: string,
    hostName: string
) => shareInviteService.shareQuickInvite(venueId, venueName, sport, hostId, hostName)

export const getInvite = (inviteId: string) =>
    shareInviteService.getInvite(inviteId)

export const respondToInvite = (inviteId: string, userId: string, response: "in" | "out") =>
    shareInviteService.respondToInvite(inviteId, userId, response)
