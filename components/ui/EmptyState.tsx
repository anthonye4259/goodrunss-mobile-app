import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Button } from './button'
import { colors } from '@/lib/design-tokens'

interface EmptyStateProps {
    title: string
    message: string
    icon?: keyof typeof Ionicons.glyphMap
    actionLabel?: string
    onAction?: () => void
    secondaryLabel?: string
    onSecondaryAction?: () => void
    variant?: 'default' | 'courts' | 'trainers' | 'bookings'
}

// Pre-built empty states for common scenarios
export const EMPTY_STATE_PRESETS = {
    noCourts: {
        title: "No Courts Nearby",
        message: "We couldn't find any courts in your area. Check back later or help us by adding one!",
        icon: "basketball-outline" as const,
        actionLabel: "Expand Search",
        secondaryLabel: "Add a Venue",
    },
    noTrainers: {
        title: "No Trainers Available",
        message: "There aren't any trainers in your area yet. Invite your favorite coach!",
        icon: "fitness-outline" as const,
        actionLabel: "Expand Search",
        secondaryLabel: "Invite a Trainer",
    },
    noBookings: {
        title: "No Upcoming Bookings",
        message: "You don't have any sessions scheduled. Find a trainer or court to get started!",
        icon: "calendar-outline" as const,
        actionLabel: "Find Trainers",
        secondaryLabel: "Find Courts",
    },
    noActivity: {
        title: "No Activity Yet",
        message: "Courts are quiet right now. Check back later or be the first to check in!",
        icon: "pulse-outline" as const,
        actionLabel: "Refresh",
        secondaryLabel: "Check In",
    },
}

export function EmptyState({
    title,
    message,
    icon = 'file-tray-outline',
    actionLabel,
    onAction,
    secondaryLabel,
    onSecondaryAction,
    variant = 'default'
}: EmptyStateProps) {
    const iconColor = variant === 'courts' ? '#7ED957'
        : variant === 'trainers' ? '#3B82F6'
            : variant === 'bookings' ? '#F59E0B'
                : colors.textSecondary

    return (
        <View style={styles.container}>
            <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
                <Ionicons name={icon} size={48} color={iconColor} />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>

            <View style={styles.actionsContainer}>
                {actionLabel && onAction && (
                    <TouchableOpacity style={styles.primaryButton} onPress={onAction}>
                        <Text style={styles.primaryButtonText}>{actionLabel}</Text>
                    </TouchableOpacity>
                )}
                {secondaryLabel && onSecondaryAction && (
                    <TouchableOpacity style={styles.secondaryButton} onPress={onSecondaryAction}>
                        <Text style={styles.secondaryButtonText}>{secondaryLabel}</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Helpful tip */}
            <View style={styles.tipContainer}>
                <Ionicons name="bulb-outline" size={16} color="#9CA3AF" />
                <Text style={styles.tipText}>
                    {variant === 'courts'
                        ? "Tip: Zoom out on the map to see more courts"
                        : variant === 'trainers'
                            ? "Tip: Great trainers are being added every day"
                            : "Tip: Check back during peak hours for more activity"
                    }
                </Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 32,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 8,
    },
    message: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    actionsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    primaryButton: {
        backgroundColor: '#7ED957',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 10,
    },
    primaryButtonText: {
        color: '#000',
        fontWeight: '600',
        fontSize: 14,
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#333',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 10,
    },
    secondaryButtonText: {
        color: '#9CA3AF',
        fontWeight: '600',
        fontSize: 14,
    },
    tipContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(156, 163, 175, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
    },
    tipText: {
        fontSize: 12,
        color: '#9CA3AF',
    },
})

