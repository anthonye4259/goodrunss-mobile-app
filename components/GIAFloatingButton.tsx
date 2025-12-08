/**
 * GIA Floating Button
 * 
 * A floating action button that provides instant access to GIA from anywhere in the app.
 * This is crucial for making GIA a billion-dollar feature - must be visible everywhere.
 */

import { TouchableOpacity, StyleSheet, Animated, View, Text } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useEffect, useRef, useState } from "react"
import * as Haptics from "expo-haptics"
import { LinearGradient } from "expo-linear-gradient"

interface GIAFloatingButtonProps {
    hidden?: boolean
}

export function GIAFloatingButton({ hidden = false }: GIAFloatingButtonProps) {
    const [expanded, setExpanded] = useState(false)
    const scaleAnim = useRef(new Animated.Value(1)).current
    const pulseAnim = useRef(new Animated.Value(1)).current
    const rotateAnim = useRef(new Animated.Value(0)).current

    // Subtle pulse animation to draw attention
    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        )
        pulse.start()
        return () => pulse.stop()
    }, [])

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        // Press animation
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.9,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 3,
                tension: 100,
                useNativeDriver: true,
            }),
        ]).start()

        // Navigate to GIA
        router.push("/(tabs)/gia")
    }

    const handleLongPress = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        setExpanded(!expanded)
    }

    if (hidden) return null

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [
                        { scale: Animated.multiply(scaleAnim, pulseAnim) }
                    ]
                }
            ]}
        >
            {/* Glow effect */}
            <View style={styles.glowOuter} />
            <View style={styles.glowInner} />

            {/* Main button */}
            <TouchableOpacity
                onPress={handlePress}
                onLongPress={handleLongPress}
                activeOpacity={0.9}
                style={styles.touchable}
            >
                <LinearGradient
                    colors={["#8B5CF6", "#6D28D9"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.button}
                >
                    <Ionicons name="sparkles" size={28} color="#FFFFFF" />
                </LinearGradient>
            </TouchableOpacity>

            {/* Label */}
            <View style={styles.labelContainer}>
                <Text style={styles.label}>Ask GIA</Text>
            </View>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 100,
        right: 20,
        alignItems: "center",
        zIndex: 1000,
    },
    glowOuter: {
        position: "absolute",
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: "rgba(139, 92, 246, 0.2)",
    },
    glowInner: {
        position: "absolute",
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "rgba(139, 92, 246, 0.3)",
    },
    touchable: {
        borderRadius: 30,
        shadowColor: "#8B5CF6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 10,
    },
    button: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    labelContainer: {
        marginTop: 6,
        backgroundColor: "rgba(139, 92, 246, 0.9)",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    label: {
        fontSize: 11,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
})

export default GIAFloatingButton
