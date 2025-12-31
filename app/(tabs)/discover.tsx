/**
 * Discovery Page
 * 
 * Scrollable sections for finding venues, trainers, and players nearby
 * Features:
 * - Location header with city display
 * - Horizontal scrollable sections (like Uber Eats)
 * - Global map with heat map
 */

import React, { useState, useEffect, useRef, useCallback } from "react"
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Image,
    FlatList,
    Dimensions,
    ActivityIndicator,
    RefreshControl,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import MapView, { Marker, Heatmap, PROVIDER_DEFAULT } from "react-native-maps"

import { useUserPreferences } from "@/lib/user-preferences"
import { useLocation } from "@/lib/location-context"
import { venueService } from "@/lib/services/venue-service"
import { PremiumVisibilityCard } from "@/components/Premium/PremiumVisibilityCard"
import { LiveTrafficBadge } from "@/components/Live/LiveTrafficBadge"
import { SwipeReportCard } from "@/components/Live/SwipeReportCard"
import { QuickReportSheet } from "@/components/QuickReportSheet"
import { SectionSkeleton, VenueCardSkeleton } from "@/components/ui/Skeleton"
import { EmptyState, EMPTY_STATE_PRESETS } from "@/components/ui/EmptyState"
import { GiaEmptyState } from "@/components/GIA/GiaEmptyState"
import { LocalTrainerSpotlight } from "@/components/LocalTrainerSpotlight"
import { getLaunchCity } from "@/lib/launch-cities"

const { width: SCREEN_WIDTH } = Dimensions.get("window")
const CARD_WIDTH = SCREEN_WIDTH * 0.7
const CARD_SPACING = 12

// Phase 1 cities for heat map
const PHASE_1_CITIES = [
    { name: "Atlanta", lat: 33.749, lng: -84.388, intensity: 0.9 },
    { name: "Miami", lat: 25.7617, lng: -80.1918, intensity: 0.85 },
    { name: "New York", lat: 40.7128, lng: -74.006, intensity: 0.95 },
    { name: "Los Angeles", lat: 34.0522, lng: -118.2437, intensity: 0.88 },
    { name: "Chicago", lat: 41.8781, lng: -87.6298, intensity: 0.82 },
    { name: "Houston", lat: 29.7604, lng: -95.3698, intensity: 0.85 },
    { name: "Dallas", lat: 32.7767, lng: -96.7970, intensity: 0.84 },
]

// Authorized mock data for warm leads
const WARM_LEADS_DATA = [
    { id: "l1", name: "Alex Turner", sport: "Tennis", level: 4.2, signal: "Viewed your profile 2x", isHot: true },
    { id: "l2", name: "Maya Chen", sport: "Tennis", level: 3.8, signal: "Checked availability", isHot: true },
    { id: "l3", name: "David Park", sport: "Pickleball", level: 3.5, signal: "Searched trainers nearby", isHot: false },
    { id: "l4", name: "Sarah Kim", sport: "Tennis", level: 4.0, signal: "Added you to favorites", isHot: true },
]

