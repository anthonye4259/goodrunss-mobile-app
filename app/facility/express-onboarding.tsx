/**
 * Express Facility Onboarding
 * Simple single-page setup - get started in under 60 seconds
 */

import React, { useState } from "react"
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
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"

import { useAuth } from "@/lib/auth-context"
import { facilityService } from "@/lib/services/facility-service"

// US Zip code to city/state mapping (simplified - in production use API)
const ZIP_LOOKUP: { [key: string]: { city: string; state: string } } = {
    "30301": { city: "Atlanta", state: "GA" },
    "30302": { city: "Atlanta", state: "GA" },
    "30303": { city: "Atlanta", state: "GA" },
    "30305": { city: "Atlanta", state: "GA" },
    "30306": { city: "Atlanta", state: "GA" },
    "30307": { city: "Atlanta", state: "GA" },
    "30308": { city: "Atlanta", state: "GA" },
    "30309": { city: "Atlanta", state: "GA" },
    "30310": { city: "Atlanta", state: "GA" },
    "30311": { city: "Atlanta", state: "GA" },
    "30312": { city: "Atlanta", state: "GA" },
    "30313": { city: "Atlanta", state: "GA" },
    "30314": { city: "Atlanta", state: "GA" },
    "30315": { city: "Atlanta", state: "GA" },
    "30316": { city: "Atlanta", state: "GA" },
    "30318": { city: "Atlanta", state: "GA" },
    "30319": { city: "Atlanta", state: "GA" },
    "30322": { city: "Atlanta", state: "GA" },
    "30324": { city: "Atlanta", state: "GA" },
    "30326": { city: "Atlanta", state: "GA" },
    "30327": { city: "Atlanta", state: "GA" },
    "30328": { city: "Atlanta", state: "GA" },
    "30329": { city: "Atlanta", state: "GA" },
    "30030": { city: "Decatur", state: "GA" },
    "30033": { city: "Decatur", state: "GA" },
    "30339": { city: "Marietta", state: "GA" },
    "30340": { city: "Doraville", state: "GA" },
    "30341": { city: "Chamblee", state: "GA" },
    "30342": { city: "Atlanta", state: "GA" },
}

const DEFAULT_OPERATING_HOURS = {
    monday: { open: "06:00", close: "22:00", closed: false },
    tuesday: { open: "06:00", close: "22:00", closed: false },
    wednesday: { open: "06:00", close: "22:00", closed: false },
    thursday: { open: "06:00", close: "22:00", closed: false },
    friday: { open: "06:00", close: "22:00", closed: false },
    saturday: { open: "07:00", close: "20:00", closed: false },
    sunday: { open: "08:00", close: "18:00", closed: false },
}

