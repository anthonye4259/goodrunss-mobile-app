/**
 * Client Streak Indicator
 * 
 * Shows how many consecutive weeks a client has trained.
 * Gamifies consistency and builds engagement.
 */

import { View, Text, StyleSheet, Animated } from "react-native"
import { useRef, useEffect } from "react"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"

type Props = {
    streakWeeks: number
    clientName: string
    lastSessionDate?: Date
    variant?: "compact" | "full"
}

export function ClientStreak({ streakWeeks, clientName, lastSessionDate, variant = "compact" }: Props) {
    const scaleAnim = useRef(new Animated.Value(1)).current
    const glowAnim = useRef(new Animated.Value(0)).current

    // Pulse animation for active streaks
    useEffect(() => {
        if (streakWeeks >= 4) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(glowAnim, {
                        toValue: 1,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(glowAnim, {
                        toValue: 0,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                ])
            ).start()
        }
    }, [streakWeeks])

    const getStreakLevel = () => {
        if (streakWeeks >= 12) return { label: "🔥 On Fire!", color: "#EF4444", bg: "#EF444420" }
        if (streakWeeks >= 8) return { label: "⚡ Hot Streak", color: "#F97316", bg: "#F9731620" }
        if (streakWeeks >= 4) return { label: "✨ Building", color: "#FBBF24", bg: "#FBBF2420" }
        if (streakWeeks >= 2) return { label: "🌱 Growing", color: "#22C55E", bg: "#22C55E20" }
        return { label: "New", color: "#666", bg: "#66666620" }
    }

    const level = getStreakLevel()

    if (variant === "compact") {
        return (
            <View style={[styles.compactContainer, { backgroundColor: level.bg }]}>
                <Text style={styles.streakNumber}>{streakWeeks}</Text>
                <View>
                    <Text style={[styles.compactLabel, { color: level.color }]}>week streak</Text>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[level.bg, "transparent"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Ionicons
                            name={streakWeeks >= 4 ? "flame" : "trending-up"}
                            size={24}
                            color={level.color}
                        />
                    </View>
                    <View style={styles.headerText}>
                        <Text style={styles.title}>{streakWeeks} Week Streak</Text>
                        <Text style={[styles.level, { color: level.color }]}>{level.label}</Text>
                    </View>
                </View>

                {/* Week visualization */}
                <View style={styles.weeksRow}>
                    {Array.from({ length: Math.min(12, streakWeeks) }).map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.weekDot,
                                { backgroundColor: level.color },
                                i >= 8 && styles.weekDotLarge,
                            ]}
                        />
                    ))}
                    {streakWeeks > 12 && (
                        <Text style={[styles.moreWeeks, { color: level.color }]}>+{streakWeeks - 12}</Text>
                    )}
                </View>

                <Text style={styles.message}>
                    {clientName} has trained every week for {streakWeeks} weeks!
                    {streakWeeks >= 8 && " 🎉 Amazing dedication!"}
                </Text>
            </LinearGradient>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 12,
    },
    gradient: {
        padding: 16,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "rgba(0,0,0,0.3)",
        alignItems: "center",
        justifyContent: "center",
    },
    headerText: {
        flex: 1,
    },
    title: {
        color: "#FFF",
        fontSize: 18,
        fontWeight: "700",
    },
    level: {
        fontSize: 13,
        fontWeight: "600",
        marginTop: 2,
    },
    weeksRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 12,
    },
    weekDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    weekDotLarge: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    moreWeeks: {
        fontSize: 12,
        fontWeight: "600",
        marginLeft: 4,
    },
    message: {
        color: "#999",
        fontSize: 13,
        lineHeight: 18,
    },
    compactContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    streakNumber: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "700",
    },
    compactLabel: {
        fontSize: 11,
        fontWeight: "500",
    },
})

export default ClientStreak
