/**
 * Shared Loading Components
 * Standardized loading states across the app
 */

import React from 'react'
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

interface LoadingStateProps {
    message?: string
    size?: 'small' | 'large'
}

/**
 * Full-screen loading state
 * Use for initial page loads
 */
export function LoadingScreen({ message = "Loading..." }: LoadingStateProps) {
    return (
        <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.fullScreen}>
            <ActivityIndicator size="large" color="#7ED957" />
            <Text style={styles.message}>{message}</Text>
        </LinearGradient>
    )
}

/**
 * Inline loading spinner
 * Use within content areas
 */
export function LoadingSpinner({ size = 'small', message }: LoadingStateProps) {
    return (
        <View style={styles.inline}>
            <ActivityIndicator size={size} color="#7ED957" />
            {message && <Text style={styles.inlineMessage}>{message}</Text>}
        </View>
    )
}

/**
 * Loading overlay
 * Use for async actions on existing content
 */
export function LoadingOverlay({ message = "Please wait..." }: LoadingStateProps) {
    return (
        <View style={styles.overlay}>
            <View style={styles.overlayContent}>
                <ActivityIndicator size="large" color="#7ED957" />
                <Text style={styles.overlayMessage}>{message}</Text>
            </View>
        </View>
    )
}

/**
 * Skeleton placeholder for content loading
 */
export function SkeletonBox({ width = '100%', height = 20, rounded = false }) {
    return (
        <View
            style={[
                styles.skeleton,
                { width, height, borderRadius: rounded ? height / 2 : 8 }
            ]}
        />
    )
}

/**
 * Card skeleton for list loading
 */
export function SkeletonCard() {
    return (
        <View style={styles.skeletonCard}>
            <SkeletonBox width={48} height={48} rounded />
            <View style={styles.skeletonContent}>
                <SkeletonBox width="70%" height={16} />
                <SkeletonBox width="50%" height={12} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    fullScreen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    message: {
        color: '#888',
        fontSize: 16,
        marginTop: 16,
    },
    inline: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    inlineMessage: {
        color: '#888',
        fontSize: 14,
        marginTop: 8,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    overlayContent: {
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        minWidth: 150,
    },
    overlayMessage: {
        color: '#FFF',
        fontSize: 14,
        marginTop: 12,
    },
    skeleton: {
        backgroundColor: '#1A1A1A',
        marginBottom: 8,
    },
    skeletonCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    skeletonContent: {
        flex: 1,
        marginLeft: 12,
        gap: 8,
    },
})
