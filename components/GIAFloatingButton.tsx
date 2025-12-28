/**
 * GIA Floating Button
 * 
 * Shows "GIA" text - Goodrunss Intelligence Assistant
 * Cal.ai-inspired design: minimal, sophisticated
 */

import { TouchableOpacity, StyleSheet, View, Text } from "react-native"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"

interface GIAFloatingButtonProps {
    hidden?: boolean
}

export function GIAFloatingButton({ hidden = false }: GIAFloatingButtonProps) {
    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        router.push("/(tabs)/gia")
    }

    if (hidden) return null

    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.7}
            style={styles.container}
        >
            <View style={styles.button}>
                <Text style={styles.text}>GIA</Text>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 100,
        right: 16,
        zIndex: 1000,
    },
    button: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: "rgba(167, 139, 250, 0.15)",
        borderWidth: 1,
        borderColor: "rgba(167, 139, 250, 0.3)",
        alignItems: "center",
        justifyContent: "center",
    },
    text: {
        color: "#A78BFA",
        fontSize: 13,
        fontWeight: "700",
        letterSpacing: 1,
    },
})

export default GIAFloatingButton
