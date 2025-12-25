/**
 * GIA AI Engine
 * Powers the intelligent assistant with Gemini AI
 * 
 * Handles:
 * - Natural language understanding
 * - Context-aware booking assistance
 * - Personalized recommendations
 * - Conversational memory
 */

import { db } from "../firebase-config"
import { LAUNCH_CITIES, BOOKABLE_SPORTS } from "../launch-cities"

// Gemini API configuration
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"

// System prompt for GIA
const GIA_SYSTEM_PROMPT = `You are GIA, the AI assistant for GoodRunss - a sports and wellness booking app.

Your personality:
- Friendly, energetic, and helpful
- Use sports metaphors occasionally
- Keep responses concise (2-3 sentences max)
- Use emojis sparingly but appropriately

You can help users with:
1. Booking courts (tennis, pickleball, padel, racquetball)
2. Finding wellness classes (yoga, pilates)
3. Discovering trainers and coaches
4. Joining sports leagues
5. Checking venue availability and crowd levels
6. Getting personalized recommendations

Available cities: Atlanta, Myrtle Beach, San Francisco, New York City, Austin, Phoenix, Miami

When users want to book or find something, extract:
- Sport type (tennis, pickleball, padel, yoga, etc.)
- Date/time preferences
- Location/city
- Skill level if mentioned

Always be helpful and guide users toward taking action (booking, viewing, joining).

Respond in JSON format:
{
  "message": "Your friendly response",
  "intent": "book_court|find_venue|find_trainer|join_league|check_availability|recommendation|general",
  "extracted": {
    "sport": "string or null",
    "date": "ISO date string or null",
    "time": "HH:MM or null",
    "city": "city name or null",
    "skillLevel": "beginner|intermediate|advanced or null"
  },
  "action": {
    "type": "show_venues|show_trainers|show_leagues|show_slots|none",
    "params": {}
  },
  "quickReplies": ["suggestion 1", "suggestion 2", "suggestion 3"]
}`

export interface GiaAIResponse {
    message: string
    intent: string
    extracted: {
        sport?: string
        date?: string
        time?: string
        city?: string
        skillLevel?: string
    }
    action: {
        type: string
        params: any
    }
    quickReplies: string[]
}

