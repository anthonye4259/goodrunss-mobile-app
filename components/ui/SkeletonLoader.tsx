import { View, Animated, Easing } from 'react-native'
import { useEffect, useRef } from 'react'
import { colors } from '@/lib/design-tokens'

interface SkeletonProps {
    width?: number | string
    height?: number
    borderRadius?: number
    className?: string
}

export function Skeleton({ width = '100%', height = 20, borderRadius = 8, className = '' }: SkeletonProps) {
    const opacity = useRef(new Animated.Value(0.3)).current

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 800,
                    easing: Easing.ease,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    easing: Easing.ease,
                    useNativeDriver: true,
                }),
            ])
        ).start()
    }, [])

    return (
        <Animated.View
            style={{
                width,
                height,
                borderRadius,
                backgroundColor: colors.bgSecondary,
                opacity,
            }}
            className={className}
        />
    )
}

export function VenueCardSkeleton() {
    return (
        <View className="bg-card rounded-2xl p-4 mb-4">
            <Skeleton height={150} className="mb-3" />
            <Skeleton width="70%" height={24} className="mb-2" />
            <Skeleton width="50%" height={16} className="mb-2" />
            <Skeleton width="40%" height={16} />
        </View>
    )
}

export function TrainerCardSkeleton() {
    return (
        <View className="bg-card rounded-2xl p-4 mb-4">
            <View className="flex-row items-center mb-3">
                <Skeleton width={64} height={64} borderRadius={32} className="mr-4" />
                <View className="flex-1">
                    <Skeleton width="60%" height={20} className="mb-2" />
                    <Skeleton width="40%" height={16} />
                </View>
            </View>
            <Skeleton width="100%" height={60} />
        </View>
    )
}

export function ListItemSkeleton() {
    return (
        <View className="flex-row items-center py-3 border-b border-border">
            <Skeleton width={48} height={48} borderRadius={24} className="mr-3" />
            <View className="flex-1">
                <Skeleton width="70%" height={16} className="mb-2" />
                <Skeleton width="50%" height={14} />
            </View>
        </View>
    )
}
