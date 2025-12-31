/**
 * Travel Plan Setup Screen
 * 
 * Allow users to set up their travel plans
 * to find trainers at their destination
 */

import { useState } from "react"
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    TextInput,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import DateTimePicker from "@react-native-community/datetimepicker"

import { remoteTrainingService } from "@/lib/services/remote-training-service"
import { LAUNCH_CITIES } from "@/lib/launch-cities"

const SPORTS = ["Tennis", "Padel", "Pickleball", "Basketball", "Golf", "Yoga", "Pilates"]
const LOOKING_FOR = [
    { id: "trainers", label: "Trainers", icon: "fitness" },
    { id: "courts", label: "Courts", icon: "tennisball" },
    { id: "partners", label: "Playing Partners", icon: "people" },
]

// Group cities by country for picker
const DESTINATIONS = LAUNCH_CITIES.filter(c => c.country !== "USA").map(c => ({
    id: c.id,
    name: c.name,
    country: c.country,
}))

export default function TravelPlanScreen() {
    const [destination, setDestination] = useState<string | null>(null)
    const [arrivalDate, setArrivalDate] = useState(new Date())
    const [departureDate, setDepartureDate] = useState(
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week from now
    )
    const [selectedSports, setSelectedSports] = useState<string[]>([])
    const [lookingFor, setLookingFor] = useState<string[]>(["trainers"])
    const [notes, setNotes] = useState("")
    const [showArrivalPicker, setShowArrivalPicker] = useState(false)
    const [showDeparturePicker, setShowDeparturePicker] = useState(false)
    const [saving, setSaving] = useState(false)

    const toggleSport = (sport: string) => {
        Haptics.selectionAsync()
        if (selectedSports.includes(sport)) {
            setSelectedSports(selectedSports.filter(s => s !== sport))
        } else {
            setSelectedSports([...selectedSports, sport])
        }
    }

    const toggleLookingFor = (id: string) => {
        Haptics.selectionAsync()
        if (lookingFor.includes(id)) {
            if (lookingFor.length > 1) {
                setLookingFor(lookingFor.filter(l => l !== id))
            }
        } else {
            setLookingFor([...lookingFor, id])
        }
    }

    const handleSave = async () => {
        if (!destination) {
            // Show error
            return
        }

        setSaving(true)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        try {
            await remoteTrainingService.setTravelPlan({
                destination,
                arrivalDate: arrivalDate.toISOString(),
                departureDate: departureDate.toISOString(),
                sportsInterested: selectedSports,
                lookingFor: lookingFor as ("trainers" | "courts" | "partners")[],
                notes: notes || undefined,
            })

            // Navigate to trainers in that destination
            router.replace({
                pathname: "/remote-training",
                params: { city: destination, filter: "travel" },
            })
        } catch (error) {
            console.error("Failed to save travel plan:", error)
        } finally {
            setSaving(false)
        }
    }

    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        })
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={["#0A0A0A", "#111"]} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Plan Your Trip</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    {/* Hero */}
                    <View style={styles.hero}>
                        <Ionicons name="airplane" size={40} color="#6B9B5A" />
                        <Text style={styles.heroTitle}>Where are you traveling?</Text>
                        <Text style={styles.heroSubtext}>
                            We'll find trainers and courts at your destination
                        </Text>
                    </View>

                    {/* Destination */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Destination</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.destinationScroll}
                        >
                            {DESTINATIONS.map(dest => (
                                <TouchableOpacity
                                    key={dest.id}
                                    style={[
                                        styles.destinationChip,
                                        destination === dest.id && styles.destinationChipSelected
                                    ]}
                                    onPress={() => {
                                        Haptics.selectionAsync()
                                        setDestination(dest.id)
                                    }}
                                >
                                    <Text style={[
                                        styles.destinationText,
                                        destination === dest.id && styles.destinationTextSelected
                                    ]}>
                                        {dest.name}
                                    </Text>
                                    <Text style={styles.destinationCountry}>{dest.country}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Dates */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Travel Dates</Text>
                        <View style={styles.dateRow}>
                            <TouchableOpacity
                                style={styles.dateCard}
                                onPress={() => setShowArrivalPicker(true)}
                            >
                                <Ionicons name="calendar-outline" size={20} color="#6B9B5A" />
                                <View style={styles.dateContent}>
                                    <Text style={styles.dateLabel}>Arrival</Text>
                                    <Text style={styles.dateValue}>{formatDate(arrivalDate)}</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.dateCard}
                                onPress={() => setShowDeparturePicker(true)}
                            >
                                <Ionicons name="calendar-outline" size={20} color="#6B9B5A" />
                                <View style={styles.dateContent}>
                                    <Text style={styles.dateLabel}>Departure</Text>
                                    <Text style={styles.dateValue}>{formatDate(departureDate)}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {showArrivalPicker && (
                            <DateTimePicker
                                value={arrivalDate}
                                mode="date"
                                display="spinner"
                                onChange={(e, date) => {
                                    setShowArrivalPicker(false)
                                    if (date) setArrivalDate(date)
                                }}
                                minimumDate={new Date()}
                            />
                        )}
                        {showDeparturePicker && (
                            <DateTimePicker
                                value={departureDate}
                                mode="date"
                                display="spinner"
                                onChange={(e, date) => {
                                    setShowDeparturePicker(false)
                                    if (date) setDepartureDate(date)
                                }}
                                minimumDate={arrivalDate}
                            />
                        )}
                    </View>

                    {/* Sports */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Sports Interested In</Text>
                        <View style={styles.chipContainer}>
                            {SPORTS.map(sport => (
                                <TouchableOpacity
                                    key={sport}
                                    style={[
                                        styles.chip,
                                        selectedSports.includes(sport) && styles.chipSelected
                                    ]}
                                    onPress={() => toggleSport(sport)}
                                >
                                    <Text style={[
                                        styles.chipText,
                                        selectedSports.includes(sport) && styles.chipTextSelected
                                    ]}>
                                        {sport}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Looking For */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>I'm Looking For</Text>
                        <View style={styles.lookingForContainer}>
                            {LOOKING_FOR.map(item => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[
                                        styles.lookingForCard,
                                        lookingFor.includes(item.id) && styles.lookingForCardSelected
                                    ]}
                                    onPress={() => toggleLookingFor(item.id)}
                                >
                                    <Ionicons
                                        name={item.icon as any}
                                        size={24}
                                        color={lookingFor.includes(item.id) ? "#6B9B5A" : "#666"}
                                    />
                                    <Text style={[
                                        styles.lookingForText,
                                        lookingFor.includes(item.id) && styles.lookingForTextSelected
                                    ]}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Notes */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Additional Notes (Optional)</Text>
                        <TextInput
                            style={styles.notesInput}
                            placeholder="E.g., Looking for early morning sessions..."
                            placeholderTextColor="#666"
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity
                        style={[styles.saveButton, !destination && styles.saveButtonDisabled]}
                        onPress={handleSave}
                        disabled={!destination || saving}
                    >
                        <LinearGradient
                            colors={destination ? ["#6B9B5A", "#4A7A3A"] : ["#333", "#222"]}
                            style={styles.saveButtonGradient}
                        >
                            {saving ? (
                                <Text style={styles.saveButtonText}>Finding Trainers...</Text>
                            ) : (
                                <>
                                    <Text style={styles.saveButtonText}>Find Trainers</Text>
                                    <Ionicons name="arrow-forward" size={20} color="#FFF" />
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
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
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFF",
    },
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    hero: {
        alignItems: "center",
        marginBottom: 32,
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#FFF",
        marginTop: 12,
    },
    heroSubtext: {
        fontSize: 14,
        color: "#888",
        marginTop: 8,
        textAlign: "center",
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFF",
        marginBottom: 12,
    },
    destinationScroll: {
        gap: 10,
    },
    destinationChip: {
        paddingHorizontal: 18,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: "#1A1A1A",
        borderWidth: 1,
        borderColor: "#2A2A2A",
        marginRight: 10,
    },
    destinationChipSelected: {
        backgroundColor: "#6B9B5A20",
        borderColor: "#6B9B5A",
    },
    destinationText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFF",
    },
    destinationTextSelected: {
        color: "#6B9B5A",
    },
    destinationCountry: {
        fontSize: 12,
        color: "#666",
        marginTop: 2,
    },
    dateRow: {
        flexDirection: "row",
        gap: 12,
    },
    dateCard: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#2A2A2A",
        gap: 12,
    },
    dateContent: {
        flex: 1,
    },
    dateLabel: {
        fontSize: 12,
        color: "#888",
    },
    dateValue: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFF",
        marginTop: 2,
    },
    chipContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: "#1A1A1A",
        borderWidth: 1,
        borderColor: "#2A2A2A",
    },
    chipSelected: {
        backgroundColor: "#6B9B5A20",
        borderColor: "#6B9B5A",
    },
    chipText: {
        fontSize: 14,
        color: "#888",
    },
    chipTextSelected: {
        color: "#6B9B5A",
        fontWeight: "600",
    },
    lookingForContainer: {
        flexDirection: "row",
        gap: 12,
    },
    lookingForCard: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#2A2A2A",
    },
    lookingForCardSelected: {
        backgroundColor: "#6B9B5A15",
        borderColor: "#6B9B5A",
    },
    lookingForText: {
        fontSize: 12,
        color: "#888",
        marginTop: 8,
    },
    lookingForTextSelected: {
        color: "#6B9B5A",
        fontWeight: "600",
    },
    notesInput: {
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        fontSize: 14,
        color: "#FFF",
        borderWidth: 1,
        borderColor: "#2A2A2A",
        minHeight: 80,
        textAlignVertical: "top",
    },
    saveButton: {
        marginTop: 16,
        borderRadius: 16,
        overflow: "hidden",
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        paddingVertical: 18,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFF",
    },
})
