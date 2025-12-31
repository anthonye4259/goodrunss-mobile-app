/**
 * Live Session Service
 * 
 * Handles video call integration for live coaching sessions
 * Uses Daily.co for WebRTC video calls
 * 
 * Features:
 * - Create/join video rooms
 * - Session scheduling
 * - Recording support
 * - Session notes/feedback
 */

import { db, auth } from "@/lib/firebase-config"
import AsyncStorage from "@react-native-async-storage/async-storage"

// ============================================
// CONFIGURATION
// ============================================

// Daily.co API - In production, calls would go through your backend
const DAILY_API_URL = "https://api.daily.co/v1"
// Note: API key should be stored in environment variables on backend
// Frontend only receives room URLs, not API keys

// ============================================
// TYPES
// ============================================

export interface LiveSession {
    id: string
    bookingId: string
    trainerId: string
    playerId: string
    scheduledAt: string
    duration: number // minutes
    roomUrl: string
    roomName: string
    status: "scheduled" | "in_progress" | "completed" | "cancelled"
    recordingUrl?: string
    notes?: string
    createdAt: string
    startedAt?: string
    endedAt?: string
}

export interface DailyRoom {
    id: string
    name: string
    url: string
    created_at: string
    config: {
        max_participants?: number
        enable_recording?: boolean
        exp?: number // expiry timestamp
    }
}

// ============================================
// STORAGE
// ============================================

const STORAGE_KEYS = {
    MY_SESSIONS: "@goodrunss_live_sessions",
}

// ============================================
// LIVE SESSION SERVICE
// ============================================

class LiveSessionService {
    private static instance: LiveSessionService

    static getInstance(): LiveSessionService {
        if (!LiveSessionService.instance) {
            LiveSessionService.instance = new LiveSessionService()
        }
        return LiveSessionService.instance
    }

    /**
     * Create a video room for a session
     * In production, this would call your backend which calls Daily.co API
     */
    async createRoom(options: {
        bookingId: string
        trainerId: string
        playerId: string
        scheduledAt: string
        duration: number
    }): Promise<LiveSession> {
        const roomName = `session_${options.bookingId}_${Date.now()}`

        // In production: Call your backend to create Daily.co room
        // const response = await fetch(`${YOUR_BACKEND}/create-room`, { ... })

        // For now, create a mock room URL
        // Daily.co room URLs follow pattern: https://your-domain.daily.co/room-name
        const mockRoomUrl = `https://goodrunss.daily.co/${roomName}`

        const session: LiveSession = {
            id: `session_${Date.now()}`,
            bookingId: options.bookingId,
            trainerId: options.trainerId,
            playerId: options.playerId,
            scheduledAt: options.scheduledAt,
            duration: options.duration,
            roomUrl: mockRoomUrl,
            roomName,
            status: "scheduled",
            createdAt: new Date().toISOString(),
        }

        // Store locally
        await this.saveSession(session)

        // Sync to Firestore
        if (db) {
            try {
                const { doc, setDoc, collection } = await import("firebase/firestore")
                await setDoc(doc(collection(db, "live_sessions"), session.id), session)
            } catch (error) {
                console.error("Failed to sync session to Firestore:", error)
            }
        }

        return session
    }

    /**
     * Join a live session (generates meeting token)
     * Returns the URL to join with authentication
     */
    async joinSession(sessionId: string): Promise<{ url: string; token?: string } | null> {
        const sessions = await this.getMySessions()
        const session = sessions.find(s => s.id === sessionId)

        if (!session) {
            console.error("Session not found")
            return null
        }

        // In production: Call backend to generate a meeting token
        // const token = await fetch(`${YOUR_BACKEND}/get-meeting-token`, { sessionId })

        // For now, return room URL directly
        return {
            url: session.roomUrl,
            token: undefined, // Would be JWT from Daily.co in production
        }
    }

    /**
     * Start a session (update status)
     */
    async startSession(sessionId: string): Promise<LiveSession | null> {
        const sessions = await this.getMySessions()
        const index = sessions.findIndex(s => s.id === sessionId)

        if (index === -1) return null

        sessions[index] = {
            ...sessions[index],
            status: "in_progress",
            startedAt: new Date().toISOString(),
        }

        await this.saveSessions(sessions)
        return sessions[index]
    }

