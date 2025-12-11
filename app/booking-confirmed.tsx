/**
 * Session Confirmation Screen Route
 * 
 * Shows after a booking is confirmed.
 */

import { useLocalSearchParams } from "expo-router"
import { SessionConfirmation, SessionDetails } from "@/components/SessionConfirmation"

export default function SessionConfirmationScreen() {
    const params = useLocalSearchParams()

    // Parse session data from params
    const session: SessionDetails = {
        id: params.sessionId as string || "session-1",
        trainerName: params.trainerName as string || "Your Trainer",
        sessionType: params.sessionType as string || "Training Session",
        date: params.date as string || "Saturday, Dec 14",
        time: params.time as string || "2:00 PM - 3:00 PM",
        duration: parseInt(params.duration as string) || 60,
        location: params.location as string || "Local Court",
        address: params.address as string || "123 Main St",
        latitude: params.latitude ? parseFloat(params.latitude as string) : undefined,
        longitude: params.longitude ? parseFloat(params.longitude as string) : undefined,
        price: parseInt(params.price as string) || 50,
        isPaid: params.isPaid === "true",
        trainerId: params.trainerId as string,
    }

    return <SessionConfirmation session={session} />
}
