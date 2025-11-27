export type FacilityCondition = "excellent" | "good" | "fair" | "poor"

export type ReportCategory = "crowd" | "skill" | "maintenance" | "safety" | "amenities"

export interface FacilityReport {
  id: string
  venueId: string
  venueName: string
  userId: string
  category: ReportCategory
  condition: FacilityCondition
  details: string
  photos?: string[]
  timestamp: Date
  reward: number
  status: "pending" | "verified" | "rejected"
}

export interface ReportStats {
  totalReports: number
  totalEarnings: number
  reportsThisWeek: number
  earningsThisWeek: number
  streak: number
  level: number
  nextLevelReports: number
}

export const REPORT_REWARDS = {
  crowd: { min: 1, max: 5 },
  skill: { min: 2, max: 8 },
  maintenance: { min: 5, max: 15 },
  safety: { min: 10, max: 31 },
  amenities: { min: 3, max: 10 },
}

export const REPORT_LEVELS = [
  { level: 1, minReports: 0, badge: "🌱", title: "Newbie Reporter" },
  { level: 2, minReports: 10, badge: "🔰", title: "Scout" },
  { level: 3, minReports: 25, badge: "⭐", title: "Community Helper" },
  { level: 4, minReports: 50, badge: "💎", title: "Trusted Reporter" },
  { level: 5, minReports: 100, badge: "👑", title: "Elite Reporter" },
]

export function getReportLevel(totalReports: number) {
  return REPORT_LEVELS.reduce((acc, level) => (totalReports >= level.minReports ? level : acc))
}

export function getRewardEstimate(
  category: ReportCategory,
  hasPhotos: boolean,
  detailLength: number,
  cityId?: string | null,
): number {
  const baseReward = REPORT_REWARDS[category]
  let reward = (baseReward.min + baseReward.max) / 2

  if (hasPhotos) reward += 5
  if (detailLength > 100) reward += 3

  // Apply city multiplier
  if (cityId) {
    const city = require("./partner-city-types").PARTNER_CITIES.find((c: any) => c.id === cityId)
    if (city?.benefits.rewardMultiplier) {
      reward *= city.benefits.rewardMultiplier
    }
  }

  return Math.min(Math.round(reward), baseReward.max * (cityId ? 2 : 1))
}
