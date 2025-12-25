import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface MessageBubbleProps {
    content: string;
    role: 'user' | 'assistant';
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ content, role }) => {
    const isUser = role === 'user';

    if (isUser) {
        return (
            <LinearGradient
                colors={['#7ED957', '#5DBF34']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.bubble, styles.userBubble]}
            >
                <Text style={[styles.text, styles.userText]}>{content}</Text>
            </LinearGradient>
        );
    }

    return (
        <View style={[styles.bubble, styles.aiBubble]}>
            {/* Subtle border effect */}
            <LinearGradient
                colors={['rgba(139, 92, 246, 0.3)', 'rgba(139, 92, 246, 0.1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
            />

            <Text style={[styles.text, styles.aiText]}>{content}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    bubble: {
        padding: 16,
        borderRadius: 20,
        maxWidth: '85%',
        overflow: 'hidden',
    },
    userBubble: {
        borderBottomRightRadius: 4,
        alignSelf: 'flex-end',
        shadowColor: '#7ED957',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    aiBubble: {
        borderBottomLeftRadius: 4,
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(26, 26, 26, 0.8)',
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.2)',
    },
    text: {
        fontSize: 16,
        lineHeight: 24,
        fontFamily: 'Inter_400Regular',
    },
    userText: {
        color: '#000000',
        fontFamily: 'Inter_500Medium',
    },
    aiText: {
        color: '#FFFFFF',
    },
});
