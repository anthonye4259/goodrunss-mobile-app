/**
 * Real-Time Sync Service
 * 
 * Firebase listeners for instant updates between dashboard and mobile:
 * - New bookings → Trainer notification
 * - Messages → Real-time chat
 * - Waitlist updates → Client notification
 * - Session changes → Both parties notified
 */

import { db } from "@/lib/firebase-config"
import { NotificationService } from "@/lib/notification-service"

// Active listeners (for cleanup)
const activeListeners: (() => void)[] = []

// ============================================
// TRAINER LISTENERS
// ============================================

/**
 * Listen for new bookings for trainer
 */
export function subscribeToNewBookings(
    trainerId: string,
    onNewBooking: (booking: any) => void
): () => void {
    if (!db) return () => { }

    let unsubscribe = () => { }

    import("firebase/firestore").then(({ collection, query, where, orderBy, onSnapshot, limit }) => {
        const q = query(
            collection(db, "privateBookings"),
            where("instructorId", "==", trainerId),
            where("status", "==", "confirmed"),
            orderBy("createdAt", "desc"),
            limit(10)
        )

        unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach(change => {
                if (change.type === "added") {
                    const booking = {
                        id: change.doc.id,
                        ...change.doc.data(),
                    }
                    onNewBooking(booking)
                }
            })
        })

        activeListeners.push(unsubscribe)
    })

    return () => unsubscribe()
}

/**
 * Listen for new messages for trainer
 */
export function subscribeToTrainerMessages(
    trainerId: string,
    onNewMessage: (message: any) => void
): () => void {
    if (!db) return () => { }

    let unsubscribe = () => { }

    import("firebase/firestore").then(({ collection, query, where, orderBy, onSnapshot, limit }) => {
        const q = query(
            collection(db, "messages"),
            where("recipientId", "==", trainerId),
            where("read", "==", false),
            orderBy("createdAt", "desc"),
            limit(20)
        )

        unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach(change => {
                if (change.type === "added") {
                    const message = {
                        id: change.doc.id,
                        ...change.doc.data(),
                    }
                    onNewMessage(message)
                }
            })
        })

        activeListeners.push(unsubscribe)
    })

    return () => unsubscribe()
}

/**
 * Listen for session status changes
 */
export function subscribeToSessionChanges(
    trainerId: string,
    onSessionChange: (session: any, changeType: string) => void
): () => void {
    if (!db) return () => { }

    let unsubscribe = () => { }

    import("firebase/firestore").then(({ collection, query, where, onSnapshot }) => {
        const q = query(
            collection(db, "privateBookings"),
            where("instructorId", "==", trainerId)
        )

        unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach(change => {
                if (change.type === "modified") {
                    const session = {
                        id: change.doc.id,
                        ...change.doc.data(),
                    }
                    onSessionChange(session, "modified")
                }
            })
        })

        activeListeners.push(unsubscribe)
    })

    return () => unsubscribe()
}

// ============================================
// CLIENT LISTENERS
// ============================================

/**
 * Listen for waitlist updates for client
 */
export function subscribeToWaitlistUpdates(
    clientId: string,
    onWaitlistUpdate: (entry: any) => void
): () => void {
    if (!db) return () => { }

    let unsubscribe = () => { }

    import("firebase/firestore").then(({ collection, query, where, onSnapshot }) => {
        const q = query(
            collection(db, "classWaitlists"),
            where("clientId", "==", clientId)
        )

        unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach(change => {
                if (change.type === "modified" || change.type === "added") {
                    const entry = {
                        id: change.doc.id,
                        ...change.doc.data(),
                    }
                    onWaitlistUpdate(entry)
                }
            })
        })

        activeListeners.push(unsubscribe)
    })

    return () => unsubscribe()
}

/**
 * Listen for booking confirmations for client
 */
export function subscribeToClientBookings(
    clientId: string,
    onBookingUpdate: (booking: any, changeType: string) => void
): () => void {
    if (!db) return () => { }

    let unsubscribe = () => { }

    import("firebase/firestore").then(({ collection, query, where, onSnapshot }) => {
        const q = query(
            collection(db, "privateBookings"),
            where("clientId", "==", clientId)
        )

        unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach(change => {
                const booking = {
                    id: change.doc.id,
                    ...change.doc.data(),
                }
                onBookingUpdate(booking, change.type)
            })
        })

        activeListeners.push(unsubscribe)
    })

    return () => unsubscribe()
}

/**
 * Listen for messages for client
 */
export function subscribeToClientMessages(
    clientId: string,
    onNewMessage: (message: any) => void
): () => void {
    if (!db) return () => { }

    let unsubscribe = () => { }

    import("firebase/firestore").then(({ collection, query, where, orderBy, onSnapshot, limit }) => {
        const q = query(
            collection(db, "messages"),
            where("recipientId", "==", clientId),
            where("read", "==", false),
            orderBy("createdAt", "desc"),
            limit(20)
        )

        unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach(change => {
                if (change.type === "added") {
                    const message = {
                        id: change.doc.id,
                        ...change.doc.data(),
                    }
                    onNewMessage(message)
                }
            })
        })

        activeListeners.push(unsubscribe)
    })

    return () => unsubscribe()
}

