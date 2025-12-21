/**
 * ShareButton - One-tap share to invite
 * 
 * "Going to play, who's in?"
 */

import React, { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { shareVenue, shareQuickInvite } from "@/lib/services/share-invite-service"

interface ShareButtonProps {
    venueId: string
    venueName: string
    sport: string
    userId: string
    userName: string
    variant?: "icon" | "full" | "fab"
}

export function ShareButton({
    venueId,
    venueName,
    sport,
    userId,
    userName,
    variant = "icon",
}: ShareButtonProps) {
    const [showOptions, setShowOptions] = useState(false)

    const handleShare = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        await shareVenue(venueId, venueName)
    }

    const handleInvite = async () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        setShowOptions(false)
        await shareQuickInvite(venueId, venueName, sport, userId, userName)
    }

    if (variant === "icon") {
        return (
            <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
                <Ionicons name="share-outline" size={22} color="#fff" />
            </TouchableOpacity>
        )
    }

    if (variant === "fab") {
        return (
            <>
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => setShowOptions(true)}
                    activeOpacity={0.8}
                >
                    <Ionicons name="add" size={28} color="#000" />
                </TouchableOpacity>

                <Modal
                    visible={showOptions}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowOptions(false)}
                >
                    <TouchableOpacity
                        style={styles.overlay}
                        activeOpacity={1}
                        onPress={() => setShowOptions(false)}
                    >
                        <View style={styles.optionsCard}>
                            <TouchableOpacity
                                style={styles.option}
                                onPress={handleInvite}
                            >
                                <Ionicons name="people-outline" size={22} color="#fff" />
                                <View style={styles.optionContent}>
                                    <Text style={styles.optionTitle}>Invite to play</Text>
                                    <Text style={styles.optionSub}>Who's in?</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.option}
                                onPress={handleShare}
                            >
                                <Ionicons name="share-outline" size={22} color="#fff" />
                                <View style={styles.optionContent}>
                                    <Text style={styles.optionTitle}>Share court</Text>
                                    <Text style={styles.optionSub}>Send location</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Modal>
            </>
        )
    }

    // Full variant
    return (
        <TouchableOpacity
            style={styles.fullButton}
            onPress={handleInvite}
            activeOpacity={0.8}
        >
            <Ionicons name="people-outline" size={20} color="#000" />
            <Text style={styles.fullText}>Invite friends</Text>
        </TouchableOpacity>
    )
}

/**
 * Inline invite bar for venue detail
 */
export function InviteBar({
    venueId,
    venueName,
    sport,
    userId,
    userName,
}: {
    venueId: string
    venueName: string
    sport: string
    userId: string
    userName: string
}) {
    const handleInvite = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        await shareQuickInvite(venueId, venueName, sport, userId, userName)
    }

    return (
        <TouchableOpacity
            style={styles.inviteBar}
            onPress={handleInvite}
            activeOpacity={0.8}
        >
            <Text style={styles.inviteBarText}>Going to play?</Text>
            <View style={styles.inviteBarAction}>
                <Text style={styles.inviteBarCTA}>Invite</Text>
                <Ionicons name="arrow-forward" size={16} color="#8B5CF6" />
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    iconButton: {
        padding: 10,
    },
    fab: {
        position: "absolute",
        bottom: 100,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "flex-end",
        paddingBottom: 120,
        paddingHorizontal: 20,
    },
    optionsCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 8,
    },
    option: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        gap: 16,
    },
    optionContent: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
    optionSub: {
        fontSize: 13,
        color: "#6B7280",
    },
    fullButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#fff",
        paddingVertical: 14,
        borderRadius: 12,
    },
    fullText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#000",
    },
    inviteBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#1A1A1A",
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
    },
    inviteBarText: {
        fontSize: 15,
        color: "#D1D5DB",
    },
    inviteBarAction: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    inviteBarCTA: {
        fontSize: 15,
        fontWeight: "600",
        color: "#8B5CF6",
    },
})
