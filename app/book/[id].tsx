/**
 * Booking Screen
 * 
 * Where players book sessions with trainers.
 * Features:
 * - Trainer info header
 * - Service selection
 * - Date/time picker
 * - Payment summary
 * - Confirm booking CTA
 */

import React, { useState } from "react"
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { useLocalSearchParams, router } from "expo-router"
import * as Haptics from "expo-haptics"

const SERVICES = [
    { id: "1", name: "1-on-1 Training", duration: 60, price: 75, description: "Personal coaching session" },
    { id: "2", name: "Small Group (2-4)", duration: 90, price: 50, description: "Train with friends" },
    { id: "3", name: "Video Analysis", duration: 30, price: 35, description: "Film review & feedback" },
]

const TIME_SLOTS = [
    { id: "1", time: "9:00 AM", available: true },
    { id: "2", time: "10:00 AM", available: true },
    { id: "3", time: "11:00 AM", available: false },
    { id: "4", time: "2:00 PM", available: true },
    { id: "5", time: "3:00 PM", available: true },
    { id: "6", time: "4:00 PM", available: true },
    { id: "7", time: "5:00 PM", available: false },
    { id: "8", time: "6:00 PM", available: true },
]

const DATES = [
    { id: "1", day: "Today", date: "Dec 27", available: true },
    { id: "2", day: "Sat", date: "Dec 28", available: true },
    { id: "3", day: "Sun", date: "Dec 29", available: true },
    { id: "4", day: "Mon", date: "Dec 30", available: true },
    { id: "5", day: "Tue", date: "Dec 31", available: false },
]

