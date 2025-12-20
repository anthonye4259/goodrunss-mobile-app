/**
 * Court Detection Service
 * 
 * Automatically detects when users are at courts using geofencing
 * and logs activity sessions to Apple Health.
 */

import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HealthService } from './health-service';
import { db } from '@/lib/firebase-config';
import { collection, getDocs, Firestore } from 'firebase/firestore';

const GEOFENCE_TASK_NAME = 'COURT_GEOFENCE_TASK';
const COURT_SESSION_KEY = 'active_court_session';
const MIN_SESSION_DURATION_MS = 15 * 60 * 1000; // 15 minutes minimum to count as a session
const COURT_DETECTION_RADIUS_METERS = 50; // 50 meters radius for court detection

// Court session tracking
export interface CourtSession {
    courtId: string;
    courtName: string;
    sport: string;
    startTime: number; // timestamp
    endTime?: number;
    location: {
        lat: number;
        lng: number;
    };
    estimatedCalories?: number;
    synced: boolean;
}

// Known court locations (can be fetched from Firebase)
interface CourtLocation {
    id: string;
    name: string;
    sport: string;
    lat: number;
    lng: number;
}

// MET values for different sports (Metabolic Equivalent of Task)
const SPORT_MET_VALUES: Record<string, number> = {
    basketball: 8.0,
    tennis: 7.3,
    pickleball: 6.0,
    volleyball: 4.0,
    soccer: 7.0,
    golf: 4.3,
    swimming: 6.0,
    yoga: 2.5,
    pilates: 3.0,
    running: 9.8,
    walking: 3.5,
    default: 5.0,
};

class CourtDetectionService {
    private static instance: CourtDetectionService;
    private isMonitoring = false;
    private knownCourts: CourtLocation[] = [];
    private healthService: HealthService;

    private constructor() {
        this.healthService = HealthService.getInstance();
        this.setupGeofenceTask();
    }

    static getInstance(): CourtDetectionService {
        if (!CourtDetectionService.instance) {
            CourtDetectionService.instance = new CourtDetectionService();
        }
        return CourtDetectionService.instance;
    }

    /**
     * Set up the background geofence task
     */
    private setupGeofenceTask() {
        TaskManager.defineTask(GEOFENCE_TASK_NAME, async ({ data, error }: { data: any; error: any }) => {
            if (error) {
                console.error('[CourtDetection] Geofence task error:', error);
                return;
            }

            const { eventType, region } = data as { eventType: Location.GeofencingEventType; region: Location.LocationRegion };

            if (region?.identifier) {
                if (eventType === Location.GeofencingEventType.Enter) {
                    await this.handleCourtEntry(region.identifier);
                } else if (eventType === Location.GeofencingEventType.Exit) {
                    await this.handleCourtExit(region.identifier);
                }
            }
        });
    }

    /**
     * Start monitoring for court proximity
     */
    async startMonitoring(): Promise<boolean> {
        try {
            // Request background location permission
            const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
            if (foregroundStatus !== 'granted') {
                console.log('[CourtDetection] Foreground location permission denied');
                return false;
            }

            const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
            if (backgroundStatus !== 'granted') {
                console.log('[CourtDetection] Background location permission denied');
                // Can still work with foreground only
            }

            // Load known courts from Firebase
            await this.loadKnownCourts();

            // Set up geofences for nearby courts
            await this.setupGeofences();

            this.isMonitoring = true;
            console.log('[CourtDetection] Started monitoring for courts');
            return true;
        } catch (error) {
            console.error('[CourtDetection] Error starting monitoring:', error);
            return false;
        }
    }

    /**
     * Stop monitoring
     */
    async stopMonitoring(): Promise<void> {
        try {
            await Location.stopGeofencingAsync(GEOFENCE_TASK_NAME);
            this.isMonitoring = false;
            console.log('[CourtDetection] Stopped monitoring');
        } catch (error) {
            console.error('[CourtDetection] Error stopping monitoring:', error);
        }
    }

    /**
     * Load known court locations from Firebase
     */
    private async loadKnownCourts(): Promise<void> {
        try {
            if (!db) {
                // Use fallback sample courts
                this.knownCourts = this.getSampleCourts();
                return;
            }

            const courtsRef = collection(db as Firestore, 'courts');
            const snapshot = await getDocs(courtsRef);

            this.knownCourts = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                this.knownCourts.push({
                    id: doc.id,
                    name: data.name,
                    sport: data.sport || 'basketball',
                    lat: data.lat,
                    lng: data.lng,
                });
            });

            if (this.knownCourts.length === 0) {
                this.knownCourts = this.getSampleCourts();
            }

