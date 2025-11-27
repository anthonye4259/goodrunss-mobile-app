"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

type UserPreferences = {
  name?: string
  activities: string[]
  isStudioUser: boolean
  isRecUser: boolean
  userType: "player" | "practitioner" | "trainer" | "instructor" | "both" | null
  primaryActivity?: string
  location?: {
    latitude: number
    longitude: number
    city?: string
    state?: string
    zipCode?: string
  }
  credits?: number
  referralCode?: string
  isPremium?: boolean
}

const UserPreferencesContext = createContext<
  | {
      preferences: UserPreferences
      setPreferences: (prefs: UserPreferences) => void
      clearPreferences: () => Promise<void>
      addCredits: (amount: number) => void
    }
  | undefined
>(undefined)

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>({
    activities: [],
    isStudioUser: false,
    isRecUser: false,
    userType: null,
    primaryActivity: undefined,
    location: undefined,
    credits: 0,
    isPremium: false,
  })

  // Load from AsyncStorage on mount
  useEffect(() => {
    AsyncStorage.getItem("userPreferences").then((stored) => {
      if (stored) {
        setPreferences(JSON.parse(stored))
      }
    })
  }, [])

  // Save to AsyncStorage when preferences change
  const updatePreferences = (prefs: UserPreferences) => {
    setPreferences(prefs)
    AsyncStorage.setItem("userPreferences", JSON.stringify(prefs))
  }

  const clearPreferences = async () => {
    await AsyncStorage.removeItem("userPreferences")
    setPreferences({
      activities: [],
      isStudioUser: false,
      isRecUser: false,
      userType: null,
      primaryActivity: undefined,
      location: undefined,
      credits: 0,
      isPremium: false,
    })
  }

  const addCredits = (amount: number) => {
    const newPrefs = {
      ...preferences,
      credits: (preferences.credits || 0) + amount,
    }
    updatePreferences(newPrefs)
  }

  return (
    <UserPreferencesContext.Provider
      value={{ preferences, setPreferences: updatePreferences, clearPreferences, addCredits }}
    >
      {children}
    </UserPreferencesContext.Provider>
  )
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext)
  if (!context) {
    throw new Error("useUserPreferences must be used within UserPreferencesProvider")
  }
  return context
}
