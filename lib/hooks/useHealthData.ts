/**
 * useHealthData Hook
 * 
 * React hook for consuming Apple Health data throughout the app
 */

import { useState, useEffect, useCallback } from 'react';
import { HealthService, DailyStats, WeeklyStats, WorkoutData } from '@/lib/services/health-service';
import { courtDetectionService, CourtSession } from '@/lib/services/court-detection-service';
import { Platform } from 'react-native';

export interface HealthDataState {
    // Apple Health data
    todayStats: DailyStats | null;
    weeklyStats: WeeklyStats | null;
    recentWorkouts: WorkoutData[];

    // GoodRunss court sessions
    courtSessions: CourtSession[];
    activeSession: CourtSession | null;
    courtWeeklyStats: {
        totalSessions: number;
        totalMinutes: number;
        totalCalories: number;
        favoriteSpot: string | null;
    };

    // State
    isLoading: boolean;
    hasPermission: boolean;
    error: string | null;
    lastSynced: Date | null;
}

export interface UseHealthDataReturn extends HealthDataState {
    refresh: () => Promise<void>;
    requestPermission: () => Promise<boolean>;
    startCourtMonitoring: () => Promise<boolean>;
    stopCourtMonitoring: () => Promise<void>;
}

export function useHealthData(): UseHealthDataReturn {
    const [todayStats, setTodayStats] = useState<DailyStats | null>(null);
    const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
    const [recentWorkouts, setRecentWorkouts] = useState<WorkoutData[]>([]);
    const [courtSessions, setCourtSessions] = useState<CourtSession[]>([]);
    const [activeSession, setActiveSession] = useState<CourtSession | null>(null);
    const [courtWeeklyStats, setCourtWeeklyStats] = useState({
        totalSessions: 0,
        totalMinutes: 0,
        totalCalories: 0,
        favoriteSpot: null as string | null,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [hasPermission, setHasPermission] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastSynced, setLastSynced] = useState<Date | null>(null);

    const healthService = HealthService.getInstance();

    /**
     * Request Apple Health permissions
     */
    const requestPermission = useCallback(async (): Promise<boolean> => {
        if (Platform.OS !== 'ios') {
            console.log('[useHealthData] Health Kit only available on iOS');
            return false;
        }

        try {
            const granted = await healthService.requestPermissions();
            setHasPermission(granted);
            if (granted) {
                await refresh();
            }
            return granted;
        } catch (err) {
            console.error('[useHealthData] Permission error:', err);
            setError('Failed to get Health permissions');
            return false;
        }
    }, []);

    /**
     * Refresh all health data
     */
    const refresh = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Fetch Apple Health data
            const [today, weekly, workouts] = await Promise.all([
                healthService.getTodayStats(),
                healthService.getWeeklyStats(),
                healthService.getRecentWorkouts(7),
            ]);

            setTodayStats(today);
            setWeeklyStats(weekly);
            setRecentWorkouts(workouts);
            setHasPermission(true);

            // Fetch court session data
            const [sessions, active, weeklyCourtStats] = await Promise.all([
                courtDetectionService.getSessionHistory(10),
                courtDetectionService.getActiveSession(),
                courtDetectionService.getWeeklyStats(),
            ]);

            setCourtSessions(sessions);
            setActiveSession(active);
            setCourtWeeklyStats(weeklyCourtStats);

            setLastSynced(new Date());
        } catch (err) {
            console.error('[useHealthData] Refresh error:', err);
            setError('Failed to load health data');
            setHasPermission(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Start court geofence monitoring
     */
    const startCourtMonitoring = useCallback(async (): Promise<boolean> => {
        return await courtDetectionService.startMonitoring();
    }, []);

    /**
     * Stop court geofence monitoring
     */
    const stopCourtMonitoring = useCallback(async (): Promise<void> => {
        await courtDetectionService.stopMonitoring();
    }, []);

    // Initial load
    useEffect(() => {
        refresh();

        // Refresh every 5 minutes
        const interval = setInterval(refresh, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [refresh]);

    return {
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
        stopCourtMonitoring,
    };
}

/**
 * Simplified hook for just today's stats
 */
export function useTodayStats() {
    const { todayStats, isLoading, hasPermission, refresh } = useHealthData();
    return { todayStats, isLoading, hasPermission, refresh };
}

/**
 * Simplified hook for court tracking
 */
export function useCourtTracking() {
    const {
        courtSessions,
        activeSession,
        courtWeeklyStats,
        startCourtMonitoring,
        stopCourtMonitoring,
        refresh,
    } = useHealthData();

    const startSession = useCallback(async (court: {
        id: string;
        name: string;
        sport: string;
        lat: number;
        lng: number
    }) => {
        await courtDetectionService.startManualSession(court);
        await refresh();
    }, [refresh]);

    const endSession = useCallback(async () => {
        const session = await courtDetectionService.endManualSession();
        await refresh();
        return session;
    }, [refresh]);

    return {
        courtSessions,
        activeSession,
        courtWeeklyStats,
        startSession,
        endSession,
        startCourtMonitoring,
        stopCourtMonitoring,
    };
}
