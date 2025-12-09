/**
 * Pro Priority Waitlist Settings
 * 
 * Instructors can opt-in/out of allowing Pro clients to skip the waitlist
 * - Global setting for all classes
 * - Per-class toggle
 * - Clear explanation of what it means
 */

import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    Switch,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"

import { db } from "@/lib/firebase-config"

// ============================================
// TYPES
// ============================================

export interface ProPrioritySettings {
    allowProPriority: boolean // Global setting
    classOverrides: { [classId: string]: boolean } // Per-class overrides
}

// ============================================
// SERVICE FUNCTIONS
// ============================================

/**
 * Get instructor's Pro priority settings
 */
export async function getProPrioritySettings(instructorId: string): Promise<ProPrioritySettings> {
    if (!db) return { allowProPriority: true, classOverrides: {} }

    try {
        const { doc, getDoc } = await import("firebase/firestore")

        const settingsDoc = await getDoc(doc(db, "instructorSettings", instructorId))

        if (!settingsDoc.exists()) {
            // Default: allow Pro priority
            return { allowProPriority: true, classOverrides: {} }
        }

        const data = settingsDoc.data()
        return {
            allowProPriority: data.allowProPriority ?? true,
            classOverrides: data.proPriorityClassOverrides || {},
        }
    } catch (error) {
        console.error("[ProPriority] getProPrioritySettings error:", error)
        return { allowProPriority: true, classOverrides: {} }
    }
}

/**
 * Update global Pro priority setting
 */
export async function setProPriorityGlobal(
    instructorId: string,
    allow: boolean
): Promise<boolean> {
    if (!db) return false

    try {
        const { doc, setDoc } = await import("firebase/firestore")

        await setDoc(
            doc(db, "instructorSettings", instructorId),
            { allowProPriority: allow },
            { merge: true }
        )

        console.log(`[ProPriority] Set global to ${allow} for instructor ${instructorId}`)
        return true
    } catch (error) {
        console.error("[ProPriority] setProPriorityGlobal error:", error)
        return false
    }
}

/**
 * Override Pro priority for a specific class
 */
export async function setProPriorityForClass(
    instructorId: string,
    classId: string,
    allow: boolean
): Promise<boolean> {
    if (!db) return false

    try {
        const { doc, setDoc } = await import("firebase/firestore")

        await setDoc(
            doc(db, "instructorSettings", instructorId),
            { [`proPriorityClassOverrides.${classId}`]: allow },
            { merge: true }
        )

        console.log(`[ProPriority] Set class ${classId} to ${allow}`)
        return true
    } catch (error) {
        console.error("[ProPriority] setProPriorityForClass error:", error)
        return false
    }
}

/**
 * Check if Pro priority is allowed for a class
 */
export async function isProPriorityAllowed(
    instructorId: string,
    classId: string
): Promise<boolean> {
    const settings = await getProPrioritySettings(instructorId)

    // Check class-specific override first
    if (classId in settings.classOverrides) {
        return settings.classOverrides[classId]
    }

    // Fall back to global setting
    return settings.allowProPriority
}

// ============================================
// HOOK
// ============================================

export function useProPrioritySettings(instructorId: string | undefined) {
    const [settings, setSettings] = useState<ProPrioritySettings>({
        allowProPriority: true,
        classOverrides: {},
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!instructorId) return

        getProPrioritySettings(instructorId).then(s => {
            setSettings(s)
            setLoading(false)
        })
    }, [instructorId])

    const toggleGlobal = async () => {
        if (!instructorId) return

        const newValue = !settings.allowProPriority
        const success = await setProPriorityGlobal(instructorId, newValue)

        if (success) {
            setSettings(s => ({ ...s, allowProPriority: newValue }))
        }
    }

    const toggleForClass = async (classId: string) => {
        if (!instructorId) return

        const currentValue = settings.classOverrides[classId] ?? settings.allowProPriority
        const newValue = !currentValue

        const success = await setProPriorityForClass(instructorId, classId, newValue)

        if (success) {
            setSettings(s => ({
                ...s,
                classOverrides: { ...s.classOverrides, [classId]: newValue },
            }))
        }
    }

    return {
        settings,
        loading,
        toggleGlobal,
        toggleForClass,
    }
}

// ============================================
// UI COMPONENTS
// ============================================

interface ProPriorityToggleProps {
    instructorId: string
}

