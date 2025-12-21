import { useState } from "react"
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Share, Alert } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Clipboard from "expo-clipboard"
import * as Haptics from "expo-haptics"
import QRCode from "react-native-qrcode-svg"
import { useUserPreferences } from "@/lib/user-preferences"

type InviteMode = "friends" | "clients" | "both"

interface InviteConfig {
    mode: InviteMode
    title: string
    subtitle: string
    linkType: string
    benefits: string[]
    clientBenefits?: string[] // Added clientBenefits
    ctaText: string
    color: string
    icon: string
}

const getInviteConfig = (userType: string | null): InviteConfig => {
    switch (userType) {
        case "trainer":
            return {
                mode: "clients",
                title: "Grow Your Client Base",
                subtitle: "Invite athletes to train with you",
                linkType: "coach",
                benefits: [
                    "Easy online booking - no texts/calls",
                    "Get paid instantly via Stripe",
                    "Build your review count faster",
                    "Rise in local trainer rankings",
                ],
                clientBenefits: [
                    "Book sessions in 30 seconds",
                    "Find your sessions on the map",
                    "Track their progress over time",
                    "Message you directly in app",
                ],
                ctaText: "Invite Athletes",
                color: "#7ED957",
                icon: "fitness",
            }
        case "instructor":
            return {
                mode: "clients",
                title: "Build Your Following",
                subtitle: "Invite students to your classes",
                linkType: "instructor",
                benefits: [
                    "Students book classes instantly",
                    "Get paid per booking automatically",
                    "Build your rating with reviews",
                    "Fill classes faster than ever",
                ],
                clientBenefits: [
                    "Book classes in seconds",
                    "Get reminded before class",
                    "Navigate to studio easily",
                    "Save you as a favorite",
                ],
                ctaText: "Invite Students",
                color: "#8B5CF6",
                icon: "sparkles",
            }
        case "both":
            return {
                mode: "both",
                title: "Grow Your Network",
                subtitle: "Invite players AND clients",
                linkType: "pro",
                benefits: [
                    "Find players when you want to play",
                    "Find clients when you coach",
                    "Get notified of friend activity",
                    "Earn Ambassador badge + 100 XP",
                ],
                ctaText: "Invite Anyone",
                color: "#06B6D4",
                icon: "sync",
            }
        default: // player
            return {
                mode: "friends",
                title: "Never Play Alone",
                subtitle: "Invite friends to find games with you",
                linkType: "player",
                benefits: [
                    "See when friends are at courts",
                    "Get notified when they check in",
                    "Challenge them to matches",
                    "Coordinate group games easily",
                ],
                ctaText: "Invite Friends",
                color: "#FF6B35",
                icon: "basketball",
            }
    }
}

