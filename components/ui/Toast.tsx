/**
 * Toast Notification System
 * 
 * Shows temporary success/error/info messages.
 * Auto-dismisses after duration.
 */

import { View, Text, StyleSheet, Animated, TouchableOpacity } from "react-native"
import { useEffect, useRef, useState, createContext, useContext } from "react"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"

type ToastType = "success" | "error" | "info" | "warning"

type ToastConfig = {
    message: string
    type?: ToastType
    duration?: number
    action?: { label: string; onPress: () => void }
}

type ToastContextType = {
    showToast: (config: ToastConfig) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error("useToast must be used within ToastProvider")
    }
    return context
}

const TOAST_CONFIG = {
    success: { icon: "checkmark-circle" as const, color: "#22C55E", bg: "#22C55E20" },
    error: { icon: "alert-circle" as const, color: "#EF4444", bg: "#EF444420" },
    info: { icon: "information-circle" as const, color: "#3B82F6", bg: "#3B82F620" },
    warning: { icon: "warning" as const, color: "#F59E0B", bg: "#F59E0B20" },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toast, setToast] = useState<ToastConfig | null>(null)
    const translateY = useRef(new Animated.Value(-100)).current
    const opacity = useRef(new Animated.Value(0)).current

    const showToast = (config: ToastConfig) => {
        setToast(config)

        // Haptic feedback
        if (config.type === "success") {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        } else if (config.type === "error") {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        }

        // Animate in
        Animated.parallel([
            Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                tension: 100,
                friction: 10,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start()

        // Auto dismiss
        const duration = config.duration || 3000
        setTimeout(() => hideToast(), duration)
    }

    const hideToast = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: -100,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => setToast(null))
    }

    const config = toast ? TOAST_CONFIG[toast.type || "success"] : TOAST_CONFIG.success

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && (
                <Animated.View
                    style={[
                        styles.toastContainer,
                        { transform: [{ translateY }], opacity }
                    ]}
                >
                    <View style={[styles.toast, { backgroundColor: config.bg, borderColor: config.color + "40" }]}>
                        <Ionicons name={config.icon} size={22} color={config.color} />
                        <Text style={styles.toastMessage}>{toast.message}</Text>
                        {toast.action && (
                            <TouchableOpacity onPress={toast.action.onPress}>
                                <Text style={[styles.toastAction, { color: config.color }]}>
                                    {toast.action.label}
                                </Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
                            <Ionicons name="close" size={18} color="#888" />
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            )}
        </ToastContext.Provider>
    )
}

const styles = StyleSheet.create({
    toastContainer: {
        position: "absolute",
        top: 60,
        left: 16,
        right: 16,
        zIndex: 9999,
    },
    toast: {
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        gap: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    toastMessage: {
        flex: 1,
        color: "#FFF",
        fontSize: 14,
        fontWeight: "500",
    },
    toastAction: {
        fontSize: 14,
        fontWeight: "700",
    },
    closeButton: {
        padding: 4,
    },
})

export default ToastProvider
