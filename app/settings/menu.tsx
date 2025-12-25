import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router, Stack } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "@/lib/auth-context"

export default function SettingsMenuScreen() {
    const { logout } = useAuth()

    const handlePress = (route: string) => {
        router.push(route as any)
    }

    const handleLogout = async () => {
        await logout()
        router.replace("/auth")
    }

    const menuItems = [
        { icon: "options-outline", label: "My Preferences", route: "/settings/preferences", highlight: true },
        { icon: "person-outline", label: "Edit Profile", route: "/settings/edit-profile" },
        { icon: "card-outline", label: "Payment Methods", route: "/settings/payment-methods" },
        { icon: "notifications-outline", label: "Notifications", route: "/settings/notifications/friends" },
        { icon: "location-outline", label: "Location", route: "/settings/location" },
        { icon: "language-outline", label: "Language & Region", route: "/settings/language-region" },
        { icon: "lock-closed-outline", label: "Privacy", route: "/settings/privacy" },
        { icon: "help-circle-outline", label: "Help & Support", route: "/settings/help" },
        { icon: "document-text-outline", label: "Terms of Service", route: "/settings/terms" },
    ]

    return (
        <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
            <Stack.Screen options={{
                headerShown: true,
                headerTitle: "Settings",
                headerStyle: { backgroundColor: '#0A0A0A' },
                headerTintColor: '#FFF',
                headerBackTitle: "Profile"
            }} />

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <View style={styles.menuContainer}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.menuItem}
                            onPress={() => handlePress(item.route)}
                        >
                            <View style={styles.menuItemLeft}>
                                <View style={styles.menuIcon}>
                                    <Ionicons name={item.icon as any} size={22} color="#7ED957" />
                                </View>
                                <Text style={styles.menuLabel}>{item.label}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#666" />
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={22} color="#EF4444" />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                <Text style={styles.version}>GoodRunss v1.0.0</Text>
            </ScrollView>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
    },
    menuContainer: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 24,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#2A2A2A",
    },
    menuItemLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: "rgba(132, 204, 22, 0.1)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    menuLabel: {
        fontSize: 16,
        color: "#FFFFFF",
        fontFamily: 'Inter_400Regular',
    },
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        borderRadius: 12,
        paddingVertical: 16,
        gap: 8,
        marginBottom: 24,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#EF4444",
        fontFamily: 'Inter_600SemiBold',
    },
    version: {
        textAlign: "center",
        fontSize: 14,
        color: "#666",
        fontFamily: 'Inter_400Regular',
    },
})
