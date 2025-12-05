import { Venue } from '@/lib/venue-data'

export class ReviewGenerator {
    private static instance: ReviewGenerator

    static getInstance(): ReviewGenerator {
        if (!ReviewGenerator.instance) {
            ReviewGenerator.instance = new ReviewGenerator()
        }
        return ReviewGenerator.instance
    }

    /**
     * Generate a realistic review using AI (or templates if API unavailable)
     */
    async generateReview(venue: Venue, rating: number): Promise<string> {
        // Try OpenAI first
        try {
            const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY
            if (!apiKey) throw new Error('No API key')

            const prompt = `Write a realistic ${rating}-star review for ${venue.name}, a ${venue.sport} facility in ${venue.city || 'the area'}. 

Include:
- Specific facility details (court condition, equipment, etc.)
- Time of visit
- Crowd level
${rating < 5 ? '- One pro and one con' : '- What you liked most'}

Keep it under 80 words. Sound like a real person, casual tone.`

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 150,
                    temperature: 0.9,
                }),
            })

            const data = await response.json()
            return data.choices[0].message.content.trim()
        } catch (error) {
            // Fallback to template-based reviews
            return this.generateTemplateReview(venue, rating)
        }
    }

    /**
     * Generate review using templates (fallback)
     */
    private generateTemplateReview(venue: Venue, rating: number): string {
        const templates = this.getReviewTemplates(venue.sport, rating)
        const template = templates[Math.floor(Math.random() * templates.length)]

        return template
            .replace('{venue}', venue.name)
            .replace('{sport}', venue.sport.toLowerCase())
    }

    /**
     * Get review templates by sport and rating
     */
    private getReviewTemplates(sport: string, rating: number): string[] {
        const sportLower = sport.toLowerCase()

        if (rating === 5) {
            return [
                `Amazing ${sportLower} court! Came here Saturday morning and it was perfect. Great surface, good lighting, and friendly crowd. Will definitely be back!`,
                `Best ${sportLower} spot in the area. Equipment is top-notch, facility is clean, and there's always good competition. Highly recommend!`,
                `Love this place! Been coming here for months. The ${sportLower} courts are well-maintained and the vibe is great. 5 stars!`,
            ]
        } else if (rating === 4) {
            return [
                `Solid ${sportLower} facility. Courts are in good shape, though lighting could be better. Came on a weekday evening, wasn't too crowded. Would come back.`,
                `Pretty good spot for ${sportLower}. Equipment is decent, parking is easy. Only complaint is it gets packed on weekends. Overall worth it.`,
                `Good ${sportLower} courts. Surface is nice, crowd is friendly. A bit pricey but you get what you pay for. 4/5`,
            ]
        } else if (rating === 3) {
            return [
                `Decent ${sportLower} court but nothing special. Came Tuesday afternoon, it was okay. Surface needs some work and equipment is aging. It'll do in a pinch.`,
                `Average facility. The ${sportLower} courts are playable but could use maintenance. Crowd varies. Fine if you're nearby but wouldn't go out of my way.`,
                `It's alright. ${sportLower} equipment works but shows wear. Lighting is hit or miss. Better options exist but this works if you're local.`,
            ]
        } else if (rating === 2) {
            return [
                `Disappointing. ${sportLower} courts are in rough shape, equipment needs replacing. Came Saturday and it was overcrowded. Wouldn't recommend unless desperate.`,
                `Not great. Surface is cracked, lighting is poor, and it's usually too crowded. The ${sportLower} equipment barely works. Skip this one.`,
                `Below average. ${sportLower} facility needs serious maintenance. Went once, won't be back. Too many better options around.`,
            ]
        } else {
            return [
                `Terrible experience. ${sportLower} courts are in awful condition, equipment is broken. Don't waste your time or money here.`,
                `Worst ${sportLower} facility I've been to. Everything is falling apart, staff doesn't care. Avoid at all costs.`,
            ]
        }
    }

    /**
     * Generate realistic rating (weighted distribution)
     */
    generateRealisticRating(): number {
        const rand = Math.random()

        // Distribution: 15% 5-star, 35% 4-star, 35% 3-star, 12% 2-star, 3% 1-star
        if (rand < 0.15) return 5
        if (rand < 0.50) return 4
        if (rand < 0.85) return 3
        if (rand < 0.97) return 2
        return 1
    }

    /**
     * Generate a past date within the last N days
     */
    generatePastDate(maxDaysAgo: number = 90): Date {
        const daysAgo = Math.floor(Math.random() * maxDaysAgo)
        const date = new Date()
        date.setDate(date.getDate() - daysAgo)
        return date
    }

    /**
     * Generate realistic user name
     */
    generateUserName(): string {
        const firstNames = [
            'Mike', 'Sarah', 'James', 'Emily', 'Chris', 'Alex',
            'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie',
            'Sam', 'Pat', 'Drew', 'Avery'
        ]
        const lastInitials = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
        const lastInitial = lastInitials[Math.floor(Math.random() * lastInitials.length)]

        return `${firstName} ${lastInitial}.`
    }

    /**
     * Generate multiple reviews for a venue
     */
    async generateVenueReviews(venue: Venue, count: number = 10): Promise<Array<{
        rating: number
        text: string
        timestamp: Date
        userName: string
    }>> {
        const reviews = []

        for (let i = 0; i < count; i++) {
            const rating = this.generateRealisticRating()
            const text = await this.generateReview(venue, rating)

            reviews.push({
                rating,
                text,
                timestamp: this.generatePastDate(90),
                userName: this.generateUserName(),
            })
        }

        // Sort by date (newest first)
        return reviews.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    }
}
