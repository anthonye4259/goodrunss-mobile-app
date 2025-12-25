import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface AIOrbProps {
    size?: number;
    isThinking?: boolean;
}

export const AIOrb: React.FC<AIOrbProps> = ({ size = 60, isThinking = false }) => {
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Rotation animation for inner ring
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 3000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            {/* Outer Glow */}
            <Animated.View
                style={[
                    styles.glow,
                    {
                        transform: [{ scale: pulseAnim }],
                        width: size * 1.5,
                        height: size * 1.5,
                        borderRadius: size * 0.75,
                    },
                ]}
            >
                <LinearGradient
                    colors={['rgba(139, 92, 246, 0.4)', 'transparent']}
                    style={styles.gradient}
                />
            </Animated.View>

            {/* Main Orb */}
            <View style={[styles.orb, { width: size, height: size, borderRadius: size / 2 }]}>
                <LinearGradient
                    colors={['#8B5CF6', '#6D28D9']}
                    style={styles.orbGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    {/* Inner Ring */}
                    {isThinking && (
                        <Animated.View
                            style={[
                                styles.innerRing,
                                {
                                    transform: [{ rotate: spin }],
                                    width: size * 0.7,
                                    height: size * 0.7,
                                    borderRadius: size * 0.35,
                                },
                            ]}
                        >
                            <LinearGradient
                                colors={['rgba(255,255,255,0.8)', 'transparent', 'rgba(255,255,255,0.8)']}
                                style={styles.ringGradient}
                            />
                        </Animated.View>
                    )}

                    <Ionicons name="sparkles" size={size * 0.4} color="#FFFFFF" style={styles.icon} />
                </LinearGradient>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    glow: {
        position: 'absolute',
        zIndex: 0,
    },
    gradient: {
        flex: 1,
        borderRadius: 100,
    },
    orb: {
        zIndex: 1,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 15,
        elevation: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    orbGradient: {
        flex: 1,
        width: '100%',
        height: '100%',
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    innerRing: {
        position: 'absolute',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    ringGradient: {
        flex: 1,
        borderRadius: 100,
    },
    icon: {
        zIndex: 2,
    },
});
