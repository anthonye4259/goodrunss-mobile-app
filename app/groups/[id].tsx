
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Image, KeyboardAvoidingView, Platform } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useState, useRef } from "react"
import { useLocalSearchParams, router } from "expo-router"

export default function GroupDetailScreen() {
    const { id } = useLocalSearchParams()
    const [activeTab, setActiveTab] = useState<"chat" | "info">("chat")
    const [message, setMessage] = useState("")

    // Mock messages
    const [messages, setMessages] = useState([
        { id: "1", user: "Mike", text: "Who's coming tonight?", time: "2:30 PM", avatar: "M" },
        { id: "2", user: "Sarah", text: "I'll be there!", time: "2:32 PM", avatar: "S", isMe: true },
        { id: "3", user: "John", text: "Running a bit late but yes.", time: "2:35 PM", avatar: "J" }
    ])

    const scrollViewRef = useRef<ScrollView>(null)

    const handleSend = () => {
        if (!message.trim()) return
        setMessages([...messages, {
            id: Date.now().toString(),
            user: "Me",
            text: message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            avatar: "Me",
            isMe: true
        }])
        setMessage("")
        setTimeout(() => scrollViewRef.current?.scrollToEnd(), 100)
    }

    return (
        <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Saturday Run Club</Text>
                    <Text style={styles.headerSubtitle}>12 members • Online</Text>
                </View>
                <TouchableOpacity>
                    <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Group Tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity style={[styles.tab, activeTab === "chat" && styles.activeTab]} onPress={() => setActiveTab("chat")}>
                    <Text style={[styles.tabText, activeTab === "chat" && styles.activeTabText]}>Chat</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, activeTab === "info" && styles.activeTab]} onPress={() => setActiveTab("info")}>
                    <Text style={[styles.tabText, activeTab === "info" && styles.activeTabText]}>Info</Text>
                </TouchableOpacity>
            </View>

            {activeTab === "chat" ? (
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                    keyboardVerticalOffset={0}
                >
                    <ScrollView
                        ref={scrollViewRef}
                        style={styles.chatContainer}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    >
                        {messages.map(msg => (
                            <View key={msg.id} style={[styles.messageRow, msg.isMe && styles.messageRowMe]}>
                                {!msg.isMe && (
                                    <View style={styles.avatar}>
                                        <Text style={styles.avatarText}>{msg.avatar}</Text>
                                    </View>
                                )}
                                <View style={[styles.bubble, msg.isMe ? styles.bubbleMe : styles.bubbleThem]}>
                                    {!msg.isMe && <Text style={styles.senderName}>{msg.user}</Text>}
                                    <Text style={[styles.messageText, msg.isMe && styles.messageTextMe]}>{msg.text}</Text>
                                    <Text style={[styles.timeText, msg.isMe && styles.timeTextMe]}>{msg.time}</Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                    <View style={styles.inputBar}>
                        <TextInput
                            style={styles.input}
                            placeholder="Message group..."
                            placeholderTextColor="#666"
                            value={message}
                            onChangeText={setMessage}
                        />
                        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
                            <Ionicons name="send" size={20} color="#000" />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            ) : (
                <ScrollView style={styles.content}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About</Text>
                        <Text style={styles.sectionText}>
                            Weekly runs every Saturday morning at 8am. All places welcome!
                            We usually grab coffee afterwards.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Members (12)</Text>
                        {/* Mock Members */}
                        <View style={styles.memberRow}>
                            <View style={styles.avatar}><Text style={styles.avatarText}>A</Text></View>
                            <Text style={styles.memberName}>Admin User (Host)</Text>
                        </View>
                        <View style={styles.memberRow}>
                            <View style={styles.avatar}><Text style={styles.avatarText}>M</Text></View>
                            <Text style={styles.memberName}>Mike Johnson</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.leaveBtn}>
                        <Text style={styles.leaveText}>Leave Group</Text>
                    </TouchableOpacity>
                </ScrollView>
            )}
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#1a1a1a"
    },
    headerCenter: { alignItems: "center" },
    headerTitle: { fontSize: 16, fontWeight: "bold", color: "#fff" },
    headerSubtitle: { fontSize: 12, color: "#7ED957" },

    tabs: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#1a1a1a" },
    tab: { flex: 1, alignItems: "center", paddingVertical: 12 },
    activeTab: { borderBottomWidth: 2, borderBottomColor: "#7ED957" },
    tabText: { color: "#666", fontWeight: "600" },
    activeTabText: { color: "#FFF" },

    chatContainer: { flex: 1, padding: 16 },
    messageRow: { flexDirection: "row", marginBottom: 16, alignItems: "flex-end" },
    messageRowMe: { justifyContent: "flex-end" },
    avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#333", alignItems: "center", justifyContent: "center", marginRight: 8 },
    avatarText: { color: "#FFF", fontWeight: "bold", fontSize: 12 },
    bubble: { maxWidth: "75%", padding: 12, borderRadius: 16 },
    bubbleThem: { backgroundColor: "#1a1a1a", borderBottomLeftRadius: 4 },
    bubbleMe: { backgroundColor: "#7ED957", borderBottomRightRadius: 4 },
    senderName: { color: "#7ED957", fontSize: 11, marginBottom: 4, fontWeight: "bold" },
    messageText: { color: "#FFF", fontSize: 15 },
    messageTextMe: { color: "#000" },
    timeText: { color: "#666", fontSize: 10, marginTop: 4, alignSelf: "flex-end" },
    timeTextMe: { color: "rgba(0,0,0,0.5)" },

    inputBar: {
        flexDirection: "row",
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: "#1a1a1a",
        alignItems: "center",
        marginBottom: 30
    },
    input: {
        flex: 1,
        backgroundColor: "#1a1a1a",
        color: "#FFF",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 12,
        maxHeight: 100
    },
    sendBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#7ED957",
        alignItems: "center",
        justifyContent: "center"
    },

    content: { flex: 1, padding: 20 },
    section: { marginBottom: 30 },
    sectionTitle: { color: "#FFF", fontSize: 18, fontWeight: "bold", marginBottom: 12 },
    sectionText: { color: "#CCC", lineHeight: 22 },
    memberRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
    memberName: { color: "#FFF", marginLeft: 12, fontSize: 16 },
    leaveBtn: { padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "#EF4444", alignItems: "center" },
    leaveText: { color: "#EF4444", fontWeight: "bold" }
})
