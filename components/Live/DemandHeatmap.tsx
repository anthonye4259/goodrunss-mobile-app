import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"

export function DemandHeatmap({ sport }: { sport: string }) {
    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Demand Heatmap</Text>
            <TouchableOpacity
                style={styles.card}
                onPress={handlePress}
                activeOpacity={0.9}
            >
                <LinearGradient
                    colors={['#0F1620', '#050505']}
                    style={styles.gradient}
                >
                    {/* Simulated Map / Heatmap Content */}
                    <View style={styles.mapArea}>
                        {/* Hotspot 1 */}
                        <View style={[styles.hotspot, { top: '30%', left: '40%', width: 80, height: 80, opacity: 0.6 }]} />
                        <View style={[styles.hotspot, { top: '30%', left: '40%', width: 40, height: 40, opacity: 0.8 }]} />

                        {/* Hotspot 2 */}
                        <View style={[styles.hotspot, { top: '60%', left: '70%', width: 60, height: 60, opacity: 0.5 }]} />

                        {/* Labels */}
                        <View style={[styles.label, { top: '25%', left: '35%' }]}>
                            <Text style={styles.labelText}>High Demand</Text>
                            <Text style={styles.subText}>24 Players</Text>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <View>
                            <Text style={styles.footerTitle}>Central Park Area</Text>
                            <Text style={styles.footerSubtitle}>Peak hours for {sport} coaching</Text>
                        </View>
                        <View style={styles.statBadge}>
                            <Ionicons name="trending-up" size={16} color="#000" />
                            <Text style={styles.statText}>+45% Activity</Text>
                        </View>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 12,
    },
    card: {
        height: 220,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#333',
    },
    gradient: {
        flex: 1,
    },
    mapArea: {
        flex: 1,
        position: 'relative',
    },
    hotspot: {
        position: 'absolute',
        borderRadius: 999,
        backgroundColor: 'rgba(126, 217, 87, 0.3)', // Green for business/demand
        transform: [{ translateX: -50 }, { translateY: -50 }],
    },
    label: {
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 8,
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#7ED957',
    },
    labelText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 12,
    },
    subText: {
        color: '#CCC',
        fontSize: 10,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    footerTitle: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    footerSubtitle: {
        color: '#888',
        fontSize: 12,
    },
    statBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#7ED957',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 12,
    },
})
