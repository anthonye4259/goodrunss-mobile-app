import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useUserPreferences } from "@/lib/user-preferences"
import { useLocation } from "@/lib/location-context"
import * as Haptics from "expo-haptics"

const REC_ACTIVITIES = ["Basketball", "Tennis", "Pickleball", "Padel", "Racquetball", "Volleyball", "Golf", "Soccer", "Swimming"]
const STUDIO_ACTIVITIES = ["Pilates", "Yoga", "Lagree", "Barre", "Meditation"]
const ALL_ACTIVITIES = [...REC_ACTIVITIES, ...STUDIO_ACTIVITIES]

type UserType = "player" | "trainer" | "instructor" | "both"

const USER_TYPE_OPTIONS: { id: UserType; label: string; icon: string; color: string }[] = [
    { id: "player", label: "Player", icon: "basketball", color: "#FF6B35" },
    { id: "trainer", label: "Trainer", icon: "fitness", color: "#7ED957" },
    { id: "instructor", label: "Instructor", icon: "sparkles", color: "#EC4899" },
    { id: "both", label: "Both", icon: "sync", color: "#06B6D4" },
]

export default function PreferencesScreen() {
    const { preferences, setPreferences } = useUserPreferences()
    const { requestLocation, loading: locationLoading } = useLocation()

    const [selectedUserType, setSelectedUserType] = useState<UserType>(
        (preferences.userType as UserType) || "player"
    )
    const [selectedActivities, setSelectedActivities] = useState<string[]>(
        preferences.activities || []
    )
    const [primaryActivity, setPrimaryActivity] = useState<string>(
        preferences.primaryActivity || ""
    )
    const [hasChanges, setHasChanges] = useState(false)

    // Check for changes
    useEffect(() => {
        const userTypeChanged = selectedUserType !== preferences.userType
        const activitiesChanged = JSON.stringify(selectedActivities.sort()) !== JSON.stringify((preferences.activities || []).sort())
        const primaryChanged = primaryActivity !== preferences.primaryActivity
        setHasChanges(userTypeChanged || activitiesChanged || primaryChanged)
    }, [selectedUserType, selectedActivities, primaryActivity, preferences])

    const handleUserTypeSelect = (type: UserType) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        setSelectedUserType(type)
    }

    const toggleActivity = (activity: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        if (selectedActivities.includes(activity)) {
            const newActivities = selectedActivities.filter(a => a !== activity)
            setSelectedActivities(newActivities)
            if (primaryActivity === activity) {
                setPrimaryActivity(newActivities[0] || "")
            }
        } else {
            setSelectedActivities([...selectedActivities, activity])
            if (!primaryActivity) {
                setPrimaryActivity(activity)
            }
        }
    }

    const handlePrimarySelect = (activity: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        setPrimaryActivity(activity)
    }

    const handleLocationUpdate = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        await requestLocation()
        Alert.alert("Location Updated", "Your location has been refreshed.")
    }

    const handleSave = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)

        const isStudio = selectedActivities.some(a => STUDIO_ACTIVITIES.includes(a))
        const isRec = selectedActivities.some(a => REC_ACTIVITIES.includes(a))

        setPreferences({
            ...preferences,
            userType: selectedUserType,
            activities: selectedActivities,
            primaryActivity: primaryActivity || selectedActivities[0],
            isStudioUser: isStudio,
            isRecUser: isRec,
        })


        Alert.alert(
            "Preferences Saved",
            "Your experience has been updated!",
            [{ text: "OK", onPress: () => router.back() }]
        )
    }

    const getActivitiesToShow = () => {
        switch (selectedUserType) {
            case "player":
                return { rec: REC_ACTIVITIES, studio: [] }
            case "trainer":
                return { rec: REC_ACTIVITIES, studio: [] }
            case "instructor":
                return { rec: [], studio: STUDIO_ACTIVITIES }
            case "both":
            default:
                return { rec: REC_ACTIVITIES, studio: STUDIO_ACTIVITIES }
        }
    }

    const activitiesToShow = getActivitiesToShow()

    return (
        <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Preferences</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* User Type Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>I AM A...</Text>
                        <Text style={styles.sectionSubtitle}>This changes your home experience</Text>
                        <View style={styles.userTypeGrid}>
                            {USER_TYPE_OPTIONS.map((option) => (
                                <TouchableOpacity
                                    key={option.id}
                                    onPress={() => handleUserTypeSelect(option.id)}
                                    style={[
                                        styles.userTypeCard,
                                        selectedUserType === option.id && {
                                            borderColor: option.color,
                                            backgroundColor: `${option.color}15`
                                        }
                                    ]}
                                >
                                    <View style={[styles.userTypeIcon, { backgroundColor: `${option.color}20` }]}>
                                        <Ionicons name={option.icon as any} size={20} color={option.color} />
                                    </View>
                                    <Text style={[
                                        styles.userTypeLabel,
                                        selectedUserType === option.id && { color: option.color }
                                    ]}>{option.label}</Text>
                                    {selectedUserType === option.id && (
                                        <View style={[styles.checkmark, { backgroundColor: option.color }]}>
                                            <Ionicons name="checkmark" size={12} color="#FFF" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Activities Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>MY ACTIVITIES</Text>
                        <Text style={styles.sectionSubtitle}>Tap to select, tap again to remove</Text>

                        {/* Rec Activities */}
                        {activitiesToShow.rec.length > 0 && (
                            <View style={styles.activitySection}>
                                <View style={styles.activitySectionHeader}>
                                    <Text style={styles.activitySectionEmoji}>🏀</Text>
                                    <Text style={styles.activitySectionTitle}>Sports & Recreation</Text>
                                </View>
                                <View style={styles.activityGrid}>
                                    {activitiesToShow.rec.map((activity) => (
                                        <TouchableOpacity
                                            key={activity}
                                            onPress={() => toggleActivity(activity)}
                                            style={[
                                                styles.activityChip,
                                                selectedActivities.includes(activity) && styles.activityChipSelected
                                            ]}
                                        >
                                            <Text style={[
                                                styles.activityChipText,
                                                selectedActivities.includes(activity) && styles.activityChipTextSelected
                                            ]}>{activity}</Text>
                                            {selectedActivities.includes(activity) && (
                                                <Ionicons name="checkmark-circle" size={16} color="#7ED957" />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Studio Activities */}
                        {activitiesToShow.studio.length > 0 && (
                            <View style={styles.activitySection}>
                                <View style={styles.activitySectionHeader}>
                                    <Text style={styles.activitySectionEmoji}>🧘</Text>
                                    <Text style={styles.activitySectionTitle}>Studio & Wellness</Text>
                                </View>
                                <View style={styles.activityGrid}>
                                    {activitiesToShow.studio.map((activity) => (
                                        <TouchableOpacity
                                            key={activity}
                                            onPress={() => toggleActivity(activity)}
                                            style={[
                                                styles.activityChip,
                                                selectedActivities.includes(activity) && styles.activityChipSelected
                                            ]}
                                        >
                                            <Text style={[
                                                styles.activityChipText,
                                                selectedActivities.includes(activity) && styles.activityChipTextSelected
                                            ]}>{activity}</Text>
                                            {selectedActivities.includes(activity) && (
                                                <Ionicons name="checkmark-circle" size={16} color="#7ED957" />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Primary Activity Section */}
                    {selectedActivities.length > 1 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>PRIMARY ACTIVITY</Text>
                            <Text style={styles.sectionSubtitle}>Your main focus (shown first)</Text>
                            <View style={styles.primaryGrid}>
                                {selectedActivities.map((activity) => (
                                    <TouchableOpacity
                                        key={activity}
                                        onPress={() => handlePrimarySelect(activity)}
                                        style={[
                                            styles.primaryChip,
                                            primaryActivity === activity && styles.primaryChipSelected
                                        ]}
                                    >
                                        <Text style={[
                                            styles.primaryChipText,
                                            primaryActivity === activity && styles.primaryChipTextSelected
                                        ]}>{activity}</Text>
                                        {primaryActivity === activity && (
                                            <Ionicons name="star" size={14} color="#FFD700" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Location Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>LOCATION</Text>
                        <Text style={styles.sectionSubtitle}>
                            {preferences.location?.city
                                ? `Current: ${preferences.location.city}, ${preferences.location.state}`
                                : "Not set"}
                        </Text>
                        <TouchableOpacity
                            onPress={handleLocationUpdate}
                            style={styles.locationButton}
                            disabled={locationLoading}
                        >
                            <Ionicons name="location" size={20} color="#7ED957" />
                            <Text style={styles.locationButtonText}>
                                {locationLoading ? "Updating..." : "Update My Location"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Experience Preview */}
                    <View style={styles.previewSection}>
                        <Text style={styles.previewTitle}>Your Experience</Text>
                        <View style={styles.previewCard}>
                            <View style={styles.previewRow}>
                                <Text style={styles.previewLabel}>Home Dashboard:</Text>
                                <Text style={styles.previewValue}>
                                    {selectedUserType === "trainer" || selectedUserType === "instructor"
                                        ? "Earnings & Clients"
                                        : "Activity & Venues"}
                                </Text>
                            </View>
                            <View style={styles.previewRow}>
                                <Text style={styles.previewLabel}>GIA Assistant:</Text>
                                <Text style={styles.previewValue}>
                                    {selectedUserType === "trainer" ? "Coach Mode"
                                        : selectedUserType === "instructor" ? "Teaching Mode"
                                            : "Player Mode"}
                                </Text>
                            </View>
                            <View style={styles.previewRow}>
                                <Text style={styles.previewLabel}>Venues:</Text>
                                <Text style={styles.previewValue}>
                                    {activitiesToShow.studio.length > 0 && activitiesToShow.rec.length > 0
                                        ? "Courts + Studios"
                                        : activitiesToShow.studio.length > 0
                                            ? "Studios Only"
                                            : "Courts Only"}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={{ height: 120 }} />
                </ScrollView>

                {/* Save Button */}
                {hasChanges && (
                    <View style={styles.saveContainer}>
                        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                            <Ionicons name="checkmark-circle" size={20} color="#000" />
                        </TouchableOpacity>
                    </View>
                )}
            </SafeAreaView>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#222",
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFF",
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
    },
    section: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: "700",
        color: "#666",
        letterSpacing: 1,
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: "#9CA3AF",
        marginBottom: 12,
    },
    userTypeGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    userTypeCard: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 12,
        backgroundColor: "#1A1A1A",
        borderWidth: 2,
        borderColor: "#333",
        gap: 8,
        position: "relative",
    },
    userTypeIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    userTypeLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFF",
    },
    checkmark: {
        position: "absolute",
        top: -6,
        right: -6,
        width: 18,
        height: 18,
        borderRadius: 9,
        alignItems: "center",
        justifyContent: "center",
    },
    activitySection: {
        marginTop: 16,
    },
    activitySectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 10,
    },
    activitySectionEmoji: {
        fontSize: 16,
    },
    activitySectionTitle: {
        fontSize: 13,
        fontWeight: "600",
        color: "#888",
    },
    activityGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    activityChip: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        backgroundColor: "#1A1A1A",
        borderWidth: 1,
        borderColor: "#333",
        gap: 6,
    },
    activityChipSelected: {
        borderColor: "#7ED957",
        backgroundColor: "rgba(126, 217, 87, 0.1)",
    },
    activityChipText: {
        fontSize: 14,
        color: "#9CA3AF",
    },
    activityChipTextSelected: {
        color: "#7ED957",
        fontWeight: "500",
    },
    primaryGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    primaryChip: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: "#1A1A1A",
        borderWidth: 2,
        borderColor: "#333",
        gap: 6,
    },
    primaryChipSelected: {
        borderColor: "#FFD700",
        backgroundColor: "rgba(255, 215, 0, 0.1)",
    },
    primaryChipText: {
        fontSize: 14,
        color: "#9CA3AF",
    },
    primaryChipTextSelected: {
        color: "#FFD700",
        fontWeight: "600",
    },
    locationButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: "#1A1A1A",
        borderWidth: 1,
        borderColor: "#333",
        gap: 8,
    },
    locationButtonText: {
        fontSize: 15,
        color: "#7ED957",
        fontWeight: "600",
    },
    previewSection: {
        marginTop: 32,
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: "#222",
    },
    previewTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFF",
        marginBottom: 12,
    },
    previewCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        gap: 12,
    },
    previewRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    previewLabel: {
        fontSize: 14,
        color: "#666",
    },
    previewValue: {
        fontSize: 14,
        color: "#7ED957",
        fontWeight: "500",
    },
    saveContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: "rgba(10, 10, 10, 0.95)",
        borderTopWidth: 1,
        borderTopColor: "#222",
    },
    saveButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#7ED957",
        borderRadius: 12,
        paddingVertical: 16,
        gap: 8,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#000",
    },
})
