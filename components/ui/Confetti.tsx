/**
 * Confetti Animation
 * 
 * Celebration animation for first booking and achievements.
 * Uses animated particles with physics.
 */

import { View, StyleSheet, Animated, Dimensions } from "react-native"
import { useEffect, useRef, useState } from "react"

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")
const CONFETTI_COUNT = 50
const COLORS = ["#7ED957", "#22C55E", "#3B82F6", "#8B5CF6", "#EC4899", "#F97316", "#FFD700"]

type ConfettiPiece = {
    x: Animated.Value
    y: Animated.Value
    rotation: Animated.Value
    color: string
    size: number
}

export function useConfetti() {
    const [isActive, setIsActive] = useState(false)

    const trigger = () => {
        setIsActive(true)
        setTimeout(() => setIsActive(false), 3000)
    }

    return { isActive, trigger }
}

export function ConfettiOverlay({ isActive }: { isActive: boolean }) {
    const [pieces, setPieces] = useState<ConfettiPiece[]>([])

    useEffect(() => {
        if (isActive) {
            // Generate confetti pieces
            const newPieces: ConfettiPiece[] = Array.from({ length: CONFETTI_COUNT }, () => ({
                x: new Animated.Value(Math.random() * SCREEN_WIDTH),
                y: new Animated.Value(-50),
                rotation: new Animated.Value(0),
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                size: 8 + Math.random() * 8,
            }))

            setPieces(newPieces)

            // Animate each piece
            newPieces.forEach((piece, index) => {
                const delay = index * 30

                Animated.parallel([
                    Animated.timing(piece.y, {
                        toValue: SCREEN_HEIGHT + 100,
                        duration: 2000 + Math.random() * 1000,
                        delay,
                        useNativeDriver: true,
                    }),
                    Animated.timing(piece.x, {
                        toValue: piece.x._value + (Math.random() - 0.5) * 200,
                        duration: 2000 + Math.random() * 1000,
                        delay,
                        useNativeDriver: true,
                    }),
                    Animated.timing(piece.rotation, {
                        toValue: Math.random() * 10,
                        duration: 2000,
                        delay,
                        useNativeDriver: true,
                    }),
                ]).start()
            })
        }
    }, [isActive])

    if (!isActive) return null

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {pieces.map((piece, index) => (
                <Animated.View
                    key={index}
                    style={[
                        styles.confetti,
                        {
                            backgroundColor: piece.color,
                            width: piece.size,
                            height: piece.size * 1.5,
                            transform: [
                                { translateX: piece.x },
                                { translateY: piece.y },
                                {
                                    rotate: piece.rotation.interpolate({
                                        inputRange: [0, 10],
                                        outputRange: ["0deg", "360deg"],
                                    })
                                },
                            ],
                        },
                    ]}
                />
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    confetti: {
        position: "absolute",
        borderRadius: 2,
    },
})

export default ConfettiOverlay
