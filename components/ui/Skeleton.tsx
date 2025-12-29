/**
 * Skeleton Loading Components
 * Premium shimmer effect for loading states
 */

import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

const { width } = Dimensions.get('window')

// Shimmer animation wrapper
export function Shimmer({ children, style }: { children: React.ReactNode; style?: any }) {
    const animatedValue = useRef(new Animated.Value(0)).current

    useEffect(() => {
        Animated.loop(
            Animated.timing(animatedValue, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
            })
        ).start()
    }, [])

    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-width, width],
    })

    return (
        <View style={[styles.shimmerContainer, style]}>
            {children}
            <Animated.View
                style={[
                    styles.shimmerOverlay,
                    { transform: [{ translateX }] },
                ]}
            >
                <LinearGradient
                    colors={['transparent', 'rgba(255,255,255,0.08)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>
        </View>
    )
}

// Skeleton box
export function SkeletonBox({
    width: w = '100%',
    height: h = 20,
    borderRadius = 8,
    style
}: {
    width?: number | string
    height?: number | string
    borderRadius?: number
    style?: any
}) {
    return (
        <Shimmer style={[{ width: w, height: h, borderRadius }, style]}>
            <View style={[styles.skeletonBox, { width: w, height: h, borderRadius }]} />
        </Shimmer>
    )
}

// Skeleton circle (for avatars)
export function SkeletonCircle({ size = 48, style }: { size?: number; style?: any }) {
    return (
        <Shimmer style={[{ width: size, height: size, borderRadius: size / 2 }, style]}>
            <View style={[styles.skeletonBox, { width: size, height: size, borderRadius: size / 2 }]} />
        </Shimmer>
    )
}

// Venue Card Skeleton
export function VenueCardSkeleton() {
    return (
        <View style={styles.venueCard}>
            <SkeletonBox width="100%" height={140} borderRadius={16} />
            <View style={styles.venueCardContent}>
                <SkeletonBox width="70%" height={18} style={{ marginBottom: 8 }} />
                <SkeletonBox width="50%" height={14} style={{ marginBottom: 8 }} />
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <SkeletonBox width={60} height={24} borderRadius={12} />
                    <SkeletonBox width={80} height={24} borderRadius={12} />
                </View>
            </View>
        </View>
    )
}

// Mini Court Card Skeleton
export function MiniCourtCardSkeleton() {
    return (
        <View style={styles.miniCourtCard}>
            <SkeletonBox width={100} height={80} borderRadius={12} />
            <View style={{ marginTop: 8, gap: 4 }}>
                <SkeletonBox width={90} height={14} />
                <SkeletonBox width={60} height={12} />
            </View>
        </View>
    )
}

// Trainer Card Skeleton
export function TrainerCardSkeleton() {
    return (
        <View style={styles.trainerCard}>
            <SkeletonCircle size={56} />
            <View style={{ flex: 1, marginLeft: 12, gap: 6 }}>
                <SkeletonBox width="60%" height={16} />
                <SkeletonBox width="40%" height={12} />
                <SkeletonBox width="80%" height={12} />
            </View>
            <SkeletonBox width={70} height={32} borderRadius={16} />
        </View>
    )
}

// Section Skeleton (horizontal scroll)
export function SectionSkeleton({ count = 3 }: { count?: number }) {
    return (
        <View style={styles.section}>
            <SkeletonBox width={120} height={20} style={{ marginBottom: 12, marginLeft: 16 }} />
            <View style={styles.horizontalScroll}>
                {Array.from({ length: count }).map((_, i) => (
                    <MiniCourtCardSkeleton key={i} />
                ))}
            </View>
        </View>
    )
}

// List Skeleton
export function ListSkeleton({ count = 3, type = 'venue' }: { count?: number; type?: 'venue' | 'trainer' }) {
    return (
        <View style={{ gap: 12, padding: 16 }}>
            {Array.from({ length: count }).map((_, i) => (
                type === 'trainer' ? <TrainerCardSkeleton key={i} /> : <VenueCardSkeleton key={i} />
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    shimmerContainer: {
        overflow: 'hidden',
        backgroundColor: '#1A1A1A',
    },
    shimmerOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    skeletonBox: {
        backgroundColor: '#1A1A1A',
    },
    venueCard: {
        backgroundColor: '#141414',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 12,
    },
    venueCardContent: {
        padding: 12,
    },
    miniCourtCard: {
        width: 110,
        marginRight: 12,
    },
    trainerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#141414',
        borderRadius: 16,
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    horizontalScroll: {
        flexDirection: 'row',
        paddingLeft: 16,
    },
})
