/**
 * Where I'm Headed
 * 
 * Quick share to let friends know where you're going.
 * Creates FOMO and drives engagement.
 */

import { View, Text, TouchableOpacity, StyleSheet, Share, Animated } from "react-native"
import { useRef, useEffect } from "react"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"

type Props = {
    courtName: string
    courtId: string
    sport: string
    eta?: string // "5 min", "15 min"
    onShare?: () => void
}

export function WhereImHeaded({ courtName, courtId, sport, eta, onShare }: Props) {
    const pulseAnim = useRef(new Animated.Value(1)).current
    const deepLink = `https://goodrunss.app/court/${courtId}`

    // Pulsing animation to draw attention
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start()
    }, [])

    const getShareMessage = () => {
        const etaText = eta ? ` (${eta} away)` : ""
        return `🚀 On my way to ${courtName}${etaText}! Come run some ${sport.toLowerCase()} with me 🏀\n\n${deepLink}`
    }

    const handleShare = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)

        try {
            const result = await Share.share({
                title: `I'm heading to ${courtName}!`,
                message: getShareMessage(),
                url: deepLink,
            })

            if (result.action === Share.sharedAction) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                onShare?.()
            }
        } catch (error) {
            console.error("Share failed:", error)
        }
    }

    return (
        <Animated.View style={[styles.container, { transform: [{ scale: pulseAnim }] }]}>
            <TouchableOpacity onPress={handleShare} activeOpacity={0.9}>
                <LinearGradient
                    colors={["#7ED957", "#22C55E"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradient}
                >
                    <View style={styles.iconContainer}>
                        <Ionicons name="navigate" size={24} color="#000" />
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.heading}>Let friends know!</Text>
                        <Text style={styles.subheading} numberOfLines={1}>
                            "I'm headed to {courtName}"
                        </Text>
                    </View>

                    <View style={styles.shareIcon}>
                        <Ionicons name="share-social" size={20} color="#000" />
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    )
}

// Compact inline version
export function WhereImHeadedChip({ courtName, courtId, onShare }: {
    courtName: string
    courtId: string
    onShare?: () => void
}) {
    const deepLink = `https://goodrunss.app/court/${courtId}`

    const handleShare = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        await Share.share({
            title: `Heading to ${courtName}`,
            message: `🚀 On my way to ${courtName}! Pull up if you want to run.\n\n${deepLink}`,
        })

        onShare?.()
    }

    return (
        <TouchableOpacity style={styles.chip} onPress={handleShare}>
            <Ionicons name="navigate" size={14} color="#7ED957" />
            <Text style={styles.chipText}>Share I'm headed here</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 20,
        overflow: "hidden",
        marginBottom: 16,
    },
    gradient: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "rgba(0,0,0,0.15)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    heading: {
        color: "#000",
        fontSize: 14,
        fontWeight: "700",
    },
    subheading: {
        color: "rgba(0,0,0,0.7)",
        fontSize: 12,
        marginTop: 2,
    },
    shareIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(0,0,0,0.1)",
        alignItems: "center",
        justifyContent: "center",
    },
    chip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#7ED95720",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#7ED95730",
    },
    chipText: {
        color: "#7ED957",
        fontSize: 12,
        fontWeight: "500",
    },
})

export default WhereImHeaded
