/**
 * Firebase Configuration for React Native / Expo
 * 
 * Uses Firebase compat SDK for reliable React Native compatibility.
 * The modular SDK v10+ has known issues with Metro bundler.
 */

// Use compat SDK - much more reliable with React Native
import firebase from "firebase/compat/app"
import "firebase/compat/auth"
import "firebase/compat/firestore"
import "firebase/compat/functions"

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "goodrunss-ai",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "",
}

console.log("Firebase config:", {
  apiKey: firebaseConfig.apiKey ? "✓" : "✗",
  projectId: firebaseConfig.projectId,
  appId: firebaseConfig.appId ? "✓" : "✗",
})

// Initialize Firebase app (compat style)
let app: firebase.app.App | null = null
let auth: firebase.auth.Auth | null = null
let db: firebase.firestore.Firestore | null = null
let functions: firebase.functions.Functions | null = null

const hasRequiredConfig = !!(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId)

if (hasRequiredConfig) {
  try {
    // Initialize or get existing app
    if (firebase.apps.length === 0) {
      app = firebase.initializeApp(firebaseConfig)
      console.log("✅ Firebase App initialized")
    } else {
      app = firebase.app()
      console.log("✅ Firebase App already exists")
    }

    // Get auth instance
    auth = firebase.auth()
    console.log("✅ Auth ready")

    // Get Firestore instance
    db = firebase.firestore()
    console.log("✅ Firestore ready")

    // Get Functions instance
    functions = firebase.functions()
    console.log("✅ Functions ready")

  } catch (error) {
    console.error("❌ Firebase error:", error)
  }
} else {
  console.warn("⚠️ Firebase config missing - demo mode")
}

export { app, auth, db, functions }
export default firebase
