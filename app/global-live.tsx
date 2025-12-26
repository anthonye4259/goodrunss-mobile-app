/**
 * Global Live Activity Screen
 * 
 * Shows real-time activity across all venues.
 * Users can explore GoodRunss's "immense data" - 
 * the global intelligence network.
 */

import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import { useUserPreferences } from "@/lib/user-preferences"
import { getPrimaryActivity, type Activity } from "@/lib/activity-content"
import { SportStatusCard, SportStatusPill } from "@/components/SportStatusCard"
import { HourlyForecast, generateHourlyPredictions } from "@/components/HourlyForecast"
import { getSportContext, getSportConfig, type SportContext, type Sport } from "@/lib/services/sport-intelligence-service"
import { venueService } from "@/lib/services/venue-service"

// Activity level colors
const LEVEL_COLORS = {
    dead: "#374151",
    quiet: "#22C55E",
    active: "#EAB308",
    busy: "#F97316",
    packed: "#EF4444",
}

// Live stat card
function LiveStatCard({
    icon,
    value,
    label,
    color = "#8B5CF6"
}: {
    icon: string
    value: string | number
    label: string
    color?: string
}) {
    return (
        <View className="bg-card border border-border rounded-2xl p-4 flex-1">
            <View className="flex-row items-center mb-2">
                <Ionicons name={icon as any} size={20} color={color} />
                <Text style={{ color }} className="ml-2 text-2xl font-bold">
                    {value}
                </Text>
            </View>
            <Text className="text-muted-foreground text-xs">{label}</Text>
        </View>
    )
}

// Venue activity row
function VenueActivityRow({
    venue,
    context,
    onPress,
}: {
    venue: any
    context: SportContext | null
    onPress: () => void
}) {
    return (
        <TouchableOpacity
            className="bg-card border border-border rounded-2xl p-4 mb-3"
            onPress={onPress}
        >
            <View className="flex-row justify-between items-center">
                <View className="flex-1 mr-4">
                    <Text className="text-foreground font-bold text-lg" numberOfLines={1}>
                        {venue.name}
                    </Text>
                    <View className="flex-row items-center mt-1">
                        <Ionicons name="location-outline" size={14} color="#6B7280" />
                        <Text className="text-muted-foreground text-sm ml-1">
                            {venue.distance ? `${venue.distance.toFixed(1)} mi` : "Nearby"}
                        </Text>
                    </View>
                </View>

                {context && (
                    <View className="items-end">
                        <View
                            className="flex-row items-center px-3 py-1.5 rounded-full"
                            style={{ backgroundColor: context.activityColor + "20" }}
                        >
                            <Text
                                style={{ color: context.activityColor }}
                                className="font-bold text-sm"
                            >
                                {context.activityLevel.toUpperCase()}
                            </Text>
                        </View>
                        {context.waitTime && (
                            <Text className="text-muted-foreground text-xs mt-1">
                                {context.waitTime} wait
                            </Text>
                        )}
                    </View>
                )}
            </View>

            {/* Quick info row */}
            {context && (
                <View className="flex-row items-center mt-3 pt-3 border-t border-border">
                    <View className="flex-row items-center mr-4">
                        <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                        <Text className="text-muted-foreground text-xs ml-1">
                            Best: {context.bestTime}
                        </Text>
                    </View>
                    <View className="flex-row items-center">
                        <Ionicons name="sunny-outline" size={14} color="#9CA3AF" />
                        <Text className="text-muted-foreground text-xs ml-1">
                            {context.weatherScore}% conditions
                        </Text>
                    </View>
                </View>
            )}
        </TouchableOpacity>
    )
}

