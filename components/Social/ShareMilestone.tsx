/**
 * Share Milestone / Achievement (Trainer)
 * 
 * Share business achievements to celebrate and build credibility.
 * "100 sessions completed!", "New certified trainer!"
 */

import { View, Text, TouchableOpacity, StyleSheet, Share, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"

type MilestoneType =
    | "sessions_100"
    | "sessions_500"
    | "sessions_1000"
    | "clients_10"
    | "clients_50"
    | "clients_100"
    | "first_booking"
    | "five_star_streak"
    | "anniversary_1yr"
    | "revenue_1k"
    | "revenue_5k"
    | "revenue_10k"
    | "custom"

type Props = {
    type: MilestoneType
    trainerId: string
    trainerName: string
    customTitle?: string
    customEmoji?: string
    value?: number
    onShared?: () => void
}

const MILESTONE_CONFIG: Record<MilestoneType, {
    emoji: string
    title: string
    shareText: string
}> = {
    sessions_100: {
        emoji: "💯",
        title: "100 Sessions Complete!",
        shareText: "Just hit 100 training sessions on GoodRunss! 💪 Thank you to all my amazing clients!",
    },
    sessions_500: {
        emoji: "🔥",
        title: "500 Sessions Complete!",
        shareText: "500 sessions and counting! 🔥 Thank you for trusting me with your fitness journey!",
    },
    sessions_1000: {
        emoji: "🏆",
        title: "1,000 Sessions Complete!",
        shareText: "1,000 SESSIONS! 🏆 What an incredible milestone. Grateful for every single client!",
    },
    clients_10: {
        emoji: "🎉",
        title: "10 Happy Clients!",
        shareText: "Celebrating 10 amazing clients! 🎉 Here's to helping more people reach their goals!",
    },
    clients_50: {
        emoji: "⭐",
        title: "50 Clients Trained!",
        shareText: "50 clients and growing! ⭐ Thank you for being part of my fitness family!",
    },
    clients_100: {
        emoji: "🚀",
        title: "100 Clients Trained!",
        shareText: "Triple digits! 100 clients trained! 🚀 Let's keep crushing goals together!",
    },
    first_booking: {
        emoji: "🎊",
        title: "First Booking!",
        shareText: "Got my first booking on GoodRunss! 🎊 The journey begins!",
    },
    five_star_streak: {
        emoji: "⭐⭐⭐⭐⭐",
        title: "5-Star Streak!",
        shareText: "Keeping that 5-star rating! ⭐⭐⭐⭐⭐ Thank you for the amazing reviews!",
    },
    anniversary_1yr: {
        emoji: "🎂",
        title: "1 Year Anniversary!",
        shareText: "1 year on GoodRunss! 🎂 Thank you for an incredible first year!",
    },
    revenue_1k: {
        emoji: "💰",
        title: "$1,000 Earned!",
        shareText: "Hit my first $1,000 on GoodRunss! 💰 Building my training business one session at a time!",
    },
    revenue_5k: {
        emoji: "💵",
        title: "$5,000 Earned!",
        shareText: "$5,000 earned! 💵 Growing my business and loving every session!",
    },
    revenue_10k: {
        emoji: "🤑",
        title: "$10,000 Earned!",
        shareText: "$10K milestone! 🤑 Proof that passion + hard work = results!",
    },
    custom: {
        emoji: "🎉",
        title: "Achievement Unlocked!",
        shareText: "Celebrating a new milestone!",
    },
}

export function ShareMilestone({
    type,
    trainerId,
    trainerName,
    customTitle,
    customEmoji,
    value,
    onShared
}: Props) {
    const config = MILESTONE_CONFIG[type]
    const bookingLink = `https://goodrunss.app/book/${trainerId}`

    const title = customTitle || config.title
    const emoji = customEmoji || config.emoji

    const getShareMessage = () => {
        let text = config.shareText
        if (value) {
            text = text.replace(/\d+/, value.toString())
        }
        return `${text}\n\nBook a session with me: ${bookingLink}`
    }

    const handleShare = async () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

        try {
            const result = await Share.share({
                title: title,
                message: getShareMessage(),
                url: bookingLink,
            })

            if (result.action === Share.sharedAction) {
                onShared?.()
            }
        } catch (error) {
            Alert.alert("Error", "Failed to share")
        }
    }

    return (
        <TouchableOpacity onPress={handleShare} activeOpacity={0.9}>
            <LinearGradient
                colors={["#8B5CF640", "#8B5CF610", "#0A0A0A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.container}
            >
                <View style={styles.emojiContainer}>
                    <Text style={styles.emoji}>{emoji}</Text>
                </View>

                <View style={styles.content}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.shareHint}>Tap to share on social!</Text>
                </View>

                <View style={styles.shareIcon}>
                    <Ionicons name="share-social" size={20} color="#8B5CF6" />
                </View>
            </LinearGradient>
        </TouchableOpacity>
    )
}

// Compact version for lists
export function MilestoneShareChip({ type, trainerId, onShared }: {
    type: MilestoneType
    trainerId: string
    onShared?: () => void
}) {
    const config = MILESTONE_CONFIG[type]
    const bookingLink = `https://goodrunss.app/book/${trainerId}`

    const handleShare = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

        await Share.share({
            message: `${config.shareText}\n\nBook with me: ${bookingLink}`,
        })

        onShared?.()
    }

    return (
        <TouchableOpacity style={styles.chip} onPress={handleShare}>
            <Text style={styles.chipEmoji}>{config.emoji}</Text>
            <Text style={styles.chipText}>Share</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#8B5CF640",
    },
    emojiContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#8B5CF620",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 14,
    },
    emoji: {
        fontSize: 24,
    },
    content: {
        flex: 1,
    },
    title: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "700",
    },
    shareHint: {
        color: "#8B5CF6",
        fontSize: 12,
        marginTop: 4,
    },
    shareIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#8B5CF620",
        alignItems: "center",
        justifyContent: "center",
    },
    chip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "#8B5CF620",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
    },
    chipEmoji: {
        fontSize: 12,
    },
    chipText: {
        color: "#8B5CF6",
        fontSize: 11,
        fontWeight: "600",
    },
})

export default ShareMilestone
