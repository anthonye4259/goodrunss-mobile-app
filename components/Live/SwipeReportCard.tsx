/**
 * SwipeReportCard
 * 
 * Wraps court cards with swipe gesture for quick reporting:
 * - Swipe right = "Wide Open" (quiet)
 * - Swipe left = "Crowded" (busy)
 * - Haptic feedback on completion
 */

import React, { useRef, useState } from "react"
import {
    View,
    Text,
    StyleSheet,
    Animated,
    PanResponder,
    Dimensions,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"

interface SwipeReportCardProps {
    children: React.ReactNode
    venueId: string
    venueName: string
    onReport?: (level: "quiet" | "busy") => void
    disabled?: boolean
}

const SCREEN_WIDTH = Dimensions.get("window").width
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25

export function SwipeReportCard({ 
    children, 
    venueId, 
    venueName, 
    onReport,
    disabled = false 
}: SwipeReportCardProps) {
    const pan = useRef(new Animated.Value(0)).current
    const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null)
    const [showFeedback, setShowFeedback] = useState(false)

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => !disabled,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                // Only capture horizontal swipes
                return !disabled && Math.abs(gestureState.dx) > Math.abs(gestureState.dy * 2)
            },
            onPanResponderMove: (_, gestureState) => {
                pan.setValue(gestureState.dx)
                
                // Update direction indicator
                if (gestureState.dx > 30) {
                    setSwipeDirection("right")
                } else if (gestureState.dx < -30) {
                    setSwipeDirection("left")
                } else {
                    setSwipeDirection(null)
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dx > SWIPE_THRESHOLD) {
                    // Swipe right = Quiet
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                    setShowFeedback(true)
                    onReport?.("quiet")
                    
                    // Animate out and back
                    Animated.sequence([
                        Animated.timing(pan, {
                            toValue: SCREEN_WIDTH,
                            duration: 150,
                            useNativeDriver: true,
                        }),
                        Animated.timing(pan, {
                            toValue: 0,
                            duration: 200,
                            useNativeDriver: true,
                        }),
                    ]).start(() => {
                        setShowFeedback(false)
                        setSwipeDirection(null)
                    })
                } else if (gestureState.dx < -SWIPE_THRESHOLD) {
                    // Swipe left = Busy
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
                    setShowFeedback(true)
                    onReport?.("busy")
                    
                    Animated.sequence([
                        Animated.timing(pan, {
                            toValue: -SCREEN_WIDTH,
                            duration: 150,
                            useNativeDriver: true,
                        }),
                        Animated.timing(pan, {
                            toValue: 0,
                            duration: 200,
                            useNativeDriver: true,
                        }),
                    ]).start(() => {
                        setShowFeedback(false)
                        setSwipeDirection(null)
                    })
                } else {
                    // Snap back
                    Animated.spring(pan, {
                        toValue: 0,
                        useNativeDriver: true,
                        friction: 5,
                    }).start()
                    setSwipeDirection(null)
                }
            },
        })
    ).current

    const cardOpacity = pan.interpolate({
        inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
        outputRange: [0.8, 1, 0.8],
    })

    const cardRotate = pan.interpolate({
        inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
        outputRange: ["-3deg", "0deg", "3deg"],
    })

    return (
        <View style={styles.container}>
            {/* Background indicators */}
            <View style={[styles.backgroundIndicator, styles.leftIndicator]}>
                <Ionicons name="flame" size={32} color="#EF4444" />
                <Text style={styles.indicatorText}>Crowded</Text>
            </View>
            <View style={[styles.backgroundIndicator, styles.rightIndicator]}>
                <Ionicons name="checkmark-circle" size={32} color="#22C55E" />
                <Text style={styles.indicatorText}>Wide Open</Text>
            </View>

            {/* Card content */}
            <Animated.View
                style={[
                    styles.cardWrapper,
                    {
                        transform: [
                            { translateX: pan },
                            { rotate: cardRotate },
                        ],
                        opacity: cardOpacity,
                    },
                ]}
                {...panResponder.panHandlers}
            >
                {children}

                {/* Active swipe hint */}
                {swipeDirection && (
                    <View style={[
                        styles.swipeHint,
                        swipeDirection === "right" ? styles.swipeHintRight : styles.swipeHintLeft
                    ]}>
                        <Ionicons 
                            name={swipeDirection === "right" ? "checkmark-circle" : "flame"} 
                            size={20} 
                            color={swipeDirection === "right" ? "#22C55E" : "#EF4444"} 
                        />
                    </View>
                )}
            </Animated.View>

            {/* Success feedback */}
            {showFeedback && (
                <View style={styles.feedbackOverlay}>
                    <Text style={styles.feedbackText}>✓ Reported!</Text>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: "relative",
    },
    cardWrapper: {
        position: "relative",
    },
    backgroundIndicator: {
        position: "absolute",
        top: 0,
        bottom: 0,
        width: 80,
        justifyContent: "center",
        alignItems: "center",
        zIndex: -1,
    },
    leftIndicator: {
        right: 0,
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        borderTopRightRadius: 16,
        borderBottomRightRadius: 16,
    },
    rightIndicator: {
        left: 0,
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        borderTopLeftRadius: 16,
        borderBottomLeftRadius: 16,
    },
    indicatorText: {
        fontSize: 10,
        fontWeight: "600",
        color: "#666",
        marginTop: 4,
    },
    swipeHint: {
        position: "absolute",
        top: 8,
        padding: 4,
        borderRadius: 12,
    },
    swipeHintRight: {
        right: 8,
        backgroundColor: "rgba(34, 197, 94, 0.2)",
    },
    swipeHintLeft: {
        left: 8,
        backgroundColor: "rgba(239, 68, 68, 0.2)",
    },
    feedbackOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        borderRadius: 16,
    },
    feedbackText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#7ED957",
    },
})

export default SwipeReportCard
