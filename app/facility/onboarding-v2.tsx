/**
 * Value-First Facility Onboarding v2
 * 
 * Lead with VALUE before asking for information:
 * 1. Integration-First: "Already use a booking system?"
 * 2. Market Intelligence: Show local player demand
 * 3. Revenue Calculator: Personalized earnings estimate
 * 4. Quick Form: Pre-filled when integration selected
 */

import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Animated,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import Slider from "@react-native-community/slider"

import { useAuth } from "@/lib/auth-context"
import { useUserPreferences } from "@/lib/user-preferences"
import { facilityService } from "@/lib/services/facility-service"
import { marketIntelligenceService, MarketIntelligence, RevenueEstimate } from "@/lib/services/market-intelligence-service"
import { externalIntegrationService, IntegrationType } from "@/lib/services/external-integration-service"

type OnboardingStep = "integration" | "market" | "form" | "confirm"

const INTEGRATIONS = [
    { id: "courtreserve" as IntegrationType, name: "CourtReserve", icon: "tennisball" },
    { id: "podplay" as IntegrationType, name: "PodPlay", icon: "play-circle" },
    { id: "10is" as IntegrationType, name: "10is Tennis", icon: "tennisball" },
    { id: "none" as "none", name: "Start Fresh", icon: "add-circle" },
]

const DEFAULT_OPERATING_HOURS = {
    monday: { open: "06:00", close: "22:00", closed: false },
    tuesday: { open: "06:00", close: "22:00", closed: false },
    wednesday: { open: "06:00", close: "22:00", closed: false },
    thursday: { open: "06:00", close: "22:00", closed: false },
    friday: { open: "06:00", close: "22:00", closed: false },
    saturday: { open: "07:00", close: "20:00", closed: false },
    sunday: { open: "08:00", close: "18:00", closed: false },
}

