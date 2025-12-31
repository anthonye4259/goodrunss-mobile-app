import AsyncStorage from "@react-native-async-storage/async-storage"
import { db, auth } from "@/lib/firebase-config"
import { NotificationService } from "@/lib/notification-service"
import { getReferralMultiplier, getLaunchCity } from "@/lib/launch-cities"
import type { FriendActivity } from "@/lib/friends-types"

// ============================================
// TYPES
// ============================================

export interface CheckIn {
    id: string
    userId: string
    userName: string
    userAvatar?: string
    venueId: string
    venueName: string
    venueType: "court" | "gym" | "studio" | "park"
    activity: string
    status: "active" | "looking_for_players" | "in_game"
    playerCount?: number
    playersNeeded?: number
    message?: string
    expiresAt: number // timestamp
    createdAt: number
    location: {
        lat: number
        lng: number
    }
}

export interface Challenge {
    id: string
    challengerId: string
    challengerName: string
    challengerAvatar?: string
    challengedId: string
    challengedName: string
    activity: string
    venueId?: string
    venueName?: string
    proposedTime?: string
    message?: string
    status: "pending" | "accepted" | "declined" | "completed"
    createdAt: number
    expiresAt: number
}

export interface UserXP {
    totalXP: number
    level: number
    levelName: string
    xpToNextLevel: number
    badges: Badge[]
    streakDays: number
    lastActivityDate: string
}

export interface Badge {
    id: string
    name: string
    description: string
    icon: string
    color: string
    earnedAt: number
    category: "social" | "activity" | "reporting" | "streak" | "achievement"
}

// XP Levels
const XP_LEVELS = [
    { level: 1, name: "Rookie", minXP: 0 },
    { level: 2, name: "Regular", minXP: 100 },
    { level: 3, name: "Active", minXP: 300 },
    { level: 4, name: "Champion", minXP: 600 },
    { level: 5, name: "Legend", minXP: 1000 },
    { level: 6, name: "MVP", minXP: 1500 },
    { level: 7, name: "Elite", minXP: 2500 },
    { level: 8, name: "Pro", minXP: 4000 },
    { level: 9, name: "Master", minXP: 6000 },
    { level: 10, name: "Icon", minXP: 10000 },
]

// Badge Definitions
const BADGES: Record<string, Omit<Badge, "earnedAt">> = {
    first_checkin: {
        id: "first_checkin",
        name: "First Check-In",
        description: "Checked in at your first venue",
        icon: "location",
        color: "#6B9B5A",
        category: "activity",
    },
    first_report: {
        id: "first_report",
        name: "Reporter",
        description: "Submitted your first court report",
        icon: "document-text",
        color: "#FBBF24",
        category: "reporting",
    },
    five_reports: {
        id: "five_reports",
        name: "Scout",
        description: "Submitted 5 court reports",
        icon: "eye",
        color: "#F59E0B",
        category: "reporting",
    },
    ambassador: {
        id: "ambassador",
        name: "Ambassador",
        description: "Invited your first friend",
        icon: "people",
        color: "#EC4899",
        category: "social",
    },
    super_ambassador: {
        id: "super_ambassador",
        name: "Super Ambassador",
        description: "Invited 10+ friends",
        icon: "star",
        color: "#8B5CF6",
        category: "social",
    },
    challenger: {
        id: "challenger",
        name: "Challenger",
        description: "Sent your first challenge",
        icon: "flash",
        color: "#EF4444",
        category: "social",
    },
    streak_7: {
        id: "streak_7",
        name: "On Fire",
        description: "7-day activity streak",
        icon: "flame",
        color: "#F97316",
        category: "streak",
    },
    streak_30: {
        id: "streak_30",
        name: "Unstoppable",
        description: "30-day activity streak",
        icon: "rocket",
        color: "#DC2626",
        category: "streak",
    },
    socialite: {
        id: "socialite",
        name: "Socialite",
        description: "Connected with 20+ friends",
        icon: "heart",
        color: "#EC4899",
        category: "social",
    },
    // Launch City Badges (Priority Cities)
    nyc_pioneer: {
        id: "nyc_pioneer",
        name: "NYC Pioneer",
        description: "Early adopter in New York City",
        icon: "ribbon",
        color: "#3B82F6",
        category: "achievement",
    },
    sf_early_adopter: {
        id: "sf_early_adopter",
        name: "SF Early Adopter",
        description: "Early adopter in San Francisco",
        icon: "ribbon",
        color: "#F97316",
        category: "achievement",
    },
    myrtle_og: {
        id: "myrtle_og",
        name: "Myrtle Beach OG",
        description: "Early adopter in Myrtle Beach",
        icon: "ribbon",
        color: "#14B8A6",
        category: "achievement",
    },
    // City Ambassador Badges (Refer 10+ in a city)
    nyc_ambassador: {
        id: "nyc_ambassador",
        name: "NYC Ambassador",
        description: "Referred 10+ friends in NYC",
        icon: "medal",
        color: "#3B82F6",
        category: "referral",
    },
    sf_ambassador: {
        id: "sf_ambassador",
        name: "SF Ambassador",
        description: "Referred 10+ friends in SF",
        icon: "medal",
        color: "#F97316",
        category: "referral",
    },
    myrtle_ambassador: {
        id: "myrtle_ambassador",
        name: "Myrtle Ambassador",
        description: "Referred 10+ friends in Myrtle Beach",
        icon: "medal",
        color: "#14B8A6",
        category: "referral",
    },
}