export default function ExpressOnboardingScreen() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)

    // Form state
    const [facilityName, setFacilityName] = useState("")
    const [phone, setPhone] = useState("")
    const [email, setEmail] = useState(user?.email || "")
    const [address, setAddress] = useState("")
    const [zipCode, setZipCode] = useState("")
    const [city, setCity] = useState("")
    const [state, setState] = useState("")

    // Type
    const [facilityType, setFacilityType] = useState<"racquet" | "wellness" | "">("racquet")
    const [selectedSports, setSelectedSports] = useState<string[]>(["Tennis"])

    // Courts
    const [courtCount, setCourtCount] = useState(2)
    const [hourlyRate, setHourlyRate] = useState("40")

    // Hours
    const [useStandardHours, setUseStandardHours] = useState(true)

    // Auto-detect city/state from zip
    const handleZipChange = (zip: string) => {
        setZipCode(zip)
        if (zip.length === 5) {
            const location = ZIP_LOOKUP[zip]
            if (location) {
                setCity(location.city)
                setState(location.state)
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            }
        }
    }

    // Toggle sport selection
    const toggleSport = (sport: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        if (selectedSports.includes(sport)) {
            setSelectedSports(selectedSports.filter(s => s !== sport))
        } else {
            setSelectedSports([...selectedSports, sport])
        }
    }

    // Adjust court count
    const adjustCourts = (delta: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        setCourtCount(Math.max(1, Math.min(20, courtCount + delta)))
    }

    // Validate form
    const isValid = () => {
        return (
            facilityName.trim() &&
            phone.trim() &&
            address.trim() &&
            city.trim() &&
            state.trim() &&
            selectedSports.length > 0 &&
            hourlyRate.trim()
        )
    }

    // Submit
    const handleLaunch = async () => {
        if (!user || !isValid()) return

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
        setLoading(true)

        try {
            // Create facility
            const facilityId = await facilityService.claimFacility({
                venueId: `new-${Date.now()}`,
                ownerId: user.uid,
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

            if (!facilityId) {
                throw new Error("Failed to create facility")
            }

            // Auto-generate courts
            const unitLabel = facilityType === "wellness" ? "Studio" : "Court"
            const rateInCents = parseInt(hourlyRate) * 100

            for (let i = 1; i <= courtCount; i++) {
                await facilityService.addCourt(facilityId, {
                    name: `${unitLabel} ${i}`,
                    type: "Indoor",
                    hourlyRate: rateInCents,
                })
            }

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

            Alert.alert(
                "You're Live! 🎉",
                `${facilityName} is now discoverable by thousands of players. Set up Stripe to receive payments.`,
                [
                    {
                        text: "Set Up Payments",
                        onPress: () => router.replace(`/facility/stripe-onboarding?facilityId=${facilityId}`),
                    },
                    {
                        text: "Go to Dashboard",
                        onPress: () => router.replace("/facility/dashboard"),
                    },
                ]
            )
        } catch (error) {
            console.error("Express onboarding error:", error)
            Alert.alert("Error", "Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const racquetSports = ["Tennis", "Pickleball", "Padel", "Racquetball"]
    const wellnessSports = ["Yoga", "Pilates", "Lagree", "Barre"]
    const sports = facilityType === "wellness" ? wellnessSports : racquetSports

    return (
        <View style={styles.container}>
            <LinearGradient colors={["#0A0A0A", "#111"]} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Express Setup</Text>
                        <Text style={styles.headerSubtitle}>Go live in 60 seconds ⚡</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                        {/* SECTION 1: Business Basics */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionNumber}><Text style={styles.sectionNumberText}>1</Text></View>
                                <Text style={styles.sectionTitle}>Business Basics</Text>
                            </View>

                            <TextInput
                                style={styles.input}
                                value={facilityName}
                                onChangeText={setFacilityName}
                                placeholder="Facility Name"
                                placeholderTextColor="#666"
                            />

                            <View style={styles.row}>
                                <TextInput
                                    style={[styles.input, styles.flex1]}
                                    value={phone}
                                    onChangeText={setPhone}
                                    placeholder="Phone"
                                    placeholderTextColor="#666"
                                    keyboardType="phone-pad"
                                />
                                <TextInput
                                    style={[styles.input, styles.flex1]}
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="Email"
                                    placeholderTextColor="#666"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        {/* SECTION 2: Location */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionNumber}><Text style={styles.sectionNumberText}>2</Text></View>
                                <Text style={styles.sectionTitle}>Location</Text>
                            </View>

                            <TextInput
                                style={styles.input}
                                value={address}
                                onChangeText={setAddress}
                                placeholder="Street Address"
                                placeholderTextColor="#666"
                            />

                            <View style={styles.row}>
                                <TextInput
                                    style={[styles.input, { width: 100 }]}
                                    value={zipCode}
                                    onChangeText={handleZipChange}
                                    placeholder="ZIP"
                                    placeholderTextColor="#666"
                                    keyboardType="number-pad"
                                    maxLength={5}
                                />
                                <TextInput
                                    style={[styles.input, styles.flex1]}
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
                                    autoCapitalize="characters"
                                    maxLength={2}
                                />
                            </View>
                            {city && state && (
                                <View style={styles.autoDetected}>
                                    <Ionicons name="checkmark-circle" size={14} color="#7ED957" />
                                    <Text style={styles.autoDetectedText}>Auto-detected from ZIP</Text>
                                </View>
                            )}
                        </View>

                        {/* SECTION 3: Facility Type */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionNumber}><Text style={styles.sectionNumberText}>3</Text></View>
                                <Text style={styles.sectionTitle}>What do you offer?</Text>
                            </View>

                            <View style={styles.typeRow}>
                                <TouchableOpacity
                                    style={[styles.typeCard, facilityType === "racquet" && styles.typeCardSelected]}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                        setFacilityType("racquet")
                                        setSelectedSports(["Tennis"])
                                    }}
                                >
                                    <Ionicons name="tennisball" size={28} color={facilityType === "racquet" ? "#000" : "#7ED957"} />
                                    <Text style={[styles.typeCardText, facilityType === "racquet" && { color: "#000" }]}>Courts</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.typeCard, facilityType === "wellness" && styles.typeCardSelected]}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                        setFacilityType("wellness")
                                        setSelectedSports(["Yoga"])
                                    }}
                                >
                                    <Ionicons name="fitness" size={28} color={facilityType === "wellness" ? "#000" : "#7ED957"} />
                                    <Text style={[styles.typeCardText, facilityType === "wellness" && { color: "#000" }]}>Studios</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.sportsGrid}>
                                {sports.map(sport => (
                                    <TouchableOpacity
                                        key={sport}
                                        style={[styles.sportChip, selectedSports.includes(sport) && styles.sportChipSelected]}
                                        onPress={() => toggleSport(sport)}
                                    >
                                        <Text style={[styles.sportChipText, selectedSports.includes(sport) && styles.sportChipTextSelected]}>
                                            {sport}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* SECTION 4: Capacity & Pricing */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionNumber}><Text style={styles.sectionNumberText}>4</Text></View>
                                <Text style={styles.sectionTitle}>{facilityType === "wellness" ? "Studios" : "Courts"} & Pricing</Text>
                            </View>

                            <View style={styles.courtRow}>
                                <Text style={styles.courtLabel}>How many {facilityType === "wellness" ? "studios" : "courts"}?</Text>
                                <View style={styles.stepper}>
                                    <TouchableOpacity style={styles.stepperBtn} onPress={() => adjustCourts(-1)}>
                                        <Ionicons name="remove" size={24} color="#FFF" />
                                    </TouchableOpacity>
                                    <Text style={styles.stepperValue}>{courtCount}</Text>
                                    <TouchableOpacity style={styles.stepperBtn} onPress={() => adjustCourts(1)}>
                                        <Ionicons name="add" size={24} color="#FFF" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.rateRow}>
                                <Text style={styles.courtLabel}>Hourly rate</Text>
                                <View style={styles.rateInput}>
                                    <Text style={styles.dollarSign}>$</Text>
                                    <TextInput
                                        style={styles.rateTextInput}
                                        value={hourlyRate}
                                        onChangeText={setHourlyRate}
                                        keyboardType="number-pad"
                                        placeholder="40"
                                        placeholderTextColor="#666"
                                    />
                                    <Text style={styles.rateUnit}>/hr</Text>
                                </View>
                            </View>

                            <View style={styles.previewCard}>
                                <Ionicons name="information-circle-outline" size={18} color="#888" />
                                <Text style={styles.previewText}>
                                    We'll create {courtCount} {facilityType === "wellness" ? "studios" : "courts"} at ${hourlyRate}/hr each
                                </Text>
                            </View>
                        </View>

                        {/* SECTION 5: Hours */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionNumber}><Text style={styles.sectionNumberText}>5</Text></View>
                                <Text style={styles.sectionTitle}>Operating Hours</Text>
                            </View>

                            <TouchableOpacity
                                style={[styles.hoursOption, useStandardHours && styles.hoursOptionSelected]}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                    setUseStandardHours(true)
                                }}
                            >
                                <Ionicons
                                    name={useStandardHours ? "checkmark-circle" : "ellipse-outline"}
                                    size={24}
                                    color={useStandardHours ? "#7ED957" : "#666"}
                                />
                                <View style={styles.hoursOptionText}>
                                    <Text style={styles.hoursOptionTitle}>Standard Hours</Text>
                                    <Text style={styles.hoursOptionDesc}>Mon-Fri: 6am-10pm, Sat: 7am-8pm, Sun: 8am-6pm</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.hoursOption, !useStandardHours && styles.hoursOptionSelected]}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                    setUseStandardHours(false)
                                }}
                            >
                                <Ionicons
                                    name={!useStandardHours ? "checkmark-circle" : "ellipse-outline"}
                                    size={24}
                                    color={!useStandardHours ? "#7ED957" : "#666"}
                                />
                                <View style={styles.hoursOptionText}>
                                    <Text style={styles.hoursOptionTitle}>Custom Hours</Text>
                                    <Text style={styles.hoursOptionDesc}>Configure in settings after setup</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Revenue Preview */}
                        <View style={styles.revenueCard}>
                            <Ionicons name="trending-up" size={24} color="#7ED957" />
                            <View style={styles.revenueContent}>
                                <Text style={styles.revenueTitle}>Potential Monthly Revenue</Text>
                                <Text style={styles.revenueAmount}>
                                    ${((parseInt(hourlyRate) || 40) * 8 * 20 * courtCount).toLocaleString()}+
                                </Text>
                                <Text style={styles.revenueSubtext}>Based on 8 bookings/day per {facilityType === "wellness" ? "studio" : "court"}</Text>
                            </View>
                        </View>

                        {/* Free to list info */}
                        <View style={styles.freeInfo}>
                            <Ionicons name="gift-outline" size={20} color="#7ED957" />
                            <Text style={styles.freeInfoText}>
                                Free to list! We only charge 8% on bookings made through GoodRunss.
                            </Text>
                        </View>

                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Launch Button */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.launchBtn, !isValid() && styles.launchBtnDisabled]}
                        disabled={!isValid() || loading}
                        onPress={handleLaunch}
                    >
                        <LinearGradient
                            colors={isValid() ? ["#7ED957", "#4C9E29"] : ["#333", "#222"]}
                            style={styles.launchBtnGradient}
                        >
                            {loading ? (
                                <ActivityIndicator color="#000" />
                            ) : (
                                <>
                                    <Ionicons name="rocket" size={20} color="#000" />
                                    <Text style={styles.launchBtnText}>Launch Facility</Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
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
    headerSubtitle: { color: "#7ED957", fontSize: 12, marginTop: 2 },

    content: { paddingHorizontal: 20, paddingBottom: 120 },

    section: { marginBottom: 28 },
    sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
    sectionNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#7ED957",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    sectionNumberText: { color: "#000", fontSize: 14, fontWeight: "bold" },
    sectionTitle: { color: "#FFF", fontSize: 18, fontWeight: "600" },

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
    flex1: { flex: 1 },

    autoDetected: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    autoDetectedText: { color: "#7ED957", fontSize: 12, marginLeft: 6 },

    typeRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
    typeCard: {
        flex: 1,
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 20,
        alignItems: "center",
        borderWidth: 2,
        borderColor: "transparent",
    },
    typeCardSelected: { backgroundColor: "#7ED957", borderColor: "#7ED957" },
    typeCardText: { color: "#FFF", fontSize: 16, fontWeight: "600", marginTop: 8 },

    sportsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    sportChip: {
        paddingVertical: 10,
        paddingHorizontal: 18,
        backgroundColor: "#1A1A1A",
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#333",
    },
    sportChipSelected: { backgroundColor: "#7ED957", borderColor: "#7ED957" },
    sportChipText: { color: "#888", fontSize: 14 },
    sportChipTextSelected: { color: "#000", fontWeight: "600" },

    courtRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    courtLabel: { color: "#FFF", fontSize: 16 },
    stepper: { flexDirection: "row", alignItems: "center" },
    stepperBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#1A1A1A",
        alignItems: "center",
        justifyContent: "center",
    },
    stepperValue: {
        color: "#FFF",
        fontSize: 24,
        fontWeight: "bold",
        marginHorizontal: 20,
        minWidth: 30,
        textAlign: "center",
    },

    rateRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    rateInput: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    dollarSign: { color: "#7ED957", fontSize: 20, fontWeight: "bold" },
    rateTextInput: {
        color: "#FFF",
        fontSize: 24,
        fontWeight: "bold",
        width: 60,
        textAlign: "center",
    },
    rateUnit: { color: "#888", fontSize: 14 },

    previewCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(126, 217, 87, 0.08)",
        borderRadius: 12,
        padding: 14,
    },
    previewText: { color: "#888", fontSize: 14, marginLeft: 10, flex: 1 },

    hoursOption: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: "transparent",
    },
    hoursOptionSelected: { borderColor: "#7ED957" },
    hoursOptionText: { marginLeft: 14, flex: 1 },
    hoursOptionTitle: { color: "#FFF", fontSize: 16, fontWeight: "600" },
    hoursOptionDesc: { color: "#888", fontSize: 12, marginTop: 4 },

    revenueCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(126, 217, 87, 0.1)",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    revenueContent: { marginLeft: 16 },
    revenueTitle: { color: "#888", fontSize: 12 },
    revenueAmount: { color: "#7ED957", fontSize: 32, fontWeight: "bold", marginVertical: 4 },
    revenueSubtext: { color: "#888", fontSize: 12 },

    freeInfo: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
    },
    freeInfoText: { color: "#888", fontSize: 14, marginLeft: 12, flex: 1 },

    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: 40,
        backgroundColor: "#0A0A0A",
        borderTopWidth: 1,
        borderTopColor: "#222",
    },
    launchBtn: { borderRadius: 16, overflow: "hidden" },
    launchBtnDisabled: { opacity: 0.5 },
    launchBtnGradient: {
        flexDirection: "row",
        paddingVertical: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    launchBtnText: { color: "#000", fontSize: 18, fontWeight: "800", marginLeft: 10 },
})
