/**
 * GIA Chat Service
 * Natural language booking interface - the ChatGPT of sports booking
 * 
 * "GIA, book me a pickleball court tomorrow at 6pm"
 * "Find me a tennis coach near downtown"
 * "What's open tonight?"
 */

import { db, auth } from "../firebase-config"
import { LAUNCH_CITIES, isBookingEnabled, BOOKABLE_SPORTS } from "../launch-cities"

const CONVERSATIONS_COLLECTION = "gia_conversations"
const MESSAGES_COLLECTION = "messages"

// Intent types GIA can handle
export type GiaIntent =
    | "book_court"
    | "find_venue"
    | "find_trainer"
    | "check_availability"
    | "cancel_booking"
    | "get_recommendations"
    | "league_info"
    | "weather_check"
    | "general_question"
    | "unknown"

export interface GiaMessage {
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: Date

    // If GIA took action
    intent?: GiaIntent
    action?: {
        type: "booking_created" | "venue_shown" | "trainer_shown" | "league_shown"
        data: any
    }

    // Quick replies to show
    quickReplies?: string[]
}

export interface GiaConversation {
    id: string
    userId: string
    createdAt: Date
    updatedAt: Date
    messageCount: number
}

// Keywords for intent detection
const INTENT_KEYWORDS = {
    book_court: ["book", "reserve", "schedule", "get me", "i want", "booking"],
    find_venue: ["find", "where", "show me", "courts near", "venues", "places"],
    find_trainer: ["trainer", "coach", "instructor", "lesson", "teach"],
    check_availability: ["available", "open", "what's open", "tonight", "free slots"],
    cancel_booking: ["cancel", "remove", "delete booking"],
    get_recommendations: ["recommend", "suggest", "best", "top rated"],
    league_info: ["league", "tournament", "competition", "matches", "join league"],
    weather_check: ["weather", "rain", "outdoor", "conditions"],
}

// Sport detection
const SPORT_KEYWORDS: { [key: string]: string } = {
    tennis: "Tennis",
    pickleball: "Pickleball",
    padel: "Padel",
    racquetball: "Racquetball",
    yoga: "Yoga",
    pilates: "Pilates",
}

// Time detection
const TIME_PATTERNS = {
    tonight: () => {
        const d = new Date()
        d.setHours(18, 0, 0, 0)
        return d
    },
    tomorrow: () => {
        const d = new Date()
        d.setDate(d.getDate() + 1)
        return d
    },
    "this weekend": () => {
        const d = new Date()
        const daysUntilSat = (6 - d.getDay() + 7) % 7 || 7
        d.setDate(d.getDate() + daysUntilSat)
        return d
    },
}

