
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUserPreferences } from '@/lib/user-preferences';

export default function PartnerBadge() {
    const { preferences } = useUserPreferences();

    // Only show for Phase 1 cities (MB is primarily the target)
    if (!preferences.isPhase1City && preferences.city !== "Myrtle Beach") {
        return null;
    }

    const cityName = preferences.city || "Myrtle Beach";

    return (
        <View style={styles.container}>
            <View style={styles.badge}>
                <Ionicons name="shield-checkmark" size={14} color="#FFD700" />
                <Text style={styles.text}>Official {cityName} Partner</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 4,
        marginBottom: 8,
        alignItems: 'flex-start',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 215, 0, 0.1)', // Gold/Yellow tint
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.3)',
        gap: 4,
    },
    text: {
        color: '#FFD700',
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
});
