/**
 * Rent Facility Screen
 * For trainers/instructors to rent courts or studios for client sessions
 */

import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    TextInput,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router, useLocalSearchParams } from "expo-router"
import * as Haptics from "expo-haptics"

import { useAuth } from "@/lib/auth-context"
import { venueService } from "@/lib/services/venue-service"
import { facilityService, Court } from "@/lib/services/facility-service"
import {
    trainerRentalService,
    getRenterType,
    getRentalType,
    TRAINER_BOOKING_FEE
} from "@/lib/services/trainer-rental-service"
import { getBookableCategory } from "@/lib/launch-cities"

export default function RentFacilityScreen() {
    const { venueId } = useLocalSearchParams()
    const { user } = useAuth()

    const [venue, setVenue] = useState<any>(null)
    const [courts, setCourts] = useState<Court[]>([])
    const [loading, setLoading] = useState(true)
    const [booking, setBooking] = useState(false)

    // Selection state
    const [selectedDate, setSelectedDate] = useState<string>("")
    const [selectedCourt, setSelectedCourt] = useState<Court | null>(null)
    const [selectedTime, setSelectedTime] = useState<string>("")
    const [duration, setDuration] = useState<number>(60) // minutes
    const [purpose, setPurpose] = useState<string>("")

    // Generate next 14 days for date selection
    const dates = Array.from({ length: 14 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() + i)
        return {
            dateStr: date.toISOString().split("T")[0],
            dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
            dayNum: date.getDate(),
            monthName: date.toLocaleDateString("en-US", { month: "short" }),
            isToday: i === 0,
        }
    })

    // Available times
    const times = ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"]

    useEffect(() => {
        loadVenueAndCourts()
        setSelectedDate(dates[0].dateStr)
    }, [venueId])

    const loadVenueAndCourts = async () => {
        if (!venueId) return
        setLoading(true)

        try {
            // Load venue
            const venueData = await venueService.getVenueById(venueId as string)
            setVenue(venueData)

            // Load courts/studios from claimed facility
            const facility = await facilityService.getClaimedFacility(venueId as string)
            if (facility) {
                const courtList = await facilityService.getCourts(facility.id)
                setCourts(courtList)
            }
        } catch (error) {
            console.error("Error loading:", error)
        } finally {
            setLoading(false)
        }
    }

    // Determine type labels based on venue sport
    const category = getBookableCategory(venue?.sport)
    const isWellness = category === "wellness"
    const renterLabel = isWellness ? "Instructor" : "Trainer"
    const unitLabel = isWellness ? "Studio" : "Court"

    // Calculate end time
    const getEndTime = (startTime: string, durationMins: number): string => {
        const [hours, mins] = startTime.split(":").map(Number)
        const endHours = hours + Math.floor(durationMins / 60)
        const endMins = mins + (durationMins % 60)
        return `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`
    }

    // Calculate pricing
    const pricing = selectedCourt
        ? trainerRentalService.calculatePricing(selectedCourt.hourlyRate, duration)
        : null

    const handleRent = async () => {
        if (!selectedCourt || !selectedDate || !selectedTime || !user || !venue) return

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
        setBooking(true)

        try {
            const facility = await facilityService.getClaimedFacility(venueId as string)

            const rentalId = await trainerRentalService.createRental({
                trainerId: user.uid,
                trainerName: user.displayName || "Trainer",
                trainerEmail: user.email || undefined,
                renterType: getRenterType(venue.sport),
                facilityId: facility?.id || "",
                venueId: venueId as string,
                venueName: venue.name || "Facility",
                rentalType: getRentalType(venue.sport),
                courtOrStudioId: selectedCourt.id,
                courtOrStudioName: selectedCourt.name,
                date: selectedDate,
                startTime: selectedTime,
                endTime: getEndTime(selectedTime, duration),
                duration,
                hourlyRate: selectedCourt.hourlyRate,
                bookingFee: TRAINER_BOOKING_FEE,
                paymentStatus: "paid", // Would integrate with Stripe
                status: "confirmed",
                purpose: purpose || undefined,
            })

            if (rentalId) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

                Alert.alert(
                    "Rental Confirmed! 🎉",
                    `You've booked ${selectedCourt.name} at ${venue.name} on ${selectedDate} at ${selectedTime}.`,
                    [{ text: "OK", onPress: () => router.back() }]
                )
            } else {
                Alert.alert("Error", "Failed to book. The time slot may already be taken.")
            }
        } catch (error) {
            console.error("Rental error:", error)
            Alert.alert("Error", "Something went wrong")
        } finally {
            setBooking(false)
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
                        <Text style={styles.headerTitle}>Rent {unitLabel}</Text>
                        <Text style={styles.headerSubtitle}>{venue?.name || "Facility"}</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    {/* Pro Badge */}
                    <View style={styles.proBadge}>
                        <Ionicons name="ribbon" size={16} color="#FFD700" />
                        <Text style={styles.proBadgeText}>{renterLabel} Rental</Text>
                    </View>

                    {/* Date Selection */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Select Date</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.dateRow}>
                                {dates.slice(0, 10).map((date) => (
                                    <TouchableOpacity
                                        key={date.dateStr}
                                        style={[
                                            styles.dateCard,
                                            selectedDate === date.dateStr && styles.dateCardSelected,
                                        ]}
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                            setSelectedDate(date.dateStr)
                                        }}
                                    >
                                        <Text style={[
                                            styles.dateDayName,
                                            selectedDate === date.dateStr && styles.dateTextSelected,
                                        ]}>
                                            {date.isToday ? "Today" : date.dayName}
                                        </Text>
                                        <Text style={[
                                            styles.dateDayNum,
                                            selectedDate === date.dateStr && styles.dateTextSelected,
                                        ]}>
                                            {date.dayNum}
                                        </Text>
                                        <Text style={[
                                            styles.dateMonth,
                                            selectedDate === date.dateStr && styles.dateTextSelected,
                                        ]}>
                                            {date.monthName}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>

                    {/* Court/Studio Selection */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Select {unitLabel}</Text>
                        {courts.length === 0 ? (
                            <View style={styles.noCourts}>
                                <Text style={styles.noCourtsText}>
                                    No {unitLabel.toLowerCase()}s available for rental yet
                                </Text>
                            </View>
                        ) : (
                            courts.map((court) => (
                                <TouchableOpacity
                                    key={court.id}
                                    style={[
                                        styles.courtCard,
                                        selectedCourt?.id === court.id && styles.courtCardSelected,
                                    ]}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                        setSelectedCourt(court)
                                    }}
                                >
                                    <View style={styles.courtInfo}>
                                        <Text style={[
                                            styles.courtName,
                                            selectedCourt?.id === court.id && { color: "#000" }
                                        ]}>
                                            {court.name}
                                        </Text>
                                        <Text style={[
                                            styles.courtType,
                                            selectedCourt?.id === court.id && { color: "#333" }
                                        ]}>
                                            {court.type}
                                        </Text>
                                    </View>
                                    <Text style={[
                                        styles.courtRate,
                                        selectedCourt?.id === court.id && { color: "#000" }
                                    ]}>
                                        ${(court.hourlyRate / 100).toFixed(0)}/hr
                                    </Text>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>

                    {/* Time Selection */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Start Time</Text>
                        <View style={styles.timeGrid}>
                            {times.map((time) => (
                                <TouchableOpacity
                                    key={time}
                                    style={[
                                        styles.timeChip,
                                        selectedTime === time && styles.timeChipSelected,
                                    ]}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                        setSelectedTime(time)
                                    }}
                                >
                                    <Text style={[
                                        styles.timeChipText,
                                        selectedTime === time && styles.timeChipTextSelected,
                                    ]}>
                                        {time}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Duration */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Duration</Text>
                        <View style={styles.durationRow}>
                            {[60, 90, 120].map((dur) => (
                                <TouchableOpacity
                                    key={dur}
                                    style={[
                                        styles.durationChip,
                                        duration === dur && styles.durationChipSelected,
                                    ]}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                        setDuration(dur)
                                    }}
                                >
                                    <Text style={[
                                        styles.durationChipText,
                                        duration === dur && styles.durationChipTextSelected,
                                    ]}>
                                        {dur} min
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Purpose (optional) */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Session Notes (optional)</Text>
                        <TextInput
                            style={styles.input}
                            value={purpose}
                            onChangeText={setPurpose}
                            placeholder={isWellness ? "e.g., Private yoga session" : "e.g., Private tennis lesson"}
                            placeholderTextColor="#666"
                        />
                    </View>

                    {/* Pricing Summary */}
                    {pricing && selectedCourt && (
                        <View style={styles.pricingCard}>
                            <Text style={styles.pricingTitle}>Rental Summary</Text>
                            <View style={styles.pricingRow}>
                                <Text style={styles.pricingLabel}>
                                    {selectedCourt.name} ({duration} min)
                                </Text>
                                <Text style={styles.pricingValue}>
                                    ${(pricing.totalAmount / 100).toFixed(2)}
                                </Text>
                            </View>
                            <View style={styles.pricingRow}>
                                <Text style={styles.pricingLabel}>Booking Fee</Text>
                                <Text style={styles.pricingValue}>
                                    ${(pricing.bookingFee / 100).toFixed(2)}
                                </Text>
                            </View>
                            <View style={[styles.pricingRow, styles.pricingTotal]}>
                                <Text style={styles.pricingTotalLabel}>Total</Text>
                                <Text style={styles.pricingTotalValue}>
                                    ${(pricing.totalCharged / 100).toFixed(2)}
                                </Text>
                            </View>
                        </View>
                    )}
                </ScrollView>

                {/* Rent Button */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[
                            styles.rentBtn,
                            (!selectedCourt || !selectedTime || booking) && styles.rentBtnDisabled
                        ]}
                        disabled={!selectedCourt || !selectedTime || booking}
                        onPress={handleRent}
                    >
                        <LinearGradient
                            colors={selectedCourt && selectedTime ? ["#FFD700", "#FFA500"] : ["#333", "#222"]}
                            style={styles.rentBtnGradient}
                        >
                            {booking ? (
                                <ActivityIndicator color="#000" />
                            ) : (
                                <Text style={styles.rentBtnText}>
                                    {!selectedCourt
                                        ? `Select ${unitLabel}`
                                        : !selectedTime
                                            ? "Select Time"
                                            : `Rent ${unitLabel} - $${pricing ? (pricing.totalCharged / 100).toFixed(0) : 0}`}
                                </Text>
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

    content: { paddingHorizontal: 20, paddingBottom: 140 },

    proBadge: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        backgroundColor: "rgba(255, 215, 0, 0.1)",
        borderWidth: 1,
        borderColor: "rgba(255, 215, 0, 0.3)",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginBottom: 20,
    },
    proBadgeText: { color: "#FFD700", fontSize: 12, fontWeight: "600", marginLeft: 6 },

    section: { marginBottom: 24 },
    sectionTitle: { color: "#FFF", fontSize: 16, fontWeight: "600", marginBottom: 12 },

    dateRow: { flexDirection: "row", gap: 10 },
    dateCard: {
        width: 65,
        paddingVertical: 12,
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#333",
    },
    dateCardSelected: { backgroundColor: "#FFD700", borderColor: "#FFD700" },
    dateDayName: { color: "#888", fontSize: 11 },
    dateDayNum: { color: "#FFF", fontSize: 18, fontWeight: "bold", marginVertical: 2 },
    dateMonth: { color: "#888", fontSize: 11 },
    dateTextSelected: { color: "#000" },

    noCourts: { padding: 20, alignItems: "center" },
    noCourtsText: { color: "#888", fontSize: 14 },

    courtCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: "transparent",
    },
    courtCardSelected: { backgroundColor: "#FFD700", borderColor: "#FFD700" },
    courtInfo: {},
    courtName: { color: "#FFF", fontSize: 16, fontWeight: "600" },
    courtType: { color: "#888", fontSize: 14, marginTop: 2 },
    courtRate: { color: "#FFD700", fontSize: 18, fontWeight: "bold" },

    timeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    timeChip: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        backgroundColor: "#1A1A1A",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#333",
    },
    timeChipSelected: { backgroundColor: "#FFD700", borderColor: "#FFD700" },
    timeChipText: { color: "#888", fontSize: 14 },
    timeChipTextSelected: { color: "#000", fontWeight: "600" },

    durationRow: { flexDirection: "row", gap: 12 },
    durationChip: {
        flex: 1,
        paddingVertical: 14,
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#333",
    },
    durationChipSelected: { backgroundColor: "#FFD700", borderColor: "#FFD700" },
    durationChipText: { color: "#888", fontSize: 16 },
    durationChipTextSelected: { color: "#000", fontWeight: "600" },

    input: {
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        color: "#FFF",
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#333",
    },

    pricingCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    pricingTitle: { color: "#FFF", fontSize: 16, fontWeight: "600", marginBottom: 12 },
    pricingRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
    pricingLabel: { color: "#888", fontSize: 14 },
    pricingValue: { color: "#FFF", fontSize: 14 },
    pricingTotal: {
        borderTopWidth: 1,
        borderTopColor: "#333",
        paddingTop: 12,
        marginTop: 8,
    },
    pricingTotalLabel: { color: "#FFF", fontSize: 16, fontWeight: "600" },
    pricingTotalValue: { color: "#FFD700", fontSize: 20, fontWeight: "bold" },

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
    rentBtn: { borderRadius: 16, overflow: "hidden" },
    rentBtnDisabled: { opacity: 0.5 },
    rentBtnGradient: {
        paddingVertical: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    rentBtnText: { color: "#000", fontSize: 18, fontWeight: "800" },
})
