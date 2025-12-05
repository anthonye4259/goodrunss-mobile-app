import { View, Text, Modal, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { BlurView } from "expo-blur"

interface ReviewModalProps {
    visible: boolean
    onClose: () => void
    onSubmit: (rating: number, text: string) => Promise<void>
    venueName: string
}

export function ReviewModal({ visible, onClose, onSubmit, venueName }: ReviewModalProps) {
    const [rating, setRating] = useState(0)
    const [text, setText] = useState("")
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (rating === 0) return
        setSubmitting(true)
        await onSubmit(rating, text)
        setSubmitting(false)
        setRating(0)
        setText("")
        onClose()
    }

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.container}>
                <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />

                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Rate {venueName}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.starsContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity key={star} onPress={() => setRating(star)}>
                                <Ionicons
                                    name={star <= rating ? "star" : "star-outline"}
                                    size={32}
                                    color={star <= rating ? "#7ED957" : "#666"}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TextInput
                        style={styles.input}
                        placeholder="Share your experience..."
                        placeholderTextColor="#666"
                        multiline
                        numberOfLines={4}
                        value={text}
                        onChangeText={setText}
                    />

                    <TouchableOpacity
                        style={[styles.submitButton, rating === 0 && styles.disabledButton]}
                        onPress={handleSubmit}
                        disabled={rating === 0 || submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#000" />
                        ) : (
                            <Text style={styles.submitText}>Submit Review</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    content: {
        width: "100%",
        backgroundColor: "#1A1A1A",
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: "#333",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#FFF",
    },
    starsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 12,
        marginBottom: 24,
    },
    input: {
        backgroundColor: "#2A2A2A",
        borderRadius: 12,
        padding: 16,
        color: "#FFF",
        height: 120,
        textAlignVertical: "top",
        marginBottom: 24,
    },
    submitButton: {
        backgroundColor: "#7ED957",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
    },
    disabledButton: {
        opacity: 0.5,
    },
    submitText: {
        color: "#000",
        fontWeight: "bold",
        fontSize: 16,
    },
})