export default function InviteScreen() {
    const { preferences } = useUserPreferences()
    const config = getInviteConfig(preferences.userType)
    const [showQR, setShowQR] = useState(false)
    const [selectedTab, setSelectedTab] = useState<"friends" | "clients">("friends")

    // Generate unique invite link
    const userId = "user123" // Would come from auth
    const inviteCode = `GR-${config.linkType.toUpperCase()}-${userId.slice(-6).toUpperCase()}`
    const inviteLink = `https://goodrunss.com/join?ref=${inviteCode}&type=${config.linkType}`

    const copyToClipboard = async () => {
        await Clipboard.setStringAsync(inviteLink)
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        Alert.alert("Copied!", "Invite link copied to clipboard")
    }

    const shareInvite = async (platform?: string) => {
        const message = config.mode === "clients"
            ? `Train with me on GoodRunss! Use my code ${inviteCode} to book your first session. ${inviteLink}`
            : `Join me on GoodRunss! Use my code ${inviteCode} to find games and players near you. ${inviteLink}`

        try {
            await Share.share({
                message,
                url: inviteLink,
            })
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        } catch (error) {
            console.error("Error sharing:", error)
        }
    }

    const shareToSMS = async () => {
        const message = config.mode === "clients"
            ? `Hey! Download GoodRunss and book a training session with me: ${inviteLink}`
            : `Hey! Download GoodRunss and let's find games together: ${inviteLink}`

        try {
            await Share.share({ message })
        } catch (error) {
            console.error("Error sharing:", error)
        }
    }

    // For "Both" users, allow toggling between friends and clients
    const renderDualModeTabs = () => {
        if (config.mode !== "both") return null

        return (
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, selectedTab === "friends" && styles.tabActive]}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                        setSelectedTab("friends")
                    }}
                >
                    <Ionicons
                        name="people"
                        size={18}
                        color={selectedTab === "friends" ? "#7ED957" : "#666"}
                    />
                    <Text style={[styles.tabText, selectedTab === "friends" && styles.tabTextActive]}>
                        Find Players
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, selectedTab === "clients" && styles.tabActive]}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                        setSelectedTab("clients")
                    }}
                >
                    <Ionicons
                        name="school"
                        size={18}
                        color={selectedTab === "clients" ? "#7ED957" : "#666"}
                    />
                    <Text style={[styles.tabText, selectedTab === "clients" && styles.tabTextActive]}>
                        Get Clients
                    </Text>
                </TouchableOpacity>
            </View>
        )
    }

    const getCurrentTitle = () => {
        if (config.mode === "both") {
            return selectedTab === "friends" ? "Invite Players" : "Invite Clients"
        }
        return config.title
    }

    const getCurrentSubtitle = () => {
        if (config.mode === "both") {
            return selectedTab === "friends"
                ? "Find people to play with"
                : "Grow your coaching business"
        }
        return config.subtitle
    }

    return (
        <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Invite</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* Hero Section */}
                    <View style={styles.heroSection}>
                        <View style={[styles.heroIcon, { backgroundColor: `${config.color}20` }]}>
                            <Ionicons name={config.icon as any} size={40} color={config.color} />
                        </View>
                        <Text style={styles.heroTitle}>{getCurrentTitle()}</Text>
                        <Text style={styles.heroSubtitle}>{getCurrentSubtitle()}</Text>
                    </View>

                    {/* Dual Mode Tabs for "Both" users */}
                    {renderDualModeTabs()}

                    {/* Your Benefits */}
                    <View style={styles.benefitsCard}>
                        <View style={styles.benefitsTitleRow}>
                            <Ionicons name="sparkles" size={16} color="#7ED957" />
                            <Text style={styles.benefitsTitle}>What YOU Get:</Text>
                        </View>
                        {config.benefits.map((benefit, index) => (
                            <View key={index} style={styles.benefitRow}>
                                <Ionicons name="checkmark-circle" size={20} color="#7ED957" />
                                <Text style={styles.benefitText}>{benefit}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Client Benefits - Only show for trainers/instructors */}
                    {config.clientBenefits && (
                        <View style={[styles.benefitsCard, { backgroundColor: '#1E293B' }]}>
                            <View style={styles.benefitsTitleRow}>
                                <Ionicons name="gift-outline" size={16} color="#8B5CF6" />
                                <Text style={styles.benefitsTitle}>What THEY Get:</Text>
                            </View>
                            {config.clientBenefits.map((benefit, index) => (
                                <View key={index} style={styles.benefitRow}>
                                    <Ionicons name="gift" size={20} color="#8B5CF6" />
                                    <Text style={styles.benefitText}>{benefit}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Invite Code */}
                    <View style={styles.codeCard}>
                        <Text style={styles.codeLabel}>Your Invite Code</Text>
                        <Text style={styles.codeText}>{inviteCode}</Text>
                        <TouchableOpacity onPress={copyToClipboard} style={styles.copyButton}>
                            <Ionicons name="copy" size={18} color="#7ED957" />
                            <Text style={styles.copyButtonText}>Copy Link</Text>
                        </TouchableOpacity>
                    </View>

                    {/* QR Code Toggle */}
                    <TouchableOpacity
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                            setShowQR(!showQR)
                        }}
                        style={styles.qrToggle}
                    >
                        <Ionicons name="qr-code" size={20} color="#7ED957" />
                        <Text style={styles.qrToggleText}>
                            {showQR ? "Hide QR Code" : "Show QR Code"}
                        </Text>
                        <Ionicons name={showQR ? "chevron-up" : "chevron-down"} size={20} color="#666" />
                    </TouchableOpacity>

                    {showQR && (
                        <View style={styles.qrContainer}>
                            <View style={styles.qrCode}>
                                <QRCode value={inviteLink} size={180} backgroundColor="#FFF" />
                            </View>
                            <Text style={styles.qrHint}>Scan to join GoodRunss</Text>
                        </View>
                    )}

                    {/* Share Buttons */}
                    <View style={styles.shareSection}>
                        <Text style={styles.shareTitle}>Share via</Text>
                        <View style={styles.shareGrid}>
                            <TouchableOpacity
                                style={[styles.shareButton, { backgroundColor: "#25D366" }]}
                                onPress={() => shareInvite("whatsapp")}
                            >
                                <Ionicons name="logo-whatsapp" size={24} color="#FFF" />
                                <Text style={styles.shareButtonText}>WhatsApp</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.shareButton, { backgroundColor: "#1DA1F2" }]}
                                onPress={() => shareInvite("twitter")}
                            >
                                <Ionicons name="logo-twitter" size={24} color="#FFF" />
                                <Text style={styles.shareButtonText}>Twitter</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.shareButton, { backgroundColor: "#E1306C" }]}
                                onPress={() => shareInvite("instagram")}
                            >
                                <Ionicons name="logo-instagram" size={24} color="#FFF" />
                                <Text style={styles.shareButtonText}>Instagram</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.shareButton, { backgroundColor: "#34C759" }]}
                                onPress={shareToSMS}
                            >
                                <Ionicons name="chatbubble" size={24} color="#FFF" />
                                <Text style={styles.shareButtonText}>SMS</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Main CTA */}
                        <TouchableOpacity
                            style={[styles.mainCta, { backgroundColor: config.color }]}
                            onPress={() => shareInvite()}
                        >
                            <Ionicons name="share-social" size={20} color="#000" />
                            <Text style={styles.mainCtaText}>{config.ctaText}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Stats */}
                    <View style={styles.statsCard}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>0</Text>
                            <Text style={styles.statLabel}>Invites Sent</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>$0</Text>
                            <Text style={styles.statLabel}>Credits Earned</Text>
                        </View>
                    </View>

                    <View style={{ height: 40 }} />
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
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#222",
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFF",
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
    },
    heroSection: {
        alignItems: "center",
        paddingVertical: 32,
    },
    heroIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#FFF",
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 16,
        color: "#9CA3AF",
        textAlign: "center",
    },
    tabContainer: {
        flexDirection: "row",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 4,
        marginBottom: 24,
    },
    tab: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        borderRadius: 10,
        gap: 8,
    },
    tabActive: {
        backgroundColor: "#222",
    },
    tabText: {
        fontSize: 14,
        color: "#666",
        fontWeight: "600",
    },
    tabTextActive: {
        color: "#7ED957",
    },
    benefitsCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    benefitsTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
    },
    benefitsTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#9CA3AF",
    },
    benefitRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 8,
    },
    benefitText: {
        fontSize: 15,
        color: "#FFF",
    },
    codeCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 20,
        alignItems: "center",
        marginBottom: 16,
    },
    codeLabel: {
        fontSize: 12,
        color: "#666",
        marginBottom: 8,
    },
    codeText: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#7ED957",
        letterSpacing: 2,
        marginBottom: 16,
    },
    copyButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(126, 217, 87, 0.1)",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        gap: 8,
    },
    copyButtonText: {
        fontSize: 14,
        color: "#7ED957",
        fontWeight: "600",
    },
    qrToggle: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        gap: 8,
    },
    qrToggleText: {
        fontSize: 14,
        color: "#7ED957",
        fontWeight: "500",
    },
    qrContainer: {
        alignItems: "center",
        marginVertical: 16,
    },
    qrCode: {
        backgroundColor: "#FFF",
        padding: 16,
        borderRadius: 16,
    },
    qrHint: {
        marginTop: 12,
        fontSize: 13,
        color: "#666",
    },
    shareSection: {
        marginTop: 24,
    },
    shareTitle: {
        fontSize: 14,
        color: "#666",
        marginBottom: 12,
    },
    shareGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginBottom: 16,
    },
    shareButton: {
        flex: 1,
        minWidth: "45%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    shareButtonText: {
        fontSize: 14,
        color: "#FFF",
        fontWeight: "600",
    },
    mainCta: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    mainCtaText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#000",
    },
    statsCard: {
        flexDirection: "row",
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 20,
        marginTop: 24,
    },
    statItem: {
        flex: 1,
        alignItems: "center",
    },
    statValue: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#7ED957",
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: "#666",
    },
    statDivider: {
        width: 1,
        backgroundColor: "#333",
    },
})
