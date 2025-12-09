/**
 * Waitlist Button Component
 * 
 * Smart button for joining wellness class waitlists:
 * - Shows position if on waitlist
 * - Auto-book toggle
 * - Flash booking claim button
 * - Animated state changes
 */

import React, { useState } from "react"
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Animated,
    Modal,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { useWaitlist } from "@/lib/hooks/useWaitlist"

interface WaitlistButtonProps {
    classId: string
    isPro?: boolean
    size?: "small" | "medium" | "large"
    showPosition?: boolean
}

export function WaitlistButton({
    classId,
    isPro = false,
    size = "medium",
    showPosition = true,
}: WaitlistButtonProps) {
    const { isOnWaitlist, position, isLoading, joinResult, join, leave, claim } = useWaitlist(classId, isPro)
    const [showAutoBookModal, setShowAutoBookModal] = useState(false)
    const [autoBookChoice, setAutoBookChoice] = useState(true)
    const scaleAnim = React.useRef(new Animated.Value(1)).current

    const handlePress = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        // Animate
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start()

        if (isOnWaitlist) {
            await leave()
        } else {
            setShowAutoBookModal(true)
        }
    }

    const handleJoinConfirm = async () => {
        setShowAutoBookModal(false)
        await join(autoBookChoice)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    }

    const sizeStyles = {
        small: { paddingHorizontal: 12, paddingVertical: 8, fontSize: 12 },
        medium: { paddingHorizontal: 16, paddingVertical: 10, fontSize: 14 },
        large: { paddingHorizontal: 20, paddingVertical: 14, fontSize: 16 },
    }

    const s = sizeStyles[size]

    if (isLoading) {
        return (
            <View style={[styles.button, styles.loadingButton, { paddingHorizontal: s.paddingHorizontal, paddingVertical: s.paddingVertical }]}>
                <ActivityIndicator size="small" color="#7ED957" />
            </View>
        )
    }

    return (
        <>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity
                    style={[
                        styles.button,
                        isOnWaitlist ? styles.onWaitlist : styles.notOnWaitlist,
                        { paddingHorizontal: s.paddingHorizontal, paddingVertical: s.paddingVertical }
                    ]}
                    onPress={handlePress}
                    activeOpacity={0.8}
                >
                    <Ionicons
                        name={isOnWaitlist ? "hourglass" : "add-circle-outline"}
                        size={s.fontSize + 2}
                        color={isOnWaitlist ? "#FBBF24" : "#7ED957"}
                        style={{ marginRight: 6 }}
                    />
                    <View>
                        <Text style={[styles.buttonText, { fontSize: s.fontSize, color: isOnWaitlist ? "#FBBF24" : "#7ED957" }]}>
                            {isOnWaitlist ? "On Waitlist" : "Join Waitlist"}
                        </Text>
                        {isOnWaitlist && showPosition && position && (
                            <Text style={styles.positionText}>
                                Position #{position}
                            </Text>
                        )}
                    </View>
                </TouchableOpacity>
            </Animated.View>

            {/* Auto-Book Selection Modal */}
            <Modal
                visible={showAutoBookModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowAutoBookModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Ionicons name="flash" size={32} color="#7ED957" />
                            <Text style={styles.modalTitle}>Join Waitlist</Text>
                        </View>

                        <Text style={styles.modalDescription}>
                            When a spot opens, would you like to be automatically booked?
                        </Text>

                        {/* Auto-Book Option */}
                        <TouchableOpacity
                            style={[styles.optionCard, autoBookChoice && styles.optionCardSelected]}
                            onPress={() => setAutoBookChoice(true)}
                        >
                            <View style={styles.optionIcon}>
                                <Ionicons name="flash" size={24} color="#7ED957" />
                            </View>
                            <View style={styles.optionContent}>
                                <Text style={styles.optionTitle}>Auto-Book ⚡</Text>
                                <Text style={styles.optionDescription}>
                                    Instantly secure the spot when it opens. No action needed!
                                </Text>
                            </View>
                            <Ionicons
                                name={autoBookChoice ? "checkmark-circle" : "ellipse-outline"}
                                size={24}
                                color={autoBookChoice ? "#7ED957" : "#666"}
                            />
                        </TouchableOpacity>

                        {/* Notify Only Option */}
                        <TouchableOpacity
                            style={[styles.optionCard, !autoBookChoice && styles.optionCardSelected]}
                            onPress={() => setAutoBookChoice(false)}
                        >
                            <View style={styles.optionIcon}>
                                <Ionicons name="notifications" size={24} color="#FBBF24" />
                            </View>
                            <View style={styles.optionContent}>
                                <Text style={styles.optionTitle}>Notify Me</Text>
                                <Text style={styles.optionDescription}>
                                    Get a 5-minute window to claim the spot before the next person.
                                </Text>
                            </View>
                            <Ionicons
                                name={!autoBookChoice ? "checkmark-circle" : "ellipse-outline"}
                                size={24}
                                color={!autoBookChoice ? "#7ED957" : "#666"}
                            />
                        </TouchableOpacity>

                        {/* Pro Badge */}
                        {isPro && (
                            <View style={styles.proBadge}>
                                <Ionicons name="star" size={14} color="#FFD700" />
                                <Text style={styles.proText}>Pro members get priority in the queue!</Text>
                            </View>
                        )}

                        {/* Actions */}
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowAutoBookModal(false)}
                            >
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={handleJoinConfirm}
                            >
                                <Text style={styles.confirmText}>Join Waitlist</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    )
}