// ============================================
// STORAGE KEYS
// ============================================

const STORAGE_KEYS = {
    USER_XP: "@goodrunss_user_xp",
    CHECK_INS: "@goodrunss_checkins",
    MY_CHECK_IN: "@goodrunss_my_checkin",
    CHALLENGES: "@goodrunss_challenges",
    FRIEND_ACTIVITIES: "@goodrunss_friend_activities",
    STATS: "@goodrunss_user_stats",
}

// ============================================
// SOCIAL SERVICE
// ============================================

class SocialService {
    private static instance: SocialService
    private notificationService: NotificationService

    private constructor() {
        this.notificationService = NotificationService.getInstance()
    }

    static getInstance(): SocialService {
        if (!SocialService.instance) {
            SocialService.instance = new SocialService()
        }
        return SocialService.instance
    }

    // ============================================
    // CHECK-IN SYSTEM
    // ============================================

    async checkIn(checkInData: Omit<CheckIn, "id" | "createdAt" | "expiresAt">): Promise<CheckIn> {
        const checkIn: CheckIn = {
            ...checkInData,
            id: `checkin_${Date.now()}`,
            createdAt: Date.now(),
            expiresAt: Date.now() + 2 * 60 * 60 * 1000, // 2 hours
        }

        // Store locally
        await AsyncStorage.setItem(STORAGE_KEYS.MY_CHECK_IN, JSON.stringify(checkIn))

        // Add to check-ins list (simulating Firebase realtime)
        const checkIns = await this.getNearbyCheckIns(checkIn.location.lat, checkIn.location.lng)
        checkIns.push(checkIn)
        await AsyncStorage.setItem(STORAGE_KEYS.CHECK_INS, JSON.stringify(checkIns))

        // Grant XP for check-in
        await this.addXP(10, "check_in")

        // Check for first check-in badge
        const stats = await this.getUserStats()
        if (stats.totalCheckIns === 0) {
            await this.awardBadge("first_checkin")
        }
        await this.updateUserStats({ totalCheckIns: stats.totalCheckIns + 1 })

        // Notify friends
        await this.notifyFriendsOfCheckIn(checkIn)

        // If using Firebase, sync to Firestore
        if (db) {
            try {
                const { doc, setDoc, collection } = await import("firebase/firestore")
                await setDoc(doc(collection(db, "checkins"), checkIn.id), checkIn)
            } catch (error) {
                console.warn("Firebase sync failed, using local storage:", error)
            }
        }

        return checkIn
    }

    async checkOut(): Promise<void> {
        const myCheckIn = await AsyncStorage.getItem(STORAGE_KEYS.MY_CHECK_IN)
        if (myCheckIn) {
            const checkIn: CheckIn = JSON.parse(myCheckIn)

            // Remove from check-ins list
            const checkIns = await this.getNearbyCheckIns(checkIn.location.lat, checkIn.location.lng)
            const filtered = checkIns.filter((c) => c.id !== checkIn.id)
            await AsyncStorage.setItem(STORAGE_KEYS.CHECK_INS, JSON.stringify(filtered))

            // Clear my check-in
            await AsyncStorage.removeItem(STORAGE_KEYS.MY_CHECK_IN)

            // If using Firebase
            if (db) {
                try {
                    const { doc, deleteDoc } = await import("firebase/firestore")
                    await deleteDoc(doc(db, "checkins", checkIn.id))
                } catch (error) {
                    console.warn("Firebase delete failed:", error)
                }
            }
        }
    }

