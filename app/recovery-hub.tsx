/**
 * Recovery Hub Screen
 * 
 * Apple Watch-inspired health & recovery dashboard
 * Shows sleep, recovery, strain, HRV, activity, and readiness metrics
 */

import React from "react"
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import { WidgetCard } from "@/components/Profile/WidgetCard"

export default function RecoveryHubScreen() {
    return (
        <View style={styles.container}>
            <LinearGradient
                colors={["#0A0A0A", "#0D1117", "#0A0A0A"]}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                            router.back()
                        }}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Recovery Hub</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Today's Readiness */}
                    <View style={styles.readinessSection}>
                        <Text style={styles.readinessLabel}>TODAY'S READINESS</Text>
                        <View style={styles.readinessScore}>
                            <Text style={styles.readinessValue}>85</Text>
                            <Text style={styles.readinessMax}>/100</Text>
                        </View>
                        <Text style={styles.readinessStatus}>💪 Ready to Train</Text>
                    </View>

                    {/* Widget Grid */}
                    <View style={styles.widgetGrid}>
                        {/* Row 1: Sleep & Recovery */}
                        <WidgetCard
                            title="SLEEP"
                            subtitle="Last Night"
                            value="7.5h"
                            gradient="teal"
                            visualization="wave"
                            status="Optimal"
                        />
                        <WidgetCard
                            title="RECOVERY"
                            subtitle="Score"
                            value="92%"
                            gradient="green"
                            visualization="pulse"
                            status="Fully Recovered"
                        />

                        {/* Row 2: HRV & Resting HR */}
                        <WidgetCard
                            title="HRV"
                            subtitle="Variability"
                            value="68"
                            gradient="purple"
                            visualization="wave"
                            status="Above Baseline"
                        />
                        <WidgetCard
                            title="RESTING HR"
                            subtitle="BPM"
                            value="52"
                            gradient="coral"
                            visualization="pulse"
                            status="Athletic"
                        />

                        {/* Row 3: Strain & Activity */}
                        <WidgetCard
                            title="STRAIN"
                            subtitle="Today"
                            value="4.2"
                            gradient="amber"
                            visualization="bars"
                            status="Low-Medium"
                        />
                        <WidgetCard
                            title="CALORIES"
                            subtitle="Active"
                            value="420"
                            gradient="blue"
                            visualization="bars"
                            status="On Track"
                        />

                        {/* Row 4: Steps & Active */}
                        <WidgetCard
                            title="STEPS"
                            subtitle="Today"
                            value="6,240"
                            gradient="green"
                            visualization="dots"
                            status="62% of Goal"
                        />
                        <WidgetCard
                            title="MINDFUL"
                            subtitle="Minutes"
                            value="15"
                            gradient="magenta"
                            visualization="wave"
                            status="Good Start"
                        />
                    </View>

                    {/* Connect Health Banner */}
                    <TouchableOpacity
                        style={styles.connectBanner}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                            router.push("/settings/health-sync")
                        }}
                    >
                        <View style={styles.connectLeft}>
                            <View style={styles.appleHealthIcon}>
                                <Ionicons name="heart" size={20} color="#FF375F" />
                            </View>
                            <View>
                                <Text style={styles.connectTitle}>Sync Apple Health</Text>
                                <Text style={styles.connectSubtitle}>Get real-time data</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#666" />
                    </TouchableOpacity>

                    {/* Insights Section */}
                    <View style={styles.insightsSection}>
                        <Text style={styles.insightsTitle}>💡 Today's Insights</Text>
                        <View style={styles.insightCard}>
                            <Text style={styles.insightText}>
                                Your HRV is 12% above your baseline. Great recovery! You're ready for high-intensity training today.
                            </Text>
                        </View>
                        <View style={styles.insightCard}>
                            <Text style={styles.insightText}>
                                You got 7.5 hours of sleep with 2 hours of deep sleep. Aim for 8+ hours tonight.
                            </Text>
                        </View>
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>
            </SafeAreaView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0A0A0A",
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
        backgroundColor: "rgba(255,255,255,0.1)",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#FFF",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
    },

    // Readiness Section
    readinessSection: {
        alignItems: "center",
        paddingVertical: 24,
        marginBottom: 16,
    },
    readinessLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: "#888",
        letterSpacing: 1,
        marginBottom: 8,
    },
    readinessScore: {
        flexDirection: "row",
        alignItems: "baseline",
    },
    readinessValue: {
        fontSize: 72,
        fontWeight: "800",
        color: "#7ED957",
    },
    readinessMax: {
        fontSize: 24,
        fontWeight: "600",
        color: "#666",
        marginLeft: 4,
    },
    readinessStatus: {
        fontSize: 16,
        fontWeight: "600",
        color: "#7ED957",
        marginTop: 8,
    },

    // Widget Grid
    widgetGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 20,
    },

    // Connect Banner
    connectBanner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "rgba(255,255,255,0.05)",
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "rgba(255, 55, 95, 0.2)",
    },
    connectLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    appleHealthIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: "rgba(255, 55, 95, 0.15)",
        alignItems: "center",
        justifyContent: "center",
    },
    connectTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFF",
    },
    connectSubtitle: {
        fontSize: 12,
        color: "#888",
        marginTop: 2,
    },

    // Insights Section
    insightsSection: {
        marginBottom: 20,
    },
    insightsTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#FFF",
        marginBottom: 12,
    },
    insightCard: {
        backgroundColor: "rgba(255,255,255,0.05)",
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderLeftWidth: 3,
        borderLeftColor: "#7ED957",
    },
    insightText: {
        fontSize: 14,
        color: "#CCC",
        lineHeight: 20,
    },
})
