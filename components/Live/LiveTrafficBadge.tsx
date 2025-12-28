/**
 * LiveTrafficBadge
 * 
 * Premium-looking real-time traffic indicator for court cards.
 * Shows player count with animated pulse and confidence level.
 * Designed to look official and tech-forward.
 */

import { View, Text, StyleSheet, Animated } from "react-native"
import { useEffect, useRef } from "react"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"

type TrafficLevel = "quiet" | "moderate" | "busy" | "packed"

type Props = {
    level: TrafficLevel
    playersNow: number
    lastUpdated?: string // e.g., "2m ago"
    size?: "small" | "medium" | "large"
    trend?: "rising" | "falling" | "stable" // Activity trend
}

const LEVEL_CONFIG = {
    quiet: {
        label: "Low",
        color: "#22C55E",
        bgGradient: ["#22C55E15", "#22C55E08"] as const,
        icon: "checkmark-circle" as const,
    },
    moderate: {
        label: "Active",
        color: "#FBBF24",
        bgGradient: ["#FBBF2415", "#FBBF2408"] as const,
        icon: "people" as const,
    },
    busy: {
        label: "Busy",
        color: "#F97316",
        bgGradient: ["#F9731615", "#F9731608"] as const,
        icon: "flame" as const,
    },
    packed: {
        label: "Packed",
        color: "#EF4444",
        bgGradient: ["#EF444415", "#EF444408"] as const,
        icon: "warning" as const,
    },
}

export function LiveTrafficBadge({ level, playersNow, lastUpdated, size = "medium", trend }: Props) {
    // Defensive fallback: if level doesn't match config, default to "quiet"
    const config = LEVEL_CONFIG[level] || LEVEL_CONFIG["quiet"]
    const pulseAnim = useRef(new Animated.Value(1)).current

    // Pulse animation for the live dot
    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.4,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        )
        pulse.start()
        return () => pulse.stop()
    }, [])

    const isSmall = size === "small"
    const isLarge = size === "large"

    return (
        <View style={[styles.container, isSmall && styles.containerSmall, isLarge && styles.containerLarge]}>
            <LinearGradient
                colors={[...config.bgGradient]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.gradient, { borderColor: config.color + "40" }]}
            >
                {/* Live Indicator */}
                <View style={styles.liveSection}>
                    <Animated.View
                        style={[
                            styles.liveDot,
                            { backgroundColor: config.color, transform: [{ scale: pulseAnim }] }
                        ]}
                    />
                    <Text style={[styles.liveLabel, { color: config.color }]}>LIVE</Text>
                </View>

                {/* Main Content */}
                <View style={styles.mainContent}>
                    <View style={styles.playerRow}>
                        <Ionicons name={config.icon} size={isSmall ? 14 : 18} color={config.color} />
                        <Text style={[styles.playerCount, isSmall && styles.playerCountSmall, { color: config.color }]}>
                            {playersNow}
                        </Text>
                        <Text style={[styles.playerLabel, isSmall && styles.playerLabelSmall]}>
                            {playersNow === 1 ? "player" : "players"}
                        </Text>
                    </View>

                    {!isSmall && (
                        <View style={styles.statusRow}>
                            <View style={[styles.statusBadge, { backgroundColor: config.color + "20" }]}>
                                <Text style={[styles.statusLabel, { color: config.color }]}>{config.label}</Text>
                            </View>
                            {/* Trend Arrow */}
                            {trend && (
                                <View style={[styles.trendBadge, { backgroundColor: trend === "rising" ? "#EF444420" : trend === "falling" ? "#22C55E20" : "#6B728020" }]}>
                                    <Ionicons
                                        name={trend === "rising" ? "trending-up" : trend === "falling" ? "trending-down" : "remove"}
                                        size={12}
                                        color={trend === "rising" ? "#EF4444" : trend === "falling" ? "#22C55E" : "#6B7280"}
                                    />
                                    <Text style={[styles.trendText, { color: trend === "rising" ? "#EF4444" : trend === "falling" ? "#22C55E" : "#6B7280" }]}>
                                        {trend === "rising" ? "Getting busy" : trend === "falling" ? "Emptying out" : "Stable"}
                                    </Text>
                                </View>
                            )}
                            {lastUpdated && (
                                <Text style={styles.timestamp}>• {lastUpdated}</Text>
                            )}
                        </View>
                    )}
                </View>

                {/* AI Confidence Indicator */}
                {!isSmall && (
                    <View style={styles.aiSection}>
                        <Ionicons name="sparkles" size={12} color="#8B5CF6" />
                        <Text style={styles.aiText}>GIA</Text>
                    </View>
                )}
            </LinearGradient>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 8,
    },
    containerSmall: {
        marginBottom: 4,
    },
    containerLarge: {
        marginBottom: 12,
    },
    gradient: {
        flexDirection: "row",
        alignItems: "center",
        padding: 8,
        paddingHorizontal: 10,
        borderRadius: 12,
        borderWidth: 1,
    },
    liveSection: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 10,
        paddingRight: 10,
        borderRightWidth: 1,
        borderRightColor: "rgba(255,255,255,0.1)",
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 4,
    },
    liveLabel: {
        fontSize: 9,
        fontWeight: "800",
        letterSpacing: 1,
    },
    mainContent: {
        flex: 1,
    },
    playerRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    playerCount: {
        fontSize: 18,
        fontWeight: "800",
    },
    playerCountSmall: {
        fontSize: 14,
    },
    playerLabel: {
        fontSize: 12,
        color: "#9CA3AF",
        marginLeft: 2,
    },
    playerLabelSmall: {
        fontSize: 10,
    },
    statusRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    statusBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusLabel: {
        fontSize: 10,
        fontWeight: "700",
    },
    timestamp: {
        fontSize: 10,
        color: "#6B7280",
        marginLeft: 6,
    },
    aiSection: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "rgba(139, 92, 246, 0.15)",
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 6,
    },
    aiText: {
        fontSize: 9,
        fontWeight: "700",
        color: "#8B5CF6",
    },

    // Trend Badge
    trendBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 6,
    },
    trendText: {
        fontSize: 9,
        fontWeight: "600",
    },
})

export default LiveTrafficBadge
