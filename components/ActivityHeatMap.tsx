import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps'
import { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/lib/design-tokens'
import { venueService } from '@/lib/services/venue-service'
import { useLocation } from '@/lib/location-context'
import * as Haptics from 'expo-haptics'

const { width } = Dimensions.get('window')

interface VenueWithActivity {
    id: string
    name: string
    lat: number
    lng: number
    sport: string
    activePlayersNow: number
    city?: string
    country?: string
}

interface CityCluster {
    city: string
    country: string
    lat: number
    lng: number
    venueCount: number
    totalPlayers: number
    venues: VenueWithActivity[]
}

type ViewMode = 'global' | 'local'

export function ActivityHeatMap({ height = 300, onMarkerPress }: {
    height?: number
    onMarkerPress?: (venue: VenueWithActivity) => void
}) {
    const [viewMode, setViewMode] = useState<ViewMode>('local')
    const [venues, setVenues] = useState<VenueWithActivity[]>([])
    const [cityClusters, setCityClusters] = useState<CityCluster[]>([])
    const [region, setRegion] = useState<Region>({
        latitude: 40.7128,
        longitude: -74.0060,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    })
    const { location } = useLocation()

    useEffect(() => {
        loadActivityData()
        const interval = setInterval(loadActivityData, 30000) // Update every 30s
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (viewMode === 'local' && location) {
            // Zoom to user location
            setRegion({
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
            })
        } else if (viewMode === 'global') {
            // Zoom out to world view
            setRegion({
                latitude: 20,
                longitude: 0,
                latitudeDelta: 100,
                longitudeDelta: 100,
            })
        }
    }, [viewMode, location])

    const loadActivityData = async () => {
        const data = await venueService.getVenuesWithActivity()
        setVenues(data)

        // Create city clusters for global view
        const clusters = createCityClusters(data)
        setCityClusters(clusters)
    }

    const createCityClusters = (venues: VenueWithActivity[]): CityCluster[] => {
        const cityMap = new Map<string, CityCluster>()

        venues.forEach(venue => {
            const cityKey = `${venue.city || 'Unknown'}, ${venue.country || 'Unknown'}`

            if (!cityMap.has(cityKey)) {
                cityMap.set(cityKey, {
                    city: venue.city || 'Unknown',
                    country: venue.country || 'Unknown',
                    lat: venue.lat,
                    lng: venue.lng,
                    venueCount: 0,
                    totalPlayers: 0,
                    venues: [],
                })
            }

            const cluster = cityMap.get(cityKey)!
            cluster.venueCount++
            cluster.totalPlayers += venue.activePlayersNow || 0
            cluster.venues.push(venue)
        })

        return Array.from(cityMap.values())
    }

    const getMarkerColor = (playerCount: number): string => {
        if (playerCount >= 10) return '#FF0000' // Red - Hot
        if (playerCount >= 5) return '#FF8C00'  // Orange - Warm
        if (playerCount >= 3) return '#FFD700'  // Yellow
        if (playerCount >= 1) return colors.primary // Green
        return '#999999' // Gray - Inactive
    }

    const handleToggleView = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        setViewMode(prev => prev === 'global' ? 'local' : 'global')
    }

    const handleCityPress = (cluster: CityCluster) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        // Zoom into city
        setRegion({
            latitude: cluster.lat,
            longitude: cluster.lng,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
        })
        setViewMode('local')
    }

    const handleVenuePress = (venue: VenueWithActivity) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        onMarkerPress?.(venue)
    }

    const totalActivePlayers = venues.reduce((sum, v) => sum + (v.activePlayersNow || 0), 0)

    return (
        <View>
            {/* Toggle Button */}
            <View style={styles.toggleContainer}>
                <TouchableOpacity
                    style={[styles.toggleButton, viewMode === 'local' && styles.toggleButtonActive]}
                    onPress={handleToggleView}
                >
                    <Ionicons
                        name="location"
                        size={16}
                        color={viewMode === 'local' ? '#000' : colors.textSecondary}
                    />
                    <Text style={[
                        styles.toggleText,
                        viewMode === 'local' && styles.toggleTextActive
                    ]}>
                        Local
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.toggleButton, viewMode === 'global' && styles.toggleButtonActive]}
                    onPress={handleToggleView}
                >
                    <Ionicons
                        name="globe"
                        size={16}
                        color={viewMode === 'global' ? '#000' : colors.textSecondary}
                    />
                    <Text style={[
                        styles.toggleText,
                        viewMode === 'global' && styles.toggleTextActive
                    ]}>
                        Global
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Map */}
            <MapView
                provider={PROVIDER_GOOGLE}
                style={{ height, borderRadius: 16, marginTop: 8 }}
                region={region}
                onRegionChangeComplete={setRegion}
            >
                {viewMode === 'global' ? (
                    // Show city clusters
                    cityClusters.map((cluster, index) => (
                        <Marker
                            key={`cluster-${index}`}
                            coordinate={{ latitude: cluster.lat, longitude: cluster.lng }}
                            onPress={() => handleCityPress(cluster)}
                        >
                            <View style={[
                                styles.clusterMarker,
                                { backgroundColor: getMarkerColor(cluster.totalPlayers) }
                            ]}>
                                <Text style={styles.clusterCount}>{cluster.totalPlayers}</Text>
                                <Text style={styles.clusterCity}>{cluster.city}</Text>
                            </View>
                        </Marker>
                    ))
                ) : (
                    // Show individual venues
                    venues.map(venue => (
                        <Marker
                            key={venue.id}
                            coordinate={{ latitude: venue.lat, longitude: venue.lng }}
                            onPress={() => handleVenuePress(venue)}
                        >
                            <View style={[
                                styles.venueMarker,
                                { backgroundColor: getMarkerColor(venue.activePlayersNow || 0) }
                            ]}>
                                <Ionicons name="people" size={12} color="#fff" />
                                <Text style={styles.venueCount}>{venue.activePlayersNow || 0}</Text>
                            </View>
                        </Marker>
                    ))
                )}
            </MapView>

            {/* Stats Bar */}
            <View style={styles.statsBar}>
                <View style={styles.statItem}>
                    <Ionicons name="people" size={16} color={colors.primary} />
                    <Text style={styles.statText}>{totalActivePlayers} active</Text>
                </View>
                <View style={styles.statItem}>
                    <Ionicons name="location" size={16} color={colors.primary} />
                    <Text style={styles.statText}>{venues.length} venues</Text>
                </View>
                {viewMode === 'global' && (
                    <View style={styles.statItem}>
                        <Ionicons name="globe" size={16} color={colors.primary} />
                        <Text style={styles.statText}>{cityClusters.length} cities</Text>
                    </View>
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: colors.bgSecondary,
        borderRadius: 12,
        padding: 4,
    },
    toggleButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    toggleButtonActive: {
        backgroundColor: colors.primary,
    },
    toggleText: {
        marginLeft: 6,
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    toggleTextActive: {
        color: '#000',
    },
    clusterMarker: {
        borderRadius: 20,
        padding: 8,
        minWidth: 60,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    clusterCount: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    clusterCity: {
        color: '#fff',
        fontSize: 10,
        marginTop: 2,
    },
    venueMarker: {
        borderRadius: 16,
        padding: 6,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    venueCount: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
        marginLeft: 4,
    },
    statsBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 12,
        paddingVertical: 8,
        backgroundColor: colors.bgSecondary,
        borderRadius: 12,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statText: {
        marginLeft: 6,
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '600',
    },
})
