/**
 * Session Confirmation Toast
 * 
 * Special toast for booking confirmations with confetti option.
 * Celebrates successful bookings.
 */

import { View, Text, StyleSheet, Animated, TouchableOpacity } from "react-native"
import { useRef, useEffect } from "react"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"

type Props = {
    visible: boolean
    clientName: string
    sessionDate: string
    sessionTime: string
    amount?: number
    onDismiss: () => void
    onViewBooking?: () => void
}

export function SessionConfirmationToast({
    visible,
    clientName,
    sessionDate,
    sessionTime,
    amount,
    onDismiss,
    onViewBooking
}: Props) {
    const slideAnim = useRef(new Animated.Value(-200)).current
    const scaleAnim = useRef(new Animated.Value(0.8)).current

    useEffect(() => {
        if (visible) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 50,
                    friction: 8,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    useNativeDriver: true,
                }),
            ]).start()

            // Auto dismiss after 5 seconds
            const timer = setTimeout(() => {
                handleDismiss()
            }, 5000)

            return () => clearTimeout(timer)
        }
    }, [visible])

    const handleDismiss = () => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: -200,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 0.8,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => onDismiss())
    }

    if (!visible) return null

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [
                        { translateY: slideAnim },
                        { scale: scaleAnim }
                    ]
                }
            ]}
        >
            <LinearGradient
                colors={["#22C55E", "#16A34A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                    </View>

                    <View style={styles.info}>
                        <Text style={styles.title}>Session Confirmed! 🎉</Text>
                        <Text style={styles.details}>
                            {clientName} • {sessionDate} at {sessionTime}
                        </Text>
                        {amount && (
                            <Text style={styles.amount}>${amount} earned</Text>
                        )}
                    </View>

                    <TouchableOpacity onPress={handleDismiss} style={styles.dismissBtn}>
                        <Ionicons name="close" size={20} color="rgba(255,255,255,0.6)" />
                    </TouchableOpacity>
                </View>

                {onViewBooking && (
                    <TouchableOpacity style={styles.viewButton} onPress={onViewBooking}>
                        <Text style={styles.viewText}>View Booking</Text>
                        <Ionicons name="chevron-forward" size={16} color="#FFF" />
                    </TouchableOpacity>
                )}
            </LinearGradient>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 60,
        left: 16,
        right: 16,
        borderRadius: 20,
        overflow: "hidden",
        shadowColor: "#22C55E",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 10,
        zIndex: 1000,
    },
    gradient: {
        padding: 16,
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(255,255,255,0.2)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    info: {
        flex: 1,
    },
    title: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "700",
    },
    details: {
        color: "rgba(255,255,255,0.8)",
        fontSize: 12,
        marginTop: 2,
    },
    amount: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "700",
        marginTop: 4,
    },
    dismissBtn: {
        padding: 4,
    },
    viewButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.2)",
    },
    viewText: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "600",
    },
})

export default SessionConfirmationToast
