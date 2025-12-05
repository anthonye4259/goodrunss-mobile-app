import AppleHealthKit, {
    HealthValue,
    HealthKitPermissions,
} from 'react-native-health';
import { Platform } from 'react-native';

export interface WorkoutData {
    workoutType: 'Basketball' | 'Tennis' | 'Pickleball' | 'Running' | 'Other';
    duration: number; // minutes
    calories: number;
    distance?: number; // miles
    heartRate?: {
        avg: number;
        max: number;
    };
    date: Date;
}

export interface DailyStats {
    steps: number;
    calories: number;
    activeMinutes: number;
    distance: number;
}

export interface WeeklyStats {
    totalWorkouts: number;
    totalCalories: number;
    totalMinutes: number;
    favoriteActivity?: string;
}

export class HealthService {
    private static instance: HealthService;
    private isInitialized = false;

    static getInstance(): HealthService {
        if (!HealthService.instance) {
            HealthService.instance = new HealthService();
        }
        return HealthService.instance;
    }

    /**
     * Request Health permissions
     */
    async requestPermissions(): Promise<boolean> {
        if (Platform.OS !== 'ios') {
            console.log('[HealthService] Health Kit only available on iOS');
            return false;
        }

        const permissions: HealthKitPermissions = {
            permissions: {
                read: [
                    AppleHealthKit.Constants.Permissions.Steps,
                    AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
                    AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
                    AppleHealthKit.Constants.Permissions.HeartRate,
                    AppleHealthKit.Constants.Permissions.Workout,
                ],
                write: [
                    AppleHealthKit.Constants.Permissions.Workout,
                ],
            },
        };

        return new Promise((resolve) => {
            AppleHealthKit.initHealthKit(permissions, (error: string) => {
                if (error) {
                    console.error('[HealthService] Error initializing Health Kit:', error);
                    resolve(false);
                } else {
                    console.log('[HealthService] Health Kit initialized successfully');
                    this.isInitialized = true;
                    resolve(true);
                }
            });
        });
    }

    /**
     * Get today's stats
     */
    async getTodayStats(): Promise<DailyStats | null> {
        if (!this.isInitialized) {
            await this.requestPermissions();
        }

        if (!this.isInitialized) return null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        try {
            const [steps, calories, distance] = await Promise.all([
                this.getSteps(today),
                this.getCalories(today),
                this.getDistance(today),
            ]);

            // Estimate active minutes based on calories (rough estimate: 100 cal = 10 min)
            const activeMinutes = Math.round((calories / 100) * 10);

            return {
                steps,
                calories,
                activeMinutes,
                distance,
            };
        } catch (error) {
            console.error('[HealthService] Error getting today stats:', error);
            return null;
        }
    }

    /**
     * Get steps for a specific date
     */
    private async getSteps(date: Date): Promise<number> {
        return new Promise((resolve) => {
            const options = {
                date: date.toISOString(),
            };

            AppleHealthKit.getStepCount(options, (err: Object, results: HealthValue) => {
                if (err) {
                    console.error('[HealthService] Error getting steps:', err);
                    resolve(0);
                } else {
                    resolve(results.value || 0);
                }
            });
        });
    }

    /**
     * Get calories burned for a specific date
     */
    private async getCalories(date: Date): Promise<number> {
        return new Promise((resolve) => {
            const options = {
                startDate: date.toISOString(),
                endDate: new Date().toISOString(),
            };

            AppleHealthKit.getActiveEnergyBurned(options, (err: Object, results: any) => {
                if (err) {
                    console.error('[HealthService] Error getting calories:', err);
                    resolve(0);
                } else {
                    const total = results.reduce((sum: number, item: any) => sum + (item.value || 0), 0);
                    resolve(Math.round(total));
                }
            });
        });
    }

    /**
     * Get distance for a specific date
     */
    private async getDistance(date: Date): Promise<number> {
        return new Promise((resolve) => {
            const options = {
                date: date.toISOString(),
            };

            AppleHealthKit.getDistanceWalkingRunning(options, (err: Object, results: HealthValue) => {
                if (err) {
                    console.error('[HealthService] Error getting distance:', err);
                    resolve(0);
                } else {
                    // Convert meters to miles
                    const miles = (results.value || 0) * 0.000621371;
                    resolve(Math.round(miles * 10) / 10);
                }
            });
        });
    }

