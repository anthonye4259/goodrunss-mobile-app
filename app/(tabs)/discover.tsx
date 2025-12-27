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
]

// Mock data for sections
const TRENDING_DATA = [
    { id: "1", name: "Piedmont Tennis Center", type: "venue", rating: 4.9, bookings: 127, price: 45, image: null },
    { id: "2", name: "Mike Chen", type: "trainer", rating: 5.0, sessions: 89, price: 85, sport: "Tennis", image: null },
    { id: "3", name: "Buckhead Padel Club", type: "venue", rating: 4.8, bookings: 98, price: 55, image: null },
]

const VENUES_DATA = [
    { id: "v1", name: "Atlanta Tennis Club", distance: 1.2, rating: 4.7, price: 40, courts: 8, image: null },
    { id: "v2", name: "Midtown Courts", distance: 2.4, rating: 4.5, price: 35, courts: 6, image: null },
    { id: "v3", name: "Buckhead Sports Complex", distance: 3.1, rating: 4.8, price: 50, courts: 12, image: null },
    { id: "v4", name: "Sandy Springs Tennis", distance: 5.2, rating: 4.6, price: 38, courts: 4, image: null },
]

const TRAINERS_DATA = [
    { id: "t1", name: "Sarah Williams", sport: "Tennis", rating: 4.9, price: 75, available: true, image: null },
    { id: "t2", name: "Marcus Johnson", sport: "Pickleball", rating: 4.8, price: 65, available: true, image: null },
    { id: "t3", name: "Emily Davis", sport: "Padel", rating: 5.0, price: 90, available: false, image: null },
    { id: "t4", name: "James Brown", sport: "Tennis", rating: 4.7, price: 70, available: true, image: null },
]

// Mock data for warm leads (players interested in this trainer)
const WARM_LEADS_DATA = [
    { id: "l1", name: "Alex Turner", sport: "Tennis", level: 4.2, signal: "Viewed your profile 2x", isHot: true },
    { id: "l2", name: "Maya Chen", sport: "Tennis", level: 3.8, signal: "Checked availability", isHot: true },
    { id: "l3", name: "David Park", sport: "Pickleball", level: 3.5, signal: "Searched trainers nearby", isHot: false },
    { id: "l4", name: "Sarah Kim", sport: "Tennis", level: 4.0, signal: "Added you to favorites", isHot: true },
]

// FREE PUBLIC COURTS - Essential for players (with live traffic)
const FREE_COURTS_DATA = [
    { id: "f1", name: "Piedmont Park Courts", type: "public", sport: "Tennis", courts: 12, condition: "Good", distance: 0.8, hasLights: true, liveStatus: "busy", playersNow: 8 },
    { id: "f2", name: "Grant Park Recreation", type: "public", sport: "Basketball", courts: 4, condition: "Fair", distance: 1.2, hasLights: false, liveStatus: "quiet", playersNow: 2 },
    { id: "f3", name: "Chastain Park", type: "public", sport: "Tennis", courts: 8, condition: "Excellent", distance: 2.1, hasLights: true, liveStatus: "moderate", playersNow: 5 },
    { id: "f4", name: "Candler Park", type: "public", sport: "Pickleball", courts: 6, condition: "Good", distance: 1.8, hasLights: true, liveStatus: "packed", playersNow: 14 },
]

// COLLEGE COURTS - Essential for launch cities targeting students (with live traffic)
const COLLEGE_COURTS_DATA = [
    { id: "c1", name: "Georgia Tech Recreation Center", university: "Georgia Tech", sport: "All", access: "Student/Alumni", distance: 1.5, courts: 16, liveStatus: "moderate", playersNow: 12 },
    { id: "c2", name: "Emory University Courts", university: "Emory", sport: "Tennis", access: "Student Only", distance: 3.2, courts: 10, liveStatus: "quiet", playersNow: 3 },
    { id: "c3", name: "Georgia State Recreation", university: "GSU", sport: "Basketball", access: "Student/Public", distance: 0.9, courts: 8, liveStatus: "busy", playersNow: 9 },
    { id: "c4", name: "Spelman College Gym", university: "Spelman", sport: "Basketball", access: "Student Only", distance: 2.4, courts: 4, liveStatus: "quiet", playersNow: 1 },
]

