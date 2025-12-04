import { initializeApp, FirebaseApp, getApps, getApp } from "firebase/app"
import { getFirestore, Firestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "goodrunss-ai",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "",
}

// Safe initialization - won't crash if Firebase isn't configured
let app: FirebaseApp | null = null
let db: Firestore | null = null

try {
  // Check if Firebase app already exists
  if (getApps().length > 0) {
    app = getApp()
  } else if (firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig)
  }
  
  if (app) {
    db = getFirestore(app)
    console.log("✅ Firebase initialized successfully")
  } else {
    console.warn("⚠️ Firebase not configured - running without backend")
  }
} catch (error) {
  console.warn("⚠️ Firebase setup skipped:", error)
  // App will continue without Firebase
}

// Auth will be handled separately via AuthContext with AsyncStorage for now
export { db, app }
