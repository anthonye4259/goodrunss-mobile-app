export type PersonaType = "player" | "trainer"

export type SkillGraph = {
  sportFocus: string[]
  strengths: string[]
  habits: string[]
  voiceTone: "motivational" | "analytical" | "friendly" | "intense" | "calm"
  energyLevel: number // 1-10
}

export type PersonaAction =
  | "give_advice"
  | "schedule_session"
  | "recommend_match"
  | "simulate_practice"
  | "analyze_performance"
  | "create_workout"

export type Persona = {
  id: string
  userId: string
  type: PersonaType
  name: string
  displayName: string
  photo?: string
  bio: string
  sportIcons: string[]
  skillGraph: SkillGraph
  rating: number
  usageCount: number
  earnings: number // For trainer personas
  voiceEnabled: boolean
  voiceId?: string // ElevenLabs voice ID
  actions: PersonaAction[]
  createdAt: Date
  updatedAt: Date
  isPublic: boolean
  isFeatured: boolean
}

export type PersonaUsage = {
  id: string
  personaId: string
  userId: string
  action: PersonaAction
  duration: number // in minutes
  cost: number
  timestamp: Date
}

export const PERSONA_ACTIONS: Record<PersonaAction, { label: string; icon: string; description: string }> = {
  give_advice: {
    label: "Give Advice",
    icon: "chatbubble-ellipses",
    description: "Provide personalized coaching advice",
  },
  schedule_session: {
    label: "Schedule Session",
    icon: "calendar",
    description: "Help plan and schedule training sessions",
  },
  recommend_match: {
    label: "Recommend Match",
    icon: "people",
    description: "Suggest compatible playing partners",
  },
  simulate_practice: {
    label: "Simulate Practice",
    icon: "game-controller",
    description: "Run AI-powered practice simulations",
  },
  analyze_performance: {
    label: "Analyze Performance",
    icon: "analytics",
    description: "Review and analyze your performance data",
  },
  create_workout: {
    label: "Create Workout",
    icon: "fitness",
    description: "Generate custom workout plans",
  },
}
