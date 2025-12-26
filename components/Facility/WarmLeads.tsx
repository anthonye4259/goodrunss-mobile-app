/**
 * Warm Leads Component
 * 
 * Shows facilities/trainers the players interested in them.
 * Enables sending pings (mini-messages) to engage potential bookings.
 */

import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Modal,
    TextInput,
    ActivityIndicator,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { BlurView } from "expo-blur"
import * as Haptics from "expo-haptics"

import { playerIntentService, WarmLead, INTENT_SIGNALS } from "@/lib/services/player-intent-service"
import { pingService, PING_TEMPLATES, PingTemplateId, PingLimit } from "@/lib/services/ping-service"

interface WarmLeadsProps {
    targetId: string
    targetType: "facility" | "trainer"
    businessName: string
}

export function WarmLeads({ targetId, targetType, businessName }: WarmLeadsProps) {
    const [leads, setLeads] = useState<WarmLead[]>([])
    const [loading, setLoading] = useState(true)
    const [pingLimits, setPingLimits] = useState<PingLimit | null>(null)
    const [showPingModal, setShowPingModal] = useState(false)
    const [selectedLead, setSelectedLead] = useState<WarmLead | null>(null)
    const [selectedTemplate, setSelectedTemplate] = useState<PingTemplateId>("COURT_AVAILABLE")
    const [customMessage, setCustomMessage] = useState("")
    const [sending, setSending] = useState(false)

    useEffect(() => {
        loadData()
    }, [targetId])

    const loadData = async () => {
        setLoading(true)
        try {
            const [leadsData, limitsData] = await Promise.all([
                playerIntentService.getWarmLeads(targetId, targetType),
                pingService.getPingLimits(targetId, targetType),
            ])
            setLeads(leadsData)
            setPingLimits(limitsData)
        } catch (error) {
            console.error("Error loading warm leads:", error)
        } finally {
            setLoading(false)
        }
    }

    const handlePingPress = (lead: WarmLead) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        setSelectedLead(lead)
        setSelectedTemplate(targetType === "trainer" ? "SESSION_REMINDER" : "COURT_AVAILABLE")
        setCustomMessage("")
        setShowPingModal(true)
    }

    const handleSendPing = async () => {
        if (!selectedLead) return

        setSending(true)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)

        try {
            const result = await pingService.sendPing({
                senderId: targetId,
                senderType: targetType,
                senderName: businessName,
                recipientId: selectedLead.playerId,
                recipientName: selectedLead.playerName,
                templateId: selectedTemplate,
                customMessage: selectedTemplate === "CUSTOM" ? customMessage : undefined,
                variables: {
                    playerName: selectedLead.playerName,
                    businessName: businessName,
                    sport: selectedLead.playerSport,
                    time: "5:00 PM", // Would be dynamic
                },
            })

            if (result.success) {
                // Refresh limits
                const newLimits = await pingService.getPingLimits(targetId, targetType)
                setPingLimits(newLimits)
                setShowPingModal(false)
            } else {
                // Show error - would use Alert in real app
                console.error(result.error)
            }
        } catch (error) {
            console.error("Error sending ping:", error)
        } finally {
            setSending(false)
        }
    }

    const templates = pingService.getTemplatesForType(targetType)

    const renderLeadCard = ({ item }: { item: WarmLead }) => (
        <View style={[styles.leadCard, item.isHot && styles.leadCardHot]}>
            <View style={styles.leadHeader}>
                <View style={styles.leadAvatar}>
                    <Ionicons name="person" size={24} color="#7ED957" />
                </View>
                <View style={styles.leadInfo}>
                    <View style={styles.leadNameRow}>
                        <Text style={styles.leadName}>{item.playerName}</Text>
                        {item.isHot && (
                            <View style={styles.hotBadge}>
                                <Ionicons name="flame" size={12} color="#FF6B6B" />
                                <Text style={styles.hotBadgeText}>Hot</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.leadSport}>
                        {item.playerSport} {item.playerRating ? `• ${item.playerRating}` : ""}
                    </Text>
                </View>
                <Text style={styles.leadScore}>+{item.totalScore}</Text>
            </View>

            {/* Intent signals */}
            <View style={styles.signalsRow}>
                {item.signals.slice(0, 3).map((signal, idx) => (
                    <View key={idx} style={styles.signalBadge}>
                        <Text style={styles.signalText}>
                            {playerIntentService.getSignalLabel(signal.signal)}
                        </Text>
                    </View>
                ))}
                {item.signals.length > 3 && (
                    <Text style={styles.moreSignals}>+{item.signals.length - 3} more</Text>
                )}
            </View>

            {/* Actions */}
            <View style={styles.leadActions}>
                <TouchableOpacity
                    style={styles.pingButton}
                    onPress={() => handlePingPress(item)}
                >
                    <Ionicons name="paper-plane" size={16} color="#000" />
                    <Text style={styles.pingButtonText}>Send Ping</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.viewButton}>
                    <Text style={styles.viewButtonText}>View Profile</Text>
                </TouchableOpacity>
            </View>
        </View>
    )

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7ED957" />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            {/* Header with ping limits */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Ionicons name="flame" size={20} color="#FF6B6B" />
                    <Text style={styles.headerTitle}>Warm Leads</Text>
                    <View style={styles.countBadge}>
                        <Text style={styles.countBadgeText}>{leads.length}</Text>
                    </View>
                </View>
                {pingLimits && (
                    <View style={styles.pingLimitBadge}>
                        <Ionicons name="paper-plane" size={14} color="#7ED957" />
                        <Text style={styles.pingLimitText}>
                            {pingLimits.isPremium ? "∞" : `${pingLimits.limit - pingLimits.used}`} pings
                        </Text>
                    </View>
                )}
            </View>

            {leads.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="people-outline" size={48} color="#444" />
                    <Text style={styles.emptyTitle}>No warm leads yet</Text>
                    <Text style={styles.emptySubtext}>
                        As players view your profile and check availability, they'll appear here.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={leads}
                    keyExtractor={(item) => item.playerId}
                    renderItem={renderLeadCard}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                />
            )}

            {/* Ping Modal */}
            <Modal
                visible={showPingModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowPingModal(false)}
            >
                <BlurView intensity={20} style={styles.modalBlur}>
                    <TouchableOpacity
                        style={styles.modalBackdrop}
                        activeOpacity={1}
                        onPress={() => setShowPingModal(false)}
                    />
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Send Ping to {selectedLead?.playerName}
                            </Text>
                            <TouchableOpacity onPress={() => setShowPingModal(false)}>
                                <Ionicons name="close" size={24} color="#888" />
                            </TouchableOpacity>
                        </View>

                        {/* Ping limit warning */}
                        {pingLimits && !pingLimits.isPremium && pingLimits.used >= pingLimits.limit && (
                            <View style={styles.limitWarning}>
                                <Ionicons name="warning" size={20} color="#FF9500" />
                                <Text style={styles.limitWarningText}>
                                    Monthly limit reached. Upgrade to Premium for unlimited pings!
                                </Text>
                            </View>
                        )}

                        {/* Template Selection */}
                        <Text style={styles.sectionLabel}>Choose a message</Text>
                        <View style={styles.templatesGrid}>
                            {templates.map((template) => (
                                <TouchableOpacity
                                    key={template.id}
                                    style={[
                                        styles.templateCard,
                                        (selectedTemplate as string) === template.id.toUpperCase() && styles.templateCardActive,
                                    ]}
                                    onPress={() => setSelectedTemplate(template.id.toUpperCase() as PingTemplateId)}
                                >
                                    <Text style={styles.templateIcon}>{template.icon}</Text>
                                    <Text style={styles.templateTitle}>{template.title}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Custom message input */}
                        {selectedTemplate === "CUSTOM" && (
                            <TextInput
                                style={styles.customInput}
                                placeholder="Type your message..."
                                placeholderTextColor="#666"
                                value={customMessage}
                                onChangeText={setCustomMessage}
                                multiline
                                maxLength={160}
                            />
                        )}

                        {/* Preview */}
                        <View style={styles.previewCard}>
                            <Text style={styles.previewLabel}>Preview</Text>
                            <Text style={styles.previewMessage}>
                                {selectedTemplate === "CUSTOM"
                                    ? customMessage || "Type your message above..."
                                    : PING_TEMPLATES[selectedTemplate]?.message
                                        .replace("{playerName}", selectedLead?.playerName || "Player")
                                        .replace("{businessName}", businessName)
                                        .replace("{sport}", selectedLead?.playerSport || "tennis")
                                        .replace("{time}", "5:00 PM")
                                }
                            </Text>
                        </View>

                        {/* Send Button */}
                        <TouchableOpacity
                            style={[
                                styles.sendButton,
                                (sending || (pingLimits && !pingLimits.isPremium && pingLimits.used >= pingLimits.limit)) && styles.sendButtonDisabled,
                            ]}
                            onPress={handleSendPing}
                            disabled={sending || (pingLimits && !pingLimits.isPremium && pingLimits.used >= pingLimits.limit)}
                        >
                            <LinearGradient
                                colors={["#7ED957", "#4CAF50"]}
                                style={styles.sendButtonGradient}
                            >
                                {sending ? (
                                    <ActivityIndicator color="#000" />
                                ) : (
                                    <>
                                        <Ionicons name="paper-plane" size={20} color="#000" />
                                        <Text style={styles.sendButtonText}>Send Ping</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </BlurView>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    // Header
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFF",
        marginLeft: 8,
    },
    countBadge: {
        backgroundColor: "#FF6B6B",
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginLeft: 8,
    },
    countBadgeText: {
        color: "#FFF",
        fontSize: 12,
        fontWeight: "bold",
    },
    pingLimitBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    pingLimitText: {
        color: "#7ED957",
        fontSize: 13,
        fontWeight: "600",
        marginLeft: 6,
    },

    // List
    listContent: {
        padding: 16,
        gap: 12,
    },

    // Lead Card
    leadCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#333",
    },
    leadCardHot: {
        borderColor: "rgba(255, 107, 107, 0.5)",
    },
    leadHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    leadAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#0A0A0A",
        alignItems: "center",
        justifyContent: "center",
    },
    leadInfo: {
        flex: 1,
        marginLeft: 12,
    },
    leadNameRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    leadName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFF",
    },
    hotBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 107, 107, 0.2)",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        marginLeft: 8,
    },
    hotBadgeText: {
        color: "#FF6B6B",
        fontSize: 11,
        fontWeight: "bold",
        marginLeft: 4,
    },
    leadSport: {
        color: "#888",
        fontSize: 13,
        marginTop: 2,
    },
    leadScore: {
        color: "#7ED957",
        fontSize: 16,
        fontWeight: "bold",
    },

    // Signals
    signalsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 12,
        gap: 8,
    },
    signalBadge: {
        backgroundColor: "#0A0A0A",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    signalText: {
        color: "#888",
        fontSize: 12,
    },
    moreSignals: {
        color: "#666",
        fontSize: 12,
        alignSelf: "center",
    },

    // Actions
    leadActions: {
        flexDirection: "row",
        gap: 12,
    },
    pingButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#7ED957",
        paddingVertical: 12,
        borderRadius: 12,
        gap: 6,
    },
    pingButtonText: {
        color: "#000",
        fontSize: 14,
        fontWeight: "bold",
    },
    viewButton: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0A0A0A",
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#333",
    },
    viewButtonText: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "600",
    },

    // Empty State
    emptyState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFF",
        marginTop: 16,
    },
    emptySubtext: {
        color: "#888",
        textAlign: "center",
        marginTop: 8,
        lineHeight: 20,
    },

    // Modal
    modalBlur: {
        flex: 1,
        justifyContent: "flex-end",
    },
    modalBackdrop: {
        flex: 1,
    },
    modalContent: {
        backgroundColor: "#1A1A1A",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFF",
    },

    // Limit Warning
    limitWarning: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 149, 0, 0.15)",
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
    },
    limitWarningText: {
        color: "#FF9500",
        fontSize: 13,
        marginLeft: 8,
        flex: 1,
    },

    // Templates
    sectionLabel: {
        color: "#888",
        fontSize: 13,
        marginBottom: 12,
    },
    templatesGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginBottom: 16,
    },
    templateCard: {
        width: "47%",
        backgroundColor: "#0A0A0A",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#333",
    },
    templateCardActive: {
        borderColor: "#7ED957",
        backgroundColor: "rgba(126, 217, 87, 0.1)",
    },
    templateIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    templateTitle: {
        color: "#FFF",
        fontSize: 13,
        fontWeight: "600",
        textAlign: "center",
    },

    // Custom Input
    customInput: {
        backgroundColor: "#0A0A0A",
        borderRadius: 12,
        padding: 16,
        color: "#FFF",
        fontSize: 15,
        minHeight: 100,
        textAlignVertical: "top",
        marginBottom: 16,
    },

    // Preview
    previewCard: {
        backgroundColor: "#0A0A0A",
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    previewLabel: {
        color: "#888",
        fontSize: 12,
        marginBottom: 8,
    },
    previewMessage: {
        color: "#FFF",
        fontSize: 14,
        lineHeight: 20,
    },

    // Send Button
    sendButton: {
        borderRadius: 16,
        overflow: "hidden",
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    sendButtonGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 18,
        gap: 10,
    },
    sendButtonText: {
        color: "#000",
        fontSize: 18,
        fontWeight: "bold",
    },
})

export default WarmLeads
