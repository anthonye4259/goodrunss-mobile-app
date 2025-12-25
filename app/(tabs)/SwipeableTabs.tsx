import { useState, useRef } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native"
import PagerView from "react-native-pager-view"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { useUserPreferences } from "@/lib/user-preferences"

// Import tab screens
import TodayScreen from "./index"
import LiveScreen from "./live"
import GiaScreen from "./gia"
import ProfileScreen from "./profile"

const { width } = Dimensions.get("window")

const TABS = [
    { key: "today", label: "Today", icon: "today-outline" as const, activeIcon: "today" as const },
    { key: "live", label: "Live", icon: "radio-outline" as const, activeIcon: "radio" as const },
    { key: "gia", label: "GIA", icon: "sparkles-outline" as const, activeIcon: "sparkles" as const },
    { key: "profile", label: "Profile", icon: "person-outline" as const, activeIcon: "person" as const },
]

export default function SwipeableTabsLayout() {
    const [currentPage, setCurrentPage] = useState(0)
    const pagerRef = useRef<PagerView>(null)
    const { preferences } = useUserPreferences()

    const handleTabPress = (index: number) => {
        pagerRef.current?.setPage(index)
        setCurrentPage(index)
    }

    const handlePageSelected = (e: any) => {
        setCurrentPage(e.nativeEvent.position)
    }

    return (
        <View style={styles.container}>
            {/* Swipeable Content */}
            <PagerView
                ref={pagerRef}
                style={styles.pagerView}
                initialPage={0}
                onPageSelected={handlePageSelected}
                overdrag={false}
            >
                <View key="today" style={styles.page}>
                    <TodayScreen />
                </View>
                <View key="live" style={styles.page}>
                    <LiveScreen />
                </View>
                <View key="gia" style={styles.page}>
                    <GiaScreen />
                </View>
                <View key="profile" style={styles.page}>
                    <ProfileScreen />
                </View>
            </PagerView>

            {/* Bottom Tab Bar */}
            <SafeAreaView edges={["bottom"]} style={styles.tabBarContainer}>
                <View style={styles.tabBar}>
                    {TABS.map((tab, index) => {
                        const isActive = currentPage === index
                        const isGia = tab.key === "gia"

                        return (
                            <TouchableOpacity
                                key={tab.key}
                                onPress={() => handleTabPress(index)}
                                style={styles.tabItem}
                                activeOpacity={0.7}
                            >
                                <View style={[
                                    styles.iconWrapper,
                                    isGia && isActive && styles.giaActiveWrapper
                                ]}>
                                    <Ionicons
                                        name={isActive ? tab.activeIcon : tab.icon}
                                        size={24}
                                        color={isActive ? (isGia ? "#FFFFFF" : "#7ED957") : "#666"}
                                    />
                                </View>
                                <Text style={[
                                    styles.tabLabel,
                                    isActive && styles.tabLabelActive
                                ]}>
                                    {tab.label}
                                </Text>
                            </TouchableOpacity>
                        )
                    })}
                </View>

                {/* Page Indicators */}
                <View style={styles.indicatorContainer}>
                    {TABS.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.indicator,
                                currentPage === index && styles.indicatorActive
                            ]}
                        />
                    ))}
                </View>
            </SafeAreaView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0A0A0A",
    },
    pagerView: {
        flex: 1,
    },
    page: {
        flex: 1,
    },
    tabBarContainer: {
        backgroundColor: "#141414",
        borderTopWidth: 1,
        borderTopColor: "#1F1F1F",
    },
    tabBar: {
        flexDirection: "row",
        paddingTop: 8,
    },
    tabItem: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 8,
    },
    iconWrapper: {
        marginBottom: 4,
    },
    giaActiveWrapper: {
        backgroundColor: "#8B5CF6",
        borderRadius: 10,
        padding: 4,
        marginBottom: 0,
    },
    tabLabel: {
        fontFamily: "Inter_500Medium",
        fontSize: 11,
        color: "#666",
    },
    tabLabelActive: {
        color: "#7ED957",
    },
    indicatorContainer: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 6,
        paddingBottom: 8,
        paddingTop: 8,
    },
    indicator: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#333",
    },
    indicatorActive: {
        backgroundColor: "#7ED957",
        width: 20,
        borderRadius: 3,
    },
})
