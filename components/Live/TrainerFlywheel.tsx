import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

interface Trainer {
    id: string;
    name: string;
    specialty: string;
    rating: number;
    imageUrl?: string;
    isOnline?: boolean;
}

const MOCK_TRAINERS: Trainer[] = [
    { id: '1', name: 'Coach Mike', specialty: 'Basketball', rating: 4.9, isOnline: true },
    { id: '2', name: 'Sarah J.', specialty: 'Tennis', rating: 4.8, isOnline: true },
    { id: '3', name: 'David R.', specialty: 'Conditioning', rating: 5.0, isOnline: false },
    { id: '4', name: 'Jessica L.', specialty: 'Yoga', rating: 4.7, isOnline: true },
    { id: '5', name: 'Coach K', specialty: 'Pro Skills', rating: 4.9, isOnline: false },
];

export function TrainerFlywheel({ sport }: { sport?: string }) {
    const handlePress = (id: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(`/trainers/${id}` as any);
    };

    // Filter trainers by sport
    const filteredTrainers = React.useMemo(() => {
        if (!sport) return MOCK_TRAINERS;

        // In a real app we would have more data, for now we will just show them all
        // but maybe reorder or just filter if we had matching specialties
        const matches = MOCK_TRAINERS.filter(t => t.specialty === sport);
        return matches.length > 0 ? matches : MOCK_TRAINERS;
    }, [sport]);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Top {sport || "Coaches"}</Text>
                <TouchableOpacity onPress={() => router.push('/trainers' as any)}>
                    <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {filteredTrainers.map((trainer, index) => (
                    <TouchableOpacity
                        key={trainer.id}
                        style={styles.card}
                        onPress={() => handlePress(trainer.id)}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#1A1A1A', '#111111']}
                            style={styles.cardGradient}
                        >
                            <View style={styles.avatarContainer}>
                                {/* Mock Avatar Placeholder */}
                                <LinearGradient
                                    colors={['#333', '#222']}
                                    style={styles.avatar}
                                >
                                    <Text style={styles.avatarText}>{trainer.name.charAt(0)}</Text>
                                </LinearGradient>
                                {trainer.isOnline && <View style={styles.onlineBadge} />}
                            </View>

                            <Text style={styles.name} numberOfLines={1}>{trainer.name}</Text>
                            <Text style={styles.specialty}>{trainer.specialty}</Text>

                            <View style={styles.ratingRow}>
                                <Ionicons name="star" size={10} color="#FDB813" />
                                <Text style={styles.rating}>{trainer.rating}</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 12,
    },
    title: {
        fontSize: 18, // Slightly smaller than section titles
        fontFamily: 'Inter_700Bold',
        color: '#FFF',
    },
    seeAll: {
        fontSize: 12,
        color: '#7ED957',
        fontFamily: 'Inter_600SemiBold',
    },
    scrollContent: {
        paddingHorizontal: 24,
        gap: 12,
    },
    card: {
        width: 100, // Compact width for flywheel effect
        borderRadius: 16,
        overflow: 'hidden',
    },
    cardGradient: {
        padding: 12,
        alignItems: 'center',
        height: 140,
        justifyContent: 'center',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 8,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    avatarText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    onlineBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#7ED957',
        borderWidth: 2,
        borderColor: '#1A1A1A',
    },
    name: {
        fontSize: 12,
        fontFamily: 'Inter_600SemiBold',
        color: '#FFF',
        marginBottom: 2,
        textAlign: 'center',
    },
    specialty: {
        fontSize: 10,
        color: '#9CA3AF',
        marginBottom: 6,
        textAlign: 'center',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    rating: {
        fontSize: 10,
        color: '#FFF',
        fontWeight: 'bold',
    }
});
