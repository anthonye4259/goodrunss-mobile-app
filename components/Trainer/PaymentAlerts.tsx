/**
 * Payment Pending Alerts
 * 
 * Shows outstanding invoices that need attention.
 * Quick actions to resend or mark as paid.
 */

import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"

type PendingPayment = {
    id: string
    clientName: string
    amount: number
    dueDate: Date
    daysPastDue: number
    invoiceNumber?: string
}

type Props = {
    payments: PendingPayment[]
    onSendReminder: (paymentId: string) => void
    onMarkPaid: (paymentId: string) => void
    onViewAll?: () => void
}

export function PaymentAlerts({ payments, onSendReminder, onMarkPaid, onViewAll }: Props) {
    if (payments.length === 0) {
        return (
            <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                    <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
                </View>
                <Text style={styles.emptyTitle}>All caught up!</Text>
                <Text style={styles.emptySubtitle}>No pending payments</Text>
            </View>
        )
    }

    const totalPending = payments.reduce((sum, p) => sum + p.amount, 0)
    const urgentCount = payments.filter(p => p.daysPastDue > 7).length

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={urgentCount > 0 ? ["#EF444420", "#0A0A0A"] : ["#F5970620", "#0A0A0A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={[styles.alertIcon, urgentCount > 0 && styles.alertIconUrgent]}>
                            <Ionicons
                                name="alert-circle"
                                size={18}
                                color={urgentCount > 0 ? "#EF4444" : "#F97316"}
                            />
                        </View>
                        <View>
                            <Text style={styles.title}>Pending Payments</Text>
                            <Text style={styles.subtitle}>
                                ${totalPending.toLocaleString()} outstanding
                            </Text>
                        </View>
                    </View>
                    {urgentCount > 0 && (
                        <View style={styles.urgentBadge}>
                            <Text style={styles.urgentText}>{urgentCount} overdue</Text>
                        </View>
                    )}
                </View>

                <View style={styles.paymentsList}>
                    {payments.slice(0, 3).map((payment) => (
                        <View key={payment.id} style={styles.paymentCard}>
                            <View style={styles.paymentInfo}>
                                <View style={styles.paymentHeader}>
                                    <Text style={styles.clientName}>{payment.clientName}</Text>
                                    <Text style={styles.amount}>${payment.amount}</Text>
                                </View>
                                <View style={styles.paymentMeta}>
                                    {payment.invoiceNumber && (
                                        <Text style={styles.invoiceNum}>#{payment.invoiceNumber}</Text>
                                    )}
                                    <Text style={[
                                        styles.dueStatus,
                                        payment.daysPastDue > 0 ? styles.overdue : styles.upcoming
                                    ]}>
                                        {payment.daysPastDue > 0
                                            ? `${payment.daysPastDue} days overdue`
                                            : `Due in ${Math.abs(payment.daysPastDue)} days`
                                        }
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.actionRow}>
                                <TouchableOpacity
                                    style={styles.reminderButton}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                        onSendReminder(payment.id)
                                    }}
                                >
                                    <Ionicons name="notifications-outline" size={14} color="#F97316" />
                                    <Text style={styles.reminderText}>Remind</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.paidButton}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                                        onMarkPaid(payment.id)
                                    }}
                                >
                                    <Ionicons name="checkmark" size={14} color="#22C55E" />
                                    <Text style={styles.paidText}>Mark Paid</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>

                {payments.length > 3 && onViewAll && (
                    <TouchableOpacity style={styles.viewAllButton} onPress={onViewAll}>
                        <Text style={styles.viewAllText}>View all {payments.length} invoices</Text>
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
    emptyState: {
        backgroundColor: "#141414",
        borderRadius: 20,
        padding: 24,
        alignItems: "center",
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#22C55E30",
    },
    emptyIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#22C55E20",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    emptyTitle: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "600",
    },
    emptySubtitle: {
        color: "#666",
        fontSize: 13,
        marginTop: 4,
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
    alertIconUrgent: {
        backgroundColor: "#EF444420",
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
    urgentBadge: {
        backgroundColor: "#EF4444",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    urgentText: {
        color: "#FFF",
        fontSize: 11,
        fontWeight: "700",
    },
    paymentsList: {
        gap: 8,
    },
    paymentCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 12,
    },
    paymentInfo: {
        marginBottom: 12,
    },
    paymentHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    clientName: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "600",
    },
    amount: {
        color: "#F97316",
        fontSize: 16,
        fontWeight: "700",
    },
    paymentMeta: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 4,
    },
    invoiceNum: {
        color: "#666",
        fontSize: 11,
    },
    dueStatus: {
        fontSize: 11,
        fontWeight: "500",
    },
    overdue: {
        color: "#EF4444",
    },
    upcoming: {
        color: "#888",
    },
    actionRow: {
        flexDirection: "row",
        gap: 8,
    },
    reminderButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        backgroundColor: "#F9731620",
        paddingVertical: 10,
        borderRadius: 10,
    },
    reminderText: {
        color: "#F97316",
        fontSize: 12,
        fontWeight: "600",
    },
    paidButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        backgroundColor: "#22C55E20",
        paddingVertical: 10,
        borderRadius: 10,
    },
    paidText: {
        color: "#22C55E",
        fontSize: 12,
        fontWeight: "600",
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

export default PaymentAlerts
