/**
 * Facility Insights Dashboard (Premium)
 * Visual demand heatmap, revenue charts, and AI-powered suggestions
 */

import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Dimensions,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router, useLocalSearchParams } from "expo-router"
import * as Haptics from "expo-haptics"

import { useAuth } from "@/lib/auth-context"
import {
    demandInsightsService,
    DemandHeatmapData,
    SlotInsight
} from "@/lib/services/demand-insights-service"
import { facilitySubscriptionService } from "@/lib/services/facility-subscription-service"

const { width } = Dimensions.get("window")
const CELL_SIZE = (width - 80) / 7 // 7 days

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const HOUR_LABELS = ["6a", "8a", "10a", "12p", "2p", "4p", "6p", "8p"]

export default function FacilityInsightsScreen() {
    const { facilityId } = useLocalSearchParams()
    const { user } = useAuth()

    const [loading, setLoading] = useState(true)
    const [isPremium, setIsPremium] = useState(false)
    const [heatmapData, setHeatmapData] = useState<DemandHeatmapData[]>([])
    const [insights, setInsights] = useState<SlotInsight[]>([])
    const [weeklyRevenue, setWeeklyRevenue] = useState<{ week: string; revenue: number; bookings: number }[]>([])
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalBookings: 0,
        avgBookingsPerDay: 0,
        topHour: "N/A",
        conversionRate: 0,
    })

    useEffect(() => {
        loadInsights()
    }, [facilityId])

    const loadInsights = async () => {
        if (!facilityId) return
        setLoading(true)

        try {
            // Check premium status
            const subStatus = await facilitySubscriptionService.getSubscriptionStatus(facilityId as string)
            setIsPremium(subStatus.tier === "premium")

            // Load insights data
            const [heatmap, slotInsights, revenue, facilityStats] = await Promise.all([
                demandInsightsService.getDemandHeatmap(facilityId as string),
                demandInsightsService.getSlotInsights(facilityId as string),
                demandInsightsService.getWeeklyRevenue(facilityId as string),
                demandInsightsService.getFacilityStats(facilityId as string),
            ])

            setHeatmapData(heatmap)
            setInsights(slotInsights)
            setWeeklyRevenue(revenue)
            setStats(facilityStats)
        } catch (error) {
            console.error("Error loading insights:", error)
        } finally {
            setLoading(false)
        }
    }

    // Get color for heatmap cell based on search count
    const getHeatmapColor = (searchCount: number): string => {
        if (searchCount === 0) return "#1A1A1A"
        if (searchCount < 3) return "rgba(126, 217, 87, 0.2)"
        if (searchCount < 6) return "rgba(126, 217, 87, 0.4)"
        if (searchCount < 10) return "rgba(126, 217, 87, 0.6)"
        return "rgba(126, 217, 87, 0.9)"
    }

    // Get insight icon and color
    const getInsightStyle = (issue: SlotInsight["issue"]) => {
        switch (issue) {
            case "high-demand":
                return { icon: "flame", color: "#FF6B6B", bg: "rgba(255, 107, 107, 0.1)" }
            case "price-opportunity":
                return { icon: "trending-up", color: "#FFD700", bg: "rgba(255, 215, 0, 0.1)" }
            case "underbooked":
                return { icon: "alert-circle", color: "#888", bg: "rgba(136, 136, 136, 0.1)" }
            default:
                return { icon: "information-circle", color: "#888", bg: "#1A1A1A" }
        }
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7ED957" />
            </View>
        )
    }

    // Premium gate
    if (!isPremium) {
        return (
            <View style={styles.container}>
                <LinearGradient colors={["#0A0A0A", "#111"]} style={StyleSheet.absoluteFill} />
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={24} color="#FFF" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Demand Insights</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <View style={styles.premiumGate}>
                        <Ionicons name="lock-closed" size={48} color="#FFD700" />
                        <Text style={styles.premiumTitle}>Premium Feature</Text>
                        <Text style={styles.premiumSubtitle}>
                            Unlock AI-powered demand insights, heatmaps, and revenue optimization suggestions
                        </Text>
                        <TouchableOpacity
                            style={styles.upgradeBtn}
                            onPress={() => router.push(`/facility/premium?facilityId=${facilityId}`)}
                        >
                            <LinearGradient colors={["#FFD700", "#FFA500"]} style={styles.upgradeBtnGradient}>
                                <Text style={styles.upgradeBtnText}>Upgrade to Premium - $50/mo</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={["#0A0A0A", "#111"]} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Demand Insights</Text>
                    <View style={styles.premiumBadge}>
                        <Ionicons name="star" size={12} color="#FFD700" />
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    {/* Stats Summary */}
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>${stats.totalRevenue.toLocaleString()}</Text>
                            <Text style={styles.statLabel}>Last 30 Days</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{stats.totalBookings}</Text>
                            <Text style={styles.statLabel}>Bookings</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{stats.conversionRate}%</Text>
                            <Text style={styles.statLabel}>Conversion</Text>
                        </View>
                    </View>

                    {/* Demand Heatmap */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Demand Heatmap</Text>
                        <Text style={styles.sectionSubtitle}>When players search for courts</Text>

                        <View style={styles.heatmapContainer}>
                            {/* Day labels */}
                            <View style={styles.heatmapDays}>
                                {DAY_LABELS.map((day) => (
                                    <Text key={day} style={styles.heatmapDayLabel}>{day}</Text>
                                ))}
                            </View>

                            {/* Heatmap grid */}
                            <View style={styles.heatmapGrid}>
                                {HOUR_LABELS.map((hourLabel, hourIndex) => {
                                    const hour = 6 + (hourIndex * 2)
                                    return (
                                        <View key={hourLabel} style={styles.heatmapRow}>
                                            <Text style={styles.heatmapHourLabel}>{hourLabel}</Text>
                                            {DAY_LABELS.map((_, dayIndex) => {
                                                const cellData = heatmapData.find(
                                                    d => d.dayOfWeek === dayIndex && d.hour === hour
                                                )
                                                return (
                                                    <View
                                                        key={`${dayIndex}-${hour}`}
                                                        style={[
                                                            styles.heatmapCell,
                                                            { backgroundColor: getHeatmapColor(cellData?.searchCount || 0) }
                                                        ]}
                                                    >
                                                        {(cellData?.searchCount || 0) > 0 && (
                                                            <Text style={styles.heatmapCellText}>
                                                                {cellData?.searchCount}
                                                            </Text>
                                                        )}
                                                    </View>
                                                )
                                            })}
                                        </View>
                                    )
                                })}
                            </View>

                            {/* Legend */}
                            <View style={styles.heatmapLegend}>
                                <Text style={styles.legendLabel}>Low</Text>
                                <View style={[styles.legendCell, { backgroundColor: "rgba(126, 217, 87, 0.2)" }]} />
                                <View style={[styles.legendCell, { backgroundColor: "rgba(126, 217, 87, 0.4)" }]} />
                                <View style={[styles.legendCell, { backgroundColor: "rgba(126, 217, 87, 0.6)" }]} />
                                <View style={[styles.legendCell, { backgroundColor: "rgba(126, 217, 87, 0.9)" }]} />
                                <Text style={styles.legendLabel}>High</Text>
                            </View>
                        </View>
                    </View>

                    {/* AI Insights */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>AI Suggestions</Text>
                            <View style={styles.aiBadge}>
                                <Ionicons name="sparkles" size={12} color="#7ED957" />
                                <Text style={styles.aiBadgeText}>Powered by GIA</Text>
                            </View>
                        </View>

                        {insights.length === 0 ? (
                            <View style={styles.noInsights}>
                                <Ionicons name="checkmark-circle" size={32} color="#7ED957" />
                                <Text style={styles.noInsightsText}>All slots performing well!</Text>
                            </View>
                        ) : (
                            insights.map((insight, index) => {
                                const style = getInsightStyle(insight.issue)
                                return (
                                    <View key={index} style={[styles.insightCard, { backgroundColor: style.bg }]}>
                                        <View style={styles.insightIcon}>
                                            <Ionicons name={style.icon as any} size={20} color={style.color} />
                                        </View>
                                        <View style={styles.insightContent}>
                                            <Text style={styles.insightTime}>
                                                {insight.day} at {insight.time}
                                            </Text>
                                            <Text style={styles.insightMessage}>{insight.message}</Text>
                                            <Text style={[styles.insightSuggestion, { color: style.color }]}>
                                                💡 {insight.suggestion}
                                            </Text>
                                        </View>
                                    </View>
                                )
                            })
                        )}
                    </View>

                    {/* Weekly Revenue */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Weekly Revenue</Text>

                        {weeklyRevenue.length === 0 ? (
                            <Text style={styles.noDataText}>Not enough data yet</Text>
                        ) : (
                            <View style={styles.revenueChart}>
                                {weeklyRevenue.map((week, index) => {
                                    const maxRevenue = Math.max(...weeklyRevenue.map(w => w.revenue))
                                    const height = maxRevenue > 0 ? (week.revenue / maxRevenue) * 100 : 0
                                    return (
                                        <View key={index} style={styles.revenueBar}>
                                            <View style={[styles.revenueBarFill, { height: `${height}%` }]} />
                                            <Text style={styles.revenueBarLabel}>${week.revenue}</Text>
                                            <Text style={styles.revenueBarWeek}>
                                                {new Date(week.week).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                            </Text>
                                        </View>
                                    )
                                })}
                            </View>
                        )}
                    </View>

                    {/* Top Hour */}
                    <View style={styles.topHourCard}>
                        <Ionicons name="time" size={24} color="#7ED957" />
                        <View style={styles.topHourContent}>
                            <Text style={styles.topHourLabel}>Best Performing Hour</Text>
                            <Text style={styles.topHourValue}>{stats.topHour}</Text>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0A0A0A" },
    loadingContainer: { flex: 1, backgroundColor: "#0A0A0A", justifyContent: "center", alignItems: "center" },
    safeArea: { flex: 1 },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#1A1A1A",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
    premiumBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "rgba(255, 215, 0, 0.2)",
        alignItems: "center",
        justifyContent: "center",
    },

    content: { paddingHorizontal: 20, paddingBottom: 100 },

    // Premium Gate
    premiumGate: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40 },
    premiumTitle: { color: "#FFD700", fontSize: 24, fontWeight: "bold", marginTop: 16 },
    premiumSubtitle: { color: "#888", fontSize: 16, textAlign: "center", marginTop: 8 },
    upgradeBtn: { marginTop: 24, borderRadius: 16, overflow: "hidden" },
    upgradeBtnGradient: { paddingVertical: 16, paddingHorizontal: 32 },
    upgradeBtnText: { color: "#000", fontSize: 16, fontWeight: "800" },

    // Stats
    statsRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
    statCard: {
        flex: 1,
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
    },
    statValue: { color: "#7ED957", fontSize: 24, fontWeight: "bold" },
    statLabel: { color: "#888", fontSize: 12, marginTop: 4 },

    // Sections
    section: { marginBottom: 24 },
    sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    sectionTitle: { color: "#FFF", fontSize: 18, fontWeight: "600" },
    sectionSubtitle: { color: "#888", fontSize: 14, marginTop: 4, marginBottom: 16 },
    aiBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: "rgba(126, 217, 87, 0.1)",
        borderRadius: 12,
    },
    aiBadgeText: { color: "#7ED957", fontSize: 11 },

    // Heatmap
    heatmapContainer: { backgroundColor: "#1A1A1A", borderRadius: 16, padding: 16 },
    heatmapDays: { flexDirection: "row", marginLeft: 30, marginBottom: 8 },
    heatmapDayLabel: { width: CELL_SIZE, color: "#888", fontSize: 10, textAlign: "center" },
    heatmapGrid: {},
    heatmapRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
    heatmapHourLabel: { width: 30, color: "#888", fontSize: 10 },
    heatmapCell: {
        width: CELL_SIZE - 4,
        height: 24,
        marginHorizontal: 2,
        borderRadius: 4,
        alignItems: "center",
        justifyContent: "center",
    },
    heatmapCellText: { color: "#FFF", fontSize: 9, fontWeight: "600" },
    heatmapLegend: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 12, gap: 4 },
    legendLabel: { color: "#888", fontSize: 10 },
    legendCell: { width: 20, height: 12, borderRadius: 2 },

    // Insights
    noInsights: { alignItems: "center", padding: 24 },
    noInsightsText: { color: "#888", fontSize: 16, marginTop: 8 },
    insightCard: {
        flexDirection: "row",
        borderRadius: 12,
        padding: 16,
        marginTop: 12,
    },
    insightIcon: { marginRight: 12 },
    insightContent: { flex: 1 },
    insightTime: { color: "#FFF", fontSize: 14, fontWeight: "600" },
    insightMessage: { color: "#888", fontSize: 14, marginTop: 4 },
    insightSuggestion: { fontSize: 14, marginTop: 8 },

    // Revenue Chart
    noDataText: { color: "#666", fontSize: 14, textAlign: "center", padding: 24 },
    revenueChart: { flexDirection: "row", justifyContent: "space-between", height: 160, paddingTop: 20 },
    revenueBar: { alignItems: "center", justifyContent: "flex-end", flex: 1 },
    revenueBarFill: {
        width: "60%",
        backgroundColor: "#7ED957",
        borderRadius: 4,
        minHeight: 4,
    },
    revenueBarLabel: { color: "#888", fontSize: 10, marginTop: 4 },
    revenueBarWeek: { color: "#555", fontSize: 9, marginTop: 2 },

    // Top Hour
    topHourCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(126, 217, 87, 0.1)",
        borderRadius: 16,
        padding: 20,
    },
    topHourContent: { marginLeft: 16 },
    topHourLabel: { color: "#888", fontSize: 14 },
    topHourValue: { color: "#7ED957", fontSize: 28, fontWeight: "bold" },
})
