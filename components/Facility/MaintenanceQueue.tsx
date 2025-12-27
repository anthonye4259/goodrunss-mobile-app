/**
 * Maintenance Queue
 * 
 * Track repair and maintenance tickets.
 * Priority-sorted list with status tracking.
 */

import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"

type MaintenanceTicket = {
    id: string
    title: string
    location: string // "Court 1", "Locker Room"
    priority: "urgent" | "high" | "normal" | "low"
    status: "pending" | "in_progress" | "completed"
    reportedDate: Date
    assignedTo?: string
    estimatedCost?: number
}

type Props = {
    tickets: MaintenanceTicket[]
    onTicketPress: (ticketId: string) => void
    onCreateTicket: () => void
    onMarkComplete: (ticketId: string) => void
}

export function MaintenanceQueue({ tickets, onTicketPress, onCreateTicket, onMarkComplete }: Props) {
    const pendingTickets = tickets.filter(t => t.status !== "completed")
    const urgentCount = pendingTickets.filter(t => t.priority === "urgent").length

    const getPriorityConfig = (priority: string) => {
        switch (priority) {
            case "urgent":
                return { color: "#EF4444", bg: "#EF444420", label: "Urgent", icon: "warning" }
            case "high":
                return { color: "#F59E0B", bg: "#F59E0B20", label: "High", icon: "alert-circle" }
            case "normal":
                return { color: "#3B82F6", bg: "#3B82F620", label: "Normal", icon: "information-circle" }
            case "low":
                return { color: "#888", bg: "#88888820", label: "Low", icon: "ellipsis-horizontal-circle" }
            default:
                return { color: "#888", bg: "#88888820", label: "Normal", icon: "information-circle" }
        }
    }

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "pending":
                return { color: "#F59E0B", label: "Pending" }
            case "in_progress":
                return { color: "#3B82F6", label: "In Progress" }
            case "completed":
                return { color: "#22C55E", label: "Done" }
            default:
                return { color: "#888", label: status }
        }
    }

    const daysSince = (date: Date) => {
        const now = new Date()
        return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Ionicons name="construct" size={20} color="#3B82F6" />
                    <Text style={styles.title}>Maintenance</Text>
                    {pendingTickets.length > 0 && (
                        <View style={styles.countBadge}>
                            <Text style={styles.countText}>{pendingTickets.length}</Text>
                        </View>
                    )}
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                        onCreateTicket()
                    }}
                >
                    <Ionicons name="add" size={20} color="#3B82F6" />
                </TouchableOpacity>
            </View>

            {urgentCount > 0 && (
                <View style={styles.urgentAlert}>
                    <Ionicons name="warning" size={16} color="#EF4444" />
                    <Text style={styles.urgentText}>
                        {urgentCount} urgent issue{urgentCount > 1 ? "s" : ""} need attention!
                    </Text>
                </View>
            )}

            {pendingTickets.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="checkmark-circle" size={40} color="#22C55E" />
                    <Text style={styles.emptyTitle}>All Clear!</Text>
                    <Text style={styles.emptySubtitle}>No pending maintenance</Text>
                </View>
            ) : (
                pendingTickets.slice(0, 5).map((ticket) => {
                    const priority = getPriorityConfig(ticket.priority)
                    const status = getStatusConfig(ticket.status)
                    const days = daysSince(ticket.reportedDate)

                    return (
                        <TouchableOpacity
                            key={ticket.id}
                            style={[styles.ticketCard, { borderLeftColor: priority.color }]}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                onTicketPress(ticket.id)
                            }}
                        >
                            <View style={styles.ticketHeader}>
                                <View style={[styles.priorityBadge, { backgroundColor: priority.bg }]}>
                                    <Ionicons name={priority.icon as any} size={12} color={priority.color} />
                                    <Text style={[styles.priorityText, { color: priority.color }]}>
                                        {priority.label}
                                    </Text>
                                </View>
                                <View style={[styles.statusBadge, { borderColor: status.color }]}>
                                    <Text style={[styles.statusText, { color: status.color }]}>
                                        {status.label}
                                    </Text>
                                </View>
                            </View>

                            <Text style={styles.ticketTitle}>{ticket.title}</Text>
                            <Text style={styles.ticketLocation}>{ticket.location}</Text>

                            <View style={styles.ticketFooter}>
                                <Text style={styles.ticketDate}>
                                    {days === 0 ? "Today" : days === 1 ? "Yesterday" : `${days} days ago`}
                                </Text>
                                {ticket.status === "in_progress" && (
                                    <TouchableOpacity
                                        style={styles.completeButton}
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                                            onMarkComplete(ticket.id)
                                        }}
                                    >
                                        <Ionicons name="checkmark" size={14} color="#22C55E" />
                                        <Text style={styles.completeText}>Done</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </TouchableOpacity>
                    )
                })
            )}
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
        borderColor: "#3B82F630",
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
        backgroundColor: "#3B82F6",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    countText: {
        color: "#FFF",
        fontSize: 11,
        fontWeight: "700",
    },
    addButton: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "#3B82F620",
        alignItems: "center",
        justifyContent: "center",
    },
    urgentAlert: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#EF444420",
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
    },
    urgentText: {
        color: "#EF4444",
        fontSize: 13,
        fontWeight: "600",
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: 24,
    },
    emptyTitle: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "700",
        marginTop: 12,
    },
    emptySubtitle: {
        color: "#666",
        fontSize: 12,
        marginTop: 4,
    },
    ticketCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 14,
        padding: 14,
        marginBottom: 8,
        borderLeftWidth: 3,
    },
    ticketHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    priorityBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    priorityText: {
        fontSize: 10,
        fontWeight: "700",
    },
    statusBadge: {
        borderWidth: 1,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 10,
        fontWeight: "600",
    },
    ticketTitle: {
        color: "#FFF",
        fontSize: 15,
        fontWeight: "600",
    },
    ticketLocation: {
        color: "#888",
        fontSize: 12,
        marginTop: 2,
    },
    ticketFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: "#252525",
    },
    ticketDate: {
        color: "#555",
        fontSize: 11,
    },
    completeButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "#22C55E20",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    completeText: {
        color: "#22C55E",
        fontSize: 11,
        fontWeight: "600",
    },
})

export default MaintenanceQueue
