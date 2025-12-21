/**
 * QuickCourtReport - One-Tap Waze-Style Reporting
 * 
 * Simple, fast way to report court conditions:
 * - Tap crowd level (empty/some/busy)
 * - Optional: Add conditions (lights, wet, etc.)
 * - Submit in under 5 seconds
 */

import React, { useState, useCallback } from "react"
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    TextInput,
    ActivityIndicator,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { BlurView } from "expo-blur"
import {
    submitQuickReport,
    type CrowdLevel
} from "@/lib/services/court-status-service"

interface QuickCourtReportProps {
    venueId: string
    venueName: string
    userId: string
    onReportSubmitted?: (crowdLevel: CrowdLevel) => void
    visible?: boolean
    onClose?: () => void
}

// Crowd level options
const CROWD_OPTIONS: { level: CrowdLevel; emoji: string; label: string; sublabel: string; color: string }[] = [
    { level: "empty", emoji: "🟢", label: "Empty", sublabel: "Courts available", color: "#22C55E" },
    { level: "light", emoji: "🟡", label: "Light", sublabel: "A few people", color: "#EAB308" },
    { level: "moderate", emoji: "🟠", label: "Some", sublabel: "Half full", color: "#F97316" },
    { level: "busy", emoji: "🔴", label: "Busy", sublabel: "Mostly full", color: "#EF4444" },
    { level: "packed", emoji: "💥", label: "Packed", sublabel: "All courts taken", color: "#DC2626" },
]

// Condition toggles
const CONDITION_OPTIONS = [
    { id: "lights_on", label: "💡 Lights On", positive: true },
    { id: "lights_off", label: "🌙 Lights Off", positive: false },
    { id: "wet_courts", label: "💧 Wet", positive: false },
    { id: "nets_up", label: "🎾 Nets Up", positive: true },
    { id: "games_running", label: "🏀 Games", positive: true },
    { id: "clean", label: "✨ Clean", positive: true },
]

