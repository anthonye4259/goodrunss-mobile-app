/**
 * Private Session Booking Modal
 * 
 * Complete booking flow for private 1-on-1 sessions:
 * - Select time slot from instructor availability
 * - Choose location (client, instructor, virtual)
 * - Add notes
 * - Pay with dynamic platform fees (0%, 5%, or 15%)
 */

import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    Modal,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"

import { useAuth } from "@/lib/auth-context"
import {
    getInstructorAvailability,
    createPrivateBooking,
    confirmBookingPayment,
} from "@/lib/services/private-booking-service"
import { calculateBookingFees, FeeCalculation, formatFeeBreakdown } from "@/lib/services/fee-calculation-service"
import type { Instructor, AvailabilitySlot } from "@/lib/types/wellness-instructor"

interface PrivateBookingModalProps {
    visible: boolean
    onClose: () => void
    instructor: Instructor
}

type LocationType = "client_location" | "instructor_location" | "virtual"

interface SelectedSlot extends AvailabilitySlot {
    formattedDate: string
    formattedTime: string
}

export function PrivateBookingModal({
    visible,
    onClose,
    instructor,
}: PrivateBookingModalProps) {
    const { user } = useAuth()
    const [step, setStep] = useState<"time" | "details" | "payment">("time")
    const [loading, setLoading] = useState(true)
    const [slots, setSlots] = useState<AvailabilitySlot[]>([])
    const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null)
    const [locationType, setLocationType] = useState<LocationType>("virtual")
    const [locationAddress, setLocationAddress] = useState("")
    const [notes, setNotes] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)
    const [feeCalculation, setFeeCalculation] = useState<FeeCalculation | null>(null)
    const [feesLoading, setFeesLoading] = useState(true)

    // Fetch availability when modal opens
    useEffect(() => {
        if (visible) {
            fetchAvailability()
        }
    }, [visible, instructor.id])

    const fetchAvailability = async () => {
        setLoading(true)
        const startDate = new Date()
        const endDate = new Date()
        endDate.setDate(endDate.getDate() + 14) // Next 2 weeks

        const availableSlots = await getInstructorAvailability(
            instructor.id,
            startDate,
            endDate
        )
        setSlots(availableSlots)
        setLoading(false)
    }

    // Fetch dynamic fees when modal opens
    useEffect(() => {
        if (visible && user && instructor.id) {
            fetchFees()
        }
    }, [visible, instructor.id, user?.id])

    const fetchFees = async () => {
        if (!user) return
        setFeesLoading(true)
        try {
            const fees = await calculateBookingFees(
                instructor.id,
                user.id,
                instructor.hourlyRate || 10000
            )
            setFeeCalculation(fees)
        } catch (error) {
            console.error("[PrivateBookingModal] Error fetching fees:", error)
        } finally {
            setFeesLoading(false)
        }
    }

    const formatSlot = (slot: AvailabilitySlot): SelectedSlot => {
        const date = new Date(slot.date)
        return {
            ...slot,
            formattedDate: date.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
            }),
            formattedTime: date.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
            }),
        }
    }

    const handleSlotSelect = (slot: AvailabilitySlot) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        setSelectedSlot(formatSlot(slot))
        setStep("details")
    }

    const handleContinueToPayment = () => {
        if (!selectedSlot) return

        if (locationType === "client_location" && !locationAddress) {
            Alert.alert("Address Required", "Please enter your location")
            return
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        setStep("payment")
    }

    const handleBookSession = async () => {
        if (!selectedSlot || !user) return

        setIsProcessing(true)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)

        try {
            const result = await createPrivateBooking({
                instructorId: instructor.id,
                clientId: user.id,
                clientName: user.name || "Client",
                clientEmail: user.email || "",
                slotId: selectedSlot.id,
                startTime: new Date(selectedSlot.date),
                duration: 60, // Default 1 hour
                locationType,
                locationAddress: locationType === "client_location" ? locationAddress : undefined,
                notes,
                price: instructor.hourlyRate || 10000, // Default $100 in cents
            })

            if (result.success && result.paymentIntentClientSecret) {
                // In a real app, present Stripe payment sheet here
                // For now, simulate successful payment
                Alert.alert(
                    "Payment Required",
                    "In production, Stripe payment sheet would appear here.",
                    [
                        {
                            text: "Simulate Payment",
                            onPress: async () => {
                                if (result.bookingId) {
                                    await confirmBookingPayment(result.bookingId)
                                    Alert.alert("Success!", "Your session is booked!", [
                                        { text: "OK", onPress: onClose }
                                    ])
                                }
                            },
                        },
                    ]
                )
            } else {
                Alert.alert("Error", result.message)
            }
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to book session")
        } finally {
            setIsProcessing(false)
        }
    }

    const handleBack = () => {
        if (step === "details") setStep("time")
        else if (step === "payment") setStep("details")
        else onClose()
    }

    const hourlyRate = instructor.hourlyRate || 10000 // cents
    // Use calculated fees or show loading state
    const fees = feeCalculation
    const formattedFees = fees ? formatFeeBreakdown(fees) : null

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        {step === "time" && "Select Time"}
                        {step === "details" && "Session Details"}
                        {step === "payment" && "Confirm & Pay"}
                    </Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Instructor Info */}
                    <View style={styles.instructorCard}>
                        <View style={styles.instructorInfo}>
                            <Text style={styles.instructorName}>{instructor.displayName}</Text>
                            <Text style={styles.instructorTagline}>{instructor.tagline}</Text>
                        </View>
                        <View style={styles.priceBox}>
                            <Text style={styles.priceAmount}>
                                ${(hourlyRate / 100).toFixed(0)}
                            </Text>
                            <Text style={styles.priceLabel}>/hour</Text>
                        </View>
                    </View>

                    {/* Step: Time Selection */}
                    {step === "time" && (
                        <View>
                            <Text style={styles.sectionTitle}>Available Times</Text>

                            {loading ? (
                                <ActivityIndicator size="large" color="#7ED957" style={{ marginTop: 40 }} />
                            ) : slots.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Ionicons name="calendar-outline" size={48} color="#6B7280" />
                                    <Text style={styles.emptyText}>No available times</Text>
                                    <Text style={styles.emptySubtext}>
                                        Check back later or contact the instructor
                                    </Text>
                                </View>
                            ) : (
                                <View style={styles.slotsGrid}>
                                    {slots.map(slot => {
                                        const formatted = formatSlot(slot)
                                        return (
                                            <TouchableOpacity
                                                key={slot.id}
                                                style={styles.slotCard}
                                                onPress={() => handleSlotSelect(slot)}
                                            >
                                                <Text style={styles.slotDate}>{formatted.formattedDate}</Text>
                                                <Text style={styles.slotTime}>{formatted.formattedTime}</Text>
                                            </TouchableOpacity>
                                        )
                                    })}
                                </View>
                            )}
                        </View>
                    )}

                    {/* Step: Details */}
                    {step === "details" && selectedSlot && (
                        <View>
                            {/* Selected Time */}
                            <View style={styles.selectedTimeCard}>
                                <Ionicons name="calendar" size={20} color="#7ED957" />
                                <Text style={styles.selectedTimeText}>
                                    {selectedSlot.formattedDate} at {selectedSlot.formattedTime}
                                </Text>
                                <TouchableOpacity onPress={() => setStep("time")}>
                                    <Text style={styles.changeLink}>Change</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Location Selection */}
                            <Text style={styles.sectionTitle}>Session Location</Text>
                            <View style={styles.locationOptions}>
                                {[
                                    { type: "virtual" as LocationType, icon: "videocam", label: "Virtual" },
                                    { type: "instructor_location" as LocationType, icon: "business", label: "Instructor's Space" },
                                    { type: "client_location" as LocationType, icon: "location", label: "My Location" },
                                ].map(option => (
                                    <TouchableOpacity
                                        key={option.type}
                                        style={[
                                            styles.locationOption,
                                            locationType === option.type && styles.locationOptionSelected,
                                        ]}
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                            setLocationType(option.type)
                                        }}
                                    >
                                        <Ionicons
                                            name={option.icon as any}
                                            size={24}
                                            color={locationType === option.type ? "#7ED957" : "#9CA3AF"}
                                        />
                                        <Text style={[
                                            styles.locationLabel,
                                            locationType === option.type && styles.locationLabelSelected,
                                        ]}>
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Address Input */}
                            {locationType === "client_location" && (
                                <TextInput
                                    style={styles.addressInput}
                                    placeholder="Enter your address"
                                    placeholderTextColor="#6B7280"
                                    value={locationAddress}
                                    onChangeText={setLocationAddress}
                                />
                            )}

                            {/* Notes */}
                            <Text style={styles.sectionTitle}>Notes (Optional)</Text>
                            <TextInput
                                style={styles.notesInput}
                                placeholder="Any goals or requests for the session?"
                                placeholderTextColor="#6B7280"
                                multiline
                                numberOfLines={3}
                                value={notes}
                                onChangeText={setNotes}
                            />

                            {/* Continue Button */}
                            <TouchableOpacity
                                style={styles.continueButton}
                                onPress={handleContinueToPayment}
                            >
                                <Text style={styles.continueButtonText}>Continue to Payment</Text>
                                <Ionicons name="arrow-forward" size={20} color="#0A0A0A" />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Step: Payment */}
                    {step === "payment" && selectedSlot && (
                        <View>
                            {/* Summary */}
                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryTitle}>Session Summary</Text>

                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Date & Time</Text>
                                    <Text style={styles.summaryValue}>
                                        {selectedSlot.formattedDate} at {selectedSlot.formattedTime}
                                    </Text>
                                </View>

                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Location</Text>
                                    <Text style={styles.summaryValue}>
                                        {locationType === "virtual" && "Virtual"}
                                        {locationType === "instructor_location" && "Instructor's Space"}
                                        {locationType === "client_location" && locationAddress}
                                    </Text>
                                </View>

                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Duration</Text>
                                    <Text style={styles.summaryValue}>1 hour</Text>
                                </View>

                                <View style={styles.divider} />

                                {fees && (
                                    <>
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>Session</Text>
                                            <Text style={styles.summaryValue}>
                                                {formattedFees?.sessionPriceDisplay}
                                            </Text>
                                        </View>
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>Booking Fee</Text>
                                            <Text style={styles.summaryValue}>
                                                {formattedFees?.bookingFeeDisplay}
                                            </Text>
                                        </View>
                                        <View style={styles.divider} />
                                    </>
                                )}

                                <View style={styles.summaryRow}>
                                    <Text style={styles.totalLabel}>Total</Text>
                                    <Text style={styles.totalValue}>
                                        ${fees ? (fees.totalCharge / 100).toFixed(2) : (hourlyRate / 100).toFixed(2)}
                                    </Text>
                                </View>
                            </View>

                            {/* Secure payment notice - no platform fee shown to players */}
                            <View style={styles.secureNotice}>
                                <Ionicons name="shield-checkmark" size={16} color="#7ED957" />
                                <Text style={styles.secureNoticeText}>
                                    Secure payment • Instructor receives {formattedFees?.trainerPayoutDisplay}
                                </Text>
                            </View>

                            {/* Pay Button */}
                            <TouchableOpacity
                                style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
                                onPress={handleBookSession}
                                disabled={isProcessing || !fees}
                            >
                                {isProcessing || feesLoading ? (
                                    <ActivityIndicator color="#0A0A0A" />
                                ) : (
                                    <>
                                        <Ionicons name="card" size={20} color="#0A0A0A" />
                                        <Text style={styles.payButtonText}>
                                            Pay ${fees ? (fees.totalCharge / 100).toFixed(2) : (hourlyRate / 100).toFixed(2)}
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            {/* Cancellation Policy */}
                            <Text style={styles.policyText}>
                                Free cancellation up to 24 hours before. 50% refund up to 12 hours before.
                            </Text>
                        </View>
                    )}
                </ScrollView>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0A0A0A",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#252525",
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    closeButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        flex: 1,
        padding: 20,
    },
    instructorCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    instructorInfo: {
        flex: 1,
    },
    instructorName: {
        fontSize: 18,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    instructorTagline: {
        fontSize: 14,
        color: "#7ED957",
        marginTop: 2,
    },
    priceBox: {
        alignItems: "flex-end",
    },
    priceAmount: {
        fontSize: 24,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    priceLabel: {
        fontSize: 12,
        color: "#9CA3AF",
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
        marginBottom: 12,
    },
    slotsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    slotCard: {
        width: "48%",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "#333",
    },
    slotDate: {
        fontSize: 14,
        color: "#9CA3AF",
    },
    slotTime: {
        fontSize: 18,
        fontWeight: "600",
        color: "#FFFFFF",
        marginTop: 4,
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        color: "#9CA3AF",
        marginTop: 12,
    },
    emptySubtext: {
        fontSize: 14,
        color: "#6B7280",
        marginTop: 4,
    },
    selectedTimeCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(126, 217, 87, 0.1)",
        borderRadius: 12,
        padding: 14,
        marginBottom: 24,
        gap: 10,
    },
    selectedTimeText: {
        flex: 1,
        fontSize: 15,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    changeLink: {
        fontSize: 14,
        color: "#7ED957",
        fontWeight: "600",
    },
    locationOptions: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 16,
    },
    locationOption: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        borderWidth: 2,
        borderColor: "transparent",
    },
    locationOptionSelected: {
        borderColor: "#7ED957",
        backgroundColor: "rgba(126, 217, 87, 0.1)",
    },
    locationLabel: {
        fontSize: 12,
        color: "#9CA3AF",
        marginTop: 8,
        textAlign: "center",
    },
    locationLabelSelected: {
        color: "#FFFFFF",
    },
    addressInput: {
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        color: "#FFFFFF",
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#333",
    },
    notesInput: {
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        color: "#FFFFFF",
        minHeight: 80,
        textAlignVertical: "top",
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#333",
    },
    continueButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#7ED957",
        borderRadius: 12,
        paddingVertical: 16,
        gap: 8,
    },
    continueButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0A0A0A",
    },
    summaryCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 16,
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 14,
        color: "#9CA3AF",
    },
    summaryValue: {
        fontSize: 14,
        color: "#FFFFFF",
        fontWeight: "500",
    },
    divider: {
        height: 1,
        backgroundColor: "#333",
        marginVertical: 12,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    totalValue: {
        fontSize: 20,
        fontWeight: "700",
        color: "#7ED957",
    },
    feeBreakdown: {
        backgroundColor: "rgba(126, 217, 87, 0.1)",
        borderRadius: 12,
        padding: 14,
        marginBottom: 24,
    },
    feeRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
    },
    feeTypeLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    feeTypeValue: {
        fontSize: 13,
        color: "#7ED957",
        fontWeight: "600",
    },
    feeLabel: {
        fontSize: 13,
        color: "#9CA3AF",
    },
    feeValue: {
        fontSize: 13,
        color: "#7ED957",
        fontWeight: "500",
    },
    secureNotice: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(126, 217, 87, 0.1)",
        borderRadius: 12,
        padding: 12,
        marginBottom: 24,
        gap: 8,
    },
    secureNoticeText: {
        fontSize: 13,
        color: "#9CA3AF",
    },
    payButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#7ED957",
        borderRadius: 12,
        paddingVertical: 18,
        gap: 8,
    },
    payButtonDisabled: {
        opacity: 0.7,
    },
    payButtonText: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0A0A0A",
    },
    policyText: {
        fontSize: 12,
        color: "#6B7280",
        textAlign: "center",
        marginTop: 16,
    },
})

export default PrivateBookingModal
