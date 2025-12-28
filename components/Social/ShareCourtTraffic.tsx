/**
 * Share Court Traffic
 * 
 * Players can share live court traffic to socials or SMS.
 * "Join me at Central Park - 4 players here now!"
 */

import { View, Text, TouchableOpacity, StyleSheet, Share, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"

type Props = {
    courtName: string
    courtId: string
    playersNow: number
    sport: string
    variant?: "button" | "floating"
    onShared?: () => void
}

export function ShareCourtTraffic({ courtName, courtId, playersNow, sport, variant = "button", onShared }: Props) {
    const deepLink = `https://goodrunss.app/court/${courtId}`

    const getShareMessage = () => {
        if (playersNow === 0) {
            return `🏀 Empty court alert! ${courtName} is wide open. Come get some runs!\n\n${deepLink}`
        }
        if (playersNow <= 3) {
            return `🔥 ${courtName} has ${playersNow} players right now! Need more for a game. Pull up!\n\n${deepLink}`
        }
        if (playersNow <= 6) {
            return `🏀 Good vibes at ${courtName}! ${playersNow} players running. Come through!\n\n${deepLink}`
        }
        return `🔥🔥 ${courtName} is LIT! ${playersNow} players on the courts. You missing out!\n\n${deepLink}`
    }

    const handleShareSocial = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        try {
            const result = await Share.share({
                title: `${sport} at ${courtName}`,
                message: getShareMessage(),
                url: deepLink,
            })

            if (result.action === Share.sharedAction) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                onShared?.()
            }
        } catch (error) {
            Alert.alert("Error", "Failed to share. Please try again.")
        }
    }

    // Use native Share for SMS as well (opens share sheet where user can choose Messages)
    const handleShareSMS = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        try {
            await Share.share({
                message: getShareMessage(),
            })
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            onShared?.()
        } catch (error) {
            Alert.alert("Error", "Failed to share. Please try again.")
        }
    }

    if (variant === "floating") {
        return (
            <View style={styles.floatingContainer}>
                <TouchableOpacity style={styles.fabButton} onPress={handleShareSocial}>
                    <Ionicons name="share-social" size={20} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.fabButtonSecondary} onPress={handleShareSMS}>
                    <Ionicons name="chatbubble" size={18} color="#7ED957" />
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="megaphone" size={16} color="#7ED957" />
                <Text style={styles.title}>Share with friends</Text>
            </View>

            <View style={styles.buttonsRow}>
                <TouchableOpacity style={styles.socialButton} onPress={handleShareSocial}>
                    <Ionicons name="share-social" size={18} color="#FFF" />
                    <Text style={styles.socialButtonText}>Post</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.smsButton} onPress={handleShareSMS}>
                    <Ionicons name="chatbubble" size={18} color="#7ED957" />
                    <Text style={styles.smsButtonText}>Text</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.preview} numberOfLines={2}>
                {getShareMessage().replace(deepLink, "").trim()}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#141414",
        borderRadius: 16,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#7ED95730",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 10,
    },
    title: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "600",
    },
    buttonsRow: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 10,
    },
    socialButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        backgroundColor: "#7ED957",
        paddingVertical: 12,
        borderRadius: 12,
    },
    socialButtonText: {
        color: "#000",
        fontSize: 14,
        fontWeight: "600",
    },
    smsButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        backgroundColor: "#7ED95720",
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#7ED95740",
    },
    smsButtonText: {
        color: "#7ED957",
        fontSize: 14,
        fontWeight: "600",
    },
    preview: {
        color: "#888",
        fontSize: 11,
        lineHeight: 15,
        fontStyle: "italic",
    },
    floatingContainer: {
        position: "absolute",
        bottom: 100,
        right: 20,
        gap: 10,
    },
    fabButton: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: "#7ED957",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#7ED957",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    fabButtonSecondary: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#1A1A1A",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#7ED95740",
    },
})

export default ShareCourtTraffic
