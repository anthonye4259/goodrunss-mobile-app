/**
 * Quick Report Floating Button
 * 
 * "Waze for Sports" Enabler
 * - Always visible on bottom left
 * - Auto-detects nearest venue for 1-tap reporting
 * - Allows manual search for remote reporting
 */

import { TouchableOpacity, StyleSheet, Animated, View, Text, Modal } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
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

    // Animations
    const scaleAnim = useRef(new Animated.Value(1)).current
    const pulseAnim = useRef(new Animated.Value(1)).current

    // Fetch nearest venue when location changes
    useEffect(() => {
        if (location) {
            venueService.getVenuesNearby(location, 1).then(venues => {
                if (venues && venues.length > 0) {
                    setNearestVenue(venues[0])
                }
            })
        }
    }, [location])

    // Pulse animation (slower than GIA to avoid chaos)
    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        )
        pulse.start()
        return () => pulse.stop()
    }, [])

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        // Press animation
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.9,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 3,
                tension: 100,
                useNativeDriver: true,
            }),
        ]).start()

        setShowModal(true)
    }

    if (hidden) return null

    return (
        <>
            <Animated.View
                style={[
                    styles.container,
                    {
                        transform: [
                            { scale: Animated.multiply(scaleAnim, pulseAnim) }
                        ]
                    }
                ]}
            >
                {/* Glow effect */}
                <View style={styles.glowOuter} />
                <View style={styles.glowInner} />

                {/* Main button */}
                <TouchableOpacity
                    onPress={handlePress}
                    activeOpacity={0.9}
                    style={styles.touchable}
                >
                    <LinearGradient
                        colors={["#7ED957", "#22C55E"]} // Green gradient for "Go/Active"
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.button}
                    >
                        <Ionicons name="megaphone" size={24} color="#000" />
                    </LinearGradient>
                </TouchableOpacity>

                {/* Dynamic Label */}
                <View style={styles.labelContainer}>
                    <Text style={styles.label}>
                        {nearestVenue ? "Report Status" : "Report"}
                    </Text>
                </View>

                {/* Location Receptor Badge (if nearby) */}
                {nearestVenue && nearestVenue.distance < 0.2 && (
                    <View style={styles.locationBadge}>
                        <Ionicons name="location" size={10} color="#fff" />
                        <Text style={styles.locationText}>At Court</Text>
                    </View>
                )}
            </Animated.View>

            {/* The Report Modal */}
            <QuickCourtReportModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                venueId={nearestVenue?.id || "manual_select"}
                venueName={nearestVenue?.name || "Select Venue"}
                userId={userId}
                onReportSubmitted={() => {
                    // Could add XP toast here
                    setShowModal(false)
                }}
            />
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 100,
        left: 20, // Opposite to GIA
        alignItems: "center",
        zIndex: 1000,
    },
    glowOuter: {
        position: "absolute",
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: "rgba(126, 217, 87, 0.2)",
    },
    glowInner: {
        position: "absolute",
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "rgba(126, 217, 87, 0.3)",
    },
    touchable: {
        borderRadius: 30,
        shadowColor: "#7ED957",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 10,
    },
    button: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    labelContainer: {
        marginTop: 6,
        backgroundColor: "rgba(126, 217, 87, 0.9)",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    label: {
        fontSize: 11,
        fontWeight: "bold",
        color: "#000",
    },
    locationBadge: {
        position: "absolute",
        top: -8,
        right: -8,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#EF4444",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        gap: 2,
        borderWidth: 1,
        borderColor: "#fff"
    },
    locationText: {
        fontSize: 9,
        fontWeight: "bold",
        color: "#fff"
    }
})

export default QuickReportFloatingButton
