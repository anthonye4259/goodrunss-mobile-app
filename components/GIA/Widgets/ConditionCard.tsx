import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export const ConditionCard = () => {
    // Dynamic Mock Data Generation
    const date = new Date();
    const hour = date.getHours();
    const month = date.getMonth(); // 0 = Jan

    // Heuristics
    const isNight = hour >= 19 || hour < 6;
    const isWinter = month <= 2 || month >= 10; // Nov-Mar

    // Determine Temperature
    let baseTemp = isWinter ? 38 : 72;
    if (isNight) baseTemp -= 10;
    const temp = `${baseTemp}°`;

    // Determine Status
    let statusText = "EXCELLENT CONDITIONS";
    let statusColor = "#A4FF00";
    let iconName: "sunny" | "moon" | "cloudy" | "snow" = "sunny";
    let iconColor = "#FDB813";
    let footer = "Perfect for outdoor tennis today! Courts are dry.";

    if (isWinter) {
        statusText = "POOR CONDITIONS";
        statusColor = "#EF4444"; // Red for bad
        iconName = "snow";
        iconColor = "#FFF";
        footer = "It's freezing! We recommend indoor courts.";
    }

    if (isNight) {
        statusText = "COURTS CLOSED / DARK";
        statusColor = "#666";
        iconName = "moon";
        iconColor = "#CCC";
        footer = "It's late. Most outdoor lights are off.";
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={isNight ? ['#0F172A', '#020617'] : ['#1A2900', '#0F1A00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.header}>
                    <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
                        <View style={[styles.dot, { backgroundColor: statusColor }]} />
                        <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
                    </View>
                    <Ionicons name={iconName} size={20} color={iconColor} />
                </View>

                <View style={styles.mainInfo}>
                    <Text style={styles.temperature}>{temp}</Text>
                    <View style={styles.divider} />
                    <View>
                        <Text style={styles.subtext}>Wind: {isWinter ? '12' : '3'}mph N</Text>
                        <Text style={styles.subtext}>Humidity: {isWinter ? '65%' : '45%'}</Text>
                    </View>
                </View>

                <Text style={styles.footerText}>
                    {footer}
                </Text>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 280,
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(126, 217, 87, 0.2)',
    },
    gradient: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(164, 255, 0, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#A4FF00',
        marginRight: 6,
    },
    statusText: {
        color: '#A4FF00',
        fontSize: 10,
        fontFamily: 'Inter_700Bold',
        letterSpacing: 0.5,
    },
    mainInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    temperature: {
        fontSize: 32,
        fontFamily: 'Inter_700Bold',
        color: '#FFF',
    },
    divider: {
        width: 1,
        height: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginHorizontal: 12,
    },
    subtext: {
        color: '#CCC',
        fontSize: 12,
        fontFamily: 'Inter_400Regular',
    },
    footerText: {
        color: '#9CA3AF',
        fontSize: 12,
        fontStyle: 'italic',
    },
});
