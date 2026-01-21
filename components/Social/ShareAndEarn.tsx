/**
 * Share & Earn - Referral Card
 * 
 * Trainers invite other trainers and both get 1 month free.
 */

import { View, Text, TouchableOpacity, StyleSheet, Share, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as Clipboard from "expo-clipboard"
import * as Haptics from "expo-haptics"
import { useAuth } from "@/lib/auth-context"

type Props = {
    variant?: "card" | "button"
}

export function ShareAndEarn({ variant = "card" }: Props) {
    const { user } = useAuth()
    const referralCode = user?.id?.slice(0, 8).toUpperCase() || "DALAI"
    const referralLink = `https://dalai.app/signup?ref=${referralCode}`

    const handleShare = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        try {
            await Share.share({
                title: "Get 1 Month Free",
                message: `Join me on Dal! Use my code ${referralCode} and we both get 1 month free.\n\n${referralLink}`,
                url: referralLink,
            })
        } catch (error) {
            Alert.alert("Error", "Failed to share")
        }
    }

    const handleCopy = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        await Clipboard.setStringAsync(referralCode)
        Alert.alert("Copied! 🎉", `Referral code ${referralCode} copied to clipboard`)
    }

    if (variant === "button") {
        return (
            <TouchableOpacity style={styles.button} onPress={handleShare}>
                <Ionicons name="gift-outline" size={16} color="#7ED957" />
                <Text style={styles.buttonText}>Share & Earn</Text>
            </TouchableOpacity>
        )
    }

    return (
        <View style={styles.card}>
            <LinearGradient
                colors={["#7ED95720", "#22C55E10"]}
                style={styles.gradient}
            >
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="gift" size={24} color="#7ED957" />
                    </View>
                    <View style={styles.headerText}>
                        <Text style={styles.title}>Share & Earn</Text>
                        <Text style={styles.subtitle}>Invite a pro, both get 1 month free</Text>
                    </View>
                </View>

                <View style={styles.codeBox}>
                    <Text style={styles.codeLabel}>Your Referral Code</Text>
                    <Text style={styles.code}>{referralCode}</Text>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
                        <Ionicons name="copy" size={16} color="#FFF" />
                        <Text style={styles.copyText}>Copy Code</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                        <Ionicons name="share-social" size={16} color="#000" />
                        <Text style={styles.shareText}>Share</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.terms}>
                    <Ionicons name="information-circle-outline" size={14} color="#6B7280" />
                    <Text style={styles.termsText}>
                        Credit applied when they subscribe
                    </Text>
                </View>
            </LinearGradient>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        overflow: "hidden",
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#7ED95730",
    },
    gradient: {
        padding: 20,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: "#7ED95720",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 14,
    },
    headerText: {
        flex: 1,
    },
    title: {
        color: "#FFF",
        fontSize: 18,
        fontWeight: "700",
    },
    subtitle: {
        color: "#9CA3AF",
        fontSize: 13,
        marginTop: 2,
    },
    codeBox: {
        backgroundColor: "#0A0A0A",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        alignItems: "center",
    },
    codeLabel: {
        color: "#6B7280",
        fontSize: 12,
        marginBottom: 4,
    },
    code: {
        color: "#7ED957",
        fontSize: 28,
        fontWeight: "800",
        letterSpacing: 4,
        fontFamily: "monospace",
    },
    actions: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 12,
    },
    copyButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        backgroundColor: "#333",
        paddingVertical: 14,
        borderRadius: 12,
    },
    copyText: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "600",
    },
    shareButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        backgroundColor: "#7ED957",
        paddingVertical: 14,
        borderRadius: 12,
    },
    shareText: {
        color: "#000",
        fontSize: 14,
        fontWeight: "600",
    },
    terms: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
    },
    termsText: {
        color: "#6B7280",
        fontSize: 12,
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#7ED95720",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#7ED95740",
    },
    buttonText: {
        color: "#7ED957",
        fontSize: 13,
        fontWeight: "600",
    },
})

export default ShareAndEarn
