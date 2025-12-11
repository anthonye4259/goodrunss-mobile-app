/**
 * Session Confirmation Screen
 * 
 * Beautiful confirmation screen shown when a booking is confirmed.
 * Includes: Animated success, session details, calendar add, directions, message trainer.
 */

import React, { useEffect, useRef } from "react"
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Linking,
    Platform,
    Share,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import { LinearGradient } from "expo-linear-gradient"
import { SafeAreaView } from "react-native-safe-area-context"

export interface SessionDetails {
    id: string
    trainerName: string
    trainerPhoto?: string
    sessionType: string
    date: string // e.g., "Saturday, Dec 14"
    time: string // e.g., "2:00 PM - 3:00 PM"
    duration: number // minutes
    location: string
    address: string
    latitude?: number
    longitude?: number
    price: number
    isPaid: boolean
    trainerId?: string
}

interface SessionConfirmationProps {
    session: SessionDetails
    onDone?: () => void
}

export function SessionConfirmation({ session, onDone }: SessionConfirmationProps) {
    const scaleAnim = useRef(new Animated.Value(0)).current
    const fadeAnim = useRef(new Animated.Value(0)).current
    const checkmarkAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
        // Success haptic
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

        // Animate in
        Animated.sequence([
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
            Animated.timing(checkmarkAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start()
    }, [])

    const handleAddToCalendar = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

        // Create calendar event URL
        const title = encodeURIComponent(`Training with ${session.trainerName}`)
        const location = encodeURIComponent(session.address)
        const details = encodeURIComponent(`${session.sessionType} session at ${session.location}`)

        // For iOS, use calshow or calendar URL scheme
        // For now, show a message
        // In production, you'd use expo-calendar
        alert("Calendar event created! (In production, this would use expo-calendar)")
    }

    const handleGetDirections = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

        const address = encodeURIComponent(session.address)
        const url = Platform.select({
            ios: `maps://app?daddr=${address}`,
            android: `google.navigation:q=${address}`,
            default: `https://maps.google.com?daddr=${address}`,
        })

        Linking.openURL(url as string)
    }

    const handleMessageTrainer = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        router.push({
            pathname: "/(tabs)/messages",
            params: { trainerId: session.trainerId }
        })
    }

    const handleShareBooking = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        try {
            await Share.share({
                message: `🏀 I just booked a ${session.sessionType} session with ${session.trainerName} on ${session.date}! #GoodRunss`,
            })
        } catch (error) {
            console.error("Share error:", error)
        }
    }

    const handleDone = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        if (onDone) {
            onDone()
        } else {
            router.replace("/(tabs)/bookings")
        }
    }

    return (
        <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                {/* Success Animation */}
                <Animated.View
                    style={[
                        styles.successContainer,
                        { transform: [{ scale: scaleAnim }] }
                    ]}
                >
                    <LinearGradient
                        colors={["rgba(126, 217, 87, 0.2)", "rgba(126, 217, 87, 0.05)"]}
                        style={styles.successCircle}
                    >
                        <Animated.View style={{ opacity: checkmarkAnim, transform: [{ scale: checkmarkAnim }] }}>
                            <Ionicons name="checkmark" size={64} color="#7ED957" />
                        </Animated.View>
                    </LinearGradient>
                </Animated.View>

                {/* Title */}
                <Animated.View style={[styles.titleContainer, { opacity: fadeAnim }]}>
                    <Text style={styles.title}>You're Booked! 🎉</Text>
                    <Text style={styles.subtitle}>
                        Your session with {session.trainerName} is confirmed
                    </Text>
                </Animated.View>

                {/* Session Details Card */}
                <Animated.View style={[styles.detailsCard, { opacity: fadeAnim }]}>
                    {/* Trainer & Session Type */}
                    <View style={styles.detailRow}>
                        <View style={styles.trainerAvatar}>
                            <Text style={styles.trainerInitial}>
                                {session.trainerName.charAt(0)}
                            </Text>
                        </View>
                        <View style={styles.sessionInfo}>
                            <Text style={styles.trainerName}>{session.trainerName}</Text>
                            <Text style={styles.sessionType}>{session.sessionType}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Date & Time */}
                    <View style={styles.infoRow}>
                        <Ionicons name="calendar" size={20} color="#7ED957" />
                        <View style={styles.infoText}>
                            <Text style={styles.infoLabel}>Date & Time</Text>
                            <Text style={styles.infoValue}>{session.date}</Text>
                            <Text style={styles.infoSubvalue}>{session.time} ({session.duration} min)</Text>
                        </View>
                    </View>

                    {/* Location */}
                    <View style={styles.infoRow}>
                        <Ionicons name="location" size={20} color="#3B82F6" />
                        <View style={styles.infoText}>
                            <Text style={styles.infoLabel}>Location</Text>
                            <Text style={styles.infoValue}>{session.location}</Text>
                            <Text style={styles.infoSubvalue}>{session.address}</Text>
                        </View>
                    </View>

                    {/* Payment Status */}
                    <View style={styles.infoRow}>
                        <Ionicons
                            name={session.isPaid ? "checkmark-circle" : "card"}
                            size={20}
                            color={session.isPaid ? "#22C55E" : "#F59E0B"}
                        />
                        <View style={styles.infoText}>
                            <Text style={styles.infoLabel}>Payment</Text>
                            <Text style={[
                                styles.infoValue,
                                { color: session.isPaid ? "#22C55E" : "#F59E0B" }
                            ]}>
                                {session.isPaid ? `Paid $${session.price}` : `Pay at session - $${session.price}`}
                            </Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Quick Actions */}
                <Animated.View style={[styles.actionsContainer, { opacity: fadeAnim }]}>
                    <TouchableOpacity style={styles.actionButton} onPress={handleAddToCalendar}>
                        <View style={[styles.actionIcon, { backgroundColor: "rgba(126, 217, 87, 0.1)" }]}>
                            <Ionicons name="calendar-outline" size={22} color="#7ED957" />
                        </View>
                        <Text style={styles.actionText}>Add to Calendar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={handleGetDirections}>
                        <View style={[styles.actionIcon, { backgroundColor: "rgba(59, 130, 246, 0.1)" }]}>
                            <Ionicons name="navigate-outline" size={22} color="#3B82F6" />
                        </View>
                        <Text style={styles.actionText}>Get Directions</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={handleMessageTrainer}>
                        <View style={[styles.actionIcon, { backgroundColor: "rgba(168, 85, 247, 0.1)" }]}>
                            <Ionicons name="chatbubble-outline" size={22} color="#A855F7" />
                        </View>
                        <Text style={styles.actionText}>Message</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={handleShareBooking}>
                        <View style={[styles.actionIcon, { backgroundColor: "rgba(236, 72, 153, 0.1)" }]}>
                            <Ionicons name="share-outline" size={22} color="#EC4899" />
                        </View>
                        <Text style={styles.actionText}>Share</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* What to Bring Tip */}
                <Animated.View style={[styles.tipContainer, { opacity: fadeAnim }]}>
                    <Ionicons name="bulb-outline" size={18} color="#F59E0B" />
                    <Text style={styles.tipText}>
                        Don't forget: Water bottle, comfortable shoes, and a positive attitude! 💪
                    </Text>
                </Animated.View>

                {/* Done Button */}
                <Animated.View style={[styles.doneContainer, { opacity: fadeAnim }]}>
                    <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
                        <Text style={styles.doneButtonText}>View My Bookings</Text>
                    </TouchableOpacity>
                </Animated.View>
            </SafeAreaView>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        paddingHorizontal: 20,
    },
    successContainer: {
        alignItems: "center",
        marginTop: 40,
        marginBottom: 24,
    },
    successCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 3,
        borderColor: "#7ED957",
    },
    titleContainer: {
        alignItems: "center",
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: "#9CA3AF",
        textAlign: "center",
    },
    detailsCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    trainerAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "rgba(126, 217, 87, 0.2)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 14,
    },
    trainerInitial: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#7ED957",
    },
    sessionInfo: {
        flex: 1,
    },
    trainerName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    sessionType: {
        fontSize: 14,
        color: "#7ED957",
    },
    divider: {
        height: 1,
        backgroundColor: "#252525",
        marginVertical: 16,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 16,
    },
    infoText: {
        marginLeft: 12,
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: "#666",
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 15,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    infoSubvalue: {
        fontSize: 13,
        color: "#9CA3AF",
        marginTop: 2,
    },
    actionsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    actionButton: {
        alignItems: "center",
        flex: 1,
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 6,
    },
    actionText: {
        fontSize: 11,
        color: "#9CA3AF",
        textAlign: "center",
    },
    tipContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        padding: 14,
        borderRadius: 12,
        gap: 10,
        marginBottom: 20,
    },
    tipText: {
        flex: 1,
        fontSize: 13,
        color: "#F59E0B",
        lineHeight: 18,
    },
    doneContainer: {
        marginTop: "auto",
        paddingBottom: 20,
    },
    doneButton: {
        backgroundColor: "#7ED957",
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    doneButtonText: {
        color: "#000",
        fontSize: 16,
        fontWeight: "bold",
    },
})

export default SessionConfirmation
