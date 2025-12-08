import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useUserLocation } from "@/lib/services/location-service"
import { useState, useEffect, useRef } from "react"
import { venueService } from "@/lib/services/venue-service"
import * as Haptics from "expo-haptics"
import { SafeAreaView } from "react-native-safe-area-context"
import { PartnerCityBadge } from "@/components/partner-city-badge"

export default function ReportScreen() {
    const { location, loading: locationLoading } = useUserLocation()
    const [nearbyVenues, setNearbyVenues] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const pulseAnim = useRef(new Animated.Value(1)).current

    // Mock earnings data - in production, fetch from backend
    const earnings = {
        today: 12,
        thisWeek: 47,
        allTime: 856,
        reportsToday: 4,
        reportsTotal: 127,
        streak: 7,
        level: 3,
        xp: 2450,
        xpToNextLevel: 3000,
    }

    useEffect(() => {
        if (!locationLoading) {
            loadNearbyVenues()
        }

        // Pulse animation for CTA
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        )
        pulse.start()
        return () => pulse.stop()
    }, [locationLoading])

    const loadNearbyVenues = async () => {
        setLoading(true)
        const venues = await venueService.getVenuesNearby(location, 10, undefined, 10)
        setNearbyVenues(venues)
        setLoading(false)
    }

    const handlePress = (action: () => void) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        action()
    }

    const levelNames = ["Rookie", "Scout", "Reporter", "Expert", "Legend"]
    const progressPercent = (earnings.xp / earnings.xpToNextLevel) * 100

    return (
        <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* Partner City Badge */}
                    <PartnerCityBadge />

                    {/* Earnings Dashboard - Hero Section */}
                    <View style={styles.earningsHero}>
                        <LinearGradient
                            colors={["rgba(126, 217, 87, 0.2)", "rgba(126, 217, 87, 0.05)"]}
                            style={styles.earningsGradient}
                        >
                            <View style={styles.earningsHeader}>
                                <View>
                                    <Text style={styles.earningsLabel}>Your Earnings</Text>
                                    <Text style={styles.earningsTotal}>${earnings.allTime}</Text>
                                </View>
                                <View style={styles.streakBadge}>
                                    <Text style={styles.streakEmoji}>🔥</Text>
                                    <Text style={styles.streakText}>{earnings.streak} day streak</Text>
                                </View>
                            </View>

                            <View style={styles.earningsRow}>
                                <View style={styles.earningsStat}>
                                    <Text style={styles.earningsValue}>${earnings.today}</Text>
                                    <Text style={styles.earningsSubLabel}>Today</Text>
                                </View>
                                <View style={styles.earningsDivider} />
                                <View style={styles.earningsStat}>
                                    <Text style={styles.earningsValue}>${earnings.thisWeek}</Text>
                                    <Text style={styles.earningsSubLabel}>This Week</Text>
                                </View>
                                <View style={styles.earningsDivider} />
                                <View style={styles.earningsStat}>
                                    <Text style={styles.earningsValue}>{earnings.reportsTotal}</Text>
                                    <Text style={styles.earningsSubLabel}>Reports</Text>
                                </View>
                            </View>

                            {/* Level Progress */}
                            <View style={styles.levelContainer}>
                                <View style={styles.levelHeader}>
                                    <View style={styles.levelBadge}>
                                        <Text style={styles.levelNumber}>LVL {earnings.level}</Text>
                                    </View>
                                    <Text style={styles.levelName}>{levelNames[earnings.level - 1]}</Text>
                                    <Text style={styles.xpText}>{earnings.xp} / {earnings.xpToNextLevel} XP</Text>
                                </View>
                                <View style={styles.progressBar}>
                                    <LinearGradient
                                        colors={["#7ED957", "#65A30D"]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={[styles.progressFill, { width: `${progressPercent}%` }]}
                                    />
                                </View>
                            </View>
                        </LinearGradient>
                    </View>

                    {/* Quick Report CTA - The Big Button */}
                    <View style={styles.section}>
                        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                            <TouchableOpacity
                                style={styles.bigReportButton}
                                onPress={() => handlePress(() => router.push("/report-facility/quick"))}
                                activeOpacity={0.9}
                            >
                                <LinearGradient
                                    colors={["#7ED957", "#65A30D"]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.bigReportGradient}
                                >
                                    <View style={styles.bigReportIcon}>
                                        <Ionicons name="camera" size={32} color="#000" />
                                    </View>
                                    <View style={styles.bigReportText}>
                                        <Text style={styles.bigReportTitle}>📸 Quick Report</Text>
                                        <Text style={styles.bigReportDesc}>Snap a photo, earn $1-31 instantly</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={28} color="#000" />
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>

                    {/* What You Can Earn */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>💰 What You Can Earn</Text>
                        <View style={styles.earnGrid}>
                            <View style={styles.earnCard}>
                                <Text style={styles.earnAmount}>$1-5</Text>
                                <Text style={styles.earnAction}>Basic</Text>
                            </View>
                            <View style={styles.earnCard}>
                                <Text style={styles.earnAmount}>$5-15</Text>
                                <Text style={styles.earnAction}>Photo</Text>
                            </View>
                            <View style={[styles.earnCard, styles.earnCardHighlight]}>
                                <Text style={styles.earnAmount}>$15-31</Text>
                                <Text style={styles.earnAction}>Full</Text>
                            </View>
                        </View>
                    </View>

                    {/* Nearby Courts */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>📍 Courts Near You</Text>
                            <TouchableOpacity onPress={() => router.push("/(tabs)/explore")}>
                                <Text style={styles.seeAll}>View Map</Text>
                            </TouchableOpacity>
                        </View>

                        {loading ? (
                            <Text style={styles.loadingText}>Finding courts...</Text>
                        ) : nearbyVenues.length > 0 ? (
                            nearbyVenues.slice(0, 5).map((venue) => (
                                <TouchableOpacity
                                    key={venue.id}
                                    style={styles.venueCard}
                                    onPress={() => handlePress(() => router.push(`/report-facility/${venue.id}`))}
                                >
                                    <View style={styles.venueIcon}>
                                        <Ionicons name="location" size={24} color="#7ED957" />
                                    </View>
                                    <View style={styles.venueInfo}>
                                        <Text style={styles.venueName}>{venue.name}</Text>
                                        <Text style={styles.venueAddress}>{venue.address}</Text>
                                    </View>
                                    <View style={styles.venueEarn}>
                                        <Text style={styles.venueEarnAmount}>+${Math.floor(Math.random() * 20) + 5}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <TouchableOpacity
                                style={styles.emptyButton}
                                onPress={() => router.push("/report-facility/quick")}
                            >
                                <Text style={styles.emptyButtonText}>Report Any Court</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Impact Stats */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🌍 Your Impact</Text>
                        <View style={styles.impactCard}>
                            <View style={styles.impactRow}>
                                <View style={styles.impactStat}>
                                    <Text style={styles.impactValue}>127</Text>
                                    <Text style={styles.impactLabel}>Reports</Text>
                                </View>
                                <View style={styles.impactStat}>
                                    <Text style={styles.impactValue}>342</Text>
                                    <Text style={styles.impactLabel}>Helped</Text>
                                </View>
                                <View style={styles.impactStat}>
                                    <Text style={styles.impactValue}>89kg</Text>
                                    <Text style={styles.impactLabel}>CO₂ Saved</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    scrollView: { flex: 1 },
    earningsHero: {
        marginHorizontal: 16,
        marginTop: 8,
        borderRadius: 24,
        overflow: "hidden",
    },
    earningsGradient: {
        padding: 20,
        borderWidth: 1,
        borderColor: "rgba(126, 217, 87, 0.3)",
        borderRadius: 24,
    },
    earningsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 20,
    },
    earningsLabel: { fontSize: 14, color: "#9CA3AF", marginBottom: 4 },
    earningsTotal: { fontSize: 48, fontWeight: "bold", color: "#7ED957" },
    streakBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(251, 191, 36, 0.2)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    streakEmoji: { fontSize: 16, marginRight: 4 },
    streakText: { fontSize: 12, fontWeight: "bold", color: "#FBBF24" },
    earningsRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.1)",
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.1)",
        marginBottom: 16,
    },
    earningsStat: { alignItems: "center" },
    earningsValue: { fontSize: 24, fontWeight: "bold", color: "#FFFFFF" },
    earningsSubLabel: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
    earningsDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.1)" },
    levelContainer: { marginTop: 4 },
    levelHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
    levelBadge: {
        backgroundColor: "#7ED957",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginRight: 8,
    },
    levelNumber: { fontSize: 10, fontWeight: "bold", color: "#000" },
    levelName: { fontSize: 14, fontWeight: "bold", color: "#FFFFFF", flex: 1 },
    xpText: { fontSize: 12, color: "#9CA3AF" },
    progressBar: {
        height: 8,
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 4,
        overflow: "hidden",
    },
    progressFill: { height: "100%", borderRadius: 4 },
    section: { paddingHorizontal: 16, marginTop: 24 },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    sectionTitle: { fontSize: 20, fontWeight: "bold", color: "#FFFFFF", marginBottom: 16 },
    seeAll: { fontSize: 14, fontWeight: "600", color: "#7ED957" },
    bigReportButton: {
        borderRadius: 20,
        overflow: "hidden",
        shadowColor: "#7ED957",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    bigReportGradient: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    bigReportIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "rgba(0,0,0,0.2)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    bigReportText: { flex: 1 },
    bigReportTitle: { fontSize: 20, fontWeight: "bold", color: "#000", marginBottom: 4 },
    bigReportDesc: { fontSize: 14, color: "rgba(0,0,0,0.7)" },
    earnGrid: { flexDirection: "row", gap: 12 },
    earnCard: {
        flex: 1,
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#252525",
    },
    earnCardHighlight: {
        borderColor: "#7ED957",
        backgroundColor: "rgba(126, 217, 87, 0.1)",
    },
    earnAmount: { fontSize: 20, fontWeight: "bold", color: "#7ED957", marginBottom: 4 },
    earnAction: { fontSize: 12, fontWeight: "bold", color: "#FFFFFF" },
    venueCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#252525",
        marginBottom: 12,
    },
    venueIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "rgba(126, 217, 87, 0.2)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    venueInfo: { flex: 1 },
    venueName: { fontSize: 16, fontWeight: "bold", color: "#FFFFFF", marginBottom: 4 },
    venueAddress: { fontSize: 12, color: "#9CA3AF" },
    venueEarn: { alignItems: "flex-end" },
    venueEarnAmount: { fontSize: 16, fontWeight: "bold", color: "#7ED957" },
    loadingText: { fontSize: 14, color: "#9CA3AF", textAlign: "center", paddingVertical: 20 },
    emptyButton: {
        backgroundColor: "#7ED957",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        alignSelf: "center",
    },
    emptyButtonText: { fontSize: 14, fontWeight: "bold", color: "#000" },
    impactCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: "#252525",
    },
    impactRow: { flexDirection: "row", justifyContent: "space-around" },
    impactStat: { alignItems: "center" },
    impactValue: { fontSize: 28, fontWeight: "bold", color: "#7ED957" },
    impactLabel: { fontSize: 12, color: "#9CA3AF", marginTop: 4 },
})
