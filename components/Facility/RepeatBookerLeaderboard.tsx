/**
 * Repeat Booker Leaderboard
 * 
 * Shows most loyal customers by booking frequency.
 * Helps identify VIPs for special treatment.
 */

import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"

type RepeatBooker = {
    customerId: string
    customerName: string
    totalBookings: number
    totalSpent: number
    averagePerMonth: number
    favoriteSlots: string[]
    memberSince: Date
}

type Props = {
    bookers: RepeatBooker[]
    onBookerPress: (customerId: string) => void
    onSendOffer: (customerId: string) => void
    currency?: string
}

export function RepeatBookerLeaderboard({ bookers, onBookerPress, onSendOffer, currency = "$" }: Props) {
    const topBookers = bookers.sort((a, b) => b.totalBookings - a.totalBookings).slice(0, 10)
    const totalVIPs = bookers.filter(b => b.totalBookings >= 10).length

    const getRankBadge = (index: number) => {
        if (index === 0) return { bg: "#FFD700", text: "👑" }
        if (index === 1) return { bg: "#C0C0C0", text: "🥈" }
        if (index === 2) return { bg: "#CD7F32", text: "🥉" }
        return { bg: "#333", text: `${index + 1}` }
    }

    const formatMemberSince = (date: Date) => {
        const months = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 30))
        if (months < 1) return "New member"
        if (months === 1) return "1 month"
        if (months < 12) return `${months} months`
        return `${Math.floor(months / 12)}+ years`
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Ionicons name="trophy" size={20} color="#FFD700" />
                    <Text style={styles.title}>Top Customers</Text>
                </View>
                <View style={styles.vipBadge}>
                    <Text style={styles.vipText}>{totalVIPs} VIPs</Text>
                </View>
            </View>

            {topBookers.slice(0, 5).map((booker, index) => {
                const rank = getRankBadge(index)

                return (
                    <TouchableOpacity
                        key={booker.customerId}
                        style={[styles.bookerCard, index === 0 && styles.topBookerCard]}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                            onBookerPress(booker.customerId)
                        }}
                    >
                        <View style={[styles.rankBadge, { backgroundColor: rank.bg }]}>
                            <Text style={styles.rankText}>{rank.text}</Text>
                        </View>

                        <View style={styles.bookerInfo}>
                            <Text style={styles.bookerName}>{booker.customerName}</Text>
                            <View style={styles.statsRow}>
                                <View style={styles.stat}>
                                    <Text style={styles.statValue}>{booker.totalBookings}</Text>
                                    <Text style={styles.statLabel}>bookings</Text>
                                </View>
                                <View style={styles.stat}>
                                    <Text style={styles.statValue}>
                                        {currency}{(booker.totalSpent / 100).toFixed(0)}
                                    </Text>
                                    <Text style={styles.statLabel}>spent</Text>
                                </View>
                            </View>
                            <Text style={styles.memberSince}>
                                Member for {formatMemberSince(booker.memberSince)}
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={styles.offerButton}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                                onSendOffer(booker.customerId)
                            }}
                        >
                            <Ionicons name="gift" size={16} color="#FFD700" />
                        </TouchableOpacity>
                    </TouchableOpacity>
                )
            })}

            {bookers.length > 5 && (
                <TouchableOpacity style={styles.viewAllButton}>
                    <Text style={styles.viewAllText}>View All ({bookers.length})</Text>
                    <Ionicons name="chevron-forward" size={14} color="#FFD700" />
                </TouchableOpacity>
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
        borderColor: "#FFD70030",
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
    vipBadge: {
        backgroundColor: "#FFD70020",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    vipText: {
        color: "#FFD700",
        fontSize: 11,
        fontWeight: "600",
    },
    bookerCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 14,
        padding: 12,
        marginBottom: 8,
    },
    topBookerCard: {
        backgroundColor: "#FFD70010",
        borderWidth: 1,
        borderColor: "#FFD70030",
    },
    rankBadge: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    rankText: {
        fontSize: 16,
    },
    bookerInfo: {
        flex: 1,
    },
    bookerName: {
        color: "#FFF",
        fontSize: 15,
        fontWeight: "600",
    },
    statsRow: {
        flexDirection: "row",
        gap: 16,
        marginTop: 4,
    },
    stat: {
        flexDirection: "row",
        alignItems: "baseline",
        gap: 4,
    },
    statValue: {
        color: "#FFD700",
        fontSize: 14,
        fontWeight: "700",
    },
    statLabel: {
        color: "#666",
        fontSize: 10,
    },
    memberSince: {
        color: "#555",
        fontSize: 10,
        marginTop: 4,
    },
    offerButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#FFD70020",
        alignItems: "center",
        justifyContent: "center",
    },
    viewAllButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        paddingVertical: 12,
    },
    viewAllText: {
        color: "#FFD700",
        fontSize: 13,
        fontWeight: "600",
    },
})

export default RepeatBookerLeaderboard
