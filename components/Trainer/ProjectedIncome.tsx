/**
 * Projected Monthly Income
 * 
 * Calculates and displays projected monthly earnings
 * based on scheduled sessions and average rates.
 */

import { View, Text, StyleSheet, Animated } from "react-native"
import { useRef, useEffect } from "react"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"

type Props = {
    confirmedAmount: number
    projectedAmount: number
    scheduledSessions: number
    pendingSessions: number
    monthName?: string
}

export function ProjectedIncome({
    confirmedAmount,
    projectedAmount,
    scheduledSessions,
    pendingSessions,
    monthName
}: Props) {
    const progressAnim = useRef(new Animated.Value(0)).current

    const total = confirmedAmount + projectedAmount
    const confirmedPercent = total > 0 ? (confirmedAmount / total) * 100 : 0

    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: confirmedPercent,
            duration: 1000,
            useNativeDriver: false,
        }).start()
    }, [confirmedPercent])

    const currentMonth = monthName || new Date().toLocaleDateString("en-US", { month: "long" })

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Ionicons name="trending-up" size={18} color="#3B82F6" />
                    <Text style={styles.title}>{currentMonth} Projection</Text>
                </View>
                <View style={styles.statusDot} />
            </View>

            {/* Total Projected */}
            <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Projected Total</Text>
                <Text style={styles.totalAmount}>${total.toLocaleString()}</Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                    <Animated.View
                        style={[
                            styles.progressFill,
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
                    <Text style={styles.pendingLabel}>Pending</Text>
                </View>
            </View>

            {/* Breakdown */}
            <View style={styles.breakdown}>
                <View style={styles.breakdownItem}>
                    <View style={styles.breakdownDot} />
                    <View style={styles.breakdownInfo}>
                        <Text style={styles.breakdownLabel}>Confirmed</Text>
                        <Text style={styles.breakdownValue}>${confirmedAmount.toLocaleString()}</Text>
                    </View>
                    <Text style={styles.sessionCount}>{scheduledSessions} sessions</Text>
                </View>

                <View style={styles.breakdownItem}>
                    <View style={[styles.breakdownDot, styles.dotPending]} />
                    <View style={styles.breakdownInfo}>
                        <Text style={styles.breakdownLabel}>Pending</Text>
                        <Text style={[styles.breakdownValue, styles.valuePending]}>
                            ${projectedAmount.toLocaleString()}
                        </Text>
                    </View>
                    <Text style={styles.sessionCount}>{pendingSessions} sessions</Text>
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
        borderColor: "#3B82F620",
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
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#22C55E",
    },
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    totalLabel: {
        color: "#888",
        fontSize: 13,
    },
    totalAmount: {
        color: "#FFF",
        fontSize: 28,
        fontWeight: "800",
    },
    progressContainer: {
        marginBottom: 16,
    },
    progressTrack: {
        height: 8,
        backgroundColor: "#333",
        borderRadius: 4,
        overflow: "hidden",
    },
    progressFill: {
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
    pendingLabel: {
        color: "#666",
        fontSize: 10,
    },
    breakdown: {
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 12,
        gap: 12,
    },
    breakdownItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    breakdownDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#3B82F6",
        marginRight: 12,
    },
    dotPending: {
        backgroundColor: "#666",
    },
    breakdownInfo: {
        flex: 1,
    },
    breakdownLabel: {
        color: "#888",
        fontSize: 11,
    },
    breakdownValue: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "700",
    },
    valuePending: {
        color: "#888",
    },
    sessionCount: {
        color: "#666",
        fontSize: 12,
    },
})

export default ProjectedIncome
