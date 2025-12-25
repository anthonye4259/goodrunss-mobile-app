/**
 * Facility Onboarding Wizard
 * Get discovered by thousands of players looking to book courts
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
import { getBookableCategory } from "@/lib/launch-cities"

// Steps
type Step = 1 | 2 | 3 | 4 | 5

interface FacilityData {
    // Step 1: Business Info
    businessName: string
    address: string
    city: string
    state: string
    zipCode: string
    phone: string
    email: string

    // Step 2: Sport Type
    sportType: "racquet" | "wellness" | ""
    sports: string[]

    // Step 3: Courts/Studios
    courts: Array<{
        name: string
        type: string
        hourlyRate: string
    }>

    // Step 4: Operating Hours
    operatingHours: {
        [key: string]: { open: string; close: string; closed: boolean }
    }
}

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
const DAY_LABELS: { [key: string]: string } = {
    monday: "Mon",
    tuesday: "Tue",
    wednesday: "Wed",
    thursday: "Thu",
    friday: "Fri",
    saturday: "Sat",
    sunday: "Sun",
}

const DEFAULT_HOURS = {
    monday: { open: "06:00", close: "22:00", closed: false },
    tuesday: { open: "06:00", close: "22:00", closed: false },
    wednesday: { open: "06:00", close: "22:00", closed: false },
    thursday: { open: "06:00", close: "22:00", closed: false },
    friday: { open: "06:00", close: "22:00", closed: false },
    saturday: { open: "07:00", close: "20:00", closed: false },
    sunday: { open: "08:00", close: "18:00", closed: false },
}

export default function FacilityOnboardingScreen() {
    const { user } = useAuth()
    const [step, setStep] = useState<Step>(1)
    const [loading, setLoading] = useState(false)

    const [data, setData] = useState<FacilityData>({
        businessName: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        phone: "",
        email: user?.email || "",
        sportType: "",
        sports: [],
        courts: [{ name: "Court 1", type: "Outdoor", hourlyRate: "40" }],
        operatingHours: DEFAULT_HOURS,
    })

    const updateData = (updates: Partial<FacilityData>) => {
        setData(prev => ({ ...prev, ...updates }))
    }

    const nextStep = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        if (step < 5) setStep((step + 1) as Step)
    }

    const prevStep = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        if (step > 1) setStep((step - 1) as Step)
    }

    const addCourt = () => {
        const courtNum = data.courts.length + 1
        const label = data.sportType === "wellness" ? "Studio" : "Court"
        updateData({
            courts: [...data.courts, { name: `${label} ${courtNum}`, type: "Indoor", hourlyRate: "40" }]
        })
    }

    const removeCourt = (index: number) => {
        if (data.courts.length > 1) {
            updateData({
                courts: data.courts.filter((_, i) => i !== index)
            })
        }
    }

    const handleComplete = async () => {
        if (!user) return

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
        setLoading(true)

        try {
            // Create the facility
            const facilityId = await facilityService.claimFacility({
                venueId: `new-${Date.now()}`, // Will create new venue
                ownerId: user.uid,
                businessName: data.businessName,
                businessPhone: data.phone,
                businessEmail: data.email,
                address: data.address,
                city: data.city,
                state: data.state,
                zipCode: data.zipCode,
                sports: data.sports,
                operatingHours: data.operatingHours,
            })

            if (facilityId) {
                // Add courts
                for (const court of data.courts) {
                    await facilityService.addCourt(facilityId, {
                        name: court.name,
                        type: court.type,
                        hourlyRate: parseInt(court.hourlyRate) * 100,
                    })
                }

                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

                // Go to Stripe setup
                router.replace(`/facility/stripe-onboarding?facilityId=${facilityId}`)
            } else {
                Alert.alert("Error", "Failed to create facility")
            }
        } catch (error) {
            console.error("Onboarding error:", error)
            Alert.alert("Error", "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    const canProceed = () => {
        switch (step) {
            case 1:
                return data.businessName && data.address && data.city && data.state && data.phone
            case 2:
                return data.sportType && data.sports.length > 0
            case 3:
                return data.courts.length > 0 && data.courts.every(c => c.name && c.hourlyRate)
            case 4:
                return true
            case 5:
                return true
            default:
                return false
        }
    }

    const renderStep = () => {
        switch (step) {
            case 1:
                return renderBusinessInfo()
            case 2:
                return renderSportType()
            case 3:
                return renderCourts()
            case 4:
                return renderOperatingHours()
            case 5:
                return renderReview()
            default:
                return null
        }
    }

    const renderBusinessInfo = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Get Discovered 🔍</Text>
            <Text style={styles.stepSubtitle}>
                List your facility to reach thousands of players looking to book
            </Text>

            <Text style={styles.label}>Facility Name</Text>
            <TextInput
                style={styles.input}
                value={data.businessName}
                onChangeText={(text) => updateData({ businessName: text })}
                placeholder="e.g., Downtown Tennis Club"
                placeholderTextColor="#666"
            />

            <Text style={styles.label}>Street Address</Text>
            <TextInput
                style={styles.input}
                value={data.address}
                onChangeText={(text) => updateData({ address: text })}
                placeholder="123 Main Street"
                placeholderTextColor="#666"
            />

            <View style={styles.row}>
                <View style={styles.flex2}>
                    <Text style={styles.label}>City</Text>
                    <TextInput
                        style={styles.input}
                        value={data.city}
                        onChangeText={(text) => updateData({ city: text })}
                        placeholder="Atlanta"
                        placeholderTextColor="#666"
                    />
                </View>
                <View style={styles.flex1}>
                    <Text style={styles.label}>State</Text>
                    <TextInput
                        style={styles.input}
                        value={data.state}
                        onChangeText={(text) => updateData({ state: text })}
                        placeholder="GA"
                        placeholderTextColor="#666"
                        maxLength={2}
                        autoCapitalize="characters"
                    />
                </View>
            </View>

            <Text style={styles.label}>Phone Number</Text>
            <TextInput
                style={styles.input}
                value={data.phone}
                onChangeText={(text) => updateData({ phone: text })}
                placeholder="(555) 123-4567"
                placeholderTextColor="#666"
                keyboardType="phone-pad"
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
                style={styles.input}
                value={data.email}
                onChangeText={(text) => updateData({ email: text })}
                placeholder="contact@facility.com"
                placeholderTextColor="#666"
                keyboardType="email-address"
                autoCapitalize="none"
            />
        </View>
    )

    const renderSportType = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>What type of facility?</Text>
            <Text style={styles.stepSubtitle}>Select your category</Text>

            <View style={styles.typeCards}>
                <TouchableOpacity
                    style={[
                        styles.typeCard,
                        data.sportType === "racquet" && styles.typeCardSelected,
                    ]}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                        updateData({
                            sportType: "racquet",
                            sports: [],
                            courts: [{ name: "Court 1", type: "Outdoor", hourlyRate: "40" }]
                        })
                    }}
                >
                    <Ionicons name="tennisball" size={40} color={data.sportType === "racquet" ? "#000" : "#7ED957"} />
                    <Text style={[styles.typeCardTitle, data.sportType === "racquet" && { color: "#000" }]}>
                        Racquet Sports
                    </Text>
                    <Text style={[styles.typeCardSubtitle, data.sportType === "racquet" && { color: "#333" }]}>
                        Tennis, Pickleball, Padel
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.typeCard,
                        data.sportType === "wellness" && styles.typeCardSelected,
                    ]}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                        updateData({
                            sportType: "wellness",
                            sports: [],
                            courts: [{ name: "Studio 1", type: "Indoor", hourlyRate: "30" }]
                        })
                    }}
                >
                    <Ionicons name="fitness" size={40} color={data.sportType === "wellness" ? "#000" : "#7ED957"} />
                    <Text style={[styles.typeCardTitle, data.sportType === "wellness" && { color: "#000" }]}>
                        Wellness Studio
                    </Text>
                    <Text style={[styles.typeCardSubtitle, data.sportType === "wellness" && { color: "#333" }]}>
                        Yoga, Pilates
                    </Text>
                </TouchableOpacity>
            </View>

            {data.sportType && (
                <>
                    <Text style={[styles.label, { marginTop: 24 }]}>Select Sports</Text>
                    <View style={styles.sportsGrid}>
                        {(data.sportType === "racquet"
                            ? ["Tennis", "Pickleball", "Padel", "Racquetball"]
                            : ["Yoga", "Pilates"]
                        ).map((sport) => (
                            <TouchableOpacity
                                key={sport}
                                style={[
                                    styles.sportChip,
                                    data.sports.includes(sport) && styles.sportChipSelected,
                                ]}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                    if (data.sports.includes(sport)) {
                                        updateData({ sports: data.sports.filter(s => s !== sport) })
                                    } else {
                                        updateData({ sports: [...data.sports, sport] })
                                    }
                                }}
                            >
                                <Text style={[
                                    styles.sportChipText,
                                    data.sports.includes(sport) && styles.sportChipTextSelected,
                                ]}>
                                    {sport}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </>
            )}
        </View>
    )

    const renderCourts = () => {
        const label = data.sportType === "wellness" ? "Studios" : "Courts"
        const singular = data.sportType === "wellness" ? "Studio" : "Court"

        return (
            <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Add Your {label}</Text>
                <Text style={styles.stepSubtitle}>How many {label.toLowerCase()} do you have?</Text>

                {data.courts.map((court, index) => (
                    <View key={index} style={styles.courtCard}>
                        <View style={styles.courtCardHeader}>
                            <Text style={styles.courtCardTitle}>{singular} {index + 1}</Text>
                            {data.courts.length > 1 && (
                                <TouchableOpacity onPress={() => removeCourt(index)}>
                                    <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                                </TouchableOpacity>
                            )}
                        </View>

                        <TextInput
                            style={styles.input}
                            value={court.name}
                            onChangeText={(text) => {
                                const newCourts = [...data.courts]
                                newCourts[index].name = text
                                updateData({ courts: newCourts })
                            }}
                            placeholder={`${singular} name`}
                            placeholderTextColor="#666"
                        />

                        <View style={styles.row}>
                            <View style={styles.flex1}>
                                <Text style={styles.smallLabel}>Type</Text>
                                <View style={styles.typeRow}>
                                    {["Indoor", "Outdoor"].map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            style={[
                                                styles.miniChip,
                                                court.type === type && styles.miniChipSelected,
                                            ]}
                                            onPress={() => {
                                                const newCourts = [...data.courts]
                                                newCourts[index].type = type
                                                updateData({ courts: newCourts })
                                            }}
                                        >
                                            <Text style={[
                                                styles.miniChipText,
                                                court.type === type && styles.miniChipTextSelected,
                                            ]}>
                                                {type}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                            <View style={styles.flex1}>
                                <Text style={styles.smallLabel}>Hourly Rate ($)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={court.hourlyRate}
                                    onChangeText={(text) => {
                                        const newCourts = [...data.courts]
                                        newCourts[index].hourlyRate = text
                                        updateData({ courts: newCourts })
                                    }}
                                    placeholder="40"
                                    placeholderTextColor="#666"
                                    keyboardType="number-pad"
                                />
                            </View>
                        </View>
                    </View>
                ))}

                <TouchableOpacity style={styles.addBtn} onPress={addCourt}>
                    <Ionicons name="add-circle" size={24} color="#7ED957" />
                    <Text style={styles.addBtnText}>Add Another {singular}</Text>
                </TouchableOpacity>
            </View>
        )
    }

    const renderOperatingHours = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Operating Hours</Text>
            <Text style={styles.stepSubtitle}>When are you open for bookings?</Text>

            {DAYS.map((day) => (
                <View key={day} style={styles.hoursRow}>
                    <TouchableOpacity
                        style={styles.dayToggle}
                        onPress={() => {
                            const newHours = { ...data.operatingHours }
                            newHours[day].closed = !newHours[day].closed
                            updateData({ operatingHours: newHours })
                        }}
                    >
                        <Ionicons
                            name={data.operatingHours[day].closed ? "square-outline" : "checkbox"}
                            size={24}
                            color={data.operatingHours[day].closed ? "#666" : "#7ED957"}
                        />
                        <Text style={[
                            styles.dayLabel,
                            data.operatingHours[day].closed && { color: "#666" }
                        ]}>
                            {DAY_LABELS[day]}
                        </Text>
                    </TouchableOpacity>

                    {!data.operatingHours[day].closed && (
                        <View style={styles.hoursInputs}>
                            <TextInput
                                style={styles.hoursInput}
                                value={data.operatingHours[day].open}
                                onChangeText={(text) => {
                                    const newHours = { ...data.operatingHours }
                                    newHours[day].open = text
                                    updateData({ operatingHours: newHours })
                                }}
                                placeholder="06:00"
                                placeholderTextColor="#666"
                            />
                            <Text style={styles.toText}>to</Text>
                            <TextInput
                                style={styles.hoursInput}
                                value={data.operatingHours[day].close}
                                onChangeText={(text) => {
                                    const newHours = { ...data.operatingHours }
                                    newHours[day].close = text
                                    updateData({ operatingHours: newHours })
                                }}
                                placeholder="22:00"
                                placeholderTextColor="#666"
                            />
                        </View>
                    )}

                    {data.operatingHours[day].closed && (
                        <Text style={styles.closedText}>Closed</Text>
                    )}
                </View>
            ))}
        </View>
    )

    const renderReview = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Review & Launch! 🚀</Text>
            <Text style={styles.stepSubtitle}>Everything look good?</Text>

            <View style={styles.reviewCard}>
                <Text style={styles.reviewLabel}>Facility</Text>
                <Text style={styles.reviewValue}>{data.businessName}</Text>
            </View>

            <View style={styles.reviewCard}>
                <Text style={styles.reviewLabel}>Location</Text>
                <Text style={styles.reviewValue}>{data.city}, {data.state}</Text>
            </View>

            <View style={styles.reviewCard}>
                <Text style={styles.reviewLabel}>Sports</Text>
                <Text style={styles.reviewValue}>{data.sports.join(", ")}</Text>
            </View>

            <View style={styles.reviewCard}>
                <Text style={styles.reviewLabel}>{data.sportType === "wellness" ? "Studios" : "Courts"}</Text>
                <Text style={styles.reviewValue}>{data.courts.length}</Text>
            </View>

            <View style={styles.revenuePreview}>
                <Ionicons name="trending-up" size={24} color="#7ED957" />
                <View style={styles.revenueText}>
                    <Text style={styles.revenueTitle}>Potential Monthly Revenue</Text>
                    <Text style={styles.revenueAmount}>
                        ${(parseInt(data.courts[0]?.hourlyRate || "40") * 8 * 20 * data.courts.length).toLocaleString()}+
                    </Text>
                    <Text style={styles.revenueSubtext}>Based on 8 bookings/day</Text>
                </View>
            </View>

            <View style={styles.visibilityCard}>
                <Ionicons name="eye" size={24} color="#7ED957" />
                <View style={styles.visibilityText}>
                    <Text style={styles.visibilityTitle}>Extra Visibility Channel</Text>
                    <Text style={styles.visibilitySubtext}>
                        Keep your existing booking system. We'll send you NEW customers who discover you through GoodRunss.
                    </Text>
                </View>
            </View>

            <View style={styles.feesInfo}>
                <Ionicons name="information-circle" size={20} color="#888" />
                <Text style={styles.feesText}>
                    Only pay when we bring you business. 8% on GoodRunss bookings. You keep 92%!
                </Text>
            </View>
        </View>
    )

    return (
        <View style={styles.container}>
            <LinearGradient colors={["#0A0A0A", "#111"]} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => step === 1 ? router.back() : prevStep()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <View style={styles.progressContainer}>
                        {[1, 2, 3, 4, 5].map((s) => (
                            <View
                                key={s}
                                style={[
                                    styles.progressDot,
                                    s <= step && styles.progressDotActive,
                                ]}
                            />
                        ))}
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        contentContainerStyle={styles.content}
                        showsVerticalScrollIndicator={false}
                    >
                        {renderStep()}
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Footer */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.nextBtn, !canProceed() && styles.nextBtnDisabled]}
                        disabled={!canProceed() || loading}
                        onPress={step === 5 ? handleComplete : nextStep}
                    >
                        <LinearGradient
                            colors={canProceed() ? ["#7ED957", "#4C9E29"] : ["#333", "#222"]}
                            style={styles.nextBtnGradient}
                        >
                            {loading ? (
                                <ActivityIndicator color="#000" />
                            ) : (
                                <Text style={styles.nextBtnText}>
                                    {step === 5 ? "Connect Stripe & Launch" : "Continue"}
                                </Text>
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
    progressContainer: { flexDirection: "row", gap: 8 },
    progressDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#333",
    },
    progressDotActive: { backgroundColor: "#7ED957", width: 24 },

    content: { paddingHorizontal: 20, paddingBottom: 120 },

    stepContent: { paddingTop: 20 },
    stepTitle: { color: "#FFF", fontSize: 28, fontWeight: "bold" },
    stepSubtitle: { color: "#888", fontSize: 16, marginTop: 8, marginBottom: 24 },

    label: { color: "#888", fontSize: 12, marginBottom: 8, marginTop: 16 },
    smallLabel: { color: "#888", fontSize: 11, marginBottom: 4 },
    input: {
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        color: "#FFF",
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#333",
    },

    row: { flexDirection: "row", gap: 12 },
    flex1: { flex: 1 },
    flex2: { flex: 2 },

    typeCards: { flexDirection: "row", gap: 12 },
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
    typeCardTitle: { color: "#FFF", fontSize: 16, fontWeight: "bold", marginTop: 12 },
    typeCardSubtitle: { color: "#888", fontSize: 12, marginTop: 4, textAlign: "center" },

    sportsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    sportChip: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: "#1A1A1A",
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#333",
    },
    sportChipSelected: { backgroundColor: "#7ED957", borderColor: "#7ED957" },
    sportChipText: { color: "#888", fontSize: 14 },
    sportChipTextSelected: { color: "#000", fontWeight: "600" },

    courtCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    courtCardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    courtCardTitle: { color: "#FFF", fontSize: 16, fontWeight: "600" },

    typeRow: { flexDirection: "row", gap: 8 },
    miniChip: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: "#0A0A0A",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#333",
    },
    miniChipSelected: { backgroundColor: "#7ED957", borderColor: "#7ED957" },
    miniChipText: { color: "#888", fontSize: 12 },
    miniChipTextSelected: { color: "#000" },

    addBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        borderWidth: 1,
        borderColor: "#333",
        borderStyle: "dashed",
        borderRadius: 12,
    },
    addBtnText: { color: "#7ED957", fontSize: 16, fontWeight: "600", marginLeft: 8 },

    hoursRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#222",
    },
    dayToggle: { flexDirection: "row", alignItems: "center", width: 80 },
    dayLabel: { color: "#FFF", fontSize: 14, marginLeft: 8 },
    hoursInputs: { flexDirection: "row", alignItems: "center" },
    hoursInput: {
        width: 70,
        backgroundColor: "#1A1A1A",
        borderRadius: 8,
        padding: 10,
        color: "#FFF",
        fontSize: 14,
        textAlign: "center",
    },
    toText: { color: "#888", marginHorizontal: 8 },
    closedText: { color: "#666", fontSize: 14 },

    reviewCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
    },
    reviewLabel: { color: "#888", fontSize: 12 },
    reviewValue: { color: "#FFF", fontSize: 18, fontWeight: "600", marginTop: 4 },

    revenuePreview: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(126, 217, 87, 0.1)",
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
    },
    revenueText: { marginLeft: 16 },
    revenueTitle: { color: "#888", fontSize: 12 },
    revenueAmount: { color: "#7ED957", fontSize: 28, fontWeight: "bold" },
    revenueSubtext: { color: "#888", fontSize: 12 },

    visibilityCard: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "rgba(126, 217, 87, 0.15)",
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
        borderWidth: 1,
        borderColor: "rgba(126, 217, 87, 0.3)",
    },
    visibilityText: { marginLeft: 12, flex: 1 },
    visibilityTitle: { color: "#7ED957", fontSize: 14, fontWeight: "600" },
    visibilitySubtext: { color: "#AAA", fontSize: 13, marginTop: 4, lineHeight: 18 },

    feesInfo: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginTop: 16,
        padding: 12,
        backgroundColor: "#1A1A1A",
        borderRadius: 8,
    },
    feesText: { color: "#888", fontSize: 12, marginLeft: 8, flex: 1 },

    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: 40,
        backgroundColor: "#0A0A0A",
    },
    nextBtn: { borderRadius: 16, overflow: "hidden" },
    nextBtnDisabled: { opacity: 0.5 },
    nextBtnGradient: { paddingVertical: 18, alignItems: "center" },
    nextBtnText: { color: "#000", fontSize: 18, fontWeight: "800" },
})
