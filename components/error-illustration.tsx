
import { useEffect } from "react"
import { View } from "react-native"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated"
import { Ionicons } from "@expo/vector-icons"

export function ErrorIllustration() {
  const scale = useSharedValue(0)
  const rotation = useSharedValue(0)

  useEffect(() => {
    scale.value = withSpring(1, { damping: 10 })
    rotation.value = withSequence(
      withTiming(10, { duration: 100 }),
      withTiming(-10, { duration: 100 }),
      withTiming(10, { duration: 100 }),
      withTiming(0, { duration: 100 }),
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
  }))

  return (
    <View className="items-center justify-center">
      <Animated.View
        style={animatedStyle}
        className="w-32 h-32 rounded-full bg-destructive items-center justify-center"
      >
        <Ionicons name="close" size={64} color="#FFFFFF" />
      </Animated.View>
    </View>
  )
}
