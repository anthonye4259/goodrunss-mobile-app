import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

interface Friend {
    id: string;
    name: string;
    avatar: string; // Initial for now
    status: 'playing' | 'checked-in' | 'online';
    venueName?: string;
    venueId?: string;
    timeAgo: string;
}

// Mock Data
const FRIENDS: Friend[] = [
    { id: '1', name: 'Sarah M.', avatar: 'S', status: 'playing', venueName: 'Central Park Courts', venueId: '1', timeAgo: 'Now' },
    { id: '2', name: 'James Rod', avatar: 'J', status: 'checked-in', venueName: 'Downtown Rec', venueId: '3', timeAgo: '5m' },
    { id: '3', name: 'Alex Chen', avatar: 'A', status: 'playing', venueName: 'Riverside Tennis', venueId: '2', timeAgo: '12m' },
    { id: '4', name: 'Marcus', avatar: 'M', status: 'online', timeAgo: 'Online' },
];

export function FriendActivityRail() {
    const handlePress = (friend: Friend) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (friend.venueId) {
            router.push(`/venues/${friend.venueId}`);
        } else {
            // Navigate to profile or chat
            console.log('Navigate to friend profile');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Friends Active</Text>
                <TouchableOpacity>
                    <Text style={styles.seeAll}>Find Friends</Text>
                </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Add Friend Button */}
                <TouchableOpacity style={styles.addFriendCard} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                    <LinearGradient colors={['#1A1A1A', '#111']} style={styles.addFriendGradient}>
                        <View style={styles.addIcon}>
                            <Ionicons name="add" size={24} color="#FFF" />
                        </View>
                        <Text style={styles.addText}>Invite</Text>
                    </LinearGradient>
                </TouchableOpacity>

                {FRIENDS.map((friend) => (
                    <TouchableOpacity
                        key={friend.id}
                        style={styles.friendCard}
                        onPress={() => handlePress(friend)}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#1F1F1F', '#121212']}
                            style={styles.cardGradient}
                        >
                            <View style={styles.avatarRow}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>{friend.avatar}</Text>
                                    <View style={[styles.statusDot, { backgroundColor: friend.status === 'playing' ? '#EF4444' : '#22C55E' }]} />
                                </View>
                                <View style={styles.info}>
                                    <Text style={styles.name}>{friend.name}</Text>
                                    <Text style={styles.status} numberOfLines={1}>
                                        {friend.status === 'playing' ? 'Playing' : friend.status === 'checked-in' ? 'Checked In' : 'Online'}
                                        {friend.venueName && ` • ${friend.timeAgo}`}
                                    </Text>
                                </View>
                            </View>

                            {friend.venueName && (
                                <View style={styles.venueTag}>
                                    <Ionicons name="location-sharp" size={10} color="#9CA3AF" />
                                    <Text style={styles.venueText} numberOfLines={1}>{friend.venueName}</Text>
                                </View>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontFamily: 'Inter_700Bold',
        color: '#FFFFFF',
    },
    seeAll: {
        fontSize: 12,
        fontFamily: 'Inter_600SemiBold',
        color: '#7ED957',
    },
    scrollContent: {
        paddingHorizontal: 24,
        gap: 12,
    },
    addFriendCard: {
        width: 80,
        height: 100,
        borderRadius: 16,
        overflow: 'hidden',
    },
    addFriendGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderStyle: 'dashed',
        borderRadius: 16,
    },
    addIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    addText: {
        fontSize: 12,
        color: '#FFF',
        fontFamily: 'Inter_500Medium',
    },
    friendCard: {
        width: 160,
        height: 100,
        borderRadius: 16,
        overflow: 'hidden',
    },
    cardGradient: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
    },
    avatarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#333',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    avatarText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    statusDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: '#1F1F1F',
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 13,
        fontWeight: '600',
        color: '#FFF',
        marginBottom: 2,
    },
    status: {
        fontSize: 10,
        color: '#7ED957',
    },
    venueTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    venueText: {
        fontSize: 10,
        color: '#9CA3AF',
        maxWidth: 110,
    },
});
