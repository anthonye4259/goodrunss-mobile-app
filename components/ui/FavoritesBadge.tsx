/**
 * Favorites Count Badge
 * 
 * Shows count of saved favorites on profile.
 */

import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"

type Props = {
    count: number
    onPress?: () => void
}

export function FavoritesBadge({ count, onPress }: Props) {
    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        if (onPress) {
            onPress()
        } else {
            router.push("/favorites")
        }
    }

    return (
        <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.8}>
            <View style={styles.iconContainer}>
                <Ionicons name="heart" size={20} color="#EF4444" />
                {count > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{count > 99 ? "99+" : count}</Text>
                    </View>
                )}
            </View>
            <Text style={styles.label}>Favorites</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        gap: 4,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#EF444420",
        alignItems: "center",
        justifyContent: "center",
    },
    badge: {
        position: "absolute",
        top: -4,
        right: -4,
        backgroundColor: "#EF4444",
        borderRadius: 12,
        minWidth: 20,
        height: 20,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 6,
        borderWidth: 2,
        borderColor: "#0A0A0A",
    },
    badgeText: {
        color: "#FFF",
        fontSize: 10,
        fontWeight: "700",
    },
    label: {
        color: "#888",
        fontSize: 11,
    },
})

export default FavoritesBadge
