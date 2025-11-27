"use client"

import { View } from "react-native"
import { useEffect } from "react"
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from "react-native-reanimated"

interface SkeletonLoaderProps {
  width?: number | string
  height?: number
  borderRadius?: number
  className?: string
}

export function SkeletonLoader({ width = "100%", height = 20, borderRadius = 8, className = "" }: SkeletonLoaderProps) {
  const opacity = useSharedValue(0.3)

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true)
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: "#2A2A2A",
        },
        animatedStyle,
      ]}
      className={className}
    />
  )
}

export function TrainerCardSkeleton() {
  return (
    <View className="bg-card border border-border rounded-2xl p-4 mb-4">
      <View className="flex-row items-start mb-3">
        <SkeletonLoader width={64} height={64} borderRadius={32} className="mr-4" />
        <View className="flex-1">
          <SkeletonLoader width="60%" height={20} className="mb-2" />
          <SkeletonLoader width="40%" height={16} className="mb-2" />
          <SkeletonLoader width="50%" height={14} />
        </View>
        <View className="items-end">
          <SkeletonLoader width={60} height={24} className="mb-1" />
          <SkeletonLoader width={50} height={12} />
        </View>
      </View>
      <SkeletonLoader width="100%" height={40} className="mb-3" />
      <View className="flex-row gap-2 mb-3">
        <SkeletonLoader width={80} height={28} borderRadius={8} />
        <SkeletonLoader width={100} height={28} borderRadius={8} />
        <SkeletonLoader width={90} height={28} borderRadius={8} />
      </View>
      <SkeletonLoader width="100%" height={48} borderRadius={12} />
    </View>
  )
}

export function VenueCardSkeleton() {
  return (
    <View className="bg-card border border-border rounded-2xl p-4 mb-4">
      <View className="flex-row items-start mb-3">
        <SkeletonLoader width={64} height={64} borderRadius={12} className="mr-4" />
        <View className="flex-1">
          <SkeletonLoader width="70%" height={20} className="mb-2" />
          <SkeletonLoader width="50%" height={16} className="mb-2" />
          <SkeletonLoader width="60%" height={14} />
        </View>
      </View>
      <SkeletonLoader width="100%" height={80} borderRadius={12} className="mb-3" />
      <View className="flex-row gap-2">
        <SkeletonLoader width="70%" height={48} borderRadius={12} />
        <SkeletonLoader width="25%" height={48} borderRadius={12} />
      </View>
    </View>
  )
}
