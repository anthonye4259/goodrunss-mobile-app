/**
 * Studio Classes Management Screen
 * For wellness studio owners to manage their class schedule
 */

import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    TextInput,
    Alert,
    Modal,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router, useLocalSearchParams } from "expo-router"
import * as Haptics from "expo-haptics"

import { useAuth } from "@/lib/auth-context"
import { facilityService, ClaimedFacility } from "@/lib/services/facility-service"
import { classService, StudioClass, DAY_NAMES } from "@/lib/services/class-service"

export default function ManageClassesScreen() {
    const { facilityId, venueId } = useLocalSearchParams()
    const { user } = useAuth()

    const [facility, setFacility] = useState<ClaimedFacility | null>(null)
    const [classes, setClasses] = useState<StudioClass[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)

    // New class form state
    const [newClass, setNewClass] = useState({
        name: "",
        type: "yoga" as "yoga" | "pilates" | "other",
        instructor: "",
        dayOfWeek: 1, // Monday
        startTime: "09:00",
        duration: 60,
        maxSpots: 15,
        pricePerSpot: "25",
    })

    useEffect(() => {
        loadData()
    }, [facilityId])

    const loadData = async () => {
        if (!facilityId || !user) return
        setLoading(true)

        try {
            // Get facility
            const facilities = await facilityService.getFacilitiesByOwner(user.uid)
            const fac = facilities.find(f => f.id === facilityId)
            setFacility(fac || null)

            // Get classes
            const classList = await classService.getClasses(facilityId as string)
            setClasses(classList)
        } catch (error) {
            console.error("Error loading data:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateClass = async () => {
        if (!newClass.name || !facilityId || !venueId) {
            Alert.alert("Error", "Please enter a class name")
            return
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        try {
            const classId = await classService.createClass({
                facilityId: facilityId as string,
                venueId: venueId as string,
                name: newClass.name,
                type: newClass.type,
                instructor: newClass.instructor || undefined,
                dayOfWeek: newClass.dayOfWeek,
                startTime: newClass.startTime,
                duration: newClass.duration,
                maxSpots: newClass.maxSpots,
                pricePerSpot: parseInt(newClass.pricePerSpot) * 100, // Convert to cents
                isActive: true,
                isRecurring: true,
            })

            if (classId) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                setShowAddModal(false)
                setNewClass({
                    name: "",
                    type: "yoga",
                    instructor: "",
                    dayOfWeek: 1,
                    startTime: "09:00",
                    duration: 60,
                    maxSpots: 15,
                    pricePerSpot: "25",
                })
                loadData()
            } else {
                Alert.alert("Error", "Failed to create class")
            }
        } catch (error) {
            console.error("Error creating class:", error)
            Alert.alert("Error", "Something went wrong")
        }
    }

    const handleDeleteClass = async (classId: string) => {
        Alert.alert(
            "Delete Class",
            "Are you sure you want to delete this class? This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        const success = await classService.deleteClass(classId)
                        if (success) {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                            loadData()
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
                    <Text style={styles.headerTitle}>Manage Classes</Text>
                    <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() => setShowAddModal(true)}
                    >
                        <Ionicons name="add" size={24} color="#7ED957" />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    {classes.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="calendar-outline" size={64} color="#333" />
                            <Text style={styles.emptyTitle}>No Classes Yet</Text>
                            <Text style={styles.emptyText}>
                                Add classes to let players book spots
                            </Text>
                            <TouchableOpacity
                                style={styles.addClassBtn}
                                onPress={() => setShowAddModal(true)}
                            >
                                <Text style={styles.addClassBtnText}>Add First Class</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            {/* Group by day */}
                            {[0, 1, 2, 3, 4, 5, 6].map(day => {
                                const dayClasses = classes.filter(c => c.dayOfWeek === day)
                                if (dayClasses.length === 0) return null

                                return (
                                    <View key={day} style={styles.daySection}>
                                        <Text style={styles.dayHeader}>{DAY_NAMES[day]}</Text>
                                        {dayClasses.map(cls => (
                                            <View key={cls.id} style={styles.classCard}>
                                                <View style={styles.classTime}>
                                                    <Text style={styles.classTimeText}>{cls.startTime}</Text>
                                                    <Text style={styles.classDuration}>{cls.duration}min</Text>
                                                </View>
                                                <View style={styles.classInfo}>
                                                    <Text style={styles.className}>{cls.name}</Text>
                                                    {cls.instructor && (
                                                        <Text style={styles.classInstructor}>
                                                            with {cls.instructor}
                                                        </Text>
                                                    )}
                                                    <Text style={styles.classSpots}>
                                                        {cls.maxSpots} spots · ${(cls.pricePerSpot / 100).toFixed(0)}/person
                                                    </Text>
                                                </View>
                                                <TouchableOpacity
                                                    style={styles.deleteBtn}
                                                    onPress={() => handleDeleteClass(cls.id)}
                                                >
                                                    <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </View>
                                )
                            })}
                        </>
                    )}
                </ScrollView>

                {/* Add Class Modal */}
                <Modal
                    visible={showAddModal}
                    animationType="slide"
                    transparent={true}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modal}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Add Class</Text>
                                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                                    <Ionicons name="close" size={24} color="#FFF" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.modalContent}>
                                {/* Class Name */}
                                <Text style={styles.label}>Class Name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={newClass.name}
                                    onChangeText={(text) => setNewClass({ ...newClass, name: text })}
                                    placeholder="Morning Flow Yoga"
                                    placeholderTextColor="#666"
                                />

                                {/* Type */}
                                <Text style={styles.label}>Type</Text>
                                <View style={styles.typeRow}>
                                    {(["yoga", "pilates"] as const).map(type => (
                                        <TouchableOpacity
                                            key={type}
                                            style={[
                                                styles.typeChip,
                                                newClass.type === type && styles.typeChipSelected,
                                            ]}
                                            onPress={() => setNewClass({ ...newClass, type })}
                                        >
                                            <Text style={[
                                                styles.typeChipText,
                                                newClass.type === type && styles.typeChipTextSelected,
                                            ]}>
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Instructor */}
                                <Text style={styles.label}>Instructor (optional)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={newClass.instructor}
                                    onChangeText={(text) => setNewClass({ ...newClass, instructor: text })}
                                    placeholder="Sarah"
                                    placeholderTextColor="#666"
                                />

                                {/* Day of Week */}
                                <Text style={styles.label}>Day</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <View style={styles.dayRow}>
                                        {DAY_NAMES.map((day, idx) => (
                                            <TouchableOpacity
                                                key={idx}
                                                style={[
                                                    styles.dayChip,
                                                    newClass.dayOfWeek === idx && styles.dayChipSelected,
                                                ]}
                                                onPress={() => setNewClass({ ...newClass, dayOfWeek: idx })}
                                            >
                                                <Text style={[
                                                    styles.dayChipText,
                                                    newClass.dayOfWeek === idx && styles.dayChipTextSelected,
                                                ]}>
                                                    {day.slice(0, 3)}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </ScrollView>

                                {/* Time */}
                                <Text style={styles.label}>Start Time</Text>
                                <View style={styles.timeRow}>
                                    {["06:00", "07:00", "08:00", "09:00", "10:00", "12:00", "17:00", "18:00", "19:00"].map(time => (
                                        <TouchableOpacity
                                            key={time}
                                            style={[
                                                styles.timeChip,
                                                newClass.startTime === time && styles.timeChipSelected,
                                            ]}
                                            onPress={() => setNewClass({ ...newClass, startTime: time })}
                                        >
                                            <Text style={[
                                                styles.timeChipText,
                                                newClass.startTime === time && styles.timeChipTextSelected,
                                            ]}>
                                                {time}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Duration */}
                                <Text style={styles.label}>Duration</Text>
                                <View style={styles.durationRow}>
                                    {[45, 60, 75, 90].map(dur => (
                                        <TouchableOpacity
                                            key={dur}
                                            style={[
                                                styles.durationChip,
                                                newClass.duration === dur && styles.durationChipSelected,
                                            ]}
                                            onPress={() => setNewClass({ ...newClass, duration: dur })}
                                        >
                                            <Text style={[
                                                styles.durationChipText,
                                                newClass.duration === dur && styles.durationChipTextSelected,
                                            ]}>
                                                {dur} min
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Capacity */}
                                <Text style={styles.label}>Max Spots</Text>
                                <View style={styles.spotsRow}>
                                    {[10, 15, 20, 25, 30].map(spots => (
                                        <TouchableOpacity
                                            key={spots}
                                            style={[
                                                styles.spotsChip,
                                                newClass.maxSpots === spots && styles.spotsChipSelected,
                                            ]}
                                            onPress={() => setNewClass({ ...newClass, maxSpots: spots })}
                                        >
                                            <Text style={[
                                                styles.spotsChipText,
                                                newClass.maxSpots === spots && styles.spotsChipTextSelected,
                                            ]}>
                                                {spots}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Price */}
                                <Text style={styles.label}>Price per Spot ($)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={newClass.pricePerSpot}
                                    onChangeText={(text) => setNewClass({ ...newClass, pricePerSpot: text })}
                                    placeholder="25"
                                    placeholderTextColor="#666"
                                    keyboardType="number-pad"
                                />
                            </ScrollView>

                            <TouchableOpacity style={styles.saveBtn} onPress={handleCreateClass}>
                                <LinearGradient
                                    colors={["#7ED957", "#4C9E29"]}
                                    style={styles.saveBtnGradient}
                                >
                                    <Text style={styles.saveBtnText}>Add Class</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
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
    headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
    addBtn: { padding: 8 },

    content: { paddingHorizontal: 20, paddingBottom: 40 },

    emptyState: { alignItems: "center", paddingTop: 60 },
    emptyTitle: { color: "#FFF", fontSize: 20, fontWeight: "bold", marginTop: 16 },
    emptyText: { color: "#888", fontSize: 14, textAlign: "center", marginTop: 8 },
    addClassBtn: {
        marginTop: 24,
        backgroundColor: "#7ED957",
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 12,
    },
    addClassBtnText: { color: "#000", fontSize: 16, fontWeight: "700" },

    daySection: { marginBottom: 24 },
    dayHeader: { color: "#7ED957", fontSize: 16, fontWeight: "600", marginBottom: 12 },

    classCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
    },
    classTime: { width: 60, marginRight: 16 },
    classTimeText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
    classDuration: { color: "#888", fontSize: 12 },
    classInfo: { flex: 1 },
    className: { color: "#FFF", fontSize: 16, fontWeight: "600" },
    classInstructor: { color: "#888", fontSize: 14, marginTop: 2 },
    classSpots: { color: "#7ED957", fontSize: 14, marginTop: 4 },
    deleteBtn: { padding: 8 },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.8)",
        justifyContent: "flex-end",
    },
    modal: {
        backgroundColor: "#1A1A1A",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: "90%",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#333",
    },
    modalTitle: { color: "#FFF", fontSize: 20, fontWeight: "bold" },
    modalContent: { padding: 20, maxHeight: 500 },

    label: { color: "#888", fontSize: 12, marginBottom: 8, marginTop: 16 },
    input: {
        backgroundColor: "#0A0A0A",
        borderRadius: 8,
        padding: 12,
        color: "#FFF",
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#333",
    },

    typeRow: { flexDirection: "row", gap: 8 },
    typeChip: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        backgroundColor: "#0A0A0A",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#333",
    },
    typeChipSelected: { backgroundColor: "#7ED957", borderColor: "#7ED957" },
    typeChipText: { color: "#888" },
    typeChipTextSelected: { color: "#000" },

    dayRow: { flexDirection: "row", gap: 8 },
    dayChip: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: "#0A0A0A",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#333",
    },
    dayChipSelected: { backgroundColor: "#7ED957", borderColor: "#7ED957" },
    dayChipText: { color: "#888", fontSize: 12 },
    dayChipTextSelected: { color: "#000" },

    timeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    timeChip: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: "#0A0A0A",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#333",
    },
    timeChipSelected: { backgroundColor: "#7ED957", borderColor: "#7ED957" },
    timeChipText: { color: "#888", fontSize: 14 },
    timeChipTextSelected: { color: "#000" },

    durationRow: { flexDirection: "row", gap: 8 },
    durationChip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: "#0A0A0A",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#333",
    },
    durationChipSelected: { backgroundColor: "#7ED957", borderColor: "#7ED957" },
    durationChipText: { color: "#888" },
    durationChipTextSelected: { color: "#000" },

    spotsRow: { flexDirection: "row", gap: 8 },
    spotsChip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: "#0A0A0A",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#333",
    },
    spotsChipSelected: { backgroundColor: "#7ED957", borderColor: "#7ED957" },
    spotsChipText: { color: "#888" },
    spotsChipTextSelected: { color: "#000" },

    saveBtn: { margin: 20, borderRadius: 12, overflow: "hidden" },
    saveBtnGradient: { paddingVertical: 18, alignItems: "center" },
    saveBtnText: { color: "#000", fontSize: 18, fontWeight: "800" },
})
