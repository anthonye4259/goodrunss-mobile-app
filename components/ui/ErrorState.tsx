import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Button } from './Button'
import { colors } from '@/lib/design-tokens'

interface ErrorStateProps {
    title?: string
    message?: string
    onRetry?: () => void
    icon?: keyof typeof Ionicons.glyphMap
}

export function ErrorState({
    title = 'Something went wrong',
    message = "We couldn't load this content. Please try again.",
    onRetry,
    icon = 'alert-circle-outline'
}: ErrorStateProps) {
    return (
        <View className="flex-1 items-center justify-center px-6">
            <Ionicons name={icon} size={64} color={colors.textSecondary} />
            <Text className="text-foreground text-xl font-bold mt-4 text-center">
                {title}
            </Text>
            <Text className="text-muted-foreground text-center mt-2 mb-6">
                {message}
            </Text>
            {onRetry && (
                <Button onPress={onRetry} variant="primary">
                    Try Again
                </Button>
            )}
        </View>
    )
}
