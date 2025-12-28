/**
 * ShareCourtStatus
 * 
 * Share current court status to social media or messages:
 * - Native share sheet integration
 * - Pre-formatted message with court name, status, and player count
 * - Deep link for non-app users
 */

import React from "react"
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    Share,
    Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"

interface ShareCourtStatusProps {
    venueName: string
    sport: string
    playersNow: number
    status: "quiet" | "moderate" | "busy" | "packed"
    style?: object
}

const STATUS_MESSAGES: Record<string, string> = {
    quiet: "wide open",
    moderate: "active with games",
    busy: "getting crowded",
    packed: "packed - all courts taken",
}

const SPORT_EMOJI: Record<string, string> = {
    Basketball: "🏀",
    Tennis: "🎾",
    Pickleball: "🏓",
    Soccer: "⚽",
    Volleyball: "🏐",
    Golf: "⛳",
}

export function ShareCourtStatus({
    venueName,
    sport,
    playersNow,
    status,
    style
}: ShareCourtStatusProps) {

    const handleShare = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        const emoji = SPORT_EMOJI[sport] || "🏀"
        const statusText = STATUS_MESSAGES[status] || "active"
        const playerText = playersNow === 1 ? "1 player" : `${playersNow} players`

        const message = `${emoji} ${venueName} is ${statusText}!\n\n` +
            `Currently: ${playerText}\n\n` +
            `Come play! 🎯\n\n` +
            `📲 Check real-time court updates on GoodRunss`

        try {
            const result = await Share.share({
                message,
                title: `${sport} at ${venueName}`,
            })

            if (result.action === Share.sharedAction) {
                // Successfully shared
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            }
        } catch (error) {
            console.error("Share error:", error)
            Alert.alert("Couldn't share", "Please try again")
        }
    }

    return (
        <TouchableOpacity
            style={[styles.shareButton, style]}
            onPress={handleShare}
            activeOpacity={0.7}
        >
            <Ionicons name="share-outline" size={18} color="#7ED957" />
            <Text style={styles.shareText}>Share Status</Text>
        </TouchableOpacity>
    )
}

/**
 * Compact share icon button
 */
export function ShareStatusIcon({
    venueName,
    sport,
    playersNow,
    status
}: ShareCourtStatusProps) {

    const handleShare = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

        const emoji = SPORT_EMOJI[sport] || "🏀"
        const statusText = STATUS_MESSAGES[status] || "active"

        const message = `${emoji} ${venueName} - ${statusText} (${playersNow} players) - via GoodRunss`

        try {
            await Share.share({ message })
        } catch (error) {
            console.error("Share error:", error)
        }
    }

    return (
        <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
            <Ionicons name="share-social" size={20} color="#9CA3AF" />
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    shareButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 10,
        backgroundColor: "rgba(126, 217, 87, 0.15)",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(126, 217, 87, 0.3)",
    },
    shareText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#7ED957",
    },
    iconButton: {
        padding: 8,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderRadius: 20,
    },
})

export default ShareCourtStatus
