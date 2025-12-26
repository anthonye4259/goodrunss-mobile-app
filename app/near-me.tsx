/**
 * Near Me Screen - Court Finder
 * 
 * Standalone value: Works even with zero users.
 * Shows nearest courts with live activity and GIA predictions.
 */

import React, { useState, useEffect, useCallback } from "react"
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router, Stack } from "expo-router"
import * as Haptics from "expo-haptics"
import * as Location from "expo-location"
import { discoverVenues, type DiscoveredVenue } from "@/lib/services/global-discovery-service"
import { useUserPreferences } from "@/lib/user-preferences"
import { getSportContext, type Sport } from "@/lib/services/sport-intelligence-service"

// Sport filter options
const SPORTS = [
    { id: "all", label: "All", icon: "apps-outline" },
    { id: "basketball", label: "Basketball", icon: "basketball-outline" },
    { id: "tennis", label: "Tennis", icon: "tennisball-outline" },
    { id: "pickleball", label: "Pickleball", icon: "tennisball-outline" },
    { id: "swimming", label: "Swimming", icon: "water-outline" },
    { id: "soccer", label: "Soccer", icon: "football-outline" },
]

export default function NearMeScreen() {
    const { preferences } = useUserPreferences()
    const [selectedSport, setSelectedSport] = useState<string>("all")
    const [courts, setCourts] = useState<DiscoveredVenue[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

    useEffect(() => {
        loadCourts()
    }, [selectedSport])

    const loadCourts = async () => {
        try {
            setLoading(true)
            setError(null)

            // Get user location
            const { status } = await Location.requestForegroundPermissionsAsync()
            let lat = 40.7128
            let lng = -74.0060

            if (status === "granted") {
                const location = await Location.getCurrentPositionAsync({})
                lat = location.coords.latitude
                lng = location.coords.longitude
                setUserLocation({ lat, lng })
            }

            // Discover courts
            const sportFilter = selectedSport === "all" ? "" : selectedSport
            const discovered = await discoverVenues(lat, lng, sportFilter || "", 25)
            setCourts(discovered)
        } catch (err) {
            console.error("[NearMe] Error:", err)
            setError("Couldn't find courts nearby")
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    const handleRefresh = useCallback(() => {
        setRefreshing(true)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        loadCourts()
    }, [selectedSport])

    const handleCourtPress = (court: DiscoveredVenue) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        router.push(`/venues/${court.id}`)
    }

    const handleSportSelect = (sportId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        setSelectedSport(sportId)
    }

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />
            <LinearGradient colors={["#0A0A0A", "#0F0F0F"]} style={styles.container}>
                <SafeAreaView style={styles.safeArea} edges={["top"]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}
                        >
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <View style={styles.headerContent}>
                            <Text style={styles.headerTitle}>Near Me</Text>
                            <View style={styles.liveBadge}>
                                <View style={styles.liveDot} />
                                <Text style={styles.liveText}>Live</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.mapButton}
                            onPress={() => router.push("/activity-map")}
                        >
                            <Ionicons name="map-outline" size={22} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Sport Filters */}
                    <View style={styles.filtersContainer}>
                        <FlatList
                            horizontal
                            data={SPORTS}
                            keyExtractor={(item) => item.id}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.filtersList}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.filterChip,
                                        selectedSport === item.id && styles.filterChipActive
                                    ]}
                                    onPress={() => handleSportSelect(item.id)}
                                >
                                    <Ionicons
                                        name={item.icon as any}
                                        size={16}
                                        color={selectedSport === item.id ? "#fff" : "#9CA3AF"}
                                    />
                                    <Text style={[
                                        styles.filterLabel,
                                        selectedSport === item.id && styles.filterLabelActive
                                    ]}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>

                    {/* Results Count */}
                    {!loading && courts.length > 0 && (
                        <View style={styles.resultsHeader}>
                            <Text style={styles.resultsCount}>{courts.length} courts found</Text>
                            {userLocation && (
                                <Text style={styles.locationText}>
                                    <Ionicons name="location" size={12} color="#6B7280" /> Within 15 km
                                </Text>
                            )}
                        </View>
                    )}

                    {/* Loading State */}
                    {loading && courts.length === 0 && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#8B5CF6" />
                            <Text style={styles.loadingText}>Finding courts near you...</Text>
                        </View>
                    )}

                    {/* Error State */}
                    {error && courts.length === 0 && (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle-outline" size={48} color="#6B7280" />
                            <Text style={styles.errorText}>{error}</Text>
                            <TouchableOpacity style={styles.retryButton} onPress={loadCourts}>
                                <Text style={styles.retryText}>Try Again</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Courts List */}
                    {!loading && courts.length > 0 && (
                        <FlatList
                            data={courts}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <CourtCard court={item} onPress={() => handleCourtPress(item)} />
                            )}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={handleRefresh}
                                    tintColor="#8B5CF6"
                                />
                            }
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.listContent}
                        />
                    )}

                    {/* Empty State */}
                    {!loading && !error && courts.length === 0 && (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="basketball-outline" size={64} color="#333" />
                            <Text style={styles.emptyTitle}>No courts found</Text>
                            <Text style={styles.emptyText}>
                                Try expanding your search or changing the sport filter
                            </Text>
                        </View>
                    )}
                </SafeAreaView>
            </LinearGradient>
        </>
    )
}

