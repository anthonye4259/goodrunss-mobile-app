/**
 * Play Invite
 * 
 * Send play invites to friends via SMS or share.
 * "I'm heading to Central Park at 3pm - come play!"
 */

import { View, Text, TouchableOpacity, StyleSheet, Share, Alert, Modal, TextInput } from "react-native"
import { useState } from "react"
import { Ionicons } from "@expo/vector-icons"
import * as SMS from "expo-sms"
import * as Haptics from "expo-haptics"
import { LinearGradient } from "expo-linear-gradient"

type Props = {
    courtName?: string
    courtId?: string
    sport?: string
    onInviteSent?: () => void
}

export function PlayInvite({ courtName, courtId, sport = "Basketball", onInviteSent }: Props) {
    const [modalVisible, setModalVisible] = useState(false)
    const [time, setTime] = useState("")
    const [customMessage, setCustomMessage] = useState("")

    const deepLink = courtId ? `https://goodrunss.app/court/${courtId}` : "https://goodrunss.app"

    const getInviteMessage = () => {
        const timeText = time ? ` at ${time}` : ""
        const courtText = courtName ? `to ${courtName}` : ""
        const custom = customMessage ? `\n\n${customMessage}` : ""

        return `🏀 Yo! I'm heading ${courtText}${timeText}. Come play ${sport.toLowerCase()} with me!${custom}\n\n${deepLink}`
    }

    const handleSendSMS = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        const isAvailable = await SMS.isAvailableAsync()
        if (!isAvailable) {
            Alert.alert("SMS not available", "Your device doesn't support SMS")
            return
        }

        const { result } = await SMS.sendSMSAsync(
            [], // Empty - user chooses contacts
            getInviteMessage()
        )

        if (result === "sent") {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            setModalVisible(false)
            onInviteSent?.()
        }
    }

    const handleShareSocial = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        try {
            const result = await Share.share({
                title: `Play ${sport} with me!`,
                message: getInviteMessage(),
                url: deepLink,
            })

            if (result.action === Share.sharedAction) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                setModalVisible(false)
                onInviteSent?.()
            }
        } catch (error) {
            Alert.alert("Error", "Failed to share")
        }
    }

    return (
        <>
            <TouchableOpacity
                style={styles.triggerButton}
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    setModalVisible(true)
                }}
            >
                <LinearGradient
                    colors={["#7ED957", "#22C55E"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.triggerGradient}
                >
                    <Ionicons name="people" size={18} color="#000" />
                    <Text style={styles.triggerText}>Invite Friends</Text>
                </LinearGradient>
            </TouchableOpacity>

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Invite to Play 🏀</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#888" />
                            </TouchableOpacity>
                        </View>

                        {courtName && (
                            <View style={styles.courtInfo}>
                                <Ionicons name="location" size={16} color="#7ED957" />
                                <Text style={styles.courtName}>{courtName}</Text>
                            </View>
                        )}

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>What time?</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. 3pm, in 30 min"
                                placeholderTextColor="#666"
                                value={time}
                                onChangeText={setTime}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Add a message (optional)</Text>
                            <TextInput
                                style={[styles.input, styles.messageInput]}
                                placeholder="Bring your A-game!"
                                placeholderTextColor="#666"
                                value={customMessage}
                                onChangeText={setCustomMessage}
                                multiline
                            />
                        </View>

                        <View style={styles.previewBox}>
                            <Text style={styles.previewLabel}>Preview:</Text>
                            <Text style={styles.previewText}>{getInviteMessage().replace(deepLink, "[link]")}</Text>
                        </View>

                        <View style={styles.actionRow}>
                            <TouchableOpacity style={styles.smsAction} onPress={handleSendSMS}>
                                <Ionicons name="chatbubble" size={18} color="#7ED957" />
                                <Text style={styles.smsActionText}>Text Friends</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.socialAction} onPress={handleShareSocial}>
                                <Ionicons name="share-social" size={18} color="#000" />
                                <Text style={styles.socialActionText}>Post</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    )
}

const styles = StyleSheet.create({
    triggerButton: {
        borderRadius: 16,
        overflow: "hidden",
    },
    triggerGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 14,
        paddingHorizontal: 20,
    },
    triggerText: {
        color: "#000",
        fontSize: 15,
        fontWeight: "700",
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
        marginBottom: 16,
    },
    modalTitle: {
        color: "#FFF",
        fontSize: 20,
        fontWeight: "700",
    },
    courtInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#7ED95715",
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
    },
    courtName: {
        color: "#7ED957",
        fontSize: 14,
        fontWeight: "600",
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        color: "#888",
        fontSize: 12,
        marginBottom: 6,
    },
    input: {
        backgroundColor: "#252525",
        borderRadius: 12,
        padding: 14,
        color: "#FFF",
        fontSize: 15,
    },
    messageInput: {
        minHeight: 80,
        textAlignVertical: "top",
    },
    previewBox: {
        backgroundColor: "#252525",
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    previewLabel: {
        color: "#666",
        fontSize: 10,
        marginBottom: 6,
    },
    previewText: {
        color: "#CCC",
        fontSize: 12,
        lineHeight: 18,
    },
    actionRow: {
        flexDirection: "row",
        gap: 12,
    },
    smsAction: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        backgroundColor: "#7ED95720",
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#7ED95740",
    },
    smsActionText: {
        color: "#7ED957",
        fontSize: 14,
        fontWeight: "600",
    },
    socialAction: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        backgroundColor: "#7ED957",
        paddingVertical: 14,
        borderRadius: 14,
    },
    socialActionText: {
        color: "#000",
        fontSize: 14,
        fontWeight: "600",
    },
})

export default PlayInvite
