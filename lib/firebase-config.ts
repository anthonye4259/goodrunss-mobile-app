import { initializeApp, FirebaseApp, getApps, getApp } from "firebase/app"
import { getFirestore, Firestore } from "firebase/firestore"
import { getAuth, Auth, initializeAuth, getReactNativePersistence } from "firebase/auth"
import AsyncStorage from "@react-native-async-storage/async-storage"

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "goodrunss-ai",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "",
}

// Log configuration status (without exposing keys)
const configStatus = {
  apiKey: !!firebaseConfig.apiKey,
  authDomain: !!firebaseConfig.authDomain,
  projectId: !!firebaseConfig.projectId,
  appId: !!firebaseConfig.appId,
}
console.log("Firebase config status:", configStatus)

// Safe initialization - won't crash if Firebase isn't configured
let app: FirebaseApp | null = null
let db: Firestore | null = null
let auth: Auth | null = null

try {
  // Check if all required config values are present
  const hasRequiredConfig = firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId

  if (!hasRequiredConfig) {
    console.warn("⚠️ Firebase config incomplete - some features may not work")
  }

  // Check if Firebase app already exists
  if (getApps().length > 0) {
    app = getApp()
    // CRITICAL: When app already exists, we still need to get auth properly
    // Try to get existing auth instance - this preserves the persistence setting
    try {
      auth = getAuth(app)
    } catch (authError) {
      console.log("Reinitializing auth with persistence...")
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
      })
    }
  } else if (firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig)
    // Initialize Auth with AsyncStorage persistence for React Native
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    })
  }

  if (app) {
    db = getFirestore(app)
    console.log("✅ Firebase initialized successfully")
    console.log("✅ Auth instance:", auth ? "Ready" : "Not available")
    console.log("✅ Firestore:", db ? "Ready" : "Not available")
  } else {
    console.warn("⚠️ Firebase not configured - running without backend")
  }
} catch (error) {
  console.error("❌ Firebase setup error:", error)
  // App will continue without Firebase, but log the actual error
}

export { db, app, auth }

