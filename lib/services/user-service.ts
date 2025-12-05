import { db } from "../firebase-config"
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore"

const USERS_COLLECTION = "users"

export const userService = {
    /**
     * Update a user's skill rating for a specific sport
     */
    async updateSkillRating(
        userId: string,
        sport: string,
        rating: string
    ): Promise<boolean> {
        if (!db) return false

        try {
            const userRef = doc(db, USERS_COLLECTION, userId)

            // Check if user document exists
            const userDoc = await getDoc(userRef)

            if (userDoc.exists()) {
                // Update existing user
                await updateDoc(userRef, {
                    [`skillRatings.${sport}`]: rating
                })
            } else {
                // Create new user document
                await setDoc(userRef, {
                    skillRatings: {
                        [sport]: rating
                    }
                })
            }

            return true
        } catch (error) {
            console.error("Error updating skill rating:", error)
            return false
        }
    },

    /**
     * Get a user's skill rating for a specific sport
     */
    async getSkillRating(userId: string, sport: string): Promise<string | null> {
        if (!db) return null

        try {
            const userRef = doc(db, USERS_COLLECTION, userId)
            const userDoc = await getDoc(userRef)

            if (userDoc.exists()) {
                const data = userDoc.data()
                return data.skillRatings?.[sport] || null
            }

            return null
        } catch (error) {
            console.error("Error fetching skill rating:", error)
            return null
        }
    },

    /**
     * Get all skill ratings for a user
     */
    async getAllSkillRatings(userId: string): Promise<Record<string, string> | null> {
        if (!db) return null

        try {
            const userRef = doc(db, USERS_COLLECTION, userId)
            const userDoc = await getDoc(userRef)

            if (userDoc.exists()) {
                const data = userDoc.data()
                return data.skillRatings || {}
            }

            return {}
        } catch (error) {
            console.error("Error fetching skill ratings:", error)
            return null
        }
    }
}