/**
 * Flash Claim Button - Shows when user is next and spot opens
 */
export function FlashClaimButton({ classId, timeRemaining }: { classId: string; timeRemaining: number }) {
    const { claim, isLoading } = useWaitlist(classId)
    const [claiming, setClaiming] = useState(false)

    const handleClaim = async () => {
        setClaiming(true)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        await claim()
        setClaiming(false)
    }

    const minutes = Math.floor(timeRemaining / 60)
    const seconds = timeRemaining % 60

    return (
        <View style={styles.flashContainer}>
            <View style={styles.flashHeader}>
                <Ionicons name="flash" size={24} color="#FFD700" />
                <Text style={styles.flashTitle}>Spot Available!</Text>
            </View>

            <Text style={styles.flashTimer}>
                Claim in {minutes}:{seconds.toString().padStart(2, "0")}
            </Text>

            <TouchableOpacity
                style={styles.claimButton}
                onPress={handleClaim}
                disabled={claiming || isLoading}
            >
                {claiming ? (
                    <ActivityIndicator color="#0A0A0A" />
                ) : (
                    <>
                        <Ionicons name="checkmark-circle" size={20} color="#0A0A0A" />
                        <Text style={styles.claimText}>Claim Spot Now</Text>
                    </>
                )}
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    button: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 12,
        borderWidth: 1.5,
    },
    loadingButton: {
        backgroundColor: "#1A1A1A",
        borderColor: "#333",
    },
    notOnWaitlist: {
        backgroundColor: "rgba(126, 217, 87, 0.1)",
        borderColor: "#7ED957",
    },
    onWaitlist: {
        backgroundColor: "rgba(251, 191, 36, 0.1)",
        borderColor: "#FBBF24",
    },
    buttonText: {
        fontWeight: "600",
    },
    positionText: {
        fontSize: 11,
        color: "#9CA3AF",
        marginTop: 1,
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContent: {
        backgroundColor: "#1A1A1A",
        borderRadius: 20,
        padding: 24,
        width: "100%",
        maxWidth: 400,
    },
    modalHeader: {
        alignItems: "center",
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#FFFFFF",
        marginTop: 8,
    },
    modalDescription: {
        fontSize: 15,
        color: "#9CA3AF",
        textAlign: "center",
        marginBottom: 20,
    },
    optionCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#252525",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: "transparent",
    },
    optionCardSelected: {
        borderColor: "#7ED957",
    },
    optionIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#333",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    optionContent: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
        marginBottom: 2,
    },
    optionDescription: {
        fontSize: 13,
        color: "#9CA3AF",
    },
    proBadge: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255, 215, 0, 0.1)",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 20,
        gap: 6,
    },
    proText: {
        fontSize: 13,
        color: "#FFD700",
        fontWeight: "500",
    },
    modalActions: {
        flexDirection: "row",
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: "#333",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
    },
    cancelText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    confirmButton: {
        flex: 1,
        backgroundColor: "#7ED957",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
    },
    confirmText: {
        color: "#0A0A0A",
        fontSize: 16,
        fontWeight: "700",
    },
    // Flash Claim
    flashContainer: {
        backgroundColor: "#252525",
        borderRadius: 16,
        padding: 20,
        borderWidth: 2,
        borderColor: "#FFD700",
    },
    flashHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginBottom: 8,
    },
    flashTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#FFD700",
    },
    flashTimer: {
        fontSize: 28,
        fontWeight: "700",
        color: "#FFFFFF",
        textAlign: "center",
        marginBottom: 16,
    },
    claimButton: {
        backgroundColor: "#7ED957",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    claimText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0A0A0A",
    },
})

export default WaitlistButton