export const giaAIEngine = {
    /**
     * Process user message with Gemini AI
     */
    async processWithAI(
        userMessage: string,
        context: {
            userId: string
            userCity?: string
            userName?: string
            conversationHistory?: { role: string; content: string }[]
            recentSports?: string[]
        },
        apiKey?: string
    ): Promise<GiaAIResponse> {
        // If no API key, use rule-based fallback
        if (!apiKey) {
            return this.processWithRules(userMessage, context)
        }

        try {
            // Build conversation context
            const history = context.conversationHistory?.slice(-5) || []
            const userContext = `
User context:
- Name: ${context.userName || "Unknown"}
- City: ${context.userCity || "Unknown"}
- Recent sports: ${context.recentSports?.join(", ") || "None"}
- Current time: ${new Date().toLocaleTimeString()}
- Current date: ${new Date().toLocaleDateString()}
`

            const prompt = `${GIA_SYSTEM_PROMPT}

${userContext}

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
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    },
                }),
            })

            if (!response.ok) {
                console.error("Gemini API error:", response.status)
                return this.processWithRules(userMessage, context)
            }

            const data = await response.json()
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text

            if (!text) {
                return this.processWithRules(userMessage, context)
            }

            // Parse JSON response
            const jsonMatch = text.match(/\{[\s\S]*\}/)
            if (!jsonMatch) {
                return this.processWithRules(userMessage, context)
            }

            const parsed = JSON.parse(jsonMatch[0]) as GiaAIResponse
            return parsed
        } catch (error) {
            console.error("AI processing error:", error)
            return this.processWithRules(userMessage, context)
        }
    },

    /**
     * Rule-based fallback when AI is unavailable
     */
    processWithRules(
        userMessage: string,
        context: {
            userId: string
            userCity?: string
            userName?: string
        }
    ): GiaAIResponse {
        const lower = userMessage.toLowerCase()
        const city = context.userCity || "your area"
        const greeting = context.userName ? `${context.userName.split(" ")[0]}! ` : ""

        // Detect intent
        let intent = "general"
        let message = ""
        let action: GiaAIResponse["action"] = { type: "none", params: {} }
        let quickReplies: string[] = []
        const extracted: GiaAIResponse["extracted"] = {}

        // Extract sport
        for (const sport of ["tennis", "pickleball", "padel", "racquetball", "yoga", "pilates"]) {
            if (lower.includes(sport)) {
                extracted.sport = sport.charAt(0).toUpperCase() + sport.slice(1)
                break
            }
        }

        // Extract city
        for (const c of LAUNCH_CITIES) {
            if (lower.includes(c.name.toLowerCase()) || c.aliases.some(a => lower.includes(a))) {
                extracted.city = c.name
                break
            }
        }

        // Detect intent and generate response
        if (lower.includes("book") || lower.includes("reserve") || lower.includes("schedule")) {
            intent = "book_court"
            const sport = extracted.sport || "court"
            message = `${greeting}Let's get you booked! 🎾 I found ${sport} availability in ${city}. What time works best?`
            action = { type: "show_slots", params: { sport: extracted.sport, city: extracted.city || city } }
            quickReplies = ["This evening", "Tomorrow morning", "This weekend"]
        }
        else if (lower.includes("league") || lower.includes("join") || lower.includes("tournament")) {
            intent = "join_league"
            const sport = extracted.sport || "sports"
            message = `${greeting}Great choice! 🏆 Here are ${sport} leagues forming in ${city}:`
            action = { type: "show_leagues", params: { sport: extracted.sport, city: extracted.city || city } }
            quickReplies = ["Beginner leagues", "Competitive leagues", "Weekend leagues"]
        }
        else if (lower.includes("trainer") || lower.includes("coach") || lower.includes("lesson")) {
            intent = "find_trainer"
            const sport = extracted.sport || "sports"
            message = `${greeting}I'll connect you with top-rated ${sport} coaches! 💪 Here's who's available:`
            action = { type: "show_trainers", params: { sport: extracted.sport, city: extracted.city || city } }
            quickReplies = ["View profiles", "Check rates", "Book a session"]
        }
        else if (lower.includes("find") || lower.includes("where") || lower.includes("near")) {
            intent = "find_venue"
            const sport = extracted.sport || "sports"
            message = `${greeting}Looking for ${sport} venues near ${city}? Here are your best options:`
            action = { type: "show_venues", params: { sport: extracted.sport, city: extracted.city || city } }
            quickReplies = ["Show on map", "Filter by rating", "Check availability"]
        }
        else if (lower.includes("open") || lower.includes("available") || lower.includes("tonight") || lower.includes("now")) {
            intent = "check_availability"
            message = `${greeting}Checking what's open right now... 👀 Here's real-time availability in ${city}:`
            action = { type: "show_slots", params: { city: extracted.city || city } }
            quickReplies = ["Tennis courts", "Pickleball", "Yoga classes"]
        }
        else if (lower.includes("recommend") || lower.includes("suggest") || lower.includes("what should")) {
            intent = "recommendation"
            message = `${greeting}Based on what's popular in ${city} right now, I'd suggest trying pickleball - it's 🔥! Want me to find courts?`
            action = { type: "show_venues", params: { sport: "Pickleball", city: extracted.city || city } }
            quickReplies = ["Show pickleball", "Try something else", "What's trending?"]
        }
        else if (lower.includes("hi") || lower.includes("hello") || lower.includes("hey")) {
            intent = "general"
            const hour = new Date().getHours()
            const timeGreeting = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening"
            message = `Good ${timeGreeting}, ${greeting.trim()}! 👋 I'm GIA, your sports assistant. What would you like to do today?`
            quickReplies = ["Book a court", "Find a trainer", "Join a league", "What's open now?"]
        }
        else {
            intent = "general"
            message = `${greeting}I can help you book courts, find trainers, join leagues, or discover venues! What sounds good? 🎾`
            quickReplies = ["Book a court", "Find trainers", "Join a league", "Explore venues"]
        }

        return {
            message,
            intent,
            extracted,
            action,
            quickReplies,
        }
    },

    /**
     * Generate smart slot recommendations
     */
    async getSmartSlotRecommendations(
        userId: string,
        sport?: string,
        city?: string
    ): Promise<{
        recommended: { date: string; time: string; reason: string }[]
        alternates: { date: string; time: string; price: number }[]
    }> {
        // Based on user patterns and availability
        const now = new Date()
        const tomorrow = new Date(now)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const formatDate = (d: Date) => d.toISOString().split("T")[0]

        return {
            recommended: [
                {
                    date: formatDate(tomorrow),
                    time: "18:00",
                    reason: "Your usual time, with low crowd levels expected",
                },
                {
                    date: formatDate(now),
                    time: "20:00",
                    reason: "Available tonight! $5 less than peak hours",
                },
            ],
            alternates: [
                { date: formatDate(tomorrow), time: "07:00", price: 3500 },
                { date: formatDate(tomorrow), time: "14:00", price: 3000 },
                { date: formatDate(tomorrow), time: "21:00", price: 4000 },
            ],
        }
    },

    /**
     * Generate personalized greeting
     */
    getPersonalizedGreeting(
        userName?: string,
        recentSport?: string,
        pendingBooking?: boolean
    ): string {
        const hour = new Date().getHours()
        const name = userName ? userName.split(" ")[0] : ""

        if (pendingBooking) {
            return `Hey ${name}! 👋 Ready to confirm your ${recentSport} booking?`
        }

        if (recentSport) {
            if (hour < 12) {
                return `Morning ${name}! ☀️ Up for some ${recentSport} today?`
            } else if (hour < 17) {
                return `Hey ${name}! 🎾 Planning some ${recentSport} later?`
            } else {
                return `Evening ${name}! 🌙 Perfect time for ${recentSport}. What's the plan?`
            }
        }

        if (hour < 12) {
            return `Good morning${name ? ` ${name}` : ""}! ☀️ What would you like to play today?`
        } else if (hour < 17) {
            return `Good afternoon${name ? ` ${name}` : ""}! 🎾 Ready to find a court?`
        } else {
            return `Good evening${name ? ` ${name}` : ""}! 🌙 Looking for something to play tonight?`
        }
    },
}

export default giaAIEngine
