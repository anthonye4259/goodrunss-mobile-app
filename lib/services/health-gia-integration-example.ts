// Example: How to use Health Service with GIA
// Add this to your GIA chat component or wherever you call giaService.sendMessage()

import { HealthService } from '@/lib/services/health-service';
import { giaService } from '@/lib/services/gia-service';

// Example 1: Get health data and pass to GIA
async function sendMessageToGIA(userMessage: string) {
    const healthService = HealthService.getInstance();

    // Request permissions if not already granted
    await healthService.requestPermissions();

    // Get health data
    const [todayStats, weeklyStats, recentWorkouts] = await Promise.all([
        healthService.getTodayStats(),
        healthService.getWeeklyStats(),
        healthService.getRecentWorkouts(7),
    ]);

    // Send to GIA with health context
    const response = await giaService.sendMessage(
        [{ role: 'user', content: userMessage }],
        {
            location: { city: 'New York', state: 'NY' },
            sport: 'Basketball',
            userType: 'player',
            healthData: {
                todayStats: todayStats || undefined,
                weeklyStats: weeklyStats || undefined,
                recentWorkouts: recentWorkouts || undefined,
            },
        }
    );

    return response;
}

// Example 2: Auto-log workout after check-in
async function logWorkoutAfterCheckIn(sport: string, durationMinutes: number) {
    const healthService = HealthService.getInstance();

    // Estimate calories
    const calories = healthService.estimateCalories(sport, durationMinutes);

    // Save to Apple Health
    const success = await healthService.saveWorkout({
        workoutType: sport as any,
        duration: durationMinutes,
        calories,
    });

    if (success) {
        console.log('Workout logged to Apple Health!');
    }
}

// Example 3: Show health stats in profile
async function getHealthStatsForProfile() {
    const healthService = HealthService.getInstance();

    const [todayStats, weeklyStats, recentWorkouts] = await Promise.all([
        healthService.getTodayStats(),
        healthService.getWeeklyStats(),
        healthService.getRecentWorkouts(30),
    ]);

    return {
        today: todayStats,
        week: weeklyStats,
        history: recentWorkouts,
    };
}

// Example 4: GIA morning check-in
async function giaHealthCheckIn() {
    const healthService = HealthService.getInstance();
    const todayStats = await healthService.getTodayStats();

    if (!todayStats) {
        return "Good morning! Ready to get active today?";
    }

    const response = await giaService.sendMessage(
        [{ role: 'user', content: 'Good morning GIA, how am I doing today?' }],
        {
            healthData: {
                todayStats,
            },
        }
    );

    return response;
}

export { sendMessageToGIA, logWorkoutAfterCheckIn, getHealthStatsForProfile, giaHealthCheckIn };
