/**
 * Share Booking Link (Trainer)
 * 
 * Trainers share their booking link to attract new clients.
 * Includes QR code option for in-person networking.
 */

import React, { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Share, Alert, Modal } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as Clipboard from "expo-clipboard"
import * as Haptics from "expo-haptics"
import QRCode from 'react-native-qrcode-svg'

type Props = {
    trainerId: string
    trainerName: string
    specialty?: string
    variant?: "card" | "button" | "fab"
    onShared?: () => void
}

export function ShareBookingLink({ trainerId, trainerName, specialty, variant = "card", onShared }: Props) {
    const bookingLink = `https://dalaiweb.vercel.app/book/${trainerId}`
    const [showQR, setShowQR] = useState(false)

    const getShareMessage = () => {
        const specialtyText = specialty ? ` ${specialty}` : ""
        return `💪 Book a${specialtyText} training session with me!\n\n🗓 Easy online booking\n💳 Secure payment\n📱 Get reminders\n\n${bookingLink}`
    }

    const handleShare = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        try {
            const result = await Share.share({
                title: `Book with ${trainerName}`,
                message: getShareMessage(),
                url: bookingLink,
            })

            if (result.action === Share.sharedAction) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                onShared?.()
            }
        } catch (error) {
            Alert.alert("Error", "Failed to share")
        }
    }

    const handleCopy = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        await Clipboard.setStringAsync(bookingLink)
        Alert.alert("Copied! 📋", "Booking link copied to clipboard")
        onShared?.()
    }

    if (variant === "fab") {
        return (
            <>
                <TouchableOpacity style={styles.fab} onPress={() => setShowQR(true)}>
                    <LinearGradient
                        colors={["#7ED957", "#22C55E"]}
                        style={styles.fabGradient}
                    >
                        <Ionicons name="qr-code" size={24} color="#000" />
                    </LinearGradient>
                </TouchableOpacity>

                {showQR && (
                    <QRCodeModal
                        visible={showQR}
                        onClose={() => setShowQR(false)}
                        value={bookingLink}
                        name={trainerName}
                        onShare={handleShare}
                    />
                )}
            </>
        )
    }

    if (variant === "button") {
        return (
            <>
                <TouchableOpacity style={styles.button} onPress={() => setShowQR(true)}>
                    <Ionicons name="qr-code-outline" size={16} color="#7ED957" />
                    <Text style={styles.buttonText}>Show QR Code</Text>
                </TouchableOpacity>

                {showQR && (
                    <QRCodeModal
                        visible={showQR}
                        onClose={() => setShowQR(false)}
                        value={bookingLink}
                        name={trainerName}
                        onShare={handleShare}
                    />
                )}
            </>
        )
    }

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <Ionicons name="link" size={20} color="#7ED957" />
                </View>
                <View style={styles.headerText}>
                    <Text style={styles.title}>Your Booking Link</Text>
                    <Text style={styles.subtitle}>Share to get more clients</Text>
                </View>
                <TouchableOpacity onPress={() => setShowQR(true)} style={styles.miniQrBtn}>
                    <Ionicons name="qr-code" size={20} color="#7ED957" />
                </TouchableOpacity>
            </View>

            <View style={styles.linkBox}>
                <Text style={styles.linkText} numberOfLines={1}>{bookingLink}</Text>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
                    <Ionicons name="copy" size={16} color="#FFF" />
                    <Text style={styles.copyText}>Copy</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                    <Ionicons name="share-social" size={16} color="#000" />
                    <Text style={styles.shareText}>Share</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.tip}>
                <Ionicons name="bulb" size={14} color="#F59E0B" />
                <Text style={styles.tipText}>
                    Add this to your Instagram bio & stories!
                </Text>
            </View>

            {showQR && (
                <QRCodeModal
                    visible={showQR}
                    onClose={() => setShowQR(false)}
                    value={bookingLink}
                    name={trainerName}
                    onShare={handleShare}
                />
            )}
        </View>
    )
}

function QRCodeModal({ visible, onClose, value, name, onShare }: {
    visible: boolean,
    onClose: () => void,
    value: string,
    name: string,
    onShare: () => void
}) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <Ionicons name="close" size={24} color="#FFF" />
                    </TouchableOpacity>

                    <Text style={styles.modalTitle}>Scan to Book</Text>
                    <Text style={styles.modalSubtitle}>{name}</Text>

                    <View style={styles.qrContainer}>
                        <QRCode
                            value={value}
                            size={200}
                            color="#000000"
                            backgroundColor="#FFFFFF"
                        />
                    </View>

                    <Text style={styles.qrHint}>
                        Clients can scan to book immediately without downloading the app.
                    </Text>

                    <TouchableOpacity style={styles.modalShareBtn} onPress={onShare}>
                        <Ionicons name="share-outline" size={20} color="#000" />
                        <Text style={styles.modalShareText}>Share Link Instead</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#141414",
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#7ED95730",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 14,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#7ED95720",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    headerText: {
        flex: 1,
    },
    title: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "700",
    },
    subtitle: {
        color: "#888",
        fontSize: 12,
        marginTop: 2,
    },
    miniQrBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#1A1A1A",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#333",
    },
    linkBox: {
        backgroundColor: "#0A0A0A",
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#252525",
    },
    linkText: {
        color: "#7ED957",
        fontSize: 13,
        fontFamily: "monospace",
    },
    actions: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 12,
    },
    copyButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        backgroundColor: "#333",
        paddingVertical: 12,
        borderRadius: 12,
    },
    copyText: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "600",
    },
    shareButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        backgroundColor: "#7ED957",
        paddingVertical: 12,
        borderRadius: 12,
    },
    shareText: {
        color: "#000",
        fontSize: 14,
        fontWeight: "600",
    },
    tip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#F59E0B10",
        padding: 10,
        borderRadius: 10,
    },
    tipText: {
        color: "#F59E0B",
        fontSize: 12,
        flex: 1,
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#7ED95720",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#7ED95740",
    },
    buttonText: {
        color: "#7ED957",
        fontSize: 13,
        fontWeight: "600",
    },
    fab: {
        position: "absolute",
        bottom: 100,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        overflow: "hidden",
        shadowColor: "#7ED957",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    fabGradient: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.85)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContent: {
        width: "100%",
        maxWidth: 340,
        backgroundColor: "#1A1A1A",
        borderRadius: 24,
        padding: 30,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#333",
    },
    closeBtn: {
        position: "absolute",
        top: 16,
        right: 16,
        padding: 4,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#FFF",
        marginBottom: 4,
    },
    modalSubtitle: {
        fontSize: 16,
        color: "#7ED957",
        marginBottom: 24,
        fontWeight: "600",
    },
    qrContainer: {
        padding: 16,
        backgroundColor: "#FFF",
        borderRadius: 16,
        marginBottom: 24,
    },
    qrHint: {
        textAlign: "center",
        color: "#9CA3AF",
        fontSize: 14,
        marginBottom: 24,
        lineHeight: 20,
    },
    modalShareBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#7ED957",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        width: "100%",
        justifyContent: "center",
    },
    modalShareText: {
        color: "#000",
        fontWeight: "600",
        fontSize: 16,
    },
})

export default ShareBookingLink
