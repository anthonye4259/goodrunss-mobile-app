import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export function WeeklyGoalWidget() {
    const goal = 3;
    const current = 2;
    const progress = (current / goal) * 100;

    return (
        <LinearGradient
            colors={['#1F1F1F', '#121212']}
            style={styles.container}
        >
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Ionicons name="flame" size={18} color="#F97316" />
                    <Text style={styles.title}>Weekly Goal</Text>
                </View>
                <Text style={styles.streak}>🔥 12 Week Streak</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.textRow}>
                    <Text style={styles.current}>{current}</Text>
                    <Text style={styles.target}>/ {goal} workouts</Text>
                </View>
                <View style={styles.progressBarBg}>
                    <LinearGradient
                        colors={['#F97316', '#FDBA74']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.progressBarFill, { width: `${progress}%` }]}
                    />
                </View>
                <Text style={styles.motivation}>You're crushing it! 1 more to hit your goal.</Text>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    title: {
        fontSize: 14,
        fontFamily: 'Inter_600SemiBold',
        color: '#FFF',
    },
    streak: {
        fontSize: 12,
        color: '#F97316',
        fontFamily: 'Inter_500Medium',
    },
    content: {
        gap: 8,
    },
    textRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    current: {
        fontSize: 24,
        fontFamily: 'Inter_700Bold',
        color: '#FFF',
    },
    target: {
        fontSize: 14,
        color: '#9CA3AF',
        fontFamily: 'Inter_500Medium',
    },
    progressBarBg: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    motivation: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 4,
    },
});