    /**
     * End a session
     */
    async endSession(sessionId: string, notes?: string): Promise<LiveSession | null> {
        const sessions = await this.getMySessions()
        const index = sessions.findIndex(s => s.id === sessionId)

        if (index === -1) return null

        sessions[index] = {
            ...sessions[index],
            status: "completed",
            endedAt: new Date().toISOString(),
            notes,
        }

        await this.saveSessions(sessions)
        return sessions[index]
    }

    /**
     * Cancel a session
     */
    async cancelSession(sessionId: string, reason?: string): Promise<boolean> {
        const sessions = await this.getMySessions()
        const index = sessions.findIndex(s => s.id === sessionId)

        if (index === -1) return false

        sessions[index] = {
            ...sessions[index],
            status: "cancelled",
            notes: reason,
        }

        await this.saveSessions(sessions)
        return true
    }

    /**
     * Get upcoming sessions for current user
     */
    async getUpcomingSessions(): Promise<LiveSession[]> {
        const sessions = await this.getMySessions()
        const now = new Date()

        return sessions
            .filter(s =>
                s.status === "scheduled" &&
                new Date(s.scheduledAt) > now
            )
            .sort((a, b) =>
                new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
            )
    }

    /**
     * Get past sessions
     */
    async getPastSessions(): Promise<LiveSession[]> {
        const sessions = await this.getMySessions()

        return sessions
            .filter(s => s.status === "completed")
            .sort((a, b) =>
                new Date(b.endedAt || b.scheduledAt).getTime() -
                new Date(a.endedAt || a.scheduledAt).getTime()
            )
    }

    /**
     * Check if session is joinable (within 15 min of start time)
     */
    isSessionJoinable(session: LiveSession): boolean {
        if (session.status !== "scheduled" && session.status !== "in_progress") {
            return false
        }

        const now = new Date()
        const scheduled = new Date(session.scheduledAt)
        const endTime = new Date(scheduled.getTime() + session.duration * 60 * 1000)

        // Can join 15 min before until end time
        const joinWindowStart = new Date(scheduled.getTime() - 15 * 60 * 1000)

        return now >= joinWindowStart && now <= endTime
    }

    /**
     * Get time until session starts (in minutes)
     */
    getTimeUntilSession(session: LiveSession): number {
        const now = new Date()
        const scheduled = new Date(session.scheduledAt)
        return Math.round((scheduled.getTime() - now.getTime()) / (60 * 1000))
    }

    // ============================================
    // STORAGE HELPERS
    // ============================================

    private async getMySessions(): Promise<LiveSession[]> {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.MY_SESSIONS)
        return stored ? JSON.parse(stored) : []
    }

    private async saveSession(session: LiveSession): Promise<void> {
        const sessions = await this.getMySessions()
        sessions.push(session)
        await this.saveSessions(sessions)
    }

    private async saveSessions(sessions: LiveSession[]): Promise<void> {
        await AsyncStorage.setItem(STORAGE_KEYS.MY_SESSIONS, JSON.stringify(sessions))
    }
}

export const liveSessionService = LiveSessionService.getInstance()

// ============================================
// DAILY.CO REACT NATIVE INTEGRATION NOTES
// ============================================
/*
To integrate Daily.co in React Native:

1. Install: npm install @daily-co/react-native-daily-js

2. In your LiveSessionLobby component:
   import Daily from '@daily-co/react-native-daily-js'
   
   const callFrame = Daily.createCallObject()
   await callFrame.join({ url: session.roomUrl, token: meetingToken })

3. Render participants:
   const { participants } = useParticipantIds()
   
4. Handle events:
   callFrame.on('joined-meeting', handleJoined)
   callFrame.on('left-meeting', handleLeft)
   callFrame.on('participant-joined', handleParticipantJoined)

5. Controls:
   callFrame.setLocalAudio(false) // mute
   callFrame.setLocalVideo(false) // camera off
   callFrame.leave() // end call
*/
