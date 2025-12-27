/**
 * Share Open Slots
 * 
 * Share available booking slots to social media.
 * Generate FOMO and fill empty courts.
 */

import { View, Text, TouchableOpacity, StyleSheet, Share, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"

type OpenSlot = {
    courtName: string
    date: string
    time: string
}

type Props = {
    facilityName: string
    facilityId: string
    openSlots: OpenSlot[]
    onShared?: () => void
}

export function ShareOpenSlots({ facilityName, facilityId, openSlots, onShared }: Props) {
    const bookingLink = `https://goodrunss.app/book/${facilityId}`

    const getShareMessage = () => {
        if (openSlots.length === 0) {
            return `🎾 Book a court at ${facilityName}!\n\nEasy online booking available.\n\n${bookingLink}`
        }

        const slotsText = openSlots.slice(0, 4).map(s =>
            `• ${s.courtName} - ${s.date} at ${s.time}`
        ).join("\n")

        return `🎾 Open slots at ${facilityName}!\n\n${slotsText}\n\nBook now before they're gone! 🔥\n${bookingLink}`
    }

    const handleShare = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        try {
            const result = await Share.share({
                title: `Book at ${facilityName}`,
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

    if (openSlots.length === 0) {
        return (
            <TouchableOpacity style={styles.emptyCard} onPress={handleShare}>
                <Ionicons name="share-social" size={18} color="#666" />
                <Text style={styles.emptyText}>Share Booking Link</Text>
            </TouchableOpacity>
        )
    }

    return (
        <TouchableOpacity onPress={handleShare} activeOpacity={0.9}>
            <LinearGradient
                colors={["#7ED95730", "#0A0A0A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.container}
            >
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Ionicons name="megaphone" size={20} color="#7ED957" />
                        <Text style={styles.title}>Promote Open Slots</Text>
                    </View>
                    <View style={styles.countBadge}>
                        <Text style={styles.countText}>{openSlots.length} available</Text>
                    </View>
                </View>

                <View style={styles.slotsPreview}>
                    {openSlots.slice(0, 3).map((slot, i) => (
                        <View key={i} style={styles.slotChip}>
                            <Text style={styles.slotText}>{slot.courtName} • {slot.time}</Text>
                        </View>
                    ))}
                    {openSlots.length > 3 && (
                        <View style={styles.moreChip}>
                            <Text style={styles.moreText}>+{openSlots.length - 3} more</Text>
                        </View>
                    )}
                </View>

                <View style={styles.shareButtonContainer}>
                    <LinearGradient
                        colors={["#7ED957", "#22C55E"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.shareButton}
                    >
                        <Ionicons name="share-social" size={16} color="#000" />
                        <Text style={styles.shareText}>Share to Social</Text>
                    </LinearGradient>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#7ED95730",
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
        fontSize: 16,
        fontWeight: "700",
    },
    countBadge: {
        backgroundColor: "#7ED95720",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    countText: {
        color: "#7ED957",
        fontSize: 11,
        fontWeight: "600",
    },
    slotsPreview: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 14,
    },
    slotChip: {
        backgroundColor: "#1A1A1A",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
    },
    slotText: {
        color: "#888",
        fontSize: 11,
        fontWeight: "500",
    },
    moreChip: {
        backgroundColor: "#333",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
    },
    moreText: {
        color: "#666",
        fontSize: 11,
        fontWeight: "500",
    },
    shareButtonContainer: {
        borderRadius: 14,
        overflow: "hidden",
    },
    shareButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 14,
    },
    shareText: {
        color: "#000",
        fontSize: 15,
        fontWeight: "700",
    },
    emptyCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#141414",
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#333",
    },
    emptyText: {
        color: "#666",
        fontSize: 13,
        fontWeight: "500",
    },
})

export default ShareOpenSlots