export const giaChatService = {
    /**
     * Start or get existing conversation
     */
    async getOrCreateConversation(userId: string): Promise<string> {
        if (!db) return ""

        try {
            // Check for recent conversation (last 24 hours)
            const oneDayAgo = new Date()
            oneDayAgo.setDate(oneDayAgo.getDate() - 1)

            const { collection, query, where, orderBy, limit, getDocs, addDoc } = await import("firebase/firestore")

            const recentQuery = query(
                collection(db, CONVERSATIONS_COLLECTION),
                where("userId", "==", userId),
                orderBy("updatedAt", "desc"),
                limit(1)
            )

            const snapshot = await getDocs(recentQuery)

            if (!snapshot.empty) {
                const conv = snapshot.docs[0]
                if (conv.data().updatedAt?.toDate?.() > oneDayAgo) {
                    return conv.id
                }
            }

            // Create new conversation
            const docRef = await addDoc(collection(db, CONVERSATIONS_COLLECTION), {
                userId,
                createdAt: new Date(),
                updatedAt: new Date(),
                messageCount: 0,
            })

            return docRef.id
        } catch (error) {
            console.error("Error getting conversation:", error)
            return ""
        }
    },

    /**
     * Parse user message to extract intent
     */
    parseIntent(message: string): {
        intent: GiaIntent
        sport?: string
        time?: Date
        location?: string
    } {
        const lower = message.toLowerCase()

        // Detect intent
        let intent: GiaIntent = "unknown"
        for (const [key, keywords] of Object.entries(INTENT_KEYWORDS)) {
            if (keywords.some(kw => lower.includes(kw))) {
                intent = key as GiaIntent
                break
            }
        }

        // Detect sport
        let sport: string | undefined
        for (const [keyword, sportName] of Object.entries(SPORT_KEYWORDS)) {
            if (lower.includes(keyword)) {
                sport = sportName
                break
            }
        }

        // Detect time
        let time: Date | undefined
        for (const [pattern, getDate] of Object.entries(TIME_PATTERNS)) {
            if (lower.includes(pattern)) {
                time = getDate()
                break
            }
        }

        // Check for specific time like "6pm", "18:00"
        const timeMatch = lower.match(/(\d{1,2})\s*(am|pm)/i)
        if (timeMatch) {
            let hours = parseInt(timeMatch[1])
            if (timeMatch[2].toLowerCase() === "pm" && hours < 12) hours += 12
            if (timeMatch[2].toLowerCase() === "am" && hours === 12) hours = 0

            const d = time || new Date()
            d.setHours(hours, 0, 0, 0)
            time = d
        }

        // Detect city
        let location: string | undefined
        for (const city of LAUNCH_CITIES) {
            if (lower.includes(city.name.toLowerCase()) ||
                city.aliases.some(a => lower.includes(a))) {
                location = city.name
                break
            }
        }

        return { intent, sport, time, location }
    },

    /**
     * Generate GIA's response based on intent
     */
    async generateResponse(
        userMessage: string,
        userId: string,
        userCity?: string
    ): Promise<{
        response: string
        intent: GiaIntent
        action?: GiaMessage["action"]
        quickReplies?: string[]
    }> {
        const parsed = this.parseIntent(userMessage)
        const city = parsed.location || userCity || "your area"

        switch (parsed.intent) {
            case "book_court": {
                const sport = parsed.sport || "court"
                const time = parsed.time
                    ? parsed.time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
                    : "your preferred time"
                const date = parsed.time
                    ? parsed.time.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
                    : "today"

                return {
                    response: `I found ${sport} courts available on ${date} around ${time} in ${city}! Here are your best options:`,
                    intent: "book_court",
                    action: {
                        type: "venue_shown",
                        data: { sport: parsed.sport, time: parsed.time, city },
                    },
                    quickReplies: ["Show me more options", "Book the first one", "Try a different time"],
                }
            }

            case "find_venue": {
                const sport = parsed.sport ? `${parsed.sport} venues` : "sports venues"
                return {
                    response: `Here are the top ${sport} near ${city}:`,
                    intent: "find_venue",
                    action: {
                        type: "venue_shown",
                        data: { sport: parsed.sport, city },
                    },
                    quickReplies: ["Show on map", "Filter by rating", "Check availability"],
                }
            }

            case "find_trainer": {
                const sport = parsed.sport || "sports"
                return {
                    response: `Great! I found these highly-rated ${sport} coaches near ${city}:`,
                    intent: "find_trainer",
                    action: {
                        type: "trainer_shown",
                        data: { sport: parsed.sport, city },
                    },
                    quickReplies: ["View profiles", "Check availability", "Book a session"],
                }
            }

            case "check_availability": {
                const time = parsed.time
                    ? parsed.time.toLocaleTimeString("en-US", { hour: "numeric" })
                    : "now"
                return {
                    response: `Checking what's open ${time === "now" ? "right now" : `around ${time}`} in ${city}...`,
                    intent: "check_availability",
                    quickReplies: ["Tennis courts", "Pickleball courts", "Yoga studios"],
                }
            }

            case "league_info": {
                const sport = parsed.sport || "sports"
                return {
                    response: `Here are ${sport} leagues happening in ${city}:`,
                    intent: "league_info",
                    action: {
                        type: "league_shown",
                        data: { sport: parsed.sport, city },
                    },
                    quickReplies: ["Beginner leagues", "Competitive leagues", "Weekend leagues"],
                }
            }

            case "get_recommendations": {
                return {
                    response: `Based on your activity, here's what I recommend in ${city}:`,
                    intent: "get_recommendations",
                    quickReplies: ["Courts", "Classes", "Trainers"],
                }
            }

            case "weather_check": {
                return {
                    response: `I'll check the conditions for outdoor play in ${city}. One moment...`,
                    intent: "weather_check",
                    quickReplies: ["Show indoor options", "Check tomorrow"],
                }
            }

            default:
                return {
                    response: "I can help you book courts, find trainers, discover venues, or join leagues! What would you like to do?",
                    intent: "general_question",
                    quickReplies: ["Book a court", "Find a trainer", "Explore nearby", "Find leagues"],
                }
        }
    },

    /**
     * Send message and get response
     */
    async chat(
        conversationId: string,
        userMessage: string,
        userId: string,
        userCity?: string
    ): Promise<GiaMessage> {
        if (!db) throw new Error("Database not available")

        const { collection, addDoc, updateDoc, doc, serverTimestamp } = await import("firebase/firestore")

        // Save user message
        const userMsgRef = await addDoc(
            collection(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_COLLECTION),
            {
                role: "user",
                content: userMessage,
                timestamp: serverTimestamp(),
            }
        )

        // Generate response
        const { response, intent, action, quickReplies } = await this.generateResponse(
            userMessage,
            userId,
            userCity
        )

        // Save assistant message
        const assistantMsgRef = await addDoc(
            collection(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_COLLECTION),
            {
                role: "assistant",
                content: response,
                timestamp: serverTimestamp(),
                intent,
                action,
                quickReplies,
            }
        )

        // Update conversation
        await updateDoc(doc(db, CONVERSATIONS_COLLECTION, conversationId), {
            updatedAt: serverTimestamp(),
        })

        return {
            id: assistantMsgRef.id,
            role: "assistant",
            content: response,
            timestamp: new Date(),
            intent,
            action,
            quickReplies,
        }
    },

    /**
     * Get conversation history
     */
    async getMessages(conversationId: string, limit: number = 50): Promise<GiaMessage[]> {
        if (!db) return []

        try {
            const { collection, query, orderBy, limit: limitFn, getDocs } = await import("firebase/firestore")

            const q = query(
                collection(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_COLLECTION),
                orderBy("timestamp", "desc"),
                limitFn(limit)
            )

            const snapshot = await getDocs(q)

            return snapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp?.toDate?.() || new Date(),
                }) as GiaMessage)
                .reverse()
        } catch (error) {
            console.error("Error getting messages:", error)
            return []
        }
    },

    /**
     * Get greeting based on time of day
     */
    getGreeting(userName?: string): string {
        const hour = new Date().getHours()
        const name = userName ? `, ${userName.split(" ")[0]}` : ""

        if (hour < 12) {
            return `Good morning${name}! ☀️ What would you like to play today?`
        } else if (hour < 17) {
            return `Good afternoon${name}! 🎾 Ready to book a court?`
        } else {
            return `Good evening${name}! 🌙 Looking for something to play tonight?`
        }
    },

    /**
     * Get suggested prompts based on user history
     */
    getSuggestedPrompts(recentSport?: string, recentCity?: string): string[] {
        const prompts = [
            "What's open tonight?",
            "Find me a pickleball court",
            "Show tennis leagues near me",
        ]

        if (recentSport) {
            prompts.unshift(`Book ${recentSport} this weekend`)
        }

        if (recentCity) {
            prompts.push(`What's popular in ${recentCity}?`)
        }

        return prompts.slice(0, 4)
    },
}

export default giaChatService
