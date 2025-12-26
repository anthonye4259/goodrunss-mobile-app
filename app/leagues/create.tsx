
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Switch, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { socialService } from '@/lib/services/social-service';

export default function CreateLeagueScreen() {
    const [name, setName] = useState('');
    const [sport, setSport] = useState('Basketball');
    const [format, setFormat] = useState('round_robin'); // round_robin, bracket, ladder
    const [entryFee, setEntryFee] = useState('');
    const [prize, setPrize] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [image, setImage] = useState<string | null>(null);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleCreate = async () => {
        if (!name.trim()) {
            Alert.alert("Missing Name", "Please name your league.");
            return;
        }

        try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            // Create in Firestore
            const leagueId = await socialService.createLeague({
                name,
                sport,
                format,
                entryFee: entryFee ? parseFloat(entryFee) : 0,
                prizePool: prize ? parseFloat(prize) : 0,
                isPublic,
                coverImage: image
            });

            Alert.alert(
                "League Created! 🏆",
                "Your league is live. Time to invite players!",
                [{
                    text: "Go to League",
                    onPress: () => router.replace(`/leagues/${leagueId}`)
                }]
            );
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Could not create league. Please try again.");
        }
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="close" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Create New League</Text>
                    <TouchableOpacity onPress={handleCreate}>
                        <Text style={styles.createBtn}>Create</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.content}>

                    {/* Cover Image */}
                    <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
                        {image ? (
                            <Image source={{ uri: image }} style={styles.coverImage} />
                        ) : (
                            <View style={styles.placeholder}>
                                <Ionicons name="camera" size={32} color="#666" />
                                <Text style={styles.placeholderText}>Add Cover Photo</Text>
                            </View>
                        )}
                        <View style={styles.editIcon}>
                            <Ionicons name="pencil" size={16} color="#000" />
                        </View>
                    </TouchableOpacity>

                    {/* Basic Info */}
                    <Text style={styles.label}>LEAGUE DETAILS</Text>
                    <View style={styles.inputGroup}>
                        <TextInput
                            style={styles.input}
                            placeholder="League Name (e.g. Summer Slam)"
                            placeholderTextColor="#666"
                            value={name}
                            onChangeText={setName}
                        />
                        <View style={styles.divider} />
                        <View style={styles.row}>
                            <Text style={styles.rowLabel}>Sport</Text>
                            <TouchableOpacity style={styles.selectBtn}>
                                <Text style={styles.selectText}>{sport}</Text>
                                <Ionicons name="chevron-down" size={16} color="#666" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Format */}
                    <Text style={styles.label}>FORMAT & RULES</Text>
                    <View style={styles.cardsRow}>
                        {[
                            { id: 'round_robin', icon: 'repeat', label: 'Round Robin' },
                            { id: 'bracket', icon: 'git-network', label: 'Bracket' },
                            { id: 'ladder', icon: 'list', label: 'Ladder' }
                        ].map(f => (
                            <TouchableOpacity
                                key={f.id}
                                style={[styles.formatCard, format === f.id && styles.formatActive]}
                                onPress={() => { setFormat(f.id); Haptics.selectionAsync(); }}
                            >
                                <Ionicons name={f.icon as any} size={24} color={format === f.id ? '#000' : '#666'} />
                                <Text style={[styles.formatText, format === f.id && { color: '#000', fontWeight: 'bold' }]}>{f.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Financials (SaaS Feature) */}
                    <Text style={styles.label}>STAKES (OPTIONAL)</Text>
                    <View style={styles.inputGroup}>
                        <View style={styles.row}>
                            <View>
                                <Text style={styles.rowLabel}>Entry Fee ($) per player</Text>
                                <Text style={styles.rowDesc}>Platform takes 10% service fee.</Text>
                            </View>
                            <TextInput
                                style={styles.smallInput}
                                placeholder="0"
                                placeholderTextColor="#666"
                                keyboardType="numeric"
                                value={entryFee}
                                onChangeText={(text) => {
                                    setEntryFee(text);
                                    // Auto-calculate prize pool if simple
                                    if (text) {
                                        const fee = parseFloat(text);
                                        const platform = fee * 0.10;
                                        // Mock 10 players for prize pool estimation
                                        const estPrize = (fee - platform) * 10;
                                        setPrize(estPrize.toFixed(0)); // Auto-fill prize for now
                                    } else {
                                        setPrize('');
                                    }
                                }}
                            />
                        </View>
                    </View>

                    {entryFee && !isNaN(parseFloat(entryFee)) && parseFloat(entryFee) > 0 && (
                        <View style={styles.feeBreakdown}>
                            <View style={styles.feeRow}>
                                <Text style={styles.feeLabel}>Entry Fee</Text>
                                <Text style={styles.feeValue}>${parseFloat(entryFee).toFixed(2)}</Text>
                            </View>
                            <View style={styles.feeRow}>
                                <Text style={styles.feeLabel}>GoodRunss Fee (10%)</Text>
                                <Text style={styles.feeValueRed}>-${(parseFloat(entryFee) * 0.10).toFixed(2)}</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.feeRow}>
                                <Text style={styles.feeLabelBold}>Net to League</Text>
                                <Text style={styles.feeValueGreen}>${(parseFloat(entryFee) * 0.90).toFixed(2)} / player</Text>
                            </View>
                            <Text style={styles.feeNote}>Funds are held securely and released to winners automatically.</Text>
                        </View>
                    )}

                    {/* Prize Pool Display */}
                    <Text style={styles.label}>ESTIMATED PRIZE POOL</Text>
                    <View style={styles.inputGroup}>
                        <View style={styles.row}>
                            <Text style={styles.rowLabel}>Total Prize Pool ($)</Text>
                            <TextInput
                                style={styles.smallInput}
                                placeholder="0"
                                placeholderTextColor="#666"
                                keyboardType="numeric"
                                value={prize}
                                onChangeText={setPrize}
                            />
                        </View>
                    </View>

                    {/* Privacy */}
                    <View style={styles.privacyRow}>
                        <View>
                            <Text style={styles.privacyTitle}>Public League</Text>
                            <Text style={styles.privacyDesc}>Anyone can find and request to join.</Text>
                        </View>
                        <Switch
                            value={isPublic}
                            onValueChange={setIsPublic}
                            trackColor={{ false: '#333', true: '#7ED957' }}
                        />
                    </View>

                    <Text style={styles.footerNote}>
                        By creating a league, you agree to organize matches and update scores locally.
                        Premium leagues with payments are processed via Stripe.
                    </Text>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    safeArea: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 12
    },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
    createBtn: { color: '#7ED957', fontWeight: 'bold', fontSize: 16 },
    content: { padding: 20 },

    imageUpload: {
        height: 180, borderRadius: 16, backgroundColor: '#1A1A1A', overflow: 'hidden',
        marginBottom: 24, justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: '#333', borderStyle: 'dashed'
    },
    placeholder: { alignItems: 'center', gap: 8 },
    placeholderText: { color: '#666', fontWeight: '600' },
    coverImage: { width: '100%', height: '100%' },
    editIcon: {
        position: 'absolute', bottom: 12, right: 12,
        backgroundColor: '#FFF', width: 32, height: 32, borderRadius: 16,
        alignItems: 'center', justifyContent: 'center'
    },

    label: { color: '#666', fontSize: 12, fontWeight: 'bold', marginBottom: 12, marginTop: 8 },
    inputGroup: {
        backgroundColor: '#111', borderRadius: 12, paddingHorizontal: 16,
        borderWidth: 1, borderColor: '#222'
    },
    input: { paddingVertical: 16, color: '#FFF', fontSize: 16 },
    divider: { height: 1, backgroundColor: '#222' },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 },
    rowLabel: { color: '#FFF', fontSize: 16 },
    rowDesc: { color: '#666', fontSize: 12, marginTop: 2 },

    selectBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    selectText: { color: '#CCC' },
    smallInput: { color: '#FFF', fontSize: 16, fontWeight: 'bold', textAlign: 'right', minWidth: 60 },

    cardsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    formatCard: {
        flex: 1, backgroundColor: '#111', padding: 16, borderRadius: 12,
        alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#222'
    },
    formatActive: { backgroundColor: '#7ED957', borderColor: '#7ED957' },
    formatText: { color: '#666', fontSize: 12, fontWeight: '600' },

    feeBreakdown: {
        backgroundColor: '#1A1A1A', padding: 16, borderRadius: 12, marginBottom: 20, marginTop: -12,
        borderWidth: 1, borderColor: '#333'
    },
    feeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    feeLabel: { color: '#999', fontSize: 14 },
    feeLabelBold: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
    feeValue: { color: '#FFF', fontSize: 14 },
    feeValueRed: { color: '#EF4444', fontSize: 14 },
    feeValueGreen: { color: '#7ED957', fontSize: 14, fontWeight: 'bold' },
    feeNote: { color: '#666', fontSize: 10, marginTop: 8, fontStyle: 'italic' },

    privacyRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        marginTop: 20, marginBottom: 40, backgroundColor: '#111', padding: 16, borderRadius: 12
    },
    privacyTitle: { color: '#FFF', fontSize: 16, fontWeight: '600' },
    privacyDesc: { color: '#666', fontSize: 12, marginTop: 2 },

    footerNote: { color: '#444', fontSize: 12, textAlign: 'center', paddingBottom: 40 }
});
