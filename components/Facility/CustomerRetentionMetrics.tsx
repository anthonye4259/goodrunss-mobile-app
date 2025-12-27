/**
 * Customer Retention Metrics (Premium Only)
 * 
 * Shows new vs returning customer ratio.
 * Tracks customer lifetime value trends.
 */

import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"
import Svg, { Circle, G } from "react-native-svg"

type Props = {
    newCustomers: number
    returningCustomers: number
    retentionRate: number // 0-100
    avgVisitsPerCustomer: number
    churnRisk: number // number at risk of churning
    isPremium: boolean
    onUpgrade?: () => void
}

export function CustomerRetentionMetrics({
    newCustomers,
    returningCustomers,
    retentionRate,
    avgVisitsPerCustomer,
    churnRisk,
    isPremium,
    onUpgrade
}: Props) {
    const totalCustomers = newCustomers + returningCustomers
    const returningPercent = totalCustomers > 0 ? Math.round((returningCustomers / totalCustomers) * 100) : 0

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
                    colors={["#3B82F620", "#0A0A0A"]}
                    style={styles.lockedGradient}
                >
                    <View style={styles.lockedContent}>
                        <Ionicons name="people" size={24} color="#3B82F6" />
                        <Text style={styles.lockedTitle}>Customer Retention</Text>
                        <Text style={styles.lockedSubtitle}>
                            Track loyalty & reduce churn
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

    const size = 100
    const strokeWidth = 10
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const strokeDashoffset = circumference - (retentionRate / 100) * circumference

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Ionicons name="heart" size={20} color="#EC4899" />
                    <Text style={styles.title}>Customer Retention</Text>
                </View>
                {churnRisk > 0 && (
                    <View style={styles.riskBadge}>
                        <Ionicons name="alert-circle" size={12} color="#EF4444" />
                        <Text style={styles.riskText}>{churnRisk} at risk</Text>
                    </View>
                )}
            </View>

            <View style={styles.metricsRow}>
                {/* Retention Ring */}
                <View style={styles.ringContainer}>
                    <Svg width={size} height={size}>
                        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
                            <Circle
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                stroke="#252525"
                                strokeWidth={strokeWidth}
                                fill="transparent"
                            />
                            <Circle
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                stroke="#EC4899"
                                strokeWidth={strokeWidth}
                                fill="transparent"
                                strokeDasharray={`${circumference} ${circumference}`}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                            />
                        </G>
                    </Svg>
                    <View style={styles.ringCenter}>
                        <Text style={styles.ringPercent}>{retentionRate}%</Text>
                        <Text style={styles.ringLabel}>Retention</Text>
                    </View>
                </View>

                {/* Stats */}
                <View style={styles.statsColumn}>
                    <View style={styles.statItem}>
                        <View style={[styles.statDot, { backgroundColor: "#22C55E" }]} />
                        <View style={styles.statInfo}>
                            <Text style={styles.statValue}>{newCustomers}</Text>
                            <Text style={styles.statLabel}>New</Text>
                        </View>
                    </View>
                    <View style={styles.statItem}>
                        <View style={[styles.statDot, { backgroundColor: "#3B82F6" }]} />
                        <View style={styles.statInfo}>
                            <Text style={styles.statValue}>{returningCustomers}</Text>
                            <Text style={styles.statLabel}>Returning</Text>
                        </View>
                    </View>
                    <View style={styles.statItem}>
                        <View style={[styles.statDot, { backgroundColor: "#F59E0B" }]} />
                        <View style={styles.statInfo}>
                            <Text style={styles.statValue}>{avgVisitsPerCustomer.toFixed(1)}</Text>
                            <Text style={styles.statLabel}>Avg Visits</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Ratio Bar */}
            <View style={styles.ratioSection}>
                <Text style={styles.ratioLabel}>Customer Mix</Text>
                <View style={styles.ratioBar}>
                    <View
                        style={[styles.ratioNew, { width: `${100 - returningPercent}%` }]}
                    />
                    <View
                        style={[styles.ratioReturning, { width: `${returningPercent}%` }]}
                    />
                </View>
                <View style={styles.ratioLegend}>
                    <Text style={styles.ratioLegendText}>
                        <Text style={{ color: "#22C55E" }}>●</Text> New {100 - returningPercent}%
                    </Text>
                    <Text style={styles.ratioLegendText}>
                        <Text style={{ color: "#3B82F6" }}>●</Text> Returning {returningPercent}%
                    </Text>
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
        borderColor: "#EC489930",
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
    riskBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "#EF444420",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    riskText: {
        color: "#EF4444",
        fontSize: 10,
        fontWeight: "600",
    },
    metricsRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    ringContainer: {
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
    },
    ringCenter: {
        position: "absolute",
        alignItems: "center",
    },
    ringPercent: {
        color: "#EC4899",
        fontSize: 22,
        fontWeight: "800",
    },
    ringLabel: {
        color: "#888",
        fontSize: 10,
    },
    statsColumn: {
        flex: 1,
        marginLeft: 20,
        gap: 12,
    },
    statItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    statDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 10,
    },
    statInfo: {
        flexDirection: "row",
        alignItems: "baseline",
        gap: 6,
    },
    statValue: {
        color: "#FFF",
        fontSize: 18,
        fontWeight: "700",
    },
    statLabel: {
        color: "#666",
        fontSize: 12,
    },
    ratioSection: {
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#252525",
    },
    ratioLabel: {
        color: "#888",
        fontSize: 11,
        marginBottom: 8,
    },
    ratioBar: {
        flexDirection: "row",
        height: 8,
        borderRadius: 4,
        overflow: "hidden",
    },
    ratioNew: {
        backgroundColor: "#22C55E",
    },
    ratioReturning: {
        backgroundColor: "#3B82F6",
    },
    ratioLegend: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 8,
    },
    ratioLegendText: {
        color: "#888",
        fontSize: 10,
    },
    lockedContainer: {
        borderRadius: 20,
        overflow: "hidden",
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#3B82F630",
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

export default CustomerRetentionMetrics