    /**
     * Get recent workouts (last 30 days)
     */
    async getRecentWorkouts(days: number = 30): Promise<WorkoutData[]> {
        if (!this.isInitialized) {
            await this.requestPermissions();
        }

        if (!this.isInitialized) return [];

        return new Promise((resolve) => {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const options = {
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
            };

            AppleHealthKit.getSamples(options, (err: Object, results: any[]) => {
                if (err) {
                    console.error('[HealthService] Error getting workouts:', err);
                    resolve([]);
                } else {
                    const workouts: WorkoutData[] = results.map((workout) => ({
                        workoutType: this.mapWorkoutType(workout.activityName),
                        duration: Math.round(workout.duration / 60), // Convert seconds to minutes
                        calories: Math.round(workout.calories || 0),
                        distance: workout.distance ? Math.round(workout.distance * 0.000621371 * 10) / 10 : undefined,
                        date: new Date(workout.start),
                    }));
                    resolve(workouts);
                }
            });
        });
    }

    /**
     * Get weekly stats
     */
    async getWeeklyStats(): Promise<WeeklyStats | null> {
        const workouts = await this.getRecentWorkouts(7);

        if (workouts.length === 0) return null;

        const totalCalories = workouts.reduce((sum, w) => sum + w.calories, 0);
        const totalMinutes = workouts.reduce((sum, w) => sum + w.duration, 0);

        // Find favorite activity
        const activityCounts: { [key: string]: number } = {};
        workouts.forEach((w) => {
            activityCounts[w.workoutType] = (activityCounts[w.workoutType] || 0) + 1;
        });

        const favoriteActivity = Object.keys(activityCounts).reduce((a, b) =>
            activityCounts[a] > activityCounts[b] ? a : b
        );

        return {
            totalWorkouts: workouts.length,
            totalCalories,
            totalMinutes,
            favoriteActivity,
        };
    }

    /**
     * Save workout to Apple Health
     */
    async saveWorkout(workout: Omit<WorkoutData, 'date'>): Promise<boolean> {
        if (!this.isInitialized) {
            await this.requestPermissions();
        }

        if (!this.isInitialized) return false;

        return new Promise((resolve) => {
            const now = new Date();
            const startDate = new Date(now.getTime() - workout.duration * 60000);

            const options = {
                type: this.getHealthKitWorkoutType(workout.workoutType),
                startDate: startDate.toISOString(),
                endDate: now.toISOString(),
                energyBurned: workout.calories,
                energyBurnedUnit: 'kilocalorie',
                distance: workout.distance,
                distanceUnit: 'mile',
            };

            AppleHealthKit.saveWorkout(options, (err: Object, result: string) => {
                if (err) {
                    console.error('[HealthService] Error saving workout:', err);
                    resolve(false);
                } else {
                    console.log('[HealthService] Workout saved successfully:', result);
                    resolve(true);
                }
            });
        });
    }

    /**
     * Map workout type to Health Kit activity type
     */
    private getHealthKitWorkoutType(type: string): string {
        const mapping: { [key: string]: string } = {
            Basketball: AppleHealthKit.Constants.Activities.Basketball,
            Tennis: AppleHealthKit.Constants.Activities.Tennis,
            Pickleball: AppleHealthKit.Constants.Activities.Racquetball, // Closest match
            Running: AppleHealthKit.Constants.Activities.Running,
            Other: AppleHealthKit.Constants.Activities.Other,
        };

        return mapping[type] || AppleHealthKit.Constants.Activities.Other;
    }

    /**
     * Map Health Kit activity name to our workout type
     */
    private mapWorkoutType(activityName: string): WorkoutData['workoutType'] {
        const lowerName = activityName?.toLowerCase() || '';

        if (lowerName.includes('basketball')) return 'Basketball';
        if (lowerName.includes('tennis')) return 'Tennis';
        if (lowerName.includes('pickleball') || lowerName.includes('racquetball')) return 'Pickleball';
        if (lowerName.includes('run')) return 'Running';

        return 'Other';
    }

    /**
     * Estimate calories burned for a workout
     */
    estimateCalories(sport: string, durationMinutes: number): number {
        const caloriesPerHour: { [key: string]: number } = {
            Basketball: 450,
            Tennis: 400,
            Pickleball: 350,
            Running: 500,
            Other: 300,
        };

        const rate = caloriesPerHour[sport] || 300;
        return Math.round((rate / 60) * durationMinutes);
    }
}
