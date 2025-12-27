/**
 * Capacity Alerts (Premium Only)
 * 
 * Shows courts approaching full capacity.
 * Opportunity to promote or raise prices.
 */

import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native"
import { useRef, useEffect } from "react"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"

type CapacityAlert = {
    courtId: string
    courtName: string
    date: string
    capacityPercent: number // 0-100
    bookedSlots: number
    totalSlots: number
    projectedToSellOut: boolean
}

type Props = {
    alerts: CapacityAlert[]
    isPremium: boolean
    onAlertPress: (courtId: string, date: string) => void
    onUpgrade?: () => void
}

export function CapacityAlerts({ alerts, isPremium, onAlertPress, onUpgrade }: Props) {
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
                    colors={["#EF444420", "#0A0A0A"]}
                    style={styles.lockedGradient}
                >
                    <View style={styles.lockedContent}>
                        <Ionicons name="trending-up" size={24} color="#EF4444" />
                        <Text style={styles.lockedTitle}>Capacity Alerts</Text>
                        <Text style={styles.lockedSubtitle}>
                            Know when courts are almost full
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

    const highCapacityAlerts = alerts.filter(a => a.capacityPercent >= 80)

    if (highCapacityAlerts.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
                <Text style={styles.emptyText}>No capacity alerts</Text>
                <Text style={styles.emptySubtext}>All courts have available slots</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Ionicons name="flame" size={20} color="#EF4444" />
                    <Text style={styles.title}>Capacity Alerts</Text>
                </View>
                <View style={styles.countBadge}>
                    <Text style={styles.countText}>
                        {highCapacityAlerts.length} hot
                    </Text>
                </View>
            </View>

            {highCapacityAlerts.map((alert) => (
                <CapacityCard
                    key={`${alert.courtId}-${alert.date}`}
                    alert={alert}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                        onAlertPress(alert.courtId, alert.date)
                    }}
                />
            ))}
        </View>
    )
}

function CapacityCard({ alert, onPress }: { alert: CapacityAlert; onPress: () => void }) {
    const pulseAnim = useRef(new Animated.Value(1)).current

    useEffect(() => {
        if (alert.projectedToSellOut) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.02,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                ])
            ).start()
        }
    }, [alert.projectedToSellOut])

    const getCapacityColor = (percent: number) => {
        if (percent >= 95) return "#EF4444"
        if (percent >= 80) return "#F59E0B"
        return "#22C55E"
    }

    const color = getCapacityColor(alert.capacityPercent)

    return (
        <TouchableOpacity onPress={onPress}>
            <Animated.View
                style={[
                    styles.alertCard,
                    {
                        transform: [{ scale: pulseAnim }],
                        borderColor: color + "40",
                    }
                ]}
            >
                <View style={styles.alertHeader}>
                    <View>
                        <Text style={styles.alertCourtName}>{alert.courtName}</Text>
                        <Text style={styles.alertDate}>{alert.date}</Text>
                    </View>
                    {alert.projectedToSellOut && (
                        <View style={styles.sellOutBadge}>
                            <Text style={styles.sellOutText}>🔥 Selling Out!</Text>
                        </View>
                    )}
                </View>

                <View style={styles.capacityRow}>
                    <View style={styles.capacityBar}>
                        <View
                            style={[styles.capacityFill, { width: `${alert.capacityPercent}%`, backgroundColor: color }]}
                        />
                    </View>
                    <Text style={[styles.capacityPercent, { color }]}>
                        {alert.capacityPercent}%
                    </Text>
                </View>

                <Text style={styles.slotsText}>
                    {alert.bookedSlots}/{alert.totalSlots} slots booked
                </Text>
            </Animated.View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#141414",
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#EF444430",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14,
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
    countBadge: {
        backgroundColor: "#EF4444",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    countText: {
        color: "#FFF",
        fontSize: 11,
        fontWeight: "700",
    },
    alertCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 14,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1,
    },
    alertHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 10,
    },
    alertCourtName: {
        color: "#FFF",
        fontSize: 15,
        fontWeight: "600",
    },
    alertDate: {
        color: "#888",
        fontSize: 12,
        marginTop: 2,
    },
    sellOutBadge: {
        backgroundColor: "#EF444420",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    sellOutText: {
        color: "#EF4444",
        fontSize: 10,
        fontWeight: "700",
    },
    capacityRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 8,
    },
    capacityBar: {
        flex: 1,
        height: 8,
        backgroundColor: "#252525",
        borderRadius: 4,
        overflow: "hidden",
    },
    capacityFill: {
        height: "100%",
        borderRadius: 4,
    },
    capacityPercent: {
        fontSize: 16,
        fontWeight: "800",
        width: 50,
        textAlign: "right",
    },
    slotsText: {
        color: "#888",
        fontSize: 11,
    },
    emptyContainer: {
        backgroundColor: "#141414",
        borderRadius: 16,
        padding: 24,
        alignItems: "center",
        marginBottom: 16,
    },
    emptyText: {
        color: "#22C55E",
        fontSize: 14,
        fontWeight: "600",
        marginTop: 8,
    },
    emptySubtext: {
        color: "#666",
        fontSize: 11,
        marginTop: 2,
    },
    lockedContainer: {
        borderRadius: 20,
        overflow: "hidden",
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#EF444430",
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

export default CapacityAlerts
