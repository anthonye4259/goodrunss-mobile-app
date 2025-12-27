/**
 * Waitlist Manager
 * 
 * View and manage booking waitlist for sold-out time slots.
 * One-tap notify when spots open up.
 */

import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"

type WaitlistEntry = {
    id: string
    customerName: string
    customerPhone?: string
    requestedDate: string
    requestedTime: string
    courtPreference?: string
    timestamp: Date
}

type Props = {
    entries: WaitlistEntry[]
    onNotify: (entryId: string) => void
    onRemove: (entryId: string) => void
    onNotifyAll?: () => void
}

export function WaitlistManager({ entries, onNotify, onRemove, onNotifyAll }: Props) {
    if (entries.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="list-outline" size={32} color="#666" />
                <Text style={styles.emptyText}>No one on waitlist</Text>
                <Text style={styles.emptySubtext}>Customers will appear here when slots are full</Text>
            </View>
        )
    }

    const formatTimestamp = (date: Date) => {
        const now = new Date()
        const diff = Math.floor((now.getTime() - date.getTime()) / 60000) // minutes
        if (diff < 60) return `${diff}m ago`
        if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
        return `${Math.floor(diff / 1440)}d ago`
    }

    const handleNotify = (entry: WaitlistEntry) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        Alert.alert(
            `Notify ${entry.customerName}?`,
            `They'll receive a notification that ${entry.requestedDate} at ${entry.requestedTime} is now available.`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Notify", onPress: () => onNotify(entry.id) }
            ]
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Ionicons name="hourglass" size={20} color="#8B5CF6" />
                    <Text style={styles.title}>Waitlist</Text>
                    <View style={styles.countBadge}>
                        <Text style={styles.countText}>{entries.length}</Text>
                    </View>
                </View>
                {onNotifyAll && entries.length > 1 && (
                    <TouchableOpacity
                        style={styles.notifyAllButton}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                            onNotifyAll()
                        }}
                    >
                        <Text style={styles.notifyAllText}>Notify All</Text>
                    </TouchableOpacity>
                )}
            </View>

            {entries.map((entry) => (
                <View key={entry.id} style={styles.entryCard}>
                    <View style={styles.entryInfo}>
                        <Text style={styles.customerName}>{entry.customerName}</Text>
                        <View style={styles.detailRow}>
                            <Ionicons name="calendar-outline" size={12} color="#666" />
                            <Text style={styles.detailText}>
                                {entry.requestedDate} at {entry.requestedTime}
                            </Text>
                        </View>
                        {entry.courtPreference && (
                            <View style={styles.detailRow}>
                                <Ionicons name="tennisball-outline" size={12} color="#666" />
                                <Text style={styles.detailText}>Prefers: {entry.courtPreference}</Text>
                            </View>
                        )}
                        <Text style={styles.timestamp}>{formatTimestamp(entry.timestamp)}</Text>
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={styles.notifyButton}
                            onPress={() => handleNotify(entry)}
                        >
                            <Ionicons name="notifications" size={16} color="#000" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                onRemove(entry.id)
                            }}
                        >
                            <Ionicons name="close" size={16} color="#666" />
                        </TouchableOpacity>
                    </View>
                </View>
            ))}
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
        borderColor: "#8B5CF620",
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
        backgroundColor: "#8B5CF6",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    countText: {
        color: "#000",
        fontSize: 12,
        fontWeight: "700",
    },
    notifyAllButton: {
        backgroundColor: "#8B5CF620",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    notifyAllText: {
        color: "#8B5CF6",
        fontSize: 12,
        fontWeight: "600",
    },
    entryCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 14,
        padding: 14,
        marginBottom: 8,
    },
    entryInfo: {
        flex: 1,
    },
    customerName: {
        color: "#FFF",
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 4,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 2,
    },
    detailText: {
        color: "#888",
        fontSize: 12,
    },
    timestamp: {
        color: "#555",
        fontSize: 10,
        marginTop: 6,
    },
    actions: {
        flexDirection: "row",
        gap: 8,
    },
    notifyButton: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "#8B5CF6",
        alignItems: "center",
        justifyContent: "center",
    },
    removeButton: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "#333",
        alignItems: "center",
        justifyContent: "center",
    },
    emptyContainer: {
        backgroundColor: "#141414",
        borderRadius: 20,
        padding: 32,
        marginBottom: 16,
        alignItems: "center",
    },
    emptyText: {
        color: "#888",
        fontSize: 16,
        fontWeight: "600",
        marginTop: 12,
    },
    emptySubtext: {
        color: "#555",
        fontSize: 12,
        textAlign: "center",
        marginTop: 4,
    },
})

export default WaitlistManager
