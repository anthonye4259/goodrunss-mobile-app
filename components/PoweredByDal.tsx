import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "@/lib/auth-context"
import { useUserPreferences } from "@/lib/user-preferences"

/**
 * Powered by Dal Badge
 * 
 * Appears subtly in footers.
 * Hidden if user has referrals >= 5 AND hideBranding is true.
 */
export function PoweredByDal({ dark = false }: { dark?: boolean }) {
    const { user } = useAuth()
    const { preferences } = useUserPreferences()

    // Check if white label mode is unlocked and enabled
    const referralCount = preferences.referralCount || 0
    const isUnlocked = referralCount >= 5
    const isHidden = isUnlocked && preferences.hideBranding === true

    if (isHidden) return null

    const handlePress = () => {
        Linking.openURL(`https://alaii.app/signup?ref=${user?.id}`)
    }

    const textColor = dark ? "#FFFFFF" : "#6B7280"
    const iconColor = dark ? "#FFFFFF" : "#9CA3AF"

    return (
        <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
            <View style={styles.content}>
                <Ionicons name="flash" size={10} color="#7ED957" style={styles.icon} />
                <Text style={[styles.text, { color: textColor }]}>
                    Powered by <Text style={styles.brand}>Dal AI</Text>
                </Text>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        opacity: 0.8,
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    icon: {
        marginTop: 1,
    },
    text: {
        fontSize: 11,
        fontWeight: "500",
        fontFamily: "System",
    },
    brand: {
        fontWeight: "700",
    }
})
