/**
 * Maintenance Due Indicator
 * 
 * Shows courts/spaces that need attention.
 * Color-coded urgency.
 */

import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"

type MaintenanceItem = {
    courtId: string
    courtName: string
    dueType: "cleaning" | "inspection" | "repair"
    dueDate: Date
    overdue: boolean
}

type Props = {
    items: MaintenanceItem[]
    onItemPress: (courtId: string) => void
    variant?: "compact" | "full"
}

export function MaintenanceDueIndicator({ items, onItemPress, variant = "compact" }: Props) {
    const overdueCount = items.filter(i => i.overdue).length
    const dueToday = items.filter(i => {
        const today = new Date().toDateString()
        return i.dueDate.toDateString() === today && !i.overdue
    })

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "cleaning": return "sparkles"
            case "inspection": return "search"
            case "repair": return "construct"
            default: return "alert"
        }
    }

    const getTypeLabel = (type: string) => {
        switch (type) {
            case "cleaning": return "Clean"
            case "inspection": return "Inspect"
            case "repair": return "Repair"
            default: return "Check"
        }
    }

    if (items.length === 0) {
        if (variant === "compact") return null

        return (
            <View style={styles.allClearCard}>
                <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                <Text style={styles.allClearText}>All courts up to date!</Text>
            </View>
        )
    }

    if (variant === "compact") {
        return (
            <TouchableOpacity
                style={[styles.compactBadge, overdueCount > 0 && styles.compactBadgeUrgent]}
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    if (items[0]) onItemPress(items[0].courtId)
                }}
            >
                <Ionicons
                    name={overdueCount > 0 ? "warning" : "construct"}
                    size={14}
                    color={overdueCount > 0 ? "#EF4444" : "#F59E0B"}
                />
                <Text style={[
                    styles.compactText,
                    overdueCount > 0 && styles.compactTextUrgent,
                ]}>
                    {overdueCount > 0
                        ? `${overdueCount} overdue`
                        : `${items.length} due`
                    }
                </Text>
            </TouchableOpacity>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Ionicons name="construct" size={18} color="#F59E0B" />
                    <Text style={styles.title}>Maintenance Due</Text>
                </View>
                {overdueCount > 0 && (
                    <View style={styles.overdueBadge}>
                        <Text style={styles.overdueText}>{overdueCount} overdue</Text>
                    </View>
                )}
            </View>

            {items.slice(0, 4).map((item) => (
                <TouchableOpacity
                    key={item.courtId}
                    style={[styles.itemCard, item.overdue && styles.itemOverdue]}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                        onItemPress(item.courtId)
                    }}
                >
                    <View style={[styles.typeIcon, item.overdue && styles.typeIconOverdue]}>
                        <Ionicons
                            name={getTypeIcon(item.dueType) as any}
                            size={14}
                            color={item.overdue ? "#EF4444" : "#F59E0B"}
                        />
                    </View>
                    <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{item.courtName}</Text>
                        <Text style={[styles.itemType, item.overdue && styles.itemTypeOverdue]}>
                            {getTypeLabel(item.dueType)}
                            {item.overdue && " • OVERDUE"}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#555" />
                </TouchableOpacity>
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    compactBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "#F59E0B20",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
    },
    compactBadgeUrgent: {
        backgroundColor: "#EF444420",
    },
    compactText: {
        color: "#F59E0B",
        fontSize: 11,
        fontWeight: "600",
    },
    compactTextUrgent: {
        color: "#EF4444",
    },
    allClearCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#22C55E10",
        borderRadius: 12,
        padding: 14,
    },
    allClearText: {
        color: "#22C55E",
        fontSize: 13,
        fontWeight: "600",
    },
    container: {
        backgroundColor: "#141414",
        borderRadius: 16,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#F59E0B30",
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
        gap: 8,
    },
    title: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "700",
    },
    overdueBadge: {
        backgroundColor: "#EF4444",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    overdueText: {
        color: "#FFF",
        fontSize: 10,
        fontWeight: "700",
    },
    itemCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 12,
        marginBottom: 6,
    },
    itemOverdue: {
        backgroundColor: "#EF444410",
        borderWidth: 1,
        borderColor: "#EF444430",
    },
    typeIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: "#F59E0B20",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },
    typeIconOverdue: {
        backgroundColor: "#EF444420",
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        color: "#FFF",
        fontSize: 13,
        fontWeight: "600",
    },
    itemType: {
        color: "#F59E0B",
        fontSize: 10,
        marginTop: 2,
    },
    itemTypeOverdue: {
        color: "#EF4444",
        fontWeight: "600",
    },
})

export default MaintenanceDueIndicator
