import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useUserLocation } from "@/lib/services/location-service"
import { useState, useEffect } from "react"
import { venueService } from "@/lib/services/venue-service"
import * as Haptics from "expo-haptics"
import { SafeAreaView } from "react-native-safe-area-context"
import { PartnerCityBadge } from "@/components/partner-city-badge"

export default function ReportScreen() {
    const { location, loading: locationLoading } = useUserLocation()
    const [nearbyVenues, setNearbyVenues] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!locationLoading) {
            loadNearbyVenues()
        }
    }, [locationLoading])

    const loadNearbyVenues = async () => {
        setLoading(true)
        const venues = await venueService.getVenuesNearby(location, 10, undefined, 10)
        setNearbyVenues(venues)
        setLoading(false)
    }

    const handlePress = (action: () => void) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        action()
    }

    return (
        <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* Partner City Badge */}
                    <PartnerCityBadge />

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerIcon}>
                            <Ionicons name="leaf" size={32} color="#7ED957" />
                        </View>
                        <Text style={styles.title}>Report Court Condition</Text>
                        <Text style={styles.subtitle}>Help the community & earn $1-31 per report</Text>
                        <Text style={styles.impact}>Save gas, time & reduce CO₂ emissions 🌍</Text>
                    </View>

                    {/* Quick Report Options */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>What to Report</Text>

                        <View style={styles.reportOptions}>
                            <View style={styles.optionCard}>
                                <Ionicons name="people" size={24} color="#7ED957" />
                                <Text style={styles.optionTitle}>Current Traffic</Text>
                                <Text style={styles.optionDesc}>How many players are there?</Text>
                            </View>

                            <View style={styles.optionCard}>
                                <Ionicons name="person" size={24} color="#7ED957" />
                                <Text style={styles.optionTitle}>Age Group</Text>
                                <Text style={styles.optionDesc}>Kids, teens, adults?</Text>
                            </View>

                            <View style={styles.optionCard}>
                                <Ionicons name="star" size={24} color="#7ED957" />
                                <Text style={styles.optionTitle}>Skill Level</Text>
                                <Text style={styles.optionDesc}>Beginner to expert</Text>
                            </View>

                            <View style={styles.optionCard}>
                                <Ionicons name="camera" size={24} color="#7ED957" />
                                <Text style={styles.optionTitle}>Photos</Text>
                                <Text style={styles.optionDesc}>Optional court photos</Text>
                            </View>
                        </View>
                    </View>

                    {/* Nearby Venues to Report */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Nearby Courts</Text>
                        <Text style={styles.sectionSubtitle}>Select a court to report on</Text>

                        {loading ? (
                            <Text style={styles.loadingText}>Loading nearby courts...</Text>
                        ) : nearbyVenues.length > 0 ? (
                            nearbyVenues.map((venue) => (
                                <TouchableOpacity
                                    key={venue.id}
                                    style={styles.venueCard}
                                    onPress={() => handlePress(() => router.push(`/report-facility/${venue.id}`))}
                                >
                                    <View style={styles.venueIcon}>
                                        <Ionicons name="location" size={24} color="#7ED957" />
                                    </View>
                                    <View style={styles.venueInfo}>
                                        <Text style={styles.venueName}>{venue.name}</Text>
                                        <Text style={styles.venueAddress}>{venue.address}</Text>
                                        <Text style={styles.venueDistance}>{venue.distance?.toFixed(1)} mi away</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#666" />
                                </TouchableOpacity>
                            ))
                        ) : (
                            <Text style={styles.emptyText}>No courts found nearby</Text>
                        )}
                    </View>

                    {/* Quick Report Button */}
                    <View style={styles.section}>
                        <TouchableOpacity
                            style={styles.quickReportButton}
                            onPress={() => handlePress(() => router.push("/report-facility/quick"))}
                        >
                            <LinearGradient
                                colors={["#7ED957", "#65A30D"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.quickReportGradient}
                            >
                                <Ionicons name="flash" size={24} color="#000" />
                                <Text style={styles.quickReportText}>Quick Report (Any Court)</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
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
    scrollView: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 24,
        alignItems: "center",
    },
    headerIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "rgba(126, 217, 87, 0.2)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 8,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        color: "#9CA3AF",
        textAlign: "center",
        marginBottom: 4,
    },
    impact: {
        fontSize: 14,
        color: "#7ED957",
        textAlign: "center",
    },
    section: {
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: "#9CA3AF",
        marginBottom: 16,
    },
    reportOptions: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    optionCard: {
        width: "48%",
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#252525",
        alignItems: "center",
    },
    optionTitle: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginTop: 8,
        marginBottom: 4,
        textAlign: "center",
    },
    optionDesc: {
        fontSize: 12,
        color: "#9CA3AF",
        textAlign: "center",
    },
    venueCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#252525",
        marginBottom: 12,
    },
    venueIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "rgba(126, 217, 87, 0.2)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    venueInfo: {
        flex: 1,
    },
    venueName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 4,
    },
    venueAddress: {
        fontSize: 14,
        color: "#9CA3AF",
        marginBottom: 2,
    },
    venueDistance: {
        fontSize: 12,
        color: "#7ED957",
    },
    loadingText: {
        fontSize: 14,
        color: "#9CA3AF",
        textAlign: "center",
        paddingVertical: 20,
    },
    emptyText: {
        fontSize: 14,
        color: "#9CA3AF",
        textAlign: "center",
        paddingVertical: 20,
    },
    quickReportButton: {
        borderRadius: 16,
        overflow: "hidden",
    },
    quickReportGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        gap: 12,
    },
    quickReportText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#000",
    },
})
