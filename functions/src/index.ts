import * as admin from "firebase-admin"

// Initialize Firebase Admin SDK (must be done before importing modules)
admin.initializeApp()

// Export all Cloud Functions from modules
export * from "./modules/payments"
export * from "./modules/notifications"
export * from "./modules/subscriptions"
export * from "./modules/traffic"
export * from "./modules/leagues"
export * from "./modules/matching"
export * from "./modules/admin"
export * from "./modules/wellness-integrations"
export * from "./modules/court-integrations"
export * from "./modules/booking-confirmation"
