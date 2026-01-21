import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router, Stack } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "@/lib/auth-context"
import { PoweredByDal } from "@/components/PoweredByDal"

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
        { icon: "star-outline", label: "Subscription", route: "/settings/subscription" },
        { icon: "language-outline", label: "Language & Region", route: "/settings/language-region" },
        { icon: "lock-closed-outline", label: "Privacy", route: "/settings/privacy" },
        { icon: "help-circle-outline", label: "Help & Support", route: "/settings/help" },
        { icon: "document-text-outline", label: "Terms of Service", route: "/settings/terms" },
        { icon: "watch-outline", label: "Connect Wearables", route: "/settings/wearables" },
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

                {/* Viral / White Label Unlock */}
                <View style={[styles.menuContainer, { marginTop: -16 }]}>
                    <TouchableOpacity
                        style={[styles.menuItem, { borderBottomWidth: 0 }]}
                        onPress={() => router.push("/settings/remove-branding" as any)} // We'll handle logic in the new screen or inline here? Inline is easier for now.
                    >
                        <View style={styles.menuItemLeft}>
                            <View style={[styles.menuIcon, { backgroundColor: 'rgba(255, 215, 0, 0.1)' }]}>
                                <Ionicons name="diamond-outline" size={22} color="#FFD700" />
                            </View>
                            <View>
                                <Text style={[styles.menuLabel, { color: '#FFD700' }]}>Remove Branding</Text>
                                {/* Gamification Progress */}
                                <Text style={{ color: '#666', fontSize: 12, marginTop: 2 }}>
                                    Refer 5 trainers (2/5)
                                </Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#666" />
                    </TouchableOpacity>
                </View>

                {/* Account Deletion (Required by Apple) */}
                <TouchableOpacity
                    style={[styles.menuItem, { borderBottomWidth: 0, marginTop: 24 }]}
                    onPress={() => router.push("/settings/delete-account")}
                >
                    <View style={styles.menuItemLeft}>
                        <View style={[styles.menuIcon, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                            <Ionicons name="trash-outline" size={22} color="#EF4444" />
                        </View>
                        <Text style={[styles.menuLabel, { color: '#EF4444' }]}>Delete Account</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={22} color="#EF4444" />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.logoutButton, { backgroundColor: 'transparent', marginTop: -12 }]}
                    onPress={() => router.push('/settings/delete-account' as any)}
                >
                    <Text style={[styles.logoutText, { color: '#666', fontSize: 14 }]}>Delete Account</Text>
                </TouchableOpacity>

                <PoweredByDal />
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
