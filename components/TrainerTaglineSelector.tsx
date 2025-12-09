/**
 * Trainer Tagline Selector
 * 
 * Allows trainers to pick from AI-generated taglines like:
 * "Pickleball Royalty", "Court Commander", "Ace Maker"
 * 
 * Shows 5 options generated based on their primary activity.
 */

import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useState, useEffect } from "react"
import * as Haptics from "expo-haptics"
import { generateTrainerTagline, type TaglineResult } from "@/lib/services/trainer-profile-defaults"

interface TrainerTaglineSelectorProps {
    activity: string
    currentTagline?: string
    onSelect: (tagline: string) => void
    onSkip?: () => void
}

export function TrainerTaglineSelector({
    activity,
    currentTagline,
    onSelect,
    onSkip,
}: TrainerTaglineSelectorProps) {
    const [options, setOptions] = useState<string[]>([])
    const [selectedTagline, setSelectedTagline] = useState<string | null>(currentTagline || null)
    const [loading, setLoading] = useState(true)
    const [regenerating, setRegenerating] = useState(false)

    useEffect(() => {
        loadTaglines()
    }, [activity])

    const loadTaglines = async () => {
        setLoading(true)
        try {
            const result = await generateTrainerTagline(activity)
            setOptions(result.options)
            if (!selectedTagline) {
                setSelectedTagline(result.tagline) // Default suggestion
            }
        } catch (error) {
            console.error("[TaglineSelector] Error:", error)
            // Fallback options
            setOptions([
                `${activity} Pro`,
                `${activity} Expert`,
                `${activity} Master`,
                `The ${activity} Coach`,
                `${activity} Champion`,
            ])
        } finally {
            setLoading(false)
        }
    }

    const regenerateTaglines = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        setRegenerating(true)
        try {
            const result = await generateTrainerTagline(activity)
            setOptions(result.options)
        } catch (error) {
            console.error("[TaglineSelector] Regenerate error:", error)
        } finally {
            setRegenerating(false)
        }
    }

    const handleSelect = (tagline: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        setSelectedTagline(tagline)
    }

    const handleConfirm = () => {
        if (selectedTagline) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            onSelect(selectedTagline)
        }
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#7ED957" />
                    <Text style={styles.loadingText}>Generating taglines...</Text>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Ionicons name="sparkles" size={24} color="#7ED957" />
                <Text style={styles.title}>Choose Your Tagline</Text>
            </View>
            <Text style={styles.subtitle}>
                Pick a catchy tagline to stand out
            </Text>

            {/* Preview */}
            {selectedTagline && (
                <View style={styles.preview}>
                    <Text style={styles.previewLabel}>Preview</Text>
                    <Text style={styles.previewTagline}>"{selectedTagline}"</Text>
                </View>
            )}

            {/* Options */}
            <View style={styles.optionsContainer}>
                {options.map((tagline, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.optionButton,
                            selectedTagline === tagline && styles.optionButtonSelected,
                        ]}
                        onPress={() => handleSelect(tagline)}
                        activeOpacity={0.8}
                    >
                        <Text
                            style={[
                                styles.optionText,
                                selectedTagline === tagline && styles.optionTextSelected,
                            ]}
                        >
                            {tagline}
                        </Text>
                        {selectedTagline === tagline && (
                            <Ionicons name="checkmark-circle" size={20} color="#7ED957" />
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            {/* Regenerate button */}
            <TouchableOpacity
                style={styles.regenerateButton}
                onPress={regenerateTaglines}
                disabled={regenerating}
            >
                {regenerating ? (
                    <ActivityIndicator size="small" color="#666" />
                ) : (
                    <>
                        <Ionicons name="refresh" size={18} color="#666" />
                        <Text style={styles.regenerateText}>Generate New Options</Text>
                    </>
                )}
            </TouchableOpacity>

            {/* Actions */}
            <View style={styles.actions}>
                {onSkip && (
                    <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
                        <Text style={styles.skipText}>Skip for now</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={[
                        styles.confirmButton,
                        !selectedTagline && styles.confirmButtonDisabled,
                    ]}
                    onPress={handleConfirm}
                    disabled={!selectedTagline}
                >
                    <Text style={styles.confirmText}>Use This Tagline</Text>
                    <Ionicons name="arrow-forward" size={18} color="#000" />
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    loadingContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: "#666",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    subtitle: {
        fontSize: 14,
        color: "#666",
        marginBottom: 24,
    },
    preview: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 20,
        alignItems: "center",
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#7ED957",
    },
    previewLabel: {
        fontSize: 12,
        color: "#666",
        marginBottom: 8,
    },
    previewTagline: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#7ED957",
    },
    optionsContainer: {
        gap: 12,
        marginBottom: 16,
    },
    optionButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "#252525",
    },
    optionButtonSelected: {
        borderColor: "#7ED957",
        backgroundColor: "rgba(126, 217, 87, 0.1)",
    },
    optionText: {
        fontSize: 16,
        color: "#FFFFFF",
    },
    optionTextSelected: {
        fontWeight: "bold",
        color: "#7ED957",
    },
    regenerateButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 12,
        marginBottom: 24,
    },
    regenerateText: {
        fontSize: 14,
        color: "#666",
    },
    actions: {
        flexDirection: "row",
        gap: 12,
    },
    skipButton: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#333",
    },
    skipText: {
        fontSize: 16,
        color: "#666",
    },
    confirmButton: {
        flex: 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#7ED957",
        paddingVertical: 16,
        borderRadius: 12,
    },
    confirmButtonDisabled: {
        backgroundColor: "#333",
    },
    confirmText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#000",
    },
})

export default TrainerTaglineSelector
