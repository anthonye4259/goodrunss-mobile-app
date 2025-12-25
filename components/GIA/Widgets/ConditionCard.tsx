import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export const ConditionCard = () => {
    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#1A2900', '#0F1A00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.header}>
                    <View style={styles.statusBadge}>
                        <View style={styles.dot} />
                        <Text style={styles.statusText}>EXCELLENT CONDITIONS</Text>
                    </View>
                    <Ionicons name="sunny" size={20} color="#FDB813" />
                </View>

                <View style={styles.mainInfo}>
                    <Text style={styles.temperature}>72°</Text>
                    <View style={styles.divider} />
                    <View>
                        <Text style={styles.subtext}>Wind: 3mph N</Text>
                        <Text style={styles.subtext}>Humidity: 45%</Text>
                    </View>
                </View>

                <Text style={styles.footerText}>
                    Perfect for outdoor tennis today! Courts are dry.
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
