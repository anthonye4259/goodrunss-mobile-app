/**
 * QuickReportSheet
 * 
 * Redesigned court reporting experience:
 * - One-tap to report crowd level (that's 90% of reports)
 * - Optional: Add photo with one more tap
 * - Instant visual feedback
 * - Swipe down or tap outside to dismiss
 * - No unnecessary steps or confusing "optional" labels
 */

import React, { useState, useCallback } from "react"
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Dimensions,
    Image,
    TextInput,
} from "react-native"
import { BlurView } from "expo-blur"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import * as ImagePicker from "expo-image-picker"
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
    runOnJS,
} from "react-native-reanimated"
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler"

const { height: SCREEN_HEIGHT } = Dimensions.get("window")

type CrowdLevel = "empty" | "light" | "moderate" | "busy" | "packed"
type GameQuality = "low" | "mediocre" | "good"

interface QuickReportSheetProps {
    visible: boolean
    onClose: () => void
    venueName: string
    venueId: string
    sport?: string
    onReportSubmitted?: (level: CrowdLevel, imageUri?: string) => void
}

// Simple crowd options - clear, visual, actionable
const CROWD_OPTIONS: {
    level: CrowdLevel
    emoji: string
    label: string
    sublabel: string
    color: string
}[] = [
        { level: "empty", emoji: "🟢", label: "Empty", sublabel: "Courts open", color: "#22C55E" },
        { level: "light", emoji: "🟡", label: "Light", sublabel: "Easy to join", color: "#FBBF24" },
        { level: "moderate", emoji: "🟠", label: "Moderate", sublabel: "Games running", color: "#F97316" },
        { level: "busy", emoji: "🔴", label: "Busy", sublabel: "Expect wait", color: "#EF4444" },
        { level: "packed", emoji: "💥", label: "Packed", sublabel: "All full", color: "#DC2626" },
    ]

// Game Quality options (3-tier)
const GAME_QUALITY_OPTIONS: {
    level: GameQuality
    emoji: string
    label: string
    color: string
}[] = [
        { level: "low", emoji: "😐", label: "Low", color: "#6B7280" },
        { level: "mediocre", emoji: "👍", label: "Mediocre", color: "#FBBF24" },
        { level: "good", emoji: "🔥", label: "Good Runss", color: "#22C55E" },
    ]

