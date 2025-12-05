import axios from "axios"

const AI_API_URL = process.env.EXPO_PUBLIC_AI_API_URL || "https://api.openai.com/v1/chat/completions"
const AI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || ""

export interface Message {
    role: "user" | "assistant" | "system"
    content: string
}

export const giaService = {
    /**
     * Send a message to GIA and get a response
     */
    async sendMessage(messages: Message[], userContext?: {
        location?: { city?: string; state?: string }
        sport?: string
        userType?: string
    }): Promise<string> {
        try {
            // Add system context
            const systemMessage: Message = {
                role: "system",
                content: `You are GIA, the AI assistant for GoodRunss - a platform that helps people find courts, trainers, and pickup games for sports like basketball, tennis, pickleball, etc.
        
User context:
- Location: ${userContext?.location?.city || "Unknown"}, ${userContext?.location?.state || ""}
- Sport: ${userContext?.sport || "recreational sports"}
- User type: ${userContext?.userType || "player"}

Your role is to help users:
1. Find nearby courts and venues
2. Book trainers and classes
3. Report court conditions
4. Find pickup games and players
5. Get workout recommendations

Be helpful, concise, and action-oriented. When appropriate, suggest using app features like "Find nearby courts" or "Book a trainer".`
            }

            const response = await axios.post(
                AI_API_URL,
                {
                    model: "gpt-4",
                    messages: [systemMessage, ...messages],
                    temperature: 0.7,
                    max_tokens: 500,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${AI_API_KEY}`,
                    },
                }
            )

            return response.data.choices[0].message.content
        } catch (error) {
            console.error("Error calling AI API:", error)

            // Fallback responses if API fails
            const fallbackResponses = [
                "I can help you with that! Let me find some options for you.",
                "Great question! Based on your preferences, here's what I recommend...",
                "I've found some great options near you. Would you like me to show more details?",
                "Perfect! I can set that up for you. Just confirm and we'll get started.",
            ]

            return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
        }
    },

    /**
     * Get suggested actions based on user input
     */
    getSuggestions(userInput: string, userContext?: any): string[] {
        const input = userInput.toLowerCase()

        if (input.includes("court") || input.includes("venue")) {
            return ["Find nearby courts", "Report court condition", "Check court traffic", "Get directions"]
        }

        if (input.includes("trainer") || input.includes("coach")) {
            return ["Find trainers", "Book a session", "View trainer profiles", "Check availability"]
        }

        if (input.includes("game") || input.includes("play")) {
            return ["Find pickup games", "Create player alert", "Check live traffic", "Find partners"]
        }

        if (input.includes("workout") || input.includes("exercise")) {
            return ["Generate workout plan", "Find classes", "Track progress", "Set goals"]
        }

        // Default suggestions
        return ["Find nearby courts", "Book a trainer", "Report conditions", "Find players"]
    }
}
