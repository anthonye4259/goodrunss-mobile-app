import { View, Text, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  description: string
  actionText?: string
  onAction?: () => void
}

export function EmptyState({ icon, title, description, actionText, onAction }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      <View className="w-24 h-24 rounded-full bg-muted items-center justify-center mb-6">
        <Ionicons name={icon} size={48} color="#7ED957" />
      </View>
      <Text className="text-foreground text-2xl font-bold text-center mb-3">{title}</Text>
      <Text className="text-muted-foreground text-center text-base leading-relaxed mb-6">{description}</Text>
      {actionText && onAction && (
        <TouchableOpacity onPress={onAction} className="bg-primary px-8 py-4 rounded-xl" activeOpacity={0.8}>
          <Text className="text-background font-bold text-lg">{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}