export default function OnboardingV2Screen() {
    const { user } = useAuth()
    const { setPreferences } = useUserPreferences()
    const [loading, setLoading] = useState(false)
    const [loadingMarket, setLoadingMarket] = useState(false)
    const fadeAnim = useState(new Animated.Value(0))[0]

    // Current step
    const [step, setStep] = useState<OnboardingStep>("integration")

    // Integration
    const [selectedIntegration, setSelectedIntegration] = useState<IntegrationType | "none" | null>(null)
    const [integrationConnected, setIntegrationConnected] = useState(false)

    // Market Intelligence
    const [marketData, setMarketData] = useState<MarketIntelligence | null>(null)
    const [revenueEstimate, setRevenueEstimate] = useState<RevenueEstimate | null>(null)

    // Form state
    const [facilityName, setFacilityName] = useState("")
    const [phone, setPhone] = useState("")
    const [email, setEmail] = useState(user?.email || "")
    const [address, setAddress] = useState("")
    const [city, setCity] = useState("")
    const [state, setState] = useState("")
    const [zipCode, setZipCode] = useState("")
    const [password, setPassword] = useState("") // For new account creation
    const [facilityType, setFacilityType] = useState<"racquet" | "wellness">("racquet")
    const [selectedSports, setSelectedSports] = useState<string[]>(["Tennis"])
    const [courtCount, setCourtCount] = useState(4)
    const [hourlyRate, setHourlyRate] = useState(45)
    const [utilization, setUtilization] = useState(70)

    // Booking configuration
    const [slotDuration, setSlotDuration] = useState<30 | 60 | 90>(60) // minutes
    const [hasPeakPricing, setHasPeakPricing] = useState(false)
    const [peakHoursStart, setPeakHoursStart] = useState(17) // 5 PM
    const [peakHoursEnd, setPeakHoursEnd] = useState(20) // 8 PM
    const [peakRateIncrease, setPeakRateIncrease] = useState(10) // $10 more during peak

    // Social proof
    const socialProof = marketIntelligenceService.getSocialProof()

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start()
    }, [step])

    // Fetch market data when city/sport changes
    useEffect(() => {
        if (city && selectedSports.length > 0) {
            fetchMarketData()
        }
    }, [city, selectedSports])

    // Update revenue estimate when inputs change
    useEffect(() => {
        const estimate = marketIntelligenceService.getRevenueEstimate(courtCount, hourlyRate, utilization)
        setRevenueEstimate(estimate)
    }, [courtCount, hourlyRate, utilization])

    const fetchMarketData = async () => {
        setLoadingMarket(true)
        try {
            const data = await marketIntelligenceService.getMarketIntelligence(city, selectedSports[0])
            setMarketData(data)

            // Set suggested pricing
            const pricing = marketIntelligenceService.getSuggestedPricing(data)
            setHourlyRate(pricing.suggested)
        } catch (error) {
            console.error("Error fetching market data:", error)
        } finally {
            setLoadingMarket(false)
        }
    }

    const handleSelectIntegration = async (integration: IntegrationType | "none") => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        setSelectedIntegration(integration)

        if (integration !== "none") {
            // TODO: Connect to integration and auto-import
            // For now, simulate connection
            setLoading(true)
            setTimeout(() => {
                setIntegrationConnected(true)
                setLoading(false)
                // Pre-fill with mock data
                setFacilityName("Your Tennis Center")
                setCity("Atlanta")
                setState("GA")
                setCourtCount(4)
                setStep("market")
            }, 1500)
        } else {
            setStep("market")
        }
    }

    const handleContinueToForm = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        setStep("form")
    }

    const handleLaunch = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
        setLoading(true)

        try {
            let userId = user?.uid

            // If not logged in, create account first
            if (!user) {
                if (!email || !password) {
                    Alert.alert("Account Required", "Please enter your email and create a password to complete setup.")
                    setLoading(false)
                    return
                }

                if (password.length < 6) {
                    Alert.alert("Password Too Short", "Password must be at least 6 characters.")
                    setLoading(false)
                    return
                }

                // Import auth functions
                const { auth } = await import("@/lib/firebase-config")
                if (!auth) {
                    throw new Error("Authentication service unavailable")
                }

                // Create the account
                const userCredential = await auth.createUserWithEmailAndPassword(email, password)
                userId = userCredential.user.uid

                // Update display name
                await userCredential.user.updateProfile({
                    displayName: facilityName + " Team",
                })
            }

            if (!userId) throw new Error("Failed to get user ID")

            // Import db to check availability
            const { db } = await import("@/lib/firebase-config")
            if (!db) {
                throw new Error("Database connection unavailable. Please check your internet connection and try again.")
            }

            const facilityId = await facilityService.claimFacility({
                venueId: `new-${Date.now()}`,
                ownerId: userId,
                businessName: facilityName,
                businessPhone: phone,
                businessEmail: email,
                address,
                city,
                state,
                zipCode,
                sports: selectedSports,
                operatingHours: DEFAULT_OPERATING_HOURS,
            })

            if (!facilityId) throw new Error("Failed to save facility. Please try again.")

            // Auto-generate courts
            const unitLabel = facilityType === "wellness" ? "Studio" : "Court"
            for (let i = 1; i <= courtCount; i++) {
                await facilityService.addCourt(facilityId, {
                    name: `${unitLabel} ${i}`,
                    type: "Indoor",
                    hourlyRate: hourlyRate * 100,
                })
            }

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            setStep("confirm")

            // Set user type to facility so they see facility dashboard
            setPreferences({
                userType: "facility",
                name: facilityName,
                onboardingComplete: true,
            })

            Alert.alert(
                "You're Live! 🎉",
                `${facilityName} is now discoverable. Set up Stripe to start receiving payments.`,
                [
                    { text: "Set Up Payments", onPress: () => router.replace(`/facility/stripe-onboarding?facilityId=${facilityId}`) },
                    { text: "Dashboard", onPress: () => router.replace("/(tabs)") },
                ]
            )
        } catch (error: any) {
            console.error("Onboarding error:", error)

            // Show specific error message
            let errorMessage = "Something went wrong. Please try again."
            if (error?.code === "auth/email-already-in-use") {
                errorMessage = "This email is already registered. Please sign in instead."
            } else if (error?.code === "auth/invalid-email") {
                errorMessage = "Please enter a valid email address."
            } else if (error?.code === "auth/weak-password") {
                errorMessage = "Password should be at least 6 characters."
            } else if (error?.message) {
                errorMessage = error.message
            }

            Alert.alert("Error", errorMessage)
        } finally {
            setLoading(false)
        }
    }

    // ============================================
    // STEP 0: INTEGRATION-FIRST
    // ============================================
    const renderIntegrationStep = () => (
        <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>
            <View style={styles.stepHeader}>
                <Ionicons name="link" size={48} color="#7ED957" />
                <Text style={styles.stepTitle}>Already use a booking system?</Text>
                <Text style={styles.stepSubtitle}>
                    Connect it and we'll sync your courts automatically.{"\n"}
                    Zero double-bookings. Zero extra work.
                </Text>
            </View>

            <View style={styles.integrationGrid}>
                {INTEGRATIONS.map(integration => (
                    <TouchableOpacity
                        key={integration.id}
                        style={[
                            styles.integrationCard,
                            selectedIntegration === integration.id && styles.integrationCardSelected,
                        ]}
                        onPress={() => handleSelectIntegration(integration.id)}
                        disabled={loading}
                    >
                        <Ionicons
                            name={integration.icon as any}
                            size={32}
                            color={selectedIntegration === integration.id ? "#000" : "#7ED957"}
                        />
                        <Text style={[
                            styles.integrationName,
                            selectedIntegration === integration.id && { color: "#000" }
                        ]}>
                            {integration.name}
                        </Text>
                        {loading && selectedIntegration === integration.id && (
                            <ActivityIndicator size="small" color="#000" style={{ marginTop: 8 }} />
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            {/* Social Proof */}
            <View style={styles.socialProofCard}>
                <Ionicons name="people" size={20} color="#7ED957" />
                <Text style={styles.socialProofText}>
                    {socialProof.facilitiesJoinedThisMonth} facilities joined this month.{" "}
                    Avg first-month revenue: ${socialProof.averageFirstMonthRevenue.toLocaleString()}
                </Text>
            </View>

            {/* Sign In for existing users */}
            {!user && (
                <TouchableOpacity
                    style={styles.existingUserCard}
                    onPress={() => router.push("/auth")}
                >
                    <View style={styles.existingUserContent}>
                        <View style={styles.existingUserIcon}>
                            <Ionicons name="person-circle" size={32} color="#7ED957" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.existingUserTitle}>Already listed on GoodRunss?</Text>
                            <Text style={styles.existingUserSubtitle}>Sign in to manage your facility</Text>
                        </View>
                        <Ionicons name="arrow-forward" size={20} color="#7ED957" />
                    </View>
                </TouchableOpacity>
            )}
        </Animated.View>
    )

    // ============================================
    // STEP 1: MARKET INTELLIGENCE
    // ============================================
    const renderMarketStep = () => {
        const demandInsights = marketData ? marketIntelligenceService.getDemandInsights(marketData) : null

        return (
            <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>
                {/* City Input */}
                {!city && (
                    <View style={styles.cityInputContainer}>
                        <Text style={styles.inputLabel}>Where is your facility?</Text>
                        <View style={styles.cityRow}>
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                value={city}
                                onChangeText={setCity}
                                placeholder="City"
                                placeholderTextColor="#666"
                            />
                            <TextInput
                                style={[styles.input, { width: 60 }]}
                                value={state}
                                onChangeText={setState}
                                placeholder="ST"
                                placeholderTextColor="#666"
                                maxLength={2}
                                autoCapitalize="characters"
                            />
                        </View>
                    </View>
                )}

                {loadingMarket && (
                    <View style={styles.loadingMarket}>
                        <ActivityIndicator size="large" color="#7ED957" />
                        <Text style={styles.loadingText}>Analyzing your market...</Text>
                    </View>
                )}

                {marketData && !loadingMarket && (
                    <>
                        {/* Market Intelligence Card */}
                        <View style={styles.marketCard}>
                            <View style={styles.marketHeader}>
                                <Ionicons name="analytics" size={24} color="#7ED957" />
                                <Text style={styles.marketTitle}>Your Local Market</Text>
                            </View>

                            <View style={styles.marketStats}>
                                <View style={styles.marketStat}>
                                    <Text style={styles.marketStatValue}>{marketData.nearbyVenueCount}</Text>
                                    <Text style={styles.marketStatLabel}>venues nearby</Text>
                                </View>
                                <View style={styles.marketStat}>
                                    <Text style={styles.marketStatValue}>{marketData.playerCountNearby.toLocaleString()}</Text>
                                    <Text style={styles.marketStatLabel}>active players</Text>
                                </View>
                                <View style={styles.marketStat}>
                                    <Text style={styles.marketStatValue}>${marketData.averageHourlyRate}</Text>
                                    <Text style={styles.marketStatLabel}>avg rate</Text>
                                </View>
                            </View>

                            {demandInsights && demandInsights.urgency !== "low" && (
                                <View style={[
                                    styles.demandBanner,
                                    demandInsights.urgency === "high" && styles.demandBannerHigh
                                ]}>
                                    <Text style={styles.demandHeadline}>{demandInsights.headline}</Text>
                                    <Text style={styles.demandBody}>{demandInsights.body}</Text>
                                </View>
                            )}
                        </View>

                        {/* Revenue Calculator */}
                        <View style={styles.revenueCard}>
                            <Text style={styles.revenueTitle}>💰 Your Revenue Potential</Text>

                            <View style={styles.sliderRow}>
                                <Text style={styles.sliderLabel}>Courts</Text>
                                <View style={styles.stepperCompact}>
                                    <TouchableOpacity onPress={() => setCourtCount(Math.max(1, courtCount - 1))}>
                                        <Ionicons name="remove-circle" size={32} color="#7ED957" />
                                    </TouchableOpacity>
                                    <Text style={styles.stepperValue}>{courtCount}</Text>
                                    <TouchableOpacity onPress={() => setCourtCount(Math.min(20, courtCount + 1))}>
                                        <Ionicons name="add-circle" size={32} color="#7ED957" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.sliderRow}>
                                <Text style={styles.sliderLabel}>Rate: ${hourlyRate}/hr</Text>
                                <Slider
                                    style={{ flex: 1, height: 40 }}
                                    minimumValue={20}
                                    maximumValue={100}
                                    step={5}
                                    value={hourlyRate}
                                    onValueChange={setHourlyRate}
                                    minimumTrackTintColor="#7ED957"
                                    maximumTrackTintColor="#333"
                                    thumbTintColor="#7ED957"
                                />
                            </View>

                            <View style={styles.sliderRow}>
                                <Text style={styles.sliderLabel}>Utilization: {utilization}%</Text>
                                <Slider
                                    style={{ flex: 1, height: 40 }}
                                    minimumValue={30}
                                    maximumValue={100}
                                    step={5}
                                    value={utilization}
                                    onValueChange={setUtilization}
                                    minimumTrackTintColor="#7ED957"
                                    maximumTrackTintColor="#333"
                                    thumbTintColor="#7ED957"
                                />
                            </View>

                            {/* Booking Configuration */}
                            <View style={styles.bookingConfigSection}>
                                <Text style={styles.configSectionTitle}>
                                    <Ionicons name="time-outline" size={16} color="#7ED957" /> Booking Slots
                                </Text>
                                <View style={styles.slotDurationButtons}>
                                    {[30, 60, 90].map((duration) => (
                                        <TouchableOpacity
                                            key={duration}
                                            style={[
                                                styles.slotButton,
                                                slotDuration === duration && styles.slotButtonActive,
                                            ]}
                                            onPress={() => setSlotDuration(duration as 30 | 60 | 90)}
                                        >
                                            <Text style={[
                                                styles.slotButtonText,
                                                slotDuration === duration && styles.slotButtonTextActive,
                                            ]}>
                                                {duration === 60 ? "1 hour" : duration === 90 ? "1.5 hours" : "30 min"}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Peak Pricing Toggle */}
                                <TouchableOpacity
                                    style={styles.peakPricingToggle}
                                    onPress={() => setHasPeakPricing(!hasPeakPricing)}
                                >
                                    <View style={styles.peakPricingLeft}>
                                        <Ionicons name="trending-up" size={20} color={hasPeakPricing ? "#FFD700" : "#666"} />
                                        <View style={{ marginLeft: 12 }}>
                                            <Text style={styles.peakPricingTitle}>Peak Hour Pricing</Text>
                                            <Text style={styles.peakPricingSubtitle}>
                                                {hasPeakPricing
                                                    ? `+$${peakRateIncrease} from 5-8 PM weekdays`
                                                    : "Charge more during busy hours"
                                                }
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={[
                                        styles.toggleSwitch,
                                        hasPeakPricing && styles.toggleSwitchActive,
                                    ]}>
                                        <View style={[
                                            styles.toggleKnob,
                                            hasPeakPricing && styles.toggleKnobActive,
                                        ]} />
                                    </View>
                                </TouchableOpacity>

                                {hasPeakPricing && (
                                    <View style={styles.peakRateRow}>
                                        <Text style={styles.peakRateLabel}>Peak rate increase:</Text>
                                        <View style={styles.peakRateButtons}>
                                            {[5, 10, 15, 20].map((amount) => (
                                                <TouchableOpacity
                                                    key={amount}
                                                    style={[
                                                        styles.peakRateButton,
                                                        peakRateIncrease === amount && styles.peakRateButtonActive,
                                                    ]}
                                                    onPress={() => setPeakRateIncrease(amount)}
                                                >
                                                    <Text style={[
                                                        styles.peakRateButtonText,
                                                        peakRateIncrease === amount && styles.peakRateButtonTextActive,
                                                    ]}>+${amount}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                )}
                            </View>

                            {revenueEstimate && (
                                <View style={styles.revenueResults}>
                                    <View style={styles.revenueScenario}>
                                        <Text style={styles.scenarioLabel}>Conservative</Text>
                                        <Text style={styles.scenarioValue}>${revenueEstimate.conservative.toLocaleString()}</Text>
                                    </View>
                                    <View style={[styles.revenueScenario, styles.revenueScenarioMain]}>
                                        <Text style={styles.scenarioLabelMain}>Realistic</Text>
                                        <Text style={styles.scenarioValueMain}>${revenueEstimate.realistic.toLocaleString()}</Text>
                                        <Text style={styles.scenarioSubtext}>/month</Text>
                                    </View>
                                    <View style={styles.revenueScenario}>
                                        <Text style={styles.scenarioLabel}>Optimistic</Text>
                                        <Text style={styles.scenarioValue}>${revenueEstimate.optimistic.toLocaleString()}</Text>
                                    </View>
                                </View>
                            )}
                        </View>

                        {/* Competitors */}
                        {marketData.topCompetitors.length > 0 && (
                            <View style={styles.competitorCard}>
                                <Text style={styles.competitorTitle}>📍 Nearby Competition</Text>
                                {marketData.topCompetitors.map((comp, i) => (
                                    <View key={i} style={styles.competitorRow}>
                                        <Text style={styles.competitorName}>{comp.name}</Text>
                                        <Text style={styles.competitorRate}>${comp.hourlyRate}/hr</Text>
                                        <View style={[
                                            styles.utilizationBadge,
                                            comp.utilization > 85 && styles.utilizationBadgeHigh
                                        ]}>
                                            <Text style={styles.utilizationText}>{comp.utilization}%</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Continue Button */}
                        <TouchableOpacity style={styles.continueBtn} onPress={handleContinueToForm}>
                            <LinearGradient colors={["#7ED957", "#4C9E29"]} style={styles.continueBtnGradient}>
                                <Text style={styles.continueBtnText}>Continue</Text>
                                <Ionicons name="arrow-forward" size={20} color="#000" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </>
                )}

                {/* Skip for now */}
                {!marketData && !loadingMarket && city && (
                    <TouchableOpacity onPress={handleContinueToForm} style={styles.skipBtn}>
                        <Text style={styles.skipBtnText}>Skip and enter details manually</Text>
                    </TouchableOpacity>
                )}
            </Animated.View>
        )
    }

    // ============================================
    // STEP 2: QUICK FORM
    // ============================================
    const renderFormStep = () => (
        <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>
            <Text style={styles.formTitle}>Almost there! ⚡</Text>
            <Text style={styles.formSubtitle}>
                {integrationConnected ? "We've pre-filled what we can. Confirm the details:" : "Just a few quick details:"}
            </Text>

            <TextInput
                style={styles.input}
                value={facilityName}
                onChangeText={setFacilityName}
                placeholder="Facility Name"
                placeholderTextColor="#666"
            />

            <View style={styles.row}>
                <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Phone"
                    placeholderTextColor="#666"
                    keyboardType="phone-pad"
                />
                <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email"
                    placeholderTextColor="#666"
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>

            {/* Account Section for non-logged-in users */}
            {!user && (
                <View style={styles.accountSection}>
                    <Text style={styles.accountLabel}>Your Account</Text>
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Password (6+ characters)"
                        placeholderTextColor="#666"
                        secureTextEntry
                    />
                    <TouchableOpacity
                        onPress={() => router.push("/auth")}
                        style={styles.signinLink}
                    >
                        <Text style={styles.signinLinkText}>
                            Already have an account? <Text style={{ color: "#7ED957" }}>Sign in here</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                placeholder="Street Address"
                placeholderTextColor="#666"
            />

            <View style={styles.row}>
                <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={city}
                    onChangeText={setCity}
                    placeholder="City"
                    placeholderTextColor="#666"
                />
                <TextInput
                    style={[styles.input, { width: 60 }]}
                    value={state}
                    onChangeText={setState}
                    placeholder="ST"
                    placeholderTextColor="#666"
                    maxLength={2}
                />
                <TextInput
                    style={[styles.input, { width: 100 }]}
                    value={zipCode}
                    onChangeText={setZipCode}
                    placeholder="ZIP"
                    placeholderTextColor="#666"
                    keyboardType="number-pad"
                    maxLength={5}
                />
            </View>

            {/* Summary Card */}
            <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>📋 Setup Summary</Text>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Courts:</Text>
                    <Text style={styles.summaryValue}>{courtCount}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Rate:</Text>
                    <Text style={styles.summaryValue}>${hourlyRate}/hr</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Est. Revenue:</Text>
                    <Text style={[styles.summaryValue, { color: "#7ED957" }]}>
                        ${revenueEstimate?.realistic.toLocaleString()}/mo
                    </Text>
                </View>
            </View>

            {/* Free Listing Info */}
            <View style={styles.freeInfo}>
                <Ionicons name="gift" size={20} color="#7ED957" />
                <Text style={styles.freeInfoText}>
                    Free to list! We only charge 8% on bookings made through GoodRunss.
                </Text>
            </View>

            {/* Launch Button */}
            <TouchableOpacity
                style={[styles.launchBtn, (!facilityName || !phone || (!user && (!email || password.length < 6))) && styles.launchBtnDisabled]}
                disabled={!facilityName || !phone || (!user && (!email || password.length < 6)) || loading}
                onPress={handleLaunch}
            >
                <LinearGradient
                    colors={(facilityName && phone && (user || (email && password.length >= 6))) ? ["#7ED957", "#4C9E29"] : ["#333", "#222"]}
                    style={styles.launchBtnGradient}
                >
                    {loading ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <>
                            <Ionicons name="rocket" size={20} color="#000" />
                            <Text style={styles.launchBtnText}>
                                {user ? "Launch Facility" : "Create Account & Launch"}
                            </Text>
                        </>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    )

    // ============================================
    // RENDER
    // ============================================
    return (
        <View style={styles.container}>
            <LinearGradient colors={["#0A0A0A", "#111"]} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => {
                            if (step === "form") setStep("market")
                            else if (step === "market") setStep("integration")
                            else router.back()
                        }}
                        style={styles.backBtn}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>List Your Facility</Text>
                        <Text style={styles.headerSubtitle}>
                            {step === "integration" ? "Step 1 of 3" :
                                step === "market" ? "Step 2 of 3" : "Step 3 of 3"}
                        </Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { width: step === "integration" ? "33%" : step === "market" ? "66%" : "100%" }]} />
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                        {step === "integration" && renderIntegrationStep()}
                        {step === "market" && renderMarketStep()}
                        {step === "form" && renderFormStep()}
                    </ScrollView>
                </KeyboardAvoidingView>
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
        paddingVertical: 12,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#1A1A1A",
        alignItems: "center",
        justifyContent: "center",
    },
    headerCenter: { alignItems: "center" },
    headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
    headerSubtitle: { color: "#888", fontSize: 12, marginTop: 2 },

    progressContainer: {
        height: 4,
        backgroundColor: "#222",
        marginHorizontal: 20,
        borderRadius: 2,
        overflow: "hidden",
    },
    progressBar: {
        height: "100%",
        backgroundColor: "#7ED957",
        borderRadius: 2,
    },

    content: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 20 },

    stepContainer: { flex: 1 },
    stepHeader: { alignItems: "center", marginBottom: 32 },
    stepTitle: { color: "#FFF", fontSize: 24, fontWeight: "bold", marginTop: 16, textAlign: "center" },
    stepSubtitle: { color: "#888", fontSize: 16, marginTop: 8, textAlign: "center", lineHeight: 24 },

    // Integration cards
    integrationGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
    integrationCard: {
        width: "47%",
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 24,
        alignItems: "center",
        borderWidth: 2,
        borderColor: "transparent",
    },
    integrationCardSelected: { backgroundColor: "#7ED957", borderColor: "#7ED957" },
    integrationName: { color: "#FFF", fontSize: 14, fontWeight: "600", marginTop: 12 },

    socialProofCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(126, 217, 87, 0.08)",
        borderRadius: 12,
        padding: 16,
    },
    socialProofText: { color: "#888", fontSize: 14, marginLeft: 12, flex: 1 },

    // City input
    cityInputContainer: { marginBottom: 24 },
    inputLabel: { color: "#FFF", fontSize: 16, fontWeight: "600", marginBottom: 12 },
    cityRow: { flexDirection: "row", gap: 12 },

    input: {
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        color: "#FFF",
        fontSize: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#333",
    },
    row: { flexDirection: "row", gap: 12 },

    loadingMarket: { alignItems: "center", paddingVertical: 40 },
    loadingText: { color: "#888", fontSize: 14, marginTop: 16 },

    // Market card
    marketCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    marketHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
    marketTitle: { color: "#FFF", fontSize: 18, fontWeight: "600", marginLeft: 12 },
    marketStats: { flexDirection: "row", justifyContent: "space-between" },
    marketStat: { alignItems: "center" },
    marketStatValue: { color: "#7ED957", fontSize: 24, fontWeight: "bold" },
    marketStatLabel: { color: "#888", fontSize: 12, marginTop: 4 },

    demandBanner: {
        backgroundColor: "rgba(126, 217, 87, 0.1)",
        borderRadius: 12,
        padding: 14,
        marginTop: 16,
    },
    demandBannerHigh: { backgroundColor: "rgba(249, 115, 22, 0.15)" },
    demandHeadline: { color: "#F97316", fontSize: 14, fontWeight: "bold", marginBottom: 4 },
    demandBody: { color: "#888", fontSize: 13 },

    // Revenue card
    revenueCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    revenueTitle: { color: "#FFF", fontSize: 18, fontWeight: "600", marginBottom: 16 },
    sliderRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    sliderLabel: { color: "#888", fontSize: 14, width: 100 },
    stepperCompact: { flexDirection: "row", alignItems: "center" },
    stepperValue: { color: "#FFF", fontSize: 24, fontWeight: "bold", marginHorizontal: 16 },

    revenueResults: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
    revenueScenario: { alignItems: "center" },
    revenueScenarioMain: {
        backgroundColor: "rgba(126, 217, 87, 0.1)",
        borderRadius: 12,
        padding: 16,
    },
    scenarioLabel: { color: "#888", fontSize: 12 },
    scenarioValue: { color: "#888", fontSize: 18, fontWeight: "600", marginTop: 4 },
    scenarioLabelMain: { color: "#7ED957", fontSize: 12 },
    scenarioValueMain: { color: "#7ED957", fontSize: 32, fontWeight: "bold" },
    scenarioSubtext: { color: "#888", fontSize: 12 },

    // Competitors
    competitorCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    competitorTitle: { color: "#FFF", fontSize: 16, fontWeight: "600", marginBottom: 12 },
    competitorRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#222",
    },
    competitorName: { flex: 1, color: "#FFF", fontSize: 14 },
    competitorRate: { color: "#888", fontSize: 14, marginRight: 12 },
    utilizationBadge: {
        backgroundColor: "#333",
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    utilizationBadgeHigh: { backgroundColor: "rgba(249, 115, 22, 0.2)" },
    utilizationText: { color: "#F97316", fontSize: 12, fontWeight: "600" },

    continueBtn: { borderRadius: 16, overflow: "hidden", marginTop: 8 },
    continueBtnGradient: {
        flexDirection: "row",
        paddingVertical: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    continueBtnText: { color: "#000", fontSize: 18, fontWeight: "800", marginRight: 8 },

    skipBtn: { alignItems: "center", paddingVertical: 16 },
    skipBtnText: { color: "#888", fontSize: 14 },

    // Form step
    formTitle: { color: "#FFF", fontSize: 24, fontWeight: "bold", marginBottom: 8 },
    formSubtitle: { color: "#888", fontSize: 16, marginBottom: 24 },

    summaryCard: {
        backgroundColor: "rgba(126, 217, 87, 0.08)",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    summaryTitle: { color: "#FFF", fontSize: 16, fontWeight: "600", marginBottom: 12 },
    summaryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 },
    summaryLabel: { color: "#888", fontSize: 14 },
    summaryValue: { color: "#FFF", fontSize: 14, fontWeight: "600" },

    freeInfo: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    freeInfoText: { color: "#888", fontSize: 14, marginLeft: 12, flex: 1 },

    launchBtn: { borderRadius: 16, overflow: "hidden" },
    launchBtnDisabled: { opacity: 0.5 },
    launchBtnGradient: {
        flexDirection: "row",
        paddingVertical: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    launchBtnText: { color: "#000", fontSize: 18, fontWeight: "800", marginLeft: 10 },

    // Account section styles
    accountSection: {
        backgroundColor: "rgba(126, 217, 87, 0.05)",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "rgba(126, 217, 87, 0.2)",
    },
    accountLabel: {
        color: "#7ED957",
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 12,
    },
    signinLink: {
        paddingTop: 8,
    },
    signinLinkText: {
        color: "#888",
        fontSize: 14,
        textAlign: "center",
    },

    // Existing user sign-in card on first step
    existingUserCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        marginTop: 16,
        borderWidth: 1,
        borderColor: "#333",
    },
    existingUserContent: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
    },
    existingUserIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "rgba(126, 217, 87, 0.1)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 14,
    },
    existingUserTitle: {
        color: "#FFF",
        fontSize: 15,
        fontWeight: "600",
    },
    existingUserSubtitle: {
        color: "#888",
        fontSize: 13,
        marginTop: 2,
    },

    // Booking configuration styles
    bookingConfigSection: {
        marginTop: 24,
        padding: 16,
        backgroundColor: "#0F0F0F",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#1A1A1A",
    },
    configSectionTitle: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 16,
    },
    slotDurationButtons: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 20,
    },
    slotButton: {
        flex: 1,
        backgroundColor: "#1A1A1A",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#333",
    },
    slotButtonActive: {
        backgroundColor: "#7ED957",
        borderColor: "#7ED957",
    },
    slotButtonText: {
        color: "#888",
        fontSize: 14,
        fontWeight: "600",
    },
    slotButtonTextActive: {
        color: "#000",
    },
    peakPricingToggle: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#1A1A1A",
        padding: 16,
        borderRadius: 12,
    },
    peakPricingLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    peakPricingTitle: {
        color: "#FFF",
        fontSize: 15,
        fontWeight: "600",
    },
    peakPricingSubtitle: {
        color: "#888",
        fontSize: 12,
        marginTop: 2,
    },
    toggleSwitch: {
        width: 50,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#333",
        padding: 2,
    },
    toggleSwitchActive: {
        backgroundColor: "#7ED957",
    },
    toggleKnob: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#FFF",
    },
    toggleKnobActive: {
        transform: [{ translateX: 22 }],
    },
    peakRateRow: {
        marginTop: 16,
    },
    peakRateLabel: {
        color: "#888",
        fontSize: 13,
        marginBottom: 10,
    },
    peakRateButtons: {
        flexDirection: "row",
        gap: 10,
    },
    peakRateButton: {
        flex: 1,
        backgroundColor: "#1A1A1A",
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#333",
    },
    peakRateButtonActive: {
        backgroundColor: "#FFD700",
        borderColor: "#FFD700",
    },
    peakRateButtonText: {
        color: "#888",
        fontSize: 14,
        fontWeight: "600",
    },
    peakRateButtonTextActive: {
        color: "#000",
    },
})
