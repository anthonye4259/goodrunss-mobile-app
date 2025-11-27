export interface PartnerCity {
  id: string
  name: string
  state: string
  country: string
  badge: string
  color: string
  coordinates: {
    lat: number
    lng: number
  }
  benefits: {
    rewardMultiplier: number // 2x for citizens
    priorityAccess: boolean
    specialBadge: boolean
    cityDashboard: boolean
  }
  stats: {
    totalFacilities: number
    activeCitizens: number
    reportsThisMonth: number
  }
}

export interface CityCitizen {
  userId: string
  cityId: string
  verifiedAt: Date
  totalReports: number
  cityRank: number
  specialBadges: string[]
}

export interface CityFacility {
  id: string
  name: string
  type: string
  sport: string[]
  condition: "excellent" | "good" | "fair" | "poor"
  crowdLevel: "empty" | "light" | "moderate" | "busy" | "full"
  lastReportTime: Date
  recentReports: number
  coordinates: {
    lat: number
    lng: number
  }
}

export interface CityChallenge {
  id: string
  cityId: string
  title: string
  description: string
  goal: number
  progress: number
  reward: number
  startDate: Date
  endDate: Date
  participants: number
  status: "active" | "completed" | "upcoming"
}

export const PARTNER_CITIES: PartnerCity[] = [
  {
    id: "myrtle-beach",
    name: "Myrtle Beach",
    state: "SC",
    country: "USA",
    badge: "🏖️",
    color: "#4FACFE",
    coordinates: { lat: 33.6891, lng: -78.8867 },
    benefits: {
      rewardMultiplier: 2,
      priorityAccess: true,
      specialBadge: true,
      cityDashboard: true,
    },
    stats: {
      totalFacilities: 47,
      activeCitizens: 1284,
      reportsThisMonth: 892,
    },
  },
]

export const CITY_REPORT_REWARDS = {
  regular: { min: 10, max: 30 }, // 2x regular (5-15)
  maintenance: { min: 20, max: 62 }, // 2x regular (10-31)
  gpsBonus: 6, // 2x regular (3)
}

export function getCityMultiplier(cityId: string | null): number {
  if (!cityId) return 1
  const city = PARTNER_CITIES.find((c) => c.id === cityId)
  return city?.benefits.rewardMultiplier || 1
}

export function calculateCityReward(baseReward: number, cityId: string | null): number {
  const multiplier = getCityMultiplier(cityId)
  return Math.round(baseReward * multiplier)
}
