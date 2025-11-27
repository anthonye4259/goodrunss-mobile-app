"use client"

import { useEffect } from "react"
import { View } from "react-native"
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withDelay } from "react-native-reanimated"
import { Ionicons } from "@expo/vector-icons"

export function SuccessIllustration() {
  const scale = useSharedValue(0)
  const checkScale = useSharedValue(0)

  useEffect(() => {
    scale.value = withSpring(1, { damping: 10 })
    checkScale.value = withDelay(200, withSpring(1, { damping: 12 }))
  }, [])

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }))

  return (
    <View className="items-center justify-center">
      <Animated.View style={circleStyle} className="w-32 h-32 rounded-full bg-primary items-center justify-center">
        <Animated.View style={checkStyle}>
          <Ionicons name="checkmark" size={64} color="#0A0A0A" />
        </Animated.View>
      </Animated.View>
    </View>
  )
}
