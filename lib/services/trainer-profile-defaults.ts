/**
 * Trainer Profile Defaults & AI Tagline Generator
 * 
 * - All trainers start with 5.0 rating
 * - AI generates a catchy 3-4 word persona/tagline (like Spotify Wrapped)
 */

// ============================================
// DEFAULT TRAINER PROFILE VALUES
// ============================================

export const DEFAULT_TRAINER_RATING = 5.0
export const DEFAULT_REVIEW_COUNT = 0

// ============================================
// AI TAGLINE GENERATOR
// ============================================

type ActivityType =
    | "tennis" | "pickleball" | "basketball" | "golf" | "yoga"
    | "swimming" | "running" | "fitness" | "boxing" | "soccer"
    | "volleyball" | "personal_training" | "pilates" | "crossfit" | "martial_arts"

interface TaglineStyle {
    adjectives: string[]
    nouns: string[]
    combos: string[] // Pre-made combinations
}

const TAGLINE_STYLES: Record<ActivityType | "default", TaglineStyle> = {
    tennis: {
        adjectives: ["Court", "Net", "Ace", "Rally", "Baseline", "Serve"],
        nouns: ["Wizard", "Master", "Guru", "Whisperer", "Commander", "Boss"],
        combos: ["Court Commander", "Ace Maker", "Net Ninja", "Rally Master", "Baseline Boss", "Serve Specialist"],
    },
    pickleball: {
        adjectives: ["Pickle", "Dink", "Kitchen", "Paddle", "Court"],
        nouns: ["Queen", "King", "Pro", "Master", "Legend", "Boss"],
        combos: ["Pickleball Royalty", "Dink Dynasty", "Kitchen Commander", "Paddle Pro", "The Dink Master"],
    },
    basketball: {
        adjectives: ["Hoops", "Court", "Bucket", "Swish", "Slam"],
        nouns: ["Legend", "Mentor", "Guru", "Coach", "Master"],
        combos: ["Buckets Only", "Hoops Whisperer", "Court General", "Swish Specialist", "Game Changer"],
    },
    golf: {
        adjectives: ["Fairway", "Green", "Birdie", "Links", "Swing"],
        nouns: ["Pro", "Guru", "Master", "Whisperer", "Coach"],
        combos: ["Fairway Focus", "Green Guru", "Birdie Machine", "Swing Doctor", "Links Legend"],
    },
    yoga: {
        adjectives: ["Flow", "Zen", "Balance", "Mindful", "Breath"],
        nouns: ["Guide", "Master", "Guru", "Healer", "Teacher"],
        combos: ["Flow State", "Zen Master", "Balance Keeper", "Mindful Movement", "The Breath Guide"],
    },
    swimming: {
        adjectives: ["Aqua", "Wave", "Pool", "Stroke", "Lap"],
        nouns: ["Coach", "Master", "Pro", "Expert", "Legend"],
        combos: ["Aqua Pro", "Wave Maker", "Stroke Specialist", "Pool Commander", "Lap Legend"],
    },
    running: {
        adjectives: ["Mile", "Pace", "Trail", "Speed", "Distance"],
        nouns: ["Mentor", "Coach", "Guide", "Master", "Chaser"],
        combos: ["Mile Crusher", "Pace Setter", "Trail Blazer", "Speed Demon", "Distance King"],
    },
    fitness: {
        adjectives: ["Fit", "Iron", "Strength", "Power", "Peak"],
        nouns: ["Pro", "Coach", "Guru", "Master", "Boss"],
        combos: ["Gains Guru", "Iron Will", "Strength Sensei", "Peak Performance", "Fitness Fam"],
    },
    boxing: {
        adjectives: ["Ring", "Knockout", "Heavy", "Jab", "Fighter"],
        nouns: ["Coach", "Master", "Pro", "Trainer", "Boss"],
        combos: ["Ring Ready", "Knockout Coach", "Jab Master", "Heavy Hitter", "Fight Focus"],
    },
    soccer: {
        adjectives: ["Pitch", "Goal", "Field", "Strike", "Boot"],
        nouns: ["Pro", "Coach", "Master", "Legend", "Boss"],
        combos: ["Pitch Perfect", "Goal Getter", "Field General", "Boot Camp", "Strike Force"],
    },
    volleyball: {
        adjectives: ["Spike", "Net", "Beach", "Court", "Set"],
        nouns: ["Pro", "Master", "Coach", "Boss", "Legend"],
        combos: ["Spike Specialist", "Net Ninja", "Beach Boss", "Set Setter", "Court King"],
    },
    personal_training: {
        adjectives: ["Gains", "Fit", "Strong", "Peak", "Elite"],
        nouns: ["Guru", "Coach", "Pro", "Master", "Boss"],
        combos: ["Gains Guru", "Fit Focused", "Strong Start", "Peak Coach", "Elite Energy"],
    },
    pilates: {
        adjectives: ["Core", "Flow", "Balance", "Precision", "Form"],
        nouns: ["Queen", "Master", "Pro", "Guru", "Coach"],
        combos: ["Core Queen", "Flow Master", "Balance Boss", "Form Focused", "Precision Pro"],
    },
    crossfit: {
        adjectives: ["WOD", "Box", "Beast", "Burpee", "Lift"],
        nouns: ["Boss", "Master", "Coach", "Legend", "Pro"],
        combos: ["WOD Warrior", "Box Boss", "Beast Mode", "Lift Legend", "Burpee Boss"],
    },
    martial_arts: {
        adjectives: ["Sensei", "Warrior", "Master", "Black Belt", "Combat"],
        nouns: ["Coach", "Guide", "Pro", "Master", "Legend"],
        combos: ["Warrior Spirit", "Combat Coach", "Belt Boss", "Discipline Master", "The Sensei"],
    },
    default: {
        adjectives: ["Elite", "Pro", "Peak", "Prime", "Top"],
        nouns: ["Coach", "Trainer", "Pro", "Guide", "Master"],
        combos: ["Elite Coach", "Pro Player", "Peak Performer", "Prime Time", "Top Tier"],
    },
}

