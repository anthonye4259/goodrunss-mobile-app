import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface TrainerCarouselProps {
    trainers?: any[];
}

export const TrainerCarousel = ({ trainers = [] }: TrainerCarouselProps) => {
    if (!trainers.length) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Top Available Coaches</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {trainers.map((trainer) => (
                    <TouchableOpacity key={trainer.id} style={styles.card} activeOpacity={0.8}>
                        <Image source={{ uri: trainer.image }} style={styles.image} />
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.9)']}
                            style={styles.gradientOverlay}
                        >
                            <View style={styles.info}>
                                <Text style={styles.name}>{trainer.name}</Text>
                                <Text style={styles.sport}>{trainer.sport}</Text>
                                <View style={styles.ratingRow}>
                                    <Ionicons name="star" size={12} color="#FDB813" />
                                    <Text style={styles.rating}>{trainer.rating}</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.bookButton}>
                                <Text style={styles.bookText}>Book</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
    },
    headerTitle: {
        fontSize: 12,
        color: '#999',
        marginBottom: 8,
        marginLeft: 4,
        fontFamily: 'Inter_600SemiBold',
    },
    scrollContent: {
        paddingRight: 16,
    },
    card: {
        width: 140,
        height: 180,
        borderRadius: 12,
        marginRight: 12,
        overflow: 'hidden',
        backgroundColor: '#222',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    gradientOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60%',
        justifyContent: 'flex-end',
        padding: 10,
    },
    info: {
        marginBottom: 8,
    },
    name: {
        color: '#FFF',
        fontSize: 14,
        fontFamily: 'Inter_700Bold',
    },
    sport: {
        color: '#CCC',
        fontSize: 12,
        fontFamily: 'Inter_400Regular',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    rating: {
        color: '#FDB813',
        fontSize: 12,
        marginLeft: 4,
        fontWeight: 'bold',
    },
    bookButton: {
        backgroundColor: '#7ED957',
        paddingVertical: 4,
        borderRadius: 6,
        alignItems: 'center',
    },
    bookText: {
        color: '#000',
        fontSize: 12,
        fontWeight: 'bold',
    },
});
