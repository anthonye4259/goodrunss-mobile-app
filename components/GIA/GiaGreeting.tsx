import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { AIOrb } from './AIOrb';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

interface GiaGreetingProps {
    userName: string;
    onPress?: () => void;
}

export const GiaGreeting: React.FC<GiaGreetingProps> = ({ userName, onPress }) => {
    const [greeting, setGreeting] = useState("");
    const [icon, setIcon] = useState<keyof typeof Ionicons.glyphMap>("sunny-outline");
    const [iconColor, setIconColor] = useState("#FBBF24");
    const fadeAnim = new Animated.Value(0);

    useEffect(() => {
        const hour = new Date().getHours();

        let text = `Hi ${userName}! Ready to play?`;
        let iconName: keyof typeof Ionicons.glyphMap = "fitness-outline";
        let color = "#7ED957";

        if (hour < 12) {
            text = `Good morning, ${userName}!`;
            iconName = "sunny-outline";
            color = "#FBBF24"; // Gold
        } else if (hour < 17) {
            text = `Good afternoon, ${userName}!`;
            iconName = "tennisball-outline";
            color = "#A3E635"; // Lime
        } else {
            text = `Good evening, ${userName}!`;
            iconName = "moon-outline";
            color = "#60A5FA"; // Blue
        }

        const rand = Math.random();
        if (rand > 0.7) {
            text = `${userName}, conditions are perfect!`;
            iconName = "flame-outline";
            color = "#F87171"; // Red
        }

        setGreeting(text);
        setIcon(iconName);
        setIconColor(color);

        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, [userName]);

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (onPress) {
            onPress();
        } else {
            router.push('/(tabs)/gia');
        }
    };

    return (
        <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.9}>
            <View style={styles.orbContainer}>
                <AIOrb size={46} isThinking={false} />
            </View>

            <Animated.View style={[styles.bubbleContainer, { opacity: fadeAnim }]}>
                <View style={styles.bubble}>
                    <Ionicons name={icon} size={16} color={iconColor} style={{ marginRight: 6 }} />
                    <Text style={styles.greetingText} numberOfLines={2}>
                        {greeting}
                    </Text>
                </View>
                {/* Bubble tail */}
                <View style={styles.bubbleTail} />
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    orbContainer: {
        marginRight: 10,
        // Ensure Orb isn't clipped
        zIndex: 10,
    },
    bubbleContainer: {
        flex: 1,
        position: 'relative',
        marginLeft: 6,
    },
    bubble: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1A1A',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#333',
        borderBottomLeftRadius: 4, // Speech bubble look
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    greetingText: {
        color: '#F0F0F0',
        fontFamily: 'Outfit_500Medium', // Using new font
        fontSize: 14,
        lineHeight: 20,
    },
    bubbleTail: {
        position: 'absolute',
        left: -6,
        bottom: 12,
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderTopWidth: 6,
        borderRightWidth: 8,
        borderBottomWidth: 6,
        borderLeftWidth: 0,
        borderTopColor: 'transparent',
        borderRightColor: '#333', // Match border color roughly
        borderBottomColor: 'transparent',
        transform: [{ rotate: '10deg' }],
        display: 'none', // CSS triangles are tricky in RN, using Radius instead is cleaner usually. 
        // Keeping hidden for now, reliance on borderBottomLeftRadius is safer style.
    }
});