// ============================================
// CONVERSATION LISTENER (Real-time chat)
// ============================================

/**
 * Listen to messages in a conversation
 */
export function subscribeToConversation(
    conversationId: string,
    onMessage: (messages: any[]) => void
): () => void {
    if (!db) return () => { }

    let unsubscribe = () => { }

    import("firebase/firestore").then(({ collection, query, orderBy, onSnapshot }) => {
        const q = query(
            collection(db, "conversations", conversationId, "messages"),
            orderBy("createdAt", "asc")
        )

        unsubscribe = onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
            }))
            onMessage(messages)
        })

        activeListeners.push(unsubscribe)
    })

    return () => unsubscribe()
}

// ============================================
// INSTRUCTOR CLASS UPDATES
// ============================================

/**
 * Listen for class enrollment changes (for instructor)
 */
export function subscribeToClassEnrollments(
    instructorId: string,
    onEnrollmentChange: (classId: string, bookedCount: number, waitlistCount: number) => void
): () => void {
    if (!db) return () => { }

    let unsubscribe = () => { }

    import("firebase/firestore").then(({ collection, query, where, onSnapshot }) => {
        const q = query(
            collection(db, "wellnessClasses"),
            where("instructorId", "==", instructorId)
        )

        unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach(change => {
                if (change.type === "modified") {
                    const data = change.doc.data()
                    onEnrollmentChange(
                        change.doc.id,
                        data.bookedCount || 0,
                        data.waitlistCount || 0
                    )
                }
            })
        })

        activeListeners.push(unsubscribe)
    })

    return () => unsubscribe()
}

// ============================================
// CLEANUP
// ============================================

/**
 * Unsubscribe from all listeners
 */
export function unsubscribeAll(): void {
    activeListeners.forEach(unsub => unsub())
    activeListeners.length = 0
    console.log("[RealTimeSync] Unsubscribed from all listeners")
}

// ============================================
// NOTIFICATION HELPERS
// ============================================

/**
 * Show local notification for real-time events
 */
async function showNotification(type: string, title: string, body: string, data?: any): Promise<void> {
    try {
        const notificationService = NotificationService.getInstance()
        await notificationService.sendLocalNotification({
            type: type as any,
            title,
            body,
            data,
        })
    } catch (error) {
        console.error("[RealTimeSync] showNotification error:", error)
    }
}

// ============================================
// COMBINED LISTENER SETUP
// ============================================

/**
 * Set up all real-time listeners for a trainer
 */
export function setupTrainerRealTimeSync(trainerId: string): () => void {
    console.log("[RealTimeSync] Setting up trainer listeners for:", trainerId)

    const unsub1 = subscribeToNewBookings(trainerId, (booking) => {
        showNotification(
            "booking_confirmed",
            "New Booking!",
            `${booking.clientName} booked a session`,
            { bookingId: booking.id }
        )
    })

    const unsub2 = subscribeToTrainerMessages(trainerId, (message) => {
        showNotification(
            "message",
            "New Message",
            message.content?.substring(0, 50) || "You have a new message",
            { messageId: message.id, senderId: message.senderId }
        )
    })

    const unsub3 = subscribeToSessionChanges(trainerId, (session, changeType) => {
        if (session.status === "cancelled") {
            showNotification(
                "booking_cancelled",
                "Session Cancelled",
                `${session.clientName} cancelled their session`,
                { bookingId: session.id }
            )
        }
    })

    return () => {
        unsub1()
        unsub2()
        unsub3()
    }
}

/**
 * Set up all real-time listeners for a client
 */
export function setupClientRealTimeSync(clientId: string): () => void {
    console.log("[RealTimeSync] Setting up client listeners for:", clientId)

    const unsub1 = subscribeToWaitlistUpdates(clientId, (entry) => {
        if (entry.notified && !entry.claimed) {
            showNotification(
                "waitlist_available",
                "Spot Just Opened!",
                "You have 5 minutes to claim it!",
                { classId: entry.classId, waitlistId: entry.id }
            )
        }
    })

    const unsub2 = subscribeToClientBookings(clientId, (booking, changeType) => {
        if (changeType === "modified" && booking.status === "confirmed") {
            showNotification(
                "booking_confirmed",
                "Booking Confirmed!",
                `Your session is confirmed`,
                { bookingId: booking.id }
            )
        }
    })

    const unsub3 = subscribeToClientMessages(clientId, (message) => {
        showNotification(
            "message",
            `Message from ${message.senderName || "Instructor"}`,
            message.content?.substring(0, 50) || "You have a new message",
            { messageId: message.id, senderId: message.senderId }
        )
    })

    return () => {
        unsub1()
        unsub2()
        unsub3()
    }
}

export default {
    // Trainer
    subscribeToNewBookings,
    subscribeToTrainerMessages,
    subscribeToSessionChanges,
    subscribeToClassEnrollments,
    setupTrainerRealTimeSync,

    // Client
    subscribeToWaitlistUpdates,
    subscribeToClientBookings,
    subscribeToClientMessages,
    setupClientRealTimeSync,

    // Chat
    subscribeToConversation,

    // Cleanup
    unsubscribeAll,
}
