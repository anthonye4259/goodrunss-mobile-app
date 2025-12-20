/**
 * SessionCalorieCard
 * 
 * Displays estimated calorie burn for trainer sessions or court activities
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// MET values for calorie calculation
const MET_VALUES: Record<string, number> = {
    basketball: 8.0,
    tennis: 7.3,
    pickleball: 6.0,
    volleyball: 4.0,
    soccer: 7.0,
    golf: 4.3,
    swimming: 6.0,
    yoga: 2.5,
    pilates: 3.0,
    lagree: 4.5,
    barre: 3.5,
    meditation: 1.5,
    running: 9.8,
    walking: 3.5,
    hiit: 10.0,
    strength: 5.0,
    default: 5.0,
};

// Fun comparisons for calorie burn
const CALORIE_COMPARISONS = [
    { threshold: 100, text: 'a donut', emoji: '🍩' },
    { threshold: 200, text: 'a bagel with cream cheese', emoji: '🥯' },
    { threshold: 350, text: '1.5 BigMacs', emoji: '🍔' },
    { threshold: 500, text: 'a Chipotle burrito', emoji: '🌯' },
    { threshold: 750, text: 'a large pizza slice', emoji: '🍕' },
    { threshold: 1000, text: 'a full dinner', emoji: '🍽️' },
];

interface SessionCalorieCardProps {
    sport: string;
    durationMinutes: number;
    weightKg?: number; // Default 70kg if not provided
    compact?: boolean;
    showComparison?: boolean;
    style?: object;
}

/**
 * Calculate calories burned
 */
export function calculateCalories(sport: string, durationMinutes: number, weightKg: number = 70): number {
    const sportLower = sport.toLowerCase();
    const met = MET_VALUES[sportLower] || MET_VALUES.default;

    // Calories = MET × weight (kg) × duration (hours)
    const durationHours = durationMinutes / 60;
    return Math.round(met * weightKg * durationHours);
}

/**
 * Get fun comparison for calorie burn
 */
function getCalorieComparison(calories: number): { text: string; emoji: string } | null {
    for (const comparison of CALORIE_COMPARISONS) {
        if (calories <= comparison.threshold) {
            return comparison;
        }
    }
    return CALORIE_COMPARISONS[CALORIE_COMPARISONS.length - 1];
}

export function SessionCalorieCard({
    sport,
    durationMinutes,
    weightKg = 70,
    compact = false,
    showComparison = true,
    style,
}: SessionCalorieCardProps) {
    const calories = calculateCalories(sport, durationMinutes, weightKg);
    const comparison = showComparison ? getCalorieComparison(calories) : null;

    if (compact) {
        return (
            <View style={[styles.compactContainer, style]}>
                <Ionicons name="flame" size={14} color="#FF6B35" />
                <Text style={styles.compactText}>Est. {calories} cal</Text>
            </View>
        );
    }

    return (
        <LinearGradient
            colors={['rgba(255, 107, 53, 0.15)', 'rgba(255, 107, 53, 0.05)']}
            style={[styles.container, style]}
        >
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <Ionicons name="flame" size={24} color="#FF6B35" />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.label}>Estimated Burn</Text>
                    <Text style={styles.calories}>{calories} calories</Text>
                </View>
            </View>

            <View style={styles.details}>
                <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                    <Text style={styles.detailText}>{durationMinutes} min session</Text>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="fitness-outline" size={14} color="#9CA3AF" />
                    <Text style={styles.detailText}>{sport}</Text>
                </View>
            </View>

            {comparison && (
                <View style={styles.comparison}>
                    <Text style={styles.comparisonText}>
                        {comparison.emoji} That's about {comparison.text} burned!
                    </Text>
                </View>
            )}
        </LinearGradient>
    );
}

/**
 * Inline calorie badge for booking cards
 */
export function CalorieBadge({ sport, durationMinutes }: { sport: string; durationMinutes: number }) {
    const calories = calculateCalories(sport, durationMinutes);

    return (
        <View style={styles.badge}>
            <Ionicons name="flame" size={12} color="#FF6B35" />
            <Text style={styles.badgeText}>{calories} cal</Text>
        </View>
    );
}

/**
 * Simple text for inline display
 */
export function CalorieEstimateText({ sport, durationMinutes }: { sport: string; durationMinutes: number }) {
    const calories = calculateCalories(sport, durationMinutes);
    return (
        <Text style={styles.estimateText}>
            🔥 Est. {calories} cal burn
        </Text>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 107, 53, 0.2)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 107, 53, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    label: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 2,
    },
    calories: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    details: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    detailText: {
        fontSize: 13,
        color: '#9CA3AF',
    },
    comparison: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    comparisonText: {
        fontSize: 13,
        color: '#D1D5DB',
        textAlign: 'center',
    },
    // Compact styles
    compactContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(255, 107, 53, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    compactText: {
        fontSize: 12,
        color: '#FF6B35',
        fontWeight: '600',
    },
    // Badge styles
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: 'rgba(255, 107, 53, 0.15)',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 11,
        color: '#FF6B35',
        fontWeight: '600',
    },
    // Estimate text
    estimateText: {
        fontSize: 13,
        color: '#9CA3AF',
    },
});

export default SessionCalorieCard;
