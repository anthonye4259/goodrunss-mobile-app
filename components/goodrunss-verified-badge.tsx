import { View, Text } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { type GoodRunssVerifiedRating, getVerifiedRatingColor } from "@/lib/venue-quality-types"

type Props = {
  rating: GoodRunssVerifiedRating
  size?: "small" | "medium" | "large"
  showScore?: boolean
}

export function GoodRunssVerifiedBadge({ rating, size = "medium", showScore = true }: Props) {
  const color = getVerifiedRatingColor(rating.tier)

  const sizeClasses = {
    small: "px-2 py-1",
    medium: "px-3 py-2",
    large: "px-4 py-3",
  }

  const textSizeClasses = {
    small: "text-xs",
    medium: "text-sm",
    large: "text-base",
  }

  const iconSizes = {
    small: 12,
    medium: 16,
    large: 20,
  }

  return (
    <View
      className={`flex-row items-center bg-card border-2 rounded-xl ${sizeClasses[size]}`}
      style={{ borderColor: color }}
    >
      <Ionicons name="shield-checkmark" size={iconSizes[size]} color={color} />
      <View className="ml-2">
        <Text className={`font-bold ${textSizeClasses[size]}`} style={{ color }}>
          GoodRunss Verified
        </Text>
        {showScore && (
          <Text className="text-muted-foreground text-xs">
            {rating.tier} • {rating.overallScore}/100
          </Text>
        )}
      </View>
    </View>
  )
}
