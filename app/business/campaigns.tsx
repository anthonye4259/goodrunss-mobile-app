import React, { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import { LinearGradient } from "expo-linear-gradient"

export default function CampaignsScreen() {
    const [message, setMessage] = useState("")
    const [target, setTarget] = useState("all") // 'all', 'waitlist', 'inactive'
    const [isSending, setIsSending] = useState(false)

    const [channel, setChannel] = useState<"sms" | "email" | "push">("sms")

    const templates = [
        "🔥 Last minute opening: 2pm today! First to reply gets it.",
        "🌧️ Rainy day special: 20% off indoor sessions this week!",
        "💪 New schedule is up! Book your spots for next week."
    ]

    const handleSendBlast = () => {
        if (!message) {
            Alert.alert("Empty Message", "Please write something to send.")
            return
        }

        const channelLabel = channel === 'sms' ? "SMS" : channel === 'email' ? "Email" : "Push Notification"

        Alert.alert(
            `Confirm ${channelLabel} Blast`,
            `Send this ${channelLabel} to ${target === 'all' ? 'All Clients (42)' : target === 'waitlist' ? 'Waitlist (5)' : 'Inactive Clients (12)'}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: `Send ${channelLabel}`,
                    style: "default",
                    onPress: () => {
                        setIsSending(true)
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                        // Mock sending delay
                        setTimeout(() => {
                            setIsSending(false)
                            Alert.alert("Sent! 🚀", `Your ${channelLabel} campaign is on its way.`)
                            router.back()
                        }, 2000)
                    }
                }
            ]
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="close" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.title}>Broadcast Message</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content}>

                {/* Channel Selector */}
                <Text style={styles.label}>Channel:</Text>
                <View style={styles.channelRow}>
                    {[
                        { id: "sms", icon: "chatbubble", label: "SMS" },
                        { id: "email", icon: "mail", label: "Email" },
                        { id: "push", icon: "notifications", label: "Push" }
                    ].map((c) => (
                        <TouchableOpacity
                            key={c.id}
                            style={[
                                styles.channelCard,
                                channel === c.id && styles.channelCardActive
                            ]}
                            onPress={() => {
                                Haptics.selectionAsync()
                                setChannel(c.id as any)
                            }}
                        >
                            <Ionicons
                                name={c.icon as any}
                                size={20}
                                color={channel === c.id ? "#000" : "#666"}
                            />
                            <Text style={[
                                styles.channelLabel,
                                channel === c.id && styles.channelLabelActive
                            ]}>{c.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Target Audience */}
                <Text style={styles.label}>To:</Text>
                <View style={styles.targetRow}>
                    {[
                        { id: "all", label: "All Clients", count: 42, color: "#38BDF8" },
                        { id: "waitlist", label: "Waitlist", count: 5, color: "#FBBF24" },
                        { id: "inactive", label: "Inactive", count: 12, color: "#9CA3AF" }
                    ].map((t) => (
                        <TouchableOpacity
                            key={t.id}
                            style={[
                                styles.targetCard,
                                target === t.id && { borderColor: t.color, backgroundColor: `${t.color}10` }
                            ]}
                            onPress={() => {
                                Haptics.selectionAsync()
                                setTarget(t.id)
                            }}
                        >
                            <Text style={[styles.targetCount, { color: t.color }]}>{t.count}</Text>
                            <Text style={styles.targetLabel}>{t.label}</Text>
                            {target === t.id && (
                                <View style={styles.check}>
                                    <Ionicons name="checkmark-circle" size={16} color={t.color} />
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.label}>Message:</Text>
                <TextInput
                    style={styles.inputArea}
                    placeholder={`Type your ${channel === 'sms' ? 'SMS' : 'message'}...`}
                    placeholderTextColor="#666"
                    multiline
                    numberOfLines={4}
                    value={message}
                    onChangeText={setMessage}
                />

                <Text style={styles.label}>Quick Templates:</Text>
                <View style={styles.templateList}>
                    {templates.map((tpl, i) => (
                        <TouchableOpacity
                            key={i}
                            style={styles.templateCard}
                            onPress={() => {
                                Haptics.selectionAsync()
                                setMessage(tpl)
                            }}
                        >
                            <Text style={styles.templateText}>"{tpl}"</Text>
                        </TouchableOpacity>
                    ))}
                </View>

            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.sendBtn} onPress={handleSendBlast} disabled={isSending}>
                    <LinearGradient
                        colors={['#38BDF8', '#0EA5E9']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.btnGradient}
                    >
                        {isSending ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <>
                                <Ionicons name="megaphone" size={20} color="#FFF" />
                                <Text style={styles.sendBtnText}>Send {channel.toUpperCase()} Blast</Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0A0A0A" },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
    backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center", backgroundColor: "#1A1A1A", borderRadius: 20 },
    title: { fontSize: 18, fontWeight: "bold", color: "#FFF" },
    content: { flex: 1, padding: 16 },
    label: { color: "#999", fontSize: 14, marginBottom: 12, fontWeight: "600", marginTop: 8 },

    // Channel Selector
    channelRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
    channelCard: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        backgroundColor: "#111", borderRadius: 12, paddingVertical: 14, borderWidth: 1, borderColor: "#222"
    },
    channelCardActive: { backgroundColor: "#38BDF8", borderColor: "#38BDF8" },
    channelLabel: { color: "#666", fontWeight: '600' },
    channelLabelActive: { color: "#000", fontWeight: 'bold' },

    targetRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
    targetCard: { flex: 1, backgroundColor: "#111", borderRadius: 12, padding: 12, alignItems: "center", borderWidth: 2, borderColor: "transparent", position: "relative" },
    targetCount: { fontSize: 24, fontWeight: "bold", marginBottom: 4 },
    targetLabel: { color: "#CCC", fontSize: 12 },
    check: { position: "absolute", top: 6, right: 6 },
    inputArea: { backgroundColor: "#1A1A1A", borderRadius: 16, padding: 16, color: "#FFF", fontSize: 16, minHeight: 120, textAlignVertical: "top", marginBottom: 24 },
    templateList: { gap: 10, paddingBottom: 40 },
    templateCard: { backgroundColor: "#111", padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "#222" },
    templateText: { color: "#CCC", fontStyle: "italic" },
    footer: { padding: 16, borderTopWidth: 1, borderTopColor: "#222" },
    sendBtn: { borderRadius: 16, overflow: "hidden" },
    btnGradient: { paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
    sendBtnText: { color: "#FFF", fontSize: 18, fontWeight: "bold" }
})
