export type WaitlistTimePreference = "morning" | "afternoon" | "evening" | "flexible"

export type WaitlistNotificationChannel = "email" | "sms" | "push"

export type WaitlistStatus = "active" | "notified" | "booked" | "expired"

export type WaitlistEntry = {
  id: string
  userId: string
  userName: string
  userEmail: string
  userPhone?: string
  trainerId?: string
  facilityId?: string
  preferredDate?: string
  timePreference: WaitlistTimePreference
  notificationChannels: WaitlistNotificationChannel[]
  status: WaitlistStatus
  createdAt: Date
  expiresAt: Date
  notifiedAt?: Date
  bookedAt?: Date
  priority: number // Lower number = higher priority (FIFO)
}

export type WaitlistStats = {
  totalEntries: number
  activeEntries: number
  notifiedToday: number
  bookedFromWaitlist: number
}
