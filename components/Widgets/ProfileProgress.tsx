/**
 * Profile Progress Bar
 * 
 * Shows completion percentage and prompts user to complete profile.
 */

import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"

type Props = {
    name?: string
    hasPhoto?: boolean
    hasBio?: boolean
    hasPreferredSport?: boolean
    hasLocation?: boolean
}

export function ProfileProgress({ name, hasPhoto, hasBio, hasPreferredSport, hasLocation }: Props) {
    const items = [
        { done: !!name, label: "Name" },
        { done: !!hasPhoto, label: "Photo" },
        { done: !!hasBio, label: "Bio" },
        { done: !!hasPreferredSport, label: "Sport" },
        { done: !!hasLocation, label: "Location" },
    ]

    const completedCount = items.filter(i => i.done).length
    const percentage = (completedCount / items.length) * 100

    if (percentage === 100) return null // Don't show if complete

    const nextStep = items.find(i => !i.done)

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        router.push("/settings/profile")
    }

    return (
        <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.9}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Ionicons name="person-circle" size={20} color="#8B5CF6" />
                    <Text style={styles.title}>Complete Your Profile</Text>
                </View>
                <Text style={styles.percentage}>{Math.round(percentage)}%</Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${percentage}%` }]} />
            </View>

            {/* Progress Dots */}
            <View style={styles.dotsContainer}>
                {items.map((item, index) => (
                    <View key={index} style={styles.dotItem}>
                        <View style={[styles.dot, item.done && styles.dotComplete]}>
                            {item.done && <Ionicons name="checkmark" size={10} color="#FFF" />}
                        </View>
                        <Text style={[styles.dotLabel, item.done && styles.dotLabelComplete]}>
                            {item.label}
                        </Text>
                    </View>
                ))}
            </View>

            {nextStep && (
                <View style={styles.nextStep}>
                    <Text style={styles.nextStepText}>Next: Add your {nextStep.label.toLowerCase()}</Text>
                    <Ionicons name="chevron-forward" size={16} color="#7ED957" />
                </View>
            )}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#141414",
        borderRadius: 20,
        padding: 16,
        marginHorizontal: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#8B5CF640",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    title: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "600",
    },
    percentage: {
        color: "#8B5CF6",
        fontSize: 14,
        fontWeight: "700",
    },
    progressTrack: {
        height: 6,
        backgroundColor: "#252525",
        borderRadius: 3,
        overflow: "hidden",
        marginBottom: 12,
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#8B5CF6",
        borderRadius: 3,
    },
    dotsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    dotItem: {
        alignItems: "center",
    },
    dot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "#252525",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 4,
    },
    dotComplete: {
        backgroundColor: "#8B5CF6",
    },
    dotLabel: {
        color: "#666",
        fontSize: 10,
    },
    dotLabelComplete: {
        color: "#8B5CF6",
    },
    nextStep: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: "#252525",
    },
    nextStepText: {
        color: "#7ED957",
        fontSize: 13,
        fontWeight: "500",
    },
})

export default ProfileProgress
