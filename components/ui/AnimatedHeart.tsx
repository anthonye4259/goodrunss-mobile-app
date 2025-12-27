/**
 * Animated Heart / Favorite Button
 * 
 * Instagram-style heart animation with scale and color transition.
 */

import { TouchableOpacity, StyleSheet, Animated, View } from "react-native"
import { useRef, useState } from "react"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"

type Props = {
    isFavorite: boolean
    onToggle: (newState: boolean) => void
    size?: number
    color?: string
}

export function AnimatedHeart({ isFavorite, onToggle, size = 28, color = "#EF4444" }: Props) {
    const scaleAnim = useRef(new Animated.Value(1)).current
    const [localFavorite, setLocalFavorite] = useState(isFavorite)

    const handlePress = () => {
        const newState = !localFavorite
        setLocalFavorite(newState)
        onToggle(newState)

        if (newState) {
            // Pop animation when favoriting
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

            Animated.sequence([
                Animated.spring(scaleAnim, {
                    toValue: 1.4,
                    useNativeDriver: true,
                    tension: 300,
                    friction: 5,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 200,
                    friction: 8,
                }),
            ]).start()
        } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        }
    }

    return (
        <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Ionicons
                    name={localFavorite ? "heart" : "heart-outline"}
                    size={size}
                    color={localFavorite ? color : "#888"}
                />
            </Animated.View>
        </TouchableOpacity>
    )
}

export default AnimatedHeart