// Personality modifiers to add variety
const PERSONALITY_MODIFIERS = [
    "The", "Your", "Always", "Simply", "Certified", "Born", "Built"
]

/**
 * Generates a catchy 3-4 word trainer tagline based on their primary activity
 * Like Spotify Wrapped personas - shareable and memorable
 */
export function generateTrainerTagline(
    primaryActivity: string,
    trainerName?: string
): string {
    const activityKey = primaryActivity.toLowerCase().replace(/\s+/g, "_") as ActivityType
    const style = TAGLINE_STYLES[activityKey] || TAGLINE_STYLES.default

    // 70% chance to use a pre-made combo (they're proven good)
    if (Math.random() < 0.7 && style.combos.length > 0) {
        return style.combos[Math.floor(Math.random() * style.combos.length)]
    }

    // 30% chance to generate a unique one
    const adj = style.adjectives[Math.floor(Math.random() * style.adjectives.length)]
    const noun = style.nouns[Math.floor(Math.random() * style.nouns.length)]

    // Sometimes add a modifier
    if (Math.random() < 0.3) {
        const modifier = PERSONALITY_MODIFIERS[Math.floor(Math.random() * PERSONALITY_MODIFIERS.length)]
        return `${modifier} ${adj} ${noun}`
    }

    return `${adj} ${noun}`
}

/**
 * Generate multiple tagline options for trainers to choose from
 */
export function generateTaglineOptions(primaryActivity: string, count: number = 5): string[] {
    const options = new Set<string>()

    // Ensure variety by generating more than needed
    while (options.size < count) {
        options.add(generateTrainerTagline(primaryActivity))
    }

    return Array.from(options)
}

// ============================================
// TRAINER PROFILE INITIALIZATION
// ============================================

export interface NewTrainerDefaults {
    rating: number
    reviewCount: number
    tagline: string
    taglineOptions: string[]
    isPro: boolean
    verified: boolean
    joinedAt: string
}

/**
 * Generate default profile values for a new trainer
 */
export function getNewTrainerDefaults(primaryActivity: string): NewTrainerDefaults {
    return {
        rating: DEFAULT_TRAINER_RATING, // 5.0 stars!
        reviewCount: DEFAULT_REVIEW_COUNT,
        tagline: generateTrainerTagline(primaryActivity),
        taglineOptions: generateTaglineOptions(primaryActivity, 5),
        isPro: false,
        verified: false,
        joinedAt: new Date().toISOString(),
    }
}

/**
 * Example taglines for different activities:
 * 
 * Tennis: "Court Commander", "Ace Maker", "Rally Master"
 * Pickleball: "Pickleball Royalty", "Dink Dynasty", "Kitchen Commander"
 * Basketball: "Buckets Only", "Hoops Whisperer", "Game Changer"
 * Golf: "Fairway Focus", "Green Guru", "Swing Doctor"
 * Yoga: "Flow State", "Zen Master", "Mindful Movement"
 * Swimming: "Aqua Pro", "Wave Maker", "Stroke Specialist"
 * Running: "Mile Crusher", "Pace Setter", "Trail Blazer"
 * Fitness: "Gains Guru", "Iron Will", "Strength Sensei"
 * Boxing: "Ring Ready", "Knockout Coach", "Heavy Hitter"
 */
