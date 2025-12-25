import React, { useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Share, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import * as Clipboard from "expo-clipboard"
// Removed LinearGradient for admin dashboard - stick to solid colors for professional look
import { useTrainerDashboard } from "@/lib/hooks/useTrainerDashboard"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "@/lib/auth-context"

interface TeacherDashboardProps {
    userType: "trainer" | "instructor"
    name?: string
}

export function TeacherDashboard({ userType, name }: TeacherDashboardProps) {
    const { user } = useAuth()
    const {
        clients,
        totalClients,
        activeClients,
        upcomingBookings,
        todayBookings,
        pendingCount,
        earnings,
        profile,
        isLoading,
        refreshAll,
    } = useTrainerDashboard()

    // Booking link for sharing
    const bookingLink = `https://goodrunss.app/book/${user?.id || 'demo'}`

    const handlePress = (action: () => void) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        action()
    }

    const handleCopyLink = async () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        await Clipboard.setStringAsync(bookingLink)
        Alert.alert("✓ Link Copied!", "Your booking link is ready to paste anywhere.")
    }

    const handleShareLink = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        try {
            await Share.share({
                message: `Book a session with me on GoodRunss! 🏋️\n${bookingLink}`,
                url: bookingLink,
            })
        } catch (error) {
            console.error("Share error:", error)
        }
    }

    const isInstructor = userType === "instructor"
    const roleTitle = isInstructor ? "Instructor" : "Coach"
    const clientLabel = isInstructor ? "Students" : "Clients"

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Admin Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.headerLabel}>BUSINESS DASHBOARD</Text>
                            <Text style={styles.headerName}>{name || roleTitle}</Text>
                        </View>
                        <TouchableOpacity style={styles.profileButton} onPress={() => router.push("/(tabs)/profile")}>
                            <View style={styles.avatarCircle}>
                                <Text style={styles.avatarText}>{name?.[0] || "U"}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* 🔗 SHARE YOUR BOOKING LINK - Most Important for Trainers */}
                    <View style={styles.bookingLinkCard}>
                        <View style={styles.bookingLinkHeader}>
                            <View style={styles.bookingLinkIconWrap}>
                                <Ionicons name="link" size={20} color="#7ED957" />
                            </View>
                            <View style={styles.bookingLinkText}>
                                <Text style={styles.bookingLinkTitle}>Your Booking Link</Text>
                                <Text style={styles.bookingLinkSubtitle}>Share on socials or send to clients</Text>
                            </View>
                        </View>
                        <View style={styles.bookingLinkUrlBox}>
                            <Text style={styles.bookingLinkUrl} numberOfLines={1}>{bookingLink}</Text>
                        </View>
                        <View style={styles.bookingLinkActions}>
                            <TouchableOpacity style={styles.copyBtn} onPress={handleCopyLink}>
                                <Ionicons name="copy-outline" size={18} color="#000" />
                                <Text style={styles.copyBtnText}>Copy Link</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.shareBtn} onPress={handleShareLink}>
                                <Ionicons name="share-social-outline" size={18} color="#7ED957" />
                                <Text style={styles.shareBtnText}>Share</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Pending Requests Alert */}
                    {pendingCount > 0 && (
                        <TouchableOpacity
                            style={styles.alertBanner}
                            onPress={() => router.push("/(tabs)/bookings")}
                        >
                            <Ionicons name="notifications" size={20} color="#000" />
                            <Text style={styles.alertText}>{pendingCount} new session request{pendingCount > 1 ? 's' : ''}</Text>
                            <Ionicons name="chevron-forward" size={16} color="#000" />
                        </TouchableOpacity>
                    )}

                    {/* Earnings Summary */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Overview</Text>
                        <TouchableOpacity onPress={refreshAll}>
                            <Ionicons name="refresh" size={18} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.statsGrid}>
                        <View style={styles.mainStatCard}>
                            <Text style={styles.statLabel}>Total Earnings</Text>
                            <Text style={styles.statValue}>${earnings.thisMonth.toLocaleString()}</Text>
                            <View style={styles.trendRow}>
                                <Ionicons name="trending-up" size={14} color="#22C55E" />
                                <Text style={styles.trendText}>+12% vs last month</Text>
                            </View>
                        </View>
                        <View style={styles.sideStatsCol}>
                            <View style={styles.sideStatCard}>
                                <Text style={styles.sideStatValue}>{activeClients}</Text>
                                <Text style={styles.sideStatLabel}>Active {clientLabel}</Text>
                            </View>
                            <View style={styles.sideStatCard}>
                                <Text style={styles.sideStatValue}>{profile?.rating?.toFixed(1) || "5.0"}</Text>
                                <Text style={styles.sideStatLabel}>Rating</Text>
                            </View>
                        </View>
                    </View>

                    {/* Today's Agenda - Timeline Style */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Today's Schedule</Text>
                    </View>

                    {todayBookings.length === 0 ? (
                        <View style={styles.emptySchedule}>
                            <Ionicons name="calendar-outline" size={32} color="#333" />
                            <Text style={styles.emptyText}>No sessions today</Text>
                            <TouchableOpacity style={styles.addButton} onPress={() => router.push("/pro-dashboard")}>
                                <Text style={styles.addButtonText}>Open Availability</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.agendaList}>
                            {todayBookings.map((booking, index) => (
                                <View key={booking.id} style={styles.agendaItem}>
                                    <View style={styles.timeCol}>
                                        <Text style={styles.timeText}>{booking.time}</Text>
                                        <Text style={styles.durationText}>{booking.duration}m</Text>
                                    </View>
                                    <View style={[styles.timelineLine, { backgroundColor: booking.status === 'confirmed' ? '#7ED957' : '#FBBF24' }]} />
                                    <TouchableOpacity
                                        style={styles.agendaCard}
                                        onPress={() => router.push(`/booking/${booking.id}`)}
                                    >
                                        <Text style={styles.agendaClient}>{booking.clientName}</Text>
                                        <Text style={styles.agendaActivity}>{booking.activity}</Text>
                                        {booking.status === 'pending' && (
                                            <View style={styles.pendingBadge}>
                                                <Text style={styles.pendingText}>Pending</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Menu Grid */}
                    <View style={styles.menuGrid}>
                        <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/(tabs)/bookings")}>
                            <View style={[styles.menuIcon, { backgroundColor: '#333' }]}>
                                <Ionicons name="calendar" size={24} color="#FFF" />
                            </View>
                            <Text style={styles.menuText}>Calendar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/(tabs)/trainer")}>
                            <View style={[styles.menuIcon, { backgroundColor: '#333' }]}>
                                <Ionicons name="people" size={24} color="#FFF" />
                            </View>
                            <Text style={styles.menuText}>{clientLabel}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem}>
                            <View style={[styles.menuIcon, { backgroundColor: '#333' }]}>
                                <Ionicons name="wallet" size={24} color="#FFF" />
                            </View>
                            <Text style={styles.menuText}>Payouts</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/pro-dashboard")}>
                            <View style={[styles.menuIcon, { backgroundColor: '#7ED957' }]}>
                                <Ionicons name="rocket" size={24} color="#000" />
                            </View>
                            <Text style={[styles.menuText, { color: '#7ED957' }]}>Pro Tools</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </SafeAreaView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        paddingTop: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    headerLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#666',
        letterSpacing: 1,
        marginBottom: 4,
    },
    headerName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
    },
    profileButton: {
    },
    avatarCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1E1E1E',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
    avatarText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    alertBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#7ED957',
        borderRadius: 12,
        padding: 12,
        marginBottom: 24,
        gap: 8,
    },
    alertText: {
        flex: 1,
        color: '#000',
        fontWeight: 'bold',
        fontSize: 14,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#E5E5E5',
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
        height: 140,
        marginBottom: 32,
    },
    mainStatCard: {
        flex: 2,
        backgroundColor: '#111',
        borderRadius: 16,
        padding: 20,
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#222',
    },
    sideStatsCol: {
        flex: 1,
        gap: 12,
    },
    sideStatCard: {
        flex: 1,
        backgroundColor: '#111',
        borderRadius: 16,
        padding: 12,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#222',
    },
    statLabel: {
        color: '#888',
        fontSize: 14,
    },
    statValue: {
        color: '#FFF',
        fontSize: 32,
        fontWeight: 'bold',
    },
    trendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    trendText: {
        color: '#22C55E',
        fontSize: 12,
    },
    sideStatValue: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    sideStatLabel: {
        color: '#666',
        fontSize: 12,
    },
    emptySchedule: {
        backgroundColor: '#111',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#333',
        marginBottom: 32,
    },
    emptyText: {
        color: '#666',
        marginVertical: 12,
    },
    addButton: {
        backgroundColor: '#222',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
    },
    addButtonText: {
        color: '#E5E5E5',
        fontWeight: '600',
    },
    agendaList: {
        marginBottom: 32,
    },
    agendaItem: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    timeCol: {
        width: 60,
        paddingTop: 4,
        alignItems: 'flex-end',
        paddingRight: 12,
    },
    timeText: {
        color: '#E5E5E5',
        fontWeight: 'bold',
        fontSize: 14,
    },
    durationText: {
        color: '#666',
        fontSize: 12,
    },
    timelineLine: {
        width: 3,
        borderRadius: 1.5,
        marginRight: 12,
    },
    agendaCard: {
        flex: 1,
        backgroundColor: '#161616',
        padding: 16,
        borderRadius: 12,
        justifyContent: 'center',
    },
    agendaClient: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 15,
        marginBottom: 4,
    },
    agendaActivity: {
        color: '#888',
        fontSize: 13,
    },
    pendingBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: '#FBBF24',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    pendingText: {
        color: '#000',
        fontSize: 10,
        fontWeight: 'bold',
    },
    menuGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    menuItem: {
        width: '48%',
        backgroundColor: '#111',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: '#222',
    },
    menuIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuText: {
        color: '#CCC',
        fontWeight: '600',
        fontSize: 14,
    },
    // Booking Link Card Styles
    bookingLinkCard: {
        backgroundColor: '#111',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#1E1E1E',
    },
    bookingLinkHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    bookingLinkIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(126, 217, 87, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    bookingLinkText: {
        flex: 1,
    },
    bookingLinkTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 2,
    },
    bookingLinkSubtitle: {
        fontSize: 12,
        color: '#666',
    },
    bookingLinkUrlBox: {
        backgroundColor: '#000',
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#222',
    },
    bookingLinkUrl: {
        fontSize: 13,
        color: '#7ED957',
        fontFamily: 'monospace',
    },
    bookingLinkActions: {
        flexDirection: 'row',
        gap: 10,
    },
    copyBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#7ED957',
        borderRadius: 10,
        paddingVertical: 12,
        gap: 6,
    },
    copyBtnText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
    },
    shareBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(126, 217, 87, 0.15)',
        borderRadius: 10,
        paddingVertical: 12,
        gap: 6,
        borderWidth: 1,
        borderColor: 'rgba(126, 217, 87, 0.3)',
    },
    shareBtnText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#7ED957',
    },
})