export function ProPriorityToggle({ instructorId }: ProPriorityToggleProps) {
    const { settings, loading, toggleGlobal } = useProPrioritySettings(instructorId)
    const [showInfo, setShowInfo] = useState(false)

    const handleToggle = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        if (settings.allowProPriority) {
            // Turning OFF - confirm
            Alert.alert(
                "Disable Pro Priority?",
                "Pro clients will no longer get priority in your class waitlists. You'll still receive the revenue share from Pro subscriptions.\n\nYou can always turn this back on.",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Disable",
                        onPress: toggleGlobal,
                        style: "destructive"
                    },
                ]
            )
        } else {
            // Turning ON
            toggleGlobal()
        }
    }

    if (loading) return null

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Ionicons name="flash" size={20} color="#7ED957" />
                    <Text style={styles.title}>Pro Priority Waitlist</Text>
                    <TouchableOpacity onPress={() => setShowInfo(!showInfo)}>
                        <Ionicons
                            name={showInfo ? "close-circle" : "information-circle"}
                            size={20}
                            color="#6B7280"
                        />
                    </TouchableOpacity>
                </View>
                <Switch
                    value={settings.allowProPriority}
                    onValueChange={handleToggle}
                    trackColor={{ false: "#333", true: "#7ED95740" }}
                    thumbColor={settings.allowProPriority ? "#7ED957" : "#6B7280"}
                />
            </View>

            {showInfo && (
                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>What is this?</Text>
                    <Text style={styles.infoText}>
                        When enabled, clients who pay $10/mo for Pro membership get priority
                        in your class waitlists.
                    </Text>

                    <Text style={styles.infoTitle}>How does it work?</Text>
                    <Text style={styles.infoText}>
                        When a spot opens, Pro members waiting are notified before non-Pro members.
                        They still have the same 5-minute window to claim.
                    </Text>

                    <Text style={styles.infoTitle}>What do I get?</Text>
                    <Text style={styles.infoText}>
                        You receive $3/month from each Pro member who books with you,
                        proportionally split based on bookings.
                    </Text>

                    <View style={styles.revenueExample}>
                        <Text style={styles.exampleTitle}>Example:</Text>
                        <Text style={styles.exampleText}>
                            If 20 Pro clients book your classes = ~$60/month extra
                        </Text>
                    </View>
                </View>
            )}

            <Text style={styles.statusText}>
                {settings.allowProPriority
                    ? "✓ Pro clients get priority in waitlists"
                    : "Pro clients wait in normal order"
                }
            </Text>
        </View>
    )
}

interface ClassProPriorityToggleProps {
    instructorId: string
    classId: string
    className: string
}

export function ClassProPriorityToggle({
    instructorId,
    classId,
    className
}: ClassProPriorityToggleProps) {
    const { settings, toggleForClass } = useProPrioritySettings(instructorId)

    const isAllowed = settings.classOverrides[classId] ?? settings.allowProPriority

    const handleToggle = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        toggleForClass(classId)
    }

    return (
        <TouchableOpacity style={styles.classToggle} onPress={handleToggle}>
            <View style={styles.classToggleLeft}>
                <Ionicons
                    name={isAllowed ? "flash" : "flash-off"}
                    size={16}
                    color={isAllowed ? "#7ED957" : "#6B7280"}
                />
                <Text style={styles.classToggleText}>
                    Pro Priority
                </Text>
            </View>
            <View style={[
                styles.classToggleBadge,
                isAllowed ? styles.classToggleBadgeActive : styles.classToggleBadgeInactive
            ]}>
                <Text style={[
                    styles.classToggleBadgeText,
                    isAllowed ? styles.classToggleBadgeTextActive : {}
                ]}>
                    {isAllowed ? "ON" : "OFF"}
                </Text>
            </View>
        </TouchableOpacity>
    )
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: "#252525",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    statusText: {
        fontSize: 13,
        color: "#9CA3AF",
        marginTop: 8,
    },
    infoBox: {
        backgroundColor: "#252525",
        borderRadius: 8,
        padding: 12,
        marginTop: 12,
    },
    infoTitle: {
        fontSize: 13,
        fontWeight: "600",
        color: "#FFFFFF",
        marginTop: 8,
        marginBottom: 4,
    },
    infoText: {
        fontSize: 12,
        color: "#9CA3AF",
        lineHeight: 18,
    },
    revenueExample: {
        backgroundColor: "rgba(126, 217, 87, 0.1)",
        borderRadius: 6,
        padding: 10,
        marginTop: 12,
    },
    exampleTitle: {
        fontSize: 12,
        fontWeight: "600",
        color: "#7ED957",
    },
    exampleText: {
        fontSize: 12,
        color: "#7ED957",
        marginTop: 2,
    },
    classToggle: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#252525",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    classToggleLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    classToggleText: {
        fontSize: 13,
        color: "#9CA3AF",
    },
    classToggleBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
    },
    classToggleBadgeActive: {
        backgroundColor: "rgba(126, 217, 87, 0.2)",
    },
    classToggleBadgeInactive: {
        backgroundColor: "#333",
    },
    classToggleBadgeText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#6B7280",
    },
    classToggleBadgeTextActive: {
        color: "#7ED957",
    },
})

export default {
    ProPriorityToggle,
    ClassProPriorityToggle,
    getProPrioritySettings,
    setProPriorityGlobal,
    setProPriorityForClass,
    isProPriorityAllowed,
    useProPrioritySettings,
}
