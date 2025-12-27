/**
 * Cancellation Alerts
 * 
 * Real-time alerts for cancelled bookings.
 * Quickly notify waitlist or promote open slots.
 */

import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native"
import { useRef, useEffect } from "react"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"

type Cancellation = {
    id: string
    courtName: string
    date: string
    time: string
    customerName: string
    cancelledAt: Date
    refundAmount?: number
    waitlistCount: number
}

type Props = {
    cancellations: Cancellation[]
    onNotifyWaitlist: (cancellationId: string) => void
    onPromoteSlot: (cancellationId: string) => void
    onDismiss: (cancellationId: string) => void
}

export function CancellationAlerts({ cancellations, onNotifyWaitlist, onPromoteSlot, onDismiss }: Props) {
    if (cancellations.length === 0) return null

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.alertPulse}>
                        <Ionicons name="alert-circle" size={20} color="#F59E0B" />
                    </View>
                    <Text style={styles.title}>Recent Cancellations</Text>
                </View>
                <View style={styles.countBadge}>
                    <Text style={styles.countText}>{cancellations.length}</Text>
                </View>
            </View>

            {cancellations.map((cancellation, index) => (
                <CancellationCard
                    key={cancellation.id}
                    cancellation={cancellation}
                    onNotifyWaitlist={() => onNotifyWaitlist(cancellation.id)}
                    onPromoteSlot={() => onPromoteSlot(cancellation.id)}
                    onDismiss={() => onDismiss(cancellation.id)}
                    isNew={index === 0}
                />
            ))}
        </View>
    )
}

function CancellationCard({
    cancellation,
    onNotifyWaitlist,
    onPromoteSlot,
    onDismiss,
    isNew
}: {
    cancellation: Cancellation
    onNotifyWaitlist: () => void
    onPromoteSlot: () => void
    onDismiss: () => void
    isNew: boolean
}) {
    const pulseAnim = useRef(new Animated.Value(1)).current

    useEffect(() => {
        if (isNew) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.02,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                ])
            ).start()
        }
    }, [isNew])

    const formatTime = (date: Date) => {
        const now = new Date()
        const diff = Math.floor((now.getTime() - date.getTime()) / 60000)
        if (diff < 1) return "Just now"
        if (diff < 60) return `${diff}m ago`
        return `${Math.floor(diff / 60)}h ago`
    }

    return (
        <Animated.View
            style={[
                styles.card,
                isNew && styles.cardNew,
                { transform: [{ scale: isNew ? pulseAnim : 1 }] }
            ]}
        >
            <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                    <Text style={styles.courtName}>{cancellation.courtName}</Text>
                    <View style={styles.timeRow}>
                        <Ionicons name="calendar" size={12} color="#666" />
                        <Text style={styles.dateTime}>
                            {cancellation.date} at {cancellation.time}
                        </Text>
                    </View>
                    <Text style={styles.cancelledBy}>
                        Cancelled by {cancellation.customerName} • {formatTime(cancellation.cancelledAt)}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.dismissButton}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                        onDismiss()
                    }}
                >
                    <Ionicons name="close" size={18} color="#666" />
                </TouchableOpacity>
            </View>

            <View style={styles.actions}>
                {cancellation.waitlistCount > 0 ? (
                    <TouchableOpacity
                        style={styles.primaryAction}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                            onNotifyWaitlist()
                        }}
                    >
                        <Ionicons name="notifications" size={14} color="#000" />
                        <Text style={styles.primaryActionText}>
                            Notify Waitlist ({cancellation.waitlistCount})
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.secondaryAction}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                            onPromoteSlot()
                        }}
                    >
                        <Ionicons name="megaphone" size={14} color="#F59E0B" />
                        <Text style={styles.secondaryActionText}>Promote Open Slot</Text>
                    </TouchableOpacity>
                )}
            </View>

            {cancellation.refundAmount && cancellation.refundAmount > 0 && (
                <View style={styles.refundNote}>
                    <Ionicons name="card" size={12} color="#888" />
                    <Text style={styles.refundText}>
                        ${cancellation.refundAmount} refunded
                    </Text>
                </View>
            )}
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#141414",
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#F59E0B40",
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
    alertPulse: {
        padding: 4,
    },
    title: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "700",
    },
    countBadge: {
        backgroundColor: "#F59E0B",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    countText: {
        color: "#000",
        fontSize: 13,
        fontWeight: "700",
    },
    card: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 14,
        marginBottom: 8,
    },
    cardNew: {
        backgroundColor: "#F59E0B10",
        borderWidth: 1,
        borderColor: "#F59E0B40",
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    cardInfo: {
        flex: 1,
    },
    courtName: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "700",
    },
    timeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 4,
    },
    dateTime: {
        color: "#F59E0B",
        fontSize: 13,
        fontWeight: "600",
    },
    cancelledBy: {
        color: "#666",
        fontSize: 11,
        marginTop: 4,
    },
    dismissButton: {
        padding: 4,
    },
    actions: {
        marginTop: 12,
    },
    primaryAction: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        backgroundColor: "#F59E0B",
        paddingVertical: 12,
        borderRadius: 12,
    },
    primaryActionText: {
        color: "#000",
        fontSize: 14,
        fontWeight: "700",
    },
    secondaryAction: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        backgroundColor: "#F59E0B20",
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#F59E0B40",
    },
    secondaryActionText: {
        color: "#F59E0B",
        fontSize: 14,
        fontWeight: "600",
    },
    refundNote: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: "#252525",
    },
    refundText: {
        color: "#888",
        fontSize: 11,
    },
})

export default CancellationAlerts
