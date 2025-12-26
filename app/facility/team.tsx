/**
 * Facility Team Management Screen
 * Invite and manage employees (managers, staff) with role-based access
 */

import React, { useState, useCallback } from "react"
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    ActivityIndicator,
    Alert,
    Modal,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router, useLocalSearchParams, useFocusEffect } from "expo-router"
import * as Haptics from "expo-haptics"

import { useAuth } from "@/lib/auth-context"
import { facilityService, FacilityTeamMember, TeamRole } from "@/lib/services/facility-service"

const ROLE_INFO: Record<TeamRole, { label: string; description: string; color: string; icon: string }> = {
    owner: {
        label: "Owner",
        description: "Full access to all features",
        color: "#FFD700",
        icon: "star",
    },
    manager: {
        label: "Manager",
        description: "Manage bookings, view revenue, quick block",
        color: "#7ED957",
        icon: "shield-checkmark",
    },
    staff: {
        label: "Staff",
        description: "View bookings, quick block only",
        color: "#888",
        icon: "person",
    },
}

export default function TeamScreen() {
    const { user } = useAuth()
    const { facilityId } = useLocalSearchParams<{ facilityId: string }>()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [team, setTeam] = useState<FacilityTeamMember[]>([])
    const [facilityName, setFacilityName] = useState("")

    // Invite modal
    const [showInviteModal, setShowInviteModal] = useState(false)
    const [inviteName, setInviteName] = useState("")
    const [inviteEmail, setInviteEmail] = useState("")
    const [inviteRole, setInviteRole] = useState<TeamRole>("staff")

    useFocusEffect(
        useCallback(() => {
            loadTeam()
        }, [facilityId])
    )

    const loadTeam = async () => {
        if (!facilityId) return
        setLoading(true)

        try {
            const facility = await facilityService.getClaimedFacility(facilityId)
            if (facility) {
                setFacilityName(facility.businessName)
                setTeam(facility.team || [])
            }
        } catch (error) {
            console.error("Error loading team:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleInvite = async () => {
        if (!facilityId || !inviteName.trim() || !inviteEmail.trim()) return

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        setSaving(true)

        try {
            const memberId = await facilityService.inviteTeamMember(
                facilityId,
                inviteEmail.trim(),
                inviteName.trim(),
                inviteRole
            )

            if (memberId) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                Alert.alert(
                    "Invite Sent! ✉️",
                    `${inviteName} will receive an email to join your team as ${ROLE_INFO[inviteRole].label}.`
                )
                setShowInviteModal(false)
                setInviteName("")
                setInviteEmail("")
                setInviteRole("staff")
                loadTeam()
            } else {
                Alert.alert("Error", "This email is already on your team.")
            }
        } catch (error) {
            Alert.alert("Error", "Failed to send invite")
        } finally {
            setSaving(false)
        }
    }

    const handleRemoveMember = (member: FacilityTeamMember) => {
        Alert.alert(
            "Remove Team Member",
            `Remove ${member.name} from your team?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                        try {
                            await facilityService.removeTeamMember(facilityId!, member.id)
                            loadTeam()
                        } catch (error) {
                            Alert.alert("Error", "Failed to remove team member")
                        }
                    },
                },
            ]
        )
    }

    const handleChangeRole = (member: FacilityTeamMember, newRole: TeamRole) => {
        Alert.alert(
            "Change Role",
            `Change ${member.name}'s role to ${ROLE_INFO[newRole].label}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Change",
                    onPress: async () => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                        try {
                            await facilityService.updateTeamMemberRole(facilityId!, member.id, newRole)
                            loadTeam()
                        } catch (error) {
                            Alert.alert("Error", "Failed to update role")
                        }
                    },
                },
            ]
        )
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7ED957" />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={["#0A0A0A", "#111"]} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Team</Text>
                        <Text style={styles.headerSubtitle}>{facilityName}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                            setShowInviteModal(true)
                        }}
                    >
                        <Ionicons name="person-add" size={20} color="#7ED957" />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    {/* Info Banner */}
                    <View style={styles.infoBanner}>
                        <Ionicons name="people" size={24} color="#7ED957" />
                        <View style={styles.infoBannerText}>
                            <Text style={styles.infoBannerTitle}>Delegate with Confidence</Text>
                            <Text style={styles.infoBannerDesc}>
                                Add managers and staff to help run your facility. Each role has different permissions.
                            </Text>
                        </View>
                    </View>

                    {/* Owner Card */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Owner</Text>
                        <View style={styles.memberCard}>
                            <View style={[styles.roleIcon, { backgroundColor: "rgba(255, 215, 0, 0.2)" }]}>
                                <Ionicons name="star" size={20} color="#FFD700" />
                            </View>
                            <View style={styles.memberInfo}>
                                <Text style={styles.memberName}>You</Text>
                                <Text style={styles.memberEmail}>{user?.email}</Text>
                            </View>
                            <View style={[styles.roleBadge, { backgroundColor: "rgba(255, 215, 0, 0.15)" }]}>
                                <Text style={[styles.roleBadgeText, { color: "#FFD700" }]}>Owner</Text>
                            </View>
                        </View>
                    </View>

                    {/* Team Members */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Team Members ({team.length})</Text>

                        {team.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="people-outline" size={48} color="#333" />
                                <Text style={styles.emptyTitle}>No team members yet</Text>
                                <Text style={styles.emptyDesc}>
                                    Invite managers or staff to help manage bookings
                                </Text>
                                <TouchableOpacity
                                    style={styles.inviteBtn}
                                    onPress={() => setShowInviteModal(true)}
                                >
                                    <Ionicons name="person-add" size={18} color="#000" />
                                    <Text style={styles.inviteBtnText}>Invite Team Member</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            team.map((member) => (
                                <View key={member.id} style={styles.memberCard}>
                                    <View style={[styles.roleIcon, { backgroundColor: `${ROLE_INFO[member.role].color}20` }]}>
                                        <Ionicons name={ROLE_INFO[member.role].icon as any} size={20} color={ROLE_INFO[member.role].color} />
                                    </View>
                                    <View style={styles.memberInfo}>
                                        <Text style={styles.memberName}>{member.name}</Text>
                                        <Text style={styles.memberEmail}>{member.email}</Text>
                                        {member.status === "pending" && (
                                            <View style={styles.pendingBadge}>
                                                <Ionicons name="time-outline" size={12} color="#F97316" />
                                                <Text style={styles.pendingText}>Invite Pending</Text>
                                            </View>
                                        )}
                                    </View>
                                    <TouchableOpacity
                                        style={styles.memberActions}
                                        onPress={() => {
                                            Alert.alert(
                                                member.name,
                                                `Role: ${ROLE_INFO[member.role].label}`,
                                                [
                                                    { text: "Cancel", style: "cancel" },
                                                    {
                                                        text: "Change to Manager",
                                                        onPress: () => handleChangeRole(member, "manager"),
                                                    },
                                                    {
                                                        text: "Change to Staff",
                                                        onPress: () => handleChangeRole(member, "staff"),
                                                    },
                                                    {
                                                        text: "Remove",
                                                        style: "destructive",
                                                        onPress: () => handleRemoveMember(member),
                                                    },
                                                ]
                                            )
                                        }}
                                    >
                                        <Ionicons name="ellipsis-horizontal" size={20} color="#888" />
                                    </TouchableOpacity>
                                </View>
                            ))
                        )}
                    </View>

                    {/* Role Permissions */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Role Permissions</Text>
                        <View style={styles.permissionsCard}>
                            {(["manager", "staff"] as TeamRole[]).map((role) => (
                                <View key={role} style={styles.permissionRow}>
                                    <View style={[styles.roleIcon, { backgroundColor: `${ROLE_INFO[role].color}20` }]}>
                                        <Ionicons name={ROLE_INFO[role].icon as any} size={16} color={ROLE_INFO[role].color} />
                                    </View>
                                    <View style={styles.permissionInfo}>
                                        <Text style={styles.permissionTitle}>{ROLE_INFO[role].label}</Text>
                                        <Text style={styles.permissionDesc}>{ROLE_INFO[role].description}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>

            {/* Invite Modal */}
            <Modal visible={showInviteModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Invite Team Member</Text>
                            <TouchableOpacity onPress={() => setShowInviteModal(false)}>
                                <Ionicons name="close" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={styles.input}
                            value={inviteName}
                            onChangeText={setInviteName}
                            placeholder="Name"
                            placeholderTextColor="#666"
                        />

                        <TextInput
                            style={styles.input}
                            value={inviteEmail}
                            onChangeText={setInviteEmail}
                            placeholder="Email"
                            placeholderTextColor="#666"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <Text style={styles.selectLabel}>Select Role</Text>
                        <View style={styles.roleOptions}>
                            {(["manager", "staff"] as TeamRole[]).map((role) => (
                                <TouchableOpacity
                                    key={role}
                                    style={[styles.roleOption, inviteRole === role && styles.roleOptionSelected]}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                        setInviteRole(role)
                                    }}
                                >
                                    <Ionicons
                                        name={ROLE_INFO[role].icon as any}
                                        size={24}
                                        color={inviteRole === role ? "#000" : ROLE_INFO[role].color}
                                    />
                                    <Text style={[styles.roleOptionTitle, inviteRole === role && { color: "#000" }]}>
                                        {ROLE_INFO[role].label}
                                    </Text>
                                    <Text style={[styles.roleOptionDesc, inviteRole === role && { color: "#333" }]}>
                                        {ROLE_INFO[role].description}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            style={[styles.sendInviteBtn, (!inviteName.trim() || !inviteEmail.trim()) && styles.sendInviteBtnDisabled]}
                            disabled={!inviteName.trim() || !inviteEmail.trim() || saving}
                            onPress={handleInvite}
                        >
                            {saving ? (
                                <ActivityIndicator color="#000" />
                            ) : (
                                <>
                                    <Ionicons name="send" size={18} color="#000" />
                                    <Text style={styles.sendInviteBtnText}>Send Invite</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0A0A0A" },
    loadingContainer: { flex: 1, backgroundColor: "#0A0A0A", justifyContent: "center", alignItems: "center" },
    safeArea: { flex: 1 },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#1A1A1A",
        alignItems: "center",
        justifyContent: "center",
    },
    headerCenter: { alignItems: "center" },
    headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
    headerSubtitle: { color: "#888", fontSize: 12, marginTop: 2 },
    addBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(126, 217, 87, 0.1)",
        alignItems: "center",
        justifyContent: "center",
    },

    content: { paddingHorizontal: 20, paddingBottom: 40 },

    infoBanner: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(126, 217, 87, 0.08)",
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
    },
    infoBannerText: { marginLeft: 14, flex: 1 },
    infoBannerTitle: { color: "#FFF", fontSize: 16, fontWeight: "600", marginBottom: 4 },
    infoBannerDesc: { color: "#888", fontSize: 14, lineHeight: 20 },

    section: { marginBottom: 24 },
    sectionTitle: { color: "#888", fontSize: 12, fontWeight: "600", marginBottom: 12, textTransform: "uppercase" },

    memberCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
    },
    roleIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
    },
    memberInfo: { flex: 1, marginLeft: 14 },
    memberName: { color: "#FFF", fontSize: 16, fontWeight: "600" },
    memberEmail: { color: "#888", fontSize: 14, marginTop: 2 },
    roleBadge: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
    },
    roleBadgeText: { fontSize: 12, fontWeight: "600" },
    pendingBadge: { flexDirection: "row", alignItems: "center", marginTop: 4 },
    pendingText: { color: "#F97316", fontSize: 12, marginLeft: 4 },
    memberActions: { padding: 8 },

    emptyState: { alignItems: "center", paddingVertical: 40 },
    emptyTitle: { color: "#FFF", fontSize: 18, fontWeight: "600", marginTop: 16 },
    emptyDesc: { color: "#888", fontSize: 14, marginTop: 8, textAlign: "center" },
    inviteBtn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#7ED957",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 20,
        marginTop: 20,
    },
    inviteBtnText: { color: "#000", fontSize: 14, fontWeight: "700", marginLeft: 8 },

    permissionsCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
    },
    permissionRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#222",
    },
    permissionInfo: { flex: 1, marginLeft: 14 },
    permissionTitle: { color: "#FFF", fontSize: 14, fontWeight: "600" },
    permissionDesc: { color: "#888", fontSize: 12, marginTop: 2 },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        justifyContent: "flex-end",
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
        marginBottom: 24,
    },
    modalTitle: { color: "#FFF", fontSize: 20, fontWeight: "bold" },

    input: {
        backgroundColor: "#0A0A0A",
        borderRadius: 12,
        padding: 16,
        color: "#FFF",
        fontSize: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#333",
    },
    selectLabel: { color: "#888", fontSize: 12, marginTop: 8, marginBottom: 12 },

    roleOptions: { flexDirection: "row", gap: 12, marginBottom: 24 },
    roleOption: {
        flex: 1,
        backgroundColor: "#0A0A0A",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        borderWidth: 2,
        borderColor: "transparent",
    },
    roleOptionSelected: { backgroundColor: "#7ED957", borderColor: "#7ED957" },
    roleOptionTitle: { color: "#FFF", fontSize: 14, fontWeight: "600", marginTop: 8 },
    roleOptionDesc: { color: "#888", fontSize: 11, marginTop: 4, textAlign: "center" },

    sendInviteBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#7ED957",
        borderRadius: 12,
        paddingVertical: 16,
    },
    sendInviteBtnDisabled: { opacity: 0.5 },
    sendInviteBtnText: { color: "#000", fontSize: 16, fontWeight: "bold", marginLeft: 8 },
})
