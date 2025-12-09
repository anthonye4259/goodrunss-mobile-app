/**
 * Follow Button Component
 * 
 * Animated follow/unfollow button for instructor profiles.
 * Uses optimistic updates for instant feedback.
 */

import React from "react"
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    Animated,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { useFollow } from "@/lib/hooks/useInstructorFollow"

interface FollowButtonProps {
    instructorId: string
    size?: "small" | "medium" | "large"
    variant?: "filled" | "outlined"
}

export function FollowButton({
    instructorId,
    size = "medium",
    variant = "filled",
}: FollowButtonProps) {
    const { isFollowing, isLoading, toggleFollow } = useFollow(instructorId)
    const scaleAnim = React.useRef(new Animated.Value(1)).current

    const handlePress = async () => {
        // Haptic feedback
        Haptics.impactAsync(
            isFollowing
                ? Haptics.ImpactFeedbackStyle.Light
                : Haptics.ImpactFeedbackStyle.Medium
        )

        // Scale animation
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.9,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start()

        await toggleFollow()
    }

    const sizeStyles = {
        small: styles.buttonSmall,
        medium: styles.buttonMedium,
        large: styles.buttonLarge,
    }

    const textSizeStyles = {
        small: styles.textSmall,
        medium: styles.textMedium,
        large: styles.textLarge,
    }

    const getButtonStyle = () => {
        if (isFollowing) {
            return variant === "filled"
                ? styles.followingFilled
                : styles.followingOutlined
        }
        return variant === "filled"
            ? styles.notFollowingFilled
            : styles.notFollowingOutlined
    }

    const getTextStyle = () => {
        if (isFollowing) {
            return variant === "filled"
                ? styles.followingTextFilled
                : styles.followingTextOutlined
        }
        return variant === "filled"
            ? styles.notFollowingTextFilled
            : styles.notFollowingTextOutlined
    }

    if (isLoading) {
        return (
            <Animated.View
                style={[
                    styles.button,
                    sizeStyles[size],
                    styles.loadingButton,
                    { transform: [{ scale: scaleAnim }] },
                ]}
            >
                <ActivityIndicator size="small" color="#7ED957" />
            </Animated.View>
        )
    }

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
                style={[styles.button, sizeStyles[size], getButtonStyle()]}
                onPress={handlePress}
                activeOpacity={0.8}
            >
                <Ionicons
                    name={isFollowing ? "checkmark" : "add"}
                    size={size === "small" ? 14 : size === "medium" ? 16 : 18}
                    color={
                        isFollowing
                            ? variant === "filled"
                                ? "#0A0A0A"
                                : "#7ED957"
                            : variant === "filled"
                                ? "#0A0A0A"
                                : "#7ED957"
                    }
                    style={{ marginRight: 4 }}
                />
                <Text style={[textSizeStyles[size], getTextStyle()]}>
                    {isFollowing ? "Following" : "Follow"}
                </Text>
            </TouchableOpacity>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 20,
    },
    buttonSmall: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    buttonMedium: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    buttonLarge: {
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    loadingButton: {
        backgroundColor: "#1A1A1A",
    },
    // Not following states
    notFollowingFilled: {
        backgroundColor: "#7ED957",
    },
    notFollowingOutlined: {
        backgroundColor: "transparent",
        borderWidth: 1.5,
        borderColor: "#7ED957",
    },
    notFollowingTextFilled: {
        color: "#0A0A0A",
    },
    notFollowingTextOutlined: {
        color: "#7ED957",
    },
    // Following states
    followingFilled: {
        backgroundColor: "#1A1A1A",
        borderWidth: 1,
        borderColor: "#333",
    },
    followingOutlined: {
        backgroundColor: "transparent",
        borderWidth: 1.5,
        borderColor: "#333",
    },
    followingTextFilled: {
        color: "#FFFFFF",
    },
    followingTextOutlined: {
        color: "#9CA3AF",
    },
    // Text sizes
    textSmall: {
        fontSize: 12,
        fontWeight: "600",
    },
    textMedium: {
        fontSize: 14,
        fontWeight: "600",
    },
    textLarge: {
        fontSize: 16,
        fontWeight: "700",
    },
})

export default FollowButton
