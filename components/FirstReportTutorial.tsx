/**
 * First Report Tutorial Component
 * 
 * Guides first-time reporters through their first report.
 * Shows step-by-step instructions with rewards highlight.
 */

import React, { useState } from "react"
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Dimensions,
    Animated
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import AsyncStorage from "@react-native-async-storage/async-storage"

const { width } = Dimensions.get("window")

interface FirstReportTutorialProps {
    visible: boolean
    onComplete: () => void
    onSkip: () => void
}

const TUTORIAL_STEPS = [
    {
        icon: "location" as const,
        title: "Pick a Court",
        description: "Select the court you're at or nearby. Your location helps us verify your report.",
        color: "#7ED957",
    },
    {
        icon: "people" as const,
        title: "Report the Crowd",
        description: "How busy is it? Empty, light, moderate, busy, or packed?",
        color: "#3B82F6",
    },
    {
        icon: "camera" as const,
        title: "Add a Photo (+$5)",
        description: "Take a quick photo for extra earnings. Photos boost trust and help other players!",
        color: "#F59E0B",
    },
    {
        icon: "cash" as const,
        title: "Earn $5+ Per Report",
        description: "Submit and earn instantly! Partner city reports earn 2x. Keep a streak for bonuses!",
        color: "#22C55E",
    },
]

export function FirstReportTutorial({ visible, onComplete, onSkip }: FirstReportTutorialProps) {
    const [currentStep, setCurrentStep] = useState(0)

    const handleNext = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        if (currentStep < TUTORIAL_STEPS.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            handleComplete()
        }
    }

    const handleComplete = async () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        await AsyncStorage.setItem("hasSeenReportTutorial", "true")
        onComplete()
    }

    const handleSkip = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        await AsyncStorage.setItem("hasSeenReportTutorial", "true")
        onSkip()
    }

    const step = TUTORIAL_STEPS[currentStep]

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Skip Button */}
                    <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                        <Text style={styles.skipText}>Skip</Text>
                    </TouchableOpacity>

                    {/* Progress Dots */}
                    <View style={styles.progressContainer}>
                        {TUTORIAL_STEPS.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.progressDot,
                                    index === currentStep && styles.progressDotActive,
                                    index < currentStep && styles.progressDotCompleted,
                                ]}
                            />
                        ))}
                    </View>

                    {/* Icon */}
                    <View style={[styles.iconContainer, { backgroundColor: `${step.color}20` }]}>
                        <Ionicons name={step.icon} size={48} color={step.color} />
                    </View>

                    {/* Step Counter */}
                    <Text style={styles.stepCounter}>Step {currentStep + 1} of {TUTORIAL_STEPS.length}</Text>

                    {/* Content */}
                    <Text style={styles.title}>{step.title}</Text>
                    <Text style={styles.description}>{step.description}</Text>

                    {/* Earnings Highlight */}
                    {currentStep === TUTORIAL_STEPS.length - 1 && (
                        <View style={styles.earningsHighlight}>
                            <Text style={styles.earningsText}>💰 Your first report is ready!</Text>
                        </View>
                    )}

                    {/* Action Buttons */}
                    <TouchableOpacity
                        style={[styles.nextButton, { backgroundColor: step.color }]}
                        onPress={handleNext}
                    >
                        <Text style={styles.nextButtonText}>
                            {currentStep === TUTORIAL_STEPS.length - 1 ? "Start Reporting" : "Next"}
                        </Text>
                        <Ionicons
                            name={currentStep === TUTORIAL_STEPS.length - 1 ? "checkmark" : "arrow-forward"}
                            size={20}
                            color="#000"
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
}

// Helper to check if user should see tutorial
export async function shouldShowReportTutorial(): Promise<boolean> {
    const hasSeen = await AsyncStorage.getItem("hasSeenReportTutorial")
    return hasSeen !== "true"
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    container: {
        width: width - 48,
        backgroundColor: "#1A1A1A",
        borderRadius: 20,
        padding: 24,
        alignItems: "center",
    },
    skipButton: {
        position: "absolute",
        top: 16,
        right: 16,
        padding: 8,
    },
    skipText: {
        color: "#666",
        fontSize: 14,
    },
    progressContainer: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 24,
    },
    progressDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#333",
    },
    progressDotActive: {
        backgroundColor: "#7ED957",
        width: 24,
    },
    progressDotCompleted: {
        backgroundColor: "#7ED957",
    },
    iconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
    },
    stepCounter: {
        fontSize: 12,
        color: "#666",
        marginBottom: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFFFFF",
        textAlign: "center",
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        color: "#9CA3AF",
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 24,
    },
    earningsHighlight: {
        backgroundColor: "rgba(126, 217, 87, 0.15)",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        marginBottom: 24,
    },
    earningsText: {
        color: "#7ED957",
        fontWeight: "600",
        fontSize: 14,
    },
    nextButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    nextButtonText: {
        color: "#000",
        fontWeight: "bold",
        fontSize: 16,
    },
})
