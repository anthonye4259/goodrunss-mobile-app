import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Contacts from "expo-contacts"
import { LinearGradient } from "expo-linear-gradient"
import { trainerDashboardService } from "@/lib/services/trainer-dashboard-service"

export default function AddClientScreen() {
    const [contacts, setContacts] = useState<Contacts.Contact[]>([])
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [loading, setLoading] = useState(true)
    const [importing, setImporting] = useState(false)
    const [permissionStatus, setPermissionStatus] = useState<string | null>(null)

    useEffect(() => {
        (async () => {
            const { status } = await Contacts.requestPermissionsAsync()
            setPermissionStatus(status)

            if (status === 'granted') {
                const { data } = await Contacts.getContactsAsync({
                    fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails, Contacts.Fields.Image],
                    sort: Contacts.SortTypes.FirstName
                })

                if (data.length > 0) {
                    setContacts(data.filter(c => c.name)) // Only contacts with names
                }
            }
            setLoading(false)
        })()
    }, [])

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds)
        if (newSet.has(id)) {
            newSet.delete(id)
        } else {
            newSet.add(id)
        }
        setSelectedIds(newSet)
    }

    const handleImport = async () => {
        if (selectedIds.size === 0) return

        setImporting(true)
        let importedCount = 0

        try {
            for (const contact of contacts) {
                if (selectedIds.has(contact.id || '')) {
                    const phone = contact.phoneNumbers?.[0]?.number
                    const email = contact.emails?.[0]?.email

                    await trainerDashboardService.addClient({
                        name: contact.name || "Unknown",
                        phone: phone,
                        email: email,
                        avatar: contact.image?.uri,
                        joinedAt: new Date().toISOString(),
                        totalSessions: 0,
                        totalSpent: 0,
                        status: "active",
                        notes: "Imported from Contacts"
                    })
                    importedCount++
                }
            }

            Alert.alert(
                "Success! 🎉",
                `Imported ${importedCount} clients to your CRM.`,
                [{ text: "Go to List", onPress: () => router.back() }]
            )
        } catch (error) {
            console.error(error)
            Alert.alert("Error", "Failed to import some contacts.")
        } finally {
            setImporting(false)
        }
    }

    const renderItem = ({ item }: { item: Contacts.Contact }) => {
        const isSelected = selectedIds.has(item.id || '')
        return (
            <TouchableOpacity
                style={[styles.contactRow, isSelected && styles.selectedRow]}
                onPress={() => item.id && toggleSelection(item.id)}
            >
                <View style={styles.left}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{item.name?.charAt(0)}</Text>
                    </View>
                    <View>
                        <Text style={[styles.name, isSelected && styles.selectedText]}>{item.name}</Text>
                        <Text style={styles.subText}>
                            {item.phoneNumbers?.[0]?.number || item.emails?.[0]?.email || "No contact info"}
                        </Text>
                    </View>
                </View>
                <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                    {isSelected && <Ionicons name="checkmark" size={16} color="#000" />}
                </View>
            </TouchableOpacity>
        )
    }

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator color="#7ED957" />
            </View>
        )
    }

    if (permissionStatus !== 'granted') {
        return (
            <View style={[styles.container, styles.center]}>
                <Ionicons name="lock-closed-outline" size={48} color="#666" />
                <Text style={styles.permissionText}>We need access to your contacts to import clients.</Text>
                <TouchableOpacity onPress={router.back} style={styles.cancelBtn}>
                    <Text style={styles.cancelText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="close" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.title}>Import Clients</Text>
                <TouchableOpacity
                    disabled={selectedIds.size === 0 || importing}
                    onPress={handleImport}
                >
                    <Text style={[styles.importBtn, selectedIds.size === 0 && { color: '#666' }]}>
                        {importing ? "..." : selectedIds.size > 0 ? `Import (${selectedIds.size})` : "Import"}
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={contacts}
                renderItem={renderItem}
                keyExtractor={item => item.id || Math.random().toString()}
                contentContainerStyle={styles.list}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000" },
    center: { justifyContent: 'center', alignItems: 'center', padding: 20 },
    header: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#222"
    },
    backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center", backgroundColor: "#1A1A1A", borderRadius: 20 },
    title: { fontSize: 16, fontWeight: "bold", color: "#FFF" },
    importBtn: { color: "#7ED957", fontWeight: "bold", fontSize: 16 },

    list: { padding: 16 },
    contactRow: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        padding: 12, backgroundColor: "#111", marginBottom: 8, borderRadius: 12
    },
    selectedRow: { backgroundColor: "#1A1A1A", borderColor: "#7ED957", borderWidth: 1 },
    left: { flexDirection: "row", alignItems: "center", gap: 12 },
    avatar: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: "#333",
        alignItems: "center", justifyContent: "center"
    },
    avatarText: { color: "#FFF", fontWeight: "bold" },
    name: { color: "#FFF", fontSize: 16, fontWeight: "600" },
    selectedText: { color: "#7ED957" },
    subText: { color: "#666", fontSize: 12 },

    checkbox: {
        width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: "#666",
        alignItems: "center", justifyContent: "center"
    },
    checkboxChecked: { backgroundColor: "#7ED957", borderColor: "#7ED957" },

    permissionText: { color: "#999", textAlign: "center", marginTop: 16, marginBottom: 24 },
    cancelBtn: { padding: 12 },
    cancelText: { color: "#FFF", fontWeight: "bold" }
})
