/**
 * Facility Dashboard
 * Owner dashboard to manage courts, bookings, and earnings
 */

import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    StyleSheet,
    ActivityIndicator,
    TextInput,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"

import { useAuth } from "@/lib/auth-context"
import { facilityService, ClaimedFacility, Court } from "@/lib/services/facility-service"
import { courtBookingService, CourtBooking } from "@/lib/services/court-booking-service"
import { aiSlotFillingService, SlotSuggestion } from "@/lib/services/ai-slot-filling-service"
import { FACILITY_SUBSCRIPTION } from "@/lib/services/facility-subscription-service"
import { UpgradePrompt } from "@/components/Facility/UpgradePrompt"
import { WarmLeads } from "@/components/Facility/WarmLeads"

// New Facility UX Components
// Premium & Stats Components
import {
    DailyRevenueSnapshot, OccupancyRateGauge, ReviewsDashboard,
    PopularTimesChart, CustomerRetentionMetrics, BookingSourceBreakdown,
    CapacityAlerts, ShareOpenSlots,
    MaintenanceQueue, CourtConditionTracker,
    RevenueForecast, TrainerRevenueShare, PeakHoursHeatmap,
    RepeatBookerLeaderboard, AnnouncementBroadcaster,
    WaitlistManager, NoShowTracker, QuickBlockTimes,
    PendingBookingsBadge, MaintenanceDueIndicator
} from "@/components/Facility"
import { MissedRevenueCard } from "@/components/Facility/MissedRevenueCard"

// Analytics Service for Real Data
import {
    facilityAnalyticsService,
    DailyRevenueData,
    OccupancyData,
    PopularTimesData,
    CustomerRetentionData,
    BookingSourceData,
    ReviewsData,
    CapacityAlert,
    RevenueForecastData,
    TrainerRevenueData,
    RepeatBooker,
    NoShowData,
} from "@/lib/services/facility-analytics-service"

