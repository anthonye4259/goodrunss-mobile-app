/**
 * Announcement Broadcaster
 * 
 * Push announcements to all recent bookers.
 * Great for holiday closures, promotions, events.
 */

import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, Alert } from "react-native"
import { useState } from "react"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"

type Props = {
    recentBookerCount: number
    onSendAnnouncement: (title: string, message: string, type: AnnouncementType) => void
}

type AnnouncementType = "general" | "promotion" | "closure" | "event"

const ANNOUNCEMENT_TYPES: { type: AnnouncementType; icon: string; label: string; color: string }[] = [
    { type: "general", icon: "megaphone", label: "General", color: "#3B82F6" },
    { type: "promotion", icon: "pricetag", label: "Promotion", color: "#22C55E" },
    { type: "closure", icon: "alert-circle", label: "Closure", color: "#EF4444" },
    { type: "event", icon: "calendar", label: "Event", color: "#8B5CF6" },
]

export function AnnouncementBroadcaster({ recentBookerCount, onSendAnnouncement }: Props) {
    const [modalVisible, setModalVisible] = useState(false)
    const [title, setTitle] = useState("")
    const [message, setMessage] = useState("")
    const [selectedType, setSelectedType] = useState<AnnouncementType>("general")

    const handleSend = () => {
        if (!title.trim()) {
            Alert.alert("Missing Title", "Please add a title for your announcement")
            return
        }
        if (!message.trim()) {
            Alert.alert("Missing Message", "Please add a message")
            return
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        onSendAnnouncement(title, message, selectedType)

        Alert.alert(
            "Announcement Sent! 📣",
            `${recentBookerCount} customers will receive your notification.`,
            [{
                text: "Great!", onPress: () => {
                    setModalVisible(false)
                    setTitle("")
                    setMessage("")
                }
            }]
        )
    }

    const selectedTypeConfig = ANNOUNCEMENT_TYPES.find(t => t.type === selectedType)!

    return (
        <>
            <TouchableOpacity
                style={styles.triggerCard}
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    setModalVisible(true)
                }}
            >
                <View style={styles.triggerContent}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="megaphone" size={20} color="#8B5CF6" />
                    </View>
                    <View style={styles.triggerText}>
                        <Text style={styles.triggerTitle}>Send Announcement</Text>
                        <Text style={styles.triggerSubtitle}>
                            Notify {recentBookerCount} recent customers
                        </Text>
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#666" />
            </TouchableOpacity>

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>📣 New Announcement</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#888" />
                            </TouchableOpacity>
                        </View>

                        {/* Type Selection */}
                        <Text style={styles.sectionLabel}>Type</Text>
                        <View style={styles.typeRow}>
                            {ANNOUNCEMENT_TYPES.map((t) => (
                                <TouchableOpacity
                                    key={t.type}
                                    style={[
                                        styles.typeOption,
                                        selectedType === t.type && {
                                            backgroundColor: t.color + "20",
                                            borderColor: t.color,
                                        },
                                    ]}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                        setSelectedType(t.type)
                                    }}
                                >
                                    <Ionicons
                                        name={t.icon as any}
                                        size={18}
                                        color={selectedType === t.type ? t.color : "#666"}
                                    />
                                    <Text style={[
                                        styles.typeText,
                                        selectedType === t.type && { color: t.color },
                                    ]}>
                                        {t.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Title */}
                        <Text style={styles.sectionLabel}>Title</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Holiday Hours Update"
                            placeholderTextColor="#555"
                            value={title}
                            onChangeText={setTitle}
                        />

                        {/* Message */}
                        <Text style={styles.sectionLabel}>Message</Text>
                        <TextInput
                            style={[styles.input, styles.messageInput]}
                            placeholder="Your announcement message..."
                            placeholderTextColor="#555"
                            value={message}
                            onChangeText={setMessage}
                            multiline
                        />

                        {/* Audience Preview */}
                        <View style={styles.audiencePreview}>
                            <Ionicons name="people" size={16} color="#888" />
                            <Text style={styles.audienceText}>
                                Will be sent to {recentBookerCount} customers who booked in the last 30 days
                            </Text>
                        </View>

                        {/* Send Button */}
                        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                            <LinearGradient
                                colors={[selectedTypeConfig.color, selectedTypeConfig.color + "CC"]}
                                style={styles.sendGradient}
                            >
                                <Ionicons name="send" size={18} color="#FFF" />
                                <Text style={styles.sendText}>Send Announcement</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    )
}

const styles = StyleSheet.create({
    triggerCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#141414",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#8B5CF630",
    },
    triggerContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: "#8B5CF620",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    triggerText: {},
    triggerTitle: {
        color: "#FFF",
        fontSize: 15,
        fontWeight: "600",
    },
    triggerSubtitle: {
        color: "#8B5CF6",
        fontSize: 12,
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
        marginBottom: 8,
    },
    typeRow: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 16,
    },
    typeOption: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 12,
        backgroundColor: "#252525",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "transparent",
    },
    typeText: {
        color: "#666",
        fontSize: 10,
        marginTop: 4,
        fontWeight: "500",
    },
    input: {
        backgroundColor: "#252525",
        borderRadius: 12,
        padding: 14,
        color: "#FFF",
        fontSize: 15,
        marginBottom: 16,
    },
    messageInput: {
        minHeight: 100,
        textAlignVertical: "top",
    },
    audiencePreview: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#252525",
        borderRadius: 12,
        padding: 12,
        marginBottom: 20,
    },
    audienceText: {
        color: "#888",
        fontSize: 12,
        flex: 1,
    },
    sendButton: {
        borderRadius: 14,
        overflow: "hidden",
    },
    sendGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 16,
    },
    sendText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "700",
    },
})

export default AnnouncementBroadcaster
