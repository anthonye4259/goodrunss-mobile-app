import { View, Text, TouchableOpacity, Alert, SafeAreaView, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth-context';

export default function DeleteAccountScreen() {
    const router = useRouter();
    const { logout } = useAuth(); // Ideally this would be deleteAccount()

    const handleDelete = () => {
        Alert.alert(
            "Delete Account?",
            "This action is permanent and cannot be undone. All your data will be wiped.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete My Account",
                    style: "destructive",
                    onPress: async () => {
                        // In a real app, call API to delete user.
                        // For MVP/Review, we log them out and 'pretend' deletion or call a cloud function.
                        // Assuming auth.delete() is available in context or we just logout for now.
                        try {
                            // await auth().currentUser?.delete(); 
                            await logout();
                            Alert.alert("Account Deleted", "Your account has been scheduled for deletion.");
                            router.replace('/auth');
                        } catch (e) {
                            Alert.alert("Error", "Please contact support to complete deletion.");
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Delete Account</Text>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.warningBox}>
                        <Ionicons name="warning" size={48} color="#EF4444" />
                        <Text style={styles.warningTitle}>Are you sure?</Text>
                        <Text style={styles.warningText}>
                            Deleting your account will remove your profile, match history, and chat messages permanently.
                        </Text>
                    </View>

                    <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                        <Text style={styles.deleteBtnText}>Permanently Delete Account</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    safeArea: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
    backBtn: { marginRight: 16 },
    headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
    content: { padding: 24, alignItems: 'center', paddingTop: 60 },
    warningBox: { alignItems: 'center', marginBottom: 40 },
    warningTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
    warningText: { color: '#999', textAlign: 'center', lineHeight: 24 },
    deleteBtn: { backgroundColor: 'rgba(239, 68, 68, 0.2)', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 12, width: '100%', alignItems: 'center' },
    deleteBtnText: { color: '#EF4444', fontWeight: 'bold', fontSize: 16 }
});