export default function FacilityDashboardScreen() {
    const { user } = useAuth()

    // State
    const [facility, setFacility] = useState<ClaimedFacility | null>(null)
    const [courts, setCourts] = useState<Court[]>([])
    const [bookings, setBookings] = useState<CourtBooking[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<"overview" | "bookings" | "courts" | "earnings" | "leads">("overview")

    // Add court modal state
    const [showAddCourt, setShowAddCourt] = useState(false)
    const [newCourtName, setNewCourtName] = useState("")
    const [newCourtType, setNewCourtType] = useState("Outdoor")
    const [newCourtRate, setNewCourtRate] = useState("40")

    // AI & Upgrade state
    const [showUpgradeModal, setShowUpgradeModal] = useState(false)
    const [monthlyRevenue, setMonthlyRevenue] = useState(0) // Tracked revenue

    // State Moved Up
    const [aiInsights, setAiInsights] = useState<{
        emptySlots24h: number
        emptySlots48h: number
        potentialRevenue: number
        topSuggestions: SlotSuggestion[]
        urgentSlots: number
    } | null>(null)
    const isPremium = facility?.subscriptionTier === "premium"

    // Analytics & Operations State
    const [analyticsLoading, setAnalyticsLoading] = useState(false)
    const [dailyRevenue, setDailyRevenue] = useState<DailyRevenueData | null>(null)
    const [occupancy, setOccupancy] = useState<OccupancyData | null>(null)
    const [popularTimes, setPopularTimes] = useState<PopularTimesData | null>(null)
    const [customerRetention, setCustomerRetention] = useState<CustomerRetentionData | null>(null)
    const [bookingSources, setBookingSources] = useState<BookingSourceData[]>([])
    const [reviews, setReviews] = useState<ReviewsData | null>(null)
    const [capacityAlerts, setCapacityAlerts] = useState<CapacityAlert[]>([])
    const [openSlots, setOpenSlots] = useState<{ courtName: string; date: string; time: string }[]>([])

    // New Features State
    const [maintenanceTasks, setMaintenanceTasks] = useState<any[]>([])
    const [waitlistEntries, setWaitlistEntries] = useState<any[]>([])
    const [revenueForecast, setRevenueForecast] = useState<RevenueForecastData | null>(null)
    const [trainerRevenue, setTrainerRevenue] = useState<TrainerRevenueData[]>([])
    const [repeatBookers, setRepeatBookers] = useState<RepeatBooker[]>([])
    const [noShowStats, setNoShowStats] = useState<NoShowData | null>(null)

    useEffect(() => {
        loadFacilityData()
    }, [user])

    const loadFacilityData = async () => {
        if (!user) return
        setLoading(true)

        try {
            // Get user's facilities
            const facilities = await facilityService.getFacilitiesByOwner(user.uid)
            if (facilities.length > 0) {
                const fac = facilities[0]
                setFacility(fac)

                // Load courts
                const facilityCourtsList = await facilityService.getCourts(fac.id)
                setCourts(facilityCourtsList)

                // Load recent bookings
                const recentBookings = await courtBookingService.getFacilityBookings(fac.id)
                setBookings(recentBookings)

                // Load AI insights for premium facilities
                if (fac.subscriptionTier === "premium") {
                    const insights = await aiSlotFillingService.getAIInsights(fac.id)
                    setAiInsights(insights)
                }

                // Load Real Analytics Data
                loadAnalyticsData(fac.id, fac.venueId, facilityCourtsList)
            }
        } catch (error) {
            console.error("Error loading facility:", error)
        } finally {
            setLoading(false)
        }
    }

    // Load real analytics data
    const loadAnalyticsData = async (facilityId: string, venueId: string, courtsList: Court[]) => {
        setAnalyticsLoading(true)
        try {
            const totalSlots = courtsList.length * 8 // Assuming 8 slots per court per day for occupancy calculation
            // Fetch all analytics in parallel
            const [
                revenueData,
                workingOccupancy,
                popTimes,
                retention,
                sources,
                reviewsData,
                alerts,
                slots,
                mTasks,
                waitList,
                revBroadcast,
                tRev,
                repBookers,
                noShows
            ] = await Promise.all([
                facilityAnalyticsService.getDailyRevenue(facilityId),
                facilityAnalyticsService.getOccupancyRate(facilityId, totalSlots),
                facilityAnalyticsService.getPopularTimes(facilityId),
                facilityAnalyticsService.getCustomerRetention(facilityId),
                facilityAnalyticsService.getBookingSources(facilityId),
                facilityAnalyticsService.getFacilityReviews(venueId),
                facilityAnalyticsService.getCapacityAlerts(facilityId, courtsList.map(c => ({ id: c.id, name: c.name }))),
                facilityAnalyticsService.getOpenSlots(facilityId, courtsList.map(c => ({ id: c.id, name: c.name }))),
                facilityAnalyticsService.getMaintenanceTasks(facilityId),
                facilityAnalyticsService.getWaitlist(facilityId),
                facilityAnalyticsService.getRevenueForecast(facilityId),
                facilityAnalyticsService.getTrainerRevenueShare(facilityId),
                facilityAnalyticsService.getRepeatBookers(facilityId),
                facilityAnalyticsService.getNoShowStats(facilityId)
            ])

            setDailyRevenue(revenueData)
            setOccupancy(workingOccupancy)
            setPopularTimes(popTimes)
            setCustomerRetention(retention)
            setBookingSources(sources)
            setReviews(reviewsData)
            setCapacityAlerts(alerts)
            setOpenSlots(slots)
            setMaintenanceTasks(mTasks)
            setWaitlistEntries(waitList)
            setRevenueForecast(revBroadcast)
            setTrainerRevenue(tRev)
            setRepeatBookers(repBookers)
            setNoShowStats(noShows)

        } catch (error) {
            console.error("Error loading analytics:", error)
        } finally {
            setAnalyticsLoading(false)
        }
    }

    const handleAddCourt = async () => {
        if (!newCourtName || !facility) return

        setLoading(true)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        try {
            const courtId = await facilityService.addCourt(facility.id, {
                name: newCourtName,
                type: newCourtType,
                hourlyRate: parseInt(newCourtRate) * 100, // Convert to cents
            })

            if (courtId) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                setShowAddCourt(false)
                setNewCourtName("")
                setNewCourtRate("40")
                loadFacilityData()
            }
        } catch (error) {
            console.error("Error adding court:", error)
            Alert.alert("Error", "Failed to add court")
        } finally {
            setLoading(false)
        }
    }

    // Calculate earnings
    const totalEarnings = bookings.reduce((sum, b) => sum + (b.facilityPayout || 0), 0)
    const pendingEarnings = bookings
        .filter(b => b.status === "confirmed")
        .reduce((sum, b) => sum + (b.facilityPayout || 0), 0)
    const completedEarnings = bookings
        .filter(b => b.status === "completed")
        .reduce((sum, b) => sum + (b.facilityPayout || 0), 0)

    if (loading && !facility) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7ED957" />
            </View>
        )
    }

    if (!facility) {
        return (
            <View style={styles.container}>
                <LinearGradient colors={["#0A0A0A", "#111"]} style={StyleSheet.absoluteFill} />
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.emptyState}>
                        <Ionicons name="business-outline" size={64} color="#666" />
                        <Text style={styles.emptyTitle}>No Facilities</Text>
                        <Text style={styles.emptySubtext}>
                            You haven't claimed any facilities yet. Find your facility and claim it to start receiving bookings.
                        </Text>
                        <TouchableOpacity
                            style={styles.findBtn}
                            onPress={() => router.push("/venues/map")}
                        >
                            <Text style={styles.findBtnText}>Find Your Facility</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>
        )
    }

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#7ED957" />
            </View>
        )
    }

    if (!facility) {
        // Fallback handled by the "unclaimed" view logic or specific empty state
        // For now, assume if not loading and not facility, we might show empty or return null to allow the downstream "unclaimed" view to take over if it exists
        return (
            <View style={{ flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" }}>
                <Text style={{ color: "#888" }}>Loading facility...</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={["#0A0A0A", "#111"]} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>{facility.businessName}</Text>
                        <View style={styles.verifiedBadge}>
                            <Ionicons name="shield-checkmark" size={14} color="#7ED957" />
                            <Text style={styles.verifiedText}>Verified</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.settingsBtn}
                        onPress={() => router.push(`/facility/settings?facilityId=${facility.id}`)}
                    >
                        <Ionicons name="settings-outline" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>

                {/* Missed Revenue FOMO (Free Tier Only) */}
                {!isPremium && (
                    <MissedRevenueCard
                        monthlyRevenue={monthlyRevenue || 2500} // Mock if empty
                        onUpgradePress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
                            setShowUpgradeModal(true)
                        }}
                    />
                )}

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{courts.length}</Text>
                        <Text style={styles.statLabel}>Courts</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{bookings.filter(b => b.status === "confirmed").length}</Text>
                        <Text style={styles.statLabel}>Upcoming</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.statCard}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                            if (!isPremium) {
                                setShowUpgradeModal(true)
                            } else {
                                router.push(`/facility/insights?facilityId=${facility.id}`)
                            }
                        }}
                    >
                        <Text style={[styles.statValue, { color: isPremium ? "#7ED957" : "#888" }]}>
                            ${(totalEarnings / 100).toFixed(0)}
                        </Text>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
                            <Text style={styles.statLabel}>Revenue</Text>
                            {!isPremium && <Ionicons name="lock-closed" size={10} color="#888" />}
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Complete Profile Nudge (If missing cover photo) */}
                {
                    !facility.coverPhoto && (
                        <TouchableOpacity
                            style={styles.nudgeCard}
                            onPress={() => router.push(`/facility/edit-profile?facilityId=${facility.id}`)}
                        >
                            <LinearGradient
                                colors={["#FFD700", "#FF8C00"]} // Premium Gold/Orange
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.nudgeGradient}
                            >
                                <View style={styles.nudgeContent}>
                                    <Ionicons name="images" size={24} color="#000" />
                                    <View style={styles.nudgeTextContainer}>
                                        <Text style={styles.nudgeTitle}>Add Photos & Amenities</Text>
                                        <Text style={styles.nudgeSubtitle}>
                                            Get 3x more bookings with a complete profile.
                                        </Text>
                                    </View>
                                </View>
                                <Ionicons name="arrow-forward-circle" size={28} color="#000" />
                            </LinearGradient>
                        </TouchableOpacity>
                    )
                }

                {/* Upgrade Banner (Free Tier) */}
                {
                    !isPremium && (
                        <TouchableOpacity
                            style={styles.upgradeBanner}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                                setShowUpgradeModal(true)
                            }}
                        >
                            <LinearGradient
                                colors={["#FFD700", "#FFA500"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.upgradeBannerGradient}
                            >
                                <View style={styles.upgradeBannerContent}>
                                    <Ionicons name="star" size={24} color="#000" />
                                    <View style={styles.upgradeBannerText}>
                                        <Text style={styles.upgradeBannerTitle}>Unlock 7 AI Features</Text>
                                        <Text style={styles.upgradeBannerSubtitle}>
                                            Fill more slots • Save 3% on fees • $50/mo
                                        </Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#000" />
                            </LinearGradient>
                        </TouchableOpacity>
                    )
                }

                {/* AI Insights Card (Premium) */}
                {
                    isPremium && aiInsights && (
                        <View style={styles.aiInsightsCard}>
                            <View style={styles.aiInsightsHeader}>
                                <Ionicons name="sparkles" size={20} color="#7ED957" />
                                <Text style={styles.aiInsightsTitle}>AI Slot Filling</Text>
                            </View>
                            <View style={styles.aiInsightsRow}>
                                <View style={styles.aiInsightItem}>
                                    <Text style={styles.aiInsightValue}>{aiInsights.emptySlots24h}</Text>
                                    <Text style={styles.aiInsightLabel}>Empty (24h)</Text>
                                </View>
                                <View style={styles.aiInsightItem}>
                                    <Text style={[styles.aiInsightValue, { color: "#FF9500" }]}>{aiInsights.urgentSlots}</Text>
                                    <Text style={styles.aiInsightLabel}>Urgent</Text>
                                </View>
                                <View style={styles.aiInsightItem}>
                                    <Text style={[styles.aiInsightValue, { color: "#7ED957" }]}>${aiInsights.potentialRevenue}</Text>
                                    <Text style={styles.aiInsightLabel}>Potential</Text>
                                </View>
                            </View>
                            {aiInsights.topSuggestions.length > 0 && (
                                <TouchableOpacity
                                    style={styles.fillSlotsBtn}
                                    onPress={() => router.push(`/facility/ai-slots?facilityId=${facility.id}`)}
                                >
                                    <Text style={styles.fillSlotsBtnText}>
                                        Fill {aiInsights.urgentSlots} Urgent Slots →
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )
                }

                {/* Quick Actions */}
                <View style={styles.quickActionsRow}>
                    <TouchableOpacity
                        style={styles.quickActionCard}
                        onPress={() => router.push(`/facility/bookings?facilityId=${facility.id}`)}
                    >
                        <Ionicons name="calendar" size={24} color="#7ED957" />
                        <Text style={styles.quickActionText}>View All Bookings</Text>
                        <Ionicons name="chevron-forward" size={16} color="#666" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.quickActionCard}
                        onPress={() => router.push(`/facility/insights?facilityId=${facility.id}`)}
                    >
                        <Ionicons name="analytics" size={24} color="#FFD700" />
                        <Text style={styles.quickActionText}>AI Insights</Text>
                        <Ionicons name="chevron-forward" size={16} color="#666" />
                    </TouchableOpacity>
                </View>

                {/* Pending Bookings & Quick Block */}
                <View style={styles.quickActionsRow}>
                    <TouchableOpacity
                        style={[styles.quickActionCard, styles.pendingCard]}
                        onPress={() => router.push(`/facility/pending-bookings?facilityId=${facility.id}`)}
                    >
                        <View style={styles.pendingBadge}>
                            <Ionicons name="time" size={20} color="#FF9500" />
                        </View>
                        <Text style={styles.quickActionText}>Pending Bookings</Text>
                        <Ionicons name="chevron-forward" size={16} color="#666" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.quickActionCard, styles.blockCard]}
                        onPress={() => router.push(`/facility/quick-block?facilityId=${facility.id}`)}
                    >
                        <Ionicons name="close-circle" size={24} color="#FF6B6B" />
                        <Text style={styles.quickActionText}>Quick Block</Text>
                        <Ionicons name="chevron-forward" size={16} color="#666" />
                    </TouchableOpacity>
                </View>

                {/* Tab Bar */}
                <View style={styles.tabBar}>
                    {(["overview", "bookings", "courts", "earnings", "leads"] as const).map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, activeTab === tab && styles.tabActive]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                                {tab === "leads" ? "🔥" : tab === "overview" ? "📊" : ""} {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Overview Tab - NEW */}
                    {activeTab === "overview" && (
                        <>
                            {/* Daily Revenue Hero - REAL DATA */}
                            <DailyRevenueSnapshot
                                todayRevenue={dailyRevenue?.todayRevenue ?? 0}
                                yesterdayRevenue={dailyRevenue?.yesterdayRevenue ?? 0}
                                bookingsToday={dailyRevenue?.bookingsToday ?? 0}
                                onPress={() => setActiveTab("earnings")}
                            />

                            {/* Quick Stats Row - REAL DATA */}
                            <View style={styles.overviewStatsRow}>
                                <OccupancyRateGauge
                                    occupancyPercent={occupancy?.occupancyPercent ?? 0}
                                    totalSlots={occupancy?.totalSlots ?? courts.length * 8}
                                    bookedSlots={occupancy?.bookedSlots ?? 0}
                                    variant="compact"
                                />
                            </View>

                            {/* Premium Insights Section - REAL DATA */}
                            <View style={styles.insightsSection}>
                                <Text style={styles.sectionTitle}>📈 Customer Insights</Text>

                                <PopularTimesChart
                                    data={popularTimes?.hourlyData ?? []}
                                    peakHour={popularTimes?.peakHour ?? 18}
                                    quietHour={popularTimes?.quietHour ?? 10}
                                    isPremium={isPremium}
                                    onUpgrade={() => setShowUpgradeModal(true)}
                                />

                                <CustomerRetentionMetrics
                                    newCustomers={customerRetention?.newCustomers ?? 0}
                                    returningCustomers={customerRetention?.returningCustomers ?? 0}
                                    retentionRate={customerRetention?.retentionRate ?? 0}
                                    avgVisitsPerCustomer={customerRetention?.avgVisitsPerCustomer ?? 0}
                                    churnRisk={customerRetention?.churnRisk ?? 0}
                                    isPremium={isPremium}
                                    onUpgrade={() => setShowUpgradeModal(true)}
                                />

                                <BookingSourceBreakdown
                                    sources={bookingSources}
                                    totalBookings={bookingSources.reduce((sum, s) => sum + s.count, 0)}
                                    isPremium={isPremium}
                                    onUpgrade={() => setShowUpgradeModal(true)}
                                />

                                <CapacityAlerts
                                    alerts={capacityAlerts}
                                    isPremium={isPremium}
                                    onAlertPress={(courtId, date) => setActiveTab("courts")}
                                    onUpgrade={() => setShowUpgradeModal(true)}
                                />
                            </View>

                            {/* Reviews - REAL DATA */}
                            <ReviewsDashboard
                                reviews={reviews?.reviews ?? []}
                                averageRating={reviews?.averageRating ?? 0}
                                totalReviews={reviews?.totalReviews ?? 0}
                                onRespond={(id) => console.log("Respond to", id)}
                                onViewAll={() => router.push(`/facility/reviews?facilityId=${facility.id}`)}
                            />

                            {/* Marketing - REAL DATA */}
                            <ShareOpenSlots
                                facilityName={facility.businessName}
                                facilityId={facility.id}
                                openSlots={openSlots}
                            />
                        </>
                    )}

                    {/* Bookings Tab */}
                    {activeTab === "bookings" && (
                        <>
                            {bookings.length === 0 ? (
                                <View style={styles.emptyTabState}>
                                    <Ionicons name="calendar-outline" size={48} color="#666" />
                                    <Text style={styles.emptyTabText}>No bookings yet</Text>
                                </View>
                            ) : (
                                bookings.slice(0, 10).map((booking) => (
                                    <View key={booking.id} style={styles.bookingCard}>
                                        <View style={styles.bookingHeader}>
                                            <View>
                                                <Text style={styles.bookingDate}>{booking.date}</Text>
                                                <Text style={styles.bookingTime}>
                                                    {booking.startTime} - {booking.endTime}
                                                </Text>
                                            </View>
                                            <View style={[
                                                styles.statusBadge,
                                                booking.status === "confirmed" && styles.statusConfirmed,
                                                booking.status === "completed" && styles.statusCompleted,
                                                booking.status === "cancelled" && styles.statusCancelled,
                                            ]}>
                                                <Text style={styles.statusText}>{booking.status}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.bookingBody}>
                                            <Text style={styles.bookingPlayer}>{booking.userName}</Text>
                                            <Text style={styles.bookingEarning}>
                                                +${(booking.facilityPayout / 100).toFixed(2)}
                                            </Text>
                                        </View>
                                    </View>
                                ))

                            )}

                            {/* Waitlist & Block Times */}
                            <WaitlistManager
                                entries={waitlistEntries.map(e => ({
                                    id: e.id,
                                    customerName: e.customerName,
                                    requestedDate: e.date,
                                    requestedTime: e.time,
                                    courtPreference: e.courtName,
                                    timestamp: e.joinedAt
                                }))}
                                onNotify={(id) => console.log("Notify", id)}
                                onRemove={(id) => console.log("Remove", id)}
                            />

                            <QuickBlockTimes
                                courtId={courts[0]?.id || "all"}
                                courtName={courts.length > 1 ? "All Courts" : courts[0]?.name || "Court"}
                                onBlock={(courtId, time) => console.log("Block", courtId, time)}
                            />

                            {noShowStats && (
                                <NoShowTracker
                                    records={noShowStats.records}
                                    onViewDetails={(id) => router.push(`/facility/customer/${id}`)}
                                    onFlag={(id) => console.log("Flag", id)}
                                />
                            )}

                        </>
                    )}

                    {/* Courts Tab */}
                    {activeTab === "courts" && (
                        <>
                            <CourtConditionTracker
                                courts={courts.map(c => ({
                                    id: c.id,
                                    name: c.name,
                                    condition: "good",
                                    issues: [],
                                    lastCleaned: new Date()
                                }))}
                                onCourtPress={(id) => console.log("Court press", id)}
                                onScheduleMaintenance={(id) => console.log("Schedule", id)}
                            />

                            <MaintenanceQueue
                                tickets={maintenanceTasks.map(t => ({
                                    id: t.id,
                                    title: t.title,
                                    location: t.courtName,
                                    priority: t.priority,
                                    status: t.status,
                                    reportedDate: t.createdAt
                                }))}
                                onTicketPress={(id) => console.log("Ticket", id)}
                                onCreateTicket={() => console.log("Create ticket")}
                                onMarkComplete={(id) => console.log("Complete", id)}
                            />

                            {courts.map((court) => (
                                <View key={court.id} style={styles.courtCard}>
                                    <View style={styles.courtInfo}>
                                        <Text style={styles.courtName}>{court.name}</Text>
                                        <Text style={styles.courtType}>{court.type}</Text>
                                    </View>
                                    <Text style={styles.courtRate}>${(court.hourlyRate / 100).toFixed(0)}/hr</Text>
                                </View>
                            ))}

                            <TouchableOpacity
                                style={styles.addCourtBtn}
                                onPress={() => setShowAddCourt(true)}
                            >
                                <Ionicons name="add-circle" size={24} color="#7ED957" />
                                <Text style={styles.addCourtText}>Add Court</Text>
                            </TouchableOpacity>

                            {/* Add Court Form */}
                            {showAddCourt && (
                                <View style={styles.addCourtForm}>
                                    <Text style={styles.formLabel}>Court Name</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={newCourtName}
                                        onChangeText={setNewCourtName}
                                        placeholder="e.g., Court 3"
                                        placeholderTextColor="#666"
                                    />

                                    <Text style={styles.formLabel}>Type</Text>
                                    <View style={styles.typeRow}>
                                        {["Outdoor", "Indoor"].map((type) => (
                                            <TouchableOpacity
                                                key={type}
                                                style={[
                                                    styles.typeChip,
                                                    newCourtType === type && styles.typeChipSelected,
                                                ]}
                                                onPress={() => setNewCourtType(type)}
                                            >
                                                <Text style={[
                                                    styles.typeChipText,
                                                    newCourtType === type && styles.typeChipTextSelected,
                                                ]}>
                                                    {type}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    <Text style={styles.formLabel}>Hourly Rate ($)</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={newCourtRate}
                                        onChangeText={setNewCourtRate}
                                        placeholder="40"
                                        placeholderTextColor="#666"
                                        keyboardType="number-pad"
                                    />

                                    <TouchableOpacity
                                        style={styles.saveCourtBtn}
                                        onPress={handleAddCourt}
                                    >
                                        <LinearGradient
                                            colors={["#7ED957", "#4C9E29"]}
                                            style={styles.saveCourtBtnGradient}
                                        >
                                            <Text style={styles.saveCourtBtnText}>Save Court</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </>
                    )}

                    {/* Earnings Tab */}
                    {activeTab === "earnings" && (
                        <>
                            {revenueForecast && (
                                <RevenueForecast
                                    {...revenueForecast}
                                    lastMonthRevenue={revenueForecast.confirmedRevenue / (1 + (revenueForecast.comparedToLastMonth / 100))} // Estimate last month from comparison
                                    daysRemaining={new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate()}
                                />
                            )}

                            <View style={styles.earningsCard}>
                                <Text style={styles.earningsLabel}>Total Earnings</Text>
                                <Text style={styles.earningsValue}>${(totalEarnings / 100).toFixed(2)}</Text>
                            </View>

                            {trainerRevenue.length > 0 && (
                                <TrainerRevenueShare
                                    trainerRentals={trainerRevenue}
                                    totalThisMonth={trainerRevenue.reduce((sum, t) => sum + t.totalRevenue, 0)}
                                    // Estimate last month
                                    lastMonthTotal={trainerRevenue.reduce((sum, t) => sum + t.totalRevenue, 0) * 0.9}
                                />
                            )}

                            {/* Mock/Chart reuse for heat map if needed, or skip if handled by PopularTimes */}

                            <View style={styles.stripeSection}>
                                <Ionicons name="card" size={24} color={facility.stripeAccountId ? "#7ED957" : "#635BFF"} />
                                <Text style={styles.stripeText}>
                                    {facility.stripeAccountId
                                        ? "Stripe Connected ✓"
                                        : "Connect Stripe to receive payouts"}
                                </Text>
                                <TouchableOpacity
                                    style={[styles.stripeBtn, facility.stripeAccountId && { backgroundColor: "#635BFF" }]}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                        router.push(`/facility/stripe-onboarding?facilityId=${facility.id}`)
                                    }}
                                >
                                    <Text style={[styles.stripeBtnText, facility.stripeAccountId && { color: "#FFF" }]}>
                                        {facility.stripeAccountId ? "View" : "Connect"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                    {/* Leads Tab */}
                    {activeTab === "leads" && (
                        <View style={{ flex: 1, minHeight: 400 }}>
                            <AnnouncementBroadcaster
                                customerCount={customerRetention?.retentionRate ? 150 : 0} // Estimate
                                onSend={(msg) => console.log("Send", msg)}
                            />

                            <RepeatBookerLeaderboard
                                bookers={repeatBookers}
                                onContact={(id) => console.log("Contact", id)}
                            />

                            <WarmLeads
                                targetId={facility.id}
                                targetType="facility"
                                businessName={facility.businessName}
                            />
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView >

            {/* Upgrade Modal */}
            {/* Upgrade Modal */}
            <UpgradePrompt
                visible={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                facilityId={facility.id}
                monthlyRevenue={totalEarnings / 100 * 3} // Estimate monthly from recent
                onUpgrade={() => {
                    setShowUpgradeModal(false)
                    // Would open Stripe checkout
                }}
            />
        </View >
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0A0A0A" },
    loadingContainer: { flex: 1, backgroundColor: "#0A0A0A", justifyContent: "center", alignItems: "center" },
    safeArea: { flex: 1 },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#1A1A1A",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitleContainer: { alignItems: "center" },
    headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
    verifiedBadge: { flexDirection: "row", alignItems: "center", marginTop: 4 },
    verifiedText: { color: "#7ED957", fontSize: 12, marginLeft: 4 },
    settingsBtn: { padding: 8 },

    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        marginBottom: 24,
    },

    nudgeCard: {
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 16,
        overflow: "hidden",
    },
    nudgeGradient: {
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    nudgeContent: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        gap: 12,
    },
    nudgeTextContainer: {
        flex: 1,
    },
    nudgeTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#000",
    },
    nudgeSubtitle: {
        fontSize: 12,
        color: "#000",
        opacity: 0.8,
        marginTop: 2,
    },

    statCard: {
        flex: 1,
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
    },
    statValue: { color: "#FFF", fontSize: 24, fontWeight: "bold" },
    statLabel: { color: "#888", fontSize: 12, marginTop: 4 },

    tabBar: {
        flexDirection: "row",
        paddingHorizontal: 20,
        marginBottom: 16,
        gap: 8,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 8,
    },
    tabActive: { backgroundColor: "#7ED957" },
    tabText: { color: "#888", fontSize: 14, fontWeight: "600" },
    tabTextActive: { color: "#000" },

    quickActionsRow: {
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 16,
    },
    quickActionCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
    },
    quickActionText: { flex: 1, color: "#FFF", fontSize: 16, marginLeft: 12 },

    content: { paddingHorizontal: 20, paddingBottom: 40 },

    // Overview Tab Styles
    overviewStatsRow: {
        marginBottom: 20,
    },
    insightsSection: {
        marginBottom: 16,
    },
    sectionTitle: {
        color: "#FFF",
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 16,
    },


    emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40 },
    emptyTitle: { color: "#FFF", fontSize: 20, fontWeight: "bold", marginTop: 16 },
    emptySubtext: { color: "#888", fontSize: 14, textAlign: "center", marginTop: 8 },
    findBtn: {
        marginTop: 24,
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: "#7ED957",
        borderRadius: 12,
    },
    findBtnText: { color: "#000", fontSize: 16, fontWeight: "700" },

    emptyTabState: { alignItems: "center", paddingTop: 40 },
    emptyTabText: { color: "#888", fontSize: 14, marginTop: 12 },

    bookingCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    bookingHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
    bookingDate: { color: "#FFF", fontSize: 16, fontWeight: "600" },
    bookingTime: { color: "#888", fontSize: 14, marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: "#333" },
    statusConfirmed: { backgroundColor: "rgba(126, 217, 87, 0.2)" },
    statusCompleted: { backgroundColor: "rgba(126, 217, 87, 0.4)" },
    statusCancelled: { backgroundColor: "rgba(255, 107, 107, 0.2)" },
    statusText: { color: "#FFF", fontSize: 12, textTransform: "capitalize" },
    bookingBody: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
    bookingPlayer: { color: "#CCC", fontSize: 14 },
    bookingEarning: { color: "#7ED957", fontSize: 16, fontWeight: "600" },

    courtCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    courtInfo: {},
    courtName: { color: "#FFF", fontSize: 16, fontWeight: "600" },
    courtType: { color: "#888", fontSize: 14, marginTop: 2 },
    courtRate: { color: "#7ED957", fontSize: 18, fontWeight: "bold" },

    addCourtBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        borderWidth: 1,
        borderColor: "#333",
        borderStyle: "dashed",
        borderRadius: 12,
        marginBottom: 16,
    },
    addCourtText: { color: "#7ED957", fontSize: 16, fontWeight: "600", marginLeft: 8 },

    addCourtForm: {
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
    },
    formLabel: { color: "#888", fontSize: 12, marginBottom: 8, marginTop: 12 },
    input: {
        backgroundColor: "#0A0A0A",
        borderRadius: 8,
        padding: 12,
        color: "#FFF",
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#333",
    },
    typeRow: { flexDirection: "row", gap: 8 },
    typeChip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: "#0A0A0A",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#333",
    },
    typeChipSelected: { backgroundColor: "#7ED957", borderColor: "#7ED957" },
    typeChipText: { color: "#888" },
    typeChipTextSelected: { color: "#000" },
    saveCourtBtn: { marginTop: 16, borderRadius: 12, overflow: "hidden" },
    saveCourtBtnGradient: { paddingVertical: 14, alignItems: "center" },
    saveCourtBtnText: { color: "#000", fontSize: 16, fontWeight: "700" },

    earningsCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 24,
        alignItems: "center",
        marginBottom: 20,
    },
    earningsLabel: { color: "#888", fontSize: 14 },
    earningsValue: { color: "#7ED957", fontSize: 40, fontWeight: "bold", marginTop: 8 },

    earningsBreakdown: {
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    earningsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
    },
    earningsRowLabel: { color: "#888", fontSize: 14 },
    earningsRowValue: { color: "#FFF", fontSize: 16, fontWeight: "600" },

    stripeSection: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        gap: 12,
    },
    stripeText: { flex: 1, color: "#CCC", fontSize: 14 },
    stripeBtn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: "#7ED957",
        borderRadius: 8,
    },
    stripeBtnText: { color: "#000", fontSize: 14, fontWeight: "600" },

    // Pending Bookings & Quick Block
    pendingCard: { borderWidth: 1, borderColor: "rgba(255, 149, 0, 0.3)" },
    pendingBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(255, 149, 0, 0.2)",
        alignItems: "center",
        justifyContent: "center",
    },
    blockCard: { borderWidth: 1, borderColor: "rgba(255, 107, 107, 0.3)" },

    // Upgrade Banner
    upgradeBanner: {
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 16,
        overflow: "hidden",
    },
    upgradeBannerGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
    },
    upgradeBannerContent: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    upgradeBannerText: {
        marginLeft: 12,
    },
    upgradeBannerTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#000",
    },
    upgradeBannerSubtitle: {
        fontSize: 12,
        color: "#333",
        marginTop: 2,
    },

    // AI Insights Card
    aiInsightsCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "rgba(126, 217, 87, 0.3)",
    },
    aiInsightsHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    aiInsightsTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFF",
        marginLeft: 8,
    },
    aiInsightsRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 16,
    },
    aiInsightItem: {
        alignItems: "center",
    },
    aiInsightValue: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFF",
    },
    aiInsightLabel: {
        fontSize: 12,
        color: "#888",
        marginTop: 4,
    },
    fillSlotsBtn: {
        backgroundColor: "#7ED957",
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: "center",
    },
    fillSlotsBtnText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#000",
    },
})
