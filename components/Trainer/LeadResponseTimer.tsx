/**
 * Lead Response Timer
 * 
 * Shows urgency timer for responding to new leads.
 * Fast response = higher conversion rate.
 */

import { View, Text, StyleSheet, Animated } from "react-native"
import { useRef, useEffect, useState } from "react"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"

type Props = {
    leadReceivedAt: Date
    goalMinutes?: number // Default 60 minutes
    onExpired?: () => void
}

export function LeadResponseTimer({ leadReceivedAt, goalMinutes = 60, onExpired }: Props) {
    const [timeLeft, setTimeLeft] = useState(0)
    const [expired, setExpired] = useState(false)
    const pulseAnim = useRef(new Animated.Value(1)).current

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date()
            const diff = leadReceivedAt.getTime() + (goalMinutes * 60 * 1000) - now.getTime()

            if (diff <= 0) {
                setExpired(true)
                setTimeLeft(0)
                onExpired?.()
            } else {
                setTimeLeft(diff)
                setExpired(false)
            }
        }

        updateTimer()
        const interval = setInterval(updateTimer, 1000)
        return () => clearInterval(interval)
    }, [leadReceivedAt, goalMinutes])

    // Pulse animation when time is low
    useEffect(() => {
        if (timeLeft > 0 && timeLeft < 10 * 60 * 1000) { // Last 10 minutes
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.1,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                ])
            ).start()
        }
    }, [timeLeft < 10 * 60 * 1000])

    const formatTime = (ms: number) => {
        const minutes = Math.floor(ms / 60000)
        const seconds = Math.floor((ms % 60000) / 1000)
        return `${minutes}:${seconds.toString().padStart(2, "0")}`
    }

    const getUrgency = () => {
        if (expired) return { color: "#EF4444", label: "Response Overdue!", bg: "#EF444420" }
        const minutesLeft = timeLeft / 60000
        if (minutesLeft < 15) return { color: "#EF4444", label: "Respond NOW!", bg: "#EF444420" }
        if (minutesLeft < 30) return { color: "#F97316", label: "Respond Soon", bg: "#F9731620" }
        return { color: "#22C55E", label: "Good Response Time", bg: "#22C55E20" }
    }

    const urgency = getUrgency()
    const progress = expired ? 0 : (timeLeft / (goalMinutes * 60 * 1000)) * 100

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[urgency.bg, "transparent"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.header}>
                    <View style={[styles.iconContainer, { backgroundColor: urgency.bg }]}>
                        <Ionicons
                            name={expired ? "alert" : "timer"}
                            size={20}
                            color={urgency.color}
                        />
                    </View>
                    <View style={styles.headerText}>
                        <Text style={styles.title}>Lead Response Time</Text>
                        <Text style={[styles.urgencyLabel, { color: urgency.color }]}>
                            {urgency.label}
                        </Text>
                    </View>
                </View>

                <Animated.View style={[styles.timerContainer, { transform: [{ scale: pulseAnim }] }]}>
                    <Text style={[styles.timer, { color: urgency.color }]}>
                        {expired ? "OVERDUE" : formatTime(timeLeft)}
                    </Text>
                    <Text style={styles.timerLabel}>
                        {expired ? "Lead waiting" : "remaining"}
                    </Text>
                </Animated.View>

                {/* Progress bar */}
                <View style={styles.progressTrack}>
                    <View
                        style={[
                            styles.progressFill,
                            { width: `${progress}%`, backgroundColor: urgency.color }
                        ]}
                    />
                </View>

                <Text style={styles.tip}>
                    💡 Responding within 1 hour increases conversion by 70%
                </Text>
            </LinearGradient>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 20,
        overflow: "hidden",
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#22C55E30",
    },
    gradient: {
        padding: 16,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 16,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    headerText: {
        flex: 1,
    },
    title: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "600",
    },
    urgencyLabel: {
        fontSize: 12,
        fontWeight: "700",
        marginTop: 2,
    },
    timerContainer: {
        alignItems: "center",
        marginBottom: 16,
    },
    timer: {
        fontSize: 48,
        fontWeight: "800",
    },
    timerLabel: {
        color: "#666",
        fontSize: 12,
        marginTop: 4,
    },
    progressTrack: {
        height: 4,
        backgroundColor: "#333",
        borderRadius: 2,
        overflow: "hidden",
        marginBottom: 12,
    },
    progressFill: {
        height: "100%",
        borderRadius: 2,
    },
    tip: {
        color: "#888",
        fontSize: 11,
        textAlign: "center",
    },
})

export default LeadResponseTimer
