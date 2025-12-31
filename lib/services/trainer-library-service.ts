/**
 * Trainer Library Types & Service
 * 
 * Allows trainers to create and monetize content libraries:
 * - Drill videos
 * - Training programs
 * - Technique tutorials
 * - Courses with multiple lessons
 * 
 * Players can purchase access to individual items or subscribe to a trainer's full library.
 */

import AsyncStorage from "@react-native-async-storage/async-storage"
import { db, auth } from "@/lib/firebase-config"

// ============================================
// TYPES
// ============================================

export type ContentType =
    | "drill"       // Single drill video
    | "tutorial"    // Technique breakdown
    | "program"     // Multi-week training program
    | "course"      // Multi-lesson course
    | "playbook"    // Strategy/tactics guide

export interface LibraryItem {
    id: string
    trainerId: string
    trainerName: string
    trainerAvatar?: string
    type: ContentType
    title: string
    description: string
    thumbnailUrl?: string
    videoUrl?: string
    pdfUrl?: string

    // Pricing
    price: number
    currency: string
    isFree: boolean

    // For courses/programs
    lessons?: LibraryLesson[]
    durationWeeks?: number

    // Metadata
    sport: string
    skillLevel: "beginner" | "intermediate" | "advanced" | "all"
    tags: string[]
    duration?: number // minutes

    // Stats
    viewCount: number
    purchaseCount: number
    rating: number
    reviewCount: number

    createdAt: string
    updatedAt: string
    isPublished: boolean
}

export interface LibraryLesson {
    id: string
    order: number
    title: string
    description: string
    videoUrl?: string
    duration?: number
    isPreview?: boolean // Free preview lesson
}

export interface LibraryPurchase {
    id: string
    userId: string
    itemId: string
    trainerId: string
    purchasedAt: string
    price: number
    currency: string
}

export interface LibrarySubscription {
    id: string
    userId: string
    trainerId: string
    startedAt: string
    expiresAt: string
    price: number
    currency: string
    status: "active" | "cancelled" | "expired"
}

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
    drill: "Drill",
    tutorial: "Tutorial",
    program: "Program",
    course: "Course",
    playbook: "Playbook",
}

export const CONTENT_TYPE_ICONS: Record<ContentType, string> = {
    drill: "fitness",
    tutorial: "school",
    program: "calendar",
    course: "library",
    playbook: "book",
}

// ============================================
// STORAGE KEYS
// ============================================

const STORAGE_KEYS = {
    MY_LIBRARY: "@goodrunss_my_library",
    PURCHASES: "@goodrunss_library_purchases",
    SUBSCRIPTIONS: "@goodrunss_library_subscriptions",
}

// ============================================
// TRAINER LIBRARY SERVICE
// ============================================

class TrainerLibraryService {
    private static instance: TrainerLibraryService

    static getInstance(): TrainerLibraryService {
        if (!TrainerLibraryService.instance) {
            TrainerLibraryService.instance = new TrainerLibraryService()
        }
        return TrainerLibraryService.instance
    }

    // ========================
    // TRAINER: CONTENT CREATION
    // ========================

    /**
     * Create a new library item
     */
    async createItem(item: Omit<LibraryItem, "id" | "trainerId" | "createdAt" | "updatedAt" | "viewCount" | "purchaseCount" | "rating" | "reviewCount">): Promise<LibraryItem> {
        const userId = auth?.currentUser?.uid || "local_trainer"
        const library = await this.getMyLibrary()

        const newItem: LibraryItem = {
            ...item,
            id: `lib_${Date.now()}`,
            trainerId: userId,
            viewCount: 0,
            purchaseCount: 0,
            rating: 0,
            reviewCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }

        library.push(newItem)
        await AsyncStorage.setItem(STORAGE_KEYS.MY_LIBRARY, JSON.stringify(library))

        // Sync to Firestore
        if (db) {
            try {
                const { doc, setDoc, collection } = await import("firebase/firestore")
                await setDoc(doc(collection(db, "library_items"), newItem.id), newItem)
            } catch (error) {
                console.error("Failed to sync library item:", error)
            }
        }

        return newItem
    }

    /**
     * Update library item
     */
    async updateItem(itemId: string, updates: Partial<LibraryItem>): Promise<LibraryItem | null> {
        const library = await this.getMyLibrary()
        const index = library.findIndex(i => i.id === itemId)

        if (index === -1) return null

        library[index] = {
            ...library[index],
            ...updates,
            updatedAt: new Date().toISOString(),
        }

        await AsyncStorage.setItem(STORAGE_KEYS.MY_LIBRARY, JSON.stringify(library))
        return library[index]
    }

    /**
     * Delete library item
     */
    async deleteItem(itemId: string): Promise<boolean> {
        const library = await this.getMyLibrary()
        const filtered = library.filter(i => i.id !== itemId)

        if (filtered.length === library.length) return false

        await AsyncStorage.setItem(STORAGE_KEYS.MY_LIBRARY, JSON.stringify(filtered))
        return true
    }

