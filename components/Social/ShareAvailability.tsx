/**
 * Share Availability (Trainer)
 * 
 * Promote open slots on social media.
 * "I have openings this week! Book now"
 */

import { View, Text, TouchableOpacity, StyleSheet, Share, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"

type TimeSlot = {
    day: string  // "Monday", "Tuesday"
    time: string // "9:00 AM", "2:00 PM"
}

type Props = {
    trainerId: string
    trainerName: string
    availableSlots: TimeSlot[]
    specialty?: string
    onShared?: () => void
}

export function ShareAvailability({ trainerId, trainerName, availableSlots, specialty, onShared }: Props) {
    const bookingLink = `https://goodrunss.app/book/${trainerId}`

    const getShareMessage = () => {
        const specialtyText = specialty ? `${specialty} ` : ""

        if (availableSlots.length === 0) {
            return `📅 Looking to book a ${specialtyText}training session? DM me for availability!\n\n${bookingLink}`
        }

        const slotsText = availableSlots.slice(0, 5).map(s => `• ${s.day} @ ${s.time}`).join("\n")

        return `📅 I have ${specialtyText}training spots open this week!\n\n${slotsText}\n\nBook your session: ${bookingLink}`
    }

    const handleShare = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        try {
            const result = await Share.share({
                title: `Train with ${trainerName}`,
                message: getShareMessage(),
                url: bookingLink,
            })

            if (result.action === Share.sharedAction) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                onShared?.()
            }
        } catch (error) {
            Alert.alert("Error", "Failed to share")
        }
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={["#3B82F620", "#0A0A0A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="calendar" size={20} color="#3B82F6" />
                    </View>
                    <View style={styles.headerText}>
                        <Text style={styles.title}>Promote Open Slots</Text>
                        <Text style={styles.subtitle}>
                            {availableSlots.length} slots available
                        </Text>
                    </View>
                </View>

                {availableSlots.length > 0 && (
                    <View style={styles.slotsPreview}>
                        {availableSlots.slice(0, 3).map((slot, i) => (
                            <View key={i} style={styles.slotBadge}>
                                <Text style={styles.slotText}>{slot.day} {slot.time}</Text>
                            </View>
                        ))}
                        {availableSlots.length > 3 && (
                            <View style={styles.moreBadge}>
                                <Text style={styles.moreText}>+{availableSlots.length - 3}</Text>
                            </View>
                        )}
                    </View>
                )}

                <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                    <Ionicons name="megaphone" size={16} color="#000" />
                    <Text style={styles.shareText}>Share to Socials</Text>
                </TouchableOpacity>
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
        borderColor: "#3B82F630",
    },
    gradient: {
        padding: 16,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 14,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: "#3B82F620",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    headerText: {
        flex: 1,
    },
    title: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "700",
    },
    subtitle: {
        color: "#3B82F6",
        fontSize: 13,
        marginTop: 2,
    },
    slotsPreview: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 14,
    },
    slotBadge: {
        backgroundColor: "#3B82F620",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
    },
    slotText: {
        color: "#3B82F6",
        fontSize: 11,
        fontWeight: "600",
    },
    moreBadge: {
        backgroundColor: "#333",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
    },
    moreText: {
        color: "#888",
        fontSize: 11,
        fontWeight: "600",
    },
    shareButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#3B82F6",
        paddingVertical: 12,
        borderRadius: 14,
    },
    shareText: {
        color: "#000",
        fontSize: 14,
        fontWeight: "700",
    },
})

export default ShareAvailability
