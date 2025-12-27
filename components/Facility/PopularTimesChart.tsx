/**
 * Popular Times Chart (Premium Only)
 * 
 * Shows when customers prefer to book.
 * Helps optimize pricing and staffing.
 */

import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native"
import { useRef, useEffect } from "react"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"

type HourlyData = {
    hour: number
    bookings: number
    revenue: number
}

type Props = {
    data: HourlyData[]
    peakHour: number
    quietHour: number
    isPremium: boolean
    onUpgrade?: () => void
}

export function PopularTimesChart({ data, peakHour, quietHour, isPremium, onUpgrade }: Props) {
    const maxBookings = Math.max(...data.map(d => d.bookings), 1)

    const formatHour = (hour: number) => {
        if (hour === 0) return "12a"
        if (hour === 12) return "12p"
        if (hour < 12) return `${hour}a`
        return `${hour - 12}p`
    }

    // Locked state for non-premium
    if (!isPremium) {
        return (
            <TouchableOpacity
                style={styles.lockedContainer}
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                    onUpgrade?.()
                }}
            >
                <LinearGradient
                    colors={["#FFD70020", "#0A0A0A"]}
                    style={styles.lockedGradient}
                >
                    <View style={styles.lockedContent}>
                        <Ionicons name="lock-closed" size={24} color="#FFD700" />
                        <Text style={styles.lockedTitle}>Popular Times Insights</Text>
                        <Text style={styles.lockedSubtitle}>
                            See when customers prefer to book
                        </Text>
                    </View>
                    <View style={styles.upgradeBadge}>
                        <Ionicons name="star" size={12} color="#000" />
                        <Text style={styles.upgradeBadgeText}>Premium</Text>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Ionicons name="time" size={20} color="#22C55E" />
                    <Text style={styles.title}>Popular Times</Text>
                </View>
                <View style={styles.peakBadge}>
                    <Text style={styles.peakText}>🔥 Peak: {formatHour(peakHour)}</Text>
                </View>
            </View>

            {/* Chart */}
            <View style={styles.chartContainer}>
                {data.slice(6, 22).map((hourData, index) => {
                    const height = (hourData.bookings / maxBookings) * 100
                    const isPeak = hourData.hour === peakHour
                    const isQuiet = hourData.hour === quietHour

                    return (
                        <View key={hourData.hour} style={styles.barContainer}>
                            <View
                                style={[
                                    styles.bar,
                                    { height: Math.max(height, 8) },
                                    isPeak && styles.barPeak,
                                    isQuiet && styles.barQuiet,
                                ]}
                            />
                            {index % 2 === 0 && (
                                <Text style={styles.barLabel}>{formatHour(hourData.hour)}</Text>
                            )}
                        </View>
                    )
                })}
            </View>

            {/* Insights */}
            <View style={styles.insightsRow}>
                <View style={styles.insight}>
                    <View style={[styles.insightDot, { backgroundColor: "#22C55E" }]} />
                    <View>
                        <Text style={styles.insightLabel}>Busiest</Text>
                        <Text style={styles.insightValue}>{formatHour(peakHour)}</Text>
                    </View>
                </View>
                <View style={styles.insight}>
                    <View style={[styles.insightDot, { backgroundColor: "#888" }]} />
                    <View>
                        <Text style={styles.insightLabel}>Quietest</Text>
                        <Text style={styles.insightValue}>{formatHour(quietHour)}</Text>
                    </View>
                </View>
                <View style={styles.insight}>
                    <View style={[styles.insightDot, { backgroundColor: "#3B82F6" }]} />
                    <View>
                        <Text style={styles.insightLabel}>Opportunity</Text>
                        <Text style={styles.insightValue}>
                            {formatHour(quietHour)} promo
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#141414",
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#22C55E30",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    title: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "700",
    },
    peakBadge: {
        backgroundColor: "#22C55E20",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    peakText: {
        color: "#22C55E",
        fontSize: 11,
        fontWeight: "600",
    },
    chartContainer: {
        flexDirection: "row",
        alignItems: "flex-end",
        height: 120,
        gap: 4,
        marginBottom: 16,
    },
    barContainer: {
        flex: 1,
        alignItems: "center",
    },
    bar: {
        width: "100%",
        backgroundColor: "#22C55E50",
        borderRadius: 4,
        minHeight: 8,
    },
    barPeak: {
        backgroundColor: "#22C55E",
    },
    barQuiet: {
        backgroundColor: "#333",
    },
    barLabel: {
        color: "#666",
        fontSize: 8,
        marginTop: 4,
    },
    insightsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#252525",
    },
    insight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    insightDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    insightLabel: {
        color: "#666",
        fontSize: 10,
    },
    insightValue: {
        color: "#FFF",
        fontSize: 13,
        fontWeight: "600",
    },
    lockedContainer: {
        borderRadius: 20,
        overflow: "hidden",
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#FFD70030",
    },
    lockedGradient: {
        padding: 24,
        alignItems: "center",
    },
    lockedContent: {
        alignItems: "center",
    },
    lockedTitle: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "700",
        marginTop: 12,
    },
    lockedSubtitle: {
        color: "#888",
        fontSize: 12,
        marginTop: 4,
    },
    upgradeBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "#FFD700",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginTop: 16,
    },
    upgradeBadgeText: {
        color: "#000",
        fontSize: 12,
        fontWeight: "700",
    },
})

export default PopularTimesChart
