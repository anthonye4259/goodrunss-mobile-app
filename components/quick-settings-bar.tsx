import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useUserPreferences } from "@/lib/user-preferences"
import { useUserLocation } from "@/lib/services/location-service"
import { getPrimaryActivity } from "@/lib/activity-content"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"

export function QuickSettingsBar() {
    const { preferences } = useUserPreferences()
    const { location } = useUserLocation()
    const primaryActivity = getPrimaryActivity(preferences.activities) || "Basketball"

    const handleLocationPress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        // TODO: Open location picker modal
        console.log("Change location")
    }

    const handleSportPress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        router.push("/onboarding/questionnaire")
    }

    return (
        <View style={styles.container}>
            {/* Location Selector */}
            <TouchableOpacity style={styles.button} onPress={handleLocationPress}>
                <Ionicons name="location" size={16} color="#7ED957" />
                <Text style={styles.buttonText} numberOfLines={1}>
                    {preferences.location?.city || "Current Location"}
                </Text>
                <Ionicons name="chevron-down" size={14} color="#666" />
            </TouchableOpacity>

            {/* Sport/Activity Selector */}
            <TouchableOpacity style={styles.button} onPress={handleSportPress}>
                <Ionicons name="basketball" size={16} color="#7ED957" />
                <Text style={styles.buttonText} numberOfLines={1}>
                    {primaryActivity}
                </Text>
                <Ionicons name="chevron-down" size={14} color="#666" />
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: "#0A0A0A",
        borderBottomWidth: 1,
        borderBottomColor: "#252525",
        gap: 8,
    },
    button: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: "#252525",
        gap: 6,
    },
    buttonText: {
        flex: 1,
        fontSize: 13,
        fontWeight: "600",
        color: "#FFFFFF",
    },
})
