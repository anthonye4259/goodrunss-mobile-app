import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface ActionChipProps {
    label: string;
    icon?: string;
    onPress: () => void;
}

export const ActionChip: React.FC<ActionChipProps> = ({ label, icon, onPress }) => {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.container}>
            <LinearGradient
                colors={['#1A1A1A', '#2A2A2A']}
                style={styles.gradient}
            >
                {icon && <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={16} color="#7ED957" style={styles.icon} />}
                <Text style={styles.label}>{label}</Text>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        marginRight: 10,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 2,
    },
    gradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#333',
    },
    icon: {
        marginRight: 6,
    },
    label: {
        color: '#E5E7EB',
        fontSize: 14,
        fontFamily: 'Inter_500Medium',
    },
});
