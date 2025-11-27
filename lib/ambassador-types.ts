export type AmbassadorRole = "court_captain" | "ugc_creator" | "ambassador"

export type AmbassadorTier = "bronze" | "silver" | "gold"

export interface AmbassadorProfile {
  id: string
  userId: string
  role: AmbassadorRole
  tier: AmbassadorTier
  status: "pending" | "active" | "suspended"
  appliedAt: Date
  approvedAt?: Date
  stats: {
    totalEarnings: number
    thisMonthEarnings: number
    referrals?: number
    content?: number
    events?: number
    facilityReports?: number
  }
  perks: string[]
}

export interface AmbassadorApplication {
  role: AmbassadorRole
  motivation: string
  experience: string
  socialLinks?: {
    instagram?: string
    tiktok?: string
    youtube?: string
  }
  references?: string
}

export const AMBASSADOR_ROLES = {
  court_captain: {
    name: "Court Captain",
    icon: "🎾",
    description: "Monitor facilities, report conditions, get free bookings",
    responsibilities: [
      "Submit facility condition reports weekly",
      "Monitor court quality and safety",
      "Help maintain community standards",
      "Welcome new players at your home court",
    ],
    perks: {
      bronze: ["$1-5 per report", "5% booking discount", "Captain badge"],
      silver: ["$3-10 per report", "10% booking discount", "Priority support", "Free court bookings (2/month)"],
      gold: ["$5-15 per report", "20% booking discount", "Premium support", "Free court bookings (unlimited)"],
    },
    commissionRate: {
      bronze: 0,
      silver: 0,
      gold: 0,
    },
  },
  ugc_creator: {
    name: "UGC Creator",
    icon: "📸",
    description: "Create content, earn commission on bookings",
    responsibilities: [
      "Post workout videos/photos weekly",
      "Tag @GoodRunss in all content",
      "Create authentic training content",
      "Engage with community comments",
    ],
    perks: {
      bronze: ["5% commission", "Creator badge", "Early feature access"],
      silver: [
        "10% commission",
        "Featured creator profile",
        "Exclusive merchandise",
        "Free trainer sessions (1/month)",
      ],
      gold: [
        "15% commission",
        "Priority support",
        "Sponsored content opportunities",
        "Free trainer sessions (3/month)",
      ],
    },
    commissionRate: {
      bronze: 0.05,
      silver: 0.1,
      gold: 0.15,
    },
  },
  ambassador: {
    name: "Ambassador",
    icon: "🌟",
    description: "Refer users, host events, build community",
    responsibilities: [
      "Refer new users to GoodRunss",
      "Host community events monthly",
      "Represent brand at local events",
      "Provide feedback to product team",
    ],
    perks: {
      bronze: ["10% referral commission", "Ambassador badge", "Community leader status"],
      silver: ["15% referral commission", "Event hosting support", "$100 event budget/month", "Swag pack"],
      gold: ["20% referral commission", "Premium event support", "$500 event budget/month", "Brand partnerships"],
    },
    commissionRate: {
      bronze: 0.1,
      silver: 0.15,
      gold: 0.2,
    },
  },
}

export function getTierProgress(
  role: AmbassadorRole,
  stats: AmbassadorProfile["stats"],
): {
  current: AmbassadorTier
  nextTier?: AmbassadorTier
  progress: number
  requirement: string
} {
  if (role === "court_captain") {
    const reports = stats.facilityReports || 0
    if (reports >= 100) return { current: "gold", progress: 100, requirement: "Completed" }
    if (reports >= 50)
      return {
        current: "silver",
        nextTier: "gold",
        progress: (reports / 100) * 100,
        requirement: "100 reports for Gold",
      }
    return {
      current: "bronze",
      nextTier: "silver",
      progress: (reports / 50) * 100,
      requirement: "50 reports for Silver",
    }
  }

  if (role === "ugc_creator") {
    const content = stats.content || 0
    if (content >= 100) return { current: "gold", progress: 100, requirement: "Completed" }
    if (content >= 50)
      return { current: "silver", nextTier: "gold", progress: (content / 100) * 100, requirement: "100 posts for Gold" }
    return { current: "bronze", nextTier: "silver", progress: (content / 50) * 100, requirement: "50 posts for Silver" }
  }

  if (role === "ambassador") {
    const referrals = stats.referrals || 0
    if (referrals >= 100) return { current: "gold", progress: 100, requirement: "Completed" }
    if (referrals >= 50)
      return {
        current: "silver",
        nextTier: "gold",
        progress: (referrals / 100) * 100,
        requirement: "100 referrals for Gold",
      }
    return {
      current: "bronze",
      nextTier: "silver",
      progress: (referrals / 50) * 100,
      requirement: "50 referrals for Silver",
    }
  }

  return { current: "bronze", progress: 0, requirement: "" }
}
