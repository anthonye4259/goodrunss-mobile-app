/**
 * Client Notes Component
 * 
 * Quick notes that trainers can add after each session.
 * Persisted per client for reference.
 */

import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Modal } from "react-native"
import { useState } from "react"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"

type Note = {
    id: string
    content: string
    date: Date
    sessionType?: string
}

type Props = {
    clientId: string
    clientName: string
    notes: Note[]
    onAddNote: (note: string) => void
    onDeleteNote?: (noteId: string) => void
}

export function ClientNotes({ clientId, clientName, notes, onAddNote, onDeleteNote }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [newNote, setNewNote] = useState("")

    const handleAddNote = () => {
        if (newNote.trim()) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            onAddNote(newNote.trim())
            setNewNote("")
            setIsModalOpen(false)
        }
    }

    const formatDate = (date: Date) => {
        const d = new Date(date)
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Ionicons name="document-text" size={18} color="#8B5CF6" />
                    <Text style={styles.title}>Session Notes</Text>
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                        setIsModalOpen(true)
                    }}
                >
                    <Ionicons name="add" size={18} color="#7ED957" />
                    <Text style={styles.addButtonText}>Add Note</Text>
                </TouchableOpacity>
            </View>

            {notes.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No notes yet</Text>
                    <Text style={styles.emptyHint}>Add notes after sessions to track progress</Text>
                </View>
            ) : (
                <View style={styles.notesList}>
                    {notes.slice(0, 3).map((note) => (
                        <View key={note.id} style={styles.noteCard}>
                            <View style={styles.noteHeader}>
                                <Text style={styles.noteDate}>{formatDate(note.date)}</Text>
                                {note.sessionType && (
                                    <View style={styles.sessionBadge}>
                                        <Text style={styles.sessionBadgeText}>{note.sessionType}</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.noteContent} numberOfLines={2}>{note.content}</Text>
                        </View>
                    ))}
                    {notes.length > 3 && (
                        <TouchableOpacity style={styles.viewAllButton}>
                            <Text style={styles.viewAllText}>View all {notes.length} notes</Text>
                            <Ionicons name="chevron-forward" size={14} color="#8B5CF6" />
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* Add Note Modal */}
            <Modal visible={isModalOpen} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add Note for {clientName}</Text>
                            <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                                <Ionicons name="close" size={24} color="#888" />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={styles.noteInput}
                            placeholder="What happened in today's session?"
                            placeholderTextColor="#666"
                            value={newNote}
                            onChangeText={setNewNote}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />

                        <TouchableOpacity
                            style={[styles.saveButton, !newNote.trim() && styles.saveButtonDisabled]}
                            onPress={handleAddNote}
                            disabled={!newNote.trim()}
                        >
                            <Text style={styles.saveButtonText}>Save Note</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#141414",
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#8B5CF620",
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
        fontSize: 16,
        fontWeight: "700",
    },
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "rgba(126, 217, 87, 0.1)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    addButtonText: {
        color: "#7ED957",
        fontSize: 13,
        fontWeight: "600",
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: 20,
    },
    emptyText: {
        color: "#666",
        fontSize: 14,
    },
    emptyHint: {
        color: "#444",
        fontSize: 12,
        marginTop: 4,
    },
    notesList: {
        gap: 8,
    },
    noteCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 12,
    },
    noteHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 6,
    },
    noteDate: {
        color: "#888",
        fontSize: 11,
    },
    sessionBadge: {
        backgroundColor: "#8B5CF620",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    sessionBadgeText: {
        color: "#8B5CF6",
        fontSize: 10,
        fontWeight: "600",
    },
    noteContent: {
        color: "#CCC",
        fontSize: 13,
        lineHeight: 18,
    },
    viewAllButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        paddingVertical: 8,
    },
    viewAllText: {
        color: "#8B5CF6",
        fontSize: 13,
        fontWeight: "500",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.8)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#1A1A1A",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    modalTitle: {
        color: "#FFF",
        fontSize: 18,
        fontWeight: "700",
    },
    noteInput: {
        backgroundColor: "#252525",
        borderRadius: 16,
        padding: 16,
        color: "#FFF",
        fontSize: 15,
        minHeight: 120,
        marginBottom: 16,
    },
    saveButton: {
        backgroundColor: "#7ED957",
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: "center",
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    saveButtonText: {
        color: "#000",
        fontSize: 16,
        fontWeight: "700",
    },
})

export default ClientNotes
