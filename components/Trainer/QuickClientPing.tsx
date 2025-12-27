/**
 * Quick Client Ping
 * 
 * One-tap "Hey, let's book!" message to clients.
 * Fast way to re-engage clients.
 */

import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"

type Props = {
    clientName: string
    clientId: string
    onSend: (clientId: string, message: string) => void
    variant?: "button" | "fab"
}

const PING_MESSAGES = [
    "Hey! Ready for another session this week? 💪",
    "Miss training with you! When can we book your next session?",
    "Time to level up! Want to schedule this week?",
    "Your gains are calling! Let's book a session 🏋️",
]

export function QuickClientPing({ clientName, clientId, onSend, variant = "button" }: Props) {
    const handlePing = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        Alert.alert(
            `Ping ${clientName}?`,
            "Send a quick re-engagement message",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Send Ping",
                    onPress: () => {
                        const message = PING_MESSAGES[Math.floor(Math.random() * PING_MESSAGES.length)]
                        onSend(clientId, message)
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                    }
                },
            ]
        )
    }

    if (variant === "fab") {
        return (
            <TouchableOpacity style={styles.fab} onPress={handlePing} activeOpacity={0.9}>
                <Ionicons name="chatbubble-ellipses" size={24} color="#000" />
            </TouchableOpacity>
        )
    }

    return (
        <TouchableOpacity style={styles.button} onPress={handlePing} activeOpacity={0.8}>
            <Ionicons name="chatbubble-ellipses" size={16} color="#7ED957" />
            <Text style={styles.buttonText}>Quick Ping</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#7ED95720",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#7ED95740",
    },
    buttonText: {
        color: "#7ED957",
        fontSize: 13,
        fontWeight: "600",
    },
    fab: {
        position: "absolute",
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#7ED957",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#7ED957",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
})

export default QuickClientPing