    async getMyCheckIn(): Promise<CheckIn | null> {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.MY_CHECK_IN)
        if (!stored) return null

        const checkIn: CheckIn = JSON.parse(stored)

        // Check if expired
        if (checkIn.expiresAt < Date.now()) {
            await this.checkOut()
            return null
        }

        return checkIn
    }

    async getNearbyCheckIns(lat: number, lng: number, radiusKm: number = 10): Promise<CheckIn[]> {
        // First try Firebase
        if (db) {
            try {
                const { collection, query, where, getDocs } = await import("firebase/firestore")
                const q = query(
                    collection(db, "checkins"),
                    where("expiresAt", ">", Date.now())
                )
                const snapshot = await getDocs(q)
                const checkIns: CheckIn[] = []
                snapshot.forEach((doc) => {
                    const data = doc.data() as CheckIn
                    // Filter by distance (simple approximation)
                    const distance = this.calculateDistance(lat, lng, data.location.lat, data.location.lng)
                    if (distance <= radiusKm) {
                        checkIns.push(data)
                    }
                })
                return checkIns
            } catch (error) {
                console.warn("Firebase query failed, using local:", error)
            }
        }

        // Fallback to local storage
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.CHECK_INS)
        if (!stored) return []

        const allCheckIns: CheckIn[] = JSON.parse(stored)
        const now = Date.now()

        // Filter expired and by distance
        return allCheckIns.filter((c) => {
            if (c.expiresAt < now) return false
            const distance = this.calculateDistance(lat, lng, c.location.lat, c.location.lng)
            return distance <= radiusKm
        })
    }

    async getFriendCheckIns(friendIds: string[]): Promise<CheckIn[]> {
        const allCheckIns = await this.getNearbyCheckIns(0, 0, 1000) // Get all
        return allCheckIns.filter((c) => friendIds.includes(c.userId))
    }

    private async notifyFriendsOfCheckIn(checkIn: CheckIn): Promise<void> {
        // In production, this would be a Firebase Cloud Function
        // For now, simulate by storing the activity
        const activity: FriendActivity = {
            id: `activity_${Date.now()}`,
            userId: checkIn.userId,
            username: checkIn.userName,
            avatar: checkIn.userAvatar,
            type: "checkin",
            activity: checkIn.activity,
            title: `${checkIn.userName} is at ${checkIn.venueName}`,
            description: checkIn.status === "looking_for_players"
                ? "Looking for players - join them!"
                : `Playing ${checkIn.activity}`,
            location: {
                venueName: checkIn.venueName,
                venueId: checkIn.venueId,
            },
            timestamp: new Date().toISOString(),
            isNearby: true,
        }

        const activities = await this.getFriendActivities()
        activities.unshift(activity)
        await AsyncStorage.setItem(STORAGE_KEYS.FRIEND_ACTIVITIES, JSON.stringify(activities.slice(0, 50)))
    }

    // ============================================
    // CHALLENGE SYSTEM
    // ============================================

    async sendChallenge(challengeData: Omit<Challenge, "id" | "createdAt" | "expiresAt" | "status">): Promise<Challenge> {
        const challenge: Challenge = {
            ...challengeData,
            id: `challenge_${Date.now()}`,
            status: "pending",
            createdAt: Date.now(),
            expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        }

        // Store locally
        const challenges = await this.getChallenges()
        challenges.push(challenge)
        await AsyncStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(challenges))

        // Grant XP for sending challenge
        await this.addXP(5, "challenge_sent")

        // Check for challenger badge
        const stats = await this.getUserStats()
        if (stats.challengesSent === 0) {
            await this.awardBadge("challenger")
        }
        await this.updateUserStats({ challengesSent: stats.challengesSent + 1 })

        // Send push notification to challenged user
        await this.notificationService.sendLocalNotification({
            type: "message_received",
            title: "New Challenge!",
            body: `${challengeData.challengerName} challenged you to ${challengeData.activity}!`,
            data: { challengeId: challenge.id },
        })

        // If using Firebase
        if (db) {
            try {
                const { doc, setDoc, collection } = await import("firebase/firestore")
                await setDoc(doc(collection(db, "challenges"), challenge.id), challenge)
            } catch (error) {
                console.warn("Firebase sync failed:", error)
            }
        }

        return challenge
    }

    async respondToChallenge(challengeId: string, accept: boolean): Promise<void> {
        const challenges = await this.getChallenges()
        const index = challenges.findIndex((c) => c.id === challengeId)

        if (index !== -1) {
            challenges[index].status = accept ? "accepted" : "declined"
            await AsyncStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(challenges))

            if (accept) {
                await this.addXP(10, "challenge_accepted")
            }

            // Notify challenger
            const challenge = challenges[index]
            await this.notificationService.sendLocalNotification({
                type: "message_received",
                title: accept ? "Challenge Accepted!" : "Challenge Declined",
                body: accept
                    ? `${challenge.challengedName} accepted your challenge!`
                    : `${challenge.challengedName} declined your challenge`,
                data: { challengeId },
            })
        }
    }

    async getChallenges(): Promise<Challenge[]> {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.CHALLENGES)
        if (!stored) return []

        const challenges: Challenge[] = JSON.parse(stored)
        const now = Date.now()

        // Filter out expired
        return challenges.filter((c) => c.expiresAt > now || c.status !== "pending")
    }

    async getPendingChallenges(userId: string): Promise<Challenge[]> {
        const challenges = await this.getChallenges()
        return challenges.filter(
            (c) => c.challengedId === userId && c.status === "pending"
        )
    }

    // ============================================
    // XP & BADGE SYSTEM
    // ============================================

    async addXP(amount: number, reason: string): Promise<UserXP> {
        const currentXP = await this.getUserXP()
        const newTotalXP = currentXP.totalXP + amount

        // Calculate new level
        let newLevel = 1
        let newLevelName = "Rookie"
        let xpToNextLevel = 100

        for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
            if (newTotalXP >= XP_LEVELS[i].minXP) {
                newLevel = XP_LEVELS[i].level
                newLevelName = XP_LEVELS[i].name
                xpToNextLevel = i < XP_LEVELS.length - 1
                    ? XP_LEVELS[i + 1].minXP - newTotalXP
                    : 0
                break
            }
        }

        // Check for level up
        if (newLevel > currentXP.level) {
            await this.notificationService.sendLocalNotification({
                type: "referral_reward",
                title: "Level Up!",
                body: `You're now ${newLevelName}! Keep it up!`,
                data: { level: newLevel },
            })
        }

        // Update streak
        const today = new Date().toDateString()
        let streakDays = currentXP.streakDays
        if (currentXP.lastActivityDate !== today) {
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()
            if (currentXP.lastActivityDate === yesterday) {
                streakDays += 1
            } else if (currentXP.lastActivityDate !== today) {
                streakDays = 1 // Reset streak
            }

            // Check for streak badges
            if (streakDays === 7) {
                await this.awardBadge("streak_7")
            } else if (streakDays === 30) {
                await this.awardBadge("streak_30")
            }
        }

        const updatedXP: UserXP = {
            ...currentXP,
            totalXP: newTotalXP,
            level: newLevel,
            levelName: newLevelName,
            xpToNextLevel,
            streakDays,
            lastActivityDate: today,
        }

        await AsyncStorage.setItem(STORAGE_KEYS.USER_XP, JSON.stringify(updatedXP))

        console.log(`[XP] +${amount} XP for ${reason}. Total: ${newTotalXP}`)
        return updatedXP
    }

    async getUserXP(): Promise<UserXP> {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.USER_XP)
        if (stored) {
            return JSON.parse(stored)
        }

        // Default XP state
        return {
            totalXP: 0,
            level: 1,
            levelName: "Rookie",
            xpToNextLevel: 100,
            badges: [],
            streakDays: 0,
            lastActivityDate: "",
        }
    }

    async awardBadge(badgeId: string): Promise<boolean> {
        const badgeTemplate = BADGES[badgeId]
        if (!badgeTemplate) return false

        const currentXP = await this.getUserXP()

        // Check if already has badge
        if (currentXP.badges.some((b) => b.id === badgeId)) {
            return false
        }

        const badge: Badge = {
            ...badgeTemplate,
            earnedAt: Date.now(),
        }

        currentXP.badges.push(badge)
        await AsyncStorage.setItem(STORAGE_KEYS.USER_XP, JSON.stringify(currentXP))

        // Notify user
        await this.notificationService.sendLocalNotification({
            type: "referral_reward",
            title: "New Badge Earned!",
            body: `You earned the "${badge.name}" badge!`,
            data: { badgeId },
        })

        console.log(`[Badge] Awarded: ${badge.name}`)
        return true
    }

    async getBadges(): Promise<Badge[]> {
        const xp = await this.getUserXP()
        return xp.badges
    }

    // ============================================
    // REFERRAL TRACKING
    // ============================================

    async trackReferral(referralCode: string, userCity?: string, referralCity?: string): Promise<void> {
        const stats = await this.getUserStats()
        const cityId = getLaunchCity(userCity)?.id
        const referralCityId = getLaunchCity(referralCity)?.id

        // Track city-specific referral count
        const cityReferralKey = cityId ? `cityReferrals_${cityId}` : null
        let cityReferralCount = 0
        if (cityReferralKey) {
            const stored = await AsyncStorage.getItem(cityReferralKey)
            cityReferralCount = stored ? parseInt(stored, 10) : 0
            await AsyncStorage.setItem(cityReferralKey, (cityReferralCount + 1).toString())
        }

        await this.updateUserStats({ referralsSent: stats.referralsSent + 1 })

        // Apply city-based multiplier (2x for priority cities)
        const multiplier = getReferralMultiplier(cityId)
        const baseXP = 100
        let totalXP = baseXP * multiplier
        let xpReason = multiplier > 1 ? "referral_2x" : "referral"

        // Same-city bonus: +50 XP if referral is in the same city as referrer
        if (cityId && referralCityId && cityId === referralCityId) {
            totalXP += 50
            xpReason = "referral_same_city"
        }

        await this.addXP(totalXP, xpReason)

        // Check for ambassador badges (general)
        if (stats.referralsSent === 0) {
            await this.awardBadge("ambassador")
        } else if (stats.referralsSent + 1 >= 10) {
            await this.awardBadge("super_ambassador")
        }

        // Check for City Ambassador badges (10+ referrals in a specific city)
        if (cityReferralCount + 1 >= 10 && cityId) {
            const cityAmbassadorBadges: Record<string, string> = {
                "new-york": "nyc_ambassador",
                "san-francisco": "sf_ambassador",
                "myrtle-beach": "myrtle_ambassador",
            }
            const cityBadge = cityAmbassadorBadges[cityId]
            if (cityBadge) {
                await this.awardBadge(cityBadge)
            }
        }
    }

    async trackReportSubmission(): Promise<void> {
        const stats = await this.getUserStats()
        await this.updateUserStats({ reportsSubmitted: stats.reportsSubmitted + 1 })

        // Grant XP
        await this.addXP(25, "report_submitted")

        // Check for report badges
        if (stats.reportsSubmitted === 0) {
            await this.awardBadge("first_report")
        } else if (stats.reportsSubmitted + 1 >= 5) {
            await this.awardBadge("five_reports")
        }
    }

    // ============================================
    // FRIEND ACTIVITIES
    // ============================================

    async getFriendActivities(): Promise<FriendActivity[]> {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.FRIEND_ACTIVITIES)
        return stored ? JSON.parse(stored) : []
    }

    // ============================================
    // USER STATS
    // ============================================

    private async getUserStats(): Promise<{
        totalCheckIns: number
        challengesSent: number
        referralsSent: number
        reportsSubmitted: number
        friendsCount: number
    }> {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.STATS)
        if (stored) {
            return JSON.parse(stored)
        }
        return {
            totalCheckIns: 0,
            challengesSent: 0,
            referralsSent: 0,
            reportsSubmitted: 0,
            friendsCount: 0,
        }
    }

    private async updateUserStats(updates: Partial<{
        totalCheckIns: number
        challengesSent: number
        referralsSent: number
        reportsSubmitted: number
        friendsCount: number
    }>): Promise<void> {
        const stats = await this.getUserStats()
        const newStats = { ...stats, ...updates }
        await AsyncStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(newStats))

        // Check for socialite badge
        if (updates.friendsCount && updates.friendsCount >= 20) {
            await this.awardBadge("socialite")
        }
    }

    // ============================================
    // UTILITY
    // ============================================

    // ============================================
    // PLAYER DISCOVERY
    // ============================================

    // ============================================
    // GROUPS & LEAGUES (REAL DATA)
    // ============================================

    async createGroup(groupData: any): Promise<string> {
        if (!db) throw new Error("No database connection");
        const userId = auth?.currentUser?.uid;
        if (!userId) throw new Error("User not authenticated");

        const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");

        const group = {
            ...groupData,
            createdBy: userId,
            members: [userId],
            createdAt: serverTimestamp(),
            active: true
        };

        const docRef = await addDoc(collection(db, "groups"), group);
        return docRef.id;
    }

    async getGroups(): Promise<any[]> {
        if (!db) return [];
        try {
            const { collection, getDocs, query, where, orderBy } = await import("firebase/firestore");
            // Simple query: All public groups or groups I'm in
            const q = query(collection(db, "groups"), orderBy("createdAt", "desc"));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (e) {
            console.error("Error fetching groups:", e);
            return [];
        }
    }

    async createLeague(leagueData: any): Promise<string> {
        if (!db) throw new Error("No database connection");
        const userId = auth?.currentUser?.uid;
        if (!userId) throw new Error("User not authenticated");

        const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");

        const league = {
            ...leagueData,
            commissionerId: userId,
            participants: [],
            createdAt: serverTimestamp(),
            status: 'registering'
        };

        const docRef = await addDoc(collection(db, "leagues"), league);
        return docRef.id;
    }

    async getLeagues(): Promise<any[]> {
        if (!db) return [];
        try {
            const { collection, getDocs, query, orderBy } = await import("firebase/firestore");
            const q = query(collection(db, "leagues"), orderBy("createdAt", "desc"));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (e) {
            console.error("Error fetching leagues:", e);
            return [];
        }
    }

    // ============================================
    // PLAYER DISCOVERY (REAL DATA)
    // ============================================

    async getNearbyPlayers(
        lat: number,
        lng: number,
        radius: number,
        filters?: { sport?: string; skillLevel?: string }
    ): Promise<any[]> {
        if (!db) return [];

        try {
            const { collection, getDocs, query, where, limit } = await import("firebase/firestore");

            // NOTE: Geo-queries in basic Firestore are limited. 
            // We fetch recent active users and filter client-side for now.
            // In production, use GeoFire or Algolia.

            const usersRef = collection(db, "users");
            // Fetch users who have set their location
            // This is a simplified approach for the MVP
            const q = query(usersRef, limit(50));

            const snapshot = await getDocs(q);
            const players = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

            return players.filter(p => {
                // 1. Filter by Location (Haversine approx)
                if (p.location) {
                    const dist = this.calculateDistance(lat, lng, p.location.lat, p.location.lng);
                    if (dist > radius) return false;
                    p.distance = dist; // Attach distance for UI
                } else {
                    return false; // No location, no show
                }

                // 2. Filter by Sport
                if (filters?.sport && !p.sports?.includes(filters.sport)) return false;

                // 3. Filter by Skill
                // (Simplified check)

                return true;
            });

        } catch (error) {
            console.error("Error fetching real players:", error);
            return [];
        }
    }

    // ============================================
    // FRIEND MANAGEMENT
    // ============================================

    async sendFriendRequest(userId: string): Promise<boolean> {
        if (!db) return false;
        const currentUserId = auth?.currentUser?.uid;
        if (!currentUserId) return false;

        try {
            const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
            await addDoc(collection(db, "friend_requests"), {
                from: currentUserId,
                to: userId,
                status: 'pending',
                createdAt: serverTimestamp()
            });
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    async getFriends(): Promise<any[]> {
        // Implement real friend fetching based on "friends" subcollection or array
        // For MVP speed, we'll fetch connections
        return [];
    }

    // Helper
    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Radius of the earth in km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    }

    private deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }
}

// Export singleton
export const socialService = SocialService.getInstance()

// Export for components
export { SocialService, BADGES, XP_LEVELS }
