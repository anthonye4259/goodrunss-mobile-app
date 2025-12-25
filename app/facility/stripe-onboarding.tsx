/**
 * Stripe Connect Onboarding Screen
 * Guides facility owners through connecting their bank account for payouts
 */

import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Linking,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router, useLocalSearchParams } from "expo-router"
import * as Haptics from "expo-haptics"
import * as WebBrowser from "expo-web-browser"

import { useAuth } from "@/lib/auth-context"
import { facilityService, ClaimedFacility } from "@/lib/services/facility-service"
import { stripeConnectService, ConnectAccountStatus } from "@/lib/services/stripe-connect-service"

export default function StripeOnboardingScreen() {
    const { facilityId } = useLocalSearchParams()
    const { user } = useAuth()

    const [facility, setFacility] = useState<ClaimedFacility | null>(null)
    const [accountStatus, setAccountStatus] = useState<ConnectAccountStatus | null>(null)
    const [loading, setLoading] = useState(true)
    const [connecting, setConnecting] = useState(false)

    useEffect(() => {
        loadFacilityAndStatus()
    }, [facilityId])

    const loadFacilityAndStatus = async () => {
        if (!facilityId || !user) return
        setLoading(true)

        try {
            // Get facility details
            const facilities = await facilityService.getFacilitiesByOwner(user.uid)
            const fac = facilities.find(f => f.id === facilityId)
            setFacility(fac || null)

            // Check Stripe Connect status
            if (fac?.stripeAccountId) {
                const status = await stripeConnectService.getAccountStatus(fac.stripeAccountId)
                setAccountStatus(status)
            }
        } catch (error) {
            console.error("Error loading facility:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleStartOnboarding = async () => {
        if (!facility) return

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        setConnecting(true)

        try {
            // Create Connect account and get onboarding URL
            const result = await stripeConnectService.createConnectAccount(facility.id, {
                businessName: facility.businessName,
                email: facility.businessEmail,
            })

            if (result?.onboardingUrl) {
                // Open Stripe onboarding in browser
                const browserResult = await WebBrowser.openAuthSessionAsync(
                    result.onboardingUrl,
                    "goodrunss://facility/stripe-return"
                )

                if (browserResult.type === "success") {
                    // Refresh status
                    loadFacilityAndStatus()
                }
            } else {
                Alert.alert("Error", "Failed to start Stripe onboarding. Please try again.")
            }
        } catch (error) {
            console.error("Onboarding error:", error)
            Alert.alert("Error", "Something went wrong. Please try again.")
        } finally {
            setConnecting(false)
        }
    }

    const handleContinueOnboarding = async () => {
        if (!facility?.stripeAccountId) return

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        setConnecting(true)

        try {
            const onboardingUrl = await stripeConnectService.createOnboardingLink(facility.stripeAccountId)

            if (onboardingUrl) {
                const browserResult = await WebBrowser.openAuthSessionAsync(
                    onboardingUrl,
                    "goodrunss://facility/stripe-return"
                )

                if (browserResult.type === "success") {
                    loadFacilityAndStatus()
                }
            } else {
                Alert.alert("Error", "Failed to continue onboarding. Please try again.")
            }
        } catch (error) {
            console.error("Continue onboarding error:", error)
        } finally {
            setConnecting(false)
        }
    }

    const handleOpenDashboard = async () => {
        if (!facility?.stripeAccountId) return

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

        try {
            const dashboardUrl = await stripeConnectService.createDashboardLink(facility.stripeAccountId)

            if (dashboardUrl) {
                await Linking.openURL(dashboardUrl)
            } else {
                Alert.alert("Error", "Failed to open Stripe dashboard.")
            }
        } catch (error) {
            console.error("Dashboard error:", error)
        }
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7ED957" />
            </View>
        )
    }

    const isFullyOnboarded = accountStatus?.isOnboarded && accountStatus?.payoutsEnabled

    return (
        <View style={styles.container}>
            <LinearGradient colors={["#0A0A0A", "#111"]} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Payment Setup</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.content}>
                    {/* Stripe Icon */}
                    <View style={styles.iconContainer}>
                        <LinearGradient
                            colors={isFullyOnboarded ? ["#7ED957", "#4C9E29"] : ["#635BFF", "#4F46E5"]}
                            style={styles.iconGradient}
                        >
                            <Ionicons
                                name={isFullyOnboarded ? "checkmark" : "card"}
                                size={48}
                                color="#FFF"
                            />
                        </LinearGradient>
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>
                        {isFullyOnboarded ? "Payouts Enabled! 🎉" : "Connect Stripe"}
                    </Text>
                    <Text style={styles.subtitle}>
                        {isFullyOnboarded
                            ? "You're all set to receive payments from court bookings"
                            : "Connect your bank account to receive payments from court bookings"}
                    </Text>

                    {/* Status */}
                    {accountStatus && (
                        <View style={styles.statusCard}>
                            <View style={styles.statusRow}>
                                <Text style={styles.statusLabel}>Account Created</Text>
                                <Ionicons
                                    name={accountStatus.hasAccount ? "checkmark-circle" : "ellipse-outline"}
                                    size={20}
                                    color={accountStatus.hasAccount ? "#7ED957" : "#666"}
                                />
                            </View>
                            <View style={styles.statusRow}>
                                <Text style={styles.statusLabel}>Details Submitted</Text>
                                <Ionicons
                                    name={accountStatus.detailsSubmitted ? "checkmark-circle" : "ellipse-outline"}
                                    size={20}
                                    color={accountStatus.detailsSubmitted ? "#7ED957" : "#666"}
                                />
                            </View>
                            <View style={styles.statusRow}>
                                <Text style={styles.statusLabel}>Payouts Enabled</Text>
                                <Ionicons
                                    name={accountStatus.payoutsEnabled ? "checkmark-circle" : "ellipse-outline"}
                                    size={20}
                                    color={accountStatus.payoutsEnabled ? "#7ED957" : "#666"}
                                />
                            </View>
                        </View>
                    )}

                    {/* Info Cards */}
                    {!isFullyOnboarded && (
                        <View style={styles.infoSection}>
                            <View style={styles.infoCard}>
                                <Ionicons name="shield-checkmark" size={24} color="#7ED957" />
                                <View style={styles.infoText}>
                                    <Text style={styles.infoTitle}>Secure & Fast</Text>
                                    <Text style={styles.infoDesc}>Stripe handles all payment processing securely</Text>
                                </View>
                            </View>
                            <View style={styles.infoCard}>
                                <Ionicons name="wallet" size={24} color="#7ED957" />
                                <View style={styles.infoText}>
                                    <Text style={styles.infoTitle}>Automatic Payouts</Text>
                                    <Text style={styles.infoDesc}>Receive earnings directly to your bank account</Text>
                                </View>
                            </View>
                            <View style={styles.infoCard}>
                                <Ionicons name="receipt" size={24} color="#7ED957" />
                                <View style={styles.infoText}>
                                    <Text style={styles.infoTitle}>Track Earnings</Text>
                                    <Text style={styles.infoDesc}>View all transactions in your Stripe dashboard</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Actions */}
                    <View style={styles.actions}>
                        {!accountStatus?.hasAccount && (
                            <TouchableOpacity
                                style={styles.primaryBtn}
                                disabled={connecting}
                                onPress={handleStartOnboarding}
                            >
                                <LinearGradient
                                    colors={["#635BFF", "#4F46E5"]}
                                    style={styles.primaryBtnGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    {connecting ? (
                                        <ActivityIndicator color="#FFF" />
                                    ) : (
                                        <>
                                            <Ionicons name="card" size={20} color="#FFF" />
                                            <Text style={styles.primaryBtnText}>Connect with Stripe</Text>
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        )}

                        {accountStatus?.hasAccount && !isFullyOnboarded && (
                            <TouchableOpacity
                                style={styles.primaryBtn}
                                disabled={connecting}
                                onPress={handleContinueOnboarding}
                            >
                                <LinearGradient
                                    colors={["#635BFF", "#4F46E5"]}
                                    style={styles.primaryBtnGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    {connecting ? (
                                        <ActivityIndicator color="#FFF" />
                                    ) : (
                                        <>
                                            <Ionicons name="arrow-forward" size={20} color="#FFF" />
                                            <Text style={styles.primaryBtnText}>Continue Setup</Text>
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        )}

                        {isFullyOnboarded && (
                            <>
                                <TouchableOpacity
                                    style={styles.primaryBtn}
                                    onPress={handleOpenDashboard}
                                >
                                    <LinearGradient
                                        colors={["#7ED957", "#4C9E29"]}
                                        style={styles.primaryBtnGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    >
                                        <Ionicons name="open" size={20} color="#000" />
                                        <Text style={[styles.primaryBtnText, { color: "#000" }]}>Open Stripe Dashboard</Text>
                                    </LinearGradient>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.secondaryBtn}
                                    onPress={() => router.replace("/facility/dashboard")}
                                >
                                    <Text style={styles.secondaryBtnText}>Back to Dashboard</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
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
    headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "bold" },

    content: {
        flex: 1,
        paddingHorizontal: 24,
        alignItems: "center",
        paddingTop: 20,
    },

    iconContainer: { marginBottom: 24 },
    iconGradient: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: "center",
        justifyContent: "center",
    },

    title: {
        color: "#FFF",
        fontSize: 26,
        fontWeight: "bold",
        textAlign: "center",
    },
    subtitle: {
        color: "#888",
        fontSize: 16,
        textAlign: "center",
        marginTop: 8,
        marginBottom: 24,
        paddingHorizontal: 20,
    },

    statusCard: {
        width: "100%",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    statusRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
    },
    statusLabel: { color: "#CCC", fontSize: 14 },

    infoSection: { width: "100%", marginBottom: 24 },
    infoCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        marginBottom: 10,
    },
    infoText: { marginLeft: 16, flex: 1 },
    infoTitle: { color: "#FFF", fontSize: 16, fontWeight: "600" },
    infoDesc: { color: "#888", fontSize: 14, marginTop: 2 },

    actions: { width: "100%", marginTop: "auto", paddingBottom: 20 },
    primaryBtn: { borderRadius: 16, overflow: "hidden", marginBottom: 12 },
    primaryBtnGradient: {
        paddingVertical: 18,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    primaryBtnText: { color: "#FFF", fontSize: 18, fontWeight: "700" },
    secondaryBtn: {
        paddingVertical: 14,
        alignItems: "center",
    },
    secondaryBtnText: { color: "#7ED957", fontSize: 16, fontWeight: "600" },
})
