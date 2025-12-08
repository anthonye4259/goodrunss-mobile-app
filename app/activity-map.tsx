import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useUserPreferences } from "@/lib/user-preferences"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import { SafeAreaView } from "react-native-safe-area-context"
import { useState } from "react"
import MapView, { Marker, Circle, PROVIDER_DEFAULT } from "react-native-maps"

const { width, height } = Dimensions.get("window")

// Mock activity data points
const activityPoints = [
    { id: 1, lat: 40.7589, lng: -73.9851, activity: "Basketball", players: 8, intensity: "high" },
    { id: 2, lat: 40.7614, lng: -73.9776, activity: "Tennis", players: 4, intensity: "medium" },
    { id: 3, lat: 40.7549, lng: -73.9840, activity: "Running", players: 12, intensity: "high" },
    { id: 4, lat: 40.7505, lng: -73.9934, activity: "Yoga", players: 15, intensity: "low" },
    { id: 5, lat: 40.7484, lng: -73.9857, activity: "Basketball", players: 6, intensity: "medium" },
    { id: 6, lat: 40.7580, lng: -73.9855, activity: "Soccer", players: 22, intensity: "high" },
]

const getIntensityColor = (intensity: string) => {
    switch (intensity) {
        case "high": return "rgba(239, 68, 68, 0.4)"
        case "medium": return "rgba(251, 191, 36, 0.4)"
        case "low": return "rgba(126, 217, 87, 0.4)"
        default: return "rgba(126, 217, 87, 0.4)"
    }
}

const getActivityIcon = (activity: string) => {
    switch (activity.toLowerCase()) {
        case "basketball": return "basketball"
        case "tennis": return "tennisball"
        case "running": return "walk"
        case "yoga": return "body"
        case "soccer": return "football"
        default: return "fitness"
    }
}

export default function ActivityMapScreen() {
    const { preferences } = useUserPreferences()
    const [selectedPoint, setSelectedPoint] = useState<typeof activityPoints[0] | null>(null)
    const [mapReady, setMapReady] = useState(false)

    const handleBack = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        router.back()
    }

    const handleMarkerPress = (point: typeof activityPoints[0]) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        setSelectedPoint(point)
    }

    const initialRegion = {
        latitude: 40.7549,
        longitude: -73.9840,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
    }

    return (
        <View style={styles.container}>
            {/* Map */}
            <MapView
                style={styles.map}
                provider={PROVIDER_DEFAULT}
                initialRegion={initialRegion}
                showsUserLocation
                showsMyLocationButton={false}
                onMapReady={() => setMapReady(true)}
                customMapStyle={darkMapStyle}
            >
                {mapReady && activityPoints.map((point) => (
                    <View key={point.id}>
                        {/* Activity heat circle */}
                        <Circle
                            center={{ latitude: point.lat, longitude: point.lng }}
                            radius={200}
                            fillColor={getIntensityColor(point.intensity)}
                            strokeColor="transparent"
                        />
                        {/* Marker */}
                        <Marker
                            coordinate={{ latitude: point.lat, longitude: point.lng }}
                            onPress={() => handleMarkerPress(point)}
                        >
                            <View style={[
                                styles.markerContainer,
                                selectedPoint?.id === point.id && styles.markerSelected
                            ]}>
                                <Ionicons
                                    name={getActivityIcon(point.activity) as any}
                                    size={20}
                                    color="#FFFFFF"
                                />
                            </View>
                        </Marker>
                    </View>
                ))}
            </MapView>

            {/* Header Overlay */}
            <SafeAreaView style={styles.headerOverlay} edges={["top"]}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Live Activity Map</Text>
                    <TouchableOpacity style={styles.filterButton}>
                        <Ionicons name="filter" size={24} color="#7ED957" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* Legend */}
            <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: "rgba(239, 68, 68, 0.8)" }]} />
                    <Text style={styles.legendText}>High Activity</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: "rgba(251, 191, 36, 0.8)" }]} />
                    <Text style={styles.legendText}>Medium</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: "rgba(126, 217, 87, 0.8)" }]} />
                    <Text style={styles.legendText}>Low</Text>
                </View>
            </View>

            {/* Selected Point Info Card */}
            {selectedPoint && (
                <View style={styles.infoCard}>
                    <View style={styles.infoHeader}>
                        <View style={styles.infoIconContainer}>
                            <Ionicons
                                name={getActivityIcon(selectedPoint.activity) as any}
                                size={24}
                                color="#7ED957"
                            />
                        </View>
                        <View style={styles.infoText}>
                            <Text style={styles.infoTitle}>{selectedPoint.activity}</Text>
                            <Text style={styles.infoSubtitle}>
                                {selectedPoint.players} players active now
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setSelectedPoint(null)}
                        >
                            <Ionicons name="close" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.infoActions}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                                router.push("/(tabs)/explore")
                            }}
                        >
                            <Ionicons name="navigate" size={18} color="#000" />
                            <Text style={styles.actionButtonText}>Get Directions</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                router.push("/need-players")
                            }}
                        >
                            <Ionicons name="people" size={18} color="#7ED957" />
                            <Text style={styles.secondaryButtonText}>Join Game</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Stats Summary */}
            <View style={styles.statsBar}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>67</Text>
                    <Text style={styles.statLabel}>Active Now</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>12</Text>
                    <Text style={styles.statLabel}>Locations</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>5</Text>
                    <Text style={styles.statLabel}>Near You</Text>
                </View>
            </View>
        </View>
    )
}

