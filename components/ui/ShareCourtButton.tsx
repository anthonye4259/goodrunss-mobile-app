/**
 * Share Court Button
 * 
 * Generates a deep link and shares court via native share sheet.
 */

import { View, Text, TouchableOpacity, StyleSheet, Share, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import * as Clipboard from "expo-clipboard"

type Props = {
    courtId: string
    courtName: string
    variant?: "button" | "icon"
    size?: "small" | "medium" | "large"
}

export function ShareCourtButton({ courtId, courtName, variant = "button", size = "medium" }: Props) {
    // Generate deep link (would be real deep link in production)
    const deepLink = `https://goodrunss.app/court/${courtId}`

    const handleShare = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        try {
            const result = await Share.share({
                title: `Check out ${courtName}`,
                message: `Check out ${courtName} on GoodRunss! See live player counts: ${deepLink}`,
                url: deepLink,
            })

            if (result.action === Share.sharedAction) {
                // Shared successfully
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            }
        } catch (error) {
            Alert.alert("Error", "Failed to share. Try again.")
        }
    }

    const handleCopyLink = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        await Clipboard.setStringAsync(deepLink)
        Alert.alert("Copied!", "Link copied to clipboard")
    }

    const iconSize = size === "small" ? 18 : size === "large" ? 28 : 22

    if (variant === "icon") {
        return (
            <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
                <Ionicons name="share-outline" size={iconSize} color="#7ED957" />
            </TouchableOpacity>
        )
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare} activeOpacity={0.8}>
                <Ionicons name="share-social" size={18} color="#FFF" />
                <Text style={styles.shareText}>Share Court</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.copyButton} onPress={handleCopyLink} activeOpacity={0.8}>
                <Ionicons name="link" size={18} color="#7ED957" />
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    shareButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#7ED957",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
    },
    shareText: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "600",
    },
    copyButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "#1A1A1A",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#7ED95740",
    },
    iconButton: {
        padding: 8,
    },
})

export default ShareCourtButton
