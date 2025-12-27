/**
 * Session History Timeline
 * 
 * Visual timeline of all sessions with a client.
 * Shows date, type, duration, and notes preview.
 */

import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"

type Session = {
    id: string
    date: Date
    type: string
    duration: number // minutes
    notes?: string
    paid: boolean
    amount?: number
}

type Props = {
    sessions: Session[]
    onSessionPress?: (session: Session) => void
}

export function SessionTimeline({ sessions, onSessionPress }: Props) {
    const formatDate = (date: Date) => {
        const d = new Date(date)
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }

    const formatDuration = (mins: number) => {
        if (mins < 60) return `${mins}min`
        const hours = Math.floor(mins / 60)
        const remaining = mins % 60
        return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`
    }

    const getSessionIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case "training": return "barbell"
            case "tennis": return "tennisball"
            case "basketball": return "basketball"
            case "yoga": return "body"
            case "assessment": return "clipboard"
            default: return "fitness"
        }
    }

    if (sessions.length === 0) {
        return (
            <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={40} color="#333" />
                <Text style={styles.emptyTitle}>No sessions yet</Text>
                <Text style={styles.emptySubtitle}>Sessions will appear here after booking</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="time" size={18} color="#3B82F6" />
                <Text style={styles.title}>Session History</Text>
                <Text style={styles.count}>{sessions.length} total</Text>
            </View>

            <View style={styles.timeline}>
                {sessions.map((session, index) => (
                    <TouchableOpacity
                        key={session.id}
                        style={styles.timelineItem}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                            onSessionPress?.(session)
                        }}
                        activeOpacity={0.8}
                    >
                        {/* Timeline Line */}
                        {index < sessions.length - 1 && <View style={styles.timelineLine} />}

                        {/* Dot */}
                        <View style={[styles.timelineDot, session.paid ? styles.dotPaid : styles.dotUnpaid]}>
                            <Ionicons
                                name={getSessionIcon(session.type) as any}
                                size={12}
                                color={session.paid ? "#22C55E" : "#F59E0B"}
                            />
                        </View>

                        {/* Content */}
                        <View style={styles.sessionContent}>
                            <View style={styles.sessionHeader}>
                                <Text style={styles.sessionDate}>{formatDate(session.date)}</Text>
                                <View style={styles.sessionMeta}>
                                    <Text style={styles.sessionDuration}>{formatDuration(session.duration)}</Text>
                                    {session.amount && (
                                        <Text style={styles.sessionAmount}>${session.amount}</Text>
                                    )}
                                </View>
                            </View>
                            <Text style={styles.sessionType}>{session.type}</Text>
                            {session.notes && (
                                <Text style={styles.sessionNotes} numberOfLines={1}>{session.notes}</Text>
                            )}
                        </View>

                        <Ionicons name="chevron-forward" size={16} color="#444" />
                    </TouchableOpacity>
                ))}
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
        alignItems: "center",
        gap: 8,
        marginBottom: 16,
    },
    title: {
        flex: 1,
        color: "#FFF",
        fontSize: 16,
        fontWeight: "700",
    },
    count: {
        color: "#666",
        fontSize: 12,
    },
    emptyState: {
        alignItems: "center",
        padding: 32,
        backgroundColor: "#141414",
        borderRadius: 20,
    },
    emptyTitle: {
        color: "#666",
        fontSize: 16,
        fontWeight: "600",
        marginTop: 12,
    },
    emptySubtitle: {
        color: "#444",
        fontSize: 13,
        marginTop: 4,
    },
    timeline: {
        gap: 0,
    },
    timelineItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingLeft: 8,
        paddingRight: 4,
        position: "relative",
    },
    timelineLine: {
        position: "absolute",
        left: 19,
        top: 36,
        bottom: -12,
        width: 2,
        backgroundColor: "#252525",
    },
    timelineDot: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    dotPaid: {
        backgroundColor: "#22C55E20",
    },
    dotUnpaid: {
        backgroundColor: "#F59E0B20",
    },
    sessionContent: {
        flex: 1,
    },
    sessionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    sessionDate: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "600",
    },
    sessionMeta: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    sessionDuration: {
        color: "#888",
        fontSize: 12,
    },
    sessionAmount: {
        color: "#22C55E",
        fontSize: 12,
        fontWeight: "600",
    },
    sessionType: {
        color: "#3B82F6",
        fontSize: 12,
        marginTop: 2,
    },
    sessionNotes: {
        color: "#666",
        fontSize: 11,
        marginTop: 4,
        fontStyle: "italic",
    },
})

export default SessionTimeline