export function QuickCourtReport({
    venueId,
    venueName,
    userId,
    onReportSubmitted,
    visible = true,
    onClose,
}: QuickCourtReportProps) {
    const [selectedLevel, setSelectedLevel] = useState<CrowdLevel | null>(null)
    const [selectedConditions, setSelectedConditions] = useState<string[]>([])
    const [note, setNote] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [showConditions, setShowConditions] = useState(false)

    const handleLevelSelect = useCallback((level: CrowdLevel) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        setSelectedLevel(level)
        setShowConditions(true)
    }, [])

    const toggleCondition = useCallback((conditionId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        setSelectedConditions(prev =>
            prev.includes(conditionId)
                ? prev.filter(c => c !== conditionId)
                : [...prev, conditionId]
        )
    }, [])

    const handleSubmit = useCallback(async () => {
        if (!selectedLevel) return

        setIsSubmitting(true)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

        try {
            await submitQuickReport(
                venueId,
                userId,
                selectedLevel,
                selectedConditions.length > 0 ? selectedConditions : undefined,
                note || undefined
            )

            setSubmitted(true)
            onReportSubmitted?.(selectedLevel)

            // Auto-close after success
            setTimeout(() => {
                onClose?.()
            }, 1500)
        } catch (error) {
            console.error("Error submitting report:", error)
        } finally {
            setIsSubmitting(false)
        }
    }, [selectedLevel, selectedConditions, note, venueId, userId, onReportSubmitted, onClose])

    const handleSkipConditions = useCallback(() => {
        handleSubmit()
    }, [handleSubmit])

    if (!visible) return null

    // Success state
    if (submitted) {
        return (
            <View style={styles.container}>
                <View style={styles.successContainer}>
                    <Text style={styles.successEmoji}>✅</Text>
                    <Text style={styles.successText}>Thanks for reporting!</Text>
                    <Text style={styles.successSubtext}>Helping local players 🏀</Text>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Ionicons name="megaphone" size={20} color="#8B5CF6" />
                    <Text style={styles.headerTitle}>Quick Report</Text>
                </View>
                {onClose && (
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#6B7280" />
                    </TouchableOpacity>
                )}
            </View>

            <Text style={styles.venueName}>{venueName}</Text>
            <Text style={styles.question}>How busy is it right now?</Text>

            {/* Crowd Level Selection */}
            <View style={styles.levelContainer}>
                {CROWD_OPTIONS.map(option => (
                    <TouchableOpacity
                        key={option.level}
                        style={[
                            styles.levelButton,
                            selectedLevel === option.level && {
                                backgroundColor: option.color + "20",
                                borderColor: option.color,
                            }
                        ]}
                        onPress={() => handleLevelSelect(option.level)}
                    >
                        <Text style={styles.levelEmoji}>{option.emoji}</Text>
                        <Text style={[
                            styles.levelLabel,
                            selectedLevel === option.level && { color: option.color }
                        ]}>
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Conditions (Optional) */}
            {showConditions && (
                <View style={styles.conditionsSection}>
                    <Text style={styles.conditionsTitle}>
                        Any conditions? <Text style={styles.optional}>(optional)</Text>
                    </Text>

                    <View style={styles.conditionsGrid}>
                        {CONDITION_OPTIONS.map(option => (
                            <TouchableOpacity
                                key={option.id}
                                style={[
                                    styles.conditionChip,
                                    selectedConditions.includes(option.id) && styles.conditionChipSelected
                                ]}
                                onPress={() => toggleCondition(option.id)}
                            >
                                <Text style={[
                                    styles.conditionLabel,
                                    selectedConditions.includes(option.id) && styles.conditionLabelSelected
                                ]}>
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Submit Buttons */}
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={styles.skipButton}
                            onPress={handleSkipConditions}
                        >
                            <Text style={styles.skipButtonText}>Skip & Submit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                        >
                            <LinearGradient
                                colors={["#8B5CF6", "#7C3AED"]}
                                style={styles.submitGradient}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Submit Report</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    )
}

/**
 * Full-screen modal version
 */
export function QuickCourtReportModal({
    venueId,
    venueName,
    userId,
    visible,
    onClose,
    onReportSubmitted,
}: QuickCourtReportProps & { visible: boolean }) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <BlurView intensity={20} style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <QuickCourtReport
                        venueId={venueId}
                        venueName={venueName}
                        userId={userId}
                        onClose={onClose}
                        onReportSubmitted={onReportSubmitted}
                    />
                </View>
            </BlurView>
        </Modal>
    )
}

/**
 * Compact inline version for court cards
 */
export function QuickReportButton({
    onPress
}: {
    onPress: () => void
}) {
    return (
        <TouchableOpacity style={styles.compactButton} onPress={onPress}>
            <Ionicons name="add-circle" size={16} color="#8B5CF6" />
            <Text style={styles.compactButtonText}>Report</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: "#1A1A2E",
        borderRadius: 16,
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
    headerTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#8B5CF6",
    },
    closeButton: {
        padding: 4,
    },
    venueName: {
        fontSize: 18,
        fontWeight: "700",
        color: "#fff",
        marginBottom: 4,
    },
    question: {
        fontSize: 14,
        color: "#9CA3AF",
        marginBottom: 16,
    },
    levelContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 8,
    },
    levelButton: {
        flex: 1,
        alignItems: "center",
        padding: 12,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: 2,
        borderColor: "transparent",
    },
    levelEmoji: {
        fontSize: 24,
        marginBottom: 4,
    },
    levelLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: "#9CA3AF",
    },
    conditionsSection: {
        marginTop: 20,
    },
    conditionsTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#fff",
        marginBottom: 12,
    },
    optional: {
        fontWeight: "400",
        color: "#6B7280",
    },
    conditionsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 16,
    },
    conditionChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
    },
    conditionChipSelected: {
        backgroundColor: "rgba(139, 92, 246, 0.2)",
        borderColor: "#8B5CF6",
    },
    conditionLabel: {
        fontSize: 13,
        color: "#9CA3AF",
    },
    conditionLabelSelected: {
        color: "#A78BFA",
    },
    buttonRow: {
        flexDirection: "row",
        gap: 12,
    },
    skipButton: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.05)",
    },
    skipButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#9CA3AF",
    },
    submitButton: {
        flex: 2,
        borderRadius: 12,
        overflow: "hidden",
    },
    submitGradient: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
    },
    submitButtonText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#fff",
    },
    successContainer: {
        alignItems: "center",
        padding: 24,
    },
    successEmoji: {
        fontSize: 48,
        marginBottom: 12,
    },
    successText: {
        fontSize: 18,
        fontWeight: "700",
        color: "#fff",
        marginBottom: 4,
    },
    successSubtext: {
        fontSize: 14,
        color: "#9CA3AF",
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "flex-end",
    },
    modalContent: {
        marginHorizontal: 16,
        marginBottom: 32,
    },
    compactButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: "rgba(139, 92, 246, 0.15)",
    },
    compactButtonText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#8B5CF6",
    },
})
