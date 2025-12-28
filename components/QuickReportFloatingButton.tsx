/**
 * Quick Report Floating Button
 * 
 * Cal.ai-inspired design: minimal, sophisticated, subtle glass effect
 */

import { TouchableOpacity, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import * as Haptics from "expo-haptics"
import { useUserLocation } from "@/lib/location-context"
import { venueService } from "@/lib/services/venue-service"
import { QuickCourtReportModal } from "@/components/QuickCourtReport"

interface QuickReportFloatingButtonProps {
    hidden?: boolean
    userId?: string
}

export function QuickReportFloatingButton({ hidden = false, userId = "user_current" }: QuickReportFloatingButtonProps) {
    const router = useRouter()
    const { location } = useUserLocation()
    const [nearestVenue, setNearestVenue] = useState<any>(null)
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        if (location) {
            venueService.getVenuesNearby(location, 1).then(venues => {
                if (venues && venues.length > 0) {
                    setNearestVenue(venues[0])
                }
            })
        }
    }, [location])

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        setShowModal(true)
    }

    if (hidden) return null

    return (
        <>
            <TouchableOpacity
                onPress={handlePress}
                activeOpacity={0.7}
                style={styles.container}
            >
                <View style={styles.button}>
                    <Ionicons name="radio" size={18} color="#4ADE80" />
                </View>
            </TouchableOpacity>

            <QuickCourtReportModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                venueId={nearestVenue?.id || "manual_select"}
                venueName={nearestVenue?.name || "Select Venue"}
                userId={userId}
                onReportSubmitted={() => setShowModal(false)}
            />
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 100,
        left: 16,
        zIndex: 1000,
    },
    button: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(74, 222, 128, 0.15)",
        borderWidth: 1,
        borderColor: "rgba(74, 222, 128, 0.3)",
        alignItems: "center",
        justifyContent: "center",
    },
})

export default QuickReportFloatingButton
