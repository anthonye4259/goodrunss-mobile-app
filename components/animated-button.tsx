import { TouchableOpacity, Text, ActivityIndicator } from "react-native"
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated"
import * as Haptics from "expo-haptics"

interface AnimatedButtonProps {
  onPress: () => void
  title: string
  variant?: "primary" | "secondary" | "outline"
  loading?: boolean
  disabled?: boolean
  className?: string
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

export function AnimatedButton({
  onPress,
  title,
  variant = "primary",
  loading = false,
  disabled = false,
  className = "",
}: AnimatedButtonProps) {
  const scale = useSharedValue(1)
  const opacity = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15 })
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 })
  }

  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      onPress()
    }
  }

  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return "bg-primary"
      case "secondary":
        return "bg-secondary"
      case "outline":
        return "bg-transparent border-2 border-primary"
      default:
        return "bg-primary"
    }
  }

  const getTextStyles = () => {
    switch (variant) {
      case "primary":
        return "text-background"
      case "secondary":
        return "text-foreground"
      case "outline":
        return "text-primary"
      default:
        return "text-background"
    }
  }

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      className={`${getVariantStyles()} px-8 py-4 rounded-xl items-center justify-center ${
        disabled ? "opacity-50" : ""
      } ${className}`}
      style={animatedStyle}
      activeOpacity={1}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" ? "#7ED957" : "#0A0A0A"} />
      ) : (
        <Text className={`${getTextStyles()} font-bold text-lg`}>{title}</Text>
      )}
    </AnimatedTouchable>
  )
}