// MEMBERSHIP GYMS - LA Fitness, Lifetime, etc. (with live traffic)
const MEMBERSHIP_COURTS_DATA = [
    { id: "m1", name: "LA Fitness - Buckhead", chain: "LA Fitness", sport: "Basketball", membershipReq: true, courts: 2, distance: 1.1, monthlyFee: 35, liveStatus: "moderate", playersNow: 4 },
    { id: "m2", name: "Lifetime Fitness - Perimeter", chain: "Lifetime", sport: "Tennis", membershipReq: true, courts: 6, distance: 4.8, monthlyFee: 180, liveStatus: "quiet", playersNow: 2 },
    { id: "m3", name: "24 Hour Fitness - Midtown", chain: "24 Hour", sport: "Basketball", membershipReq: true, courts: 1, distance: 0.6, monthlyFee: 45, liveStatus: "busy", playersNow: 6 },
    { id: "m4", name: "Equinox - Buckhead", chain: "Equinox", sport: "Tennis", membershipReq: true, courts: 2, distance: 2.3, monthlyFee: 250, liveStatus: "quiet", playersNow: 1 },
]

export default function DiscoverScreen() {
    const { preferences } = useUserPreferences()
    const { location } = useLocation()
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const mapRef = useRef<MapView>(null)

    const userCity = preferences.city || "Your City"
    const userState = preferences.state || ""
    const isPhase1 = preferences.isPhase1City
    // Detect if user is trainer or facility
    const userType = preferences.userType || "player" // "player" | "trainer" | "facility"
    const isTrainer = userType === "trainer"
    const isFacility = userType === "facility"

    // Pull-to-refresh handler
    const onRefresh = useCallback(() => {
        setRefreshing(true)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        // Simulate data refresh - in production would refetch from APIs
        setTimeout(() => {
            setRefreshing(false)
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        }, 1500)
    }, [])

    // Venue Card Component
    const VenueCard = ({ item }: { item: typeof VENUES_DATA[0] }) => (
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
                    <Ionicons name="tennisball" size={32} color="#7ED957" />
                </View>
                <View style={styles.venueCardContent}>
                    <Text style={styles.venueCardName} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.venueCardMeta}>
                        <Ionicons name="location-outline" size={14} color="#888" />
                        <Text style={styles.venueCardDistance}>{item.distance} mi</Text>
                        <Ionicons name="star" size={14} color="#FFD700" style={{ marginLeft: 8 }} />
                        <Text style={styles.venueCardRating}>{item.rating}</Text>
                    </View>
                    <View style={styles.venueCardFooter}>
                        <Text style={styles.venueCardPrice}>${item.price}/hr</Text>
                        <Text style={styles.venueCardCourts}>{item.courts} courts</Text>
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    )

    // Trainer Card Component
    const TrainerCard = ({ item }: { item: typeof TRAINERS_DATA[0] }) => (
        <TouchableOpacity
            style={styles.trainerCard}
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                router.push(`/trainers/${item.id}`)
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

    // Trending Card Component
    const TrendingCard = ({ item }: { item: typeof TRENDING_DATA[0] }) => (
        <TouchableOpacity
            style={styles.trendingCard}
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            }}
        >
            <LinearGradient
                colors={["#7ED957", "#4CAF50"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.trendingCardGradient}
            >
                <View style={styles.trendingIcon}>
                    <Ionicons
                        name={item.type === "venue" ? "business" : "person"}
                        size={24}
                        color="#000"
                    />
                </View>
                <View style={styles.trendingContent}>
                    <Text style={styles.trendingName} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.trendingMeta}>
                        <Ionicons name="star" size={12} color="#000" />
                        <Text style={styles.trendingRating}>{item.rating}</Text>
                        <Text style={styles.trendingStats}>
                            • {item.type === "venue" ? `${item.bookings} bookings` : `${item.sessions} sessions`}
                        </Text>
                    </View>
                </View>
                <Ionicons name="arrow-forward" size={20} color="#000" />
            </LinearGradient>
        </TouchableOpacity>
    )

    // Section Header Component
    const SectionHeader = ({
        title,
        icon,
        color = "#7ED957",
        onSeeAll
    }: {
        title: string
        icon: string
        color?: string
        onSeeAll?: () => void
    }) => (
        <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
                <Ionicons name={icon as any} size={20} color={color} />
                <Text style={styles.sectionTitle}>{title}</Text>
            </View>
            {onSeeAll && (
                <TouchableOpacity onPress={onSeeAll} style={styles.seeAllButton}>
                    <Text style={styles.seeAllText}>See All</Text>
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
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#7ED957"
                            colors={["#7ED957"]}
                        />
                    }
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

                    {/* Premium Visibility Card for Trainers/Facilities */}
                    {(isTrainer || isFacility) && (
                        <PremiumVisibilityCard
                            userType={isFacility ? "facility" : "trainer"}
                            onUpgrade={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
                                router.push("/settings/subscription")
                            }}
                        />
                    )}

                    {/* Trending Section - STAYS AT TOP */}
                    <View style={styles.section}>
                        <SectionHeader title="🔥 TRENDING NEAR YOU" icon="flame" color="#F97316" onSeeAll={() => { }} />
                        <FlatList
                            horizontal
                            data={TRENDING_DATA}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => <TrendingCard item={item} />}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.horizontalList}
                            snapToInterval={SCREEN_WIDTH - 40}
                            decelerationRate="fast"
                        />
                    </View>

                    {/* =========== COURTS SECTION - MOVED TO TOP =========== */}

                    {/* FREE PUBLIC COURTS */}
                    <View style={styles.section}>
                        <SectionHeader title="🆓 FREE COURTS NEARBY" icon="tennisball" color="#22C55E" onSeeAll={() => router.push("/(tabs)/live")} />
                        <FlatList
                            horizontal
                            data={FREE_COURTS_DATA}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.courtCardPremium}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                        router.push("/(tabs)/live")
                                    }}
                                >
                                    <LinearGradient
                                        colors={["#0D260D", "#0A0A0A"]}
                                        style={styles.courtCardGradient}
                                    >
                                        {/* FREE Badge */}
                                        <View style={styles.courtTypeBadge}>
                                            <Ionicons name="checkmark-circle" size={12} color="#22C55E" />
                                            <Text style={[styles.courtTypeBadgeText, { color: "#22C55E" }]}>FREE</Text>
                                        </View>

                                        {/* Live Traffic */}
                                        <LiveTrafficBadge
                                            level={item.liveStatus as "quiet" | "moderate" | "busy" | "packed"}
                                            playersNow={item.playersNow}
                                            size="small"
                                        />

                                        {/* Court Icon */}
                                        <View style={[styles.courtIconCircle, { backgroundColor: "rgba(34, 197, 94, 0.15)", borderColor: "#22C55E40" }]}>
                                            <Ionicons name="tennisball" size={28} color="#22C55E" />
                                        </View>

                                        <Text style={styles.courtCardName} numberOfLines={1}>{item.name}</Text>
                                        <Text style={styles.courtCardSport}>{item.sport}</Text>

                                        <View style={styles.courtCardFooter}>
                                            <View style={styles.courtCardMeta}>
                                                <Ionicons name="location" size={12} color="#666" />
                                                <Text style={styles.courtCardDistance}>{item.distance} mi</Text>
                                            </View>
                                            <View style={styles.courtCardMeta}>
                                                <Ionicons name="grid" size={12} color="#666" />
                                                <Text style={styles.courtCardCourts}>{item.courts}</Text>
                                            </View>
                                            {item.hasLights && (
                                                <Ionicons name="bulb" size={14} color="#FBBF24" />
                                            )}
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

                    {/* COLLEGE COURTS */}
                    <View style={styles.section}>
                        <SectionHeader title="🎓 COLLEGE COURTS" icon="school" color="#3B82F6" onSeeAll={() => { }} />
                        <FlatList
                            horizontal
                            data={COLLEGE_COURTS_DATA}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.courtCardPremium}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                    }}
                                >
                                    <LinearGradient
                                        colors={["#0D1526", "#0A0A0A"]}
                                        style={styles.courtCardGradient}
                                    >
                                        {/* University Badge */}
                                        <View style={[styles.courtTypeBadge, { backgroundColor: "#3B82F620", borderColor: "#3B82F640" }]}>
                                            <Ionicons name="school" size={12} color="#3B82F6" />
                                            <Text style={[styles.courtTypeBadgeText, { color: "#3B82F6" }]}>{item.university}</Text>
                                        </View>

                                        {/* Live Traffic */}
                                        <LiveTrafficBadge
                                            level={item.liveStatus as "quiet" | "moderate" | "busy" | "packed"}
                                            playersNow={item.playersNow}
                                            size="small"
                                        />

                                        {/* Court Icon */}
                                        <View style={[styles.courtIconCircle, { backgroundColor: "rgba(59, 130, 246, 0.15)", borderColor: "#3B82F640" }]}>
                                            <Ionicons name="school" size={28} color="#3B82F6" />
                                        </View>

                                        <Text style={styles.courtCardName} numberOfLines={2}>{item.name}</Text>
                                        <Text style={[styles.courtCardSport, { color: "#3B82F6" }]}>{item.sport}</Text>

                                        {/* Access Badge */}
                                        <View style={[styles.accessBadge, { backgroundColor: item.access.includes("Public") ? "#22C55E15" : "#F9731615" }]}>
                                            <Ionicons name={item.access.includes("Public") ? "lock-open" : "lock-closed"} size={10} color={item.access.includes("Public") ? "#22C55E" : "#F97316"} />
                                            <Text style={{ color: item.access.includes("Public") ? "#22C55E" : "#F97316", fontSize: 10, fontWeight: "600" }}>{item.access}</Text>
                                        </View>

                                        <View style={styles.courtCardFooter}>
                                            <View style={styles.courtCardMeta}>
                                                <Ionicons name="location" size={12} color="#666" />
                                                <Text style={styles.courtCardDistance}>{item.distance} mi</Text>
                                            </View>
                                            <View style={styles.courtCardMeta}>
                                                <Ionicons name="grid" size={12} color="#666" />
                                                <Text style={styles.courtCardCourts}>{item.courts}</Text>
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

                    {/* GYM MEMBERSHIP COURTS */}
                    <View style={styles.section}>
                        <SectionHeader title="💪 GYM COURTS" icon="fitness" color="#EC4899" onSeeAll={() => { }} />
                        <FlatList
                            horizontal
                            data={MEMBERSHIP_COURTS_DATA}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.courtCardPremium}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                    }}
                                >
                                    <LinearGradient
                                        colors={["#260D1A", "#0A0A0A"]}
                                        style={styles.courtCardGradient}
                                    >
                                        {/* Chain Badge */}
                                        <View style={[styles.courtTypeBadge, { backgroundColor: "#EC489920", borderColor: "#EC489940" }]}>
                                            <Ionicons name="fitness" size={12} color="#EC4899" />
                                            <Text style={[styles.courtTypeBadgeText, { color: "#EC4899" }]}>{item.chain}</Text>
                                        </View>

                                        {/* Live Traffic */}
                                        <LiveTrafficBadge
                                            level={item.liveStatus as "quiet" | "moderate" | "busy" | "packed"}
                                            playersNow={item.playersNow}
                                            size="small"
                                        />

                                        {/* Court Icon */}
                                        <View style={[styles.courtIconCircle, { backgroundColor: "rgba(236, 72, 153, 0.15)", borderColor: "#EC489940" }]}>
                                            <Ionicons name="barbell" size={28} color="#EC4899" />
                                        </View>

                                        <Text style={styles.courtCardName} numberOfLines={1}>{item.name}</Text>
                                        <Text style={[styles.courtCardSport, { color: "#EC4899" }]}>{item.sport}</Text>

                                        {/* Membership Fee */}
                                        <View style={[styles.membershipBadge]}>
                                            <Ionicons name="card" size={12} color="#EC4899" />
                                            <Text style={styles.membershipText}>${item.monthlyFee}/mo</Text>
                                        </View>

                                        <View style={styles.courtCardFooter}>
                                            <View style={styles.courtCardMeta}>
                                                <Ionicons name="location" size={12} color="#666" />
                                                <Text style={styles.courtCardDistance}>{item.distance} mi</Text>
                                            </View>
                                            <View style={styles.courtCardMeta}>
                                                <Ionicons name="grid" size={12} color="#666" />
                                                <Text style={styles.courtCardCourts}>{item.courts}</Text>
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

                    {/* =========== OTHER SECTIONS =========== */}

                    {/* Venues Section */}
                    <View style={styles.section}>
                        <SectionHeader title="BOOK A VENUE" icon="business" onSeeAll={() => { }} />
                        <FlatList
                            horizontal
                            data={VENUES_DATA}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => <VenueCard item={item} />}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.horizontalList}
                            snapToInterval={CARD_WIDTH + CARD_SPACING}
                            decelerationRate="fast"
                        />
                    </View>

                    {/* Conditional Section: Warm Leads (trainer) or Top Trainers (player) */}
                    <View style={styles.section}>
                        {isTrainer || isFacility ? (
                            <>
                                <SectionHeader
                                    title="🔥 WARM LEADS"
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
                            </>
                        ) : (
                            <>
                                <SectionHeader title="TOP TRAINERS" icon="fitness" color="#8B5CF6" onSeeAll={() => { }} />
                                <FlatList
                                    horizontal
                                    data={TRAINERS_DATA}
                                    keyExtractor={(item) => item.id}
                                    renderItem={({ item }) => <TrainerCard item={item} />}
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.horizontalList}
                                    snapToInterval={140}
                                    decelerationRate="fast"
                                />
                            </>
                        )}
                    </View>

                    {/* Global Map with Heat Signals */}
                    <View style={styles.section}>
                        <SectionHeader title="ACTIVITY HEAT MAP" icon="flame" color="#F97316" />
                        <View style={styles.mapContainer}>
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
                                customMapStyle={[
                                    { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
                                    { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
                                    { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
                                    { featureType: "water", stylers: [{ color: "#0e1626" }] },
                                ]}
                            >
                                {/* Heat map signals for Phase 1 cities */}
                                {PHASE_1_CITIES.map((city) => {
                                    const size = 20 + city.intensity * 30 // Size based on intensity
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

                    <View style={{ height: 100 }} />
                </ScrollView>
            </SafeAreaView>
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
})
