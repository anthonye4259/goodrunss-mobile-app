import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"

export default function PrivacyPolicyScreen() {
    return (
        <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Privacy Policy</Text>
                </View>

                <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                    <Text style={styles.updated}>Last Updated: December 6, 2024</Text>

                    <Text style={styles.sectionTitle}>Introduction</Text>
                    <Text style={styles.text}>
                        GoodRunss ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
                    </Text>

                    <Text style={styles.sectionTitle}>Information We Collect</Text>
                    <Text style={styles.subsectionTitle}>Personal Information</Text>
                    <Text style={styles.text}>
                        • Account Information: Name, email, phone number, profile picture{"\n"}
                        • Payment Information: Processed securely through Stripe{"\n"}
                        • Location Data: Real-time and historical location{"\n"}
                        • Health Data: Workout data from Apple Health and Strava
                    </Text>

                    <Text style={styles.subsectionTitle}>Automatically Collected</Text>
                    <Text style={styles.text}>
                        • Device Information: Device type, OS, identifiers{"\n"}
                        • Usage Data: App features used, session duration{"\n"}
                        • Location Data: GPS coordinates when using the app
                    </Text>

                    <Text style={styles.sectionTitle}>How We Use Your Information</Text>
                    <Text style={styles.text}>
                        • Provide Services: Connect you with trainers and venues{"\n"}
                        • Process Payments: Handle bookings via Stripe{"\n"}
                        • Personalization: Recommend trainers and activities{"\n"}
                        • AI Assistant (GIA): Provide fitness recommendations{"\n"}
                        • Location Services: Show nearby venues and trainers{"\n"}
                        • Health Integration: Sync with Apple Health and Strava
                    </Text>

                    <Text style={styles.sectionTitle}>Data Sharing</Text>
                    <Text style={styles.text}>
                        We share your information with:{"\n\n"}
                        • Stripe (payment processing){"\n"}
                        • Firebase/Google Cloud (backend){"\n"}
                        • OpenAI (AI features){"\n"}
                        • Google Places API (venue info){"\n"}
                        • Apple Health & Strava (with permission){"\n\n"}
                        We do NOT sell your personal information.
                    </Text>

                    <Text style={styles.sectionTitle}>Your Rights</Text>
                    <Text style={styles.text}>
                        You have the right to:{"\n\n"}
                        • Access your personal data{"\n"}
                        • Correct your information{"\n"}
                        • Delete your account and data{"\n"}
                        • Opt-out of location or health data{"\n"}
                        • Export your data
                    </Text>

                    <Text style={styles.sectionTitle}>Data Security</Text>
                    <Text style={styles.text}>
                        We implement industry-standard security:{"\n\n"}
                        • Encryption in transit and at rest{"\n"}
                        • Secure authentication via Firebase{"\n"}
                        • PCI-compliant payment processing{"\n"}
                        • Limited employee access to data
                    </Text>

                    <Text style={styles.sectionTitle}>Contact Us</Text>
                    <Text style={styles.text}>
                        For privacy questions:{"\n\n"}
                        Email: privacy@goodrunss.com{"\n"}
                        In-App: Settings → Help & Support → Privacy
                    </Text>

                    <TouchableOpacity
                        style={styles.fullButton}
                        onPress={() => {/* Open full policy in browser */ }}
                    >
                        <Text style={styles.fullButtonText}>View Full Privacy Policy</Text>
                        <Ionicons name="open-outline" size={20} color="#7ED957" />
                    </TouchableOpacity>
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
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#2A2A2A",
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 24,
        paddingVertical: 24,
        paddingBottom: 40,
    },
    updated: {
        fontSize: 14,
        color: "#9CA3AF",
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginTop: 24,
        marginBottom: 12,
    },
    subsectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
        marginTop: 16,
        marginBottom: 8,
    },
    text: {
        fontSize: 15,
        color: "#D1D5DB",
        lineHeight: 24,
        marginBottom: 12,
    },
    fullButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(126, 217, 87, 0.1)",
        borderRadius: 12,
        paddingVertical: 16,
        marginTop: 32,
        gap: 8,
    },
    fullButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#7ED957",
    },
})
