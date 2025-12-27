/**
 * Missed Session Nudge
 * 
 * Prompts trainer to reach out to inactive clients.
 * Shows clients who haven't booked recently.
 */

import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"

type InactiveClient = {
    id: string
    name: string
    lastSessionDate: Date
    daysSince: number
    totalSessions: number
    avgSessionsPerMonth?: number
}

type Props = {
    clients: InactiveClient[]
    onReachOut: (clientId: string) => void
    onDismiss?: (clientId: string) => void
}

export function MissedSessionNudge({ clients, onReachOut, onDismiss }: Props) {
    if (clients.length === 0) return null

    const formatDaysAgo = (days: number) => {
        if (days === 1) return "yesterday"
        if (days < 7) return `${days} days ago`
        if (days < 14) return "1 week ago"
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`
        return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? "s" : ""} ago`
    }

    const getUrgencyLevel = (days: number) => {
        if (days >= 30) return { color: "#EF4444", label: "High Priority" }
        if (days >= 14) return { color: "#F97316", label: "Follow Up" }
        return { color: "#FBBF24", label: "Check In" }
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={["#F5970620", "#0A0A0A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={styles.alertIcon}>
                            <Ionicons name="notifications" size={18} color="#F97316" />
                        </View>
                        <View>
                            <Text style={styles.title}>Clients Need Attention</Text>
                            <Text style={styles.subtitle}>{clients.length} client{clients.length > 1 ? "s" : ""} haven't booked recently</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.clientsList}>
                    {clients.slice(0, 3).map((client) => {
                        const urgency = getUrgencyLevel(client.daysSince)
                        return (
                            <View key={client.id} style={styles.clientCard}>
                                <View style={styles.clientInfo}>
                                    <View style={styles.clientAvatar}>
                                        <Text style={styles.avatarText}>{client.name.charAt(0)}</Text>
                                    </View>
                                    <View style={styles.clientDetails}>
                                        <Text style={styles.clientName}>{client.name}</Text>
                                        <Text style={styles.lastSession}>
                                            Last session: {formatDaysAgo(client.daysSince)}
                                        </Text>
                                    </View>
                                    <View style={[styles.urgencyBadge, { backgroundColor: urgency.color + "20" }]}>
                                        <Text style={[styles.urgencyText, { color: urgency.color }]}>
                                            {urgency.label}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.actionRow}>
                                    <TouchableOpacity
                                        style={styles.reachOutButton}
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                                            onReachOut(client.id)
                                        }}
                                    >
                                        <Ionicons name="chatbubble" size={14} color="#000" />
                                        <Text style={styles.reachOutText}>Send Message</Text>
                                    </TouchableOpacity>

                                    {onDismiss && (
                                        <TouchableOpacity
                                            style={styles.dismissButton}
                                            onPress={() => {
                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                                onDismiss(client.id)
                                            }}
                                        >
                                            <Ionicons name="close" size={16} color="#666" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        )
                    })}
                </View>

                {clients.length > 3 && (
                    <TouchableOpacity style={styles.viewAllButton}>
                        <Text style={styles.viewAllText}>View all {clients.length} inactive clients</Text>
                        <Ionicons name="chevron-forward" size={14} color="#F97316" />
                    </TouchableOpacity>
                )}
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
        borderColor: "#F9731630",
    },
    gradient: {
        padding: 16,
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
        gap: 12,
    },
    alertIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F9731620",
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "700",
    },
    subtitle: {
        color: "#888",
        fontSize: 12,
        marginTop: 2,
    },
    clientsList: {
        gap: 12,
    },
    clientCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 12,
    },
    clientInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    clientAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#333",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },
    avatarText: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "700",
    },
    clientDetails: {
        flex: 1,
    },
    clientName: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "600",
    },
    lastSession: {
        color: "#888",
        fontSize: 11,
        marginTop: 2,
    },
    urgencyBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    urgencyText: {
        fontSize: 10,
        fontWeight: "700",
    },
    actionRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    reachOutButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        backgroundColor: "#7ED957",
        paddingVertical: 10,
        borderRadius: 12,
    },
    reachOutText: {
        color: "#000",
        fontSize: 13,
        fontWeight: "600",
    },
    dismissButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#252525",
        alignItems: "center",
        justifyContent: "center",
    },
    viewAllButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#252525",
    },
    viewAllText: {
        color: "#F97316",
        fontSize: 13,
        fontWeight: "500",
    },
})

export default MissedSessionNudge
