import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import { SafeAreaView } from "react-native-safe-area-context"

export default function ActivityScreen() {
    const handlePress = (action: () => void) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        action()
    }

    return (
        <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Activity</Text>
                        <Text style={styles.subtitle}>Your alerts, messages & bookings</Text>
                    </View>

                    {/* Player Alerts Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Player Alerts</Text>
                            <TouchableOpacity onPress={() => handlePress(() => router.push("/alerts"))}>
                                <Text style={styles.seeAll}>See All</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.card}
                            onPress={() => handlePress(() => router.push("/alerts"))}
                        >
                            <View style={styles.cardIcon}>
                                <Ionicons name="people" size={24} color="#7ED957" />
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>Need Players Alerts</Text>
                                <Text style={styles.cardDesc}>See who's looking for players nearby</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#666" />
                        </TouchableOpacity>
                    </View>

                    {/* Messages Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Messages</Text>
                            <TouchableOpacity onPress={() => handlePress(() => router.push("/(tabs)/messages"))}>
                                <Text style={styles.seeAll}>See All</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.card}
                            onPress={() => handlePress(() => router.push("/(tabs)/messages"))}
                        >
                            <View style={styles.cardIcon}>
                                <Ionicons name="chatbubbles" size={24} color="#7ED957" />
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>Conversations</Text>
                                <Text style={styles.cardDesc}>Chat with players and trainers</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#666" />
                        </TouchableOpacity>
                    </View>

                    {/* Bookings Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Bookings</Text>
                            <TouchableOpacity onPress={() => handlePress(() => router.push("/(tabs)/bookings"))}>
                                <Text style={styles.seeAll}>See All</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.card}
                            onPress={() => handlePress(() => router.push("/(tabs)/bookings"))}
                        >
                            <View style={styles.cardIcon}>
                                <Ionicons name="calendar" size={24} color="#7ED957" />
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>Your Bookings</Text>
                                <Text style={styles.cardDesc}>Manage court and trainer sessions</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#666" />
                        </TouchableOpacity>
                    </View>

                    {/* Find Partners */}
                    <View style={styles.section}>
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() => handlePress(() => router.push("/find-partners"))}
                        >
                            <View style={styles.cardIcon}>
                                <Ionicons name="search" size={24} color="#7ED957" />
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>Find Partners</Text>
                                <Text style={styles.cardDesc}>Discover players near you</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#666" />
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: "#9CA3AF",
    },
    section: {
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    seeAll: {
        fontSize: 14,
        color: "#7ED957",
        fontWeight: "600",
    },
    card: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#252525",
    },
    cardIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "rgba(126, 217, 87, 0.2)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 4,
    },
    cardDesc: {
        fontSize: 14,
        color: "#9CA3AF",
    },
})
