/**
 * Trainer Revenue Share Display
 * 
 * Shows what facility earns from trainer/instructor rentals.
 * Incentivizes facility partnership with trainers.
 */

import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"

type TrainerRental = {
    trainerId: string
    trainerName: string
    totalRevenue: number
    rentalsThisMonth: number
}

type Props = {
    totalThisMonth: number
    trainerRentals: TrainerRental[]
    lastMonthTotal?: number
    currency?: string
    onViewDetails?: () => void
}

export function TrainerRevenueShare({
    totalThisMonth,
    trainerRentals,
    lastMonthTotal = 0,
    currency = "$",
    onViewDetails
}: Props) {
    const topTrainers = trainerRentals.sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 3)
    const vsLastMonth = totalThisMonth - lastMonthTotal
    const isUp = vsLastMonth >= 0

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={["#F5970B20", "#0A0A0A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="people" size={20} color="#F59E0B" />
                        </View>
                        <View>
                            <Text style={styles.title}>Trainer Rentals</Text>
                            <Text style={styles.subtitle}>Revenue from studio/court rentals</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.totalRow}>
                    <View style={styles.amountContainer}>
                        <Text style={styles.currency}>{currency}</Text>
                        <Text style={styles.amount}>{totalThisMonth.toLocaleString()}</Text>
                    </View>
                    <View style={[styles.changeBadge, isUp ? styles.up : styles.down]}>
                        <Ionicons
                            name={isUp ? "arrow-up" : "arrow-down"}
                            size={12}
                            color={isUp ? "#22C55E" : "#EF4444"}
                        />
                        <Text style={[styles.changeValue, isUp ? styles.upText : styles.downText]}>
                            {currency}{Math.abs(vsLastMonth)}
                        </Text>
                    </View>
                </View>

                {/* Top Trainers */}
                {topTrainers.length > 0 && (
                    <View style={styles.topTrainers}>
                        <Text style={styles.topTrainersTitle}>Top Earning Trainers</Text>
                        {topTrainers.map((trainer, index) => (
                            <View key={trainer.trainerId} style={styles.trainerRow}>
                                <View style={styles.trainerLeft}>
                                    <View style={[styles.rankBadge, index === 0 && styles.goldRank]}>
                                        <Text style={styles.rankText}>{index + 1}</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.trainerName}>{trainer.trainerName}</Text>
                                        <Text style={styles.trainerSessions}>
                                            {trainer.rentalsThisMonth} rentals
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.trainerRevenue}>
                                    {currency}{trainer.totalRevenue}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {onViewDetails && (
                    <TouchableOpacity
                        style={styles.viewButton}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                            onViewDetails()
                        }}
                    >
                        <Text style={styles.viewButtonText}>View All Trainers</Text>
                        <Ionicons name="chevron-forward" size={14} color="#F59E0B" />
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
        borderColor: "#F59E0B30",
    },
    gradient: {
        padding: 16,
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
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#F59E0B20",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    title: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "700",
    },
    subtitle: {
        color: "#888",
        fontSize: 11,
        marginTop: 2,
    },
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    amountContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    currency: {
        color: "#F59E0B",
        fontSize: 18,
        fontWeight: "600",
        marginTop: 4,
    },
    amount: {
        color: "#FFF",
        fontSize: 32,
        fontWeight: "800",
    },
    changeBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
    },
    up: {
        backgroundColor: "#22C55E20",
    },
    down: {
        backgroundColor: "#EF444420",
    },
    changeValue: {
        fontSize: 12,
        fontWeight: "600",
    },
    upText: {
        color: "#22C55E",
    },
    downText: {
        color: "#EF4444",
    },
    topTrainers: {
        backgroundColor: "#0A0A0A",
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
    },
    topTrainersTitle: {
        color: "#888",
        fontSize: 11,
        fontWeight: "600",
        marginBottom: 10,
    },
    trainerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#1A1A1A",
    },
    trainerLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    rankBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#333",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },
    goldRank: {
        backgroundColor: "#F59E0B",
    },
    rankText: {
        color: "#FFF",
        fontSize: 11,
        fontWeight: "700",
    },
    trainerName: {
        color: "#FFF",
        fontSize: 13,
        fontWeight: "600",
    },
    trainerSessions: {
        color: "#666",
        fontSize: 10,
        marginTop: 1,
    },
    trainerRevenue: {
        color: "#F59E0B",
        fontSize: 14,
        fontWeight: "700",
    },
    viewButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
    },
    viewButtonText: {
        color: "#F59E0B",
        fontSize: 13,
        fontWeight: "600",
    },
})

export default TrainerRevenueShare
