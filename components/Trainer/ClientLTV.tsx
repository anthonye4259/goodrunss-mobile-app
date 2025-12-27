/**
 * Client Lifetime Value (LTV)
 * 
 * Shows most valuable clients by total revenue.
 * Helps trainers identify and retain top clients.
 */

import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"

type Client = {
    id: string
    name: string
    totalRevenue: number
    sessionsCount: number
    monthsActive: number
    lastSession?: Date
}

type Props = {
    clients: Client[]
    onClientPress?: (clientId: string) => void
}

export function ClientLTV({ clients, onClientPress }: Props) {
    // Sort by LTV (total revenue)
    const sortedClients = [...clients].sort((a, b) => b.totalRevenue - a.totalRevenue)
    const topClients = sortedClients.slice(0, 5)
    const totalLTV = clients.reduce((sum, c) => sum + c.totalRevenue, 0)

    const getRank = (index: number) => {
        if (index === 0) return { icon: "trophy", color: "#FFD700" }
        if (index === 1) return { icon: "medal", color: "#C0C0C0" }
        if (index === 2) return { icon: "medal", color: "#CD7F32" }
        return { icon: "star", color: "#666" }
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Ionicons name="diamond" size={18} color="#FBBF24" />
                    <Text style={styles.title}>Top Clients by Value</Text>
                </View>
                <View style={styles.totalBadge}>
                    <Text style={styles.totalText}>${(totalLTV / 1000).toFixed(1)}k total</Text>
                </View>
            </View>

            <View style={styles.clientsList}>
                {topClients.map((client, index) => {
                    const rank = getRank(index)
                    return (
                        <TouchableOpacity
                            key={client.id}
                            style={styles.clientRow}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                onClientPress?.(client.id)
                            }}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.rankBadge, { backgroundColor: rank.color + "20" }]}>
                                <Ionicons name={rank.icon as any} size={14} color={rank.color} />
                            </View>

                            <View style={styles.clientInfo}>
                                <Text style={styles.clientName}>{client.name}</Text>
                                <Text style={styles.clientMeta}>
                                    {client.sessionsCount} sessions • {client.monthsActive} months
                                </Text>
                            </View>

                            <View style={styles.revenueInfo}>
                                <Text style={styles.revenueAmount}>${client.totalRevenue.toLocaleString()}</Text>
                                <Text style={styles.revenueAvg}>
                                    ${Math.round(client.totalRevenue / client.sessionsCount)}/session
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )
                })}
            </View>

            {clients.length > 5 && (
                <TouchableOpacity style={styles.viewAllButton}>
                    <Text style={styles.viewAllText}>View all {clients.length} clients</Text>
                    <Ionicons name="chevron-forward" size={14} color="#FBBF24" />
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
        borderColor: "#FBBF2420",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
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
    totalBadge: {
        backgroundColor: "#FBBF2420",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    totalText: {
        color: "#FBBF24",
        fontSize: 11,
        fontWeight: "600",
    },
    clientsList: {
        gap: 8,
    },
    clientRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 12,
    },
    rankBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    clientInfo: {
        flex: 1,
    },
    clientName: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "600",
    },
    clientMeta: {
        color: "#666",
        fontSize: 11,
        marginTop: 2,
    },
    revenueInfo: {
        alignItems: "flex-end",
    },
    revenueAmount: {
        color: "#22C55E",
        fontSize: 16,
        fontWeight: "700",
    },
    revenueAvg: {
        color: "#666",
        fontSize: 10,
        marginTop: 2,
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
        color: "#FBBF24",
        fontSize: 13,
        fontWeight: "500",
    },
})

export default ClientLTV