export function QuickReportSheet({
    visible,
    onClose,
    venueName,
    venueId,
    sport = "Basketball",
    onReportSubmitted,
}: QuickReportSheetProps) {
    const [selectedLevel, setSelectedLevel] = useState<CrowdLevel | null>(null)
    const [photoUri, setPhotoUri] = useState<string | null>(null)
    const [selectedGameQuality, setSelectedGameQuality] = useState<GameQuality | null>(null)
    const [comment, setComment] = useState("")
    const [isSubmitted, setIsSubmitted] = useState(false)

    const translateY = useSharedValue(0)
    const scale = useSharedValue(1)

    // Handle level tap - immediate submit
    const handleLevelTap = useCallback(async (level: CrowdLevel) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        setSelectedLevel(level)
        setIsSubmitted(true)

        // Submit immediately
        onReportSubmitted?.(level, photoUri || undefined)

        // Show success for 1.5s then close
        setTimeout(() => {
            setIsSubmitted(false)
            setSelectedLevel(null)
            setPhotoUri(null)
            onClose()
        }, 1500)
    }, [photoUri, onReportSubmitted, onClose])

    // Quick photo capture
    const handlePhoto = useCallback(async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

        const { status } = await ImagePicker.requestCameraPermissionsAsync()
        if (status !== "granted") return

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: "images",
            quality: 0.6,
            allowsEditing: false,
        })

        if (!result.canceled && result.assets[0]) {
            setPhotoUri(result.assets[0].uri)
        }
    }, [])

    // Swipe down gesture to dismiss
    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            if (e.translationY > 0) {
                translateY.value = e.translationY
            }
        })
        .onEnd((e) => {
            if (e.translationY > 100) {
                runOnJS(onClose)()
            }
            translateY.value = withSpring(0)
        })

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }))

    const handleClose = () => {
        setSelectedLevel(null)
        setPhotoUri(null)
        setIsSubmitted(false)
        onClose()
    }

    if (!visible) return null

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose}>
                    <BlurView intensity={30} style={StyleSheet.absoluteFill} tint="dark" />
                </TouchableOpacity>

                <GestureDetector gesture={panGesture}>
                    <Animated.View style={[styles.sheet, animatedStyle]}>
                        {/* Drag Handle */}
                        <View style={styles.dragHandle} />

                        {/* Success State */}
                        {isSubmitted ? (
                            <View style={styles.successContainer}>
                                <View style={styles.successIcon}>
                                    <Ionicons name="checkmark" size={48} color="#22C55E" />
                                </View>
                                <Text style={styles.successTitle}>Thanks! 🙌</Text>
                                <Text style={styles.successSubtitle}>Report submitted</Text>
                            </View>
                        ) : (
                            <>
                                {/* Header */}
                                <View style={styles.header}>
                                    <Text style={styles.title}>How's {venueName}?</Text>
                                    <Text style={styles.subtitle}>Tap to report • Helps others</Text>
                                </View>

                                {/* Crowd Level Grid - Big, tappable buttons */}
                                <View style={styles.levelGrid}>
                                    {CROWD_OPTIONS.map((option) => (
                                        <TouchableOpacity
                                            key={option.level}
                                            style={[
                                                styles.levelCard,
                                                { borderColor: option.color + "40" },
                                            ]}
                                            onPress={() => handleLevelTap(option.level)}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={styles.levelEmoji}>{option.emoji}</Text>
                                            <Text style={[styles.levelLabel, { color: option.color }]}>
                                                {option.label}
                                            </Text>
                                            <Text style={styles.levelSublabel}>{option.sublabel}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Game Quality Section */}
                                <View style={styles.gameQualitySection}>
                                    <Text style={styles.sectionLabel}>Game Quality</Text>
                                    <View style={styles.gameQualityRow}>
                                        {GAME_QUALITY_OPTIONS.map((option) => (
                                            <TouchableOpacity
                                                key={option.level}
                                                style={[
                                                    styles.qualityChip,
                                                    selectedGameQuality === option.level && {
                                                        backgroundColor: option.color + "30",
                                                        borderColor: option.color,
                                                    },
                                                ]}
                                                onPress={() => {
                                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                                    setSelectedGameQuality(option.level)
                                                }}
                                            >
                                                <Text style={styles.qualityEmoji}>{option.emoji}</Text>
                                                <Text style={[
                                                    styles.qualityLabel,
                                                    selectedGameQuality === option.level && { color: option.color }
                                                ]}>
                                                    {option.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                {/* Community Comment */}
                                <View style={styles.commentSection}>
                                    <Text style={styles.sectionLabel}>Say something to the community</Text>
                                    <TextInput
                                        style={styles.commentInput}
                                        placeholder="e.g. 'Runs are competitive tonight!'"
                                        placeholderTextColor="#666"
                                        value={comment}
                                        onChangeText={setComment}
                                        multiline
                                        maxLength={140}
                                    />
                                    <Text style={styles.charCount}>{comment.length}/140</Text>
                                </View>

                                {/* Quick Photo - Optional, prominent but not blocking */}
                                <View style={styles.photoSection}>
                                    {photoUri ? (
                                        <View style={styles.photoPreview}>
                                            <Image source={{ uri: photoUri }} style={styles.previewImage} />
                                            <TouchableOpacity
                                                style={styles.removePhoto}
                                                onPress={() => setPhotoUri(null)}
                                            >
                                                <Ionicons name="close" size={16} color="#FFF" />
                                            </TouchableOpacity>
                                            <Text style={styles.photoHint}>Photo will be included</Text>
                                        </View>
                                    ) : (
                                        <TouchableOpacity style={styles.photoButton} onPress={handlePhoto}>
                                            <Ionicons name="camera" size={20} color="#8B5CF6" />
                                            <Text style={styles.photoButtonText}>Add photo</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </>
                        )}
                    </Animated.View>
                </GestureDetector>
            </GestureHandlerRootView>
        </Modal>
    )
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        justifyContent: "flex-end",
    },
    sheet: {
        backgroundColor: "#1A1A1A",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingBottom: 40,
        minHeight: 400,
    },
    dragHandle: {
        width: 40,
        height: 4,
        backgroundColor: "#444",
        borderRadius: 2,
        alignSelf: "center",
        marginTop: 12,
        marginBottom: 16,
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: "#FFF",
        textAlign: "center",
    },
    subtitle: {
        fontSize: 14,
        color: "#888",
        textAlign: "center",
        marginTop: 4,
    },
    levelGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        justifyContent: "center",
    },
    levelCard: {
        width: "45%",
        backgroundColor: "rgba(255,255,255,0.05)",
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        alignItems: "center",
    },
    levelEmoji: {
        fontSize: 32,
        marginBottom: 6,
    },
    levelLabel: {
        fontSize: 16,
        fontWeight: "700",
    },
    levelSublabel: {
        fontSize: 12,
        color: "#888",
        marginTop: 2,
    },
    photoSection: {
        marginTop: 20,
        alignItems: "center",
    },
    photoButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: "rgba(139, 92, 246, 0.15)",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(139, 92, 246, 0.3)",
    },
    photoButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#8B5CF6",
    },
    photoPreview: {
        alignItems: "center",
    },
    previewImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
    },
    removePhoto: {
        position: "absolute",
        top: -6,
        right: -6,
        backgroundColor: "#EF4444",
        borderRadius: 12,
        padding: 4,
    },
    photoHint: {
        fontSize: 11,
        color: "#666",
        marginTop: 6,
    },
    successContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    successIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "rgba(34, 197, 94, 0.15)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#22C55E",
    },
    successSubtitle: {
        fontSize: 14,
        color: "#888",
        marginTop: 4,
    },
    // New styles for Game Quality & Comments
    gameQualitySection: {
        marginTop: 20,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#AAA",
        marginBottom: 10,
        textAlign: "center",
    },
    gameQualityRow: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 10,
    },
    qualityChip: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#333",
        alignItems: "center",
        flexDirection: "row",
        gap: 6,
    },
    qualityEmoji: {
        fontSize: 18,
    },
    qualityLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#999",
    },
    commentSection: {
        marginTop: 20,
    },
    commentInput: {
        backgroundColor: "rgba(255,255,255,0.05)",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#333",
        padding: 14,
        color: "#FFF",
        fontSize: 14,
        minHeight: 70,
        textAlignVertical: "top",
    },
    charCount: {
        fontSize: 11,
        color: "#555",
        textAlign: "right",
        marginTop: 4,
    },
})

export default QuickReportSheet
