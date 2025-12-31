/**
 * Train Abroad Directory
 * 
 * Browse trainers by destination city
 * Set travel plans to find trainers at your destination
 */

import { useState, useEffect } from "react"
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Image,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"

import { remoteTrainingService } from "@/lib/services/remote-training-service"
import { LAUNCH_CITIES } from "@/lib/launch-cities"

// Group cities by country
const DESTINATIONS = [
    {
        country: "Spain",
        flag: "🇪🇸",
        cities: ["Barcelona", "Madrid", "Marbella"],
        sports: ["Padel", "Tennis"],
        image: null,
    },
    {
        country: "UAE",
        flag: "🇦🇪",
        cities: ["Dubai", "Abu Dhabi"],
        sports: ["Tennis", "Padel", "Golf"],
        image: null,
    },
    {
        country: "UK",
        flag: "🇬🇧",
        cities: ["London", "Manchester"],
        sports: ["Tennis", "Squash"],
        image: null,
    },
    {
        country: "Portugal",
        flag: "🇵🇹",
        cities: ["Lisbon", "Algarve"],
        sports: ["Padel", "Tennis", "Golf"],
        image: null,
    },
    {
        country: "USA",
        flag: "🇺🇸",
        cities: ["Miami", "New York", "San Francisco"],
        sports: ["Tennis", "Pickleball", "Basketball"],
        image: null,
    },
]

