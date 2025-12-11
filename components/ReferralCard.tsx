/**
 * Referral Card Component
 * 
 * Displays user's referral code, stats, and share options.
 * Also handles applying referral codes.
 */

import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Share,
    Alert,
    ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import * as Clipboard from "expo-clipboard"
import { useAuth } from "@/lib/auth-context"
import { referralService, LAUNCH_CODES } from "@/lib/services/referral-service"

interface ReferralCardProps {
    variant?: "share" | "apply" | "full"
    onCodeApplied?: (reward: number) => void
}

export function ReferralCard({ variant = "full", onCodeApplied }: ReferralCardProps) {
    const { user } = useAuth()
    const [myCode, setMyCode] = useState<string | null>(null)
    const [inputCode, setInputCode] = useState("")
    const [loading, setLoading] = useState(true)
    const [applying, setApplying] = useState(false)
    const [stats, setStats] = useState({
        totalReferrals: 0,
        totalEarned: 0,
        pendingRewards: 0,
    })

    useEffect(() => {
        loadReferralData()
    }, [user])

    const loadReferralData = async () => {
        if (!user?.id) {
            setLoading(false)
            return
        }

        try {
            // Get or generate user's code
            let codeData = await referralService.getUserCode(user.id)
            if (!codeData) {
                const newCode = await referralService.generateUserCode(
                    user.id,
                    user.name || "User"
                )
                setMyCode(newCode)
            } else {
                setMyCode(codeData.code)
            }

            // Get stats
            const referralStats = await referralService.getReferralStats(user.id)
            setStats({
                totalReferrals: referralStats.totalReferrals,
                totalEarned: referralStats.totalEarned,
                pendingRewards: referralStats.pendingRewards,
            })
        } catch (error) {
            console.error("Error loading referral data:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCopyCode = async () => {
        if (!myCode) return
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        await Clipboard.setStringAsync(myCode)
        Alert.alert("Copied!", "Your referral code has been copied to clipboard")
    }

    const handleShareCode = async () => {
        if (!myCode) return
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        try {
            await Share.share({
                message: `🏀 Join me on GoodRunss! Use my code ${myCode} and we BOTH get $5! Download: https://goodrunss.com/download`,
            })
        } catch (error) {
            console.error("Share error:", error)
        }
    }

    const handleApplyCode = async () => {
        if (!inputCode.trim() || !user?.id) return

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        setApplying(true)

        try {
            const result = await referralService.applyCode(
                inputCode.trim(),
                user.id,
                user.name || "User"
            )

            if (result.success) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                Alert.alert("🎉 Success!", result.message)
                setInputCode("")
                onCodeApplied?.(result.reward)
            } else {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
                Alert.alert("Oops", result.message)
            }
        } catch (error) {
            Alert.alert("Error", "Failed to apply code. Please try again.")
        } finally {
            setApplying(false)
        }
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#7ED957" />
            </View>
        )
    }

    // Apply-only variant (for onboarding)
    if (variant === "apply") {
        return (
            <View style={styles.applyContainer}>
                <Text style={styles.applyTitle}>Have a referral code?</Text>
                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter code"
                        placeholderTextColor="#666"
                        value={inputCode}
                        onChangeText={setInputCode}
                        autoCapitalize="characters"
                        maxLength={12}
                    />
                    <TouchableOpacity
                        style={[styles.applyButton, !inputCode && styles.applyButtonDisabled]}
                        onPress={handleApplyCode}
                        disabled={!inputCode || applying}
                    >
                        {applying ? (
                            <ActivityIndicator size="small" color="#000" />
                        ) : (
                            <Text style={styles.applyButtonText}>Apply</Text>
                        )}
                    </TouchableOpacity>
                </View>
                <View style={styles.launchCodesHint}>
                    <Ionicons name="gift-outline" size={14} color="#7ED957" />
                    <Text style={styles.hintText}>Try: MYRTLE2024 for $10 launch bonus!</Text>
                </View>
            </View>
        )
    }

    // Share-only variant (compact)
    if (variant === "share") {
        return (
            <View style={styles.shareContainer}>
                <View style={styles.codeDisplay}>
                    <Text style={styles.codeLabel}>Your Code</Text>
                    <Text style={styles.codeText}>{myCode || "---"}</Text>
                </View>
                <TouchableOpacity style={styles.shareButton} onPress={handleShareCode}>
                    <Ionicons name="share-social" size={18} color="#000" />
                    <Text style={styles.shareButtonText}>Share</Text>
                </TouchableOpacity>
            </View>
        )
    }

    // Full variant
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Ionicons name="gift" size={24} color="#7ED957" />
                <Text style={styles.title}>Invite Friends, Earn Rewards</Text>
            </View>

            {/* Your Code Section */}
            <View style={styles.codeSection}>
                <Text style={styles.sectionLabel}>Your Referral Code</Text>
                <View style={styles.codeRow}>
                    <View style={styles.codeBox}>
                        <Text style={styles.codeValue}>{myCode || "---"}</Text>
                    </View>
                    <TouchableOpacity style={styles.iconButton} onPress={handleCopyCode}>
                        <Ionicons name="copy-outline" size={20} color="#7ED957" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={handleShareCode}>
                        <Ionicons name="share-social-outline" size={20} color="#7ED957" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{stats.totalReferrals}</Text>
                    <Text style={styles.statLabel}>Referrals</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>${stats.totalEarned}</Text>
                    <Text style={styles.statLabel}>Earned</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: "#F59E0B" }]}>
                        ${stats.pendingRewards}
                    </Text>
                    <Text style={styles.statLabel}>Pending</Text>
                </View>
            </View>

            {/* How it works */}
            <View style={styles.howItWorks}>
                <Text style={styles.howTitle}>How it works</Text>
                <View style={styles.stepRow}>
                    <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>1</Text>
                    </View>
                    <Text style={styles.stepText}>Share your code with friends</Text>
                </View>
                <View style={styles.stepRow}>
                    <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>2</Text>
                    </View>
                    <Text style={styles.stepText}>They sign up and enter your code</Text>
                </View>
                <View style={styles.stepRow}>
                    <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>3</Text>
                    </View>
                    <Text style={styles.stepText}>You BOTH get $5 in credits! 🎉</Text>
                </View>
            </View>

            {/* Apply Code Section */}
            <View style={styles.applySection}>
                <Text style={styles.sectionLabel}>Have a code?</Text>
                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter referral code"
                        placeholderTextColor="#666"
                        value={inputCode}
                        onChangeText={setInputCode}
                        autoCapitalize="characters"
                        maxLength={12}
                    />
                    <TouchableOpacity
                        style={[styles.applyButton, !inputCode && styles.applyButtonDisabled]}
                        onPress={handleApplyCode}
                        disabled={!inputCode || applying}
                    >
                        {applying ? (
                            <ActivityIndicator size="small" color="#000" />
                        ) : (
                            <Text style={styles.applyButtonText}>Apply</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 16,
        marginVertical: 8,
    },
    loadingContainer: {
        padding: 40,
        alignItems: "center",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    codeSection: {
        marginBottom: 20,
    },
    sectionLabel: {
        fontSize: 12,
        color: "#666",
        marginBottom: 8,
    },
    codeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    codeBox: {
        flex: 1,
        backgroundColor: "#0A0A0A",
        borderWidth: 2,
        borderColor: "#7ED957",
        borderStyle: "dashed",
        borderRadius: 10,
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    codeValue: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#7ED957",
        letterSpacing: 2,
        textAlign: "center",
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(126, 217, 87, 0.1)",
        alignItems: "center",
        justifyContent: "center",
    },
    statsRow: {
        flexDirection: "row",
        backgroundColor: "#0A0A0A",
        borderRadius: 10,
        padding: 14,
        marginBottom: 20,
    },
    statItem: {
        flex: 1,
        alignItems: "center",
    },
    statDivider: {
        width: 1,
        backgroundColor: "#252525",
    },
    statNumber: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#7ED957",
    },
    statLabel: {
        fontSize: 11,
        color: "#666",
        marginTop: 4,
    },
    howItWorks: {
        marginBottom: 20,
    },
    howTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#9CA3AF",
        marginBottom: 12,
    },
    stepRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    stepNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "rgba(126, 217, 87, 0.2)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    stepNumberText: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#7ED957",
    },
    stepText: {
        fontSize: 14,
        color: "#FFFFFF",
    },
    applySection: {
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#252525",
    },
    inputRow: {
        flexDirection: "row",
        gap: 10,
    },
    input: {
        flex: 1,
        backgroundColor: "#0A0A0A",
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#252525",
    },
    applyButton: {
        backgroundColor: "#7ED957",
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    applyButtonDisabled: {
        backgroundColor: "#333",
    },
    applyButtonText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#000",
    },
    // Apply variant styles
    applyContainer: {
        padding: 16,
    },
    applyTitle: {
        fontSize: 14,
        color: "#9CA3AF",
        marginBottom: 10,
    },
    launchCodesHint: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 10,
    },
    hintText: {
        fontSize: 12,
        color: "#7ED957",
    },
    // Share variant styles
    shareContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 14,
        marginHorizontal: 16,
    },
    codeDisplay: {
        flex: 1,
    },
    codeLabel: {
        fontSize: 11,
        color: "#666",
    },
    codeText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#7ED957",
        letterSpacing: 1,
    },
    shareButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#7ED957",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        gap: 6,
    },
    shareButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#000",
    },
})
