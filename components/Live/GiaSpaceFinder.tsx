import React from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { router } from "expo-router"

interface PredictedVenue {
    id: string
    name: string
    distance: string
    likelihood: number // 0-100
    quietUntil: string
    image: string
}

const PREDICTIONS: PredictedVenue[] = [
    {
        id: "1",
        name: "Sunset Rec Center",
        distance: "0.8m",
        likelihood: 95,
        quietUntil: "5:00 PM",
        image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2940&auto=format&fit=crop"
    },
    {
        id: "2",
        name: "Morningside Court",
        distance: "1.2m",
        likelihood: 88,
        quietUntil: "4:30 PM",
        image: "https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?q=80&w=2800&auto=format&fit=crop"
    },
    {
        id: "3",
        name: "Riverbank Field",
        distance: "2.4m",
        likelihood: 82,
        quietUntil: "6:00 PM",
        image: "https://images.unsplash.com/photo-1520639899313-8a3ed35cf464?q=80&w=2832&auto=format&fit=crop"
    }
]

export function GiaSpaceFinder() {
    const handlePress = (id: string) => {
        Haptics.selectionAsync()
        // In real app, nav to venue details
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <LinearGradient
                        colors={['#7ED957', '#5CB33D']}
                        style={styles.aiBadge}
                    >
                        <Ionicons name="sparkles" size={12} color="#000" />
                        <Text style={styles.aiText}>GIA PREDICTIONS</Text>
                    </LinearGradient>
                    <Text style={styles.title}>Quiet Spaces Nearby</Text>
                </View>
                <TouchableOpacity>
                    <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {PREDICTIONS.map((venue) => (
                    <TouchableOpacity
                        key={venue.id}
                        style={styles.card}
                        onPress={() => handlePress(venue.id)}
                        activeOpacity={0.8}
                    >
                        <Image source={{ uri: venue.image }} style={styles.image} />
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.9)']}
                            style={styles.gradient}
                        />
                        
                        <View style={styles.cardContent}>
                            <View style={styles.likelihoodBadge}>
                                <Text style={styles.likelihoodText}>{venue.likelihood}% Empty</Text>
                            </View>
                            
                            <Text style={styles.venueName} numberOfLines={1}>{venue.name}</Text>
                            
                            <View style={styles.infoRow}>
                                <View style={styles.infoItem}>
                                    <Ionicons name="location" size={12} color="#CCC" />
                                    <Text style={styles.infoText}>{venue.distance}</Text>
                                </View>
                                <View style={styles.infoItem}>
                                    <Ionicons name="time" size={12} color="#7ED957" />
                                    <Text style={[styles.infoText, { color: '#7ED957' }]}>Until {venue.quietUntil}</Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
        </ScrollView>
        </View >
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    aiBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        gap: 4,
    },
    aiText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#000',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFF',
    },
    seeAll: {
        color: '#666',
        fontSize: 12,
        fontWeight: '600',
    },
    scrollContent: {
        paddingHorizontal: 16,
        gap: 12,
    },
    card: {
        width: 200,
        height: 140,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#222',
        borderWidth: 1,
        borderColor: '#333',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    gradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '80%',
    },
    cardContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 12,
    },
    likelihoodBadge: {
        position: 'absolute',
        top: -90, // moved to top right of card via absolute
        right: -8, // slight offset
        backgroundColor: '#7ED957',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        margin: 12,
    },
    likelihoodText: {
        color: '#000',
        fontSize: 10,
        fontWeight: 'bold',
    },
    venueName: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    infoText: {
        color: '#CCC',
        fontSize: 11,
    }
})
