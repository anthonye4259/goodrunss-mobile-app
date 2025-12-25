import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"

// Mock data for immediate client requests
const LIVE_REQUESTS = [
    { id: '1', name: 'Sarah', sport: 'Tennis', location: 'Riverside Park', time: 'Now', offer: '$60/hr', avatar: null },
    { id: '2', name: 'Mike Group', sport: 'Basketball', location: 'Central Courts', time: 'In 30m', offer: '$80/hr', avatar: null },
    { id: '3', name: 'Kids Class', sport: 'Soccer', location: 'Pier 40', time: '4:00 PM', offer: '$100/sess', avatar: null },
]

export function LiveRequestRail() {
    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <View style={styles.liveBadge}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>LIVE</Text>
                    </View>
                    <Text style={styles.title}>Client Requests</Text>
                </View>
                <TouchableOpacity onPress={handlePress}>
                    <Text style={styles.seeAll}>See all (5)</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {LIVE_REQUESTS.map((req) => (
                    <TouchableOpacity
                        key={req.id}
                        style={styles.card}
                        onPress={handlePress}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#1A1A1A', '#111']}
                            style={styles.cardGradient}
                        >
                            <View style={styles.cardHeader}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>{req.name[0]}</Text>
                                </View>
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>Looking for Coach</Text>
                                </View>
                            </View>

                            <View style={styles.cardBody}>
                                <Text style={styles.reqName}>{req.name}</Text>
                                <Text style={styles.reqDetail}>
                                    <Text style={{ color: '#7ED957' }}>{req.sport}</Text> • {req.location}
                                </Text>
                                <View style={styles.timeRow}>
                                    <Ionicons name="time" size={12} color="#AAA" />
                                    <Text style={styles.timeText}>{req.time}</Text>
                                </View>
                            </View>

                            <View style={styles.cardFooter}>
                                <Text style={styles.offerText}>{req.offer}</Text>
                                <View style={styles.acceptButton}>
                                    <Text style={styles.acceptText}>Accept</Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
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
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        gap: 4,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#EF4444',
    },
    liveText: {
        color: '#EF4444',
        fontSize: 10,
        fontWeight: 'bold',
    },
    seeAll: {
        color: '#666',
        fontSize: 14,
    },
    scrollContent: {
        paddingHorizontal: 24,
        gap: 12,
    },
    card: {
        width: 200,
        height: 160,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#333',
    },
    cardGradient: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#333',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    badge: {
        backgroundColor: '#222',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeText: {
        color: '#AAA',
        fontSize: 10,
    },
    cardBody: {
        gap: 2,
    },
    reqName: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    reqDetail: {
        color: '#888',
        fontSize: 12,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    timeText: {
        color: '#AAA',
        fontSize: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    offerText: {
        color: '#7ED957',
        fontWeight: 'bold',
        fontSize: 16,
    },
    acceptButton: {
        backgroundColor: '#FFF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    acceptText: {
        color: '#000',
        fontSize: 12,
        fontWeight: 'bold',
    },
})
