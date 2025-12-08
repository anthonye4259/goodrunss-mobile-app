import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useUserPreferences } from "@/lib/user-preferences"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import { SafeAreaView } from "react-native-safe-area-context"

const { width } = Dimensions.get("window")

export default function DetailedStatsScreen() {
    const { preferences } = useUserPreferences()
    const primaryActivity = preferences.primaryActivity || "Basketball"
    const isStudio = ["Pilates", "Yoga", "Lagree", "Barre", "Meditation"].includes(primaryActivity)

    const handleBack = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        router.back()
    }

    // Weekly data for chart visualization
    const weeklyData = [
        { day: "Mon", value: 65, sessions: 2 },
        { day: "Tue", value: 80, sessions: 1 },
        { day: "Wed", value: 45, sessions: 0 },
        { day: "Thu", value: 90, sessions: 2 },
        { day: "Fri", value: 75, sessions: 1 },
        { day: "Sat", value: 95, sessions: 3 },
        { day: "Sun", value: 60, sessions: 1 },
    ]

    const maxValue = Math.max(...weeklyData.map(d => d.value))

    // Detailed metrics based on activity type
    const detailedMetrics = isStudio ? [
        {
            category: "Flexibility", metrics: [
                { label: "Forward Fold", value: "+15°", trend: "up" },
                { label: "Hip Opener", value: "85%", trend: "up" },
                { label: "Shoulder Mobility", value: "92%", trend: "stable" },
            ]
        },
        {
            category: "Strength", metrics: [
                { label: "Core Hold Time", value: "2:45", trend: "up" },
                { label: "Plank Duration", value: "3:20", trend: "up" },
                { label: "Balance Score", value: "88", trend: "stable" },
            ]
        },
        {
            category: "Recovery", metrics: [
                { label: "Sleep Quality", value: "85%", trend: "up" },
                { label: "HRV Score", value: "62ms", trend: "stable" },
                { label: "Stress Level", value: "Low", trend: "down" },
            ]
        },
    ] : [
        {
            category: "Performance", metrics: [
                { label: "Sprint Speed", value: "18.5 mph", trend: "up" },
                { label: "Vertical Jump", value: '32"', trend: "stable" },
                { label: "Agility Score", value: "92", trend: "up" },
            ]
        },
        {
            category: "Endurance", metrics: [
                { label: "VO2 Max", value: "48", trend: "up" },
                { label: "Avg Heart Rate", value: "145 bpm", trend: "stable" },
                { label: "Recovery Time", value: "1.2 min", trend: "down" },
            ]
        },
        {
            category: "Game Stats", metrics: [
                { label: "Points/Game", value: "18.5", trend: "up" },
                { label: "Assists", value: "6.2", trend: "up" },
                { label: "Win Rate", value: "68%", trend: "stable" },
            ]
        },
    ]

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case "up": return { name: "trending-up", color: "#7ED957" }
            case "down": return { name: "trending-down", color: "#EF4444" }
            default: return { name: "remove", color: "#9CA3AF" }
        }
    }

    return (
        <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Detailed Stats</Text>
                    <TouchableOpacity style={styles.shareButton}>
                        <Ionicons name="share-outline" size={24} color="#7ED957" />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* Activity Summary */}
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryTitle}>This Week's Activity</Text>
                        <View style={styles.summaryStats}>
                            <View style={styles.summaryStat}>
                                <Text style={styles.summaryValue}>10</Text>
                                <Text style={styles.summaryLabel}>Sessions</Text>
                            </View>
                            <View style={styles.summaryDivider} />
                            <View style={styles.summaryStat}>
                                <Text style={styles.summaryValue}>8.5h</Text>
                                <Text style={styles.summaryLabel}>Total Time</Text>
                            </View>
                            <View style={styles.summaryDivider} />
                            <View style={styles.summaryStat}>
                                <Text style={styles.summaryValue}>2,840</Text>
                                <Text style={styles.summaryLabel}>Calories</Text>
                            </View>
                        </View>
                    </View>

                    {/* Weekly Chart */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Weekly Progress</Text>
                        <View style={styles.chartCard}>
                            <View style={styles.chartContainer}>
                                {weeklyData.map((data, index) => (
                                    <View key={index} style={styles.barContainer}>
                                        <View style={styles.barWrapper}>
                                            <LinearGradient
                                                colors={["#7ED957", "#65A30D"]}
                                                style={[
                                                    styles.bar,
                                                    { height: `${(data.value / maxValue) * 100}%` }
                                                ]}
                                            />
                                        </View>
                                        <Text style={styles.barLabel}>{data.day}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* Detailed Metrics */}
                    {detailedMetrics.map((category, categoryIndex) => (
                        <View key={categoryIndex} style={styles.section}>
                            <Text style={styles.sectionTitle}>{category.category}</Text>
                            <View style={styles.metricsCard}>
                                {category.metrics.map((metric, metricIndex) => {
                                    const trend = getTrendIcon(metric.trend)
                                    return (
                                        <View
                                            key={metricIndex}
                                            style={[
                                                styles.metricRow,
                                                metricIndex < category.metrics.length - 1 && styles.metricRowBorder
                                            ]}
                                        >
                                            <Text style={styles.metricLabel}>{metric.label}</Text>
                                            <View style={styles.metricValueContainer}>
                                                <Text style={styles.metricValue}>{metric.value}</Text>
                                                <Ionicons
                                                    name={trend.name as any}
                                                    size={18}
                                                    color={trend.color}
                                                />
                                            </View>
                                        </View>
                                    )
                                })}
                            </View>
                        </View>
                    ))}

                    {/* Connect Wearables CTA */}
                    <View style={styles.section}>
                        <TouchableOpacity
                            style={styles.wearablesCta}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                                router.push("/settings/wearables")
                            }}
                        >
                            <View style={styles.wearablesIcon}>
                                <Ionicons name="watch" size={28} color="#7ED957" />
                            </View>
                            <View style={styles.wearablesText}>
                                <Text style={styles.wearablesTitle}>Sync Your Wearables</Text>
                                <Text style={styles.wearablesDesc}>
                                    Connect Apple Watch, WHOOP, or Garmin for real-time tracking
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    {/* Bottom Padding */}
                    <View style={{ height: 40 }} />
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#1A1A1A",
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    shareButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#1A1A1A",
        alignItems: "center",
        justifyContent: "center",
    },
    scrollView: {
        flex: 1,
    },
    summaryCard: {
        marginHorizontal: 16,
        marginTop: 8,
        backgroundColor: "#1A1A1A",
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: "#252525",
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#9CA3AF",
        marginBottom: 16,
        textAlign: "center",
    },
    summaryStats: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
    },
    summaryStat: {
        alignItems: "center",
    },
    summaryValue: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#7ED957",
    },
    summaryLabel: {
        fontSize: 14,
        color: "#9CA3AF",
        marginTop: 4,
    },
    summaryDivider: {
        width: 1,
        height: 40,
        backgroundColor: "#252525",
    },
    section: {
        marginTop: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 12,
    },
    chartCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: "#252525",
    },
    chartContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        height: 150,
    },
    barContainer: {
        flex: 1,
        alignItems: "center",
    },
    barWrapper: {
        width: 24,
        height: 120,
        backgroundColor: "#252525",
        borderRadius: 12,
        overflow: "hidden",
        justifyContent: "flex-end",
    },
    bar: {
        width: "100%",
        borderRadius: 12,
    },
    barLabel: {
        fontSize: 12,
        color: "#9CA3AF",
        marginTop: 8,
    },
    metricsCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#252525",
    },
    metricRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 14,
    },
    metricRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: "#252525",
    },
    metricLabel: {
        fontSize: 16,
        color: "#FFFFFF",
    },
    metricValueContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    metricValue: {
        fontSize: 16,
        fontWeight: "600",
        color: "#7ED957",
    },
    wearablesCta: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#252525",
    },
    wearablesIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "rgba(126, 217, 87, 0.15)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    wearablesText: {
        flex: 1,
    },
    wearablesTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 4,
    },
    wearablesDesc: {
        fontSize: 14,
        color: "#9CA3AF",
    },
})
