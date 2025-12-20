/**
 * Health Dashboard
 * 
 * Full-screen dashboard showing Apple Health data and court activity
 */

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    StyleSheet,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { format, formatDistanceToNow } from 'date-fns';
import { useHealthData } from '@/lib/hooks/useHealthData';
import { SessionCalorieCard } from '@/components/SessionCalorieCard';

export default function HealthDashboardScreen() {
    const {
        todayStats,
        weeklyStats,
        recentWorkouts,
        courtSessions,
        activeSession,
        courtWeeklyStats,
        isLoading,
        hasPermission,
        error,
        lastSynced,
        refresh,
        requestPermission,
        startCourtMonitoring,
    } = useHealthData();

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await refresh();
        setRefreshing(false);
    }, [refresh]);

    const handleConnectHealth = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const granted = await requestPermission();
        if (granted) {
            Alert.alert('Connected!', 'Apple Health is now synced with GoodRunss');
        } else {
            Alert.alert(
                'Permission Required',
                'Please enable Health access in Settings > Privacy > Health > GoodRunss'
            );
        }
    };

    const handleEnableCourtTracking = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const success = await startCourtMonitoring();
        if (success) {
            Alert.alert('Court Tracking Enabled', "We'll automatically track your sessions when you're at a court!");
        } else {
            Alert.alert(
                'Location Required',
                'Please enable location access to auto-track your court sessions'
            );
        }
    };

    const handleBack = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.back();
    };

    return (
        <LinearGradient colors={['#0A0A0A', '#141414']} style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Health & Activity</Text>
                    <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
                        <Ionicons name="refresh" size={22} color="#7ED957" />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    contentContainerStyle={styles.content}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#7ED957"
                        />
                    }
                >
                    {/* Connection Status */}
                    {!hasPermission && (
                        <TouchableOpacity style={styles.connectCard} onPress={handleConnectHealth}>
                            <LinearGradient
                                colors={['rgba(126, 217, 87, 0.2)', 'rgba(126, 217, 87, 0.05)']}
                                style={styles.connectGradient}
                            >
                                <Ionicons name="fitness" size={40} color="#7ED957" />
                                <Text style={styles.connectTitle}>Connect Apple Health</Text>
                                <Text style={styles.connectSubtitle}>
                                    Sync your steps, calories, and workouts
                                </Text>
                                <View style={styles.connectButton}>
                                    <Text style={styles.connectButtonText}>Connect Now</Text>
                                    <Ionicons name="arrow-forward" size={16} color="#000" />
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}

                    {/* Today's Stats */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Today</Text>
                        <View style={styles.statsGrid}>
                            <StatCard
                                icon="footsteps"
                                label="Steps"
                                value={todayStats?.steps?.toLocaleString() || '—'}
                                color="#7ED957"
                            />
                            <StatCard
                                icon="flame"
                                label="Calories"
                                value={todayStats?.calories?.toLocaleString() || '—'}
                                color="#FF6B35"
                            />
                            <StatCard
                                icon="time"
                                label="Active Min"
                                value={todayStats?.activeMinutes?.toString() || '—'}
                                color="#818CF8"
                            />
                            <StatCard
                                icon="navigate"
                                label="Miles"
                                value={todayStats?.distance?.toFixed(1) || '—'}
                                color="#06B6D4"
                            />
                        </View>
                    </View>

                    {/* Active Session */}
                    {activeSession && (
                        <View style={styles.section}>
                            <View style={styles.activeSessionCard}>
                                <View style={styles.activeSessionHeader}>
                                    <View style={styles.liveBadge}>
                                        <View style={styles.liveIndicator} />
                                        <Text style={styles.liveText}>LIVE</Text>
                                    </View>
                                    <Text style={styles.activeSessionTime}>
                                        {formatDistanceToNow(new Date(activeSession.startTime), { addSuffix: false })}
                                    </Text>
                                </View>
                                <Text style={styles.activeSessionTitle}>
                                    {activeSession.sport} at {activeSession.courtName}
                                </Text>
                                <Text style={styles.activeSessionSubtitle}>
                                    Session in progress...
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Weekly Summary */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>This Week</Text>
                        <View style={styles.weeklySummary}>
                            <View style={styles.weeklyRow}>
                                <View style={styles.weeklyItem}>
                                    <Text style={styles.weeklyValue}>
                                        {weeklyStats?.totalWorkouts || courtWeeklyStats.totalSessions || 0}
                                    </Text>
                                    <Text style={styles.weeklyLabel}>Workouts</Text>
                                </View>
                                <View style={styles.weeklyItem}>
                                    <Text style={styles.weeklyValue}>
                                        {weeklyStats?.totalCalories?.toLocaleString() ||
                                            courtWeeklyStats.totalCalories.toLocaleString() || 0}
                                    </Text>
                                    <Text style={styles.weeklyLabel}>Calories</Text>
                                </View>
                                <View style={styles.weeklyItem}>
                                    <Text style={styles.weeklyValue}>
                                        {weeklyStats?.totalMinutes || courtWeeklyStats.totalMinutes || 0}
                                    </Text>
                                    <Text style={styles.weeklyLabel}>Minutes</Text>
                                </View>
                            </View>
                            {(weeklyStats?.favoriteActivity || courtWeeklyStats.favoriteSpot) && (
                                <View style={styles.favoriteRow}>
                                    <Ionicons name="star" size={14} color="#FACC15" />
                                    <Text style={styles.favoriteText}>
                                        Favorite: {weeklyStats?.favoriteActivity || courtWeeklyStats.favoriteSpot}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Court Sessions */}
                    {courtSessions.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Recent Court Sessions</Text>
                            {courtSessions.slice(0, 5).map((session, index) => (
                                <View key={`${session.courtId}-${session.startTime}`} style={styles.sessionCard}>
                                    <View style={styles.sessionIcon}>
                                        <Ionicons
                                            name={getSportIcon(session.sport)}
                                            size={20}
                                            color="#7ED957"
                                        />
                                    </View>
                                    <View style={styles.sessionInfo}>
                                        <Text style={styles.sessionTitle}>{session.courtName}</Text>
                                        <Text style={styles.sessionDetails}>
                                            {session.sport} • {session.endTime
                                                ? `${Math.round((session.endTime - session.startTime) / 60000)} min`
                                                : 'In progress'}
                                        </Text>
                                    </View>
                                    <View style={styles.sessionRight}>
                                        <Text style={styles.sessionCalories}>
                                            {session.estimatedCalories || 0} cal
                                        </Text>
                                        <Text style={styles.sessionDate}>
                                            {format(new Date(session.startTime), 'MMM d')}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Recent Workouts from Apple Health */}
                    {recentWorkouts.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Recent Workouts</Text>
                            {recentWorkouts.slice(0, 5).map((workout, index) => (
                                <View key={`workout-${index}`} style={styles.sessionCard}>
                                    <View style={styles.sessionIcon}>
                                        <Ionicons
                                            name={getSportIcon(workout.workoutType)}
                                            size={20}
                                            color="#818CF8"
                                        />
                                    </View>
                                    <View style={styles.sessionInfo}>
                                        <Text style={styles.sessionTitle}>{workout.workoutType}</Text>
                                        <Text style={styles.sessionDetails}>
                                            {workout.duration} min
                                            {workout.distance ? ` • ${workout.distance} mi` : ''}
                                        </Text>
                                    </View>
                                    <View style={styles.sessionRight}>
                                        <Text style={styles.sessionCalories}>
                                            {workout.calories} cal
                                        </Text>
                                        <Text style={styles.sessionDate}>
                                            {format(new Date(workout.date), 'MMM d')}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Court Tracking CTA */}
                    <TouchableOpacity style={styles.trackingCTA} onPress={handleEnableCourtTracking}>
                        <LinearGradient
                            colors={['#1A1A1A', '#252525']}
                            style={styles.trackingGradient}
                        >
                            <View style={styles.trackingIcon}>
                                <Ionicons name="location" size={24} color="#7ED957" />
                            </View>
                            <View style={styles.trackingText}>
                                <Text style={styles.trackingTitle}>Auto Court Tracking</Text>
                                <Text style={styles.trackingSubtitle}>
                                    We'll automatically log your sessions when you're at a court
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#666" />
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Last Synced */}
                    {lastSynced && (
                        <Text style={styles.lastSynced}>
                            Last synced {formatDistanceToNow(lastSynced, { addSuffix: true })}
                        </Text>
                    )}

                    <View style={{ height: 40 }} />
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

// Stat Card Component
function StatCard({ icon, label, value, color }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
    color: string
}) {
    return (
        <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

// Get sport icon
function getSportIcon(sport: string): keyof typeof Ionicons.glyphMap {
    const sportLower = sport.toLowerCase();
    if (sportLower.includes('basketball')) return 'basketball';
    if (sportLower.includes('tennis')) return 'tennisball';
    if (sportLower.includes('running')) return 'walk';
    if (sportLower.includes('yoga')) return 'body';
    if (sportLower.includes('swim')) return 'water';
    if (sportLower.includes('golf')) return 'golf';
    return 'fitness';
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    refreshButton: {
        padding: 8,
    },
    content: {
        paddingHorizontal: 16,
    },
    // Connect Card
    connectCard: {
        marginBottom: 24,
    },
    connectGradient: {
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(126, 217, 87, 0.3)',
    },
    connectTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginTop: 12,
    },
    connectSubtitle: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 4,
        textAlign: 'center',
    },
    connectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#7ED957',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
        marginTop: 16,
        gap: 6,
    },
    connectButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 14,
    },
    // Section
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#9CA3AF',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    // Stats Grid
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    statLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 2,
    },
    // Active Session
    activeSessionCard: {
        backgroundColor: 'rgba(126, 217, 87, 0.1)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(126, 217, 87, 0.3)',
    },
    activeSessionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    liveIndicator: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#EF4444',
    },
    liveText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#EF4444',
    },
    activeSessionTime: {
        fontSize: 14,
        color: '#7ED957',
        fontWeight: '600',
    },
    activeSessionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    activeSessionSubtitle: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 4,
    },
    // Weekly Summary
    weeklySummary: {
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        padding: 16,
    },
    weeklyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    weeklyItem: {
        alignItems: 'center',
        flex: 1,
    },
    weeklyValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    weeklyLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 2,
    },
    favoriteRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        gap: 6,
    },
    favoriteText: {
        fontSize: 13,
        color: '#D1D5DB',
    },
    // Session Card
    sessionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
    },
    sessionIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(126, 217, 87, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sessionInfo: {
        flex: 1,
        marginLeft: 12,
    },
    sessionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    sessionDetails: {
        fontSize: 13,
        color: '#9CA3AF',
        marginTop: 2,
    },
    sessionRight: {
        alignItems: 'flex-end',
    },
    sessionCalories: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FF6B35',
    },
    sessionDate: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 2,
    },
    // Tracking CTA
    trackingCTA: {
        marginBottom: 16,
    },
    trackingGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    trackingIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(126, 217, 87, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    trackingText: {
        flex: 1,
        marginLeft: 12,
    },
    trackingTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    trackingSubtitle: {
        fontSize: 13,
        color: '#9CA3AF',
        marginTop: 2,
    },
    lastSynced: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
});
