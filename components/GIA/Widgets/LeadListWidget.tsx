import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface LeadListWidgetProps {
    leads?: any[];
}

export const LeadListWidget = ({ leads = [] }: LeadListWidgetProps) => {
    if (!leads.length) return null;

    return (
        <View>
            <Text style={styles.headerTitle}>Found {leads.length} potential clients matches:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                {leads.map(lead => (
                    <TouchableOpacity key={lead.id} style={styles.card} activeOpacity={0.8} onPress={() => router.push('/business/crm')}>
                        <Image source={{ uri: lead.image }} style={styles.avatar} />
                        <View style={styles.matchBadge}>
                            <Text style={styles.matchText}>{lead.match}%</Text>
                        </View>
                        <Text style={styles.name}>{lead.name}</Text>
                        <Text style={styles.interest}>{lead.interest}</Text>
                        <View style={styles.actionBtn}>
                            <Text style={styles.actionText}>Connect</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    headerTitle: {
        color: '#999',
        fontSize: 12,
        marginBottom: 12,
        marginLeft: 4,
    },
    scroll: {
        gap: 12,
        paddingRight: 20,
    },
    card: {
        width: 120,
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginBottom: 8,
        backgroundColor: '#222',
    },
    matchBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#7ED957',
        borderRadius: 8,
        paddingHorizontal: 4,
        paddingVertical: 2,
    },
    matchText: {
        color: '#000',
        fontSize: 8,
        fontWeight: 'bold',
    },
    name: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: 'bold',
        marginBottom: 2,
        textAlign: 'center',
    },
    interest: {
        color: '#999',
        fontSize: 11,
        marginBottom: 8,
    },
    actionBtn: {
        backgroundColor: 'rgba(126, 217, 87, 0.1)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
    },
    actionText: {
        color: '#7ED957',
        fontSize: 11,
        fontWeight: '600',
    }
});
