/**
 * Widget Data Bridge
 * 
 * Sends data from React Native to iOS widgets via App Group UserDefaults
 * This allows the widget to display up-to-date information
 */

import { NativeModules, Platform } from 'react-native';

// Types matching the Swift widget data structures
export interface VenueActivity {
    name: string;
    playerCount: number;
    sport: string;
    distance: string;
}

export interface FriendActivity {
    name: string;
    venue: string;
    checkedInAt: Date;
}

export interface WeatherData {
    temp: number;
    condition: string;
    icon: string;
}

export interface PlayerWidgetData {
    venues: VenueActivity[];
    friends: FriendActivity[];
    weather: WeatherData | null;
    bestTimeVenue: string | null;
    bestTimeHour: string | null;
    updatedAt: Date;
    userType: 'player';
}

export interface TrainerWidgetData {
    todaySessions: number;
    todayEarnings: number;
    upcomingClient: string | null;
    upcomingTime: string | null;
    weeklyEarnings: number;
    totalClients: number;
    updatedAt: Date;
}

// App Group identifier (must match widget configuration)
const APP_GROUP = 'group.com.goodrunss.app';

class WidgetDataBridge {
    private static instance: WidgetDataBridge;

    static getInstance(): WidgetDataBridge {
        if (!WidgetDataBridge.instance) {
            WidgetDataBridge.instance = new WidgetDataBridge();
        }
        return WidgetDataBridge.instance;
    }

    /**
     * Update player widget data
     * Call this when:
     * - App launches
     * - User checks in
     * - Friend checks in
     * - Location changes
     */
    async updatePlayerWidget(data: PlayerWidgetData): Promise<void> {
        if (Platform.OS !== 'ios') return;

        try {
            // For now, we'll use a native module bridge
            // This requires expo-widget module or custom native module
            console.log('[Widget] Updating player widget data:', data);

            // Store in AsyncStorage as fallback
            // The native module will read from here and write to UserDefaults
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            await AsyncStorage.setItem('widget_player_data', JSON.stringify({
                ...data,
                updatedAt: new Date().toISOString()
            }));

            // Trigger widget refresh if native module available
            if (NativeModules.WidgetBridge) {
                await NativeModules.WidgetBridge.updatePlayerWidget(JSON.stringify(data));
            }
        } catch (error) {
            console.error('[Widget] Failed to update player widget:', error);
        }
    }

    /**
     * Update trainer widget data
     * Call this when:
     * - App launches
     * - Session is booked/completed
     * - Payment is received
     */
    async updateTrainerWidget(data: TrainerWidgetData): Promise<void> {
        if (Platform.OS !== 'ios') return;

        try {
            console.log('[Widget] Updating trainer widget data:', data);

            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            await AsyncStorage.setItem('widget_trainer_data', JSON.stringify({
                ...data,
                updatedAt: new Date().toISOString()
            }));

            if (NativeModules.WidgetBridge) {
                await NativeModules.WidgetBridge.updateTrainerWidget(JSON.stringify(data));
            }
        } catch (error) {
            console.error('[Widget] Failed to update trainer widget:', error);
        }
    }

    /**
     * Request widget timeline reload
     * Call after updating data to refresh widget immediately
     */
    async reloadWidgets(): Promise<void> {
        if (Platform.OS !== 'ios') return;

        try {
            if (NativeModules.WidgetBridge) {
                await NativeModules.WidgetBridge.reloadAllTimelines();
            }
        } catch (error) {
            console.error('[Widget] Failed to reload widgets:', error);
        }
    }

    /**
     * Helper: Build player widget data from app state
     */
    buildPlayerWidgetData(
        venues: Array<{ name: string; checkInCount: number; sport: string; distance: number }>,
        friends: Array<{ name: string; venueName: string; checkedInAt: Date }>,
        weather?: { temp: number; condition: string }
    ): PlayerWidgetData {
        return {
            venues: venues.slice(0, 5).map(v => ({
                name: v.name,
                playerCount: v.checkInCount,
                sport: v.sport || 'basketball',
                distance: `${v.distance.toFixed(1)} mi`
            })),
            friends: friends.slice(0, 3).map(f => ({
                name: f.name,
                venue: f.venueName,
                checkedInAt: f.checkedInAt
            })),
            weather: weather ? {
                temp: Math.round(weather.temp),
                condition: weather.condition,
                icon: this.getWeatherIcon(weather.condition)
            } : null,
            bestTimeVenue: venues[0]?.name || null,
            bestTimeHour: this.getBestTimeHour(),
            updatedAt: new Date(),
            userType: 'player'
        };
    }

    /**
     * Helper: Build trainer widget data from app state
     */
    buildTrainerWidgetData(
        todaySessions: number,
        todayEarnings: number,
        weeklyEarnings: number,
        totalClients: number,
        upcomingSession?: { clientName: string; time: string }
    ): TrainerWidgetData {
        return {
            todaySessions,
            todayEarnings,
            upcomingClient: upcomingSession?.clientName || null,
            upcomingTime: upcomingSession?.time || null,
            weeklyEarnings,
            totalClients,
            updatedAt: new Date()
        };
    }

    private getWeatherIcon(condition: string): string {
        const lower = condition.toLowerCase();
        if (lower.includes('sun') || lower.includes('clear')) return '☀️';
        if (lower.includes('cloud')) return '☁️';
        if (lower.includes('rain')) return '🌧️';
        if (lower.includes('snow')) return '❄️';
        if (lower.includes('storm')) return '⛈️';
        return '🌤️';
    }

    private getBestTimeHour(): string {
        const hour = new Date().getHours();
        if (hour < 12) return '10 AM';
        if (hour < 17) return '3 PM';
        return '6 PM';
    }
}

export const widgetDataBridge = WidgetDataBridge.getInstance();