            console.log(`[CourtDetection] Loaded ${this.knownCourts.length} courts`);
        } catch (error) {
            console.error('[CourtDetection] Error loading courts:', error);
            this.knownCourts = this.getSampleCourts();
        }
    }

    /**
     * Sample courts for testing
     */
    private getSampleCourts(): CourtLocation[] {
        return [
            { id: 'court_1', name: 'Myrtle Beach Park Courts', sport: 'basketball', lat: 33.6891, lng: -78.8867 },
            { id: 'court_2', name: 'Grand Park Tennis', sport: 'tennis', lat: 33.6950, lng: -78.8800 },
            { id: 'court_3', name: 'Coastal Pickleball', sport: 'pickleball', lat: 33.6820, lng: -78.8920 },
        ];
    }

    /**
     * Set up geofences around nearby courts
     */
    private async setupGeofences(): Promise<void> {
        try {
            // Get current location
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            // Filter courts within 10km
            const nearbyCourts = this.knownCourts.filter((court) => {
                const distance = this.calculateDistance(
                    location.coords.latitude,
                    location.coords.longitude,
                    court.lat,
                    court.lng
                );
                return distance <= 10; // 10km radius
            });

            if (nearbyCourts.length === 0) {
                console.log('[CourtDetection] No courts nearby');
                return;
            }

            // Create geofence regions
            const regions: Location.LocationRegion[] = nearbyCourts.map((court) => ({
                identifier: court.id,
                latitude: court.lat,
                longitude: court.lng,
                radius: COURT_DETECTION_RADIUS_METERS,
                notifyOnEnter: true,
                notifyOnExit: true,
            }));

            // Start geofencing
            await Location.startGeofencingAsync(GEOFENCE_TASK_NAME, regions);
            console.log(`[CourtDetection] Set up ${regions.length} geofences`);
        } catch (error) {
            console.error('[CourtDetection] Error setting up geofences:', error);
        }
    }

    /**
     * Handle entering a court's geofence
     */
    private async handleCourtEntry(courtId: string): Promise<void> {
        console.log(`[CourtDetection] Entered court: ${courtId}`);

        const court = this.knownCourts.find((c) => c.id === courtId);
        if (!court) return;

        // Start a new session
        const session: CourtSession = {
            courtId: court.id,
            courtName: court.name,
            sport: court.sport,
            startTime: Date.now(),
            location: { lat: court.lat, lng: court.lng },
            synced: false,
        };

        await AsyncStorage.setItem(COURT_SESSION_KEY, JSON.stringify(session));
        console.log(`[CourtDetection] Started session at ${court.name}`);
    }

    /**
     * Handle exiting a court's geofence
     */
    private async handleCourtExit(courtId: string): Promise<void> {
        console.log(`[CourtDetection] Exited court: ${courtId}`);

        try {
            const sessionData = await AsyncStorage.getItem(COURT_SESSION_KEY);
            if (!sessionData) return;

            const session: CourtSession = JSON.parse(sessionData);
            if (session.courtId !== courtId) return;

            session.endTime = Date.now();
            const duration = session.endTime - session.startTime;

            // Only count if session was longer than minimum
            if (duration < MIN_SESSION_DURATION_MS) {
                console.log(`[CourtDetection] Session too short (${Math.round(duration / 60000)} min), ignoring`);
                await AsyncStorage.removeItem(COURT_SESSION_KEY);
                return;
            }

            // Calculate calories
            const durationMinutes = Math.round(duration / 60000);
            session.estimatedCalories = this.estimateCalories(session.sport, durationMinutes);

            // Log to Apple Health
            await this.logSessionToHealth(session);

            // Save to history
            await this.saveSessionHistory(session);

            // Clear active session
            await AsyncStorage.removeItem(COURT_SESSION_KEY);

            console.log(`[CourtDetection] Logged ${durationMinutes} min session, ${session.estimatedCalories} cal`);
        } catch (error) {
            console.error('[CourtDetection] Error handling court exit:', error);
        }
    }

    /**
     * Estimate calories burned based on sport and duration
     */
    estimateCalories(sport: string, durationMinutes: number, weightKg: number = 70): number {
        const sportLower = sport.toLowerCase();
        const met = SPORT_MET_VALUES[sportLower] || SPORT_MET_VALUES.default;

        // Calories = MET × weight (kg) × duration (hours)
        const durationHours = durationMinutes / 60;
        const calories = met * weightKg * durationHours;

        return Math.round(calories);
    }

    /**
     * Log session to Apple Health
     */
    private async logSessionToHealth(session: CourtSession): Promise<void> {
        try {
            const durationMinutes = session.endTime
                ? Math.round((session.endTime - session.startTime) / 60000)
                : 60;

            await this.healthService.saveWorkout({
                workoutType: session.sport as any,
                duration: durationMinutes,
                calories: session.estimatedCalories || 0,
            });

            session.synced = true;
            console.log('[CourtDetection] Synced workout to Apple Health');
        } catch (error) {
            console.error('[CourtDetection] Error logging to Health:', error);
        }
    }

    /**
     * Save session to local history
     */
    private async saveSessionHistory(session: CourtSession): Promise<void> {
        try {
            const historyData = await AsyncStorage.getItem('court_session_history');
            const history: CourtSession[] = historyData ? JSON.parse(historyData) : [];

            history.unshift(session);

            // Keep only last 100 sessions
            if (history.length > 100) {
                history.splice(100);
            }

            await AsyncStorage.setItem('court_session_history', JSON.stringify(history));
        } catch (error) {
            console.error('[CourtDetection] Error saving history:', error);
        }
    }

    /**
     * Get session history
     */
    async getSessionHistory(limit: number = 20): Promise<CourtSession[]> {
        try {
            const historyData = await AsyncStorage.getItem('court_session_history');
            if (!historyData) return [];

            const history: CourtSession[] = JSON.parse(historyData);
            return history.slice(0, limit);
        } catch (error) {
            console.error('[CourtDetection] Error getting history:', error);
            return [];
        }
    }

    /**
     * Get active session if any
     */
    async getActiveSession(): Promise<CourtSession | null> {
        try {
            const sessionData = await AsyncStorage.getItem(COURT_SESSION_KEY);
            if (!sessionData) return null;

            return JSON.parse(sessionData);
        } catch (error) {
            return null;
        }
    }

    /**
     * Manually start a session (for check-in)
     */
    async startManualSession(court: { id: string; name: string; sport: string; lat: number; lng: number }): Promise<void> {
        const session: CourtSession = {
            courtId: court.id,
            courtName: court.name,
            sport: court.sport,
            startTime: Date.now(),
            location: { lat: court.lat, lng: court.lng },
            synced: false,
        };

        await AsyncStorage.setItem(COURT_SESSION_KEY, JSON.stringify(session));
        console.log(`[CourtDetection] Manually started session at ${court.name}`);
    }

    /**
     * Manually end a session
     */
    async endManualSession(): Promise<CourtSession | null> {
        try {
            const sessionData = await AsyncStorage.getItem(COURT_SESSION_KEY);
            if (!sessionData) return null;

            const session: CourtSession = JSON.parse(sessionData);
            session.endTime = Date.now();

            const durationMinutes = Math.round((session.endTime - session.startTime) / 60000);
            session.estimatedCalories = this.estimateCalories(session.sport, durationMinutes);

            // Log to Apple Health
            await this.logSessionToHealth(session);

            // Save to history
            await this.saveSessionHistory(session);

            // Clear active session
            await AsyncStorage.removeItem(COURT_SESSION_KEY);

            return session;
        } catch (error) {
            console.error('[CourtDetection] Error ending session:', error);
            return null;
        }
    }

    /**
     * Calculate distance between two coordinates in km
     */
    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Earth's radius in km
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private toRad(degrees: number): number {
        return degrees * (Math.PI / 180);
    }

    /**
     * Get statistics for the current week
     */
    async getWeeklyStats(): Promise<{
        totalSessions: number;
        totalMinutes: number;
        totalCalories: number;
        favoriteSpot: string | null;
    }> {
        const history = await this.getSessionHistory(100);
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

        const thisWeek = history.filter((s) => s.startTime >= oneWeekAgo);

        if (thisWeek.length === 0) {
            return { totalSessions: 0, totalMinutes: 0, totalCalories: 0, favoriteSpot: null };
        }

        const totalMinutes = thisWeek.reduce((sum, s) => {
            const duration = s.endTime ? (s.endTime - s.startTime) / 60000 : 0;
            return sum + Math.round(duration);
        }, 0);

        const totalCalories = thisWeek.reduce((sum, s) => sum + (s.estimatedCalories || 0), 0);

        // Find favorite spot
        const spotCounts: Record<string, number> = {};
        thisWeek.forEach((s) => {
            spotCounts[s.courtName] = (spotCounts[s.courtName] || 0) + 1;
        });
        const favoriteSpot = Object.entries(spotCounts)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

        return {
            totalSessions: thisWeek.length,
            totalMinutes,
            totalCalories,
            favoriteSpot,
        };
    }
}

// Export singleton
export const courtDetectionService = CourtDetectionService.getInstance();
export { CourtDetectionService };