export default function TrainAbroadScreen() {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedSport, setSelectedSport] = useState<string | null>(null)
    const [trainers, setTrainers] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    const filteredDestinations = DESTINATIONS.filter(d =>
        d.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.cities.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    const handleDestinationPress = async (country: string, city?: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        // Navigate to trainers in that destination
        router.push({
            pathname: "/remote-training",
            params: {
                city: city || country,
                filter: "destination",
            },
        })
    }

    const handleSetTravelPlan = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        router.push("/remote-training/travel-plan")
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
                    <Text style={styles.headerTitle}>Train Abroad</Text>
                    <TouchableOpacity onPress={handleSetTravelPlan}>
                        <Ionicons name="airplane" size={24} color="#6B9B5A" />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    {/* Hero */}
                    <View style={styles.hero}>
                        <Ionicons name="globe-outline" size={48} color="#6B9B5A" />
                        <Text style={styles.heroTitle}>Train with World-Class Coaches</Text>
                        <Text style={styles.heroSubtext}>
                            Find trainers in your travel destination. Book before you arrive.
                        </Text>
                    </View>

                    {/* Travel Plan CTA */}
                    <TouchableOpacity style={styles.travelPlanCard} onPress={handleSetTravelPlan}>
                        <LinearGradient
                            colors={["#6B9B5A20", "#0A0A0A"]}
                            style={styles.travelPlanGradient}
                        >
                            <Ionicons name="airplane" size={24} color="#6B9B5A" />
                            <View style={styles.travelPlanContent}>
                                <Text style={styles.travelPlanTitle}>Set Your Travel Plan</Text>
                                <Text style={styles.travelPlanSubtext}>
                                    Tell us where you're going and we'll find trainers
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#6B9B5A" />
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Search */}
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color="#666" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search destinations..."
                            placeholderTextColor="#666"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    {/* Destinations */}
                    <Text style={styles.sectionTitle}>Popular Destinations</Text>

                    {filteredDestinations.map(dest => (
                        <TouchableOpacity
                            key={dest.country}
                            style={styles.destinationCard}
                            onPress={() => handleDestinationPress(dest.country)}
                        >
                            <LinearGradient
                                colors={["#1A1A1A", "#0F0F0F"]}
                                style={styles.destinationGradient}
                            >
                                <View style={styles.destinationHeader}>
                                    <Text style={styles.destinationFlag}>{dest.flag}</Text>
                                    <View style={styles.destinationInfo}>
                                        <Text style={styles.destinationName}>{dest.country}</Text>
                                        <Text style={styles.destinationCities}>
                                            {dest.cities.join(" • ")}
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#666" />
                                </View>

                                <View style={styles.sportTags}>
                                    {dest.sports.map(sport => (
                                        <View key={sport} style={styles.sportTag}>
                                            <Text style={styles.sportTagText}>{sport}</Text>
                                        </View>
                                    ))}
                                </View>

                                {/* City Pills */}
                                <View style={styles.cityPills}>
                                    {dest.cities.map(city => (
                                        <TouchableOpacity
                                            key={city}
                                            style={styles.cityPill}
                                            onPress={(e) => {
                                                e.stopPropagation()
                                                handleDestinationPress(dest.country, city)
                                            }}
                                        >
                                            <Text style={styles.cityPillText}>{city}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    ))}

                    {/* Remote Training CTA */}
                    <View style={styles.remoteCta}>
                        <Ionicons name="videocam" size={32} color="#3B82F6" />
                        <Text style={styles.remoteCtaTitle}>Can't Travel?</Text>
                        <Text style={styles.remoteCtaText}>
                            Get remote coaching from international trainers via video analysis and live sessions.
                        </Text>
                        <TouchableOpacity
                            style={styles.remoteCtaButton}
                            onPress={() => router.push("/remote-training")}
                        >
                            <Text style={styles.remoteCtaButtonText}>Browse Remote Trainers</Text>
                        </TouchableOpacity>
                    </View>
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
        marginBottom: 24,
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#FFF",
        marginTop: 12,
        textAlign: "center",
    },
    heroSubtext: {
        fontSize: 14,
        color: "#888",
        marginTop: 8,
        textAlign: "center",
    },
    travelPlanCard: {
        marginBottom: 20,
        borderRadius: 16,
        overflow: "hidden",
    },
    travelPlanGradient: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderWidth: 1,
        borderColor: "#6B9B5A40",
        borderRadius: 16,
    },
    travelPlanContent: {
        flex: 1,
        marginLeft: 12,
    },
    travelPlanTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFF",
    },
    travelPlanSubtext: {
        fontSize: 12,
        color: "#888",
        marginTop: 2,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#2A2A2A",
    },
    searchInput: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 12,
        fontSize: 16,
        color: "#FFF",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFF",
        marginBottom: 16,
    },
    destinationCard: {
        marginBottom: 12,
        borderRadius: 16,
        overflow: "hidden",
    },
    destinationGradient: {
        padding: 16,
        borderWidth: 1,
        borderColor: "#2A2A2A",
        borderRadius: 16,
    },
    destinationHeader: {
        flexDirection: "row",
        alignItems: "center",
    },
    destinationFlag: {
        fontSize: 32,
    },
    destinationInfo: {
        flex: 1,
        marginLeft: 12,
    },
    destinationName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFF",
    },
    destinationCities: {
        fontSize: 13,
        color: "#888",
        marginTop: 2,
    },
    sportTags: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 12,
    },
    sportTag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: "#2A2A2A",
        borderRadius: 8,
    },
    sportTagText: {
        fontSize: 12,
        color: "#AAA",
    },
    cityPills: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 12,
    },
    cityPill: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: "#6B9B5A20",
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#6B9B5A40",
    },
    cityPillText: {
        fontSize: 13,
        color: "#6B9B5A",
        fontWeight: "600",
    },
    remoteCta: {
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        padding: 24,
        borderRadius: 16,
        marginTop: 20,
        borderWidth: 1,
        borderColor: "#2A2A2A",
    },
    remoteCtaTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFF",
        marginTop: 12,
    },
    remoteCtaText: {
        fontSize: 14,
        color: "#888",
        textAlign: "center",
        marginTop: 8,
    },
    remoteCtaButton: {
        marginTop: 16,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: "#3B82F6",
        borderRadius: 12,
    },
    remoteCtaButtonText: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "600",
    },
})
