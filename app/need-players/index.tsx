
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, Switch } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useState, useMemo } from "react"
import { router } from "expo-router"
import { useUserPreferences } from "@/lib/user-preferences"

type SportConfig = {
    term: string
    icon: keyof typeof Ionicons.glyphMap
    isTeam: boolean
    hasVariations?: boolean
}

const SPORT_CONFIG: Record<string, SportConfig> = {
    "Basketball": { term: "Need Players", icon: "basketball", isTeam: true },
    "Soccer": { term: "Need Players", icon: "football", isTeam: true },
    "Tennis": { term: "Looking for Partner", icon: "tennisball", isTeam: false, hasVariations: true },
    "Pickleball": { term: "Looking for Partner", icon: "tennisball", isTeam: false, hasVariations: true },
    "Running": { term: "Running Buddy", icon: "walk", isTeam: false },
}

export default function NeedPlayersScreen() {
    const { preferences } = useUserPreferences()
    // Default to Basketball if preference is missing or not in config, otherwise use preference
    const initialSport = (preferences.primaryActivity && SPORT_CONFIG[preferences.primaryActivity])
        ? preferences.primaryActivity
        : "Basketball"

    const [sport, setSport] = useState(initialSport)
    const [matchType, setMatchType] = useState<"Singles" | "Doubles">("Singles")
    const [location, setLocation] = useState("Central Park Courts (Detected)")
    const [playersNeeded, setPlayersNeeded] = useState("1")
    const [note, setNote] = useState("")
    const [loading, setLoading] = useState(false)

    // Computed Values
    const config = SPORT_CONFIG[sport] || SPORT_CONFIG["Basketball"]

    const title = useMemo(() => {
        if (config.hasVariations && matchType === "Doubles") return "Need Pair / Partner"
        return config.term
    }, [config, matchType])

    const icon = useMemo(() => {
        // If it's a team need (Urgent), use megaphone/warning style
        // If it's a partner find (Social), use person add style
        if (config.isTeam) return "megaphone"
        return "person-add"
    }, [config])

    const handleBroadcast = async () => {
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
            Alert.alert("Request Sent!", `Notified nearby players for ${sport} (${matchType}).`)
            router.back()
        }, 1500)
    }

    return (
        <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{title}</Text>
                <TouchableOpacity onPress={handleBroadcast} disabled={loading}>
                    <Text style={[styles.sendAction, loading && { opacity: 0.5 }]}>
                        {loading ? "Sending..." : "Send"}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {/* Dynamic Hero */}
                <View style={styles.heroSection}>
                    <View style={[styles.iconCircle, { backgroundColor: config.isTeam ? '#EF4444' : '#3B82F6' }]}>
                        <Ionicons name={icon} size={32} color="#FFF" />
                    </View>
                    <Text style={styles.heroTitle}>{title}</Text>
                    <Text style={styles.heroDesc}>
                        {config.isTeam
                            ? `Alert players nearby that you need ${playersNeeded} more for a game.`
                            : `Find a ${matchType === "Doubles" ? "partner or pair" : "partner"} to play with right now.`}
                    </Text>
                </View>

                {/* SOS Info Card */}
                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Ionicons name="navigate" size={20} color="#7ED957" />
                        <Text style={styles.infoText}>{location}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                        <Ionicons name="time" size={20} color="#EF4444" />
                        <Text style={styles.infoText}>Right Now (SOS)</Text>
                    </View>
                </View>

                {/* Sport Selection */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Sport</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sportSelector}>
                        {Object.keys(SPORT_CONFIG).map(s => (
                            <TouchableOpacity
                                key={s}
                                style={[styles.sportChip, sport === s && styles.sportChipActive]}
                                onPress={() => setSport(s)}
                            >
                                <Text style={[styles.sportText, sport === s && styles.sportTextActive]}>{s}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Variations (Singles/Doubles) */}
                {config.hasVariations && (
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Match Type</Text>
                        <View style={styles.toggleContainer}>
                            {["Singles", "Doubles"].map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[styles.toggleBtn, matchType === type && styles.toggleBtnActive]}
                                    onPress={() => setMatchType(type as any)}
                                >
                                    <Text style={[styles.toggleText, matchType === type && styles.toggleTextActive]}>{type}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* Player Count (Only makes sense if not finding a single partner, or for team sports) */}
                {(config.isTeam || (matchType === "Doubles")) && (
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>How many needed?</Text>
                        <View style={styles.counterRow}>
                            <TouchableOpacity onPress={() => setPlayersNeeded(String(Math.max(1, parseInt(playersNeeded) - 1)))} style={styles.counterBtn}>
                                <Ionicons name="remove" size={24} color="#FFF" />
                            </TouchableOpacity>
                            <Text style={styles.counterText}>{playersNeeded}</Text>
                            <TouchableOpacity onPress={() => setPlayersNeeded(String(parseInt(playersNeeded) + 1))} style={styles.counterBtn}>
                                <Ionicons name="add" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Quick Note</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder={config.isTeam ? "e.g. We have court, need 1 more!" : "e.g. 3.5+ level, looking to rally."}
                        placeholderTextColor="#666"
                        value={note}
                        onChangeText={setNote}
                        multiline
                    />
                </View>

                <View style={styles.expiryNote}>
                    <Ionicons name="timer-outline" size={16} color="#666" />
                    <Text style={styles.expiryText}>Request expires in 1 hour.</Text>
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
    headerTitle: { fontSize: 18, fontWeight: "bold", color: "#FFF" },
    sendAction: { color: "#3B82F6", fontSize: 16, fontWeight: "bold" },
    content: { padding: 20 },

    heroSection: { alignItems: "center", marginBottom: 32 },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16
    },
    heroTitle: { fontSize: 24, fontWeight: "bold", color: "#FFF", marginBottom: 8 },
    heroDesc: { color: "#999", textAlign: "center", paddingHorizontal: 20 },

    infoCard: {
        backgroundColor: "#1a1a1a",
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#333"
    },
    infoRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    infoText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
    divider: { height: 1, backgroundColor: "#333", marginVertical: 12 },

    formGroup: { marginBottom: 24 },
    label: { color: "#999", marginBottom: 12, fontSize: 12, textTransform: "uppercase", letterSpacing: 1 },

    sportSelector: { flexDirection: "row", gap: 10, paddingRight: 20 },
    sportChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: "#1a1a1a",
        borderWidth: 1,
        borderColor: "#333"
    },
    sportChipActive: { backgroundColor: "#333", borderColor: "#FFF" },
    sportText: { color: "#999", fontWeight: "600" },
    sportTextActive: { color: "#FFF" },

    toggleContainer: { flexDirection: "row", backgroundColor: "#1a1a1a", borderRadius: 12, padding: 4 },
    toggleBtn: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 8 },
    toggleBtnActive: { backgroundColor: "#333" },
    toggleText: { color: "#666", fontWeight: "bold" },
    toggleTextActive: { color: "#FFF" },

    input: {
        backgroundColor: "#1a1a1a",
        color: "#FFF",
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#333"
    },
    textArea: { height: 80, textAlignVertical: "top" },

    counterRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 30 },
    counterBtn: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#333",
        alignItems: "center",
        justifyContent: "center"
    },
    counterText: { color: "#FFF", fontSize: 32, fontWeight: "bold", width: 50, textAlign: "center" },

    expiryNote: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 20 },
    expiryText: { color: "#666", fontSize: 12 }
})
