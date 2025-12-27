/**
 * SkeletonLoader
 * 
 * Animated placeholder for loading states.
 * Creates a shimmer effect for premium feel.
 */

import { View, StyleSheet, Animated, Dimensions } from "react-native"
import { useEffect, useRef } from "react"
import { LinearGradient } from "expo-linear-gradient"

type SkeletonProps = {
    width?: number | string
    height?: number
    borderRadius?: number
    style?: object
}

export function Skeleton({ width = "100%", height = 20, borderRadius = 8, style }: SkeletonProps) {
    const shimmerAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
        const animation = Animated.loop(
            Animated.timing(shimmerAnim, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
            })
        )
        animation.start()
        return () => animation.stop()
    }, [])

    const translateX = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-200, 200],
    })

    return (
        <View style={[{ width: width as any, height, borderRadius, backgroundColor: "#1A1A1A", overflow: "hidden" }, style]}>
            <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]}>
                <LinearGradient
                    colors={["transparent", "rgba(255,255,255,0.08)", "transparent"]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>
        </View>
    )
}

// Pre-built skeleton patterns
export function SkeletonCard() {
    return (
        <View style={styles.card}>
            <Skeleton height={120} borderRadius={16} />
            <View style={styles.cardContent}>
                <Skeleton width="70%" height={18} style={{ marginBottom: 8 }} />
                <Skeleton width="50%" height={14} />
            </View>
        </View>
    )
}

export function SkeletonCourtCard() {
    return (
        <View style={styles.courtCard}>
            <Skeleton width={56} height={56} borderRadius={28} />
            <Skeleton width="80%" height={16} style={{ marginTop: 12 }} />
            <Skeleton width="60%" height={12} style={{ marginTop: 8 }} />
            <Skeleton width="40%" height={24} borderRadius={12} style={{ marginTop: 12 }} />
        </View>
    )
}

export function SkeletonListItem() {
    return (
        <View style={styles.listItem}>
            <Skeleton width={48} height={48} borderRadius={12} />
            <View style={styles.listContent}>
                <Skeleton width="60%" height={16} />
                <Skeleton width="40%" height={12} style={{ marginTop: 6 }} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#141414",
        borderRadius: 20,
        overflow: "hidden",
        marginRight: 12,
        width: 200,
    },
    cardContent: {
        padding: 12,
    },
    courtCard: {
        backgroundColor: "#141414",
        borderRadius: 20,
        padding: 14,
        marginRight: 12,
        width: 175,
        alignItems: "flex-start",
    },
    listItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        backgroundColor: "#141414",
        borderRadius: 12,
        marginBottom: 8,
    },
    listContent: {
        flex: 1,
        marginLeft: 12,
    },
})

export default Skeleton