// Dark map style for consistency with app theme
const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#1d1d1d" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#2c2c2c" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212121" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e0e0e" }] },
    { featureType: "poi", stylers: [{ visibility: "off" }] },
    { featureType: "transit", stylers: [{ visibility: "off" }] },
]

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0A0A0A",
    },
    map: {
        width: width,
        height: height,
    },
    headerOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(26, 26, 26, 0.9)",
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    filterButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(26, 26, 26, 0.9)",
        alignItems: "center",
        justifyContent: "center",
    },
    legendContainer: {
        position: "absolute",
        top: 120,
        right: 16,
        backgroundColor: "rgba(26, 26, 26, 0.9)",
        borderRadius: 12,
        padding: 12,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    legendText: {
        fontSize: 12,
        color: "#9CA3AF",
    },
    markerContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#7ED957",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 3,
        borderColor: "#FFFFFF",
    },
    markerSelected: {
        backgroundColor: "#65A30D",
        transform: [{ scale: 1.2 }],
    },
    infoCard: {
        position: "absolute",
        bottom: 180,
        left: 16,
        right: 16,
        backgroundColor: "rgba(26, 26, 26, 0.95)",
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: "#252525",
    },
    infoHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    infoIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "rgba(126, 217, 87, 0.2)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    infoText: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    infoSubtitle: {
        fontSize: 14,
        color: "#9CA3AF",
        marginTop: 2,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#252525",
        alignItems: "center",
        justifyContent: "center",
    },
    infoActions: {
        flexDirection: "row",
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#7ED957",
        borderRadius: 12,
        paddingVertical: 12,
        gap: 8,
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#000000",
    },
    secondaryButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
        borderRadius: 12,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: "#7ED957",
        gap: 8,
    },
    secondaryButtonText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#7ED957",
    },
    statsBar: {
        position: "absolute",
        bottom: 100,
        left: 16,
        right: 16,
        backgroundColor: "rgba(26, 26, 26, 0.95)",
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#252525",
    },
    statItem: {
        alignItems: "center",
    },
    statValue: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#7ED957",
    },
    statLabel: {
        fontSize: 12,
        color: "#9CA3AF",
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        height: 32,
        backgroundColor: "#252525",
    },
})
