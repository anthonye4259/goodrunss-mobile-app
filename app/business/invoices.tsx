import React, { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, Share } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { router, useLocalSearchParams } from "expo-router"
import * as Haptics from "expo-haptics"
import { LinearGradient } from "expo-linear-gradient"

export default function InvoicesScreen() {
    const params = useLocalSearchParams()
    const [amount, setAmount] = useState("")
    const [clientName, setClientName] = useState(params.client as string || "")
    const [description, setDescription] = useState("Private Session")
    const [isSending, setIsSending] = useState(false)

    const handleSendInvoice = async () => {
        if (!amount || !clientName) {
            Alert.alert("Missing Info", "Please enter a client and amount.")
            return
        }

        setIsSending(true)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

        // Mock Link Generation
        const invoiceId = Math.random().toString(36).substring(7)
        const paymentLink = `https://pay.goodrunss.com/inv/${invoiceId}`

        const message = `Hi ${clientName}, here is the invoice for our ${description}.\n\nTotal: $${amount}\n\nPay securely here: ${paymentLink}`

        try {
            await Share.share({
                message: message,
                title: `Invoice for ${clientName}`
            })

            // On success (or dismiss), we assume sent for MVP
            setIsSending(false)
            router.back()
        } catch (error) {
            console.error(error)
            setIsSending(false)
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="close" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.title}>Send Invoice</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.formCard}>
                    <Text style={styles.label}>Amount</Text>
                    <View style={styles.amountInputContainer}>
                        <Text style={styles.currency}>$</Text>
                        <TextInput
                            style={styles.amountInput}
                            placeholder="0.00"
                            placeholderTextColor="#666"
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                            autoFocus
                        />
                    </View>

                    <Text style={styles.label}>Client Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Sarah Jones"
                        placeholderTextColor="#666"
                        value={clientName}
                        onChangeText={setClientName}
                    />

                    <Text style={styles.label}>For</Text>
                    <View style={styles.chipRow}>
                        {["Private Session", "Package", "Consultation"].map((opt) => (
                            <TouchableOpacity
                                key={opt}
                                style={[styles.chip, description === opt && styles.chipActive]}
                                onPress={() => {
                                    Haptics.selectionAsync()
                                    setDescription(opt)
                                }}
                            >
                                <Text style={[styles.chipText, description === opt && styles.chipTextActive]}>{opt}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Recent Invoices Mock */}
                <Text style={styles.sectionTitle}>Recent</Text>
                <View style={styles.historyList}>
                    {[
                        { id: 1, name: "Mike Ross", amount: "150.00", status: "Paid", date: "Today" },
                        { id: 2, name: "Jessica P.", amount: "75.00", status: "Pending", date: "Yesterday" },
                    ].map((item) => (
                        <View key={item.id} style={styles.historyItem}>
                            <View>
                                <Text style={styles.historyName}>{item.name}</Text>
                                <Text style={styles.historyDate}>{item.date}</Text>
                            </View>
                            <View style={styles.historyRight}>
                                <Text style={styles.historyAmount}>${item.amount}</Text>
                                <Text style={[styles.historyStatus, { color: item.status === "Paid" ? "#7ED957" : "#EAB308" }]}>
                                    {item.status}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.sendBtn} onPress={handleSendInvoice} disabled={isSending}>
                    <LinearGradient
                        colors={['#EAB308', '#CA8A04']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.btnGradient}
                    >
                        {isSending ? (
                            <ActivityIndicator color="#000" />
                        ) : (
                            <>
                                <Ionicons name="paper-plane" size={20} color="#000" />
                                <Text style={styles.sendBtnText}>Send Invoice</Text>
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
    formCard: { backgroundColor: "#111", borderRadius: 16, padding: 20, borderWidth: 1, borderColor: "#222", marginBottom: 24 },
    label: { color: "#999", fontSize: 14, marginBottom: 8, fontWeight: "600" },
    amountInputContainer: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
    currency: { fontSize: 40, fontWeight: "bold", color: "#EAB308", marginRight: 4 },
    amountInput: { fontSize: 48, fontWeight: "bold", color: "#FFF", flex: 1, height: 60 },
    input: { backgroundColor: "#222", borderRadius: 12, padding: 16, color: "#FFF", fontSize: 16, marginBottom: 24 },
    chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "#222", borderWidth: 1, borderColor: "#333" },
    chipActive: { backgroundColor: "rgba(234, 179, 8, 0.2)", borderColor: "#EAB308" },
    chipText: { color: "#CCC", fontWeight: "600" },
    chipTextActive: { color: "#EAB308" },
    sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#FFF", marginBottom: 16 },
    historyList: { gap: 12 },
    historyItem: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#111", padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "#222" },
    historyName: { color: "#FFF", fontWeight: "600", fontSize: 15 },
    historyDate: { color: "#666", fontSize: 12, marginTop: 4 },
    historyRight: { alignItems: "flex-end" },
    historyAmount: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
    historyStatus: { fontSize: 12, fontWeight: "600", marginTop: 4 },
    footer: { padding: 16, borderTopWidth: 1, borderTopColor: "#222" },
    sendBtn: { borderRadius: 16, overflow: "hidden" },
    btnGradient: { paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
    sendBtnText: { color: "#000", fontSize: 18, fontWeight: "bold" }
})
