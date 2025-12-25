
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import firebase, { auth, db } from "./firebase-config"
import {
  saveCredentials,
  clearStoredCredentials,
  authenticateWithBiometrics,
  hasStoredCredentials,
  getStoredEmail,
  isBiometricAvailable
} from "./services/biometric-auth"

interface AuthContextType {
  isAuthenticated: boolean
  isGuest: boolean
  loading: boolean
  hasBiometricCredentials: boolean
  user: {
    id: string
    name: string
    email: string
  } | null
  login: (email: string, password: string) => Promise<void>
  loginWithBiometrics: () => Promise<boolean>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  continueAsGuest: () => void
  promptLogin: (feature: string) => boolean
  getStoredEmail: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isGuest, setIsGuest] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [hasBiometricCredentials, setHasBiometricCredentials] = useState(false)

  useEffect(() => {
    // Check for stored biometric credentials
    hasStoredCredentials().then(setHasBiometricCredentials)

    if (!auth) {
      setLoading(false)
      return
    }

    // Listen to auth state changes (compat SDK)
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
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

  const loadUserData = async (firebaseUser: firebase.User) => {
    // Even if Firestore fails, we can still use the auth user data
    const fallbackUser = {
      id: firebaseUser.uid,
      email: firebaseUser.email || "",
      name: firebaseUser.displayName || "",
    }

    if (!db) {
      setUser(fallbackUser)
      return
    }

    try {
      const userDoc = await db.collection("users").doc(firebaseUser.uid).get()

      if (userDoc.exists) {
        const userData = userDoc.data() || {}
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: userData.name || firebaseUser.displayName || "",
          ...userData
        })
      } else {
        // Try to create user document, but don't fail if permissions block us
        try {
          const newUser = {
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: firebaseUser.displayName || "",
            createdAt: new Date().toISOString()
          }
          await db.collection("users").doc(firebaseUser.uid).set(newUser)
          setUser(newUser)
        } catch (writeError) {
          console.warn("⚠️ Could not create user doc:", writeError)
          setUser(fallbackUser)
        }
      }
    } catch (error) {
      console.warn("⚠️ Could not load user data from Firestore, using auth data:", error)
      setUser(fallbackUser)
    }
  }

  const login = async (email: string, password: string) => {
    if (!auth) {
      throw new Error("Sign in is temporarily unavailable. Please continue as guest or try again later.")
    }

    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password)
      await AsyncStorage.removeItem("guestMode")

      // Save credentials to Keychain for biometric re-auth
      const uid = userCredential.user?.uid || ""
      const userName = userCredential.user?.displayName || ""
      await saveCredentials(email, password, userName, uid)
      setHasBiometricCredentials(true)
    } catch (error: any) {
      console.error("Login error:", error)
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

  // Biometric login - authenticate with Face ID/Touch ID and auto-login
  const loginWithBiometrics = async (): Promise<boolean> => {
    try {
      const credentials = await authenticateWithBiometrics()
      if (!credentials) {
        return false
      }

      // Use stored credentials to sign in
      await login(credentials.email, credentials.password)
      return true
    } catch (error) {
      console.error("Biometric login failed:", error)
      return false
    }
  }

  const signup = async (email: string, password: string, name: string) => {
    if (!auth) {
      throw new Error("Sign up is temporarily unavailable. Please continue as guest or try again later.")
    }

    // Step 1: Create the Firebase Auth account (this is critical)
    let userCredential
    try {
      userCredential = await auth.createUserWithEmailAndPassword(email, password)
    } catch (error: any) {
      console.error("Signup auth error:", error)
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

    // Step 2: Set user state immediately with the provided name
    // This ensures "Welcome {name}" works even if Firestore write fails
    const uid = userCredential.user!.uid
    setUser({
      id: uid,
      email: email,
      name: name
    })
    setIsAuthenticated(true)
    setIsGuest(false)

    // Step 3: Save credentials to Keychain for biometric re-auth
    await saveCredentials(email, password, name, uid)
    setHasBiometricCredentials(true)

    // Step 4: Try to create Firestore user document (non-critical)
    if (db) {
      try {
        await db.collection("users").doc(uid).set({
          name,
          email,
          createdAt: new Date().toISOString(),
          activities: [],
          preferences: {}
        })
        console.log("✅ User document created in Firestore")
      } catch (firestoreError) {
        console.warn("⚠️ Could not create user document (will retry later):", firestoreError)
      }
    }

    await AsyncStorage.removeItem("guestMode")
  }

  const logout = async () => {
    if (!auth) return

    try {
      await auth.signOut()
      await AsyncStorage.removeItem("guestMode")
      // Clear biometric credentials from Keychain
      await clearStoredCredentials()
      setHasBiometricCredentials(false)
      setIsAuthenticated(false)
      setIsGuest(false)
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
    loading,
    hasBiometricCredentials,
    user,
    login,
    loginWithBiometrics,
    signup,
    logout,
    continueAsGuest,
    promptLogin,
    getStoredEmail: async () => getStoredEmail()
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
