/**
 * GIA Hero Card - Live Activity Prediction
 * Shows real-time crowd level at nearest court with 6-hour forecast
 */

import React from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import { colors } from "@/lib/theme"

// Activity level colors
const ACTIVITY_COLORS = {
    quiet: "#22C55E",
    active: "#EAB308",
    busy: "#F97316",
    packed: "#EF4444",
}

type ActivityLevel = "quiet" | "active" | "busy" | "packed"

interface HourlyPrediction {
    hour: string
    level: ActivityLevel
    color: string
    isNow: boolean
    isBest: boolean
}

interface GiaHeroCardProps {
    venueName: string
    venueDistance?: number
    currentLevel: ActivityLevel
    predictions: HourlyPrediction[]
}

export function GiaHeroCard({
    venueName,
    venueDistance,
    currentLevel,
    predictions
}: GiaHeroCardProps) {
    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        router.push("/(tabs)/live")
    }

    const getPlayerCount = (level: ActivityLevel) => {
        switch (level) {
            case "quiet": return "2 players • Perfect for pickup"
            case "active": return "5 players • Games happening"
            case "busy": return "8 players • Getting crowded"
            case "packed": return "12+ players • Full courts"
        }
    }

    return (
        <TouchableOpacity
            style={styles.heroCard}
            onPress={handlePress}
            activeOpacity={0.9}
        >
            <LinearGradient
                colors={["#0D1F0A", "#0A0A0A", "#1A0A2E"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroGradient}
            >
                {/* Top Row: Badge + Live Indicator */}
                <View style={styles.heroTopRow}>
                    <View style={styles.giaBadge}>
                        <Ionicons name="sparkles" size={14} color="#8B5CF6" />
                        <Text style={styles.giaBadgeText}>GIA</Text>
                    </View>
                    <View style={styles.liveIndicator}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>LIVE</Text>
                    </View>
                </View>

                {/* Main Content: Venue-Specific Prediction */}
                <View style={styles.heroMain}>
                    <View style={styles.venueRow}>
                        <Ionicons name="location" size={16} color={colors.primary} />
                        <Text style={styles.venueName}>{venueName}</Text>
                        <Text style={styles.venueDistance}>
                            {venueDistance ? `${venueDistance.toFixed(1)} mi` : "nearby"}
                        </Text>
                    </View>
                    <Text style={styles.heroBigText}>
                        {currentLevel.toUpperCase()}
                    </Text>
                    <Text style={styles.heroConfidence}>
                        {getPlayerCount(currentLevel)}
                    </Text>
                </View>

                {/* Activity Timeline - Horizontal bars */}
                <View style={styles.heroTimeline}>
                    <Text style={styles.timelineTitle}>Next 6 hours</Text>
                    <View style={styles.timelineBars}>
                        {predictions.map((pred, index) => (
                            <View key={index} style={styles.timelineItem}>
                                <View style={[
                                    styles.timelineBar,
                                    {
                                        height: pred.level === 'quiet' ? 20 :
                                            pred.level === 'active' ? 28 :
                                                pred.level === 'busy' ? 38 : 48,
                                        backgroundColor: pred.color,
                                        opacity: pred.isNow ? 1 : 0.7,
                                    },
                                    pred.isNow && styles.timelineBarNow,
                                ]} />
                                <Text style={[
                                    styles.timelineLabel,
                                    pred.isNow && styles.timelineLabelNow
                                ]}>{pred.hour}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Bottom: Tap hint */}
                <View style={styles.heroBottom}>
                    <Text style={styles.heroHint}>Tap to see all courts</Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
                </View>
            </LinearGradient>
        </TouchableOpacity>
    )
}

// Generate hourly predictions (exported for use in index.tsx)
export function generateHourlyPredictions(currentHour: number): HourlyPrediction[] {
    const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6
    const predictions: HourlyPrediction[] = []

    for (let i = 0; i < 6; i++) {
        const h = (currentHour + i) % 24
        let level: ActivityLevel = 'quiet'

        // Simple prediction logic
        if (isWeekend) {
            if (h >= 10 && h <= 17) level = Math.random() > 0.5 ? 'busy' : 'active'
            else if (h >= 18 && h <= 20) level = 'active'
        } else {
            if ((h >= 6 && h <= 9) || (h >= 17 && h <= 20)) level = Math.random() > 0.5 ? 'busy' : 'packed'
            else if (h >= 12 && h <= 14) level = 'active'
        }

        const hourStr = i === 0 ? "Now" :
            h === 0 ? "12a" : h < 12 ? `${h}a` : h === 12 ? "12p" : `${h - 12}p`

        predictions.push({
            hour: hourStr,
            level,
            color: ACTIVITY_COLORS[level],
            isNow: i === 0,
            isBest: level === 'quiet' && i > 0
        })
    }

    // Find best time
    const bestIndex = predictions.findIndex((p, i) => i > 0 && p.level === 'quiet')
    if (bestIndex > 0) predictions[bestIndex].isBest = true

    return predictions
}

const styles = StyleSheet.create({
    heroCard: {
        marginHorizontal: 16,
        marginTop: 8,
        borderRadius: 20,
        overflow: "hidden",
    },
    heroGradient: {
        padding: 20,
        borderWidth: 1,
        borderColor: "rgba(126, 217, 87, 0.2)",
        borderRadius: 20,
    },
    heroTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    giaBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(139, 92, 246, 0.15)",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        gap: 4,
    },
    giaBadgeText: {
        color: "#8B5CF6",
        fontSize: 12,
        fontWeight: "700",
    },
    liveIndicator: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#22C55E",
    },
    liveText: {
        color: "#22C55E",
        fontSize: 11,
        fontWeight: "600",
    },
    heroMain: {
        marginBottom: 20,
    },
    venueRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 8,
    },
    venueName: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "500",
    },
    venueDistance: {
        color: colors.text.muted,
        fontSize: 13,
    },
    heroBigText: {
        fontSize: 48,
        fontWeight: "800",
        color: "#7ED957",
        letterSpacing: 2,
    },
    heroConfidence: {
        color: colors.text.secondary,
        fontSize: 14,
        marginTop: 4,
    },
    heroTimeline: {
        marginBottom: 16,
    },
    timelineTitle: {
        color: colors.text.muted,
        fontSize: 12,
        marginBottom: 12,
    },
    timelineBars: {
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        height: 60,
    },
    timelineItem: {
        alignItems: "center",
        flex: 1,
    },
    timelineBar: {
        width: 24,
        borderRadius: 4,
        marginBottom: 8,
    },
    timelineBarNow: {
        borderWidth: 2,
        borderColor: "#FFF",
    },
    timelineLabel: {
        color: colors.text.muted,
        fontSize: 11,
    },
    timelineLabelNow: {
        color: "#FFF",
        fontWeight: "600",
    },
    heroBottom: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 4,
    },
    heroHint: {
        color: colors.text.muted,
        fontSize: 12,
    },
})
