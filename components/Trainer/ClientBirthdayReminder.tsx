/**
 * Client Birthday Reminder
 * 
 * Shows upcoming client birthdays.
 * Helps build personal relationships.
 */

import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"

type Birthday = {
    clientId: string
    clientName: string
    birthday: Date
    daysUntil: number
}

type Props = {
    birthdays: Birthday[]
    onSendWishes: (clientId: string) => void
    onDismiss?: (clientId: string) => void
}

export function ClientBirthdayReminder({ birthdays, onSendWishes, onDismiss }: Props) {
    // Only show birthdays within 7 days
    const upcomingBirthdays = birthdays.filter(b => b.daysUntil <= 7 && b.daysUntil >= 0)

    if (upcomingBirthdays.length === 0) return null

    const getTimeLabel = (days: number) => {
        if (days === 0) return "Today! 🎂"
        if (days === 1) return "Tomorrow"
        return `In ${days} days`
    }

    const getBgColors = (days: number): [string, string] => {
        if (days === 0) return ["#8B5CF640", "#8B5CF610"]
        if (days <= 2) return ["#F9731630", "#F9731605"]
        return ["#14141400", "#14141400"]
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <Text style={styles.icon}>🎂</Text>
                </View>
                <Text style={styles.title}>Upcoming Birthdays</Text>
            </View>

            <View style={styles.birthdaysList}>
                {upcomingBirthdays.map((birthday) => (
                    <LinearGradient
                        key={birthday.clientId}
                        colors={getBgColors(birthday.daysUntil)}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.birthdayCard}
                    >
                        <View style={styles.birthdayInfo}>
                            <Text style={styles.clientName}>{birthday.clientName}</Text>
                            <Text style={[
                                styles.daysLabel,
                                birthday.daysUntil === 0 && styles.daysLabelToday
                            ]}>
                                {getTimeLabel(birthday.daysUntil)}
                            </Text>
                        </View>

                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={styles.wishButton}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                                    onSendWishes(birthday.clientId)
                                }}
                            >
                                <Ionicons name="gift" size={14} color="#000" />
                                <Text style={styles.wishText}>Send Wishes</Text>
                            </TouchableOpacity>

                            {onDismiss && (
                                <TouchableOpacity
                                    style={styles.dismissButton}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                        onDismiss(birthday.clientId)
                                    }}
                                >
                                    <Ionicons name="close" size={16} color="#666" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </LinearGradient>
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
        borderColor: "#8B5CF620",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 12,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: "#8B5CF620",
        alignItems: "center",
        justifyContent: "center",
    },
    icon: {
        fontSize: 16,
    },
    title: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "700",
    },
    birthdaysList: {
        gap: 8,
    },
    birthdayCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 12,
        borderRadius: 12,
        backgroundColor: "#1A1A1A",
    },
    birthdayInfo: {
        flex: 1,
    },
    clientName: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "600",
    },
    daysLabel: {
        color: "#888",
        fontSize: 12,
        marginTop: 2,
    },
    daysLabelToday: {
        color: "#8B5CF6",
        fontWeight: "600",
    },
    actions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    wishButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "#8B5CF6",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
    },
    wishText: {
        color: "#000",
        fontSize: 12,
        fontWeight: "600",
    },
    dismissButton: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: "#252525",
        alignItems: "center",
        justifyContent: "center",
    },
})

export default ClientBirthdayReminder
