/**
 * Nearest Venue Widget
 * 
 * Shows the nearest venue for the user's selected sport with:
 * - Live traffic status (how busy right now)
 * - GR Predict (predicted traffic for next few hours)
 * - Quick actions (directions, report, need players)
 */

import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useEffect, useRef, useState } from "react"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import { useUserPreferences } from "@/lib/user-preferences"
import { getActivityContent } from "@/lib/activity-content"

interface TrafficLevel {
    level: "empty" | "quiet" | "moderate" | "busy" | "packed"
    count: number
    trend: "up" | "down" | "stable"
}

interface HourlyPrediction {
    hour: string
    level: number // 0-100
}

interface NearestVenue {
    id: string
    name: string
    distance: string
    sport: string
    traffic: TrafficLevel
    predictions: HourlyPrediction[]
    isOpen: boolean
    closesAt: string
}

// Mock data - in production, fetch from venue service
const getMockNearestVenue = (sport: string): NearestVenue => ({
    id: "1",
    name: sport === "Basketball" ? "Rucker Park" : sport === "Tennis" ? "Central Park Courts" : "Chelsea Piers",
    distance: "0.3 mi",
    sport: sport,
    traffic: {
        level: "moderate",
        count: 12,
        trend: "up",
    },
    isOpen: true,
    closesAt: "10:00 PM",
    predictions: [
        { hour: "Now", level: 45 },
        { hour: "5PM", level: 75 },
        { hour: "6PM", level: 90 },
        { hour: "7PM", level: 85 },
        { hour: "8PM", level: 60 },
    ],
})

const trafficColors: Record<string, string> = {
    empty: "#22C55E",
    quiet: "#84CC16",
    moderate: "#FBBF24",
    busy: "#F97316",
    packed: "#EF4444",
}

const trafficLabels: Record<string, string> = {
    empty: "Empty",
    quiet: "Quiet",
    moderate: "Moderate",
    busy: "Busy",
    packed: "Packed",
}

export function NearestVenueWidget() {
    const { preferences } = useUserPreferences()
    const primaryActivity = preferences.primaryActivity || "Basketball"
    const content = getActivityContent(primaryActivity as any)

    const [venue, setVenue] = useState<NearestVenue | null>(null)
    const pulseAnim = useRef(new Animated.Value(1)).current

    useEffect(() => {
        // Fetch nearest venue
        setVenue(getMockNearestVenue(primaryActivity))

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
    }, [primaryActivity])

    const handlePress = (action: () => void) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        action()
    }

    if (!venue) return null

    const trafficColor = trafficColors[venue.traffic.level]
    const maxPrediction = Math.max(...venue.predictions.map(p => p.level))

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
                onPress={() => handlePress(() => router.push(`/venues/${venue.id}`))}
                activeOpacity={0.9}
            >
                <LinearGradient
                    colors={["#1A1A1A", "#0F0F0F"]}
                    style={styles.venueGradient}
                >
                    {/* Venue Header */}
                    <View style={styles.venueHeader}>
                        <View style={styles.venueInfo}>
                            <Text style={styles.venueName}>{venue.name}</Text>
                            <View style={styles.venueMetaRow}>
                                <Ionicons name="walk" size={14} color="#9CA3AF" />
                                <Text style={styles.venueDistance}>{venue.distance}</Text>
                                <Text style={styles.venueDot}>•</Text>
                                <Text style={styles.venueHours}>
                                    {venue.isOpen ? `Open until ${venue.closesAt}` : "Closed"}
                                </Text>
                            </View>
                        </View>
                        <View style={[styles.trafficBadge, { backgroundColor: `${trafficColor}20` }]}>
                            <View style={[styles.trafficDot, { backgroundColor: trafficColor }]} />
                            <Text style={[styles.trafficText, { color: trafficColor }]}>
                                {trafficLabels[venue.traffic.level]}
                            </Text>
                        </View>
                    </View>

                    {/* Live Traffic */}
                    <View style={styles.trafficSection}>
                        <View style={styles.trafficHeader}>
                            <Text style={styles.trafficLabel}>Right Now</Text>
                            <View style={styles.playerCount}>
                                <Ionicons name="people" size={16} color="#7ED957" />
                                <Text style={styles.playerCountText}>{venue.traffic.count} players</Text>
                                {venue.traffic.trend === "up" && (
                                    <Ionicons name="trending-up" size={14} color="#7ED957" />
                                )}
                                {venue.traffic.trend === "down" && (
                                    <Ionicons name="trending-down" size={14} color="#EF4444" />
                                )}
                            </View>
                        </View>
                    </View>

                    {/* GR Predict - Hourly Forecast */}
                    <View style={styles.predictSection}>
                        <View style={styles.predictHeader}>
                            <Text style={styles.predictLabel}>🔮 GR Predict</Text>
                            <Text style={styles.predictDesc}>Best time: 8PM</Text>
                        </View>
                        <View style={styles.predictBars}>
                            {venue.predictions.map((pred, index) => (
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
                            onPress={() => handlePress(() => router.push(`/venues/${venue.id}`))}
                        >
                            <Ionicons name="navigate" size={18} color="#7ED957" />
                            <Text style={styles.quickActionText}>Directions</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.quickAction}
                            onPress={() => handlePress(() => router.push(`/report-facility/${venue.id}`))}
                        >
                            <Ionicons name="camera" size={18} color="#7ED957" />
                            <Text style={styles.quickActionText}>Report</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.quickAction}
                            onPress={() => handlePress(() => router.push(`/need-players/${venue.id}`))}
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
