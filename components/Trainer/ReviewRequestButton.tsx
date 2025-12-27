/**
 * Review Request Button
 * 
 * Auto-send review request link after session.
 * Builds social proof for trainer.
 */

import { View, Text, TouchableOpacity, StyleSheet, Share, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"

type Props = {
    trainerId: string
    trainerName: string
    clientName: string
    sessionDate?: Date
    onSent?: () => void
}

export function ReviewRequestButton({ trainerId, trainerName, clientName, sessionDate, onSent }: Props) {
    const reviewLink = `https://goodrunss.app/review/${trainerId}`

    const handleRequest = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        try {
            const result = await Share.share({
                title: "Leave a Review",
                message: `Hi ${clientName}! Thanks for training with me today. Would you mind leaving a quick review? It really helps my business grow. ${reviewLink}`,
            })

            if (result.action === Share.sharedAction) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                Alert.alert("Sent! ⭐", "Review request sent successfully")
                onSent?.()
            }
        } catch (error) {
            Alert.alert("Error", "Failed to send. Please try again.")
        }
    }

    return (
        <TouchableOpacity style={styles.button} onPress={handleRequest} activeOpacity={0.8}>
            <View style={styles.iconContainer}>
                <Ionicons name="star" size={16} color="#FBBF24" />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.title}>Request Review</Text>
                <Text style={styles.subtitle}>Send to {clientName}</Text>
            </View>
            <Ionicons name="send" size={16} color="#FBBF24" />
        </TouchableOpacity>
    )
}

// Compact variant for inline use
export function ReviewRequestChip({ onPress }: { onPress: () => void }) {
    return (
        <TouchableOpacity
            style={styles.chip}
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                onPress()
            }}
        >
            <Ionicons name="star-outline" size={14} color="#FBBF24" />
            <Text style={styles.chipText}>Get Review</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FBBF2420",
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: "#FBBF2440",
        marginBottom: 12,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: "#FBBF2430",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "600",
    },
    subtitle: {
        color: "#888",
        fontSize: 11,
        marginTop: 2,
    },
    chip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "#FBBF2420",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
    },
    chipText: {
        color: "#FBBF24",
        fontSize: 11,
        fontWeight: "600",
    },
})

export default ReviewRequestButton
