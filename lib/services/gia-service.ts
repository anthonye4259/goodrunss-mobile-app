/**
 * GIA Service - Unified AI Assistant
 * 
 * Consolidated from:
 * - gia-service.ts (OpenAI)
 * - gia-chat-service.ts (Conversation management)
 * - gia-ai-engine.ts (Gemini)
 * 
 * Features:
 * - Multi-provider AI (OpenAI/Gemini)
 * - Conversation history in Firestore
 * - Intent parsing (rule-based fallback)
 * - Smart slot recommendations
 * - Personalized greetings
 */

import { db, auth } from "../firebase-config"
import { LAUNCH_CITIES, isBookingEnabled, BOOKABLE_SPORTS, LaunchCityId } from "../launch-cities"

// Configuration
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
const CONVERSATIONS_COLLECTION = "gia_conversations"

// Types
export type GiaIntent =
    | "book_court"
    | "find_venue"
    | "find_trainer"
    | "league_info"
    | "check_crowd"
    | "weather_check"
    | "recommendations"
    | "general"

export interface GiaMessage {
    id: string
    role: "user" | "assistant" | "system"
    content: string
    timestamp: Date
    intent?: GiaIntent
    action?: {
        type: "show_venues" | "show_trainers" | "show_leagues" | "show_slots" | "none"
        params: Record<string, any>
    }
    quickReplies?: string[]
}

export interface GiaConversation {
    id: string
    userId: string
    createdAt: Date
    updatedAt: Date
    messageCount: number
}

export interface GiaResponse {
    message: string
    intent: GiaIntent
    extracted: {
        sport?: string
        date?: string
        time?: string
        city?: string
        skillLevel?: string
    }
    action: {
        type: string
        params: Record<string, any>
    }
    quickReplies: string[]
}

// Intent Detection Keywords
const INTENT_KEYWORDS: Record<GiaIntent, string[]> = {
    book_court: ["book", "reserve", "schedule", "get me", "i want", "booking"],
    find_venue: ["find", "where", "show me", "courts near", "venues", "places"],
    find_trainer: ["trainer", "coach", "lesson", "instructor", "teach"],
    league_info: ["league", "tournament", "join", "compete", "season"],
    check_crowd: ["busy", "crowded", "quiet", "packed", "how many people"],
    weather_check: ["weather", "rain", "outdoor", "conditions"],
    recommendations: ["recommend", "suggest", "what should", "best"],
    general: [],
}

// Sport Detection
const SPORT_KEYWORDS: Record<string, string> = {
    tennis: "Tennis",
    pickleball: "Pickleball",
    padel: "Padel",
    racquetball: "Racquetball",
    yoga: "Yoga",
    pilates: "Pilates",
    basketball: "Basketball",
}

// Time Patterns
const getTimeFromPhrase = (phrase: string): Date | null => {
    const now = new Date()
    const lower = phrase.toLowerCase()

    if (lower.includes("tonight")) {
        const d = new Date()
        d.setHours(19, 0, 0, 0)
        return d
    }
    if (lower.includes("tomorrow")) {
        const d = new Date()
        d.setDate(d.getDate() + 1)
        d.setHours(18, 0, 0, 0)
        return d
    }
    if (lower.includes("weekend") || lower.includes("saturday")) {
        const d = new Date()
        const daysUntilSat = (6 - d.getDay() + 7) % 7 || 7
        d.setDate(d.getDate() + daysUntilSat)
        d.setHours(10, 0, 0, 0)
        return d
    }

    // Time extraction (e.g., "6pm", "18:00")
    const timeMatch = lower.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i)
    if (timeMatch) {
        let hours = parseInt(timeMatch[1])
        const minutes = parseInt(timeMatch[2] || "0")
        const ampm = timeMatch[3]?.toLowerCase()

        if (ampm === "pm" && hours < 12) hours += 12
        if (ampm === "am" && hours === 12) hours = 0

        const d = new Date()
        d.setHours(hours, minutes, 0, 0)
        return d
    }

    return null
}

