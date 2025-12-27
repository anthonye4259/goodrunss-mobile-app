/**
 * Revenue Forecast Widget
 * 
 * Projects monthly income based on current bookings and trends.
 * Shows confirmed vs projected with confidence indicator.
 */

import { View, Text, StyleSheet, Animated } from "react-native"
import { useRef, useEffect } from "react"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"

type Props = {
    confirmedRevenue: number
    projectedRevenue: number
    lastMonthRevenue: number
    daysRemaining: number
    monthName?: string
    currency?: string
}

export function RevenueForecast({
    confirmedRevenue,
    projectedRevenue,
    lastMonthRevenue,
    daysRemaining,
    monthName,
    currency = "$"
}: Props) {
    const progressAnim = useRef(new Animated.Value(0)).current

    const totalProjected = confirmedRevenue + projectedRevenue
    const confirmedPercent = totalProjected > 0 ? (confirmedRevenue / totalProjected) * 100 : 0
    const vsLastMonth = totalProjected - lastMonthRevenue
    const vsLastMonthPercent = lastMonthRevenue > 0
        ? Math.round((vsLastMonth / lastMonthRevenue) * 100)
        : 0
    const isUp = vsLastMonth >= 0

    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: confirmedPercent,
            duration: 1000,
            useNativeDriver: false,
        }).start()
    }, [confirmedPercent])

    const currentMonth = monthName || new Date().toLocaleDateString("en-US", { month: "long" })

    const confidenceLevel = daysRemaining <= 7 ? "High" : daysRemaining <= 14 ? "Medium" : "Low"
    const confidenceColor = daysRemaining <= 7 ? "#22C55E" : daysRemaining <= 14 ? "#FBBF24" : "#888"

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={["#3B82F620", "#0A0A0A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Ionicons name="analytics" size={20} color="#3B82F6" />
                        <Text style={styles.title}>{currentMonth} Forecast</Text>
                    </View>
                    <View style={[styles.confidenceBadge, { borderColor: confidenceColor }]}>
                        <Text style={[styles.confidenceText, { color: confidenceColor }]}>
                            {confidenceLevel} Confidence
                        </Text>
                    </View>
                </View>

                {/* Projected Total */}
                <View style={styles.projectionRow}>
                    <View>
                        <Text style={styles.projectionLabel}>Projected Total</Text>
                        <View style={styles.amountRow}>
                            <Text style={styles.currency}>{currency}</Text>
                            <Text style={styles.totalAmount}>{totalProjected.toLocaleString()}</Text>
                        </View>
                    </View>
                    <View style={[styles.changeBadge, isUp ? styles.up : styles.down]}>
                        <Ionicons
                            name={isUp ? "arrow-up" : "arrow-down"}
                            size={12}
                            color={isUp ? "#22C55E" : "#EF4444"}
                        />
                        <Text style={[styles.changeText, isUp ? styles.upText : styles.downText]}>
                            {Math.abs(vsLastMonthPercent)}% vs last month
                        </Text>
                    </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressSection}>
                    <View style={styles.progressTrack}>
                        <Animated.View
                            style={[
                                styles.progressConfirmed,
                                {
                                    width: progressAnim.interpolate({
                                        inputRange: [0, 100],
                                        outputRange: ["0%", "100%"],
                                    })
                                }
                            ]}
                        />
                    </View>
                    <View style={styles.progressLabels}>
                        <Text style={styles.confirmedLabel}>Confirmed</Text>
                        <Text style={styles.remainingLabel}>{daysRemaining} days left</Text>
                    </View>
                </View>

                {/* Breakdown */}
                <View style={styles.breakdown}>
                    <View style={styles.breakdownItem}>
                        <View style={[styles.dot, { backgroundColor: "#3B82F6" }]} />
                        <View style={styles.breakdownInfo}>
                            <Text style={styles.breakdownLabel}>Confirmed Bookings</Text>
                            <Text style={styles.breakdownValue}>
                                {currency}{confirmedRevenue.toLocaleString()}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.breakdownItem}>
                        <View style={[styles.dot, { backgroundColor: "#888" }]} />
                        <View style={styles.breakdownInfo}>
                            <Text style={styles.breakdownLabel}>Projected (Based on Trends)</Text>
                            <Text style={[styles.breakdownValue, styles.projectedValue]}>
                                +{currency}{projectedRevenue.toLocaleString()}
                            </Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 20,
        overflow: "hidden",
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#3B82F630",
    },
    gradient: {
        padding: 20,
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
    confidenceBadge: {
        borderWidth: 1,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    confidenceText: {
        fontSize: 10,
        fontWeight: "600",
    },
    projectionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: 20,
    },
    projectionLabel: {
        color: "#888",
        fontSize: 12,
        marginBottom: 4,
    },
    amountRow: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    currency: {
        color: "#3B82F6",
        fontSize: 20,
        fontWeight: "600",
        marginTop: 4,
    },
    totalAmount: {
        color: "#FFF",
        fontSize: 36,
        fontWeight: "800",
    },
    changeBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    up: {
        backgroundColor: "#22C55E20",
    },
    down: {
        backgroundColor: "#EF444420",
    },
    changeText: {
        fontSize: 11,
        fontWeight: "600",
    },
    upText: {
        color: "#22C55E",
    },
    downText: {
        color: "#EF4444",
    },
    progressSection: {
        marginBottom: 16,
    },
    progressTrack: {
        height: 8,
        backgroundColor: "#333",
        borderRadius: 4,
        overflow: "hidden",
    },
    progressConfirmed: {
        height: "100%",
        backgroundColor: "#3B82F6",
        borderRadius: 4,
    },
    progressLabels: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 6,
    },
    confirmedLabel: {
        color: "#3B82F6",
        fontSize: 10,
        fontWeight: "500",
    },
    remainingLabel: {
        color: "#666",
        fontSize: 10,
    },
    breakdown: {
        backgroundColor: "#0A0A0A",
        borderRadius: 12,
        padding: 12,
        gap: 10,
    },
    breakdownItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 10,
    },
    breakdownInfo: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    breakdownLabel: {
        color: "#888",
        fontSize: 12,
    },
    breakdownValue: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "700",
    },
    projectedValue: {
        color: "#888",
    },
})

export default RevenueForecast
