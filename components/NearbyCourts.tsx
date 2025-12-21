/**
 * NearbyCourtsList - Clean Court Finder
 * 
 * Standalone value: Works even with zero users.
 * Premium, minimal design.
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
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import * as Location from "expo-location"
import {
    discoverVenues,
    type DiscoveredVenue
} from "@/lib/services/global-discovery-service"

// ============================================
// TYPES
// ============================================

interface NearbyCourtListProps {
    sport?: string
    limit?: number
    onCourtPress?: (court: DiscoveredVenue) => void
    showHeader?: boolean
}

// ============================================
// MAIN COMPONENT
// ============================================

export function NearbyCourts({
    sport = "basketball",
    limit = 20,
    onCourtPress,
    showHeader = true,
}: NearbyCourtListProps) {
    const [courts, setCourts] = useState<DiscoveredVenue[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadCourts()
    }, [sport])

    const loadCourts = async () => {
        try {
            setLoading(true)
            setError(null)

            // Get user location
            const { status } = await Location.requestForegroundPermissionsAsync()

            let lat = 40.7128 // Default: NYC
            let lng = -74.0060

            if (status === "granted") {
                const location = await Location.getCurrentPositionAsync({})
                lat = location.coords.latitude
                lng = location.coords.longitude
            }

            // Discover courts
            const discovered = await discoverVenues(lat, lng, sport, 15)
            setCourts(discovered.slice(0, limit))
        } catch (err) {
            console.error("[NearbyCourts] Error:", err)
            setError("Couldn't load courts")
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    const handleRefresh = useCallback(() => {
        setRefreshing(true)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        loadCourts()
    }, [sport])

    const handleCourtPress = (court: DiscoveredVenue) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        if (onCourtPress) {
            onCourtPress(court)
        } else {
            router.push(`/venues/${court.id}`)
        }
    }

    if (loading && courts.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.loadingText}>Finding courts...</Text>
            </View>
        )
    }

    if (error && courts.length === 0) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={32} color="#6B7280" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadCourts}>
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            {showHeader && (
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Nearby</Text>
                    <Text style={styles.headerCount}>{courts.length}</Text>
                </View>
            )}

            <FlatList
                data={courts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <CourtRow court={item} onPress={() => handleCourtPress(item)} />
                )}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor="#fff"
                    />
                }
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
            />
        </View>
    )
}

// ============================================
// COURT ROW
// ============================================

function CourtRow({
    court,
    onPress
}: {
    court: DiscoveredVenue
    onPress: () => void
}) {
    return (
        <TouchableOpacity
            style={styles.courtRow}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.courtInfo}>
                <Text style={styles.courtName} numberOfLines={1}>
                    {court.name}
                </Text>
                <View style={styles.courtMeta}>
                    <Text style={styles.courtDistance}>
                        {court.distance?.toFixed(1)} mi
                    </Text>
                    <View style={styles.dot} />
                    <Text style={styles.courtType}>
                        {court.isOutdoor ? "Outdoor" : "Indoor"}
                    </Text>
                    {court.isFree && (
                        <>
                            <View style={styles.dot} />
                            <Text style={styles.courtFree}>Free</Text>
                        </>
                    )}
                </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#6B7280" />
        </TouchableOpacity>
    )
}

// ============================================
// COMPACT LIST (for home screen)
// ============================================

export function NearbyCourtsCompact({
    sport = "basketball",
    onSeeAll
}: {
    sport?: string
    onSeeAll?: () => void
}) {
    const [courts, setCourts] = useState<DiscoveredVenue[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadCourts()
    }, [sport])

    const loadCourts = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync()
            let lat = 40.7128, lng = -74.0060

            if (status === "granted") {
                const location = await Location.getCurrentPositionAsync({})
                lat = location.coords.latitude
                lng = location.coords.longitude
            }

            const discovered = await discoverVenues(lat, lng, sport, 10)
            setCourts(discovered.slice(0, 3))
        } catch (err) {
            console.error("[NearbyCourtsCompact] Error:", err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <View style={styles.compactLoading}>
                <ActivityIndicator size="small" color="#6B7280" />
            </View>
        )
    }

    return (
        <View style={styles.compactContainer}>
            <View style={styles.compactHeader}>
                <Text style={styles.compactTitle}>Courts nearby</Text>
                {onSeeAll && (
                    <TouchableOpacity onPress={onSeeAll}>
                        <Text style={styles.compactSeeAll}>See all</Text>
                    </TouchableOpacity>
                )}
            </View>

            {courts.map((court) => (
                <TouchableOpacity
                    key={court.id}
                    style={styles.compactRow}
                    onPress={() => router.push(`/venues/${court.id}`)}
                >
                    <Text style={styles.compactName} numberOfLines={1}>
                        {court.name}
                    </Text>
                    <Text style={styles.compactDistance}>
                        {court.distance?.toFixed(1)} mi
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    )
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        padding: 40,
        alignItems: "center",
        gap: 12,
    },
    loadingText: {
        color: "#6B7280",
        fontSize: 14,
    },
    errorContainer: {
        padding: 40,
        alignItems: "center",
        gap: 12,
    },
    errorText: {
        color: "#6B7280",
        fontSize: 14,
    },
    retryButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: "#1A1A1A",
        borderRadius: 8,
    },
    retryText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#fff",
    },
    headerCount: {
        fontSize: 15,
        color: "#6B7280",
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    courtRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
    },
    courtInfo: {
        flex: 1,
        marginRight: 12,
    },
    courtName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
        marginBottom: 4,
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
    courtFree: {
        fontSize: 13,
        color: "#22C55E",
    },
    dot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: "#6B7280",
        marginHorizontal: 8,
    },
    // Compact
    compactContainer: {
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
    },
    compactLoading: {
        padding: 20,
        alignItems: "center",
    },
    compactHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    compactTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: "#fff",
    },
    compactSeeAll: {
        fontSize: 13,
        color: "#8B5CF6",
    },
    compactRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: "#333",
    },
    compactName: {
        fontSize: 14,
        color: "#D1D5DB",
        flex: 1,
        marginRight: 12,
    },
    compactDistance: {
        fontSize: 13,
        color: "#6B7280",
    },
})
