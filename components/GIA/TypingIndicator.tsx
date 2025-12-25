import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface TypingIndicatorProps {
    color?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ color = '#8B5CF6' }) => {
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    const animate = () => {
        const animation = (dot: Animated.Value, delay: number) => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(dot, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                        delay,
                    }),
                    Animated.timing(dot, {
                        toValue: 0,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        };

        animation(dot1, 0);
        animation(dot2, 200);
        animation(dot3, 400);
    };

    useEffect(() => {
        animate();
    }, []);

    const dotStyle = (anim: Animated.Value) => ({
        opacity: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 1],
        }),
        transform: [
            {
                translateY: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -5],
                }),
            },
        ],
    });

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.dot, { backgroundColor: color }, dotStyle(dot1)]} />
            <Animated.View style={[styles.dot, { backgroundColor: color }, dotStyle(dot2)]} />
            <Animated.View style={[styles.dot, { backgroundColor: color }, dotStyle(dot3)]} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        height: 12,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
});
