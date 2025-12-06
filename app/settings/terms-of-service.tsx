import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"

export default function TermsOfServiceScreen() {
    return (
        <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Terms of Service</Text>
                </View>

                <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                    <Text style={styles.updated}>Last Updated: December 6, 2024</Text>

                    <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
                    <Text style={styles.text}>
                        By accessing or using the GoodRunss mobile application, you agree to be bound by these Terms of Service. If you do not agree, do not use the App.
                    </Text>

                    <Text style={styles.sectionTitle}>2. Description of Service</Text>
                    <Text style={styles.text}>
                        GoodRunss connects users with:{"\n\n"}
                        • Sports venues, courts, and facilities{"\n"}
                        • Personal trainers and coaches{"\n"}
                        • Other players and fitness enthusiasts{"\n"}
                        • AI-powered fitness assistant (GIA){"\n"}
                        • Health and activity tracking
                    </Text>

                    <Text style={styles.sectionTitle}>3. Eligibility</Text>
                    <Text style={styles.text}>
                        You must be:{"\n\n"}
                        • At least 13 years old to use the App{"\n"}
                        • At least 18 years old to book paid services{"\n"}
                        • Able to form a binding contract
                    </Text>

                    <Text style={styles.sectionTitle}>4. User Conduct</Text>
                    <Text style={styles.text}>
                        You agree to:{"\n\n"}
                        • Use the App lawfully and respectfully{"\n"}
                        • Provide accurate information{"\n"}
                        • Honor bookings and commitments{"\n"}
                        • Pay for services you book{"\n\n"}
                        You agree NOT to:{"\n\n"}
                        • Impersonate others{"\n"}
                        • Harass or abuse other users{"\n"}
                        • Post inappropriate content{"\n"}
                        • Attempt to hack or disrupt the App
                    </Text>

                    <Text style={styles.sectionTitle}>5. Bookings and Payments</Text>
                    <Text style={styles.text}>
                        • Bookings are contracts between you and the trainer/venue{"\n"}
                        • Payment processed through Stripe{"\n"}
                        • Cancellation policies vary by provider{"\n"}
                        • Service fees may apply{"\n"}
                        • Refunds subject to provider policies
                    </Text>

                    <Text style={styles.sectionTitle}>6. Health and Safety</Text>
                    <Text style={styles.text}>
                        • GoodRunss is not a medical service{"\n"}
                        • Consult healthcare professionals before exercise{"\n"}
                        • We are not liable for injuries{"\n"}
                        • Users exercise at their own risk{"\n"}
                        • Call 911 for emergencies
                    </Text>

                    <Text style={styles.sectionTitle}>7. AI Assistant (GIA)</Text>
                    <Text style={styles.text}>
                        • GIA provides fitness recommendations{"\n"}
                        • Responses are AI-generated and may not be accurate{"\n"}
                        • Not a substitute for professional advice{"\n"}
                        • Use at your own risk
                    </Text>

                    <Text style={styles.sectionTitle}>8. Limitation of Liability</Text>
                    <Text style={styles.text}>
                        Our liability is limited to the amount you paid in the last 12 months. We are not liable for indirect, incidental, or consequential damages.
                    </Text>

                    <Text style={styles.sectionTitle}>9. Contact</Text>
                    <Text style={styles.text}>
                        For questions about these Terms:{"\n\n"}
                        Email: legal@goodrunss.com{"\n"}
                        Support: support@goodrunss.com
                    </Text>

                    <TouchableOpacity
                        style={styles.fullButton}
                        onPress={() => {/* Open full terms in browser */ }}
                    >
                        <Text style={styles.fullButtonText}>View Full Terms of Service</Text>
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
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginTop: 24,
        marginBottom: 12,
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
