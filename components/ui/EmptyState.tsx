import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Button } from './Button'
import { colors } from '@/lib/design-tokens'

interface EmptyStateProps {
    title: string
    message: string
    icon?: keyof typeof Ionicons.glyphMap
    actionLabel?: string
    onAction?: () => void
}

export function EmptyState({
    title,
    message,
    icon = 'file-tray-outline',
    actionLabel,
    onAction
}: EmptyStateProps) {
    return (
        <View className="flex-1 items-center justify-center px-6">
            <Ionicons name={icon} size={64} color={colors.textSecondary} />
            <Text className="text-foreground text-xl font-bold mt-4 text-center">
                {title}
            </Text>
            <Text className="text-muted-foreground text-center mt-2 mb-6">
                {message}
            </Text>
            {actionLabel && onAction && (
                <Button onPress={onAction} variant="primary">
                    {actionLabel}
                </Button>
            )}
        </View>
    )
}
