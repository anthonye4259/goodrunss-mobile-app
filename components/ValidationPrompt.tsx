/**
 * ValidationPrompt - Post-Visit Accuracy Check
 * 
 * Asks users "Was our prediction accurate?" after they visit a venue.
 * This feedback improves predictions over time.
 */

import React, { useState, useCallback } from "react"
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { BlurView } from "expo-blur"
import { recordValidation } from "@/lib/services/venue-learning-service"
import type { ActivityLevel } from "@/lib/services/sport-intelligence-service"

interface ValidationPromptProps {
    venueId: string
    venueName: string
    sport: string
    predictedLevel: ActivityLevel
    userId: string
    visible: boolean
    onClose: () => void
    onValidated?: (wasAccurate: boolean) => void
}

const ACTIVITY_DISPLAY: Record<ActivityLevel, { emoji: string; label: string }> = {
    dead: { emoji: "💤", label: "Dead" },
    quiet: { emoji: "🟢", label: "Quiet" },
    active: { emoji: "🟡", label: "Active" },
    busy: { emoji: "🟠", label: "Busy" },
    packed: { emoji: "🔴", label: "Packed" },
}

export function ValidationPrompt({
    venueId,
    venueName,
    sport,
    predictedLevel,
    userId,
    visible,
    onClose,
    onValidated,
}: ValidationPromptProps) {
    const [step, setStep] = useState<"accuracy" | "actual" | "thanks">("accuracy")
    const [wasAccurate, setWasAccurate] = useState<boolean | null>(null)
    const [actualLevel, setActualLevel] = useState<ActivityLevel | null>(null)

    const handleAccuracyResponse = useCallback(async (accurate: boolean) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        setWasAccurate(accurate)

        if (accurate) {
            // If accurate, record and close
            await recordValidation({
                venueId,
                predictionTime: new Date(),
                visitTime: new Date(),
                predictedLevel,
                actualLevel: predictedLevel, // Same as predicted
                wasAccurate: true,
                userId,
            })

            setStep("thanks")
            onValidated?.(true)

            setTimeout(onClose, 1500)
        } else {
            // Ask for actual level
            setStep("actual")
        }
    }, [venueId, predictedLevel, userId, onClose, onValidated])

    const handleActualLevel = useCallback(async (level: ActivityLevel) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        setActualLevel(level)

        await recordValidation({
            venueId,
            predictionTime: new Date(),
            visitTime: new Date(),
            predictedLevel,
            actualLevel: level,
            wasAccurate: false,
            userId,
        })

        setStep("thanks")
        onValidated?.(false)

        setTimeout(onClose, 1500)
    }, [venueId, predictedLevel, userId, onClose, onValidated])

    const predicted = ACTIVITY_DISPLAY[predictedLevel]

    if (!visible) return null

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <BlurView intensity={30} style={styles.overlay}>
                <View style={styles.card}>
                    {/* Close button */}
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Ionicons name="close" size={24} color="#6B7280" />
                    </TouchableOpacity>

                    {step === "accuracy" && (
                        <>
                            <Text style={styles.title}>Help us improve! 🎯</Text>
                            <Text style={styles.subtitle}>
                                We predicted <Text style={styles.venueName}>{venueName}</Text> would be:
                            </Text>

                            {/* Prediction badge */}
                            <View style={styles.predictionBadge}>
                                <Text style={styles.predictionEmoji}>{predicted.emoji}</Text>
                                <Text style={styles.predictionLabel}>{predicted.label}</Text>
                            </View>

                            <Text style={styles.question}>Was this accurate?</Text>

                            {/* Yes/No buttons */}
                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    style={styles.yesButton}
                                    onPress={() => handleAccuracyResponse(true)}
                                >
                                    <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
                                    <Text style={styles.yesText}>Yes, spot on!</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.noButton}
                                    onPress={() => handleAccuracyResponse(false)}
                                >
                                    <Ionicons name="close-circle" size={24} color="#EF4444" />
                                    <Text style={styles.noText}>Not quite</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                    {step === "actual" && (
                        <>
                            <Text style={styles.title}>What was it actually?</Text>
                            <Text style={styles.subtitle}>
                                We predicted {predicted.emoji} {predicted.label}
                            </Text>

                            <View style={styles.levelGrid}>
                                {(Object.keys(ACTIVITY_DISPLAY) as ActivityLevel[]).map(level => {
                                    const display = ACTIVITY_DISPLAY[level]
                                    return (
                                        <TouchableOpacity
                                            key={level}
                                            style={[
                                                styles.levelButton,
                                                actualLevel === level && styles.levelButtonSelected
                                            ]}
                                            onPress={() => handleActualLevel(level)}
                                        >
                                            <Text style={styles.levelEmoji}>{display.emoji}</Text>
                                            <Text style={styles.levelLabel}>{display.label}</Text>
                                        </TouchableOpacity>
                                    )
                                })}
                            </View>
                        </>
                    )}

                    {step === "thanks" && (
                        <View style={styles.thanksContainer}>
                            <Text style={styles.thanksEmoji}>🙏</Text>
                            <Text style={styles.thanksTitle}>Thanks!</Text>
                            <Text style={styles.thanksText}>
                                Your feedback helps everyone play smarter.
                            </Text>
                        </View>
                    )}
                </View>
            </BlurView>
        </Modal>
    )
}

