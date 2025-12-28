/**
 * PlayRequest Component
 * 
 * SOS / Match Request feature - let players request matches from:
 * - Community (broadcast to all nearby)
 * - Friends (specific people)
 * - SMS (non-app users via native Share)
 */

import React, { useState } from "react"
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Share,
    Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"
import { BlurView } from "expo-blur"

interface PlayRequestProps {
    sport: string
    visible: boolean
    onClose: () => void
    location?: string
}

const SPORT_CONFIG: Record<string, { emoji: string; term: string }> = {
    Basketball: { emoji: "🏀", term: "game" },
    Tennis: { emoji: "🎾", term: "match" },
    Pickleball: { emoji: "🏓", term: "game" },
    Soccer: { emoji: "⚽", term: "match" },
    Volleyball: { emoji: "🏐", term: "game" },
    Golf: { emoji: "⛳", term: "round" },
}

export function PlayRequestModal({ sport, visible, onClose, location }: PlayRequestProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)

    const config = SPORT_CONFIG[sport] || SPORT_CONFIG["Basketball"]

    const handleCommunityBroadcast = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        setIsSubmitting(true)

        // Simulate broadcast to community
        setTimeout(() => {
            setSuccess(true)
            setIsSubmitting(false)
            setTimeout(() => {
                setSuccess(false)
                onClose()
            }, 1500)
        }, 800)
    }

    const handleFriendInvite = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        Alert.alert(
            "Invite Friends",
            "Select friends from your list to invite to this match.",
            [{ text: "OK", onPress: () => { } }]
        )
    }

    const handleSMSShare = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

        const message = `${config.emoji} Need players for a ${sport} ${config.term}! ${location ? `Location: ${location}` : "Hit me up if you're free!"
            } - Sent via GoodRunss`

        try {
            await Share.share({
                message,
                title: `${sport} ${config.term.charAt(0).toUpperCase() + config.term.slice(1)} Request`,
            })
        } catch (error) {
            console.error("Share error:", error)
        }
    }

    if (!visible) return null

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <BlurView intensity={20} style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {success ? (
                        <View style={styles.successState}>
                            <Text style={styles.successEmoji}>🎉</Text>
                            <Text style={styles.successText}>Request Sent!</Text>
                            <Text style={styles.successSubtext}>Players nearby will see your request</Text>
                        </View>
                    ) : (
                        <>
                            {/* Header */}
                            <View style={styles.header}>
                                <View style={styles.headerLeft}>
                                    <Text style={styles.headerEmoji}>{config.emoji}</Text>
                                    <Text style={styles.headerTitle}>Find Players</Text>
                                </View>
                                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                    <Ionicons name="close" size={24} color="#6B7280" />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.subtitle}>
                                Looking for a {sport.toLowerCase()} {config.term}?
                            </Text>

                            {/* Options */}
                            <View style={styles.optionsContainer}>
                                {/* SOS Community Broadcast */}
                                <TouchableOpacity style={styles.optionCard} onPress={handleCommunityBroadcast}>
                                    <LinearGradient
                                        colors={["#EF4444", "#DC2626"]}
                                        style={styles.optionGradient}
                                    >
                                        <Ionicons name="radio" size={24} color="#FFF" />
                                        <View style={styles.optionText}>
                                            <Text style={styles.optionTitle}>🚨 SOS Broadcast</Text>
                                            <Text style={styles.optionDesc}>Alert nearby players</Text>
                                        </View>
                                    </LinearGradient>
                                </TouchableOpacity>

                                {/* Invite Friends */}
                                <TouchableOpacity style={styles.optionCard} onPress={handleFriendInvite}>
                                    <View style={[styles.optionGradient, { backgroundColor: "#1E40AF" }]}>
                                        <Ionicons name="people" size={24} color="#FFF" />
                                        <View style={styles.optionText}>
                                            <Text style={styles.optionTitle}>👥 Invite Friends</Text>
                                            <Text style={styles.optionDesc}>Pick from your list</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>

                                {/* SMS Share */}
                                <TouchableOpacity style={styles.optionCard} onPress={handleSMSShare}>
                                    <View style={[styles.optionGradient, { backgroundColor: "#059669" }]}>
                                        <Ionicons name="chatbubble-ellipses" size={24} color="#FFF" />
                                        <View style={styles.optionText}>
                                            <Text style={styles.optionTitle}>📱 Text/Share</Text>
                                            <Text style={styles.optionDesc}>Invite non-app users</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </BlurView>
        </Modal>
    )
}

/**
 * Compact trigger button for home screen
 */
export function PlayRequestButton({ sport, onPress }: { sport: string; onPress: () => void }) {
    const config = SPORT_CONFIG[sport] || SPORT_CONFIG["Basketball"]

    return (
        <TouchableOpacity style={styles.triggerButton} onPress={onPress}>
            <LinearGradient colors={["#EF4444", "#DC2626"]} style={styles.triggerGradient}>
                <Ionicons name="radio" size={18} color="#FFF" />
                <Text style={styles.triggerText}>Need Players</Text>
            </LinearGradient>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#1A1A2E",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    headerEmoji: {
        fontSize: 24,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#FFF",
    },
    closeBtn: {
        padding: 4,
    },
    subtitle: {
        fontSize: 14,
        color: "#9CA3AF",
        marginBottom: 20,
    },
    optionsContainer: {
        gap: 12,
    },
    optionCard: {
        borderRadius: 16,
        overflow: "hidden",
    },
    optionGradient: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        gap: 14,
    },
    optionText: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#FFF",
    },
    optionDesc: {
        fontSize: 12,
        color: "rgba(255,255,255,0.7)",
        marginTop: 2,
    },
    successState: {
        alignItems: "center",
        padding: 24,
    },
    successEmoji: {
        fontSize: 48,
        marginBottom: 12,
    },
    successText: {
        fontSize: 20,
        fontWeight: "700",
        color: "#FFF",
    },
    successSubtext: {
        fontSize: 14,
        color: "#9CA3AF",
        marginTop: 4,
    },

    // Trigger Button
    triggerButton: {
        borderRadius: 16,
        overflow: "hidden",
    },
    triggerGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 14,
        paddingHorizontal: 20,
    },
    triggerText: {
        fontSize: 15,
        fontWeight: "700",
        color: "#FFF",
    },
})

export default PlayRequestModal
