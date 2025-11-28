
import { View, Animated } from "react-native"
import { useEffect, useRef } from "react"

export function LoadingSkeleton({
  width = "100%",
  height = 20,
  className = "",
}: { width?: string | number; height?: number; className?: string }) {
  const shimmerAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start()
  }, [])

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  })

  return (
    <Animated.View
      style={{
        width,
        height,
        opacity,
      }}
      className={`bg-muted rounded-lg ${className}`}
    />
  )
}

export function TrainerCardSkeleton() {
  return (
    <View className="glass-card rounded-2xl p-4 mb-4">
      <View className="flex-row items-start mb-3">
        <LoadingSkeleton width={64} height={64} className="rounded-full mr-4" />
        <View className="flex-1">
          <LoadingSkeleton width="60%" height={20} className="mb-2" />
          <LoadingSkeleton width="40%" height={16} className="mb-2" />
          <LoadingSkeleton width="50%" height={14} />
        </View>
      </View>
      <LoadingSkeleton width="100%" height={40} className="rounded-xl" />
    </View>
  )
}
