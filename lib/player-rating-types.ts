export type RatingSystem = "DUPR" | "UTR" | "NTRP" | "SKILL_TIER" | "HANDICAP"

export interface PlayerRating {
  sport: string
  system: RatingSystem
  currentRating: number
  previousRating?: number
  lastUpdated: Date
  matchesPlayed: number
  verified: boolean
}

export interface RatingConfig {
  sport: string
  system: RatingSystem
  systemName: string
  range: { min: number; max: number }
  description: string
  levels: RatingLevel[]
  factors?: string[]
}

export interface RatingLevel {
  value: number
  label: string
  description: string
  color: string
}

export const RATING_CONFIGS: Record<string, RatingConfig> = {
  Pickleball: {
    sport: "Pickleball",
    system: "DUPR",
    systemName: "DUPR (Dynamic Universal Pickleball Rating)",
    range: { min: 2.0, max: 8.0 },
    description: "Official rating system adopted by USA Pickleball",
    levels: [
      { value: 2.0, label: "Beginner", description: "Learning rules and basic shots", color: "#94A3B8" },
      { value: 3.0, label: "Intermediate", description: "Can sustain rallies, basic strategy", color: "#60A5FA" },
      { value: 3.5, label: "Advanced", description: "Consistent play, control and positioning", color: "#34D399" },
      { value: 4.0, label: "Competitive", description: "Strong fundamentals, tournament ready", color: "#FBBF24" },
      { value: 4.5, label: "Expert", description: "Advanced tactics, competitive player", color: "#F97316" },
      { value: 5.0, label: "Pro", description: "Professional level play", color: "#EF4444" },
    ],
  },
  Tennis: {
    sport: "Tennis",
    system: "UTR",
    systemName: "UTR (Universal Tennis Rating)",
    range: { min: 1.0, max: 16.5 },
    description: "Global data-driven rating based on match results",
    levels: [
      { value: 1.0, label: "Beginner", description: "Learning the game", color: "#94A3B8" },
      { value: 4.0, label: "Recreational", description: "Casual player", color: "#60A5FA" },
      { value: 7.0, label: "Intermediate", description: "Club level player", color: "#34D399" },
      { value: 10.0, label: "Advanced", description: "Competitive player", color: "#FBBF24" },
      { value: 13.0, label: "College", description: "College level", color: "#F97316" },
      { value: 16.0, label: "Pro", description: "Professional level", color: "#EF4444" },
    ],
  },
  Basketball: {
    sport: "Basketball",
    system: "SKILL_TIER",
    systemName: "Player Skill Tier",
    range: { min: 1, max: 5 },
    description: "Skill-based tier system for pickup and league play",
    levels: [
      { value: 1, label: "Recreational", description: "Learning fundamentals", color: "#94A3B8" },
      { value: 2, label: "Casual", description: "Can play structured games", color: "#60A5FA" },
      { value: 3, label: "Intermediate", description: "Solid fundamentals, competitive", color: "#34D399" },
      { value: 4, label: "Advanced", description: "League level, highly competitive", color: "#F97316" },
      { value: 5, label: "Elite", description: "College/semi-pro level", color: "#EF4444" },
    ],
    factors: ["Ball Handling", "Shooting", "Defense", "Endurance", "Team Play"],
  },
  Golf: {
    sport: "Golf",
    system: "HANDICAP",
    systemName: "USGA Handicap Index",
    range: { min: -10, max: 40 },
    description: "Formula-based on score differentials vs course difficulty",
    levels: [
      { value: -5, label: "Scratch/Pro", description: "Professional level", color: "#EF4444" },
      { value: 5, label: "Low Handicap", description: "Highly skilled player", color: "#F97316" },
      { value: 10, label: "Mid Handicap", description: "Experienced player", color: "#FBBF24" },
      { value: 18, label: "Average", description: "Recreational golfer", color: "#34D399" },
      { value: 25, label: "High Handicap", description: "Developing skills", color: "#60A5FA" },
      { value: 35, label: "Beginner", description: "New to golf", color: "#94A3B8" },
    ],
  },
}

export function getRatingLevel(sport: string, rating: number): RatingLevel | undefined {
  const config = RATING_CONFIGS[sport]
  if (!config) return undefined

  const levels = [...config.levels].sort((a, b) => a.value - b.value)

  for (let i = levels.length - 1; i >= 0; i--) {
    if (rating >= levels[i].value) {
      return levels[i]
    }
  }

  return levels[0]
}

export function getRatingColor(sport: string, rating: number): string {
  const level = getRatingLevel(sport, rating)
  return level?.color || "#94A3B8"
}
