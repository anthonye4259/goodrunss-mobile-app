
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withDelay,
    withSequence,
    withTiming,
    runOnJS
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useUserPreferences } from '@/lib/user-preferences';

const { width, height } = Dimensions.get('window');

// A "Surreal" Welcome for Myrtle Beach (and Phase 1) Users
export default function SurrealWelcome() {
    const { preferences } = useUserPreferences();
    const [visible, setVisible] = useState(false);
    const [hasSeen, setHasSeen] = useState(false);

    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);
    const glow = useSharedValue(0);

    useEffect(() => {
        // Trigger only if Phase 1 City (e.g., Myrtle Beach) AND haven't seen it in session
        // In a real app, persist 'hasSeenSurrealWelcome' to AsyncStorage
        if (preferences.isPhase1City && !hasSeen) {
            // Small delay to let home screen load
            const timeout = setTimeout(() => {
                setVisible(true);
                startAnimation();
            }, 1000);
            return () => clearTimeout(timeout);
        }
    }, [preferences.isPhase1City, hasSeen]);

    const startAnimation = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        scale.value = withSpring(1, { damping: 12 });
        opacity.value = withTiming(1, { duration: 500 });

        // Continuous subtle glow pulse
        glow.value = withSequence(
            withTiming(1, { duration: 1000 }),
            withTiming(0.5, { duration: 1000 })
        );
    };

    const handleClose = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        scale.value = withTiming(0, { duration: 300 }, () => {
            runOnJS(setVisible)(false);
            runOnJS(setHasSeen)(true);
        });
        opacity.value = withTiming(0, { duration: 300 });
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    if (!visible) return null;

    const cityName = preferences.city || "Myrtle Beach";

    return (
        <View style={styles.overlay} pointerEvents="box-none">
            {/* Dark blur background */}
            <Animated.View style={[styles.backdrop, { opacity: opacity }]}>
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
            </Animated.View>

            <Animated.View style={[styles.card, animatedStyle]}>
                <LinearGradient
                    colors={['#1a1a1a', '#000000']}
                    style={styles.cardGradient}
                >
                    {/* Golden Rim */}
                    <View style={styles.goldBorder} />

                    <View style={styles.content}>
                        <View style={styles.iconContainer}>
                            <LinearGradient
                                colors={['#FFD700', '#FFA500']}
                                style={styles.iconCircle}
                            >
                                <Ionicons name="sparkles" size={32} color="#000" />
                            </LinearGradient>
                        </View>

                        <Text style={styles.title}>Welcome to the Future</Text>
                        <Text style={styles.cityText}>{cityName} Edition</Text>

                        <Text style={styles.description}>
                            You have exclusive access to the pilot program.
                            Enjoy priority bookings, local events, and a surreal content experience.
                        </Text>

                        <TouchableOpacity onPress={handleClose} style={styles.button}>
                            <LinearGradient
                                colors={['#FFD700', '#DAA520']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.buttonGradient}
                            >
                                <Text style={styles.buttonText}>Enter Experience</Text>
                                <Ionicons name="arrow-forward" size={20} color="#000" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999, // On top of everything
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    card: {
        width: width * 0.85,
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    cardGradient: {
        padding: 24,
        alignItems: 'center',
    },
    goldBorder: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: '#FFD700',
    },
    content: {
        alignItems: 'center',
    },
    iconContainer: {
        marginTop: 16,
        marginBottom: 20,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFF',
        marginBottom: 4,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    cityText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFD700', // Gold
        marginBottom: 16,
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    description: {
        fontSize: 15,
        color: '#AAA',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    button: {
        width: '100%',
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    buttonGradient: {
        paddingVertical: 16,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    buttonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
        textTransform: 'uppercase',
    },
});
