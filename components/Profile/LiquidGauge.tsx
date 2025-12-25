import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

interface LiquidGaugeProps {
    score: number; // 0-100
    label: string;
    color?: string;
    size?: number;
}

export const LiquidGauge: React.FC<LiquidGaugeProps> = ({
    score,
    label,
    color = '#7ED957',
    size = 120
}) => {
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / 100) * circumference;
    const center = size / 2;

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Svg width={size} height={size} style={styles.svg}>
                <Defs>
                    <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                        <Stop offset="0" stopColor={color} stopOpacity="1" />
                        <Stop offset="1" stopColor="#3B82F6" stopOpacity="0.8" />
                    </LinearGradient>
                </Defs>

                {/* Background Circle */}
                <Circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={strokeWidth}
                    fill="none"
                />

                {/* Progress Circle */}
                <Circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke="url(#grad)" // Use gradient
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - progress}
                    strokeLinecap="round"
                    rotation="-90"
                    origin={`${center}, ${center}`}
                />
            </Svg>

            <View style={styles.textContainer}>
                <Text style={[styles.score, { color }]}>{score}</Text>
                <Text style={styles.label}>{label}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    svg: {
        position: 'absolute',
    },
    textContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        zIndex: 10,
        elevation: 5,
    },
    score: {
        fontSize: 28,
        fontFamily: 'Inter_700Bold',
        marginBottom: 2,
        backgroundColor: 'transparent',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    label: {
        fontSize: 10,
        fontFamily: 'Inter_500Medium',
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    }
});
