/**
 * Referral Service
 * 
 * Handles referral code generation, validation, and reward tracking.
 */

import AsyncStorage from "@react-native-async-storage/async-storage"
import { doc, getDoc, setDoc, updateDoc, increment, collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase-config"

export interface ReferralCode {
    code: string
    userId: string
    userName: string
    createdAt: string
    usageCount: number
    maxUses: number // -1 for unlimited
    rewardPerUse: number // Credits earned per use
    isActive: boolean
    type: "user" | "launch" | "influencer" | "partner"
}

export interface ReferralReward {
    id: string
    code: string
    referrerId: string
    referredId: string
    referredName: string
    rewardAmount: number
    createdAt: string
    claimed: boolean
}

// Launch partner codes for Myrtle Beach
export const LAUNCH_CODES: { [key: string]: { reward: number; description: string } } = {
    "MYRTLE2024": { reward: 10, description: "Myrtle Beach Launch Special - $10 credit" },
    "GOODRUNSS": { reward: 5, description: "Welcome bonus - $5 credit" },
    "FIRSTRUN": { reward: 15, description: "Founding member - $15 credit" },
    "BEACHBALL": { reward: 10, description: "Beach season promo - $10 credit" },
    "HOOPS25": { reward: 25, description: "VIP access - $25 credit" },
}

class ReferralService {
    private static instance: ReferralService

    static getInstance(): ReferralService {
        if (!ReferralService.instance) {
            ReferralService.instance = new ReferralService()
        }
        return ReferralService.instance
    }

    /**
     * Generate a unique referral code for a user
     */
    async generateUserCode(userId: string, userName: string): Promise<string> {
        // Create a short, memorable code using name + random chars
        const namePrefix = userName.replace(/\s+/g, "").substring(0, 4).toUpperCase()
        const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
        const code = `${namePrefix}${randomSuffix}`

        // Check if user already has a code
        const existingCode = await this.getUserCode(userId)
        if (existingCode) {
            return existingCode.code
        }

        // Store in Firebase
        if (db) {
            const referralData: ReferralCode = {
                code,
                userId,
                userName,
                createdAt: new Date().toISOString(),
                usageCount: 0,
                maxUses: -1, // Unlimited for user codes
                rewardPerUse: 5, // $5 per referral
                isActive: true,
                type: "user",
            }

            await setDoc(doc(db, "referralCodes", code), referralData)
            await setDoc(doc(db, "users", userId, "referral", "code"), { code })
        }

        // Store locally as fallback
        await AsyncStorage.setItem("my_referral_code", code)

        return code
    }

    /**
     * Get user's referral code
     */
    async getUserCode(userId: string): Promise<ReferralCode | null> {
        if (db) {
            try {
                const docRef = doc(db, "users", userId, "referral", "code")
                const docSnap = await getDoc(docRef)
                if (docSnap.exists()) {
                    const { code } = docSnap.data()
                    const codeDoc = await getDoc(doc(db, "referralCodes", code))
                    if (codeDoc.exists()) {
                        return codeDoc.data() as ReferralCode
                    }
                }
            } catch (error) {
                console.error("Error getting user code:", error)
            }
        }

        // Fallback to local
        const localCode = await AsyncStorage.getItem("my_referral_code")
        if (localCode) {
            return {
                code: localCode,
                userId,
                userName: "You",
                createdAt: new Date().toISOString(),
                usageCount: 0,
                maxUses: -1,
                rewardPerUse: 5,
                isActive: true,
                type: "user",
            }
        }

        return null
    }

    /**
     * Validate and apply a referral code
     */
    async applyCode(code: string, newUserId: string, newUserName: string): Promise<{
        success: boolean
        reward: number
        message: string
    }> {
        const normalizedCode = code.toUpperCase().trim()

        // Check if it's a launch code
        if (LAUNCH_CODES[normalizedCode]) {
            const launchCode = LAUNCH_CODES[normalizedCode]

            // Check if already used by this user
            const usedCodes = await AsyncStorage.getItem("used_referral_codes")
            const usedList = usedCodes ? JSON.parse(usedCodes) : []

            if (usedList.includes(normalizedCode)) {
                return { success: false, reward: 0, message: "You've already used this code" }
            }

            // Mark as used
            usedList.push(normalizedCode)
            await AsyncStorage.setItem("used_referral_codes", JSON.stringify(usedList))

            return {
                success: true,
                reward: launchCode.reward,
                message: launchCode.description,
            }
        }

        // Check Firebase for user referral code
        if (db) {
            try {
                const codeDoc = await getDoc(doc(db, "referralCodes", normalizedCode))

                if (!codeDoc.exists()) {
                    return { success: false, reward: 0, message: "Invalid referral code" }
                }

                const referralCode = codeDoc.data() as ReferralCode

                // Check if code is active
                if (!referralCode.isActive) {
                    return { success: false, reward: 0, message: "This code is no longer active" }
                }

                // Check if max uses reached
                if (referralCode.maxUses !== -1 && referralCode.usageCount >= referralCode.maxUses) {
                    return { success: false, reward: 0, message: "This code has reached its limit" }
                }

                // Check if user is trying to use their own code
                if (referralCode.userId === newUserId) {
                    return { success: false, reward: 0, message: "You can't use your own code" }
                }

                // Apply the referral
                await updateDoc(doc(db, "referralCodes", normalizedCode), {
                    usageCount: increment(1),
                })

                // Create reward record for referrer
                const rewardDoc: ReferralReward = {
                    id: `${normalizedCode}-${newUserId}`,
                    code: normalizedCode,
                    referrerId: referralCode.userId,
                    referredId: newUserId,
                    referredName: newUserName,
                    rewardAmount: referralCode.rewardPerUse,
                    createdAt: new Date().toISOString(),
                    claimed: false,
                }

                await setDoc(
                    doc(db, "users", referralCode.userId, "referralRewards", rewardDoc.id),
                    rewardDoc
                )

                return {
                    success: true,
                    reward: referralCode.rewardPerUse,
                    message: `Referred by ${referralCode.userName}! You both get $${referralCode.rewardPerUse}`,
                }
            } catch (error) {
                console.error("Error applying code:", error)
                return { success: false, reward: 0, message: "Error applying code" }
            }
        }

        return { success: false, reward: 0, message: "Invalid referral code" }
    }

    /**
     * Get referral stats for a user
     */
    async getReferralStats(userId: string): Promise<{
        code: string | null
        totalReferrals: number
        totalEarned: number
        pendingRewards: number
    }> {
        const userCode = await this.getUserCode(userId)

        if (db && userCode) {
            try {
                const rewardsQuery = query(
                    collection(db, "users", userId, "referralRewards")
                )
                const snapshot = await getDocs(rewardsQuery)

                let totalEarned = 0
                let pendingRewards = 0

                snapshot.forEach((doc) => {
                    const reward = doc.data() as ReferralReward
                    if (reward.claimed) {
                        totalEarned += reward.rewardAmount
                    } else {
                        pendingRewards += reward.rewardAmount
                    }
                })

                return {
                    code: userCode.code,
                    totalReferrals: userCode.usageCount,
                    totalEarned,
                    pendingRewards,
                }
            } catch (error) {
                console.error("Error getting referral stats:", error)
            }
        }

        return {
            code: userCode?.code || null,
            totalReferrals: 0,
            totalEarned: 0,
            pendingRewards: 0,
        }
    }
}

export const referralService = ReferralService.getInstance()
