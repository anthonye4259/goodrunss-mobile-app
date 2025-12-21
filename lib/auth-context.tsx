
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { auth, db } from "./firebase-config"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"

interface AuthContextType {
  isAuthenticated: boolean
  isGuest: boolean
  user: {
    id: string
    name: string
    email: string
  } | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  continueAsGuest: () => void
  promptLogin: (feature: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isGuest, setIsGuest] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        await loadUserData(firebaseUser)
        setIsAuthenticated(true)
        setIsGuest(false)
      } else {
        // User is signed out
        const guestMode = await AsyncStorage.getItem("guestMode")
        if (guestMode === "true") {
          setIsGuest(true)
          setIsAuthenticated(false)
        }
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const loadUserData = async (firebaseUser: FirebaseUser) => {
    if (!db) return

    try {
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))

      if (userDoc.exists()) {
        const userData = userDoc.data()
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: userData.name || "",
          ...userData
        })
      } else {
        // Create user document if it doesn't exist
        const newUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: firebaseUser.displayName || "",
          createdAt: new Date().toISOString()
        }
        await setDoc(doc(db, "users", firebaseUser.uid), newUser)
        setUser(newUser)
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    }
  }

  const login = async (email: string, password: string) => {
    if (!auth) {
      throw new Error("Sign in is temporarily unavailable. Please continue as guest or try again later.")
    }

    try {
      await signInWithEmailAndPassword(auth, email, password)
      await AsyncStorage.removeItem("guestMode")
    } catch (error: any) {
      console.error("Login error:", error)
      // Translate Firebase errors to user-friendly messages
      const errorCode = error.code || ""
      switch (errorCode) {
        case "auth/invalid-email":
          throw new Error("Please enter a valid email address.")
        case "auth/user-disabled":
          throw new Error("This account has been disabled. Please contact support.")
        case "auth/user-not-found":
          throw new Error("No account found with this email. Please sign up first.")
        case "auth/wrong-password":
        case "auth/invalid-credential":
          throw new Error("Incorrect email or password. Please try again.")
        case "auth/too-many-requests":
          throw new Error("Too many failed attempts. Please wait a few minutes and try again.")
        case "auth/network-request-failed":
          throw new Error("Network error. Please check your connection and try again.")
        default:
          throw new Error("Unable to sign in. Please try again or continue as guest.")
      }
    }
  }

  const signup = async (email: string, password: string, name: string) => {
    if (!auth || !db) {
      throw new Error("Sign up is temporarily unavailable. Please continue as guest or try again later.")
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      // Create user document in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name,
        email,
        createdAt: new Date().toISOString(),
        activities: [],
        preferences: {}
      })

      await AsyncStorage.removeItem("guestMode")
    } catch (error: any) {
      console.error("Signup error:", error)
      // Translate Firebase errors to user-friendly messages
      const errorCode = error.code || ""
      switch (errorCode) {
        case "auth/email-already-in-use":
          throw new Error("This email is already registered. Please sign in instead.")
        case "auth/invalid-email":
          throw new Error("Please enter a valid email address.")
        case "auth/weak-password":
          throw new Error("Password must be at least 6 characters long.")
        case "auth/operation-not-allowed":
          throw new Error("Sign up is currently disabled. Please try again later.")
        case "auth/network-request-failed":
          throw new Error("Network error. Please check your connection and try again.")
        default:
          throw new Error("Unable to create account. Please try again or continue as guest.")
      }
    }
  }

  const logout = async () => {
    if (!auth) return

    try {
      await firebaseSignOut(auth)
      await AsyncStorage.removeItem("guestMode")
      setIsAuthenticated(false)
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const continueAsGuest = async () => {
    await AsyncStorage.setItem("guestMode", "true")
    setIsGuest(true)
    setIsAuthenticated(false)
  }

  const promptLogin = (feature: string): boolean => {
    // Returns true if guest should be prompted to login
    return isGuest
  }

  // CRITICAL: Never return null. Expo Router requires root layout to render children.
  // During loading, provide default context values
  const contextValue = {
    isAuthenticated,
    isGuest,
    user,
    login,
    signup,
    logout,
    continueAsGuest,
    promptLogin
  }

  return (
    <AuthContext.Provider value={contextValue}>
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
