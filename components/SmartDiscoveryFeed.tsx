/**
 * Smart Discovery Feed
 * AI-curated personalized home feed
 * 
 * "Because you play pickleball..."
 * "Trending in Atlanta"
 * "Available tonight"
 */

import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Image,
    ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"

import { useAuth } from "@/lib/auth-context"
import { smartDiscoveryService, DiscoveryItem } from "@/lib/services/smart-discovery-service"
import { crowdLevelService } from "@/lib/services/crowd-level-service"
import { LaunchCityId } from "@/lib/launch-cities"

interface Props {
    city: LaunchCityId
}

export function SmartDiscoveryFeed({ city }: Props) {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [forYouItems, setForYouItems] = useState<DiscoveryItem[]>([])
    const [trendingItems, setTrendingItems] = useState<DiscoveryItem[]>([])

    useEffect(() => {
        loadFeed()
    }, [user?.uid, city])

    const loadFeed = async () => {
        setLoading(true)
        try {
            const [forYou, trending] = await Promise.all([
                smartDiscoveryService.getForYouItems(user?.uid || "guest", city),
                smartDiscoveryService.getTrendingItems(city),
            ])
            setForYouItems(forYou)
            setTrendingItems(trending)
        } catch (error) {
            console.error("Error loading feed:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleItemPress = (item: DiscoveryItem) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

        // Record interaction
        if (user?.uid) {
            smartDiscoveryService.recordInteraction(user.uid, item.id, "click")
        }

        // Navigate based on action type
        switch (item.actionType) {
            case "view_venue":
                router.push(`/venues?sport=${item.sport}&city=${item.city}`)
                break
            case "view_trainer":
                router.push(`/(tabs)/trainers?sport=${item.sport}`)
                break
            case "view_league":
                router.push(`/leagues?sport=${item.sport}&city=${item.city}`)
                break
            case "book_now":
                router.push(`/(tabs)/explore`)
                break
        }
    }

    const getItemIcon = (type: DiscoveryItem["type"]): string => {
        switch (type) {
            case "recommended_venue": return "star"
            case "trending_sport": return "trending-up"
            case "new_trainer": return "person"
            case "new_venue": return "location"
            case "popular_league": return "trophy"
            case "weather_suggestion": return "sunny"
            case "time_based": return "time"
            case "social": return "people"
            default: return "sparkles"
        }
    }

    const getItemColor = (type: DiscoveryItem["type"]): string => {
        switch (type) {
            case "recommended_venue": return "#FFD700"
            case "trending_sport": return "#FF6B6B"
            case "new_trainer": return "#8B5CF6"
            case "popular_league": return "#7ED957"
            case "time_based": return "#FF9500"
            default: return "#7ED957"
        }
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#7ED957" />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            {/* For You Section */}
            {forYouItems.length > 0 && (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="sparkles" size={20} color="#7ED957" />
                        <Text style={styles.sectionTitle}>For You</Text>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalScroll}
                    >
                        {forYouItems.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.forYouCard}
                                onPress={() => handleItemPress(item)}
                            >
                                <LinearGradient
                                    colors={["#1A1A1A", "#0A0A0A"]}
                                    style={styles.forYouCardGradient}
                                >
                                    <View style={[styles.iconBadge, { backgroundColor: getItemColor(item.type) + "20" }]}>
                                        <Ionicons
                                            name={getItemIcon(item.type) as any}
                                            size={24}
                                            color={getItemColor(item.type)}
                                        />
                                    </View>
                                    <Text style={styles.forYouTitle} numberOfLines={2}>
                                        {item.title}
                                    </Text>
                                    <Text style={styles.forYouSubtitle} numberOfLines={1}>
                                        {item.subtitle}
                                    </Text>
                                    <View style={styles.reasonBadge}>
                                        <Ionicons name="bulb-outline" size={12} color="#7ED957" />
                                        <Text style={styles.reasonText}>{item.reason}</Text>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Trending Section */}
            {trendingItems.length > 0 && (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="trending-up" size={20} color="#FF6B6B" />
                        <Text style={styles.sectionTitle}>Trending in {smartDiscoveryService.getCityName(city)}</Text>
                    </View>

                    <View style={styles.trendingGrid}>
                        {trendingItems.slice(0, 3).map((item, index) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.trendingCard}
                                onPress={() => handleItemPress(item)}
                            >
                                <View style={styles.trendingRank}>
                                    <Text style={styles.trendingRankText}>#{index + 1}</Text>
                                </View>
                                <View style={styles.trendingContent}>
                                    <Text style={styles.trendingTitle}>{item.title}</Text>
                                    <View style={styles.trendingGrowth}>
                                        <Ionicons name="arrow-up" size={14} color="#7ED957" />
                                        <Text style={styles.trendingGrowthText}>{item.subtitle}</Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#666" />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            {/* Quick Actions */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="flash" size={20} color="#FFD700" />
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                </View>

                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={styles.quickActionBtn}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                            router.push("/(tabs)/explore")
                        }}
                    >
                        <LinearGradient colors={["#7ED957", "#4C9E29"]} style={styles.quickActionGradient}>
                            <Ionicons name="tennisball" size={24} color="#000" />
                        </LinearGradient>
                        <Text style={styles.quickActionText}>Book Court</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickActionBtn}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                            router.push("/(tabs)/trainers")
                        }}
                    >
                        <LinearGradient colors={["#8B5CF6", "#6D28D9"]} style={styles.quickActionGradient}>
                            <Ionicons name="person" size={24} color="#FFF" />
                        </LinearGradient>
                        <Text style={styles.quickActionText}>Find Trainer</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickActionBtn}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                            router.push("/leagues")
                        }}
                    >
                        <LinearGradient colors={["#FF6B9D", "#FF4081"]} style={styles.quickActionGradient}>
                            <Ionicons name="trophy" size={24} color="#FFF" />
                        </LinearGradient>
                        <Text style={styles.quickActionText}>Join League</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickActionBtn}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                            router.push("/(tabs)/gia")
                        }}
                    >
                        <LinearGradient colors={["#00D4FF", "#0099CC"]} style={styles.quickActionGradient}>
                            <Ionicons name="chatbubble-ellipses" size={24} color="#FFF" />
                        </LinearGradient>
                        <Text style={styles.quickActionText}>Ask GIA</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { marginTop: 8 },
    loadingContainer: { padding: 40, alignItems: "center" },

    section: { marginBottom: 24 },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
        paddingHorizontal: 20,
    },
    sectionTitle: { color: "#FFF", fontSize: 18, fontWeight: "bold" },

    horizontalScroll: { paddingHorizontal: 20, gap: 12 },

    forYouCard: {
        width: 200,
        borderRadius: 16,
        overflow: "hidden",
    },
    forYouCardGradient: {
        padding: 16,
        minHeight: 160,
    },
    iconBadge: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    forYouTitle: { color: "#FFF", fontSize: 16, fontWeight: "bold", marginBottom: 4 },
    forYouSubtitle: { color: "#888", fontSize: 13 },
    reasonBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginTop: 12,
    },
    reasonText: { color: "#7ED957", fontSize: 12 },

    trendingGrid: { paddingHorizontal: 20, gap: 8 },
    trendingCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
    },
    trendingRank: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#333",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    trendingRankText: { color: "#FFF", fontSize: 14, fontWeight: "bold" },
    trendingContent: { flex: 1 },
    trendingTitle: { color: "#FFF", fontSize: 16, fontWeight: "600" },
    trendingGrowth: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
    trendingGrowthText: { color: "#7ED957", fontSize: 13 },

    quickActions: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingHorizontal: 16,
    },
    quickActionBtn: { alignItems: "center" },
    quickActionGradient: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    quickActionText: { color: "#AAA", fontSize: 12 },
})
