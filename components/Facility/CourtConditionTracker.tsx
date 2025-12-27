/**
 * Court/Space Condition Tracker
 * 
 * Track maintenance status of each court/studio.
 * Quick overview of what needs attention.
 */

import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"

type CourtCondition = {
    id: string
    name: string  // "Court 1", "Studio A"
    lastCleaned?: Date
    lastInspected?: Date
    condition: "excellent" | "good" | "fair" | "needs_attention"
    issues: string[]
    nextScheduledMaintenance?: Date
}

type Props = {
    courts: CourtCondition[]
    onCourtPress: (courtId: string) => void
    onScheduleMaintenance: (courtId: string) => void
}

export function CourtConditionTracker({ courts, onCourtPress, onScheduleMaintenance }: Props) {
    const needsAttentionCount = courts.filter(c => c.condition === "needs_attention" || c.condition === "fair").length

    const getConditionConfig = (condition: string) => {
        switch (condition) {
            case "excellent":
                return { color: "#22C55E", bg: "#22C55E20", icon: "checkmark-circle", label: "Excellent" }
            case "good":
                return { color: "#3B82F6", bg: "#3B82F620", icon: "thumbs-up", label: "Good" }
            case "fair":
                return { color: "#F59E0B", bg: "#F59E0B20", icon: "alert-circle", label: "Fair" }
            case "needs_attention":
                return { color: "#EF4444", bg: "#EF444420", icon: "warning", label: "Needs Attention" }
            default:
                return { color: "#888", bg: "#88888820", icon: "help-circle", label: "Unknown" }
        }
    }

    const formatDate = (date?: Date) => {
        if (!date) return "Never"
        const now = new Date()
        const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
        if (diff < 24) return `${diff}h ago`
        if (diff < 48) return "Yesterday"
        return `${Math.floor(diff / 24)}d ago`
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Ionicons name="fitness" size={20} color="#22C55E" />
                    <Text style={styles.title}>Court Conditions</Text>
                </View>
                {needsAttentionCount > 0 && (
                    <View style={styles.alertBadge}>
                        <Ionicons name="alert" size={12} color="#F59E0B" />
                        <Text style={styles.alertText}>{needsAttentionCount} need attention</Text>
                    </View>
                )}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.courtsRow}>
                    {courts.map((court) => {
                        const condition = getConditionConfig(court.condition)

                        return (
                            <TouchableOpacity
                                key={court.id}
                                style={[styles.courtCard, { borderColor: condition.color + "40" }]}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                    onCourtPress(court.id)
                                }}
                            >
                                <View style={styles.courtHeader}>
                                    <Text style={styles.courtName}>{court.name}</Text>
                                    <View style={[styles.conditionBadge, { backgroundColor: condition.bg }]}>
                                        <Ionicons name={condition.icon as any} size={12} color={condition.color} />
                                    </View>
                                </View>

                                <Text style={[styles.conditionLabel, { color: condition.color }]}>
                                    {condition.label}
                                </Text>

                                <View style={styles.courtDetails}>
                                    <View style={styles.detailRow}>
                                        <Ionicons name="sparkles" size={12} color="#666" />
                                        <Text style={styles.detailText}>
                                            Cleaned: {formatDate(court.lastCleaned)}
                                        </Text>
                                    </View>
                                </View>

                                {court.issues.length > 0 && (
                                    <View style={styles.issuesSection}>
                                        {court.issues.slice(0, 2).map((issue, i) => (
                                            <View key={i} style={styles.issuePill}>
                                                <Text style={styles.issueText}>{issue}</Text>
                                            </View>
                                        ))}
                                        {court.issues.length > 2 && (
                                            <Text style={styles.moreIssues}>
                                                +{court.issues.length - 2} more
                                            </Text>
                                        )}
                                    </View>
                                )}

                                {court.condition !== "excellent" && (
                                    <TouchableOpacity
                                        style={styles.scheduleButton}
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                                            onScheduleMaintenance(court.id)
                                        }}
                                    >
                                        <Ionicons name="calendar" size={12} color="#3B82F6" />
                                        <Text style={styles.scheduleText}>Schedule</Text>
                                    </TouchableOpacity>
                                )}
                            </TouchableOpacity>
                        )
                    })}
                </View>
            </ScrollView>
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
    alertBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "#F59E0B20",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    alertText: {
        color: "#F59E0B",
        fontSize: 10,
        fontWeight: "600",
    },
    courtsRow: {
        flexDirection: "row",
        gap: 12,
    },
    courtCard: {
        width: 160,
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
    },
    courtHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    courtName: {
        color: "#FFF",
        fontSize: 15,
        fontWeight: "700",
    },
    conditionBadge: {
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    conditionLabel: {
        fontSize: 12,
        fontWeight: "600",
        marginBottom: 8,
    },
    courtDetails: {
        marginBottom: 8,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    detailText: {
        color: "#666",
        fontSize: 11,
    },
    issuesSection: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 4,
        marginBottom: 10,
    },
    issuePill: {
        backgroundColor: "#EF444420",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    issueText: {
        color: "#EF4444",
        fontSize: 9,
        fontWeight: "500",
    },
    moreIssues: {
        color: "#666",
        fontSize: 9,
        alignSelf: "center",
    },
    scheduleButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        backgroundColor: "#3B82F620",
        paddingVertical: 8,
        borderRadius: 10,
    },
    scheduleText: {
        color: "#3B82F6",
        fontSize: 11,
        fontWeight: "600",
    },
})

export default CourtConditionTracker