    /**
     * Get trainer's own library
     */
    async getMyLibrary(): Promise<LibraryItem[]> {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.MY_LIBRARY)
        return stored ? JSON.parse(stored) : []
    }

    // ========================
    // PLAYER: BROWSE & PURCHASE
    // ========================

    /**
     * Browse library content
     */
    async browseLibrary(filters?: {
        sport?: string
        type?: ContentType
        trainerId?: string
        skillLevel?: string
        maxPrice?: number
        freeOnly?: boolean
    }): Promise<LibraryItem[]> {
        // In production, query Firestore
        // For now, return mock data
        return [
            {
                id: "lib_1",
                trainerId: "trainer_1",
                trainerName: "Carlos Martinez",
                type: "course",
                title: "Padel Fundamentals: 0 to Hero",
                description: "Complete beginner course covering all the basics of padel.",
                price: 49,
                currency: "USD",
                isFree: false,
                sport: "Padel",
                skillLevel: "beginner",
                tags: ["fundamentals", "technique", "beginner"],
                lessons: [
                    { id: "l1", order: 1, title: "Introduction to Padel", duration: 10, isPreview: true },
                    { id: "l2", order: 2, title: "Grip & Stance", duration: 15 },
                    { id: "l3", order: 3, title: "Basic Forehand", duration: 20 },
                    { id: "l4", order: 4, title: "Basic Backhand", duration: 20 },
                    { id: "l5", order: 5, title: "Wall Play Basics", duration: 25 },
                ],
                viewCount: 1234,
                purchaseCount: 89,
                rating: 4.8,
                reviewCount: 67,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isPublished: true,
            },
            {
                id: "lib_2",
                trainerId: "trainer_2",
                trainerName: "Sarah Chen",
                type: "drill",
                title: "50 Tennis Drills You Can Do Alone",
                description: "Solo practice drills to improve footwork, consistency, and power.",
                videoUrl: "https://example.com/video",
                price: 19,
                currency: "USD",
                isFree: false,
                sport: "Tennis",
                skillLevel: "all",
                tags: ["drills", "solo", "practice"],
                duration: 45,
                viewCount: 567,
                purchaseCount: 43,
                rating: 4.6,
                reviewCount: 28,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isPublished: true,
            },
            {
                id: "lib_3",
                trainerId: "trainer_3",
                trainerName: "Mike Johnson",
                type: "program",
                title: "12-Week Pickleball Improvement Plan",
                description: "Structured program with weekly drills and progressions.",
                price: 79,
                currency: "USD",
                isFree: false,
                durationWeeks: 12,
                sport: "Pickleball",
                skillLevel: "intermediate",
                tags: ["program", "improvement", "structured"],
                viewCount: 890,
                purchaseCount: 56,
                rating: 4.9,
                reviewCount: 41,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isPublished: true,
            },
        ]
    }

    /**
     * Get featured content
     */
    async getFeaturedContent(): Promise<LibraryItem[]> {
        const all = await this.browseLibrary()
        // Return top-rated items
        return all.sort((a, b) => b.rating - a.rating).slice(0, 5)
    }

    /**
     * Purchase library item
     */
    async purchaseItem(item: LibraryItem): Promise<LibraryPurchase> {
        const userId = auth?.currentUser?.uid || "local_user"
        const purchases = await this.getMyPurchases()

        const purchase: LibraryPurchase = {
            id: `purchase_${Date.now()}`,
            userId,
            itemId: item.id,
            trainerId: item.trainerId,
            purchasedAt: new Date().toISOString(),
            price: item.price,
            currency: item.currency,
        }

        purchases.push(purchase)
        await AsyncStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases))

        return purchase
    }

    /**
     * Check if user has access to item
     */
    async hasAccess(itemId: string): Promise<boolean> {
        const purchases = await this.getMyPurchases()
        return purchases.some(p => p.itemId === itemId)
    }

    /**
     * Get user's purchases
     */
    async getMyPurchases(): Promise<LibraryPurchase[]> {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.PURCHASES)
        return stored ? JSON.parse(stored) : []
    }

    // ========================
    // SUBSCRIPTIONS
    // ========================

    /**
     * Subscribe to a trainer's full library
     */
    async subscribeToTrainer(trainerId: string, monthlyPrice: number, currency: string): Promise<LibrarySubscription> {
        const userId = auth?.currentUser?.uid || "local_user"
        const subs = await this.getMySubscriptions()

        const subscription: LibrarySubscription = {
            id: `sub_${Date.now()}`,
            userId,
            trainerId,
            startedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            price: monthlyPrice,
            currency,
            status: "active",
        }

        subs.push(subscription)
        await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subs))

        return subscription
    }

    /**
     * Check if user is subscribed to trainer
     */
    async isSubscribedTo(trainerId: string): Promise<boolean> {
        const subs = await this.getMySubscriptions()
        return subs.some(s =>
            s.trainerId === trainerId &&
            s.status === "active" &&
            new Date(s.expiresAt) > new Date()
        )
    }

    /**
     * Get user's subscriptions
     */
    async getMySubscriptions(): Promise<LibrarySubscription[]> {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS)
        return stored ? JSON.parse(stored) : []
    }

    /**
     * Get trainer's earnings from library
     */
    async getLibraryEarnings(trainerId?: string): Promise<{
        totalEarnings: number
        purchaseCount: number
        subscriberCount: number
    }> {
        const id = trainerId || auth?.currentUser?.uid || "local_trainer"
        const library = await this.getMyLibrary()

        const totalEarnings = library.reduce((sum, item) =>
            sum + (item.purchaseCount * item.price * 0.85), // 15% platform fee
            0
        )

        return {
            totalEarnings,
            purchaseCount: library.reduce((sum, item) => sum + item.purchaseCount, 0),
            subscriberCount: 0, // Would be from subscriptions in production
        }
    }
}

export const trainerLibraryService = TrainerLibraryService.getInstance()
