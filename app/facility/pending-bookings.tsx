/**
 * Pending Bookings Screen
 * 
 * Shows incoming booking requests that need facility owner confirmation.
 * Features:
 * - Real-time updates via Firestore listener
 * - Quick confirm/decline buttons
 * - Countdown timer showing time left to respond
 * - Auto-confirm notification
 */

import React, { useState, useEffect, useCallback } from "react"
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"

import { useAuth } from "@/lib/auth-context"
import { db, functions } from "@/lib/firebase-config"
import { colors } from "@/lib/theme"

interface PendingBooking {
    id: string
    playerId: string
    playerName: string
    playerEmail: string
    facilityId: string
    courtId: string
    courtName: string
    date: string
    startTime: string
    endTime: string
    price: number
    status: string
    createdAt: string
    expiresAt: string
}

export default function PendingBookingsScreen() {
    const { user } = useAuth()
    const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [now, setNow] = useState(new Date())

    // Update clock every second for countdown
    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000)
        return () => clearInterval(interval)
    }, [])

    // Real-time listener for pending bookings
    useEffect(() => {
        if (!user || !db) return

        setLoading(true)

        const unsubscribe = db.collection("pendingBookings")
            .where("facilityOwnerId", "==", user.uid)
            .where("status", "==", "pending")
            .orderBy("createdAt", "desc")
            .onSnapshot((snapshot) => {
                const bookings = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate?.()?.toISOString(),
                    expiresAt: doc.data().expiresAt?.toDate?.()?.toISOString(),
                })) as PendingBooking[]

                setPendingBookings(bookings)
                setLoading(false)
                setRefreshing(false)
            }, (error) => {
                console.error("Error fetching pending bookings:", error)
                setLoading(false)
                setRefreshing(false)
            })

        return () => unsubscribe()
    }, [user])

    const onRefresh = useCallback(() => {
        setRefreshing(true)
        // Listener will automatically refresh
    }, [])

    const handleConfirm = async (bookingId: string) => {
        if (!functions) return
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        setProcessingId(bookingId)

        try {
            const confirmBooking = functions.httpsCallable("confirmBooking")
            await confirmBooking({ bookingId })

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            Alert.alert("Confirmed!", "The booking has been confirmed. The player has been notified.")
        } catch (error: any) {
            console.error("Error confirming booking:", error)
            Alert.alert("Error", error.message || "Failed to confirm booking")
        } finally {
            setProcessingId(null)
        }
    }

    const handleDecline = async (bookingId: string, courtName: string) => {
        if (!functions) return
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

        Alert.alert(
            "Decline Booking?",
            `This will notify the player that ${courtName} is unavailable.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Decline",
                    style: "destructive",
                    onPress: async () => {
                        setProcessingId(bookingId)
                        try {
                            const declineBooking = functions.httpsCallable("declineBooking")
                            await declineBooking({ bookingId, reason: "Slot no longer available" })

                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
                        } catch (error: any) {
                            console.error("Error declining booking:", error)
                            Alert.alert("Error", error.message || "Failed to decline booking")
                        } finally {
                            setProcessingId(null)
                        }
                    },
                },
            ]
        )
    }

    const getTimeRemaining = (expiresAt: string): { minutes: number; seconds: number; expired: boolean } => {
        const expires = new Date(expiresAt)
        const diff = expires.getTime() - now.getTime()

        if (diff <= 0) {
            return { minutes: 0, seconds: 0, expired: true }
        }

        const minutes = Math.floor(diff / 60000)
        const seconds = Math.floor((diff % 60000) / 1000)

        return { minutes, seconds, expired: false }
    }

    const formatPrice = (cents: number) => {
        return `$${(cents / 100).toFixed(0)}`
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={["#0A0A0A", "#111"]} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Pending Bookings</Text>
                    <View style={styles.headerBadge}>
                        <Text style={styles.headerBadgeText}>{pendingBookings.length}</Text>
                    </View>
                </View>

                <ScrollView
                    contentContainerStyle={styles.content}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={colors.primary}
                        />
                    }
                >
                    {pendingBookings.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="checkmark-circle-outline" size={64} color="#333" />
                            <Text style={styles.emptyTitle}>All Caught Up!</Text>
                            <Text style={styles.emptyText}>
                                No pending booking requests right now.
                            </Text>
                        </View>
                    ) : (
                        <>
                            <Text style={styles.infoText}>
                                Bookings will auto-confirm if you don't respond in time.
                            </Text>

                            {pendingBookings.map((booking) => {
                                const timeRemaining = getTimeRemaining(booking.expiresAt)
                                const isProcessing = processingId === booking.id

                                return (
                                    <View key={booking.id} style={styles.bookingCard}>
                                        {/* Countdown Timer */}
                                        <View style={[
                                            styles.timerBadge,
                                            timeRemaining.minutes < 2 && styles.timerBadgeUrgent,
                                        ]}>
                                            <Ionicons
                                                name="time-outline"
                                                size={14}
                                                color={timeRemaining.minutes < 2 ? "#FF6B6B" : colors.primary}
                                            />
                                            <Text style={[
                                                styles.timerText,
                                                timeRemaining.minutes < 2 && styles.timerTextUrgent,
                                            ]}>
                                                {timeRemaining.expired
                                                    ? "Auto-confirming..."
                                                    : `${timeRemaining.minutes}:${timeRemaining.seconds.toString().padStart(2, "0")}`
                                                }
                                            </Text>
                                        </View>

                                        {/* Booking Details */}
                                        <View style={styles.bookingHeader}>
                                            <View style={styles.courtBadge}>
                                                <Ionicons name="tennisball" size={16} color={colors.primary} />
                                                <Text style={styles.courtName}>{booking.courtName}</Text>
                                            </View>
                                            <Text style={styles.price}>{formatPrice(booking.price)}</Text>
                                        </View>

                                        <View style={styles.bookingDetails}>
                                            <View style={styles.detailRow}>
                                                <Ionicons name="calendar-outline" size={16} color="#888" />
                                                <Text style={styles.detailText}>{booking.date}</Text>
                                            </View>
                                            <View style={styles.detailRow}>
                                                <Ionicons name="time-outline" size={16} color="#888" />
                                                <Text style={styles.detailText}>
                                                    {booking.startTime} - {booking.endTime}
                                                </Text>
                                            </View>
                                            <View style={styles.detailRow}>
                                                <Ionicons name="person-outline" size={16} color="#888" />
                                                <Text style={styles.detailText}>{booking.playerName}</Text>
                                            </View>
                                        </View>

                                        {/* Action Buttons */}
                                        <View style={styles.actionButtons}>
                                            <TouchableOpacity
                                                style={styles.declineBtn}
                                                onPress={() => handleDecline(booking.id, booking.courtName)}
                                                disabled={isProcessing}
                                            >
                                                {isProcessing ? (
                                                    <ActivityIndicator size="small" color="#FF6B6B" />
                                                ) : (
                                                    <>
                                                        <Ionicons name="close" size={20} color="#FF6B6B" />
                                                        <Text style={styles.declineBtnText}>Unavailable</Text>
                                                    </>
                                                )}
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={styles.confirmBtn}
                                                onPress={() => handleConfirm(booking.id)}
                                                disabled={isProcessing}
                                            >
                                                <LinearGradient
                                                    colors={["#7ED957", "#4C9E29"]}
                                                    style={styles.confirmBtnGradient}
                                                >
                                                    {isProcessing ? (
                                                        <ActivityIndicator size="small" color="#000" />
                                                    ) : (
                                                        <>
                                                            <Ionicons name="checkmark" size={20} color="#000" />
                                                            <Text style={styles.confirmBtnText}>Confirm</Text>
                                                        </>
                                                    )}
                                                </LinearGradient>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )
                            })}
                        </>
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0A0A0A" },
    loadingContainer: { flex: 1, backgroundColor: "#0A0A0A", justifyContent: "center", alignItems: "center" },
    safeArea: { flex: 1 },

    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#1A1A1A",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        flex: 1,
        color: "#FFF",
        fontSize: 18,
        fontWeight: "bold",
        marginLeft: 16,
    },
    headerBadge: {
        backgroundColor: colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    headerBadgeText: { color: "#000", fontSize: 14, fontWeight: "bold" },

    content: { paddingHorizontal: 20, paddingBottom: 40 },

    infoText: {
        color: "#888",
        fontSize: 13,
        textAlign: "center",
        marginBottom: 20,
    },

    emptyState: { alignItems: "center", paddingTop: 60 },
    emptyTitle: { color: "#FFF", fontSize: 20, fontWeight: "bold", marginTop: 16 },
    emptyText: { color: "#888", fontSize: 14, textAlign: "center", marginTop: 8 },

    bookingCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#333",
    },

    timerBadge: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        gap: 4,
        backgroundColor: "rgba(126, 217, 87, 0.15)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 16,
    },
    timerBadgeUrgent: {
        backgroundColor: "rgba(255, 107, 107, 0.15)",
    },
    timerText: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.primary,
    },
    timerTextUrgent: {
        color: "#FF6B6B",
    },

    bookingHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    courtBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    courtName: {
        color: "#FFF",
        fontSize: 18,
        fontWeight: "bold",
    },
    price: {
        color: colors.primary,
        fontSize: 20,
        fontWeight: "bold",
    },

    bookingDetails: { gap: 8, marginBottom: 20 },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    detailText: { color: "#CCC", fontSize: 14 },

    actionButtons: {
        flexDirection: "row",
        gap: 12,
    },
    declineBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        backgroundColor: "rgba(255, 107, 107, 0.15)",
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255, 107, 107, 0.3)",
    },
    declineBtnText: {
        color: "#FF6B6B",
        fontSize: 15,
        fontWeight: "600",
    },
    confirmBtn: {
        flex: 1.5,
        borderRadius: 12,
        overflow: "hidden",
    },
    confirmBtnGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 14,
    },
    confirmBtnText: {
        color: "#000",
        fontSize: 15,
        fontWeight: "700",
    },
})
