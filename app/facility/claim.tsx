/**
 * Facility Claim Screen
 * Allows facility owners to claim and manage their listing
 */

import React, { useState } from "react"
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    StyleSheet,
    ActivityIndicator,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router, useLocalSearchParams } from "expo-router"
import * as Haptics from "expo-haptics"

import { useAuth } from "@/lib/auth-context"
import { facilityService } from "@/lib/services/facility-service"

export default function ClaimFacilityScreen() {
    const { venueId, venueName } = useLocalSearchParams()
    const { user } = useAuth()

    // Form state
    const [businessName, setBusinessName] = useState("")
    const [businessPhone, setBusinessPhone] = useState("")
    const [businessEmail, setBusinessEmail] = useState(user?.email || "")
    const [verificationCode, setVerificationCode] = useState("")
    const [step, setStep] = useState<"info" | "verify" | "success">("info")
    const [loading, setLoading] = useState(false)
    const [codeSent, setCodeSent] = useState(false)

    const handleSendCode = async () => {
        if (!businessPhone || businessPhone.length < 10) {
            Alert.alert("Error", "Please enter a valid phone number")
            return
        }

        setLoading(true)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        try {
            // In production, send SMS verification code
            // For now, simulate code sent
            await new Promise(resolve => setTimeout(resolve, 1500))

            setCodeSent(true)
            setStep("verify")
            Alert.alert("Code Sent", "A verification code has been sent to your phone.")
        } catch (error) {
            console.error("Error sending code:", error)
            Alert.alert("Error", "Failed to send verification code. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyCode = async () => {
        if (!verificationCode || verificationCode.length < 4) {
            Alert.alert("Error", "Please enter the verification code")
            return
        }

        setLoading(true)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        try {
            // In production, verify the code via backend
            // For demo, accept any 4+ digit code
            if (verificationCode.length < 4) {
                throw new Error("Invalid code")
            }

            // Claim the facility
            const facilityId = await facilityService.claimFacility(
                venueId as string,
                user?.uid || "",
                {
                    businessName,
                    businessPhone,
                    businessEmail,
                }
            )

            if (facilityId) {
                // Mark as verified
                await facilityService.verifyFacility(facilityId)

                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                setStep("success")
            } else {
                throw new Error("Failed to claim facility")
            }
        } catch (error) {
            console.error("Error verifying:", error)
            Alert.alert("Error", "Invalid verification code. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const formatPhoneNumber = (text: string) => {
        // Remove non-numeric characters
        const cleaned = text.replace(/\D/g, "")
        // Format as (XXX) XXX-XXXX
        if (cleaned.length <= 3) return cleaned
        if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={["#0A0A0A", "#111"]} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="close" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Claim Facility</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    {step === "info" && (
                        <>
                            {/* Venue Info */}
                            <View style={styles.venueCard}>
                                <Ionicons name="business" size={32} color="#7ED957" />
                                <Text style={styles.venueName}>{venueName || "Your Facility"}</Text>
                                <Text style={styles.venueSubtext}>
                                    Claim this facility to manage court bookings and receive payments
                                </Text>
                            </View>

                            {/* Benefits */}
                            <View style={styles.benefitsSection}>
                                <Text style={styles.sectionTitle}>What You Get</Text>
                                <View style={styles.benefitRow}>
                                    <Ionicons name="checkmark-circle" size={20} color="#7ED957" />
                                    <Text style={styles.benefitText}>Accept court bookings through the app</Text>
                                </View>
                                <View style={styles.benefitRow}>
                                    <Ionicons name="checkmark-circle" size={20} color="#7ED957" />
                                    <Text style={styles.benefitText}>Get paid directly via Stripe</Text>
                                </View>
                                <View style={styles.benefitRow}>
                                    <Ionicons name="checkmark-circle" size={20} color="#7ED957" />
                                    <Text style={styles.benefitText}>Manage availability and pricing</Text>
                                </View>
                                <View style={styles.benefitRow}>
                                    <Ionicons name="checkmark-circle" size={20} color="#7ED957" />
                                    <Text style={styles.benefitText}>Free listing - only 8% booking fee</Text>
                                </View>
                            </View>

                            {/* Form */}
                            <View style={styles.formSection}>
                                <Text style={styles.sectionTitle}>Business Information</Text>

                                <Text style={styles.inputLabel}>Business Name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={businessName}
                                    onChangeText={setBusinessName}
                                    placeholder="e.g., Piedmont Tennis Center"
                                    placeholderTextColor="#666"
                                />

                                <Text style={styles.inputLabel}>Phone Number (for verification)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={businessPhone}
                                    onChangeText={(text) => setBusinessPhone(formatPhoneNumber(text))}
                                    placeholder="(555) 123-4567"
                                    placeholderTextColor="#666"
                                    keyboardType="phone-pad"
                                    maxLength={14}
                                />

                                <Text style={styles.inputLabel}>Business Email</Text>
                                <TextInput
                                    style={styles.input}
                                    value={businessEmail}
                                    onChangeText={setBusinessEmail}
                                    placeholder="contact@facility.com"
                                    placeholderTextColor="#666"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>

                            {/* Submit Button */}
                            <TouchableOpacity
                                style={[styles.submitBtn, (!businessName || !businessPhone) && styles.submitBtnDisabled]}
                                disabled={!businessName || !businessPhone || loading}
                                onPress={handleSendCode}
                            >
                                <LinearGradient
                                    colors={businessName && businessPhone ? ["#7ED957", "#4C9E29"] : ["#333", "#222"]}
                                    style={styles.submitBtnGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#000" />
                                    ) : (
                                        <>
                                            <Ionicons name="phone-portrait" size={20} color="#000" />
                                            <Text style={styles.submitBtnText}>Send Verification Code</Text>
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </>
                    )}

                    {step === "verify" && (
                        <>
                            <View style={styles.verifySection}>
                                <Ionicons name="shield-checkmark" size={64} color="#7ED957" />
                                <Text style={styles.verifyTitle}>Verify Your Phone</Text>
                                <Text style={styles.verifySubtext}>
                                    We sent a code to {businessPhone}
                                </Text>

                                <TextInput
                                    style={styles.codeInput}
                                    value={verificationCode}
                                    onChangeText={setVerificationCode}
                                    placeholder="Enter 4-digit code"
                                    placeholderTextColor="#666"
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    textAlign="center"
                                />

                                <TouchableOpacity
                                    style={styles.submitBtn}
                                    disabled={loading}
                                    onPress={handleVerifyCode}
                                >
                                    <LinearGradient
                                        colors={["#7ED957", "#4C9E29"]}
                                        style={styles.submitBtnGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    >
                                        {loading ? (
                                            <ActivityIndicator color="#000" />
                                        ) : (
                                            <Text style={styles.submitBtnText}>Verify & Claim Facility</Text>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.resendBtn}
                                    onPress={handleSendCode}
                                >
                                    <Text style={styles.resendText}>Resend Code</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                    {step === "success" && (
                        <View style={styles.successSection}>
                            <Ionicons name="checkmark-circle" size={80} color="#7ED957" />
                            <Text style={styles.successTitle}>Facility Claimed! 🎉</Text>
                            <Text style={styles.successSubtext}>
                                Your facility is now live on GoodRunss. Next step: set up your courts and availability.
                            </Text>

                            <TouchableOpacity
                                style={styles.submitBtn}
                                onPress={() => router.replace("/facility/dashboard")}
                            >
                                <LinearGradient
                                    colors={["#7ED957", "#4C9E29"]}
                                    style={styles.submitBtnGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    <Ionicons name="settings" size={20} color="#000" />
                                    <Text style={styles.submitBtnText}>Set Up Courts</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
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
    headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "bold" },

    content: { paddingHorizontal: 20, paddingBottom: 40 },

    venueCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 24,
        alignItems: "center",
        marginBottom: 24,
    },
    venueName: { color: "#FFF", fontSize: 20, fontWeight: "bold", marginTop: 12 },
    venueSubtext: { color: "#888", fontSize: 14, textAlign: "center", marginTop: 8 },

    benefitsSection: { marginBottom: 24 },
    sectionTitle: { color: "#FFF", fontSize: 16, fontWeight: "600", marginBottom: 16 },
    benefitRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
    benefitText: { color: "#CCC", fontSize: 14, marginLeft: 12 },

    formSection: { marginBottom: 24 },
    inputLabel: { color: "#888", fontSize: 12, marginBottom: 8 },
    input: {
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        color: "#FFF",
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#333",
        marginBottom: 16,
    },

    submitBtn: { borderRadius: 16, overflow: "hidden", marginTop: 8 },
    submitBtnDisabled: { opacity: 0.5 },
    submitBtnGradient: {
        paddingVertical: 18,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    submitBtnText: { color: "#000", fontSize: 18, fontWeight: "800" },

    verifySection: { alignItems: "center", paddingTop: 40 },
    verifyTitle: { color: "#FFF", fontSize: 24, fontWeight: "bold", marginTop: 20 },
    verifySubtext: { color: "#888", fontSize: 14, marginTop: 8 },
    codeInput: {
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 20,
        color: "#FFF",
        fontSize: 24,
        fontWeight: "bold",
        borderWidth: 1,
        borderColor: "#333",
        marginTop: 32,
        marginBottom: 24,
        width: "60%",
        letterSpacing: 8,
    },
    resendBtn: { marginTop: 16 },
    resendText: { color: "#7ED957", fontSize: 14, fontWeight: "600" },

    successSection: { alignItems: "center", paddingTop: 60 },
    successTitle: { color: "#FFF", fontSize: 28, fontWeight: "bold", marginTop: 20 },
    successSubtext: { color: "#888", fontSize: 16, textAlign: "center", marginTop: 12, marginBottom: 32, paddingHorizontal: 20 },
})
