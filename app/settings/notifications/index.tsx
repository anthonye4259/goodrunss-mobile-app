import React, { useState } from "react"
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"

export default function NotificationSettings() {
    const [settings, setSettings] = useState({
        pauseAll: false,
        // Social
        newFollowers: true,
        friendRequests: true,
        chatMessages: true,
        mentions: true,
        // Activity
        gameInvites: true,
        nearbyAlerts: true,
        reminders: true,
        // Marketing
        promotions: false,
        tips: true
    })

    const toggleSwitch = (key: keyof typeof settings) => {
        Haptics.selectionAsync()
        setSettings(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const SectionHeader = ({ title, icon, color }: { title: string, icon: any, color: string }) => (
        <View style={styles.sectionHeader}>
            <View style={[styles.iconBox, { backgroundColor: `${color}20` }]}>
                <Ionicons name={icon} size={18} color={color} />
            </View>
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
    )

    const SettingRow = ({ label, subLabel, settingKey }: { label: string, subLabel?: string, settingKey: keyof typeof settings }) => (
        <View style={styles.row}>
            <View style={{ flex: 1, paddingRight: 16 }}>
                <Text style={styles.rowLabel}>{label}</Text>
                {subLabel && <Text style={styles.rowSubLabel}>{subLabel}</Text>}
            </View>
            <Switch
                trackColor={{ false: "#333", true: "#3B82F6" }}
                thumbColor={settings[settingKey] ? "#FFF" : "#f4f3f4"}
                ios_backgroundColor="#333"
                onValueChange={() => toggleSwitch(settingKey)}
                value={settings[settingKey]}
                disabled={settings.pauseAll && settingKey !== 'pauseAll'}
            />
        </View>
    )

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Notifications</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>

                    {/* MASTER TOGGLE */}
                    <View style={styles.masterCard}>
                        <View style={styles.masterRow}>
                            <View>
                                <Text style={styles.masterTitle}>Pause All</Text>
                                <Text style={styles.masterDesc}>Temporarily mute all push notifications</Text>
                            </View>
                            <Switch
                                trackColor={{ false: "#333", true: "#EF4444" }}
                                thumbColor={"#FFF"}
                                ios_backgroundColor="#333"
                                onValueChange={() => toggleSwitch('pauseAll')}
                                value={settings.pauseAll}
                            />
                        </View>
                    </View>

                    {/* SOCIAL */}
                    <SectionHeader title="Social" icon="people" color="#EC4899" />
                    <View style={styles.card}>
                        <SettingRow
                            label="New Followers"
                            settingKey="newFollowers"
                        />
                        <View style={styles.divider} />
                        <SettingRow
                            label="Friend Requests"
                            settingKey="friendRequests"
                        />
                        <View style={styles.divider} />
                        <SettingRow
                            label="Chat Messages"
                            settingKey="chatMessages"
                        />
                    </View>

                    {/* ACTIVITY */}
                    <SectionHeader title="Activity" icon="basketball" color="#F59E0B" />
                    <View style={styles.card}>
                        <SettingRow
                            label="Game Invites"
                            subLabel="When someone invites you to play"
                            settingKey="gameInvites"
                        />
                        <View style={styles.divider} />
                        <SettingRow
                            label="Nearby Alerts"
                            subLabel="New games or venues near you"
                            settingKey="nearbyAlerts"
                        />
                        <View style={styles.divider} />
                        <SettingRow
                            label="Session Reminders"
                            settingKey="reminders"
                        />
                    </View>

                    {/* GENERAL */}
                    <SectionHeader title="Updates" icon="notifications" color="#3B82F6" />
                    <View style={styles.card}>
                        <SettingRow
                            label="GoodRunss Tips"
                            settingKey="tips"
                        />
                        <View style={styles.divider} />
                        <SettingRow
                            label="Promotions & Offers"
                            settingKey="promotions"
                        />
                    </View>

                </ScrollView>
            </SafeAreaView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000" },
    safeArea: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#222'
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A1A1A',
        alignItems: 'center', justifyContent: 'center'
    },
    headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
    content: { padding: 20 },

    masterCard: {
        backgroundColor: '#1A1A1A', borderRadius: 16, padding: 16, marginBottom: 24,
        borderWidth: 1, borderColor: '#333'
    },
    masterRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
    },
    masterTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    masterDesc: { color: '#999', fontSize: 12 },

    sectionHeader: {
        flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 8
    },
    iconBox: {
        width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 10
    },
    sectionTitle: {
        color: '#999', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1
    },

    card: {
        backgroundColor: '#111', borderRadius: 16, overflow: 'hidden', marginBottom: 24
    },
    row: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 16, backgroundColor: '#111'
    },
    rowLabel: { color: '#FFF', fontSize: 15 },
    rowSubLabel: { color: '#666', fontSize: 12, marginTop: 2 },
    divider: { height: 1, backgroundColor: '#222', marginLeft: 16 }
})
