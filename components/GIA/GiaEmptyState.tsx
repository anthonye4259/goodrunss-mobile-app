import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AIOrb } from './AIOrb';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface GiaEmptyStateProps {
    title?: string;
    message?: string;
    actionLabel?: string;
    onAction?: () => void;
    variant?: 'centered' | 'inline';
}

export const GiaEmptyState: React.FC<GiaEmptyStateProps> = ({
    title = "I couldn't find any matches",
    message = "Try different filters. I can also help you find courts in a different area.",
    actionLabel = "Ask GIA",
    onAction,
    variant = 'centered'
}) => {
    const handlePress = () => {
        if (onAction) {
            onAction();
        } else {
            router.push('/(tabs)/gia');
        }
    };

    if (variant === 'inline') {
        return (
            <TouchableOpacity style={styles.inlineContainer} onPress={handlePress}>
                <View style={styles.inlineOrb}>
                    <AIOrb size={36} isThinking={true} />
                </View>
                <View style={styles.inlineContent}>
                    <Text style={styles.inlineTitle}>{title}</Text>
                    <Text style={styles.inlineMessage}>{message}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#666" />
            </TouchableOpacity>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.orbWrapper}>
                <AIOrb size={80} isThinking={true} />
            </View>

            <View style={styles.bubble}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.message}>{message}</Text>

                <TouchableOpacity style={styles.actionButton} onPress={handlePress}>
                    <Text style={styles.actionText}>{actionLabel}</Text>
                    <Ionicons name="arrow-forward" size={16} color="#000" />
                </TouchableOpacity>

                <View style={styles.bubbleTail} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    // Centered Styles
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        marginTop: 20,
    },
    orbWrapper: {
        marginBottom: 24,
    },
    bubble: {
        backgroundColor: '#1A1A1A',
        padding: 24,
        borderRadius: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
        maxWidth: 300,
        position: 'relative',
    },
    title: {
        fontSize: 18,
        fontFamily: 'Outfit_600SemiBold',
        color: '#FFF',
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 14,
        fontFamily: 'Outfit_400Regular',
        color: '#A3A3A3',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 22,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#6B9B5A',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 16,
    },
    actionText: {
        fontSize: 14,
        fontFamily: 'Outfit_600SemiBold',
        color: '#000',
    },
    bubbleTail: {
        position: 'absolute',
        top: -10,
        left: '50%',
        marginLeft: -10,
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 10,
        borderRightWidth: 10,
        borderBottomWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: '#333',
    },

    // Inline Styles
    inlineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1A1A',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#1F1F1F',
        maxWidth: 300,
        marginRight: 16,
    },
    inlineOrb: {
        marginRight: 12,
    },
    inlineContent: {
        flex: 1,
        marginRight: 8,
    },
    inlineTitle: {
        fontSize: 14,
        fontFamily: 'Outfit_600SemiBold',
        color: '#FFF',
        marginBottom: 2,
    },
    inlineMessage: {
        fontSize: 12,
        fontFamily: 'Outfit_400Regular',
        color: '#8A8A8A',
        lineHeight: 16,
    }
});
