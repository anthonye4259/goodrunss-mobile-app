/**
 * Where I'm Headed
 * 
 * Quick share to let friends know where you're going.
 * Creates FOMO and drives engagement.
 */

import { View, Text, TouchableOpacity, StyleSheet, Share, Animated } from "react-native"
import { useRef, useEffect, useState } from "react"
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

export function WhereImHeaded({ courtName, courtId, sport, onShare }: Props) {
    const pulseAnim = useRef(new Animated.Value(1)).current
    const deepLink = `https://goodrunss.app/court/${courtId}`

    // Quick Time Options
    const [selectedTime, setSelectedTime] = useState<string>("Now")

    const timeOptions = ["Now", "15m", "30m", "1h", "2h"]

    // Pulsing animation to draw attention
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.02,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start()
    }, [])

    const getActionText = () => {
        const s = sport.toLowerCase()
        if (s === 'tennis' || s === 'pickleball') return 'hit some balls'
        if (s === 'basketball') return 'hoop'
        return `play ${s}`
    }

    const getShareMessage = () => {
        const timeText = selectedTime === "Now" ? "right now" : `in ${selectedTime}`
        const action = getActionText()
        return `🚀 I'm headed to ${courtName} ${timeText}! Come ${action} with me.\n\n${deepLink}`
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
            <LinearGradient
                colors={["#7ED957", "#22C55E"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.topRow}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="navigate" size={24} color="#000" />
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.heading}>I'm Headed Here</Text>
                        <Text style={styles.subheading} numberOfLines={1}>
                            Notify friends & followers
                        </Text>
                    </View>
                </View>

                {/* Time Selection Chips */}
                <View style={styles.timeRow}>
                    {timeOptions.map((time) => (
                        <TouchableOpacity
                            key={time}
                            onPress={() => {
                                Haptics.selectionAsync()
                                setSelectedTime(time)
                            }}
                            style={[
                                styles.timeChip,
                                selectedTime === time && styles.timeChipActive
                            ]}
                        >
                            <Text style={[
                                styles.timeText,
                                selectedTime === time && styles.timeTextActive
                            ]}>{time}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleShare}
                >
                    <Text style={styles.actionText}>Share Status: {selectedTime === "Now" ? "Going Now" : `Arriving in ${selectedTime}`}</Text>
                    <Ionicons name="share-social" size={18} color="#000" />
                </TouchableOpacity>

            </LinearGradient>
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
        padding: 16,
    },
    topRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(0,0,0,0.1)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    timeRow: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 16,
    },
    timeChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: "rgba(0,0,0,0.1)",
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.1)",
    },
    timeChipActive: {
        backgroundColor: "#000",
        borderColor: "#000",
    },
    timeText: {
        fontSize: 12,
        fontWeight: "600",
        color: "rgba(0,0,0,0.6)",
    },
    timeTextActive: {
        color: "#FFF",
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.2)",
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    actionText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#000",
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
