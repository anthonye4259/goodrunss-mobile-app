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
        healthData?: {
            todayStats?: { steps: number; calories: number; activeMinutes: number }
            weeklyStats?: { totalWorkouts: number; totalCalories: number; totalMinutes: number; favoriteActivity?: string }
            recentWorkouts?: Array<{ workoutType: string; duration: number; calories: number; date: Date }>
        }
    }): Promise<string> {
        try {
            // Build health context string
            let healthContext = "";
            if (userContext?.healthData) {
                const { todayStats, weeklyStats, recentWorkouts } = userContext.healthData;

                if (todayStats) {
                    healthContext += `\n\nToday's Activity:\n- Steps: ${todayStats.steps.toLocaleString()}\n- Calories burned: ${todayStats.calories}\n- Active minutes: ${todayStats.activeMinutes}`;
                }

                if (weeklyStats) {
                    healthContext += `\n\nThis Week:\n- Workouts: ${weeklyStats.totalWorkouts}\n- Total calories: ${weeklyStats.totalCalories.toLocaleString()}\n- Total minutes: ${weeklyStats.totalMinutes}\n- Favorite activity: ${weeklyStats.favoriteActivity || 'N/A'}`;
                }

                if (recentWorkouts && recentWorkouts.length > 0) {
                    const recent = recentWorkouts.slice(0, 3);
                    healthContext += `\n\nRecent Workouts:\n${recent.map(w => `- ${w.workoutType}: ${w.duration} min, ${w.calories} cal`).join('\n')}`;
                }
            }

            // Add system context
            const systemMessage: Message = {
                role: "system",
                content: `You are GIA, the AI fitness coach for GoodRunss - a platform that helps people find courts, trainers, and pickup games for sports like basketball, tennis, pickleball, etc.
        
User context:
- Location: ${userContext?.location?.city || "Unknown"}, ${userContext?.location?.state || ""}
- Sport: ${userContext?.sport || "recreational sports"}
- User type: ${userContext?.userType || "player"}${healthContext}

Your role is to help users:
1. Find nearby courts and venues
2. Book trainers and classes
3. Report court conditions
4. Find pickup games and players
5. Get personalized workout recommendations based on their fitness data

Be helpful, concise, and action-oriented. Use their health data to provide personalized recommendations. 
- If they've been very active, suggest recovery or lighter activities
- If they haven't been active, encourage them to get moving
- Celebrate their achievements and progress
- Provide specific, actionable suggestions based on their activity patterns

When appropriate, suggest using app features like "Find nearby courts" or "Book a trainer".`
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
