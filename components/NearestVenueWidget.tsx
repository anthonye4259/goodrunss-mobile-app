/**
 * Nearest Venue Widget
 * 
 * Shows the nearest venue for the user's selected sport with:
 * - Live traffic status (how busy right now) - FROM FIRESTORE
 * - GR Predict (predicted traffic for next few hours)
 * - Quick actions (directions, report, need players)
 */

import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useEffect, useRef, useState, useMemo } from "react"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import { useUserPreferences } from "@/lib/user-preferences"
import { getActivityContent } from "@/lib/activity-content"
import { useVenueTraffic, getTrafficColor, getTrafficLabel } from "@/lib/hooks/useVenueTraffic"

interface HourlyPrediction {
    hour: string
    level: number // 0-100
}

// Generate predictions based on current time
function generatePredictions(): HourlyPrediction[] {
    const now = new Date()
    const predictions: HourlyPrediction[] = []
    const hour = now.getHours()
    const isWeekend = now.getDay() === 0 || now.getDay() === 6

    for (let i = 0; i < 5; i++) {
        const h = (hour + i) % 24
        let level = 30 // Base

        // Peak hours
        if (isWeekend) {
            if (h >= 10 && h <= 17) level = 60 + Math.random() * 30
        } else {
            if ((h >= 6 && h <= 9) || (h >= 17 && h <= 20)) level = 70 + Math.random() * 20
            else if (h >= 12 && h <= 14) level = 50 + Math.random() * 20
        }

        const hourStr = i === 0 ? "Now" :
            h === 0 ? "12AM" :
                h < 12 ? `${h}AM` :
                    h === 12 ? "12PM" :
                        `${h - 12}PM`

        predictions.push({ hour: hourStr, level: Math.min(100, Math.round(level)) })
    }

    return predictions
}

// Find best time from predictions
function findBestTime(predictions: HourlyPrediction[]): string {
    const lowestPrediction = predictions.reduce((min, p) =>
        p.level < min.level ? p : min, predictions[0])
    return lowestPrediction.hour === "Now" ? predictions[1]?.hour || "Later" : lowestPrediction.hour
}

// Map traffic level from Firestore to display levels
const trafficLevelMap: Record<string, string> = {
    low: "quiet",
    moderate: "moderate",
    busy: "busy",
    empty: "empty",
    quiet: "quiet",
    packed: "packed",
}

const trafficColors: Record<string, string> = {
    empty: "#22C55E",
    quiet: "#84CC16",
    low: "#84CC16",
    moderate: "#FBBF24",
    busy: "#F97316",
    packed: "#EF4444",
}

const trafficLabels: Record<string, string> = {
    empty: "Empty",
    quiet: "Quiet",
    low: "Quiet",
    moderate: "Moderate",
    busy: "Busy",
    packed: "Packed",
}

