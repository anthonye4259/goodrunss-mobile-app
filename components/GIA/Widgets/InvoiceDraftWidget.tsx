import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

export const InvoiceDraftWidget = () => {
    const [status, setStatus] = useState<'draft' | 'sending' | 'sent'>('draft');

    const handleSend = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setStatus('sending');
        setTimeout(() => setStatus('sent'), 1500);
    };

    if (status === 'sent') {
        return (
            <View style={styles.sentContainer}>
                <Ionicons name="checkmark-circle" size={32} color="#7ED957" />
                <Text style={styles.sentText}>Invoice Sent to Mike!</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.iconBadge}>
                    <Ionicons name="receipt" size={16} color="#EAB308" />
                </View>
                <Text style={styles.title}>Draft Invoice</Text>
            </View>

            <View style={styles.details}>
                <View style={styles.row}>
                    <Text style={styles.label}>To:</Text>
                    <Text style={styles.value}>Mike Ross</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>For:</Text>
                    <Text style={styles.value}>Private Session (1h)</Text>
                </View>
                <View style={[styles.row, { borderBottomWidth: 0 }]}>
                    <Text style={styles.label}>Amount:</Text>
                    <Text style={styles.amount}>$150.00</Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSend}
                disabled={status !== 'draft'}
            >
                <LinearGradient
                    colors={['#EAB308', '#CA8A04']}
                    style={styles.gradient}
                >
                    {status === 'sending' ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <>
                            <Text style={styles.btnText}>Send Invoice</Text>
                            <Ionicons name="arrow-forward" size={16} color="#000" />
                        </>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        padding: 16,
        width: 260,
        borderWidth: 1,
        borderColor: '#333',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    iconBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(234, 179, 8, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    details: {
        backgroundColor: '#111',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
    },
    label: {
        color: '#999',
        fontSize: 12,
    },
    value: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '500',
    },
    amount: {
        color: '#EAB308',
        fontSize: 14,
        fontWeight: 'bold',
    },
    sendButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    gradient: {
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    btnText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 14,
    },
    sentContainer: {
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        padding: 20,
        width: 260,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(126, 217, 87, 0.3)',
    },
    sentText: {
        color: '#7ED957',
        fontWeight: 'bold',
        fontSize: 14,
    }
});
