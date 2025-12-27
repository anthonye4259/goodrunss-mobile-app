/**
 * Share Review / Testimonial (Trainer)
 * 
 * Share a great review to build social proof.
 * Formatted nicely for social media.
 */

import { View, Text, TouchableOpacity, StyleSheet, Share, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"

type Review = {
    id: string
    clientName: string
    rating: number
    text: string
    date?: Date
}

type Props = {
    review: Review
    trainerId: string
    trainerName: string
    onShared?: () => void
}

export function ShareReview({ review, trainerId, trainerName, onShared }: Props) {
    const bookingLink = `https://goodrunss.app/book/${trainerId}`

    const getShareMessage = () => {
        const stars = "⭐".repeat(review.rating)
        return `${stars}\n\n"${review.text}"\n\n— ${review.clientName}\n\n💪 Book a session with me:\n${bookingLink}`
    }

    const handleShare = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        try {
            const result = await Share.share({
                title: `Review for ${trainerName}`,
                message: getShareMessage(),
                url: bookingLink,
            })

            if (result.action === Share.sharedAction) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                onShared?.()
            }
        } catch (error) {
            Alert.alert("Error", "Failed to share")
        }
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={["#FBBF2420", "#0A0A0A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                {/* Star rating */}
                <View style={styles.starsRow}>
                    {Array.from({ length: review.rating }).map((_, i) => (
                        <Ionicons key={i} name="star" size={16} color="#FBBF24" />
                    ))}
                </View>

                {/* Quote */}
                <Text style={styles.quoteText}>"{review.text}"</Text>

                {/* Attribution */}
                <Text style={styles.clientName}>— {review.clientName}</Text>

                {/* Share button */}
                <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                    <Ionicons name="share-social" size={16} color="#000" />
                    <Text style={styles.shareText}>Share This Review</Text>
                </TouchableOpacity>

                <Text style={styles.tip}>
                    ✨ Share reviews on social media to build trust
                </Text>
            </LinearGradient>
        </View>
    )
}

// Compact shareable badge for review cards
export function ShareReviewButton({ review, trainerId, onShared }: {
    review: Review
    trainerId: string
    onShared?: () => void
}) {
    const handleShare = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

        const bookingLink = `https://goodrunss.app/book/${trainerId}`
        const stars = "⭐".repeat(review.rating)
        const message = `${stars}\n\n"${review.text}"\n\n— ${review.clientName}\n\n${bookingLink}`

        await Share.share({ message })
        onShared?.()
    }

    return (
        <TouchableOpacity style={styles.shareChip} onPress={handleShare}>
            <Ionicons name="share-outline" size={14} color="#FBBF24" />
            <Text style={styles.shareChipText}>Share</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 20,
        overflow: "hidden",
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#FBBF2430",
    },
    gradient: {
        padding: 20,
    },
    starsRow: {
        flexDirection: "row",
        gap: 2,
        marginBottom: 12,
    },
    quoteText: {
        color: "#FFF",
        fontSize: 16,
        fontStyle: "italic",
        lineHeight: 24,
        marginBottom: 8,
    },
    clientName: {
        color: "#888",
        fontSize: 13,
        marginBottom: 16,
    },
    shareButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#FBBF24",
        paddingVertical: 12,
        borderRadius: 14,
        marginBottom: 12,
    },
    shareText: {
        color: "#000",
        fontSize: 14,
        fontWeight: "700",
    },
    tip: {
        color: "#888",
        fontSize: 11,
        textAlign: "center",
    },
    shareChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "#FBBF2420",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
    },
    shareChipText: {
        color: "#FBBF24",
        fontSize: 11,
        fontWeight: "600",
    },
})

export default ShareReview
