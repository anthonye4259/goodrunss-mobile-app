
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { router } from "expo-router"
import { socialService } from "@/lib/services/social-service"

export default function CreateGroupScreen() {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [sport, setSport] = useState("")
    const [isPrivate, setIsPrivate] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleCreate = async () => {
        if (!name.trim() || !sport.trim()) {
            Alert.alert("Missing Fields", "Please enter a group name and sport.")
            return
        }

        setLoading(true)
        try {
            await socialService.createGroup({
                name,
                sport,
                description,
                isPrivate
            })
            Alert.alert("Success", "Group created!")
            router.back()
        } catch (error) {
            console.error(error)
            Alert.alert("Error", "Failed to create group")
        } finally {
            setLoading(false)
        }
    }

    return (
        <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Group</Text>
                <TouchableOpacity onPress={handleCreate} disabled={loading}>
                    <Text style={[styles.createAction, loading && { opacity: 0.5 }]}>
                        {loading ? "..." : "Create"}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Group Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Morning Runners"
                        placeholderTextColor="#666"
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Sport / Activity</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Running, Basketball"
                        placeholderTextColor="#666"
                        value={sport}
                        onChangeText={setSport}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="What's this group about?"
                        placeholderTextColor="#666"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                    />
                </View>

                <View style={styles.privacyRow}>
                    <View>
                        <Text style={styles.privacyTitle}>Private Group</Text>
                        <Text style={styles.privacyDesc}>Only invited members can join</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.toggle, isPrivate && styles.toggleActive]}
                        onPress={() => setIsPrivate(!isPrivate)}
                    >
                        <View style={[styles.toggleKnob, isPrivate && styles.toggleKnobActive]} />
                    </TouchableOpacity>
                </View>

            </ScrollView>
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
    headerTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },
    createAction: { color: "#7ED957", fontSize: 16, fontWeight: "bold" },
    content: { padding: 20 },
    formGroup: { marginBottom: 24 },
    label: { color: "#999", marginBottom: 8, fontSize: 12, textTransform: "uppercase", letterSpacing: 1 },
    input: {
        backgroundColor: "#1a1a1a",
        color: "#FFF",
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#333"
    },
    textArea: { height: 100, textAlignVertical: "top" },
    privacyRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#1a1a1a",
        padding: 16,
        borderRadius: 12,
        marginTop: 8
    },
    privacyTitle: { color: "#FFF", fontSize: 16, fontWeight: "600" },
    privacyDesc: { color: "#666", fontSize: 12 },
    toggle: {
        width: 50,
        height: 30,
        borderRadius: 15,
        backgroundColor: "#333",
        padding: 2
    },
    toggleActive: { backgroundColor: "#7ED957" },
    toggleKnob: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: "#FFF"
    },
    toggleKnobActive: { alignSelf: "flex-end" }
})