// System Prompt
const getSystemPrompt = (userContext: { city?: string; userName?: string; sport?: string }) => `
You are GIA, the AI assistant for GoodRunss - a sports and wellness booking platform.

User context:
- Name: ${userContext.userName || "there"}
- City: ${userContext.city || "Unknown"}
- Preferred sport: ${userContext.sport || "various sports"}

Available cities: Atlanta, Myrtle Beach, San Francisco, NYC, Austin, Phoenix, Miami

Your capabilities:
1. Book courts (tennis, pickleball, padel, racquetball)
2. Find trainers and coaches
3. Join leagues
4. Check venue crowd levels
5. Get personalized recommendations

Be helpful, concise (2-3 sentences), and action-oriented. Use sports metaphors occasionally.
Respond in JSON format:
{
  "message": "Your response",
  "intent": "book_court|find_venue|find_trainer|league_info|check_crowd|recommendations|general",
  "extracted": { "sport": null, "date": null, "time": null, "city": null },
  "action": { "type": "show_venues|show_trainers|show_leagues|show_slots|none", "params": {} },
  "quickReplies": ["suggestion 1", "suggestion 2"]
}
`

// Main Service
export const giaService = {
    /**
     * Process message with AI (OpenAI or Gemini)
     */
    async processWithAI(
        userMessage: string,
        context: {
            userId: string
            userName?: string
            userCity?: string
            conversationHistory?: GiaMessage[]
            recentSports?: string[]
        },
        provider: "openai" | "gemini" = "openai",
        apiKey?: string
    ): Promise<GiaResponse> {
        // If no API key, use rule-based
        if (!apiKey) {
            return this.processWithRules(userMessage, context)
        }

        try {
            const systemPrompt = getSystemPrompt({
                city: context.userCity,
                userName: context.userName,
                sport: context.recentSports?.[0],
            })

            const history = context.conversationHistory?.slice(-5) || []

            if (provider === "gemini") {
                return await this.callGemini(userMessage, systemPrompt, history, apiKey)
            } else {
                return await this.callOpenAI(userMessage, systemPrompt, history, apiKey)
            }
        } catch (error) {
            console.error("AI processing error:", error)
            return this.processWithRules(userMessage, context)
        }
    },

    /**
     * Call OpenAI GPT-4
     */
    async callOpenAI(
        userMessage: string,
        systemPrompt: string,
        history: GiaMessage[],
        apiKey: string
    ): Promise<GiaResponse> {
        const messages = [
            { role: "system", content: systemPrompt },
            ...history.map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: userMessage },
        ]

        const response = await fetch(OPENAI_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages,
                temperature: 0.7,
                max_tokens: 500,
            }),
        })

        const data = await response.json()
        const text = data.choices?.[0]?.message?.content

        return this.parseAIResponse(text)
    },

    /**
     * Call Google Gemini
     */
    async callGemini(
        userMessage: string,
        systemPrompt: string,
        history: GiaMessage[],
        apiKey: string
    ): Promise<GiaResponse> {
        const prompt = `${systemPrompt}

Previous conversation:
${history.map(h => `${h.role}: ${h.content}`).join("\n")}

User: ${userMessage}

Respond with valid JSON only.`

        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1024,
                },
            }),
        })

        const data = await response.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text

        return this.parseAIResponse(text)
    },

    /**
     * Parse AI response JSON
     */
    parseAIResponse(text: string | undefined): GiaResponse {
        if (!text) {
            return this.getDefaultResponse()
        }

        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]) as GiaResponse
            }
        } catch (e) {
            console.error("Failed to parse AI response:", e)
        }

        return this.getDefaultResponse()
    },

    /**
     * Rule-based processing (fallback)
     */
    processWithRules(
        userMessage: string,
        context: { userId: string; userCity?: string; userName?: string }
    ): GiaResponse {
        const lower = userMessage.toLowerCase()
        const greeting = context.userName ? `${context.userName.split(" ")[0]}! ` : ""
        const city = context.userCity || "your area"

        // Detect intent
        let intent: GiaIntent = "general"
        for (const [key, keywords] of Object.entries(INTENT_KEYWORDS)) {
            if (keywords.some(kw => lower.includes(kw))) {
                intent = key as GiaIntent
                break
            }
        }

        // Extract sport
        let sport: string | undefined
        for (const [keyword, sportName] of Object.entries(SPORT_KEYWORDS)) {
            if (lower.includes(keyword)) {
                sport = sportName
                break
            }
        }

        // Extract city
        let extractedCity: string | undefined
        for (const c of LAUNCH_CITIES) {
            if (lower.includes(c.name.toLowerCase()) || c.aliases.some(a => lower.includes(a))) {
                extractedCity = c.name
                break
            }
        }

        // Extract time
        const time = getTimeFromPhrase(lower)

        // Generate response based on intent
        const responses: Record<GiaIntent, () => GiaResponse> = {
            book_court: () => ({
                message: `${greeting}Let's get you booked! 🎾 I found ${sport || "court"} availability in ${city}.`,
                intent: "book_court",
                extracted: { sport, city: extractedCity, date: time?.toISOString().split("T")[0] },
                action: { type: "show_slots", params: { sport, city: extractedCity || city } },
                quickReplies: ["This evening", "Tomorrow morning", "This weekend"],
            }),
            find_venue: () => ({
                message: `${greeting}Looking for ${sport || "sports"} venues near ${city}? Here are your best options:`,
                intent: "find_venue",
                extracted: { sport, city: extractedCity },
                action: { type: "show_venues", params: { sport, city: extractedCity || city } },
                quickReplies: ["Show on map", "Filter by rating", "Check availability"],
            }),
            find_trainer: () => ({
                message: `${greeting}I'll connect you with top-rated ${sport || "sports"} coaches! 💪`,
                intent: "find_trainer",
                extracted: { sport, city: extractedCity },
                action: { type: "show_trainers", params: { sport, city: extractedCity || city } },
                quickReplies: ["View profiles", "Check rates", "Book a session"],
            }),
            league_info: () => ({
                message: `${greeting}Great choice! 🏆 Here are ${sport || "sports"} leagues forming in ${city}:`,
                intent: "league_info",
                extracted: { sport, city: extractedCity },
                action: { type: "show_leagues", params: { sport, city: extractedCity || city } },
                quickReplies: ["Beginner leagues", "Competitive", "Weekend leagues"],
            }),
            check_crowd: () => ({
                message: `${greeting}Checking current crowd levels... 👀 Most venues are moderate right now.`,
                intent: "check_crowd",
                extracted: { city: extractedCity },
                action: { type: "show_venues", params: { city: extractedCity || city } },
                quickReplies: ["Show quiet venues", "Peak hours", "Best times"],
            }),
            weather_check: () => ({
                message: `${greeting}Outdoor conditions look good for ${sport || "playing"} today! ☀️`,
                intent: "weather_check",
                extracted: { sport },
                action: { type: "none", params: {} },
                quickReplies: ["Find indoor courts", "Book now", "Check forecast"],
            }),
            recommendations: () => ({
                message: `${greeting}Based on what's popular in ${city}, I'd suggest trying pickleball - it's 🔥!`,
                intent: "recommendations",
                extracted: { city: extractedCity },
                action: { type: "show_venues", params: { sport: "Pickleball", city: extractedCity || city } },
                quickReplies: ["Show pickleball", "Try something else", "What's trending?"],
            }),
            general: () => ({
                message: `${greeting}I can help you book courts, find trainers, join leagues, or discover venues! What sounds good? 🎾`,
                intent: "general",
                extracted: {},
                action: { type: "none", params: {} },
                quickReplies: ["Book a court", "Find trainers", "Join a league", "Explore venues"],
            }),
        }

        return responses[intent]()
    },

    /**
     * Default response
     */
    getDefaultResponse(): GiaResponse {
        return {
            message: "I can help you book courts, find trainers, or discover venues! What would you like to do?",
            intent: "general",
            extracted: {},
            action: { type: "none", params: {} },
            quickReplies: ["Book a court", "Find trainers", "Explore venues"],
        }
    },

    // ========================
    // CONVERSATION MANAGEMENT
    // ========================

    /**
     * Get or create conversation
     */
    async getOrCreateConversation(userId: string): Promise<string> {
        if (!db) throw new Error("Firestore not initialized")

        const { collection, query, where, orderBy, limit, getDocs, addDoc, serverTimestamp } =
            await import("firebase/firestore")

        // Check for recent conversation (within 30 min)
        const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000)
        const q = query(
            collection(db, CONVERSATIONS_COLLECTION),
            where("userId", "==", userId),
            orderBy("updatedAt", "desc"),
            limit(1)
        )

        const snapshot = await getDocs(q)
        if (!snapshot.empty) {
            const conv = snapshot.docs[0]
            const lastUpdate = conv.data().updatedAt?.toDate?.()
            if (lastUpdate && lastUpdate > thirtyMinAgo) {
                return conv.id
            }
        }

        // Create new conversation
        const newConv = await addDoc(collection(db, CONVERSATIONS_COLLECTION), {
            userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            messageCount: 0,
        })

        return newConv.id
    },

    /**
     * Save message to conversation
     */
    async saveMessage(
        conversationId: string,
        message: Omit<GiaMessage, "id" | "timestamp">
    ): Promise<string> {
        if (!db) throw new Error("Firestore not initialized")

        const { collection, addDoc, doc, updateDoc, increment, serverTimestamp } =
            await import("firebase/firestore")

        const msgRef = await addDoc(
            collection(db, CONVERSATIONS_COLLECTION, conversationId, "messages"),
            {
                ...message,
                timestamp: serverTimestamp(),
            }
        )

        // Update conversation
        await updateDoc(doc(db, CONVERSATIONS_COLLECTION, conversationId), {
            updatedAt: serverTimestamp(),
            messageCount: increment(1),
        })

        return msgRef.id
    },

    /**
     * Get conversation messages
     */
    async getMessages(conversationId: string, limitCount = 50): Promise<GiaMessage[]> {
        if (!db) return []

        const { collection, query, orderBy, limit, getDocs } = await import("firebase/firestore")

        const q = query(
            collection(db, CONVERSATIONS_COLLECTION, conversationId, "messages"),
            orderBy("timestamp", "desc"),
            limit(limitCount)
        )

        const snapshot = await getDocs(q)
        return snapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate?.() || new Date(),
            }))
            .reverse() as GiaMessage[]
    },

    /**
     * Full chat flow
     */
    async chat(
        userId: string,
        userMessage: string,
        userCity?: string,
        userName?: string,
        apiKey?: string,
        provider: "openai" | "gemini" = "openai"
    ): Promise<GiaMessage> {
        // Get or create conversation
        const conversationId = await this.getOrCreateConversation(userId)

        // Get history
        const history = await this.getMessages(conversationId, 10)

        // Save user message
        await this.saveMessage(conversationId, {
            role: "user",
            content: userMessage,
        })

        // Process with AI
        const response = await this.processWithAI(
            userMessage,
            { userId, userName, userCity, conversationHistory: history },
            provider,
            apiKey
        )

        // Save assistant message
        const msgId = await this.saveMessage(conversationId, {
            role: "assistant",
            content: response.message,
            intent: response.intent,
            action: response.action,
            quickReplies: response.quickReplies,
        })

        return {
            id: msgId,
            role: "assistant",
            content: response.message,
            timestamp: new Date(),
            intent: response.intent,
            action: response.action,
            quickReplies: response.quickReplies,
        }
    },

    // ========================
    // UTILITY FUNCTIONS
    // ========================

    /**
     * Get personalized greeting
     */
    getGreeting(userName?: string, recentSport?: string): string {
        const hour = new Date().getHours()
        const name = userName ? userName.split(" ")[0] : ""
        const timeGreeting = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening"

        if (recentSport) {
            return `Good ${timeGreeting}${name ? ` ${name}` : ""}! 🎾 Ready for some ${recentSport}?`
        }
        return `Good ${timeGreeting}${name ? ` ${name}` : ""}! 👋 What would you like to play today?`
    },

    /**
     * Get suggested prompts
     */
    getSuggestedPrompts(recentSport?: string, recentCity?: string): string[] {
        if (recentSport && recentCity) {
            return [
                `Book ${recentSport} in ${recentCity}`,
                `Find ${recentSport} trainers`,
                `${recentSport} leagues near me`,
                "What's open now?",
            ]
        }
        return [
            "Book a pickleball court",
            "Find a tennis coach",
            "Join a league",
            "What's trending?",
        ]
    },

    /**
     * Get smart slot recommendations
     */
    async getSmartSlotRecommendations(
        userId: string,
        sport?: string
    ): Promise<{ date: string; time: string; reason: string }[]> {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)

        return [
            {
                date: tomorrow.toISOString().split("T")[0],
                time: "18:00",
                reason: "Your usual time, low crowd expected",
            },
            {
                date: new Date().toISOString().split("T")[0],
                time: "20:00",
                reason: "Available tonight! $5 less than peak",
            },
        ]
    },
}

export default giaService
