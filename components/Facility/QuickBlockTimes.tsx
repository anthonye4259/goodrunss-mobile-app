/**
 * Quick Block Times
 * 
 * One-tap button to block court/studio times for maintenance.
 * Prevents double-booking during maintenance.
 */

import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert } from "react-native"
import { useState } from "react"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"

type TimeSlot = {
    startTime: string
    endTime: string
}

type Props = {
    courtId: string
    courtName: string
    onBlock: (courtId: string, date: string, slots: TimeSlot[], reason: string) => void
    variant?: "button" | "card"
}

const QUICK_OPTIONS = [
    { label: "Next 1 hour", duration: 1 },
    { label: "Next 2 hours", duration: 2 },
    { label: "Rest of day", duration: -1 }, // -1 = rest of day
    { label: "All day tomorrow", duration: -2 }, // -2 = tomorrow
]

const REASONS = [
    { icon: "construct", label: "Maintenance", value: "maintenance" },
    { icon: "brush", label: "Cleaning", value: "cleaning" },
    { icon: "calendar", label: "Private Event", value: "private_event" },
    { icon: "alert-circle", label: "Emergency", value: "emergency" },
]

export function QuickBlockTimes({ courtId, courtName, onBlock, variant = "button" }: Props) {
    const [modalVisible, setModalVisible] = useState(false)
    const [selectedDuration, setSelectedDuration] = useState<number | null>(null)
    const [selectedReason, setSelectedReason] = useState<string | null>(null)

    const handleBlock = () => {
        if (!selectedDuration || !selectedReason) {
            Alert.alert("Select Options", "Please select duration and reason")
            return
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

        const now = new Date()
        let date = now.toISOString().split("T")[0]
        let slots: TimeSlot[] = []

        if (selectedDuration === -2) {
            // Tomorrow all day
            const tomorrow = new Date(now)
            tomorrow.setDate(tomorrow.getDate() + 1)
            date = tomorrow.toISOString().split("T")[0]
            slots = [{ startTime: "06:00", endTime: "22:00" }]
        } else if (selectedDuration === -1) {
            // Rest of today
            const currentHour = now.getHours()
            slots = [{ startTime: `${currentHour}:00`, endTime: "22:00" }]
        } else {
            // Specific duration
            const startHour = now.getHours()
            const endHour = startHour + selectedDuration
            slots = [{ startTime: `${startHour}:00`, endTime: `${endHour}:00` }]
        }

        onBlock(courtId, date, slots, selectedReason)
        setModalVisible(false)
        setSelectedDuration(null)
        setSelectedReason(null)
    }

    const trigger = variant === "card" ? (
        <TouchableOpacity
            style={styles.card}
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                setModalVisible(true)
            }}
        >
            <View style={styles.cardContent}>
                <View style={styles.iconContainer}>
                    <Ionicons name="lock-closed" size={20} color="#EF4444" />
                </View>
                <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>Block Time Slot</Text>
                    <Text style={styles.cardSubtitle}>Prevent bookings</Text>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#666" />
        </TouchableOpacity>
    ) : (
        <TouchableOpacity
            style={styles.button}
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                setModalVisible(true)
            }}
        >
            <Ionicons name="lock-closed" size={16} color="#EF4444" />
            <Text style={styles.buttonText}>Block Time</Text>
        </TouchableOpacity>
    )

    return (
        <>
            {trigger}

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Block {courtName}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#888" />
                            </TouchableOpacity>
                        </View>

                        {/* Duration Selection */}
                        <Text style={styles.sectionLabel}>Duration</Text>
                        <View style={styles.optionsGrid}>
                            {QUICK_OPTIONS.map((option) => (
                                <TouchableOpacity
                                    key={option.duration}
                                    style={[
                                        styles.option,
                                        selectedDuration === option.duration && styles.optionSelected,
                                    ]}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                        setSelectedDuration(option.duration)
                                    }}
                                >
                                    <Text style={[
                                        styles.optionText,
                                        selectedDuration === option.duration && styles.optionTextSelected,
                                    ]}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Reason Selection */}
                        <Text style={styles.sectionLabel}>Reason</Text>
                        <View style={styles.reasonsRow}>
                            {REASONS.map((reason) => (
                                <TouchableOpacity
                                    key={reason.value}
                                    style={[
                                        styles.reasonOption,
                                        selectedReason === reason.value && styles.reasonSelected,
                                    ]}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                        setSelectedReason(reason.value)
                                    }}
                                >
                                    <Ionicons
                                        name={reason.icon as any}
                                        size={20}
                                        color={selectedReason === reason.value ? "#EF4444" : "#888"}
                                    />
                                    <Text style={[
                                        styles.reasonText,
                                        selectedReason === reason.value && styles.reasonTextSelected,
                                    ]}>
                                        {reason.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Confirm Button */}
                        <TouchableOpacity style={styles.confirmButton} onPress={handleBlock}>
                            <Ionicons name="lock-closed" size={18} color="#FFF" />
                            <Text style={styles.confirmText}>Block Time Slot</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    )
}

const styles = StyleSheet.create({
    button: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#EF444420",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#EF444440",
    },
    buttonText: {
        color: "#EF4444",
        fontSize: 13,
        fontWeight: "600",
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#141414",
        borderRadius: 16,
        padding: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#EF444430",
    },
    cardContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#EF444420",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    cardText: {},
    cardTitle: {
        color: "#FFF",
        fontSize: 15,
        fontWeight: "600",
    },
    cardSubtitle: {
        color: "#888",
        fontSize: 11,
        marginTop: 2,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.85)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#1A1A1A",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    modalTitle: {
        color: "#FFF",
        fontSize: 20,
        fontWeight: "700",
    },
    sectionLabel: {
        color: "#888",
        fontSize: 12,
        fontWeight: "600",
        marginBottom: 10,
    },
    optionsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginBottom: 20,
    },
    option: {
        width: "48%",
        backgroundColor: "#252525",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
    },
    optionSelected: {
        backgroundColor: "#EF4444",
    },
    optionText: {
        color: "#888",
        fontSize: 14,
        fontWeight: "600",
    },
    optionTextSelected: {
        color: "#FFF",
    },
    reasonsRow: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 24,
    },
    reasonOption: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 12,
        backgroundColor: "#252525",
        borderRadius: 12,
    },
    reasonSelected: {
        backgroundColor: "#EF444420",
        borderWidth: 1,
        borderColor: "#EF4444",
    },
    reasonText: {
        color: "#888",
        fontSize: 10,
        marginTop: 4,
    },
    reasonTextSelected: {
        color: "#EF4444",
    },
    confirmButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#EF4444",
        paddingVertical: 16,
        borderRadius: 14,
    },
    confirmText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "700",
    },
})

export default QuickBlockTimes