export function NearestVenueWidget() {
    const { preferences } = useUserPreferences()
    const primaryActivity = preferences.primaryActivity || "Basketball"
    const content = getActivityContent(primaryActivity as any)

    // Fetch real traffic data from Firestore
    const { nearestVenue, loading, refresh } = useVenueTraffic({ limit: 1 })

    const pulseAnim = useRef(new Animated.Value(1)).current
    const predictions = useMemo(() => generatePredictions(), [])
    const bestTime = useMemo(() => findBestTime(predictions), [predictions])

    useEffect(() => {
        // Pulse animation for live indicator
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.3,
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

    const handlePress = (action: () => void) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        action()
    }

    // Show loading or nothing if no venue
    if (loading || !nearestVenue) return null

    // Get traffic info from venue (pre-computed by Cloud Function)
    const trafficLevel = nearestVenue.traffic?.level || "moderate"
    const trafficColor = trafficColors[trafficLevel] || "#FBBF24"
    const trafficLabel = trafficLabels[trafficLevel] || "Moderate"

    // Player count (estimated based on traffic level)
    const playerCounts: Record<string, number> = { empty: 0, quiet: 3, low: 3, moderate: 8, busy: 15, packed: 25 }
    const playerCount = playerCounts[trafficLevel] || 8

    return (
        <View style={styles.container}>
            {/* Section Header */}
            <View style={styles.sectionHeader}>
                <View style={styles.headerLeft}>
                    <Text style={styles.sectionTitle}>📍 Nearest {content.facilityName}</Text>
                    <View style={styles.liveIndicator}>
                        <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]} />
                        <Text style={styles.liveText}>LIVE</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => router.push("/(tabs)/explore")}>
                    <Text style={styles.seeAll}>View Map</Text>
                </TouchableOpacity>
            </View>

            {/* Venue Card */}
            <TouchableOpacity
                style={styles.venueCard}
                onPress={() => handlePress(() => router.push(`/venues/${nearestVenue.id}`))}
                activeOpacity={0.9}
            >
                <LinearGradient
                    colors={["#1A1A1A", "#0F0F0F"]}
                    style={styles.venueGradient}
                >
                    {/* Venue Header */}
                    <View style={styles.venueHeader}>
                        <View style={styles.venueInfo}>
                            <Text style={styles.venueName}>{nearestVenue.name}</Text>
                            <View style={styles.venueMetaRow}>
                                <Ionicons name="walk" size={14} color="#9CA3AF" />
                                <Text style={styles.venueDistance}>{nearestVenue.distance || "Nearby"}</Text>
                                <Text style={styles.venueDot}>•</Text>
                                <Text style={styles.venueHours}>
                                    {nearestVenue.isOpen !== false ? `Open until ${nearestVenue.closesAt || "10 PM"}` : "Closed"}
                                </Text>
                            </View>
                        </View>
                        <View style={[styles.trafficBadge, { backgroundColor: `${trafficColor}20` }]}>
                            <View style={[styles.trafficDot, { backgroundColor: trafficColor }]} />
                            <Text style={[styles.trafficText, { color: trafficColor }]}>
                                {trafficLabel}
                            </Text>
                        </View>
                    </View>

                    {/* Live Traffic */}
                    <View style={styles.trafficSection}>
                        <View style={styles.trafficHeader}>
                            <Text style={styles.trafficLabel}>Right Now</Text>
                            <View style={styles.playerCount}>
                                <Ionicons name="people" size={16} color="#7ED957" />
                                <Text style={styles.playerCountText}>{playerCount} players</Text>
                                {trafficLevel === "busy" || trafficLevel === "packed" ? (
                                    <Ionicons name="trending-up" size={14} color="#7ED957" />
                                ) : trafficLevel === "empty" || trafficLevel === "quiet" ? (
                                    <Ionicons name="trending-down" size={14} color="#EF4444" />
                                ) : null}
                            </View>
                        </View>
                    </View>

                    {/* GR Predict - Hourly Forecast */}
                    <View style={styles.predictSection}>
                        <View style={styles.predictHeader}>
                            <Text style={styles.predictLabel}>🔮 GR Predict</Text>
                            <Text style={styles.predictDesc}>Best time: {bestTime}</Text>
                        </View>
                        <View style={styles.predictBars}>
                            {predictions.map((pred, index) => (
                                <View key={index} style={styles.predictBarContainer}>
                                    <View style={styles.predictBarBg}>
                                        <View
                                            style={[
                                                styles.predictBarFill,
                                                {
                                                    height: `${pred.level}%`,
                                                    backgroundColor: pred.level > 70 ? "#EF4444" :
                                                        pred.level > 40 ? "#FBBF24" : "#7ED957"
                                                }
                                            ]}
                                        />
                                    </View>
                                    <Text style={[
                                        styles.predictHour,
                                        index === 0 && styles.predictHourNow
                                    ]}>
                                        {pred.hour}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Quick Actions */}
                    <View style={styles.quickActions}>
                        <TouchableOpacity
                            style={styles.quickAction}
                            onPress={() => handlePress(() => router.push(`/venues/${nearestVenue.id}`))}
                        >
                            <Ionicons name="navigate" size={18} color="#7ED957" />
                            <Text style={styles.quickActionText}>Directions</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.quickAction}
                            onPress={() => handlePress(() => router.push(`/report-facility/${nearestVenue.id}`))}
                        >
                            <Ionicons name="camera" size={18} color="#7ED957" />
                            <Text style={styles.quickActionText}>Report</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.quickAction}
                            onPress={() => handlePress(() => router.push(`/need-players/${nearestVenue.id}`))}
                        >
                            <Ionicons name="hand-left" size={18} color="#7ED957" />
                            <Text style={styles.quickActionText}>Need Players</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 24,
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    liveIndicator: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(239, 68, 68, 0.2)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 6,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#EF4444",
    },
    liveText: {
        fontSize: 10,
        fontWeight: "bold",
        color: "#EF4444",
    },
    seeAll: {
        fontSize: 14,
        fontWeight: "600",
        color: "#7ED957",
    },
    venueCard: {
        borderRadius: 20,
        overflow: "hidden",
    },
    venueGradient: {
        padding: 16,
        borderWidth: 1,
        borderColor: "#252525",
        borderRadius: 20,
    },
    venueHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 16,
    },
    venueInfo: {
        flex: 1,
    },
    venueName: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 6,
    },
    venueMetaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    venueDistance: {
        fontSize: 14,
        color: "#9CA3AF",
    },
    venueDot: {
        fontSize: 14,
        color: "#666",
    },
    venueHours: {
        fontSize: 14,
        color: "#7ED957",
    },
    trafficBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 6,
    },
    trafficDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    trafficText: {
        fontSize: 14,
        fontWeight: "bold",
    },
    trafficSection: {
        marginBottom: 16,
    },
    trafficHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    trafficLabel: {
        fontSize: 14,
        color: "#9CA3AF",
    },
    playerCount: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    playerCountText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#7ED957",
    },
    predictSection: {
        marginBottom: 16,
    },
    predictHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    predictLabel: {
        fontSize: 14,
        color: "#FFFFFF",
        fontWeight: "600",
    },
    predictDesc: {
        fontSize: 12,
        color: "#7ED957",
    },
    predictBars: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        height: 60,
    },
    predictBarContainer: {
        flex: 1,
        alignItems: "center",
        gap: 6,
    },
    predictBarBg: {
        width: 24,
        height: 48,
        backgroundColor: "#252525",
        borderRadius: 4,
        justifyContent: "flex-end",
        overflow: "hidden",
    },
    predictBarFill: {
        width: "100%",
        borderRadius: 4,
    },
    predictHour: {
        fontSize: 10,
        color: "#666",
    },
    predictHourNow: {
        color: "#7ED957",
        fontWeight: "bold",
    },
    quickActions: {
        flexDirection: "row",
        borderTopWidth: 1,
        borderTopColor: "#252525",
        paddingTop: 12,
    },
    quickAction: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
    },
    quickActionText: {
        fontSize: 12,
        color: "#7ED957",
        fontWeight: "600",
    },
})

export default NearestVenueWidget