export default function DiscoverScreen() {
    const { preferences } = useUserPreferences()
    const { location } = useLocation()
    const [refreshing, setRefreshing] = useState(false)
    const mapRef = useRef<MapView>(null)

    const userCity = preferences.city || "Your City"
    const userState = preferences.state || ""
    const isPhase1 = preferences.isPhase1City
    // Detect if user is trainer or facility
    const userType = preferences.userType || "player" // "player" | "trainer" | "facility"
    const isTrainer = userType === "trainer"
    const isFacility = userType === "facility"

    // State for real data
    const [nearbyVenues, setNearbyVenues] = useState<any[]>([])
    const [trendingVenues, setTrendingVenues] = useState<any[]>([])
    const [giaOpenFacilities, setGiaOpenFacilities] = useState<any[]>([])
    const [trainers, setTrainers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Quick Report Sheet state
    const [reportVenue, setReportVenue] = useState<{ id: string; name: string } | null>(null)

    useEffect(() => {
        loadData()
    }, [location])

    const loadData = async () => {
        setLoading(true)
        try {
            // Fetch real venues depending on user location
            // Adapt location context (latitude/longitude) to service format (lat/lng)
            const lat = location?.latitude || 33.749
            const lng = location?.longitude || -84.388

            const venues = await venueService.getVenuesNearby({ lat, lng })

            // Fallback demo venues if service returns empty
            const FALLBACK_VENUES = [
                { id: "demo1", name: "Piedmont Park Courts", sport: "Tennis", distance: 0.8, rating: 4.7, activePlayersNow: 4, crowdLevel: "active" },
                { id: "demo2", name: "Chastain Park Tennis", sport: "Tennis", distance: 1.2, rating: 4.9, activePlayersNow: 6, crowdLevel: "busy" },
                { id: "demo3", name: "Grant Park Recreation", sport: "Basketball", distance: 1.5, rating: 4.5, activePlayersNow: 2, crowdLevel: "quiet" },
                { id: "demo4", name: "Brookhaven Pickleball", sport: "Pickleball", distance: 2.1, rating: 4.6, activePlayersNow: 8, crowdLevel: "packed" },
                { id: "demo5", name: "Morningside Fitness", sport: "Tennis", distance: 2.5, rating: 4.4, activePlayersNow: 3, crowdLevel: "active" },
            ]

            const finalVenues = venues.length > 0 ? venues : FALLBACK_VENUES
            setNearbyVenues(finalVenues)

            // For now, trending is just the top rated ones
            const trending = [...finalVenues].sort((a, b) => b.rating - a.rating).slice(0, 5)
            setTrendingVenues(trending)

            // GIA Intelligence: Filter for open facilities (quiet/active)
            const openFacilities = finalVenues.filter((v: any) => v.crowdLevel === "quiet" || v.crowdLevel === "active")
            setGiaOpenFacilities(openFacilities)

            // Trainers - empty for now until trainerService exists
            setTrainers([])
        } catch (error) {
            console.error("Error loading discover data", error)
        } finally {
            setLoading(false)
        }
    }

    // Pull-to-refresh handler
    const onRefresh = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        loadData()
    }, [location])

    // Venue Card Component
    // @ts-ignore
    const VenueCard = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.venueCard}
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                router.push(`/venues/${item.id}`)
            }}
        >
            <LinearGradient
                colors={["#1A1A1A", "#0F0F0F"]}
                style={styles.venueCardGradient}
            >
                <View style={styles.venueImagePlaceholder}>
                    {item.images?.[0] ? <Image source={{ uri: item.images[0] }} style={{ width: '100%', height: '100%' }} /> : <Ionicons name="tennisball" size={32} color="#7ED957" />}
                </View>
                <View style={styles.venueCardContent}>
                    <Text style={styles.venueCardName} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.venueCardMeta}>
                        <Ionicons name="location-outline" size={14} color="#888" />
                        <Text style={styles.venueCardDistance}>{item.distance?.toFixed(1)} mi</Text>
                        <Ionicons name="star" size={14} color="#FFD700" style={{ marginLeft: 8 }} />
                        <Text style={styles.venueCardRating}>{item.rating}</Text>
                    </View>
                    <View style={styles.venueCardFooter}>
                        {item.isBookable !== false && <Text style={styles.venueCardPrice}>{item.price ? `$${item.price}/hr` : ' prices vary'}</Text>}
                        <Text style={styles.venueCardCourts}>{item.courts || '?'} courts</Text>
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    )

    // Trainer Card Component
    const TrainerCard = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.trainerCard}
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                router.push(`/trainer/${item.id}`)
            }}
        >
            <LinearGradient
                colors={["#1A1A1A", "#0F0F0F"]}
                style={styles.trainerCardGradient}
            >
                <View style={styles.trainerAvatar}>
                    <Ionicons name="person" size={28} color="#7ED957" />
                </View>
                {item.available && (
                    <View style={styles.availableBadge}>
                        <Text style={styles.availableBadgeText}>Available</Text>
                    </View>
                )}
                <Text style={styles.trainerName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.trainerSport}>{item.sport}</Text>
                <View style={styles.trainerMeta}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.trainerRating}>{item.rating}</Text>
                </View>
                <Text style={styles.trainerPrice}>${item.price}/session</Text>

                {/* Book Button - Separate action */}
                <TouchableOpacity
                    style={styles.trainerBookBtn}
                    onPress={(e) => {
                        e.stopPropagation()
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                        router.push({
                            pathname: "/book/[id]",
                            params: { id: item.id, name: item.name }
                        })
                    }}
                >
                    <Text style={styles.trainerBookText}>Book</Text>
                </TouchableOpacity>
            </LinearGradient>
        </TouchableOpacity>
    )

    // Warm Lead Card Component (for trainers)
    const WarmLeadCard = ({ item }: { item: typeof WARM_LEADS_DATA[0] }) => (
        <TouchableOpacity
            style={styles.warmLeadCard}
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                // Open ping modal or player profile
            }}
        >
            <LinearGradient
                colors={item.isHot ? ["#FF6B6B20", "#1A1A1A"] : ["#1A1A1A", "#0F0F0F"]}
                style={styles.warmLeadCardGradient}
            >
                <View style={styles.warmLeadHeader}>
                    <View style={styles.warmLeadAvatar}>
                        <Ionicons name="person" size={20} color="#7ED957" />
                    </View>
                    {item.isHot && (
                        <View style={styles.hotBadge}>
                            <Ionicons name="flame" size={10} color="#FF6B6B" />
                        </View>
                    )}
                </View>
                <Text style={styles.warmLeadName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.warmLeadSport}>{item.sport} • {item.level}</Text>
                <Text style={styles.warmLeadSignal} numberOfLines={1}>{item.signal}</Text>
                <TouchableOpacity style={styles.pingMiniBtn}>
                    <Text style={styles.pingMiniBtnText}>📩 Ping</Text>
                </TouchableOpacity>
            </LinearGradient>
        </TouchableOpacity>
    )

    // Safe MapView wrapper component to prevent iPad crashes
    // MapView with customMapStyle can crash on certain iPad configurations
    const SafeMapView = ({ mapRef }: { mapRef: React.RefObject<MapView | null> }) => {
        const [mapError, setMapError] = useState(false)

        if (mapError) {
            // Fallback UI when MapView crashes
            return (
                <View style={[styles.map, { backgroundColor: "#1d2c4d", alignItems: "center", justifyContent: "center" }]}>
                    <Ionicons name="map-outline" size={48} color="#7ED957" />
                    <Text style={{ color: "#FFF", marginTop: 12, fontWeight: "bold" }}>Activity Heat Map</Text>
                    <Text style={{ color: "#888", marginTop: 4, fontSize: 12 }}>Available in Phase 1 cities</Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", marginTop: 16, gap: 8 }}>
                        {PHASE_1_CITIES.map((city) => (
                            <View key={city.name} style={{ backgroundColor: "rgba(255,107,107,0.2)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
                                <Text style={{ color: "#FF6B6B", fontSize: 12, fontWeight: "600" }}>{city.name}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )
        }

        try {
            return (
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    provider={PROVIDER_DEFAULT}
                    initialRegion={{
                        latitude: 37.0902,
                        longitude: -95.7129,
                        latitudeDelta: 40,
                        longitudeDelta: 40,
                    }}
                    onMapReady={() => console.log("Map ready")}
                // onError={() => setMapError(true)}
                >
                    {/* Heat map signals for Phase 1 cities */}
                    {PHASE_1_CITIES.map((city) => {
                        const size = 20 + city.intensity * 30
                        return (
                            <Marker
                                key={city.name}
                                coordinate={{ latitude: city.lat, longitude: city.lng }}
                                title={city.name}
                                description={`${Math.round(city.intensity * 100)}% activity`}
                            >
                                <View style={[styles.heatSignal, { width: size, height: size }]}>
                                    <LinearGradient
                                        colors={["#FF6B6B", "#FF6B6B80", "#FF6B6B40", "transparent"]}
                                        style={[styles.heatSignalGradient, { width: size, height: size, borderRadius: size / 2 }]}
                                    />
                                    <View style={styles.heatSignalCenter} />
                                </View>
                            </Marker>
                        )
                    })}
                </MapView>
            )
        } catch (error) {
            console.error("MapView error:", error)
            setMapError(true)
            return null
        }
    }

    // Section Header Component
    const SectionHeader = ({
        title,
        icon,
        color = "#7ED957",
        onSeeAll,
        seeAllLabel
    }: {
        title: string
        icon: string
        color?: string
        onSeeAll?: () => void
        seeAllLabel?: string
    }) => (
        <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
                <Ionicons name={icon as any} size={20} color={color} />
                <Text style={styles.sectionTitle}>{title}</Text>
            </View>
            {onSeeAll && (
                <TouchableOpacity onPress={onSeeAll} style={styles.seeAllButton}>
                    <Text style={styles.seeAllText}>{seeAllLabel || "See All"}</Text>
                    <Ionicons name="chevron-forward" size={16} color="#7ED957" />
                </TouchableOpacity>
            )}
        </View>
    )

    return (
        <View style={styles.container}>
            <LinearGradient colors={["#0A0A0A", "#111"]} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                <ScrollView
                    contentContainerStyle={{ paddingBottom: 100 }}
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor="#7ED957" />}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Location Header */}
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.locationHeader}>
                            <Ionicons name="location" size={20} color="#7ED957" />
                            <Text style={styles.locationText}>{userCity}{userState ? `, ${userState}` : ""}</Text>
                            <Ionicons name="chevron-down" size={16} color="#888" />
                        </TouchableOpacity>
                        {isPhase1 && (
                            <View style={styles.phase1HeaderBadge}>
                                <Ionicons name="star" size={12} color="#FFD700" />
                                <Text style={styles.phase1HeaderText}>Launch City</Text>
                            </View>
                        )}
                    </View>

                    {/* Search Bar */}
                    <View style={styles.searchSection}>
                        <TouchableOpacity
                            style={styles.searchBar}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                router.push("/search")
                            }}
                        >
                            <Ionicons name="search" size={20} color="#888" />
                            <Text style={styles.searchPlaceholder}>Search courts, trainers, facilities...</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.filterButton}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                // Open filter modal
                            }}
                        >
                            <Ionicons name="options-outline" size={20} color="#7ED957" />
                        </TouchableOpacity>
                    </View>

                    {/* Main Content Area - Conditional based on Persona */}
                    {loading && nearbyVenues.length === 0 ? (
                        // ============================================
                        // 💀 LOADING SKELETONS
                        // ============================================
                        <>
                            <SectionSkeleton count={3} />
                            <SectionSkeleton count={3} />
                            <SectionSkeleton count={3} />
                        </>
                    ) : (
                        <>
                            {/* ============================================ */}
                            {/* 🔥 ACTIVITY HEAT MAP (MOVED UP)              */}
                            {/* ============================================ */}
                            <View style={styles.section}>
                                <SectionHeader
                                    title="ACTIVITY HEAT MAP"
                                    icon="flame"
                                    color="#F97316"
                                    onSeeAll={() => router.push("/(tabs)/live")}
                                    seeAllLabel="Live Map"
                                />
                                <View style={styles.mapContainer}>
                                    {/* Safe MapView wrapper for iPad compatibility */}
                                    <SafeMapView mapRef={mapRef} />
                                    <View style={styles.mapLegend}>
                                        <View style={styles.legendItem}>
                                            <View style={[styles.legendDot, { backgroundColor: "#FF6B6B" }]} />
                                            <Text style={styles.legendText}>High Activity</Text>
                                        </View>
                                        <View style={styles.legendItem}>
                                            <View style={[styles.legendDot, { backgroundColor: "#F97316" }]} />
                                            <Text style={styles.legendText}>Growing</Text>
                                        </View>
                                        <View style={styles.legendItem}>
                                            <View style={[styles.legendDot, { backgroundColor: "#3B82F6" }]} />
                                            <Text style={styles.legendText}>Coming Soon</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {/* LOCAL TRAINER SPOTLIGHT - Priority Cities Only */}
                            <LocalTrainerSpotlight
                                trainers={trainers}
                                cityId={getLaunchCity(userCity)?.id}
                            />

                            {isTrainer ? (

                                // ============================================
                                // 🏋️ TRAINER DISCOVER FEED
                                // ============================================
                                <>
                                    {/* 1. Player Hot Leads (Top) */}
                                    <View style={styles.section}>
                                        <SectionHeader
                                            title="PLAYER HOT LEADS"
                                            icon="flame"
                                            color="#FF6B6B"
                                            onSeeAll={() => router.push("/facility/dashboard")}
                                        />
                                        <FlatList
                                            horizontal
                                            data={WARM_LEADS_DATA}
                                            keyExtractor={(item) => item.id}
                                            renderItem={({ item }) => <WarmLeadCard item={item} />}
                                            showsHorizontalScrollIndicator={false}
                                            contentContainerStyle={styles.horizontalList}
                                            snapToInterval={150}
                                            decelerationRate="fast"
                                        />
                                    </View>

                                    {/* 2. Top Facilities Near You */}
                                    <View style={styles.section}>
                                        <SectionHeader title="⭐ TOP FACILITIES NEAR YOU" icon="star" color="#FBBF24" />
                                        <FlatList
                                            horizontal
                                            data={trendingVenues}
                                            keyExtractor={(item) => item.id}
                                            renderItem={({ item }) => (
                                                <View style={{ width: CARD_WIDTH, marginRight: CARD_SPACING }}>
                                                    <VenueCard item={item} />
                                                </View>
                                            )}
                                            showsHorizontalScrollIndicator={false}
                                            contentContainerStyle={styles.horizontalList}
                                            snapToInterval={CARD_WIDTH + CARD_SPACING}
                                            decelerationRate="fast"
                                        />
                                    </View>

                                    {/* 3. GIA Predicted Open Facilities (Avail to Train) */}
                                    <View style={styles.section}>
                                        <SectionHeader title="GIA OPEN FACILITIES" icon="sparkles" color="#8B5CF6" />
                                        <FlatList
                                            horizontal
                                            data={giaOpenFacilities}
                                            keyExtractor={(item) => item.id}
                                            renderItem={({ item }) => (
                                                <TouchableOpacity
                                                    style={styles.courtCardPremium}
                                                    onPress={() => router.push(`/venues/${item.id}`)}
                                                >
                                                    <LinearGradient
                                                        colors={["#1E1B4B", "#0A0A0A"]}
                                                        style={styles.courtCardGradient}
                                                    >
                                                        <LiveTrafficBadge
                                                            level={item.crowdLevel}
                                                            playersNow={item.activePlayersNow || 0}
                                                            size="small"
                                                            trend="stable"
                                                        />
                                                        <Text style={styles.courtCardName} numberOfLines={1}>{item.name}</Text>
                                                        <View style={styles.vibeRow}>
                                                            <Text style={[styles.vibeLabel, { color: "#8B5CF6" }]}>Predicted Open</Text>
                                                        </View>
                                                        <View style={styles.courtCardFooter}>
                                                            <Text style={styles.courtCardDistance}>{item.distance?.toFixed(1)} mi</Text>
                                                            <Ionicons name="arrow-forward" size={14} color="#8B5CF6" />
                                                        </View>
                                                    </LinearGradient>
                                                </TouchableOpacity>
                                            )}
                                            showsHorizontalScrollIndicator={false}
                                            contentContainerStyle={styles.horizontalList}
                                            snapToInterval={180}
                                            decelerationRate="fast"
                                        />
                                    </View>

                                    {/* 4. Facilities Available to Book */}
                                    <View style={styles.section}>
                                        <SectionHeader title="FACILITIES TO BOOK" icon="business" color="#3B82F6" onSeeAll={() => router.push("/facilities")} />
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                                            {nearbyVenues.filter(v => v.isBookable).map(item => (
                                                <TouchableOpacity key={item.id} style={styles.miniCourtCard} onPress={() => router.push(`/venues/${item.id}`)}>
                                                    <View style={[styles.miniCourtIcon, { backgroundColor: "rgba(59, 130, 246, 0.15)" }]}><Ionicons name="business" size={20} color="#3B82F6" /></View>
                                                    <Text style={styles.miniCourtName} numberOfLines={1}>{item.name}</Text>
                                                    <Text style={styles.miniCourtMeta}>{item.distance?.toFixed(1)} mi</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                </>
                            ) : (
                                // ============================================
                                // 🏀 PLAYER DISCOVER FEED
                                // ============================================
                                <>
                                    {/* Premium Visibility Card */}
                                    {(isFacility) && (
                                        <PremiumVisibilityCard
                                            userType="facility"
                                            onUpgrade={() => router.push("/settings/subscription")}
                                        />
                                    )}

                                    {/* Trending / Recommended */}
                                    {trendingVenues.length > 0 && (
                                        <View style={styles.section}>
                                            <SectionHeader title="TRENDING NEARBY" icon="flame" color="#F97316" onSeeAll={() => { }} />
                                            <FlatList
                                                horizontal
                                                data={trendingVenues}
                                                keyExtractor={(item) => item.id}
                                                renderItem={({ item }) => (
                                                    <View style={{ width: CARD_WIDTH, marginRight: CARD_SPACING }}>
                                                        <VenueCard item={item} />
                                                    </View>
                                                )}
                                                showsHorizontalScrollIndicator={false}
                                                contentContainerStyle={styles.horizontalList}
                                                snapToInterval={CARD_WIDTH + CARD_SPACING}
                                                decelerationRate="fast"
                                            />
                                        </View>
                                    )}

                                    {/* Nearby Venues */}
                                    <View style={styles.section}>
                                        <SectionHeader title="NEARBY COURTS" icon="location" color="#22C55E" onSeeAll={() => { }} />
                                        <FlatList
                                            horizontal
                                            data={nearbyVenues}
                                            keyExtractor={(item) => item.id}
                                            renderItem={({ item }) => (
                                                <TouchableOpacity
                                                    style={styles.courtCardPremium}
                                                    onPress={() => {
                                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                                        router.push(`/venues/${item.id}`)
                                                    }}
                                                    onLongPress={() => {
                                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                                                        router.push({
                                                            pathname: "/report/[id]",
                                                            params: { id: item.id, name: item.name }
                                                        })
                                                    }}
                                                >
                                                    <LinearGradient
                                                        colors={["#0D260D", "#0A0A0A"]}
                                                        style={styles.courtCardGradient}
                                                    >
                                                        <LiveTrafficBadge
                                                            level={item.crowdLevel || "quiet"}
                                                            playersNow={item.activePlayersNow || 0}
                                                            size="small"
                                                            trend={item.trend || "stable"}
                                                        />
                                                        <View style={[styles.courtIconCircle, { backgroundColor: "rgba(34, 197, 94, 0.15)", borderColor: "#22C55E40" }]}>
                                                            <Ionicons name="tennisball" size={28} color="#22C55E" />
                                                        </View>
                                                        <Text style={styles.courtCardName} numberOfLines={1}>{item.name}</Text>
                                                        <View style={styles.vibeRow}>
                                                            <Text style={[styles.vibeLabel, { color: item.crowdLevel === "quiet" ? "#22C55E" : item.crowdLevel === "busy" ? "#F97316" : "#FBBF24" }]}>
                                                                {item.crowdLevel === "quiet" ? "Wide Open" :
                                                                    item.crowdLevel === "busy" ? "Crowded" : "Active"}
                                                            </Text>
                                                            {item.runQuality && (
                                                                <View style={{ marginLeft: 8, backgroundColor: "rgba(139, 92, 246, 0.2)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                                                    <Text style={{ color: "#A78BFA", fontSize: 10, fontWeight: "700" }}>{item.runQuality}</Text>
                                                                </View>
                                                            )}
                                                        </View>
                                                        <View style={styles.courtCardFooter}>
                                                            <View style={styles.courtCardMeta}>
                                                                <Ionicons name="location" size={12} color="#666" />
                                                                <Text style={styles.courtCardDistance}>{item.distance?.toFixed(1)} mi</Text>
                                                            </View>
                                                            <View style={styles.liveTrafficFooter}>
                                                                <View style={[styles.liveTrafficDotSmall, {
                                                                    backgroundColor: item.crowdLevel === "quiet" ? "#22C55E" :
                                                                        item.crowdLevel === "busy" ? "#F97316" : "#FBBF24"
                                                                }]} />
                                                                <Text style={styles.liveTrafficFooterText}>
                                                                    {item.activePlayersNow || 0} now
                                                                </Text>
                                                            </View>
                                                        </View>
                                                    </LinearGradient>
                                                </TouchableOpacity>
                                            )}
                                            showsHorizontalScrollIndicator={false}
                                            contentContainerStyle={styles.horizontalList}
                                            snapToInterval={180}
                                            decelerationRate="fast"
                                        />
                                    </View>



                                    {/* Free Courts (High Value - Moved Up) */}
                                    <View style={styles.section}>
                                        <SectionHeader title="🆓 FREE COURTS" icon="tennisball" color="#22C55E" />
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                                            {nearbyVenues.filter(v => !v.price || v.price === "Free" || v.price === "$0").slice(0, 6).map(item => (
                                                <TouchableOpacity key={item.id} style={styles.miniCourtCard} onPress={() => router.push(`/venues/${item.id}`)}>
                                                    <View style={[styles.miniCourtIcon, { backgroundColor: "rgba(34, 197, 94, 0.15)" }]}><Ionicons name="tennisball" size={20} color="#22C55E" /></View>
                                                    <Text style={styles.miniCourtName} numberOfLines={1}>{item.name}</Text>
                                                    <Text style={styles.miniCourtMeta}>Free • {item.distance?.toFixed(1)} mi</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>

                                    {/* Book Trainers */}
                                    <View style={styles.section}>
                                        <SectionHeader title="TRAINERS TO BOOK" icon="fitness" color="#EC4899" onSeeAll={() => router.push("/trainers")} />
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                                            {trainers.length > 0 ? (
                                                trainers.map(item => (
                                                    <TouchableOpacity key={item.id} style={styles.miniCourtCard} onPress={() => router.push(`/trainer/${item.id}`)}>
                                                        <View style={[styles.miniCourtIcon, { backgroundColor: "rgba(236, 72, 153, 0.15)" }]}><Ionicons name="person" size={20} color="#EC4899" /></View>
                                                        <Text style={styles.miniCourtName} numberOfLines={1}>{item.name}</Text>
                                                        <Text style={styles.miniCourtMeta}>${item.price}/hr</Text>
                                                    </TouchableOpacity>
                                                ))
                                            ) : (
                                                <GiaEmptyState
                                                    variant="inline"
                                                    title="Trainers loading..."
                                                    message="I'm searching for top coaches in your area."
                                                    onAction={() => router.push("/(tabs)/gia")}
                                                />
                                            )}
                                        </ScrollView>
                                    </View>

                                    {/* Book Facilities */}
                                    <View style={styles.section}>
                                        <SectionHeader title="FACILITIES TO BOOK" icon="business" color="#3B82F6" onSeeAll={() => router.push("/facilities")} />
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                                            {nearbyVenues.filter(v => v.isBookable).length > 0 ? (
                                                nearbyVenues.filter(v => v.isBookable).map(item => (
                                                    <TouchableOpacity key={item.id} style={styles.miniCourtCard} onPress={() => router.push(`/venues/${item.id}`)}>
                                                        <View style={[styles.miniCourtIcon, { backgroundColor: "rgba(59, 130, 246, 0.15)" }]}><Ionicons name="business" size={20} color="#3B82F6" /></View>
                                                        <Text style={styles.miniCourtName} numberOfLines={1}>{item.name}</Text>
                                                        <Text style={styles.miniCourtMeta}>{item.distance?.toFixed(1)} mi</Text>
                                                    </TouchableOpacity>
                                                ))
                                            ) : (
                                                <GiaEmptyState
                                                    variant="inline"
                                                    title="Facilities loading..."
                                                    message="I'm checking availability at nearby clubs."
                                                    onAction={() => router.push("/(tabs)/gia")}
                                                />
                                            )}
                                        </ScrollView>
                                    </View>

                                    {/* Paid Courts */}
                                    <View style={styles.section}>
                                        <SectionHeader title="PAID COURTS" icon="card" color="#8B5CF6" />
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                                            {nearbyVenues.filter(v => v.price && v.price !== "Free" && v.price !== "$0").slice(0, 6).map(item => (
                                                <TouchableOpacity key={item.id} style={styles.miniCourtCard} onPress={() => router.push(`/venues/${item.id}`)}>
                                                    <View style={[styles.miniCourtIcon, { backgroundColor: "rgba(139, 92, 246, 0.15)" }]}><Ionicons name="card" size={20} color="#8B5CF6" /></View>
                                                    <Text style={styles.miniCourtName} numberOfLines={1}>{item.name}</Text>
                                                    <Text style={styles.miniCourtMeta}>{item.price} • {item.distance?.toFixed(1)} mi</Text>
                                                </TouchableOpacity>
                                            ))}
                                            {nearbyVenues.filter(v => v.price && v.price !== "Free" && v.price !== "$0").length === 0 && (
                                                <GiaEmptyState
                                                    variant="inline"
                                                    title="All courts are free!"
                                                    message="I couldn't find any paid courts nearby. Enjoy the free play!"
                                                    onAction={() => router.push("/(tabs)/gia")}
                                                />
                                            )}
                                        </ScrollView>
                                    </View>

                                    {/* College Courts */}
                                    <View style={styles.section}>
                                        <SectionHeader title="COLLEGE COURTS" icon="school" color="#F59E0B" />
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                                            {nearbyVenues.filter(v => v.name?.toLowerCase().includes("university") || v.name?.toLowerCase().includes("college") || v.type?.toLowerCase().includes("campus")).slice(0, 6).map(item => (
                                                <TouchableOpacity key={item.id} style={styles.miniCourtCard} onPress={() => router.push(`/venues/${item.id}`)}>
                                                    <View style={[styles.miniCourtIcon, { backgroundColor: "rgba(245, 158, 11, 0.15)" }]}><Ionicons name="school" size={20} color="#F59E0B" /></View>
                                                    <Text style={styles.miniCourtName} numberOfLines={1}>{item.name}</Text>
                                                    <Text style={styles.miniCourtMeta}>{item.distance?.toFixed(1)} mi</Text>
                                                </TouchableOpacity>
                                            ))}
                                            {nearbyVenues.filter(v => v.name?.toLowerCase().includes("university") || v.name?.toLowerCase().includes("college")).length === 0 && (
                                                <GiaEmptyState
                                                    variant="inline"
                                                    title="No college courts found"
                                                    message="Most campus courts require student ID. Ask me if you're not sure."
                                                    actionLabel="Ask GIA"
                                                    onAction={() => router.push("/(tabs)/gia")}
                                                />
                                            )}
                                        </ScrollView>
                                    </View>
                                </>
                            )}



                            <View style={{ height: 100 }} />
                        </ScrollView>
            </SafeAreaView>

            {/* Need Players FAB - Only for players, not trainers */}
            {!isTrainer && (
                <TouchableOpacity
                    style={styles.needPlayersFab}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                        router.push("/need-players")
                    }}
                >
                    <Ionicons name="people" size={18} color="#FFF" />
                    <Text style={styles.needPlayersFabText}>Need Players?</Text>
                </TouchableOpacity>
            )}

            {/* Quick Report Sheet Modal */}
            <QuickReportSheet
                visible={reportVenue !== null}
                onClose={() => setReportVenue(null)}
                venueName={reportVenue?.name || ""}
                venueId={reportVenue?.id || ""}
                onReportSubmitted={(level, imageUri) => {
                    console.log("[Discover] Report submitted:", level, imageUri)
                    // TODO: Send to backend
                }}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0A0A0A" },
    safeArea: { flex: 1 },

    // Header
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    locationHeader: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 24,
    },
    locationText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 8,
        marginRight: 4,
    },
    phase1HeaderBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 215, 0, 0.15)",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
    },
    phase1HeaderText: {
        color: "#FFD700",
        fontSize: 12,
        fontWeight: "600",
        marginLeft: 4,
    },

    // Search Bar
    searchSection: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        marginBottom: 16,
        gap: 10,
    },
    searchBar: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: "#252525",
        gap: 10,
    },
    searchPlaceholder: {
        color: "#666",
        fontSize: 15,
    },
    filterButton: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: "#1A1A1A",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#252525",
    },

    // Sections
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    sectionHeaderLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    sectionTitle: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "bold",
        letterSpacing: 1,
        marginLeft: 8,
    },
    seeAllButton: {
        flexDirection: "row",
        alignItems: "center",
    },
    seeAllText: {
        color: "#7ED957",
        fontSize: 14,
        marginRight: 4,
    },
    horizontalList: {
        paddingHorizontal: 20,
        gap: CARD_SPACING,
    },

    // Trending Cards
    trendingCard: {
        width: SCREEN_WIDTH - 60,
        marginRight: CARD_SPACING,
        borderRadius: 16,
        overflow: "hidden",
    },
    trendingCardGradient: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
    },
    trendingIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(0,0,0,0.2)",
        alignItems: "center",
        justifyContent: "center",
    },
    trendingContent: {
        flex: 1,
        marginLeft: 12,
    },
    trendingName: {
        color: "#000",
        fontSize: 16,
        fontWeight: "bold",
    },
    trendingMeta: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    trendingRating: {
        color: "#000",
        fontSize: 12,
        fontWeight: "600",
        marginLeft: 4,
    },
    trendingStats: {
        color: "rgba(0,0,0,0.6)",
        fontSize: 12,
        marginLeft: 4,
    },

    // Venue Cards
    venueCard: {
        width: CARD_WIDTH,
        borderRadius: 16,
        overflow: "hidden",
    },
    venueCardGradient: {
        padding: 16,
    },
    venueImagePlaceholder: {
        width: "100%",
        height: 100,
        backgroundColor: "#0A0A0A",
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    venueCardContent: {},
    venueCardName: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 6,
    },
    venueCardMeta: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    venueCardDistance: {
        color: "#888",
        fontSize: 13,
        marginLeft: 4,
    },
    venueCardRating: {
        color: "#FFD700",
        fontSize: 13,
        fontWeight: "600",
        marginLeft: 4,
    },
    venueCardFooter: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    venueCardPrice: {
        color: "#7ED957",
        fontSize: 16,
        fontWeight: "bold",
    },
    venueCardCourts: {
        color: "#888",
        fontSize: 13,
    },

    // Trainer Cards
    trainerCard: {
        width: 130,
        borderRadius: 16,
        overflow: "hidden",
    },
    trainerCardGradient: {
        padding: 16,
        alignItems: "center",
    },
    trainerAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#0A0A0A",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
    },
    availableBadge: {
        position: "absolute",
        top: 8,
        right: 8,
        backgroundColor: "#7ED957",
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    availableBadgeText: {
        color: "#000",
        fontSize: 10,
        fontWeight: "bold",
    },
    trainerName: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "bold",
        textAlign: "center",
    },
    trainerSport: {
        color: "#888",
        fontSize: 12,
        marginTop: 2,
    },
    trainerMeta: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 6,
    },
    trainerRating: {
        color: "#FFD700",
        fontSize: 12,
        fontWeight: "600",
        marginLeft: 4,
    },
    trainerPrice: {
        color: "#7ED957",
        fontSize: 13,
        fontWeight: "600",
        marginTop: 8,
    },
    trainerBookBtn: {
        backgroundColor: "#7ED957",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 16,
        marginTop: 12,
        alignItems: "center",
    },
    trainerBookText: {
        color: "#000",
        fontSize: 12,
        fontWeight: "700",
    },

    // Map
    mapContainer: {
        marginHorizontal: 20,
        borderRadius: 16,
        overflow: "hidden",
        height: 200,
    },
    map: {
        flex: 1,
    },
    heatPoint: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    heatPointGradient: {
        width: 30,
        height: 30,
        borderRadius: 15,
    },
    mapLegend: {
        position: "absolute",
        bottom: 12,
        left: 12,
        flexDirection: "row",
        backgroundColor: "rgba(0,0,0,0.7)",
        padding: 8,
        borderRadius: 8,
        gap: 16,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    legendText: {
        color: "#FFF",
        fontSize: 10,
    },

    // Warm Lead Cards
    warmLeadCard: {
        width: 140,
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#333",
    },
    warmLeadCardGradient: {
        padding: 14,
        alignItems: "center",
    },
    warmLeadHeader: {
        position: "relative",
        marginBottom: 8,
    },
    warmLeadAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#0A0A0A",
        alignItems: "center",
        justifyContent: "center",
    },
    hotBadge: {
        position: "absolute",
        top: -4,
        right: -8,
        backgroundColor: "#FF6B6B20",
        borderRadius: 8,
        padding: 4,
    },
    warmLeadName: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "bold",
        textAlign: "center",
    },
    warmLeadSport: {
        color: "#888",
        fontSize: 11,
        marginTop: 2,
        textAlign: "center",
    },
    warmLeadSignal: {
        color: "#7ED957",
        fontSize: 10,
        marginTop: 6,
        textAlign: "center",
    },
    pingMiniBtn: {
        backgroundColor: "#7ED957",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginTop: 10,
    },
    pingMiniBtnText: {
        color: "#000",
        fontSize: 11,
        fontWeight: "bold",
    },

    // Heat Signal
    heatSignal: {
        alignItems: "center",
        justifyContent: "center",
    },
    heatSignalGradient: {
        position: "absolute",
    },
    heatSignalCenter: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#FF6B6B",
    },

    // FREE COURTS CARDS
    freeCourtCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 12,
        marginRight: 12,
        width: 150,
        borderWidth: 1,
        borderColor: "#22C55E40",
    },
    freeCourtBadge: {
        position: "absolute",
        top: 8,
        right: 8,
        backgroundColor: "#22C55E",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    freeCourtBadgeText: { color: "#000", fontSize: 9, fontWeight: "bold" },
    freeCourtIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(34, 197, 94, 0.2)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    freeCourtName: { color: "#FFF", fontSize: 14, fontWeight: "600", marginBottom: 4 },
    freeCourtSport: { color: "#22C55E", fontSize: 11, fontWeight: "500", marginBottom: 6 },
    freeCourtMeta: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
    freeCourtDistance: { color: "#888", fontSize: 11 },
    freeCourtCondition: { color: "#888", fontSize: 11, marginLeft: 4 },
    freeCourtInfo: { flexDirection: "row", alignItems: "center" },
    freeCourtCourts: { color: "#666", fontSize: 10, marginLeft: 4 },

    // COLLEGE COURTS CARDS
    collegeCourtCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 12,
        marginRight: 12,
        width: 170,
        borderWidth: 1,
        borderColor: "#3B82F640",
    },
    collegeBadge: {
        backgroundColor: "#3B82F6",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        marginBottom: 10,
        alignSelf: "flex-start",
    },
    collegeBadgeText: { color: "#FFF", fontSize: 10, fontWeight: "bold" },
    collegeCourtName: { color: "#FFF", fontSize: 13, fontWeight: "600", marginBottom: 4, minHeight: 34 },
    collegeCourtSport: { color: "#3B82F6", fontSize: 11, fontWeight: "500", marginBottom: 6 },
    collegeAccessBadge: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 },
    collegeAccessText: { fontSize: 10, fontWeight: "600" },
    collegeCourtMeta: { flexDirection: "row", alignItems: "center" },
    collegeCourtDistance: { color: "#888", fontSize: 11 },
    collegeCourtCourts: { color: "#888", fontSize: 11, marginLeft: 4 },

    // GYM MEMBERSHIP COURTS CARDS
    gymCourtCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 12,
        marginRight: 12,
        width: 150,
        borderWidth: 1,
        borderColor: "#EC489940",
    },
    gymChainBadge: {
        backgroundColor: "#EC4899",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        marginBottom: 10,
        alignSelf: "flex-start",
    },
    gymChainText: { color: "#FFF", fontSize: 10, fontWeight: "bold" },
    gymCourtName: { color: "#FFF", fontSize: 13, fontWeight: "600", marginBottom: 4 },
    gymCourtSport: { color: "#EC4899", fontSize: 11, fontWeight: "500", marginBottom: 6 },
    gymCourtMeta: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
    gymCourtDistance: { color: "#888", fontSize: 11 },
    gymCourtCourts: { color: "#888", fontSize: 11, marginLeft: 4 },
    gymMembershipBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
    gymMembershipText: { color: "#EC4899", fontSize: 11, fontWeight: "600" },

    // LIVE TRAFFIC BADGE (used on all court cards)
    liveTrafficBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 10,
        borderWidth: 1,
        marginBottom: 6,
        alignSelf: "flex-start",
    },
    liveTrafficDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 4,
    },
    liveTrafficText: {
        fontSize: 10,
        fontWeight: "700",
    },

    // ===== PREMIUM COURT CARDS =====
    courtCardPremium: {
        borderRadius: 20,
        overflow: "hidden",
        marginRight: 12,
        width: 175,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    courtCardGradient: {
        padding: 14,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
    },
    courtTypeBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "rgba(34, 197, 94, 0.15)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: "flex-start",
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "rgba(34, 197, 94, 0.3)",
    },
    courtTypeBadgeText: {
        fontSize: 10,
        fontWeight: "700",
    },
    courtIconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
        borderWidth: 1,
    },
    courtCardName: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "700",
        marginBottom: 4,
    },
    courtCardSport: {
        color: "#22C55E",
        fontSize: 12,
        fontWeight: "500",
        marginBottom: 8,
    },
    courtCardFooter: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.1)",
    },
    courtCardMeta: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    courtCardDistance: {
        color: "#888",
        fontSize: 11,
    },
    courtCardCourts: {
        color: "#888",
        fontSize: 11,
    },

    // Vibe & Report Hint
    vibeRow: {
        marginTop: 4,
        marginBottom: 6,
    },
    vibeLabel: {
        fontSize: 11,
        fontWeight: "600",
    },
    tapToReport: {
        fontSize: 10,
        color: "#666",
        fontStyle: "italic",
    },
    liveTrafficFooter: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 6,
    },
    liveTrafficDotSmall: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    liveTrafficFooterText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#FFF",
    },


    // Need Players FAB
    needPlayersFab: {
        position: "absolute",
        bottom: 100,
        right: 20,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#EF4444",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 24,
        shadowColor: "#EF4444",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    needPlayersFabText: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "700",
    },

    accessBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        alignSelf: "flex-start",
        marginBottom: 6,
    },
    membershipBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginBottom: 6,
    },
    membershipText: {
        color: "#EC4899",
        fontSize: 11,
        fontWeight: "600",
    },

    // Mini Court Cards (for horizontal wheels)
    miniCourtCard: {
        width: 140,
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 14,
        marginRight: 12,
        alignItems: "center",
    },
    miniCourtIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(34, 197, 94, 0.15)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
    },
    miniCourtName: {
        color: "#FFF",
        fontSize: 13,
        fontWeight: "600",
        textAlign: "center",
        marginBottom: 4,
    },
    miniCourtMeta: {
        color: "#888",
        fontSize: 11,
    },

    // Coming Soon Placeholder
    comingSoonCard: {
        width: 200,
        height: 100,
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#252525",
        borderStyle: "dashed",
    },
    comingSoonText: {
        color: "#666",
        fontSize: 13,
        marginTop: 8,
        textAlign: "center",
    },
})
