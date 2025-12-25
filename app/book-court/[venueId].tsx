/**
 * Court Booking Screen
 * Allows players to book courts at racquet facilities
 */

import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    StyleSheet,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router, useLocalSearchParams } from "expo-router"
import * as Haptics from "expo-haptics"
import { useStripe } from "@stripe/stripe-react-native"

import { useAuth } from "@/lib/auth-context"
import { venueService } from "@/lib/services/venue-service"
import { facilityService, Court } from "@/lib/services/facility-service"
import {
    courtBookingService,
    PLAYER_BOOKING_FEE,
    AvailableSlot
} from "@/lib/services/court-booking-service"

export default function BookCourtScreen() {
    const { venueId } = useLocalSearchParams()
    const { user } = useAuth()
    const { initPaymentSheet, presentPaymentSheet } = useStripe()

    // State
    const [venue, setVenue] = useState<any>(null)
    const [courts, setCourts] = useState<Court[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedDate, setSelectedDate] = useState<string>("")
    const [selectedCourt, setSelectedCourt] = useState<Court | null>(null)
    const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null)
    const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([])
    const [loadingSlots, setLoadingSlots] = useState(false)
    const [bookingInProgress, setBookingInProgress] = useState(false)

    // Generate next 7 days for date selection
    const dates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() + i)
        return {
            dateStr: date.toISOString().split("T")[0],
            dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
            dayNum: date.getDate(),
            isToday: i === 0,
        }
    })

    useEffect(() => {
        loadVenueAndCourts()
        // Set default date to today
        setSelectedDate(dates[0].dateStr)
    }, [venueId])

    useEffect(() => {
        if (selectedCourt && selectedDate) {
            loadAvailableSlots()
        }
    }, [selectedCourt, selectedDate])

    const loadVenueAndCourts = async () => {
        if (typeof venueId !== "string") return
        setLoading(true)

        try {
            // Load venue info
            const venueData = await venueService.getVenueById(venueId)
            setVenue(venueData)

            // Load claimed facility and courts
            const facility = await facilityService.getClaimedFacility(venueId)
            if (facility) {
                const facilityCourtsList = await facilityService.getCourts(facility.id)
                setCourts(facilityCourtsList)
                if (facilityCourtsList.length > 0) {
                    setSelectedCourt(facilityCourtsList[0])
                }
            } else {
                // Facility not claimed - generate mock courts for demo
                const mockCourts: Court[] = [
                    { id: "mock-1", facilityId: venueId, name: "Court 1", type: "Outdoor", hourlyRate: 4000, isActive: true },
                    { id: "mock-2", facilityId: venueId, name: "Court 2", type: "Outdoor", hourlyRate: 4000, isActive: true },
                ]
                setCourts(mockCourts)
                setSelectedCourt(mockCourts[0])
            }
        } catch (error) {
            console.error("Error loading venue:", error)
        } finally {
            setLoading(false)
        }
    }

    const loadAvailableSlots = async () => {
        if (!selectedCourt) return
        setLoadingSlots(true)

        try {
            const slots = await courtBookingService.getAvailableSlots(
                selectedCourt.id,
                selectedDate
            )

            // Enrich with court info
            const enrichedSlots = slots.map(slot => ({
                ...slot,
                courtName: selectedCourt.name,
                hourlyRate: selectedCourt.hourlyRate,
            }))

            setAvailableSlots(enrichedSlots)
        } catch (error) {
            console.error("Error loading slots:", error)
        } finally {
            setLoadingSlots(false)
        }
    }

    const handleBookCourt = async () => {
        if (!selectedSlot || !selectedCourt || !user) {
            Alert.alert("Error", "Please select a time slot")
            return
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
        setBookingInProgress(true)

        try {
            // Calculate pricing
            const pricing = courtBookingService.calculatePricing(
                selectedCourt.hourlyRate,
                60, // 1 hour
                0.08 // 8% take rate
            )

            // Create the booking
            const bookingId = await courtBookingService.createBooking({
                courtId: selectedCourt.id,
                facilityId: selectedCourt.facilityId,
                venueId: venueId as string,
                userId: user.uid,
                userName: user.displayName || "Player",
                userEmail: user.email || undefined,
                date: selectedDate,
                startTime: selectedSlot.startTime,
                endTime: selectedSlot.endTime,
                durationMinutes: 60,
                courtRate: pricing.courtRate,
                playerFee: pricing.playerFee,
                facilityTakeRate: 0.08,
                facilityPayout: pricing.facilityPayout,
                totalCharged: pricing.totalCharged,
                stripePaymentIntentId: "demo_payment_" + Date.now(),
            })

            if (bookingId) {
                // Navigate to confirmation screen
                router.replace({
                    pathname: "/booking-confirmation",
                    params: {
                        venueName: venue?.name || "Venue",
                        courtName: selectedCourt.name,
                        date: selectedDate,
                        startTime: selectedSlot.startTime,
                        endTime: selectedSlot.endTime,
                        total: (pricing.totalCharged / 100).toFixed(2),
                        bookingId,
                    }
                })
            } else {
                Alert.alert("Error", "Failed to create booking. Please try again.")
            }
        } catch (error) {
            console.error("Booking error:", error)
            Alert.alert("Error", "Something went wrong. Please try again.")
        } finally {
            setBookingInProgress(false)
        }
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7ED957" />
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
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Book Court</Text>
                        <Text style={styles.headerSubtitle}>{venue?.name || "Facility"}</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Date Selection */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Select Date</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.dateRow}>
                                {dates.map((date) => (
                                    <TouchableOpacity
                                        key={date.dateStr}
                                        style={[
                                            styles.dateCard,
                                            selectedDate === date.dateStr && styles.dateCardSelected,
                                        ]}
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                            setSelectedDate(date.dateStr)
                                            setSelectedSlot(null)
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.dateDayName,
                                                selectedDate === date.dateStr && styles.dateTextSelected,
                                            ]}
                                        >
                                            {date.isToday ? "Today" : date.dayName}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.dateDayNum,
                                                selectedDate === date.dateStr && styles.dateTextSelected,
                                            ]}
                                        >
                                            {date.dayNum}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>

                    {/* Court Selection */}
                    {courts.length > 1 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Select Court</Text>
                            <View style={styles.courtRow}>
                                {courts.map((court) => (
                                    <TouchableOpacity
                                        key={court.id}
                                        style={[
                                            styles.courtCard,
                                            selectedCourt?.id === court.id && styles.courtCardSelected,
                                        ]}
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                            setSelectedCourt(court)
                                            setSelectedSlot(null)
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.courtName,
                                                selectedCourt?.id === court.id && styles.courtTextSelected,
                                            ]}
                                        >
                                            {court.name}
                                        </Text>
                                        <Text style={styles.courtType}>{court.type}</Text>
                                        <Text style={styles.courtPrice}>
                                            ${(court.hourlyRate / 100).toFixed(0)}/hr
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Time Slots */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Available Times</Text>
                        {loadingSlots ? (
                            <ActivityIndicator size="small" color="#7ED957" />
                        ) : (
                            <View style={styles.slotsGrid}>
                                {availableSlots.map((slot) => (
                                    <TouchableOpacity
                                        key={slot.startTime}
                                        style={[
                                            styles.slotCard,
                                            !slot.isAvailable && styles.slotUnavailable,
                                            selectedSlot?.startTime === slot.startTime && styles.slotSelected,
                                        ]}
                                        disabled={!slot.isAvailable}
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                            setSelectedSlot(slot)
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.slotTime,
                                                !slot.isAvailable && styles.slotTextUnavailable,
                                                selectedSlot?.startTime === slot.startTime && styles.slotTextSelected,
                                            ]}
                                        >
                                            {slot.startTime}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Pricing Summary */}
                    {selectedSlot && selectedCourt && (
                        <View style={styles.pricingSection}>
                            <Text style={styles.sectionTitle}>Pricing</Text>
                            <View style={styles.pricingRow}>
                                <Text style={styles.pricingLabel}>Court Rental (1 hr)</Text>
                                <Text style={styles.pricingValue}>
                                    ${(selectedCourt.hourlyRate / 100).toFixed(2)}
                                </Text>
                            </View>
                            <View style={styles.pricingRow}>
                                <Text style={styles.pricingLabel}>Booking Fee</Text>
                                <Text style={styles.pricingValue}>
                                    ${(PLAYER_BOOKING_FEE / 100).toFixed(2)}
                                </Text>
                            </View>
                            <View style={[styles.pricingRow, styles.pricingTotal]}>
                                <Text style={styles.pricingTotalLabel}>Total</Text>
                                <Text style={styles.pricingTotalValue}>
                                    ${((selectedCourt.hourlyRate + PLAYER_BOOKING_FEE) / 100).toFixed(2)}
                                </Text>
                            </View>
                        </View>
                    )}
                </ScrollView>

                {/* Book Button */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.bookBtn, (!selectedSlot || bookingInProgress) && styles.bookBtnDisabled]}
                        disabled={!selectedSlot || bookingInProgress}
                        onPress={handleBookCourt}
                    >
                        <LinearGradient
                            colors={selectedSlot ? ["#7ED957", "#4C9E29"] : ["#333", "#222"]}
                            style={styles.bookBtnGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            {bookingInProgress ? (
                                <ActivityIndicator color="#000" />
                            ) : (
                                <>
                                    <Ionicons name="calendar-outline" size={20} color="#000" />
                                    <Text style={styles.bookBtnText}>
                                        {selectedSlot
                                            ? `Book ${selectedSlot.startTime} - $${((selectedCourt?.hourlyRate || 0 + PLAYER_BOOKING_FEE) / 100).toFixed(0)}`
                                            : "Select a Time Slot"}
                                    </Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
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
        justifyContent: "space-between",
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
    headerTitleContainer: { alignItems: "center" },
    headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
    headerSubtitle: { color: "#888", fontSize: 14 },

    content: { paddingHorizontal: 20, paddingBottom: 120 },

    section: { marginBottom: 24 },
    sectionTitle: { color: "#FFF", fontSize: 16, fontWeight: "600", marginBottom: 12 },

    dateRow: { flexDirection: "row", gap: 10 },
    dateCard: {
        width: 70,
        paddingVertical: 16,
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#333",
    },
    dateCardSelected: { backgroundColor: "#7ED957", borderColor: "#7ED957" },
    dateDayName: { color: "#888", fontSize: 12, marginBottom: 4 },
    dateDayNum: { color: "#FFF", fontSize: 20, fontWeight: "bold" },
    dateTextSelected: { color: "#000" },

    courtRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    courtCard: {
        flex: 1,
        minWidth: "45%",
        padding: 16,
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#333",
    },
    courtCardSelected: { backgroundColor: "#7ED957", borderColor: "#7ED957" },
    courtName: { color: "#FFF", fontSize: 16, fontWeight: "600" },
    courtTextSelected: { color: "#000" },
    courtType: { color: "#888", fontSize: 12, marginTop: 4 },
    courtPrice: { color: "#7ED957", fontSize: 14, fontWeight: "600", marginTop: 8 },

    slotsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    slotCard: {
        width: "22%",
        paddingVertical: 12,
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#333",
    },
    slotUnavailable: { backgroundColor: "#111", borderColor: "#222" },
    slotSelected: { backgroundColor: "#7ED957", borderColor: "#7ED957" },
    slotTime: { color: "#FFF", fontSize: 14, fontWeight: "500" },
    slotTextUnavailable: { color: "#444" },
    slotTextSelected: { color: "#000" },

    pricingSection: {
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    pricingRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    pricingLabel: { color: "#888", fontSize: 14 },
    pricingValue: { color: "#FFF", fontSize: 14 },
    pricingTotal: {
        borderTopWidth: 1,
        borderTopColor: "#333",
        paddingTop: 12,
        marginTop: 8,
    },
    pricingTotalLabel: { color: "#FFF", fontSize: 16, fontWeight: "600" },
    pricingTotalValue: { color: "#7ED957", fontSize: 18, fontWeight: "bold" },

    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: 40,
        backgroundColor: "#0A0A0A",
        borderTopWidth: 1,
        borderTopColor: "#222",
    },
    bookBtn: { borderRadius: 16, overflow: "hidden" },
    bookBtnDisabled: { opacity: 0.5 },
    bookBtnGradient: {
        paddingVertical: 18,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    bookBtnText: { color: "#000", fontSize: 18, fontWeight: "800" },
})
