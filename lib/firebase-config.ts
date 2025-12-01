import { initializeApp, FirebaseApp } from "firebase/app"
import { getFirestore, Firestore } from "firebase/firestore"
import { getAuth, Auth } from "firebase/auth"

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
let auth: Auth | null = null

try {
  // Only initialize if we have at least a project ID
  if (firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig)
    db = getFirestore(app)
    auth = getAuth(app)
    console.log("✅ Firebase initialized successfully")
  } else {
    console.warn("⚠️ Firebase not configured - running without backend")
  }
} catch (error) {
  console.error("❌ Firebase initialization error:", error)
  // App will continue without Firebase
}

export { db, auth, app }