// Court Card Component
function CourtCard({ court, onPress }: { court: DiscoveredVenue; onPress: () => void }) {
    // Determine activity status color
    const getActivityColor = () => {
        if (court.needsPlayers) return "#22C55E" // Active - needs players
        if (court.currentOccupancy === "busy" || court.currentOccupancy === "packed") return "#F97316"
        return "#6B7280" // Unknown/quiet
    }

    const getActivityLabel = () => {
        if (court.needsPlayers) return "Looking for players"
        if (court.currentOccupancy === "busy") return "Busy now"
        if (court.currentOccupancy === "packed") return "Very busy"
        return "Check activity"
    }

    return (
        <TouchableOpacity style={styles.courtCard} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.courtHeader}>
                <View style={styles.courtTitleRow}>
                    <Text style={styles.courtName} numberOfLines={1}>{court.name}</Text>
                    {court.isFree && (
                        <View style={styles.freeBadge}>
                            <Text style={styles.freeText}>Free</Text>
                        </View>
                    )}
                </View>
                <View style={styles.courtMeta}>
                    <Text style={styles.courtDistance}>{court.distance?.toFixed(1)} mi</Text>
                    <View style={styles.dot} />
                    <Text style={styles.courtType}>{court.isOutdoor ? "Outdoor" : "Indoor"}</Text>
                </View>
            </View>

            {/* Activity Indicator */}
            <View style={styles.activityRow}>
                <View style={[styles.activityDot, { backgroundColor: getActivityColor() }]} />
                <Text style={[styles.activityLabel, { color: getActivityColor() }]}>
                    {getActivityLabel()}
                </Text>
                <Ionicons name="chevron-forward" size={18} color="#6B7280" />
            </View>
        </TouchableOpacity>
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
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#1A1A1A",
        alignItems: "center",
        justifyContent: "center",
    },
    headerContent: {
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#fff",
    },
    liveBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginTop: 2,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#22C55E",
    },
    liveText: {
        fontSize: 11,
        color: "#22C55E",
        fontWeight: "600",
    },
    mapButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#1A1A1A",
        alignItems: "center",
        justifyContent: "center",
    },
    filtersContainer: {
        marginBottom: 8,
    },
    filtersList: {
        paddingHorizontal: 16,
        gap: 8,
    },
    filterChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: "#1A1A1A",
        borderWidth: 1,
        borderColor: "#333",
    },
    filterChipActive: {
        backgroundColor: "#8B5CF6",
        borderColor: "#8B5CF6",
    },
    filterLabel: {
        fontSize: 13,
        color: "#9CA3AF",
        fontWeight: "500",
    },
    filterLabelActive: {
        color: "#fff",
    },
    resultsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    resultsCount: {
        fontSize: 15,
        color: "#fff",
        fontWeight: "600",
    },
    locationText: {
        fontSize: 13,
        color: "#6B7280",
    },
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
    },
    loadingText: {
        fontSize: 15,
        color: "#6B7280",
    },
    errorContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: 40,
    },
    errorText: {
        fontSize: 15,
        color: "#6B7280",
        textAlign: "center",
    },
    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: "#8B5CF6",
        borderRadius: 12,
        marginTop: 8,
    },
    retryText: {
        fontSize: 15,
        color: "#fff",
        fontWeight: "600",
    },
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#fff",
    },
    emptyText: {
        fontSize: 14,
        color: "#6B7280",
        textAlign: "center",
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    courtCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#262626",
    },
    courtHeader: {
        marginBottom: 12,
    },
    courtTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 4,
    },
    courtName: {
        fontSize: 17,
        fontWeight: "600",
        color: "#fff",
        flex: 1,
        marginRight: 8,
    },
    freeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        backgroundColor: "rgba(34, 197, 94, 0.15)",
        borderRadius: 6,
    },
    freeText: {
        fontSize: 11,
        color: "#22C55E",
        fontWeight: "600",
    },
    courtMeta: {
        flexDirection: "row",
        alignItems: "center",
    },
    courtDistance: {
        fontSize: 13,
        color: "#9CA3AF",
    },
    courtType: {
        fontSize: 13,
        color: "#9CA3AF",
    },
    dot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: "#6B7280",
        marginHorizontal: 8,
    },
    activityRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#262626",
    },
    activityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    activityLabel: {
        fontSize: 14,
        fontWeight: "500",
        flex: 1,
    },
})
