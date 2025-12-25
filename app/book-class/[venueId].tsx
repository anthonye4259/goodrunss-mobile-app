/**
 * Book Class Screen
 * Player-facing screen to book a spot in a wellness class
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
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router, useLocalSearchParams } from "expo-router"
import * as Haptics from "expo-haptics"

import { useAuth } from "@/lib/auth-context"
import { venueService } from "@/lib/services/venue-service"
import { classService, StudioClass, DAY_NAMES, CLASS_BOOKING_FEE } from "@/lib/services/class-service"
import { facilityService } from "@/lib/services/facility-service"

export default function BookClassScreen() {
    const { venueId } = useLocalSearchParams()
    const { user } = useAuth()

    const [venue, setVenue] = useState<any>(null)
    const [classes, setClasses] = useState<StudioClass[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedClass, setSelectedClass] = useState<StudioClass | null>(null)
    const [selectedDate, setSelectedDate] = useState<string>("")
    const [availableSpots, setAvailableSpots] = useState<number>(0)
    const [booking, setBooking] = useState(false)

    // Generate next 7 days for date selection
    const dates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() + i)
        return {
            dateStr: date.toISOString().split("T")[0],
            dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
            dayNum: date.getDate(),
            dayOfWeek: date.getDay(),
            isToday: i === 0,
        }
    })

    useEffect(() => {
        loadVenueAndClasses()
        setSelectedDate(dates[0].dateStr)
    }, [venueId])

    useEffect(() => {
        if (selectedClass && selectedDate) {
            loadAvailableSpots()
        }
    }, [selectedClass, selectedDate])

    const loadVenueAndClasses = async () => {
        if (!venueId) return
        setLoading(true)

        try {
            // Load venue
            const venueData = await venueService.getVenueById(venueId as string)
            setVenue(venueData)

            // Load classes for this venue
            const classList = await classService.getVenueClasses(venueId as string)
            setClasses(classList)
        } catch (error) {
            console.error("Error loading venue/classes:", error)
        } finally {
            setLoading(false)
        }
    }

    const loadAvailableSpots = async () => {
        if (!selectedClass) return

        try {
            const spots = await classService.getAvailableSpots(selectedClass.id, selectedDate)
            setAvailableSpots(spots)
        } catch (error) {
            console.error("Error loading spots:", error)
        }
    }

    // Filter classes for selected date's day of week
    const getClassesForDate = (dateStr: string) => {
        const date = dates.find(d => d.dateStr === dateStr)
        if (!date) return []
        return classes.filter(c => c.dayOfWeek === date.dayOfWeek)
    }

    const handleBookClass = async () => {
        if (!selectedClass || !user || !selectedDate) return

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
        setBooking(true)

        try {
            // Get facility for this venue
            const facility = await facilityService.getClaimedFacility(venueId as string)

            const bookingId = await classService.bookClassSpot({
                classId: selectedClass.id,
                facilityId: facility?.id || "",
                venueId: venueId as string,
                userId: user.uid,
                userName: user.displayName || "Guest",
                userEmail: user.email || undefined,
                className: selectedClass.name,
                classDate: selectedDate,
                classTime: selectedClass.startTime,
                classDuration: selectedClass.duration,
                instructor: selectedClass.instructor,
                classPrice: selectedClass.pricePerSpot,
            })

            if (bookingId) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

                // Navigate to confirmation
                router.replace({
                    pathname: "/booking-confirmation",
                    params: {
                        venueName: venue?.name || "Studio",
                        courtName: selectedClass.name,
                        date: selectedDate,
                        startTime: selectedClass.startTime,
                        endTime: `${parseInt(selectedClass.startTime.split(":")[0]) + Math.floor(selectedClass.duration / 60)}:${selectedClass.startTime.split(":")[1]}`,
                        total: ((selectedClass.pricePerSpot + CLASS_BOOKING_FEE) / 100).toFixed(2),
                        bookingId,
                    }
                })
            } else {
                Alert.alert("Error", "Failed to book class. It may be full.")
            }
        } catch (error) {
            console.error("Booking error:", error)
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

    const classesForSelectedDate = getClassesForDate(selectedDate)
    const pricing = selectedClass ? classService.calculatePricing(selectedClass.pricePerSpot) : null

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
                        <Text style={styles.headerTitle}>Book Class</Text>
                        <Text style={styles.headerSubtitle}>{venue?.name || "Studio"}</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
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
                                            setSelectedClass(null)
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
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>

                    {/* Class List */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Available Classes</Text>
                        {classesForSelectedDate.length === 0 ? (
                            <View style={styles.noClasses}>
                                <Ionicons name="calendar-outline" size={48} color="#333" />
                                <Text style={styles.noClassesText}>No classes on this day</Text>
                            </View>
                        ) : (
                            classesForSelectedDate.map((cls) => (
                                <TouchableOpacity
                                    key={cls.id}
                                    style={[
                                        styles.classCard,
                                        selectedClass?.id === cls.id && styles.classCardSelected,
                                    ]}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                        setSelectedClass(cls)
                                    }}
                                >
                                    <View style={styles.classTime}>
                                        <Text style={[
                                            styles.classTimeText,
                                            selectedClass?.id === cls.id && { color: "#000" }
                                        ]}>
                                            {cls.startTime}
                                        </Text>
                                        <Text style={[
                                            styles.classDuration,
                                            selectedClass?.id === cls.id && { color: "#333" }
                                        ]}>
                                            {cls.duration}min
                                        </Text>
                                    </View>
                                    <View style={styles.classInfo}>
                                        <Text style={[
                                            styles.className,
                                            selectedClass?.id === cls.id && { color: "#000" }
                                        ]}>
                                            {cls.name}
                                        </Text>
                                        {cls.instructor && (
                                            <Text style={[
                                                styles.classInstructor,
                                                selectedClass?.id === cls.id && { color: "#333" }
                                            ]}>
                                                with {cls.instructor}
                                            </Text>
                                        )}
                                    </View>
                                    <View style={styles.classRight}>
                                        <Text style={[
                                            styles.classPrice,
                                            selectedClass?.id === cls.id && { color: "#000" }
                                        ]}>
                                            ${(cls.pricePerSpot / 100).toFixed(0)}
                                        </Text>
                                        <Text style={[
                                            styles.classSpots,
                                            selectedClass?.id === cls.id && { color: "#333" }
                                        ]}>
                                            {cls.maxSpots - cls.bookedSpots} spots
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>

                    {/* Pricing Summary */}
                    {selectedClass && pricing && (
                        <View style={styles.pricingSection}>
                            <Text style={styles.sectionTitle}>Pricing</Text>
                            <View style={styles.pricingRow}>
                                <Text style={styles.pricingLabel}>Class</Text>
                                <Text style={styles.pricingValue}>
                                    ${(pricing.classPrice / 100).toFixed(2)}
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
                            <Text style={styles.spotsRemaining}>
                                {availableSpots} spots remaining
                            </Text>
                        </View>
                    )}
                </ScrollView>

                {/* Book Button */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.bookBtn, (!selectedClass || booking || availableSpots <= 0) && styles.bookBtnDisabled]}
                        disabled={!selectedClass || booking || availableSpots <= 0}
                        onPress={handleBookClass}
                    >
                        <LinearGradient
                            colors={selectedClass && availableSpots > 0 ? ["#7ED957", "#4C9E29"] : ["#333", "#222"]}
                            style={styles.bookBtnGradient}
                        >
                            {booking ? (
                                <ActivityIndicator color="#000" />
                            ) : (
                                <Text style={styles.bookBtnText}>
                                    {!selectedClass
                                        ? "Select a Class"
                                        : availableSpots <= 0
                                            ? "Class Full"
                                            : `Book Spot - $${((selectedClass.pricePerSpot + CLASS_BOOKING_FEE) / 100).toFixed(0)}`}
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

    noClasses: { alignItems: "center", paddingVertical: 40 },
    noClassesText: { color: "#888", fontSize: 14, marginTop: 12 },

    classCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        marginBottom: 10,
        borderWidth: 2,
        borderColor: "transparent",
    },
    classCardSelected: { backgroundColor: "#7ED957", borderColor: "#7ED957" },
    classTime: { width: 60, marginRight: 16 },
    classTimeText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
    classDuration: { color: "#888", fontSize: 12 },
    classInfo: { flex: 1 },
    className: { color: "#FFF", fontSize: 16, fontWeight: "600" },
    classInstructor: { color: "#888", fontSize: 14, marginTop: 2 },
    classRight: { alignItems: "flex-end" },
    classPrice: { color: "#7ED957", fontSize: 18, fontWeight: "bold" },
    classSpots: { color: "#888", fontSize: 12, marginTop: 2 },

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
    spotsRemaining: { color: "#888", fontSize: 12, textAlign: "center", marginTop: 12 },

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
        alignItems: "center",
        justifyContent: "center",
    },
    bookBtnText: { color: "#000", fontSize: 18, fontWeight: "800" },
})
