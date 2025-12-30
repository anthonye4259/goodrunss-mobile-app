export type VenueQualityAttribute = {
  name: string
  value: number // 1-5 rating
  icon: string
  description: string
}

export type BasketballCourtQuality = {
  rimQuality: number // 1-5
  netPresence: boolean
  doubleRim: boolean
  courtSlipperiness: number // 1-5 (1 = very slippery, 5 = perfect grip)
  lighting: number // 1-5
  backboardCondition: number // 1-5
  courtSurface: "indoor" | "outdoor" | "asphalt" | "concrete" | "wood"
  lineVisibility: number // 1-5
}

export type GolfCourseQuality = {
  patchiness: number // 1-5 (1 = very patchy, 5 = perfect)
  grassQuality: number // 1-5
  greenSpeed: number // 1-5
  bunkerCondition: number // 1-5
  fairwayCondition: number // 1-5
  teeBoxCondition: number // 1-5
  drainage: number // 1-5
}

export type TennisCourtQuality = {
  courtSurface: "hard" | "clay" | "grass" | "carpet"
  netCondition: number // 1-5
  lighting: number // 1-5
  lineVisibility: number // 1-5
  surfaceCondition: number // 1-5
  fencing: number // 1-5
}

export type StudioQuality = {
  cleanliness: number // 1-5
  equipmentQuality: number // 1-5
  ambiance: number // 1-5
  temperatureControl: number // 1-5
  spacing: number // 1-5
  flooring: number // 1-5
  mirrors: number // 1-5
  soundSystem: number // 1-5
}

export type SoccerFieldQuality = {
  fieldCondition: number // 1-5
  goalQuality: number // 1-5
  surfaceType: "grass" | "turf" | "artificial"
  grassTurfQuality: number // 1-5
  lineVisibility: number // 1-5
  drainage: number // 1-5
  lighting: number // 1-5
}

export type VenueQuality =
  | { sport: "Basketball"; attributes: BasketballCourtQuality }
  | { sport: "Golf"; attributes: GolfCourseQuality }
  | { sport: "Tennis"; attributes: TennisCourtQuality }
  | { sport: "Pilates" | "Yoga" | "Lagree" | "Barre" | "Meditation"; attributes: StudioQuality }
  | { sport: "Soccer"; attributes: SoccerFieldQuality }

export function getVenueQualityAttributes(sport: string): string[] {
  switch (sport) {
    case "Basketball":
      return ["Rim Quality", "Net Presence", "Double Rim", "Court Grip", "Lighting", "Backboard", "Surface", "Lines"]
    case "Golf":
      return ["Grass Quality", "Patchiness", "Green Speed", "Bunkers", "Fairways", "Tee Boxes", "Drainage"]
    case "Tennis":
      return ["Surface Type", "Net Condition", "Lighting", "Line Visibility", "Surface Condition", "Fencing"]
    case "Pilates":
    case "Yoga":
    case "Lagree":
    case "Barre":
    case "Meditation":
      return ["Cleanliness", "Equipment", "Ambiance", "Temperature", "Spacing", "Flooring", "Mirrors", "Sound"]
    case "Soccer":
      return ["Field Condition", "Goal Quality", "Surface Type", "Grass/Turf", "Lines", "Drainage", "Lighting"]
    default:
      return ["Overall Quality", "Cleanliness", "Maintenance", "Accessibility"]
  }
}

export type GoodRunssVerifiedRating = {
  overallScore: number // 0-100
  tier: "Elite" | "Premium" | "Good" | "Fair" | "Poor"
  badge: string
  reviewCount: number
  lastUpdated: Date
}

export function calculateGoodRunssRating(sport: string, attributes: any, reviewCount = 0): GoodRunssVerifiedRating {
  let score = 0
  let maxScore = 0

  switch (sport) {
    case "Basketball":
      // Weighted scoring for basketball courts
      score += attributes.rimQuality * 20 // Rim is critical (20%)
      score += (attributes.netPresence ? 5 : 0) * 10 // Net presence (10%)
      score += (5 - attributes.courtSlipperiness) * 15 // Less slippery = better (15%)
      score += attributes.lighting * 15 // Lighting (15%)
      score += attributes.backboardCondition * 15 // Backboard (15%)
      score += attributes.lineVisibility * 10 // Lines (10%)
      score += (attributes.doubleRim ? 0 : 5) * 5 // Single rim preferred (5%)
      maxScore = 100
      break

    case "Golf":
      score += (5 - attributes.patchiness) * 20 // Less patchy = better (20%)
      score += attributes.grassQuality * 20 // Grass quality (20%)
      score += attributes.greenSpeed * 15 // Green speed (15%)
      score += attributes.bunkerCondition * 15 // Bunkers (15%)
      score += attributes.fairwayCondition * 15 // Fairways (15%)
      score += attributes.drainage * 15 // Drainage (15%)
      maxScore = 100
      break

    case "Tennis":
      score += attributes.surfaceCondition * 25 // Surface is critical (25%)
      score += attributes.netCondition * 20 // Net (20%)
      score += attributes.lineVisibility * 20 // Lines (20%)
      score += attributes.lighting * 20 // Lighting (20%)
      score += attributes.fencing * 15 // Fencing (15%)
      maxScore = 100
      break

    case "Pilates":
    case "Yoga":
    case "Lagree":
    case "Barre":
    case "Meditation":
      score += attributes.cleanliness * 25 // Cleanliness is critical (25%)
      score += attributes.equipmentQuality * 20 // Equipment (20%)
      score += attributes.flooring * 15 // Flooring (15%)
      score += attributes.temperatureControl * 15 // Temperature (15%)
      score += attributes.ambiance * 15 // Ambiance (15%)
      score += attributes.spacing * 10 // Spacing (10%)
      maxScore = 100
      break

    case "Soccer":
      score += attributes.fieldCondition * 25 // Field condition (25%)
      score += attributes.grassTurfQuality * 20 // Grass/turf (20%)
      score += attributes.goalQuality * 15 // Goals (15%)
      score += attributes.lineVisibility * 15 // Lines (15%)
      score += attributes.drainage * 15 // Drainage (15%)
      score += attributes.lighting * 10 // Lighting (10%)
      maxScore = 100
      break

    default:
      score = 75
      maxScore = 100
  }

  const normalizedScore = Math.round((score / maxScore) * 100)

  // Adjust score based on review count (more reviews = more reliable)
  const reliabilityBonus = Math.min(reviewCount / 10, 5) // Up to 5 point bonus
  const finalScore = Math.min(normalizedScore + reliabilityBonus, 100)

  // Determine tier
  let tier: GoodRunssVerifiedRating["tier"]
  let badge: string

  if (finalScore >= 90) {
    tier = "Elite"
    badge = "🏆"
  } else if (finalScore >= 75) {
    tier = "Premium"
    badge = "⭐"
  } else if (finalScore >= 60) {
    tier = "Good"
    badge = "✓"
  } else if (finalScore >= 40) {
    tier = "Fair"
    badge = "○"
  } else {
    tier = "Poor"
    badge = "⚠"
  }

  return {
    overallScore: finalScore,
    tier,
    badge,
    reviewCount,
    lastUpdated: new Date(),
  }
}

export function getVerifiedRatingColor(tier: GoodRunssVerifiedRating["tier"]): string {
  switch (tier) {
    case "Elite":
      return "#FFD700" // Gold
    case "Premium":
      return "#6B9B5A" // Lime green
    case "Good":
      return "#4A9EFF" // Blue
    case "Fair":
      return "#FFA500" // Orange
    case "Poor":
      return "#FF6B6B" // Red
  }
}
