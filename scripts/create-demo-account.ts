/**
 * Create Demo Account for App Store Review
 * 
 * Run this script to create a demo account with pre-populated data
 * for Apple reviewers to test the app.
 * 
 * Usage: npx ts-node scripts/create-demo-account.ts
 */

import { initializeApp } from "firebase/app"
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"
import { getFirestore, doc, setDoc } from "firebase/firestore"

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
}

// Demo account credentials - UPDATE THESE IN APP STORE CONNECT
const DEMO_EMAIL = "demo@goodrunss.com"
const DEMO_PASSWORD = "DemoUser2024!"

async function createDemoAccount() {
    console.log("🚀 Creating demo account for App Store review...")

    const app = initializeApp(firebaseConfig)
    const auth = getAuth(app)
    const db = getFirestore(app)

    try {
        // Create the user
        const userCredential = await createUserWithEmailAndPassword(auth, DEMO_EMAIL, DEMO_PASSWORD)
        const user = userCredential.user

        console.log("✅ Created user:", user.uid)

        // Set up user document with demo data
        await setDoc(doc(db, "users", user.uid), {
            name: "Demo User",
            email: DEMO_EMAIL,
            userType: "player",
            activities: ["basketball", "tennis", "pickleball"],
            primaryActivity: "basketball",
            createdAt: new Date(),
            onboardingComplete: true,
            notificationsEnabled: true,
            location: {
                city: "Myrtle Beach",
                state: "SC",
            },
        })

        console.log("✅ Created user profile")

        // Add some demo activity/reports
        const reportsRef = doc(db, "reports", `demo_report_1`)
        await setDoc(reportsRef, {
            userId: user.uid,
            courtId: "valor_park",
            courtName: "Valor Park Basketball Courts",
            crowdLevel: "moderate",
            timestamp: new Date(),
            playersCount: 8,
            notes: "Great games happening!",
        })

        console.log("✅ Created demo report")

        // Add streak data
        await setDoc(doc(db, "streaks", user.uid), {
            currentStreak: 7,
            longestStreak: 14,
            lastCheckIn: new Date(),
            totalCheckIns: 23,
        })

        console.log("✅ Created streak data")

        console.log("\n" + "=".repeat(50))
        console.log("📱 DEMO ACCOUNT CREATED SUCCESSFULLY")
        console.log("=".repeat(50))
        console.log(`Email:    ${DEMO_EMAIL}`)
        console.log(`Password: ${DEMO_PASSWORD}`)
        console.log("=".repeat(50))
        console.log("\n⚠️  Update these credentials in App Store Connect!\n")

    } catch (error: any) {
        if (error.code === "auth/email-already-in-use") {
            console.log("ℹ️  Demo account already exists")
            console.log(`Email:    ${DEMO_EMAIL}`)
            console.log(`Password: ${DEMO_PASSWORD}`)
        } else {
            console.error("❌ Error:", error.message)
        }
    }

    process.exit(0)
}

createDemoAccount()