export default function BookingScreen() {
    const { id, name } = useLocalSearchParams()

    const [selectedService, setSelectedService] = useState<string | null>(null)
    const [selectedDate, setSelectedDate] = useState<string | null>("1")
    const [selectedTime, setSelectedTime] = useState<string | null>(null)

    const selectedServiceData = SERVICES.find(s => s.id === selectedService)
    const canBook = selectedService && selectedDate && selectedTime

    const handleBook = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        Alert.alert(
            "Booking Confirmed! 🎉",
            `Your session with ${name} is booked for ${DATES.find(d => d.id === selectedDate)?.date} at ${TIME_SLOTS.find(t => t.id === selectedTime)?.time}`,
            [{ text: "View Bookings", onPress: () => router.push("/(tabs)/bookings") }]
        )
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={["#0A0A0A", "#111", "#0A0A0A"]}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="close" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>Book Session</Text>
                        <Text style={styles.headerSubtitle}>with {name}</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>

                    {/* Service Selection */}
                    <Text style={styles.sectionTitle}>SELECT SERVICE</Text>
                    <View style={styles.serviceList}>
                        {SERVICES.map((service) => (
                            <TouchableOpacity
                                key={service.id}
                                style={[
                                    styles.serviceCard,
                                    selectedService === service.id && styles.serviceSelected
                                ]}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                    setSelectedService(service.id)
                                }}
                            >
                                <View style={styles.serviceLeft}>
                                    <Text style={styles.serviceName}>{service.name}</Text>
                                    <Text style={styles.serviceDesc}>{service.description}</Text>
                                    <Text style={styles.serviceDuration}>{service.duration} min</Text>
                                </View>
                                <View style={styles.serviceRight}>
                                    <Text style={styles.servicePrice}>${service.price}</Text>
                                    {selectedService === service.id && (
                                        <Ionicons name="checkmark-circle" size={24} color="#7ED957" />
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Date Selection */}
                    <Text style={styles.sectionTitle}>SELECT DATE</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
                        {DATES.map((date) => (
                            <TouchableOpacity
                                key={date.id}
                                style={[
                                    styles.dateCard,
                                    selectedDate === date.id && styles.dateSelected,
                                    !date.available && styles.dateDisabled
                                ]}
                                disabled={!date.available}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                    setSelectedDate(date.id)
                                }}
                            >
                                <Text style={[styles.dateDay, selectedDate === date.id && styles.dateTextSelected]}>
                                    {date.day}
                                </Text>
                                <Text style={[styles.dateNum, selectedDate === date.id && styles.dateTextSelected]}>
                                    {date.date}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Time Selection */}
                    <Text style={styles.sectionTitle}>SELECT TIME</Text>
                    <View style={styles.timeGrid}>
                        {TIME_SLOTS.map((slot) => (
                            <TouchableOpacity
                                key={slot.id}
                                style={[
                                    styles.timeSlot,
                                    selectedTime === slot.id && styles.timeSelected,
                                    !slot.available && styles.timeDisabled
                                ]}
                                disabled={!slot.available}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                    setSelectedTime(slot.id)
                                }}
                            >
                                <Text style={[
                                    styles.timeText,
                                    selectedTime === slot.id && styles.timeTextSelected,
                                    !slot.available && styles.timeTextDisabled
                                ]}>
                                    {slot.time}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={{ height: 150 }} />
                </ScrollView>

                {/* Footer - Payment Summary & Book */}
                <View style={styles.footer}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>
                            {selectedServiceData ? selectedServiceData.name : "Select a service"}
                        </Text>
                        <Text style={styles.summaryPrice}>
                            {selectedServiceData ? `$${selectedServiceData.price}` : "--"}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.bookBtn, !canBook && styles.bookBtnDisabled]}
                        disabled={!canBook}
                        onPress={handleBook}
                    >
                        <Text style={styles.bookBtnText}>
                            {canBook ? "Confirm Booking" : "Select options above"}
                        </Text>
                        {canBook && <Ionicons name="arrow-forward" size={20} color="#000" />}
                    </TouchableOpacity>
                    <View style={styles.paymentIcons}>
                        <Ionicons name="card" size={16} color="#666" />
                        <Ionicons name="logo-apple" size={16} color="#666" />
                        <Text style={styles.paymentText}>Pay after confirmation</Text>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0A0A0A" },
    safeArea: { flex: 1 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#1A1A1A",
    },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#1A1A1A", justifyContent: "center", alignItems: "center" },
    headerTitle: { fontSize: 16, fontWeight: "700", color: "#FFF", textAlign: "center" },
    headerSubtitle: { fontSize: 12, color: "#888", textAlign: "center" },
    scrollView: { flex: 1 },
    content: { padding: 20 },

    sectionTitle: { fontSize: 13, fontWeight: "700", color: "#666", marginBottom: 12, marginTop: 20, letterSpacing: 0.5 },

    // Services
    serviceList: { gap: 12 },
    serviceCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#141414",
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#222",
    },
    serviceSelected: { borderColor: "#7ED957", backgroundColor: "rgba(126,217,87,0.1)" },
    serviceLeft: { flex: 1 },
    serviceName: { fontSize: 16, fontWeight: "600", color: "#FFF", marginBottom: 4 },
    serviceDesc: { fontSize: 12, color: "#888", marginBottom: 4 },
    serviceDuration: { fontSize: 12, color: "#666" },
    serviceRight: { alignItems: "flex-end", gap: 8 },
    servicePrice: { fontSize: 20, fontWeight: "700", color: "#7ED957" },

    // Dates
    dateScroll: { marginBottom: 8 },
    dateCard: {
        width: 70,
        paddingVertical: 16,
        paddingHorizontal: 12,
        backgroundColor: "#141414",
        borderRadius: 12,
        marginRight: 10,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#222",
    },
    dateSelected: { borderColor: "#7ED957", backgroundColor: "rgba(126,217,87,0.1)" },
    dateDisabled: { opacity: 0.4 },
    dateDay: { fontSize: 12, color: "#888", marginBottom: 4 },
    dateNum: { fontSize: 14, fontWeight: "600", color: "#FFF" },
    dateTextSelected: { color: "#7ED957" },

    // Times
    timeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    timeSlot: {
        width: "23%",
        paddingVertical: 12,
        backgroundColor: "#141414",
        borderRadius: 10,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#222",
    },
    timeSelected: { borderColor: "#7ED957", backgroundColor: "rgba(126,217,87,0.1)" },
    timeDisabled: { opacity: 0.4 },
    timeText: { fontSize: 12, fontWeight: "600", color: "#FFF" },
    timeTextSelected: { color: "#7ED957" },
    timeTextDisabled: { color: "#555" },

    // Footer
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: "rgba(0,0,0,0.95)",
        borderTopWidth: 1,
        borderTopColor: "#1A1A1A",
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    summaryLabel: { fontSize: 14, color: "#CCC" },
    summaryPrice: { fontSize: 20, fontWeight: "700", color: "#7ED957" },
    bookBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#7ED957",
        paddingVertical: 16,
        borderRadius: 28,
    },
    bookBtnDisabled: { backgroundColor: "#333" },
    bookBtnText: { fontSize: 16, fontWeight: "700", color: "#000" },
    paymentIcons: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginTop: 12,
    },
    paymentText: { fontSize: 11, color: "#666" },
})
