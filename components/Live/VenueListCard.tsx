import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Venue } from '@/lib/venue-data';

interface VenueListCardProps {
    venue: Venue;
    onPress: () => void;
}

export function VenueListCard({ venue, onPress }: VenueListCardProps) {
    // Determine traffic color
    const playerCount = venue.activePlayersNow || 0;
    const trafficColor = playerCount > 10 ? '#EF4444' : playerCount > 4 ? '#EAB308' : '#22C55E';
    const trafficLabel = playerCount > 10 ? 'Busy' : playerCount > 4 ? 'Active' : 'Quiet';

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.container}>
            <LinearGradient
                colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                style={styles.gradient}
            >
                <View style={styles.row}>
                    {/* Icon Box */}
                    <View style={styles.iconBox}>
                        <Ionicons name="location" size={24} color="#7ED957" />
                    </View>

                    {/* Info */}
                    <View style={styles.info}>
                        <Text style={styles.name} numberOfLines={1}>{venue.name}</Text>
                        <View style={styles.metaRow}>
                            <Ionicons name="star" size={12} color="#FDB813" />
                            <Text style={styles.rating}>{venue.rating}</Text>
                            <Text style={styles.dot}>•</Text>
                            <Text style={styles.distance}>{venue.distance || '0.8'} mi</Text>
                            <Text style={styles.dot}>•</Text>
                            <Text style={styles.sport}>{venue.sport}</Text>
                        </View>
                    </View>

                    {/* Action Arrow */}
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                </View>

                {/* Live Data Badge */}
                <View style={styles.liveSection}>
                    <View style={[styles.liveBadge, { backgroundColor: `${trafficColor}15` }]}>
                        <View style={[styles.liveDot, { backgroundColor: trafficColor }]} />
                        <Text style={[styles.liveText, { color: trafficColor }]}>
                            {playerCount} players active
                        </Text>
                    </View>
                    <View style={styles.statusBadge}>
                        <Text style={[styles.statusText, { color: trafficColor }]}>{trafficLabel}</Text>
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    gradient: {
        padding: 16,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: 'rgba(126, 217, 87, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontFamily: 'Inter_600SemiBold',
        color: '#FFF',
        marginBottom: 4,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rating: {
        fontSize: 12,
        color: '#FFF',
        fontWeight: '600',
        marginLeft: 4,
    },
    distance: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    sport: {
        fontSize: 12,
        color: '#7ED957',
    },
    dot: {
        fontSize: 12,
        color: '#666',
        marginHorizontal: 6,
    },
    liveSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    liveText: {
        fontSize: 12,
        fontWeight: '600',
    },
    statusBadge: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
    }
});
