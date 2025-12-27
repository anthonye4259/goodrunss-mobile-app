/**
 * Search Screen
 * 
 * Universal search for courts, trainers, and facilities.
 * Features:
 * - Real-time search with fuzzy name matching
 * - Recent searches (persisted)
 * - Category tabs
 * - Live traffic badges on court results
 */

import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Keyboard } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useState, useEffect, useMemo } from "react"
import { router } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import * as Haptics from "expo-haptics"
import AsyncStorage from "@react-native-async-storage/async-storage"

import { LiveTrafficBadge } from "@/components/Live/LiveTrafficBadge"

// Mock data - would come from service in production
const ALL_COURTS = [
    { id: "f1", name: "Piedmont Park Courts", type: "free", sport: "Tennis", distance: 0.8, liveStatus: "busy" as const, playersNow: 8 },
    { id: "f2", name: "Grant Park Recreation", type: "free", sport: "Basketball", distance: 1.2, liveStatus: "quiet" as const, playersNow: 2 },
    { id: "f3", name: "Chastain Park", type: "free", sport: "Tennis", distance: 2.1, liveStatus: "moderate" as const, playersNow: 5 },
    { id: "f4", name: "Candler Park", type: "free", sport: "Pickleball", distance: 1.8, liveStatus: "packed" as const, playersNow: 14 },
    { id: "c1", name: "Georgia Tech Recreation Center", type: "college", sport: "All", distance: 1.5, liveStatus: "moderate" as const, playersNow: 12 },
    { id: "c2", name: "Emory University Courts", type: "college", sport: "Tennis", distance: 3.2, liveStatus: "quiet" as const, playersNow: 3 },
    { id: "c3", name: "Georgia State Recreation", type: "college", sport: "Basketball", distance: 0.9, liveStatus: "busy" as const, playersNow: 9 },
    { id: "m1", name: "LA Fitness - Buckhead", type: "gym", sport: "Basketball", distance: 1.1, liveStatus: "moderate" as const, playersNow: 4 },
    { id: "m2", name: "Lifetime Fitness - Perimeter", type: "gym", sport: "Tennis", distance: 4.8, liveStatus: "quiet" as const, playersNow: 2 },
    { id: "v1", name: "Atlanta Tennis Center", type: "venue", sport: "Tennis", distance: 2.5, liveStatus: "busy" as const, playersNow: 18 },
    { id: "v2", name: "Peachtree Hills Recreation", type: "venue", sport: "Pickleball", distance: 3.1, liveStatus: "moderate" as const, playersNow: 6 },
]

const ALL_TRAINERS = [
    { id: "t1", name: "Marcus Johnson", sport: "Tennis", rating: 4.9, price: 75 },
    { id: "t2", name: "Sarah Williams", sport: "Basketball", rating: 4.8, price: 60 },
    { id: "t3", name: "David Chen", sport: "Pickleball", rating: 4.9, price: 55 },
    { id: "t4", name: "Emily Rodriguez", sport: "Tennis", rating: 4.7, price: 65 },
]

const RECENT_SEARCHES_KEY = "recent_searches"
const MAX_RECENT = 8

// Simple fuzzy match - scores how well query matches text
function fuzzyMatch(query: string, text: string): number {
    const q = query.toLowerCase().trim()
    const t = text.toLowerCase()

    if (!q) return 0
    if (t.includes(q)) return 100 // Exact substring match

    // Check if all characters in query appear in order
    let score = 0
    let lastIndex = -1
    for (const char of q) {
        const index = t.indexOf(char, lastIndex + 1)
        if (index === -1) return 0 // Character not found
        score += (index === lastIndex + 1) ? 10 : 5 // Consecutive chars get more points
        lastIndex = index
    }

    return score
}

