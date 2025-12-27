/**
 * Players Also Liked
 * 
 * Shows related courts based on current court selection.
 * Similar to "Also bought" on e-commerce.
 */

import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import { LiveTrafficBadge } from "@/components/Live/LiveTrafficBadge"

type Court = {
    id: string
    name: string
    sport: string
    distance: number
    liveStatus: "quiet" | "moderate" | "busy" | "packed"
    playersNow: number
}

// Mock recommendations - in production would use ML/collaborative filtering
const RECOMMENDATIONS: Court[] = [
    { id: "r1", name: "Chastain Park", sport: "Tennis", distance: 2.1, liveStatus: "quiet", playersNow: 3 },
    { id: "r2", name: "Grant Park", sport: "Tennis", distance: 1.8, liveStatus: "moderate", playersNow: 6 },
    { id: "r3", name: "Piedmont Park East", sport: "Pickleball", distance: 0.9, liveStatus: "busy", playersNow: 9 },
]

type Props = {
    currentCourtId?: string
    sport?: string
}

export function PlayersAlsoLiked({ currentCourtId, sport }: Props) {
    // Filter out current court
    const recommendations = RECOMMENDATIONS.filter(c => c.id !== currentCourtId)

    if (recommendations.length === 0) return null

    const handlePress = (court: Court) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        router.push("/(tabs)/live")
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="people" size={18} color="#8B5CF6" />
                <Text style={styles.title}>Players Also Liked</Text>
            </View>

            <FlatList
                horizontal
                data={recommendations}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => handlePress(item)}
                        activeOpacity={0.8}
                    >
                        <View style={styles.cardTop}>
                            <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                            <Text style={styles.cardSport}>{item.sport}</Text>
                        </View>
                        <LiveTrafficBadge
                            level={item.liveStatus}
                            playersNow={item.playersNow}
                            size="small"
                        />
                        <View style={styles.cardMeta}>
                            <Ionicons name="location" size={12} color="#666" />
                            <Text style={styles.cardDistance}>{item.distance} mi</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    title: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "700",
    },
    list: {
        paddingHorizontal: 20,
        gap: 12,
    },
    card: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 12,
        width: 150,
        borderWidth: 1,
        borderColor: "#8B5CF630",
    },
    cardTop: {
        marginBottom: 8,
    },
    cardName: {
        color: "#FFF",
        fontSize: 13,
        fontWeight: "600",
        marginBottom: 4,
    },
    cardSport: {
        color: "#8B5CF6",
        fontSize: 11,
    },
    cardMeta: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginTop: 8,
    },
    cardDistance: {
        color: "#666",
        fontSize: 11,
    },
})

export default PlayersAlsoLiked
