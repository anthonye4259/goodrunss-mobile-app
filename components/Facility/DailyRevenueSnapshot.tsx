/**
 * Daily Revenue Snapshot
 * 
 * Shows today's earnings prominently at top of dashboard.
 * Updates in real-time as bookings come in.
 */

import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native"
import { useRef, useEffect } from "react"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"

type Props = {
    todayRevenue: number
    yesterdayRevenue: number
    bookingsToday: number
    currency?: string
    onPress?: () => void
}

export function DailyRevenueSnapshot({
    todayRevenue,
    yesterdayRevenue,
    bookingsToday,
    currency = "$",
    onPress
}: Props) {
    const scaleAnim = useRef(new Animated.Value(1)).current

    const difference = todayRevenue - yesterdayRevenue
    const percentChange = yesterdayRevenue > 0 ? Math.round((difference / yesterdayRevenue) * 100) : 0
    const isUp = difference >= 0

    // Pulse animation when revenue updates
    useEffect(() => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 1.02,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start()
    }, [todayRevenue])

    return (
        <TouchableOpacity
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                onPress?.()
            }}
            activeOpacity={0.9}
        >
            <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
                <LinearGradient
                    colors={["#22C55E20", "#0A0A0A"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradient}
                >
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="cash" size={24} color="#22C55E" />
                            </View>
                            <View>
                                <Text style={styles.label}>Today's Revenue</Text>
                                <Text style={styles.sublabel}>{bookingsToday} bookings</Text>
                            </View>
                        </View>
                        <View style={[styles.changeBadge, isUp ? styles.up : styles.down]}>
                            <Ionicons
                                name={isUp ? "trending-up" : "trending-down"}
                                size={14}
                                color={isUp ? "#22C55E" : "#EF4444"}
                            />
                            <Text style={[styles.changeText, isUp ? styles.upText : styles.downText]}>
                                {Math.abs(percentChange)}%
                            </Text>
                        </View>
                    </View>

                    <View style={styles.amountRow}>
                        <Text style={styles.currency}>{currency}</Text>
                        <Text style={styles.amount}>{todayRevenue.toLocaleString()}</Text>
                    </View>

                    <View style={styles.comparison}>
                        <Text style={styles.comparisonText}>
                            vs yesterday: {currency}{yesterdayRevenue.toLocaleString()}
                        </Text>
                        <Text style={[styles.diffText, isUp ? styles.upText : styles.downText]}>
                            {isUp ? "+" : ""}{currency}{difference.toLocaleString()}
                        </Text>
                    </View>
                </LinearGradient>
            </Animated.View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        overflow: "hidden",
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#22C55E30",
    },
    gradient: {
        padding: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 16,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: "#22C55E20",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    label: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "600",
    },
    sublabel: {
        color: "#888",
        fontSize: 12,
        marginTop: 2,
    },
    changeBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    up: {
        backgroundColor: "#22C55E20",
    },
    down: {
        backgroundColor: "#EF444420",
    },
    changeText: {
        fontSize: 13,
        fontWeight: "700",
    },
    upText: {
        color: "#22C55E",
    },
    downText: {
        color: "#EF4444",
    },
    amountRow: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    currency: {
        color: "#22C55E",
        fontSize: 28,
        fontWeight: "600",
        marginTop: 4,
        marginRight: 4,
    },
    amount: {
        color: "#FFF",
        fontSize: 52,
        fontWeight: "800",
    },
    comparison: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#333",
    },
    comparisonText: {
        color: "#888",
        fontSize: 12,
    },
    diffText: {
        fontSize: 14,
        fontWeight: "600",
    },
})

export default DailyRevenueSnapshot
