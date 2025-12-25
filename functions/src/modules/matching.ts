import * as functions from "firebase-functions"
import * as admin from "firebase-admin"

/**
 * Find players with similar interests nearby
 * Smart matching based on: sport, skill level, availability, distance
 */
export const findSimilarPlayers = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Must be authenticated")
    }

    const { sport, skillLevel, city, limit = 10 } = data
    const userId = context.auth.uid

    try {
        // Get current user's profile
        const userDoc = await admin.firestore()
            .collection("users")
            .doc(userId)
            .get()

        const currentUser = userDoc.data() || {}

        // Query for similar players
        let query: FirebaseFirestore.Query = admin.firestore()
            .collection("users")
            .where("city", "==", city || currentUser.city)
            .limit(limit + 1) // +1 to exclude self

        const snapshot = await query.get()

        const players = snapshot.docs
            .filter(d => d.id !== userId)
            .map(d => {
                const player = d.data()

                // Calculate match score
                let matchScore = 50 // Base score

                // Sport match
                const playerSports = player.favoriteSports || []
                if (sport && playerSports.includes(sport)) {
                    matchScore += 30
                }

                // Skill level match
                if (skillLevel && player.skillLevel === skillLevel) {
                    matchScore += 20
                }

                // Activity match (both active recently)
                if (player.lastActiveAt) {
                    const daysSinceActive = (Date.now() - player.lastActiveAt.toDate()) / (1000 * 60 * 60 * 24)
                    if (daysSinceActive < 7) matchScore += 10
                }

                return {
                    id: d.id,
                    name: player.displayName || "Player",
                    avatar: player.photoURL,
                    sports: playerSports,
                    skillLevel: player.skillLevel,
                    matchScore,
                }
            })
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, limit)

        return { players }
    } catch (error: any) {
        functions.logger.error("Error finding players:", error)
        throw new functions.https.HttpsError("internal", error.message)
    }
})

/**
 * Smart slot recommendation based on user patterns
 */
export const getSmartSlotRecommendations = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Must be authenticated")
    }

    // const { sport, venueId, city } = data // Unused for now
    const userId = context.auth.uid

    try {
        // Get user's booking history
        const bookingsQuery = admin.firestore()
            .collection("court_bookings")
            .where("userId", "==", userId)
            .orderBy("createdAt", "desc")
            .limit(20)

        const bookingsSnapshot = await bookingsQuery.get()

        // Analyze patterns
        const timeSlots: { [key: string]: number } = {}
        const daysOfWeek: { [key: number]: number } = {}

        bookingsSnapshot.docs.forEach(doc => {
            const booking = doc.data()
            const time = booking.startTime?.split(":")[0] || "18"
            const date = new Date(booking.date)
            const dayOfWeek = date.getDay()

            timeSlots[time] = (timeSlots[time] || 0) + 1
            daysOfWeek[dayOfWeek] = (daysOfWeek[dayOfWeek] || 0) + 1
        })

        // Find preferred time
        const preferredHour = Object.entries(timeSlots)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || "18"

        // Find preferred day
        const preferredDay = Object.entries(daysOfWeek)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || "6" // Sat default

        // Generate recommendations
        const today = new Date()
        const recommendations = []

        for (let i = 0; i < 7; i++) {
            const date = new Date(today)
            date.setDate(date.getDate() + i)

            if (date.getDay() === parseInt(preferredDay)) {
                recommendations.push({
                    date: date.toISOString().split("T")[0],
                    time: `${preferredHour}:00`,
                    reason: "Your usual time",
                    priority: 100,
                })
            }
        }

        // Add alternative recommendations
        recommendations.push({
            date: today.toISOString().split("T")[0],
            time: "20:00",
            reason: "Available tonight",
            priority: 80,
        })

        return {
            recommendations: recommendations.slice(0, 5),
            userPattern: {
                preferredHour,
                preferredDay: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][parseInt(preferredDay)],
            },
        }
    } catch (error: any) {
        functions.logger.error("Error getting slot recommendations:", error)
        throw new functions.https.HttpsError("internal", error.message)
    }
})
