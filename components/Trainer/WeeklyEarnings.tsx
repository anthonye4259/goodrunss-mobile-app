/**
 * Weekly Earnings Widget
 * 
 * Shows earnings summary for the current/previous week.
 * Prominent display on trainer dashboard.
 */

import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"

type Props = {
    currentWeek: number
    previousWeek: number
    sessionsThisWeek: number
    onPress?: () => void
}

export function WeeklyEarnings({ currentWeek, previousWeek, sessionsThisWeek, onPress }: Props) {
    const difference = currentWeek - previousWeek
    const percentChange = previousWeek > 0 ? Math.round((difference / previousWeek) * 100) : 0
    const isUp = difference >= 0

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                onPress?.()
            }}
            activeOpacity={0.9}
        >
            <LinearGradient
                colors={["#22C55E15", "#0A0A0A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="wallet" size={20} color="#22C55E" />
                        </View>
                        <Text style={styles.title}>This Week</Text>
                    </View>
                    <View style={[styles.changeBadge, isUp ? styles.badgeUp : styles.badgeDown]}>
                        <Ionicons
                            name={isUp ? "arrow-up" : "arrow-down"}
                            size={12}
                            color={isUp ? "#22C55E" : "#EF4444"}
                        />
                        <Text style={[styles.changeText, isUp ? styles.textUp : styles.textDown]}>
                            {Math.abs(percentChange)}%
                        </Text>
                    </View>
                </View>

                <View style={styles.amountRow}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <Text style={styles.amount}>{currentWeek.toLocaleString()}</Text>
                </View>

                <View style={styles.footer}>
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>{sessionsThisWeek}</Text>
                        <Text style={styles.statLabel}>Sessions</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>${Math.round(currentWeek / Math.max(sessionsThisWeek, 1))}</Text>
                        <Text style={styles.statLabel}>Avg/Session</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.stat}>
                        <Text style={[styles.statValue, isUp ? styles.textUp : styles.textDown]}>
                            {isUp ? "+" : ""}{difference >= 0 ? `$${difference}` : `-$${Math.abs(difference)}`}
                        </Text>
                        <Text style={styles.statLabel}>vs Last Week</Text>
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        overflow: "hidden",
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#22C55E30",
    },
    gradient: {
        padding: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: "#22C55E20",
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        color: "#888",
        fontSize: 14,
        fontWeight: "500",
    },
    changeBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    badgeUp: {
        backgroundColor: "#22C55E20",
    },
    badgeDown: {
        backgroundColor: "#EF444420",
    },
    changeText: {
        fontSize: 13,
        fontWeight: "700",
    },
    textUp: {
        color: "#22C55E",
    },
    textDown: {
        color: "#EF4444",
    },
    amountRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 20,
    },
    currencySymbol: {
        color: "#22C55E",
        fontSize: 24,
        fontWeight: "600",
        marginTop: 4,
        marginRight: 4,
    },
    amount: {
        color: "#FFF",
        fontSize: 48,
        fontWeight: "800",
    },
    footer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.3)",
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    stat: {
        flex: 1,
        alignItems: "center",
    },
    statValue: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "700",
    },
    statLabel: {
        color: "#666",
        fontSize: 10,
        marginTop: 2,
    },
    divider: {
        width: 1,
        height: 24,
        backgroundColor: "#333",
    },
})

export default WeeklyEarnings
