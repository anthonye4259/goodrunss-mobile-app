
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useUserLocation } from '@/lib/services/location-service';
import { venueService } from '@/lib/services/venue-service';
import { useUserPreferences } from '@/lib/user-preferences';
import { VenueListCard } from '@/components/Live/VenueListCard'; // Reusing this properly
import PagerView from 'react-native-pager-view';

const { width, height } = Dimensions.get('window');

// Optimization: Memoized Marker Component
const VenueMarker = React.memo(({ venue, selected, onPress }: { venue: any, selected: boolean, onPress: (v: any) => void }) => {
    // Optimization: Stop tracking view changes after initial render unless selected
    // This dramatically improves performance for many markers
    const [tracksViewChanges, setTracksViewChanges] = useState(true);

    useEffect(() => {
        if (tracksViewChanges) {
            // Stop tracking after 500ms (enough for image load/render)
            const timer = setTimeout(() => {
                setTracksViewChanges(false);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [tracksViewChanges]);

    useEffect(() => {
        // Re-enable tracking if selection changes (to animate size)
        setTracksViewChanges(true);
    }, [selected]);

    return (
        <Marker
            coordinate={{ latitude: venue.lat, longitude: venue.lng }}
            onPress={() => onPress(venue)}
            tracksViewChanges={tracksViewChanges}
            tracksInfoWindowChanges={false}
        >
            <View style={[styles.markerContainer, selected && styles.markerSelected]}>
                <View style={[
                    styles.markerDot,
                    { backgroundColor: venue.activePlayersNow > 5 ? '#EF4444' : venue.activePlayersNow > 0 ? '#EAB308' : '#22C55E' }
                ]} />
            </View>
            {selected && (
                <View style={styles.callout}>
                    <Text style={styles.calloutText}>{venue.name}</Text>
                </View>
            )}
        </Marker>
    );
});

const MAP_STYLE = [
    {
        "elementType": "geometry",
        "stylers": [{ "color": "#212121" }]
    },
    {
        "elementType": "labels.icon",
        "stylers": [{ "visibility": "off" }]
    },
    {
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#757575" }]
    },
    {
        "elementType": "labels.text.stroke",
        "stylers": [{ "color": "#212121" }]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry",
        "stylers": [{ "color": "#757575" }]
    },
    {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [{ "color": "#181818" }]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [{ "color": "#181818" }]
    },
    {
        "featureType": "road",
        "elementType": "geometry.fill",
        "stylers": [{ "color": "#2c2c2c" }]
    },
    {
        "featureType": "road",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#8a8a8a" }]
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [{ "color": "#000000" }]
    }
];

export default function ExploreScreen() {
    const mapRef = useRef<MapView>(null);
    const { location } = useUserLocation();
    const { preferences } = useUserPreferences();
    const [venues, setVenues] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
    const [searchText, setSearchText] = useState("");

    // Initial Region (NYC Default)
    const [region, setRegion] = useState({
        latitude: 40.7829,
        longitude: -73.9654,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    });

    useEffect(() => {
        if (location) {
            const newRegion = {
                latitude: location.lat,
                longitude: location.lng,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            };
            setRegion(newRegion);
            mapRef.current?.animateToRegion(newRegion, 1000);
            loadVenues(location.lat, location.lng);
        } else {
            loadVenues(region.latitude, region.longitude);
        }
    }, [location]); // preferences.primaryActivity could be another dep

    const loadVenues = async (lat: number, lng: number) => {
        setLoading(true);
        try {
            // Fetch real venues (or mock if service fails)
            const results = await venueService.getVenuesNearby({ coords: { latitude: lat, longitude: lng } } as any, 20, preferences.primaryActivity || 'Basketball');
            setVenues(results);
        } catch (err) {
            console.log("Error loading venues", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchArea = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        loadVenues(region.latitude, region.longitude);
    };

    const handleMarkerPress = (venue: any) => {
        Haptics.selectionAsync();
        setSelectedVenueId(venue.id);
        // Find index for pager scroll
    };

    // Optimization: Only render venues within the current viewport (plus margin)
    const visibleVenues = React.useMemo(() => {
        if (!region || venues.length === 0) return [];

        // Simple bounding box with margin
        const margin = 0.05; // ~5km margin
        const minLat = region.latitude - (region.latitudeDelta / 2) - margin;
        const maxLat = region.latitude + (region.latitudeDelta / 2) + margin;
        const minLng = region.longitude - (region.longitudeDelta / 2) - margin;
        const maxLng = region.longitude + (region.longitudeDelta / 2) + margin;

        return venues.filter(v =>
            v.lat >= minLat && v.lat <= maxLat &&
            v.lng >= minLng && v.lng <= maxLng
        );
    }, [venues, region]);

    return (
        <View style={styles.container}>
            {/* Map Background */}
            <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFill}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
                customMapStyle={MAP_STYLE}
                initialRegion={region}
                onRegionChangeComplete={(r) => {
                    // Debounce or just set state (React Native Maps is usually optimized for this)
                    // We set it here to trigger the visibleVenues recalculation
                    setRegion(r);
                }}
                showsUserLocation
                showsCompass={false}
            // Optimization: Reduce frequency of updates if needed
            // maxZoomLevel={18}
            >
                {visibleVenues.map(venue => (
                    <VenueMarker
                        key={venue.id}
                        venue={venue}
                        selected={selectedVenueId === venue.id}
                        onPress={handleMarkerPress}
                    />
                ))}
            </MapView>

            <LinearGradient
                colors={['rgba(0,0,0,0.8)', 'transparent']}
                style={styles.topGradient}
            >
                <SafeAreaView edges={['top']}>
                    <View style={styles.searchContainer}>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="search" size={20} color="#999" />
                            <TextInput
                                style={styles.input}
                                placeholder="Search locations..."
                                placeholderTextColor="#999"
                                value={searchText}
                                onChangeText={setSearchText}
                                returnKeyType="search"
                            />
                        </View>
                        <TouchableOpacity style={styles.filterBtn}>
                            <Ionicons name="options" size={20} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            {/* Floating Action Buttons */}
            <View style={styles.fabContainer}>
                <TouchableOpacity style={styles.searchAreaBtn} onPress={handleSearchArea}>
                    {loading ? <ActivityIndicator color="#000" size="small" /> : (
                        <>
                            <Ionicons name="refresh" size={16} color="#000" />
                            <Text style={styles.searchAreaText}>Search this Area</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* Crowdsource FAB */}
            <TouchableOpacity
                style={styles.addVenueFab}
                onPress={() => router.push('/venues/add')}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={['#7ED957', '#4C9E29']}
                    style={styles.fabGradient}
                >
                    <Ionicons name="add" size={28} color="#000" />
                </LinearGradient>
            </TouchableOpacity>

            {/* Venue Carousel (Bottom) */}
            {venues.length > 0 && (
                <View style={styles.carouselContainer}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
                        snapToInterval={width - 40}
                        decelerationRate="fast"
                    >
                        {venues.map((venue) => (
                            <TouchableOpacity
                                key={venue.id}
                                style={styles.cardWrapper}
                                activeOpacity={0.9}
                                onPress={() => router.push(`/venues/${venue.id}`)}
                            >
                                <VenueListCard venue={venue} onPress={() => router.push(`/venues/${venue.id}`)} />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    topGradient: { position: 'absolute', top: 0, left: 0, right: 0, paddingBottom: 40 },
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 10,
        gap: 12
    },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(30,30,30,0.9)',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#333'
    },
    input: {
        flex: 1,
        color: '#FFF',
        marginLeft: 10,
        fontSize: 16
    },
    filterBtn: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(30,30,30,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#333'
    },

    // Markers
    markerContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#FFF'
    },
    markerSelected: {
        transform: [{ scale: 1.2 }],
        borderColor: '#7ED957',
        backgroundColor: '#000'
    },
    markerDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    callout: {
        position: 'absolute',
        bottom: 30,
        backgroundColor: '#FFF',
        padding: 4,
        borderRadius: 4,
        width: 100,
        alignItems: 'center'
    },
    calloutText: { fontSize: 10, fontWeight: 'bold' },

    // FAB
    fabContainer: {
        position: 'absolute',
        top: 130,
        alignSelf: 'center',
        zIndex: 10
    },
    searchAreaBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 25,
        gap: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    searchAreaText: { fontWeight: 'bold', fontSize: 12 },

    // Carousel
    carouselContainer: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        height: 140, // Height of VenueListCard roughly
    },
    cardWrapper: {
        width: width - 60,
    },

    // Add Venue FAB
    addVenueFab: {
        position: 'absolute',
        right: 20,
        bottom: 200, // Above carousel
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    fabGradient: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center'
    }
});
