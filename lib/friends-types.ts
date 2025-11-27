export interface Friend {
  id: string
  userId: string
  name: string
  username: string
  avatar?: string
  activities: string[]
  location?: {
    city: string
    state: string
    distance?: number
  }
  stats: {
    totalSessions: number
    streak: number
    credits: number
  }
  privacy: {
    shareLocation: boolean
    shareActivity: boolean
    shareStats: boolean
  }
}

export interface Friendship {
  id: string
  userId: string
  friendId: string
  status: "pending" | "accepted" | "blocked"
  createdAt: string
  acceptedAt?: string
  friend: Friend
}

export interface FriendRequest {
  id: string
  fromUserId: string
  toUserId: string
  status: "pending" | "accepted" | "rejected"
  createdAt: string
  fromUser: {
    id: string
    name: string
    username: string
    avatar?: string
    activities: string[]
  }
}

export interface FriendActivity {
  id: string
  userId: string
  username: string
  avatar?: string
  type: "checkin" | "booking" | "achievement" | "challenge" | "report"
  activity: string
  title: string
  description: string
  location?: {
    venueName: string
    venueId: string
    distance?: number
  }
  timestamp: string
  isNearby: boolean
}

export interface ContactInvite {
  name: string
  phoneNumber: string
  isInvited: boolean
  invitedAt?: string
}
