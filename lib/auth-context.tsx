"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

interface AuthContextType {
  isAuthenticated: boolean
  isGuest: boolean
  user: {
    id: string
    name: string
    email: string
  } | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  continueAsGuest: () => void
  promptLogin: (feature: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isGuest, setIsGuest] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const authToken = await AsyncStorage.getItem("authToken")
    const guestMode = await AsyncStorage.getItem("guestMode")

    if (authToken) {
      setIsAuthenticated(true)
      setIsGuest(false)
      // Load user data
    } else if (guestMode === "true") {
      setIsGuest(true)
      setIsAuthenticated(false)
    }
  }

  const login = async (email: string, password: string) => {
    // Mock login - replace with real API call
    await AsyncStorage.setItem("authToken", "mock-token")
    await AsyncStorage.removeItem("guestMode")
    setIsAuthenticated(true)
    setIsGuest(false)
  }

  const logout = async () => {
    await AsyncStorage.removeItem("authToken")
    setIsAuthenticated(false)
    setUser(null)
  }

  const continueAsGuest = async () => {
    await AsyncStorage.setItem("guestMode", "true")
    setIsGuest(true)
  }

  const promptLogin = (feature: string): boolean => {
    // Returns true if guest should be prompted to login
    return isGuest
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isGuest, user, login, logout, continueAsGuest, promptLogin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
