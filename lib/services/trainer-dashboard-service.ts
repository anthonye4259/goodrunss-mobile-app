/**
 * Trainer Dashboard Service
 * 
 * Manages trainer CRM functionality:
 * - Client management
 * - Session tracking
 * - Revenue analytics
 */

import { db } from "@/lib/firebase-config"
import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
} from "firebase/firestore"
import { getAuth } from "firebase/auth"

// ============================================
// TYPES
// ============================================

export interface Client {
    id: string
    trainerId: string
    name: string
    phone?: string
    email?: string
    avatar?: string
    joinedAt: string
    totalSessions: number
    totalSpent: number
    lastSessionAt?: string
    status: "active" | "inactive" | "lead"
    notes?: string
    tags?: string[]
}

export interface DashboardStats {
    totalClients: number
    activeClients: number
    totalRevenue: number
    monthlyRevenue: number
    upcomingSessions: number
    completedSessions: number
}

// ============================================
// CLIENT MANAGEMENT
// ============================================

class TrainerDashboardService {
    private getCurrentUserId(): string | null {
        const auth = getAuth()
        return auth.currentUser?.uid || null
    }

    async addClient(clientData: Omit<Client, "id" | "trainerId">): Promise<string | null> {
        const trainerId = this.getCurrentUserId()
        if (!trainerId || !db) return null

        try {
            const docRef = await addDoc(collection(db, "trainer_clients"), {
                ...clientData,
                trainerId,
                createdAt: Timestamp.now(),
            })
            return docRef.id
        } catch (error) {
            console.error("Error adding client:", error)
            return null
        }
    }

    async getClients(): Promise<Client[]> {
        const trainerId = this.getCurrentUserId()
        if (!trainerId || !db) return []

        try {
            const q = query(
                collection(db, "trainer_clients"),
                where("trainerId", "==", trainerId),
                orderBy("name")
            )
            const snapshot = await getDocs(q)
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as Client[]
        } catch (error) {
            console.error("Error getting clients:", error)
            return []
        }
    }

    async getClient(clientId: string): Promise<Client | null> {
        if (!db) return null

        try {
            const docRef = doc(db, "trainer_clients", clientId)
            const snapshot = await getDoc(docRef)
            if (!snapshot.exists()) return null
            return { id: snapshot.id, ...snapshot.data() } as Client
        } catch (error) {
            console.error("Error getting client:", error)
            return null
        }
    }

    async updateClient(clientId: string, updates: Partial<Client>): Promise<boolean> {
        if (!db) return false

        try {
            const docRef = doc(db, "trainer_clients", clientId)
            await updateDoc(docRef, {
                ...updates,
                updatedAt: Timestamp.now(),
            })
            return true
        } catch (error) {
            console.error("Error updating client:", error)
            return false
        }
    }

    async deleteClient(clientId: string): Promise<boolean> {
        if (!db) return false

        try {
            await deleteDoc(doc(db, "trainer_clients", clientId))
            return true
        } catch (error) {
            console.error("Error deleting client:", error)
            return false
        }
    }

    // ============================================
    // DASHBOARD STATS
    // ============================================

    async getDashboardStats(): Promise<DashboardStats> {
        const trainerId = this.getCurrentUserId()
        if (!trainerId || !db) {
            return {
                totalClients: 0,
                activeClients: 0,
                totalRevenue: 0,
                monthlyRevenue: 0,
                upcomingSessions: 0,
                completedSessions: 0,
            }
        }

        try {
            // Get clients
            const clientsQuery = query(
                collection(db, "trainer_clients"),
                where("trainerId", "==", trainerId)
            )
            const clientsSnapshot = await getDocs(clientsQuery)
            const clients = clientsSnapshot.docs.map(d => d.data())

            const totalClients = clients.length
            const activeClients = clients.filter(c => c.status === "active").length
            const totalSpent = clients.reduce((sum, c) => sum + (c.totalSpent || 0), 0)

            // Get sessions this month
            const startOfMonth = new Date()
            startOfMonth.setDate(1)
            startOfMonth.setHours(0, 0, 0, 0)

            const sessionsQuery = query(
                collection(db, "private_bookings"),
                where("trainerId", "==", trainerId),
                where("createdAt", ">=", Timestamp.fromDate(startOfMonth))
            )
            const sessionsSnapshot = await getDocs(sessionsQuery)
            const sessions = sessionsSnapshot.docs.map(d => d.data())

            const monthlyRevenue = sessions
                .filter(s => s.status === "completed")
                .reduce((sum, s) => sum + (s.trainerPayout || 0), 0)

            const upcomingSessions = sessions.filter(s => s.status === "confirmed").length
            const completedSessions = sessions.filter(s => s.status === "completed").length

            return {
                totalClients,
                activeClients,
                totalRevenue: totalSpent,
                monthlyRevenue,
                upcomingSessions,
                completedSessions,
            }
        } catch (error) {
            console.error("Error getting dashboard stats:", error)
            return {
                totalClients: 0,
                activeClients: 0,
                totalRevenue: 0,
                monthlyRevenue: 0,
                upcomingSessions: 0,
                completedSessions: 0,
            }
        }
    }

    // ============================================
    // SESSION TRACKING
    // ============================================

    async recordSession(clientId: string, amount: number): Promise<boolean> {
        const client = await this.getClient(clientId)
        if (!client) return false

        return this.updateClient(clientId, {
            totalSessions: (client.totalSessions || 0) + 1,
            totalSpent: (client.totalSpent || 0) + amount,
            lastSessionAt: new Date().toISOString(),
        })
    }
}

export const trainerDashboardService = new TrainerDashboardService()