/**
 * Inline mini version that appears after check-in
 */
export function InlineValidation({
    predictedLevel,
    onValidate,
}: {
    predictedLevel: ActivityLevel
    onValidate: (accurate: boolean, actual?: ActivityLevel) => void
}) {
    const predicted = ACTIVITY_DISPLAY[predictedLevel]

    return (
        <View style={styles.inlineContainer}>
            <View style={styles.inlineLeft}>
                <Text style={styles.inlineLabel}>We said {predicted.emoji} {predicted.label}</Text>
                <Text style={styles.inlineQuestion}>Accurate?</Text>
            </View>
            <View style={styles.inlineButtons}>
                <TouchableOpacity
                    style={styles.inlineYes}
                    onPress={() => onValidate(true)}
                >
                    <Ionicons name="thumbs-up" size={18} color="#22C55E" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.inlineNo}
                    onPress={() => onValidate(false)}
                >
                    <Ionicons name="thumbs-down" size={18} color="#EF4444" />
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    card: {
        backgroundColor: "#1A1A2E",
        borderRadius: 24,
        padding: 24,
        width: "100%",
        maxWidth: 340,
    },
    closeButton: {
        position: "absolute",
        top: 16,
        right: 16,
        zIndex: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: "800",
        color: "#fff",
        textAlign: "center",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: "#9CA3AF",
        textAlign: "center",
        marginBottom: 16,
    },
    venueName: {
        color: "#8B5CF6",
        fontWeight: "600",
    },
    predictionBadge: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "rgba(255,255,255,0.05)",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 16,
        alignSelf: "center",
        marginBottom: 20,
    },
    predictionEmoji: {
        fontSize: 28,
    },
    predictionLabel: {
        fontSize: 18,
        fontWeight: "700",
        color: "#fff",
    },
    question: {
        fontSize: 16,
        color: "#D1D5DB",
        textAlign: "center",
        marginBottom: 16,
    },
    buttonRow: {
        flexDirection: "row",
        gap: 12,
    },
    yesButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "rgba(34, 197, 94, 0.15)",
        paddingVertical: 16,
        borderRadius: 14,
    },
    yesText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#22C55E",
    },
    noButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "rgba(239, 68, 68, 0.15)",
        paddingVertical: 16,
        borderRadius: 14,
    },
    noText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#EF4444",
    },
    levelGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginTop: 8,
    },
    levelButton: {
        width: "30%",
        alignItems: "center",
        paddingVertical: 16,
        borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.05)",
    },
    levelButtonSelected: {
        backgroundColor: "rgba(139, 92, 246, 0.2)",
        borderWidth: 1,
        borderColor: "#8B5CF6",
    },
    levelEmoji: {
        fontSize: 24,
        marginBottom: 4,
    },
    levelLabel: {
        fontSize: 12,
        color: "#9CA3AF",
        fontWeight: "500",
    },
    thanksContainer: {
        alignItems: "center",
        paddingVertical: 20,
    },
    thanksEmoji: {
        fontSize: 48,
        marginBottom: 12,
    },
    thanksTitle: {
        fontSize: 24,
        fontWeight: "800",
        color: "#fff",
        marginBottom: 8,
    },
    thanksText: {
        fontSize: 14,
        color: "#9CA3AF",
        textAlign: "center",
    },
    // Inline
    inlineContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        borderRadius: 12,
        padding: 12,
    },
    inlineLeft: {
        flex: 1,
    },
    inlineLabel: {
        fontSize: 13,
        color: "#D1D5DB",
    },
    inlineQuestion: {
        fontSize: 12,
        color: "#8B5CF6",
        fontWeight: "600",
    },
    inlineButtons: {
        flexDirection: "row",
        gap: 8,
    },
    inlineYes: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(34, 197, 94, 0.15)",
        alignItems: "center",
        justifyContent: "center",
    },
    inlineNo: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(239, 68, 68, 0.15)",
        alignItems: "center",
        justifyContent: "center",
    },
})
