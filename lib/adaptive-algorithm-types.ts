export interface PersonalizationFactors {
  location: { lat: number; lng: number }
  workoutPreferences: string[] // ["strength", "cardio", "flexibility"]
  intensityLevel: "beginner" | "intermediate" | "advanced" | "pro"
  schedule: "morning" | "afternoon" | "evening" | "flexible"
  budget: { min: number; max: number }
  pastBookings: string[] // trainer IDs
  interactions: {
    liked: string[] // trainer/venue IDs
    skipped: string[] // trainer/venue IDs
    viewed: string[] // trainer/venue IDs
  }
}

export interface AlgorithmScoreBreakdown {
  personalPreference: number // 40%
  popularity: number // 25%
  recency: number // 15%
  quality: number // 20%
  total: number
  reason: string
}

export interface PersonalizedItem {
  id: string
  type: "trainer" | "venue" | "persona"
  data: any
  score: AlgorithmScoreBreakdown
  distanceMiles: number
  matchReasons: string[]
}

export const calculatePersonalizedScore = (
  item: any,
  factors: PersonalizationFactors,
  itemType: "trainer" | "venue" | "persona",
): AlgorithmScoreBreakdown => {
  // Personal Preference Score (40%)
  let personalScore = 0

  // Location match (within 10 miles = 100%, beyond = decay)
  const distanceMiles = Math.random() * 15 // Mock distance
  const locationScore = distanceMiles <= 10 ? 100 : Math.max(0, 100 - (distanceMiles - 10) * 10)
  personalScore += locationScore * 0.3

  // Workout preference match
  const hasMatchingPreference = factors.workoutPreferences.some((pref) =>
    item.specialties?.some((s: string) => s.toLowerCase().includes(pref.toLowerCase())),
  )
  personalScore += hasMatchingPreference ? 100 * 0.3 : 50 * 0.3

  // Intensity level match
  const intensityMatch = item.level === factors.intensityLevel
  personalScore += intensityMatch ? 100 * 0.2 : 60 * 0.2

  // Budget match
  const inBudget = item.price >= factors.budget.min && item.price <= factors.budget.max
  personalScore += inBudget ? 100 * 0.2 : 40 * 0.2

  // Popularity Score (25%)
  const popularityScore = Math.min(100, (item.reviews / 100) * 100 + item.rating * 10)

  // Recency Score (15%)
  const daysSinceJoined = Math.floor(Math.random() * 365)
  const recencyScore = Math.max(0, 100 - daysSinceJoined / 3.65)

  // Quality Score (20%)
  const qualityScore = (item.rating / 5) * 100

  // Skip penalty
  const skipPenalty = factors.interactions.skipped.includes(item.id) ? -50 : 0

  // Like bonus
  const likeBonus = factors.interactions.liked.includes(item.id) ? 30 : 0

  const total =
    personalScore * 0.4 + popularityScore * 0.25 + recencyScore * 0.15 + qualityScore * 0.2 + skipPenalty + likeBonus

  // Generate reason
  const reasons = []
  if (distanceMiles <= 5) reasons.push(`Only ${distanceMiles.toFixed(1)} mi away`)
  if (hasMatchingPreference) reasons.push("Matches your workout style")
  if (intensityMatch) reasons.push("Perfect for your skill level")
  if (inBudget) reasons.push("Within your budget")
  if (item.rating >= 4.5) reasons.push("Highly rated")
  if (popularityScore > 80) reasons.push("Popular choice")

  return {
    personalPreference: personalScore,
    popularity: popularityScore,
    recency: recencyScore,
    quality: qualityScore,
    total: Math.max(0, Math.min(100, total)),
    reason: reasons.join(" • "),
  }
}
