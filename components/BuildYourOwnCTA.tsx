/**
 * Build Your Own CTA
 * 
 * Shown to clients after first booking/payment/message.
 * Prompts them to create their own Dal app.
 */

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Modal, Linking } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"
import AsyncStorage from "@react-native-async-storage/async-storage"

const CTA_STORAGE_KEY = "@dal_build_your_own_shown"
const CTA_TRIGGER_KEY = "@dal_client_engagement"

export function useBuildYourOwnTrigger() {
    const [shouldShow, setShouldShow] = useState(false)

    const checkTrigger = async () => {
        try {
            const alreadyShown = await AsyncStorage.getItem(CTA_STORAGE_KEY)
            if (alreadyShown) return

            const engagement = await AsyncStorage.getItem(CTA_TRIGGER_KEY)
            const count = engagement ? parseInt(engagement) : 0

            // Show after first engagement (booking, payment, or message)
            if (count >= 1) {
                setShouldShow(true)
            }
        } catch (e) {
            console.error("CTA trigger check failed:", e)
        }
    }

    useEffect(() => {
        checkTrigger()
    }, [])

    return { shouldShow, setShouldShow }
}

// Call this when client books, pays, or messages
export async function trackClientEngagement() {
    try {
        const current = await AsyncStorage.getItem(CTA_TRIGGER_KEY)
        const count = current ? parseInt(current) + 1 : 1
        await AsyncStorage.setItem(CTA_TRIGGER_KEY, count.toString())
    } catch (e) {
        console.error("Failed to track engagement:", e)
    }
}

export function BuildYourOwnCTA({ visible, onClose }: { visible: boolean, onClose: () => void }) {
    const handleGetStarted = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        await AsyncStorage.setItem(CTA_STORAGE_KEY, "true")
        Linking.openURL("https://dalai.app/signup?utm_source=client_app")
        onClose()
    }

    const handleDismiss = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        await AsyncStorage.setItem(CTA_STORAGE_KEY, "true")
        onClose()
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.sheet}>
                    <LinearGradient
                        colors={["#7ED95720", "#22C55E10"]}
                        style={styles.gradient}
                    >
                        <TouchableOpacity style={styles.closeBtn} onPress={handleDismiss}>
                            <Ionicons name="close" size={24} color="#6B7280" />
                        </TouchableOpacity>

                        <View style={styles.iconContainer}>
                            <Ionicons name="rocket" size={40} color="#7ED957" />
                        </View>

                        <Text style={styles.title}>Want Your Own App?</Text>
                        <Text style={styles.subtitle}>
                            Build a custom app like this for YOUR business in under 5 minutes.
                        </Text>

                        <View style={styles.features}>
                            <FeatureRow icon="checkmark" text="Accept bookings & payments" />
                            <FeatureRow icon="checkmark" text="Your brand, your logo" />
                            <FeatureRow icon="checkmark" text="No coding required" />
                        </View>

                        <TouchableOpacity style={styles.ctaButton} onPress={handleGetStarted}>
                            <Text style={styles.ctaText}>Build My App Free</Text>
                            <Ionicons name="arrow-forward" size={18} color="#000" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleDismiss}>
                            <Text style={styles.dismissText}>Maybe later</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
            </View>
        </Modal>
    )
}

function FeatureRow({ icon, text }: { icon: string, text: string }) {
    return (
        <View style={styles.featureRow}>
            <View style={styles.featureIcon}>
                <Ionicons name={icon as any} size={14} color="#7ED957" />
            </View>
            <Text style={styles.featureText}>{text}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "flex-end",
    },
    sheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: "hidden",
    },
    gradient: {
        padding: 24,
        paddingBottom: 40,
        alignItems: "center",
    },
    closeBtn: {
        position: "absolute",
        top: 16,
        right: 16,
        padding: 4,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: "#7ED95720",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: "#FFF",
        marginBottom: 8,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 15,
        color: "#9CA3AF",
        textAlign: "center",
        marginBottom: 24,
        lineHeight: 22,
    },
    features: {
        width: "100%",
        marginBottom: 24,
    },
    featureRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    featureIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#7ED95720",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    featureText: {
        fontSize: 15,
        color: "#FFF",
    },
    ctaButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#7ED957",
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 14,
        width: "100%",
        marginBottom: 16,
    },
    ctaText: {
        fontSize: 17,
        fontWeight: "700",
        color: "#000",
    },
    dismissText: {
        fontSize: 14,
        color: "#6B7280",
    },
})

export default BuildYourOwnCTA