export default function GlobalLiveScreen() {
    const { preferences } = useUserPreferences()
    const [venues, setVenues] = useState<any[]>([])
    const [venueContexts, setVenueContexts] = useState<Map<string, SportContext>>(new Map())
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [selectedSport, setSelectedSport] = useState<Sport | "all">("all")

    const primaryActivity = getPrimaryActivity(preferences.activities)

    // Sports to show
    const sports: Sport[] = ["basketball", "tennis", "pickleball", "volleyball", "swimming", "golf"]

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            // Get nearby venues
            const nearbyVenues = await venueService.getVenuesNearby({ lat: 40.7, lng: -74.0 }, 10)
            setVenues(nearbyVenues.slice(0, 20))

            // Load sport context for each
            const contexts = new Map<string, SportContext>()
            const sportMap: Record<string, Sport> = {
                "Basketball": "basketball",
                "Tennis": "tennis",
                "Pickleball": "pickleball",
                "Swimming": "swimming",
                "Golf": "golf",
                "Volleyball": "volleyball",
            }

            for (const venue of nearbyVenues.slice(0, 20)) {
                try {
                    const sport = sportMap[venue.type || ""] || "basketball"
                    const context = await getSportContext(venue.id, sport)
                    contexts.set(venue.id, context)
                } catch (err) {
                    console.error("Error loading context for", venue.id)
                }
            }

            setVenueContexts(contexts)
        } catch (error) {
            console.error("Error loading global data:", error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    const handleRefresh = () => {
        setRefreshing(true)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        loadData()
    }

    // Calculate global stats
    const totalVenues = venues.length
    const activeVenues = Array.from(venueContexts.values()).filter(
        c => c.activityLevel !== "dead" && c.activityLevel !== "quiet"
    ).length
    const totalPlayers = Array.from(venueContexts.values())
        .reduce((sum, c) => sum + (c.magicNumber?.current || 0), 0)

    // Filter venues by sport
    const filteredVenues = selectedSport === "all"
        ? venues
        : venues.filter(v => {
            const sportMap: Record<string, Sport> = {
                "Basketball": "basketball",
                "Tennis": "tennis",
                "Pickleball": "pickleball",
                "Swimming": "swimming",
                "Golf": "golf",
                "Volleyball": "volleyball",
            }
            return sportMap[v.type] === selectedSport
        })

    if (loading) {
        return (
            <LinearGradient colors={["#0A0A0A", "#141414"]} style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text className="text-muted-foreground mt-4">Loading global activity...</Text>
            </LinearGradient>
        )
    }

    return (
        <LinearGradient colors={["#0A0A0A", "#141414"]} style={{ flex: 1 }}>
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor="#8B5CF6"
                    />
                }
            >
                {/* Header */}
                <View className="pt-14 pb-4 px-6">
                    <View className="flex-row items-center justify-between">
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text className="text-white text-xl font-bold">Global Live</Text>
                        <View style={{ width: 24 }} />
                    </View>
                </View>

                {/* Global Stats */}
                <View className="px-6 mb-6">
                    <View className="flex-row items-center mb-3">
                        <View className="w-3 h-3 rounded-full bg-green-500 mr-2 animate-pulse" />
                        <Text className="text-primary font-semibold">Live Activity</Text>
                    </View>

                    <View className="flex-row gap-3">
                        <LiveStatCard
                            icon="map"
                            value={totalVenues}
                            label="Venues Tracked"
                            color="#8B5CF6"
                        />
                        <LiveStatCard
                            icon="flash"
                            value={activeVenues}
                            label="Active Now"
                            color="#22C55E"
                        />
                        <LiveStatCard
                            icon="people"
                            value={totalPlayers}
                            label="Players"
                            color="#F97316"
                        />
                    </View>
                </View>

                {/* Sport Filter */}
                <View className="px-6 mb-4">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <TouchableOpacity
                            className={`px-4 py-2 rounded-full mr-2 ${selectedSport === "all" ? "bg-primary" : "bg-card border border-border"
                                }`}
                            onPress={() => setSelectedSport("all")}
                        >
                            <Text className={selectedSport === "all" ? "text-black font-bold" : "text-foreground"}>
                                All Sports
                            </Text>
                        </TouchableOpacity>

                        {sports.map(sport => {
                            const config = getSportConfig(sport)
                            return (
                                <TouchableOpacity
                                    key={sport}
                                    className={`flex-row items-center px-4 py-2 rounded-full mr-2 ${selectedSport === sport ? "bg-primary" : "bg-card border border-border"
                                        }`}
                                    onPress={() => setSelectedSport(sport)}
                                >
                                    <Text className="mr-1">{config.icon}</Text>
                                    <Text className={selectedSport === sport ? "text-black font-bold" : "text-foreground"}>
                                        {config.name}
                                    </Text>
                                </TouchableOpacity>
                            )
                        })}
                    </ScrollView>
                </View>

                {/* Activity Breakdown */}
                <View className="px-6 mb-4">
                    <Text className="text-foreground font-bold text-lg mb-3">
                        Activity Breakdown
                    </Text>

                    <View className="flex-row">
                        {["packed", "busy", "active", "quiet", "dead"].map(level => {
                            const count = Array.from(venueContexts.values()).filter(
                                c => c.activityLevel === level
                            ).length
                            const color = LEVEL_COLORS[level as keyof typeof LEVEL_COLORS]
                            return (
                                <View key={level} className="flex-1 items-center">
                                    <View
                                        className="w-8 h-8 rounded-full items-center justify-center mb-1"
                                        style={{ backgroundColor: color + "30" }}
                                    >
                                        <Text className="font-bold" style={{ color }}>
                                            {count}
                                        </Text>
                                    </View>
                                    <Text className="text-muted-foreground text-xs capitalize">
                                        {level}
                                    </Text>
                                </View>
                            )
                        })}
                    </View>
                </View>

                {/* Venue List */}
                <View className="px-6 pb-8">
                    <Text className="text-foreground font-bold text-lg mb-3">
                        Nearby Courts ({filteredVenues.length})
                    </Text>

                    {filteredVenues.map(venue => (
                        <VenueActivityRow
                            key={venue.id}
                            venue={venue}
                            context={venueContexts.get(venue.id) || null}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                router.push(`/venues/${venue.id}`)
                            }}
                        />
                    ))}

                    {filteredVenues.length === 0 && (
                        <View className="py-12 items-center">
                            <Ionicons name="search" size={48} color="#6B7280" />
                            <Text className="text-muted-foreground mt-4">
                                No venues found for this sport
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </LinearGradient>
    )
}
