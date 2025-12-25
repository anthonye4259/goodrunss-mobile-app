import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

export const CampaignDraftWidget = () => {
    const [status, setStatus] = useState<'draft' | 'sending' | 'sent'>('draft');
    const [text, setText] = useState("🌧️ Rainy day special: 20% off indoor sessions this week! 5 spots left.");

    const handleSend = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setStatus('sending');
        setTimeout(() => setStatus('sent'), 2000);
    };

    if (status === 'sent') {
        return (
            <View style={styles.sentContainer}>
                <Ionicons name="megaphone" size={32} color="#38BDF8" />
                <Text style={styles.sentText}>Blast Sent to 42 Clients!</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={[styles.iconBadge, { backgroundColor: 'rgba(56, 189, 248, 0.2)' }]}>
                    <Ionicons name="flash" size={16} color="#38BDF8" />
                </View>
                <Text style={styles.title}>Campaign Draft</Text>
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={text}
                    onChangeText={setText}
                    multiline
                />
            </View>

            <View style={styles.audienceRow}>
                <Ionicons name="people" size={12} color="#999" />
                <Text style={styles.audienceText}>Target: All Active Clients (42)</Text>
            </View>

            <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSend}
                disabled={status !== 'draft'}
            >
                <LinearGradient
                    colors={['#38BDF8', '#0EA5E9']}
                    style={styles.gradient}
                >
                    {status === 'sending' ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <>
                            <Text style={styles.btnText}>Launch Campaign</Text>
                            <Ionicons name="paper-plane" size={16} color="#FFF" />
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
        width: 280,
        borderWidth: 1,
        borderColor: '#333',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    iconBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    inputContainer: {
        backgroundColor: '#111',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#222',
    },
    input: {
        color: '#DDD',
        fontSize: 13,
        lineHeight: 18,
    },
    audienceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 16,
    },
    audienceText: {
        color: '#999',
        fontSize: 12,
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
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    sentContainer: {
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        padding: 20,
        width: 280,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(56, 189, 248, 0.3)',
    },
    sentText: {
        color: '#38BDF8',
        fontWeight: 'bold',
        fontSize: 14,
    }
});
