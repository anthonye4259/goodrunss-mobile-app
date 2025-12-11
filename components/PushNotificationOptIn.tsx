/**
 * Push Notification Opt-In Screen
 * 
 * Shows during onboarding to request notification permissions.
 * Highlights benefits specific to user type.
 */

import React from "react"
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { NotificationService } from "@/lib/notification-service"

interface PushNotificationOptInProps {
    userType: "player" | "trainer" | "instructor" | "both" | null
    onEnable: () => void
    onSkip: () => void
}

const BENEFITS = {
    player: [
        { icon: "basketball", text: "Get notified when courts near you are active" },
        { icon: "people", text: "Know when games near you need players" },
        { icon: "flash", text: "Flash deals on trainer sessions" },
        { icon: "notifications", text: "Reminders for your booked sessions" },
    ],
    trainer: [
        { icon: "calendar", text: "Instant alerts for new booking requests" },
        { icon: "cash", text: "Know when you get paid" },
        { icon: "chatbubble", text: "Client message notifications" },
        { icon: "people", text: "Waitlist notifications" },
    ],
    instructor: [
        { icon: "calendar", text: "Instant alerts for new booking requests" },
        { icon: "cash", text: "Know when you get paid" },
        { icon: "chatbubble", text: "Student message notifications" },
        { icon: "time", text: "Session reminders" },
    ],
}

export function PushNotificationOptIn({ userType, onEnable, onSkip }: PushNotificationOptInProps) {
    const benefits = BENEFITS[userType === "both" ? "player" : (userType || "player")]

    const handleEnable = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        const notificationService = NotificationService.getInstance()
        const granted = await notificationService.requestPermissions()
        if (granted) {
            await notificationService.registerForPushNotifications()
        }
        onEnable()
    }

    const handleSkip = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        onSkip()
    }

    return (
        <View style={styles.container}>
            {/* Icon */}
            <View style={styles.iconContainer}>
                <Ionicons name="notifications" size={64} color="#7ED957" />
                <View style={styles.iconBadge}>
                    <Text style={styles.iconBadgeText}>1</Text>
                </View>
            </View>

            {/* Title */}
            <Text style={styles.title}>Stay in the Loop</Text>
            <Text style={styles.subtitle}>
                Enable notifications to never miss important updates
            </Text>

            {/* Benefits List */}
            <View style={styles.benefitsList}>
                {benefits.map((benefit, index) => (
                    <View key={index} style={styles.benefitRow}>
                        <View style={styles.benefitIcon}>
                            <Ionicons name={benefit.icon as any} size={20} color="#7ED957" />
                        </View>
                        <Text style={styles.benefitText}>{benefit.text}</Text>
                    </View>
                ))}
            </View>

            {/* Actions */}
            <TouchableOpacity style={styles.enableButton} onPress={handleEnable}>
                <Ionicons name="notifications" size={20} color="#000" />
                <Text style={styles.enableButtonText}>Enable Notifications</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipButtonText}>Maybe Later</Text>
            </TouchableOpacity>

            {/* Privacy Note */}
            <Text style={styles.privacyNote}>
                You can change this anytime in Settings
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "rgba(126, 217, 87, 0.1)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24,
    },
    iconBadge: {
        position: "absolute",
        top: 8,
        right: 8,
        backgroundColor: "#EF4444",
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    iconBadgeText: {
        color: "#FFF",
        fontSize: 12,
        fontWeight: "bold",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 8,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        color: "#9CA3AF",
        textAlign: "center",
        marginBottom: 32,
    },
    benefitsList: {
        width: "100%",
        marginBottom: 32,
    },
    benefitRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#252525",
    },
    benefitIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(126, 217, 87, 0.1)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    benefitText: {
        fontSize: 15,
        color: "#FFFFFF",
        flex: 1,
    },
    enableButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#7ED957",
        width: "100%",
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
        marginBottom: 12,
    },
    enableButtonText: {
        color: "#000",
        fontSize: 16,
        fontWeight: "bold",
    },
    skipButton: {
        paddingVertical: 12,
    },
    skipButtonText: {
        color: "#666",
        fontSize: 14,
    },
    privacyNote: {
        position: "absolute",
        bottom: 32,
        fontSize: 12,
        color: "#666",
        textAlign: "center",
    },
})
