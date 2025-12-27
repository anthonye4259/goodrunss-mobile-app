/**
 * No-Show Tracker
 * 
 * Badge and list showing customers with no-show history.
 * Helps prevent revenue loss from repeat offenders.
 */

import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"

type NoShowRecord = {
    customerId: string
    customerName: string
    noShowCount: number
    lastNoShow: Date
    totalBookings: number
}

type Props = {
    records: NoShowRecord[]
    onFlag: (customerId: string) => void
    onViewDetails: (customerId: string) => void
    variant?: "badge" | "list"
}

export function NoShowTracker({ records, onFlag, onViewDetails, variant = "list" }: Props) {
    const totalNoShows = records.reduce((sum, r) => sum + r.noShowCount, 0)
    const repeatOffenders = records.filter(r => r.noShowCount >= 2)

    const getNoShowRate = (record: NoShowRecord) => {
        return Math.round((record.noShowCount / record.totalBookings) * 100)
    }

    const getSeverity = (count: number): "low" | "medium" | "high" => {
        if (count >= 3) return "high"
        if (count >= 2) return "medium"
        return "low"
    }

    const getSeverityColor = (severity: "low" | "medium" | "high") => {
        switch (severity) {
            case "high": return "#EF4444"
            case "medium": return "#F59E0B"
            case "low": return "#888"
        }
    }

    if (variant === "badge") {
        return (
            <TouchableOpacity
                style={[
                    styles.badge,
                    repeatOffenders.length > 0 && styles.badgeAlert,
                ]}
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    Alert.alert(
                        "No-Show Summary",
                        `${totalNoShows} no-shows this month\n${repeatOffenders.length} repeat offenders`
                    )
                }}
            >
                <Ionicons
                    name="alert-circle"
                    size={14}
                    color={repeatOffenders.length > 0 ? "#EF4444" : "#888"}
                />
                <Text style={[
                    styles.badgeText,
                    repeatOffenders.length > 0 && styles.badgeTextAlert,
                ]}>
                    {totalNoShows} No-Shows
                </Text>
            </TouchableOpacity>
        )
    }

    if (records.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="checkmark-circle" size={32} color="#22C55E" />
                <Text style={styles.emptyText}>No recent no-shows!</Text>
                <Text style={styles.emptySubtext}>Keep up the great attendance</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Ionicons name="warning" size={20} color="#EF4444" />
                    <Text style={styles.title}>No-Show Tracker</Text>
                </View>
                <View style={styles.statRow}>
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>{totalNoShows}</Text>
                        <Text style={styles.statLabel}>total</Text>
                    </View>
                    {repeatOffenders.length > 0 && (
                        <View style={[styles.stat, styles.statAlert]}>
                            <Text style={[styles.statValue, styles.statValueAlert]}>
                                {repeatOffenders.length}
                            </Text>
                            <Text style={styles.statLabel}>repeat</Text>
                        </View>
                    )}
                </View>
            </View>

            {records.slice(0, 5).map((record) => {
                const severity = getSeverity(record.noShowCount)
                const severityColor = getSeverityColor(severity)

                return (
                    <TouchableOpacity
                        key={record.customerId}
                        style={styles.recordCard}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                            onViewDetails(record.customerId)
                        }}
                    >
                        <View style={styles.recordInfo}>
                            <View style={styles.nameRow}>
                                <Text style={styles.customerName}>{record.customerName}</Text>
                                {record.noShowCount >= 2 && (
                                    <View style={[styles.repeatBadge, { backgroundColor: severityColor + "20" }]}>
                                        <Text style={[styles.repeatText, { color: severityColor }]}>
                                            Repeat
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.recordDetail}>
                                {record.noShowCount} no-shows ({getNoShowRate(record)}% rate)
                            </Text>
                            <Text style={styles.lastNoShow}>
                                Last: {record.lastNoShow.toLocaleDateString()}
                            </Text>
                        </View>

                        <View style={styles.countCircle}>
                            <Text style={[styles.countNumber, { color: severityColor }]}>
                                {record.noShowCount}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )
            })}

            {records.length > 5 && (
                <TouchableOpacity style={styles.viewAllButton}>
                    <Text style={styles.viewAllText}>View All ({records.length})</Text>
                </TouchableOpacity>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    badge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "#252525",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
    },
    badgeAlert: {
        backgroundColor: "#EF444420",
    },
    badgeText: {
        color: "#888",
        fontSize: 11,
        fontWeight: "600",
    },
    badgeTextAlert: {
        color: "#EF4444",
    },
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
    statRow: {
        flexDirection: "row",
        gap: 10,
    },
    stat: {
        alignItems: "center",
    },
    statAlert: {
        backgroundColor: "#EF444420",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statValue: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "700",
    },
    statValueAlert: {
        color: "#EF4444",
    },
    statLabel: {
        color: "#666",
        fontSize: 9,
    },
    recordCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 14,
        padding: 14,
        marginBottom: 8,
    },
    recordInfo: {
        flex: 1,
    },
    nameRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    customerName: {
        color: "#FFF",
        fontSize: 15,
        fontWeight: "600",
    },
    repeatBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    repeatText: {
        fontSize: 9,
        fontWeight: "700",
    },
    recordDetail: {
        color: "#888",
        fontSize: 12,
        marginTop: 4,
    },
    lastNoShow: {
        color: "#555",
        fontSize: 10,
        marginTop: 2,
    },
    countCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#252525",
        alignItems: "center",
        justifyContent: "center",
    },
    countNumber: {
        fontSize: 20,
        fontWeight: "800",
    },
    emptyContainer: {
        backgroundColor: "#141414",
        borderRadius: 20,
        padding: 32,
        marginBottom: 16,
        alignItems: "center",
    },
    emptyText: {
        color: "#22C55E",
        fontSize: 16,
        fontWeight: "600",
        marginTop: 12,
    },
    emptySubtext: {
        color: "#555",
        fontSize: 12,
        marginTop: 4,
    },
    viewAllButton: {
        alignItems: "center",
        paddingVertical: 12,
    },
    viewAllText: {
        color: "#EF4444",
        fontSize: 13,
        fontWeight: "600",
    },
})

export default NoShowTracker
