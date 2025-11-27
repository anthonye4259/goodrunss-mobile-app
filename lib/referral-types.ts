export interface ReferralReward {
  type: "player" | "trainer" | "premium"
  title: string
  description: string
  referrerReward: number
  refereeReward: number
  icon: string
}

export interface ReferralStats {
  totalInvites: number
  successfulSignups: number
  creditsEarned: number
  currentMultiplier: number
  nextMultiplierAt: number
}

export interface ReferralHistoryItem {
  id: string
  name: string
  type: "player" | "trainer" | "premium"
  status: "pending" | "completed" | "expired"
  creditsEarned: number
  date: string
}

export const REFERRAL_REWARDS: ReferralReward[] = [
  {
    type: "player",
    title: "Refer a Player",
    description: "Friend joins as a player",
    referrerReward: 50,
    refereeReward: 25,
    icon: "person",
  },
  {
    type: "trainer",
    title: "Refer a Trainer",
    description: "Friend joins as a trainer",
    referrerReward: 100,
    refereeReward: 50,
    icon: "barbell",
  },
  {
    type: "premium",
    title: "Refer Premium User",
    description: "Friend upgrades to premium",
    referrerReward: 200,
    refereeReward: 100,
    icon: "star",
  },
]

export const MULTIPLIER_TIERS = [
  { referrals: 0, multiplier: 1, label: "Standard" },
  { referrals: 5, multiplier: 1.25, label: "Bronze" },
  { referrals: 10, multiplier: 1.5, label: "Silver" },
  { referrals: 25, multiplier: 2, label: "Gold" },
  { referrals: 50, multiplier: 2.5, label: "Platinum" },
]

export function getCurrentMultiplier(successfulReferrals: number): {
  multiplier: number
  label: string
  nextTier: { referrals: number; multiplier: number; label: string } | null
} {
  let currentTier = MULTIPLIER_TIERS[0]
  let nextTier = MULTIPLIER_TIERS[1]

  for (let i = 0; i < MULTIPLIER_TIERS.length; i++) {
    if (successfulReferrals >= MULTIPLIER_TIERS[i].referrals) {
      currentTier = MULTIPLIER_TIERS[i]
      nextTier = MULTIPLIER_TIERS[i + 1] || null
    }
  }

  return {
    multiplier: currentTier.multiplier,
    label: currentTier.label,
    nextTier,
  }
}
