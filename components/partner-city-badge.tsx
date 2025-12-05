import { View, Text, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useUserLocation } from "@/lib/services/location-service"

export function PartnerCityBadge() {
    const { location } = useUserLocation()

    // Check if user is in Myrtle Beach area (approximate coordinates)
    const isInMyrtleBeach =
        location.latitude >= 33.6 &&
        location.latitude <= 33.8 &&
        location.longitude >= -79.0 &&
        location.longitude <= -78.8

    if (!isInMyrtleBeach) return null

    return (
        <View style={styles.container}>
            <View style={styles.badge}>
                <Text style={styles.emoji}>🏖️</Text>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>Myrtle Beach Partner City</Text>
                    <Text style={styles.subtitle}>2x rewards on all reports!</Text>
                </View>
                <View style={styles.multiplier}>
                    <Text style={styles.multiplierText}>2x</Text>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    badge: {
        backgroundColor: "rgba(132, 204, 22, 0.1)",
        borderRadius: 12,
        padding: 12,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(132, 204, 22, 0.3)",
    },
    emoji: {
        fontSize: 32,
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#7ED957",
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 12,
        color: "#9CA3AF",
    },
    multiplier: {
        backgroundColor: "#7ED957",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    multiplierText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#000",
    },
})