export default function SearchScreen() {
    const [query, setQuery] = useState("")
    const [category, setCategory] = useState<"all" | "courts" | "trainers">("all")
    const [recentSearches, setRecentSearches] = useState<string[]>([])
    const [isFocused, setIsFocused] = useState(true)

    // Load recent searches on mount
    useEffect(() => {
        loadRecentSearches()
    }, [])

    const loadRecentSearches = async () => {
        try {
            const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY)
            if (stored) {
                setRecentSearches(JSON.parse(stored))
            }
        } catch (error) {
            console.log("Failed to load recent searches:", error)
        }
    }

    const saveRecentSearch = async (searchTerm: string) => {
        if (!searchTerm.trim()) return

        const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, MAX_RECENT)
        setRecentSearches(updated)

        try {
            await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
        } catch (error) {
            console.log("Failed to save recent search:", error)
        }
    }

    const clearRecentSearches = async () => {
        setRecentSearches([])
        try {
            await AsyncStorage.removeItem(RECENT_SEARCHES_KEY)
        } catch (error) {
            console.log("Failed to clear recent searches:", error)
        }
    }

    // Filter and sort results by fuzzy match score
    const courtResults = useMemo(() => {
        if (!query.trim()) return []

        return ALL_COURTS
            .map(court => ({
                ...court,
                score: fuzzyMatch(query, court.name) + fuzzyMatch(query, court.sport) * 0.5
            }))
            .filter(court => court.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
    }, [query])

    const trainerResults = useMemo(() => {
        if (!query.trim()) return []

        return ALL_TRAINERS
            .map(trainer => ({
                ...trainer,
                score: fuzzyMatch(query, trainer.name) + fuzzyMatch(query, trainer.sport) * 0.5
            }))
            .filter(trainer => trainer.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)
    }, [query])

    const handleResultPress = (item: typeof ALL_COURTS[0] | typeof ALL_TRAINERS[0], type: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        saveRecentSearch(item.name)

        if (type === "court") {
            router.push("/(tabs)/live")
        } else if (type === "trainer") {
            router.push(`/trainers/${item.id}`)
        }
    }

    const handleRecentPress = (term: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        setQuery(term)
    }

    const showResults = query.trim().length > 0
    const hasResults = courtResults.length > 0 || trainerResults.length > 0

    return (
        <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                {/* Header with Search Input */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                            router.back()
                        }}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>

                    <View style={[styles.searchInputContainer, isFocused && styles.searchInputFocused]}>
                        <Ionicons name="search" size={20} color="#888" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search courts, trainers..."
                            placeholderTextColor="#666"
                            value={query}
                            onChangeText={setQuery}
                            autoFocus
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            returnKeyType="search"
                            onSubmitEditing={() => {
                                if (query.trim()) {
                                    saveRecentSearch(query.trim())
                                    Keyboard.dismiss()
                                }
                            }}
                        />
                        {query.length > 0 && (
                            <TouchableOpacity onPress={() => setQuery("")}>
                                <Ionicons name="close-circle" size={20} color="#666" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Category Tabs */}
                <View style={styles.categoryTabs}>
                    {(["all", "courts", "trainers"] as const).map(cat => (
                        <TouchableOpacity
                            key={cat}
                            style={[styles.categoryTab, category === cat && styles.categoryTabActive]}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                setCategory(cat)
                            }}
                        >
                            <Text style={[styles.categoryTabText, category === cat && styles.categoryTabTextActive]}>
                                {cat === "all" ? "All" : cat === "courts" ? "Courts" : "Trainers"}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Recent Searches - Show when no query */}
                    {!showResults && recentSearches.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Recent Searches</Text>
                                <TouchableOpacity onPress={clearRecentSearches}>
                                    <Text style={styles.clearText}>Clear</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.recentList}>
                                {recentSearches.map((term, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.recentItem}
                                        onPress={() => handleRecentPress(term)}
                                    >
                                        <Ionicons name="time-outline" size={16} color="#666" />
                                        <Text style={styles.recentText}>{term}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* No Results */}
                    {showResults && !hasResults && (
                        <View style={styles.noResults}>
                            <Ionicons name="search-outline" size={48} color="#444" />
                            <Text style={styles.noResultsText}>No results for "{query}"</Text>
                            <Text style={styles.noResultsHint}>Try searching by court name or sport</Text>
                        </View>
                    )}

                    {/* Court Results */}
                    {showResults && (category === "all" || category === "courts") && courtResults.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Courts</Text>
                            {courtResults.map(court => (
                                <TouchableOpacity
                                    key={court.id}
                                    style={styles.resultCard}
                                    onPress={() => handleResultPress(court, "court")}
                                >
                                    <View style={styles.resultLeft}>
                                        <View style={[styles.resultIcon, { backgroundColor: getTypeColor(court.type) + "20" }]}>
                                            <Ionicons
                                                name={getTypeIcon(court.type) as any}
                                                size={20}
                                                color={getTypeColor(court.type)}
                                            />
                                        </View>
                                        <View style={styles.resultInfo}>
                                            <Text style={styles.resultName}>{court.name}</Text>
                                            <View style={styles.resultMeta}>
                                                <Text style={styles.resultSport}>{court.sport}</Text>
                                                <Text style={styles.resultDot}>•</Text>
                                                <Text style={styles.resultDistance}>{court.distance} mi</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <LiveTrafficBadge
                                        level={court.liveStatus}
                                        playersNow={court.playersNow}
                                        size="small"
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Trainer Results */}
                    {showResults && (category === "all" || category === "trainers") && trainerResults.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Trainers</Text>
                            {trainerResults.map(trainer => (
                                <TouchableOpacity
                                    key={trainer.id}
                                    style={styles.resultCard}
                                    onPress={() => handleResultPress(trainer, "trainer")}
                                >
                                    <View style={styles.resultLeft}>
                                        <View style={[styles.resultIcon, { backgroundColor: "#8B5CF620" }]}>
                                            <Ionicons name="person" size={20} color="#8B5CF6" />
                                        </View>
                                        <View style={styles.resultInfo}>
                                            <Text style={styles.resultName}>{trainer.name}</Text>
                                            <View style={styles.resultMeta}>
                                                <Text style={styles.resultSport}>{trainer.sport}</Text>
                                                <Text style={styles.resultDot}>•</Text>
                                                <Ionicons name="star" size={12} color="#FFD700" />
                                                <Text style={styles.resultRating}>{trainer.rating}</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <Text style={styles.trainerPrice}>${trainer.price}/hr</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    <View style={{ height: 100 }} />
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    )
}

// Helper functions
function getTypeColor(type: string): string {
    switch (type) {
        case "free": return "#22C55E"
        case "college": return "#3B82F6"
        case "gym": return "#EC4899"
        default: return "#7ED957"
    }
}

function getTypeIcon(type: string): string {
    switch (type) {
        case "free": return "tennisball"
        case "college": return "school"
        case "gym": return "barbell"
        default: return "business"
    }
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },

    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#1A1A1A",
        alignItems: "center",
        justifyContent: "center",
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 10,
        borderWidth: 1,
        borderColor: "#252525",
    },
    searchInputFocused: {
        borderColor: "#7ED957",
    },
    searchInput: {
        flex: 1,
        color: "#FFF",
        fontSize: 16,
    },

    categoryTabs: {
        flexDirection: "row",
        paddingHorizontal: 16,
        marginBottom: 16,
        gap: 8,
    },
    categoryTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "#1A1A1A",
        borderWidth: 1,
        borderColor: "#252525",
    },
    categoryTabActive: {
        backgroundColor: "#7ED957",
        borderColor: "#7ED957",
    },
    categoryTabText: {
        color: "#888",
        fontSize: 14,
        fontWeight: "600",
    },
    categoryTabTextActive: {
        color: "#000",
    },

    section: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    sectionTitle: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 12,
    },
    clearText: {
        color: "#7ED957",
        fontSize: 14,
    },

    recentList: {
        gap: 8,
    },
    recentItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
    },
    recentText: {
        color: "#CCC",
        fontSize: 15,
    },

    noResults: {
        alignItems: "center",
        paddingTop: 60,
    },
    noResultsText: {
        color: "#888",
        fontSize: 16,
        marginTop: 16,
    },
    noResultsHint: {
        color: "#666",
        fontSize: 14,
        marginTop: 8,
    },

    resultCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#252525",
    },
    resultLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    resultIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    resultInfo: {
        flex: 1,
    },
    resultName: {
        color: "#FFF",
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 4,
    },
    resultMeta: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    resultSport: {
        color: "#888",
        fontSize: 13,
    },
    resultDot: {
        color: "#444",
    },
    resultDistance: {
        color: "#888",
        fontSize: 13,
    },
    resultRating: {
        color: "#FFD700",
        fontSize: 13,
        fontWeight: "600",
        marginLeft: 2,
    },
    trainerPrice: {
        color: "#7ED957",
        fontSize: 15,
        fontWeight: "700",
    },
})
