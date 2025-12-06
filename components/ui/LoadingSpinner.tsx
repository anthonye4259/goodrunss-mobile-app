import { View, ActivityIndicator } from 'react-native'
import { colors } from '@/lib/design-tokens'

interface LoadingSpinnerProps {
    size?: 'small' | 'large'
    color?: string
}

export function LoadingSpinner({ size = 'large', color = colors.primary }: LoadingSpinnerProps) {
    return (
        <View className="flex-1 items-center justify-center">
            <ActivityIndicator size={size} color={color} />
        </View>
    )
}
