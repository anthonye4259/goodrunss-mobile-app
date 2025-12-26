import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Animated, Easing } from 'react-native';
import Svg, { Circle, G, Line } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ActivityRingsProps {
    size?: number;
    movePercentage?: number; // 0 to 1
    exercisePercentage?: number; // 0 to 1
    standPercentage?: number; // 0 to 1
}

export const ActivityRings: React.FC<ActivityRingsProps> = ({
    size = 180,
    movePercentage = 0.75,
    exercisePercentage = 0.5,
    standPercentage = 0.8,
}) => {
    const strokeWidth = size * 0.12;
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;

    // Radii for the three concentric rings
    const radius1 = radius;
    const radius2 = radius - strokeWidth - 4;
    const radius3 = radius - (strokeWidth * 2) - 8;

    // Circumferences
    const c1 = 2 * Math.PI * radius1;
    const c2 = 2 * Math.PI * radius2;
    const c3 = 2 * Math.PI * radius3;

    const moveAnim = useRef(new Animated.Value(0)).current;
    const exerciseAnim = useRef(new Animated.Value(0)).current;
    const standAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = (anim: Animated.Value, toValue: number, delay: number) => {
            Animated.timing(anim, {
                toValue,
                duration: 1500,
                delay,
                easing: Easing.out(Easing.cubic),
                // useNativeDriver: false for SVG strokeDashoffset
                useNativeDriver: false,
            }).start();
        };

        animation(moveAnim, movePercentage, 200);
        animation(exerciseAnim, exercisePercentage, 400);
        animation(standAnim, standPercentage, 600);
    }, []);

    // Colors (Apple Watch Style)
    const colors = {
        move: { bg: '#2D0412', fg: '#FA114F' },     // Red/Pink
        exercise: { bg: '#1A2900', fg: '#A4FF00' }, // Lime Green
        stand: { bg: '#00282E', fg: '#00D9FF' },    // Cyan/Blue
    };

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Svg width={size} height={size}>
                <G rotation="-90" origin={`${center}, ${center}`}>
                    {/* Background Rings */}
                    <Circle cx={center} cy={center} r={radius1} stroke={colors.move.bg} strokeWidth={strokeWidth} fill="transparent" />
                    <Circle cx={center} cy={center} r={radius2} stroke={colors.exercise.bg} strokeWidth={strokeWidth} fill="transparent" />
                    <Circle cx={center} cy={center} r={radius3} stroke={colors.stand.bg} strokeWidth={strokeWidth} fill="transparent" />

                    {/* Foreground Rings (Animated) */}
                    <AnimatedCircle
                        cx={center}
                        cy={center}
                        r={radius1}
                        stroke={colors.move.fg}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeLinecap="round"
                        strokeDasharray={c1}
                        strokeDashoffset={moveAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [c1, 0],
                        })}
                    />
                    <AnimatedCircle
                        cx={center}
                        cy={center}
                        r={radius2}
                        stroke={colors.exercise.fg}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeLinecap="round"
                        strokeDasharray={c2}
                        strokeDashoffset={exerciseAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [c2, 0],
                        })}
                    />
                    <AnimatedCircle
                        cx={center}
                        cy={center}
                        r={radius3}
                        stroke={colors.stand.fg}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeLinecap="round"
                        strokeDasharray={c3}
                        strokeDashoffset={standAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [c3, 0],
                        })}
                    />
                </G>
            </Svg>

            {/* Centered Icons or Data could go here, but rings usually stand alone or have data beside them */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
