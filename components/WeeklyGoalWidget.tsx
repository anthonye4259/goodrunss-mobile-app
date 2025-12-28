import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function WeeklyGoalWidget() {
    const goal = 3;
    const current = 2;
    const progress = (current / goal) * 100;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Ionicons name="flame" size={20} color="#22C55E" />
                    <Text style={styles.title}>Weekly Activity</Text>
                </View>
                <Text style={styles.streak}>12 Week Streak</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.statsRow}>
                    <Text style={styles.current}>{current}</Text>
                    <Text style={styles.target}>/ {goal} workouts</Text>
                </View>

                {/* Minimal Progress Line */}
                <View style={styles.progressContainer}>
                    <View style={styles.track} />
                    <View style={[styles.fill, { width: `${progress}%` }]} />
                </View>

                <Text style={styles.motivation}>One more to hit your goal.</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#171717', // Very Subtle Card
        borderRadius: 24, // Softer corners
        padding: 20,
        marginBottom: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontSize: 16,
        fontFamily: 'Inter_600SemiBold',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    streak: {
        fontSize: 13,
        color: '#A3A3A3',
        fontFamily: 'Inter_500Medium',
    },
    content: {
        gap: 12,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 6,
    },
    current: {
        fontSize: 32,
        fontFamily: 'Inter_700Bold', // Tighter, bolder numbers
        color: '#FFFFFF',
        letterSpacing: -1,
    },
    target: {
        fontSize: 16,
        color: '#737373',
        fontFamily: 'Inter_500Medium',
    },
    progressContainer: {
        height: 6,
        position: 'relative',
        marginTop: 4,
    },
    track: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: '100%',
        backgroundColor: '#262626',
        borderRadius: 999,
    },
    fill: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        backgroundColor: '#22C55E', // Signal Green
        borderRadius: 999,
    },
    motivation: {
        fontSize: 14,
        color: '#A3A3A3',
        fontFamily: 'Inter_400Regular',
    },
});
