import { AppRegistry, View, Text, StyleSheet, TouchableOpacity, Linking, ActivityIndicator, Image, SafeAreaView, Alert, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';

// --- MOCK LEADS (Scraped Data) ---
const MOCK_LEADS = {
    '123': { name: 'Austin Tennis Center', sport: 'Tennis', city: 'Austin', type: 'Facility' },
    '456': { name: 'Sarah Miller', sport: 'Yoga', city: 'Los Angeles', type: 'Trainer' },
    '789': { name: 'Downtown Pickleball', sport: 'Pickleball', city: 'Miami', type: 'Facility' }
};

const ClipApp = () => {
    const [id, setId] = useState < string | null > (null);
    const [lead, setLead] = useState < any > (null);
    const [mode, setMode] = useState < 'claim' | 'success' > ('claim');
    const [phone, setPhone] = useState('');

    // Derived state
    const isTrainer = lead?.type === 'Trainer';

    useEffect(() => {
        const handleUrl = async () => {
            let targetId = '123';
            let detectedMode: 'claim' | 'book' = 'book'; // Default to booking if unsure

            try {
                const initialUrl = await Linking.getInitialURL();
                if (initialUrl) {
                    // Routing Logic
                    // 1. goodrunss.com/claim/[id] -> Claim Mode
                    // 2. goodrunss.com/book/[id]  -> Book Mode
                    if (initialUrl.includes('/claim/')) {
                        detectedMode = 'claim';
                        const parts = initialUrl.split('/claim/');
                        if (parts.length > 1) targetId = parts[1];
                    } else if (initialUrl.includes('/book/') || initialUrl.includes('/c/')) {
                        detectedMode = 'book';
                        const parts = initialUrl.split(initialUrl.includes('/book/') ? '/book/' : '/c/');
                        if (parts.length > 1) targetId = parts[1];
                    }
                }
            } catch (e) {
                console.log(e);
            }

            setId(targetId);
            setLead(MOCK_LEADS[targetId] || { name: 'Unknown Venue', sport: 'Sports', city: 'City', type: 'Facility' });
            setMode(detectedMode); // Set the initial mode
        };
        handleUrl();
    }, []);

    const handleClaim = async () => {
        try {
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });
            // In real app -> POST /api/claim-listing { id, user }
            setMode('success');
        } catch (e: any) {
            if (e.code !== 'ERR_CANCELED') Alert.alert("Error", "Sign in failed");
        }
    };

    const handleDownloadAdmin = () => {
        Linking.openURL('https://apps.apple.com/us/app/goodrunss-admin/id123456');
    };

    // --- RENDER ROUTER ---
    if (mode === 'success') {
        return (
            <SafeAreaView style={styles.container}>
                <View style={[styles.content, { justifyContent: 'center' }]}>
                    <View style={styles.successIcon}><Text style={{ fontSize: 50 }}>✅</Text></View>
                    <Text style={styles.title}>Success!</Text>
                    <Text style={styles.subtitle}>
                        {phone ? 'Your booking is confirmed.' : `${lead?.name} is claimed.`}
                    </Text>
                    <TouchableOpacity style={styles.primaryButton} onPress={handleDownloadAdmin}>
                        <Text style={styles.primaryButtonText}>Download Full App</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    if (mode === 'book') {
        return (
            <View style={styles.container}>
                <Image source={{ uri: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0' }} style={styles.heroImage} />
                <View style={styles.overlay}><View style={styles.badge}><Text style={styles.badgeText}>INSTANT BOOKING</Text></View></View>

                <View style={styles.sheet}>
                    <Text style={styles.sport}>{lead?.sport}</Text>
                    <Text style={styles.title}>{lead?.name}</Text>
                    <Text style={styles.subtitle}>Next slot: Today, 6:00 PM • $20.00</Text>

                    <View style={{ flex: 1 }} />
                    <AppleAuthentication.AppleAuthenticationButton
                        buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
                        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                        cornerRadius={12}
                        style={styles.appleButton}
                        onPress={() => setMode('success')}
                    />
                </View>
            </View>
        );
    }

    // Default to 'claim' view (existing code below)


    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.header}>
                <Text style={styles.headerBrand}>GoodRunss</Text>
            </SafeAreaView>

            <View style={styles.content}>
                <View style={styles.tag}>
                    <Text style={styles.tagText}>{lead?.type === 'Trainer' ? 'TRAINER PROFILE' : 'FACILITY LISTING'}</Text>
                </View>

                <Text style={styles.heroTitle}>Claim {lead?.name}</Text>

                <View style={styles.previewCard}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Sport</Text>
                        <Text style={styles.value}>{lead?.sport}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.row}>
                        <Text style={styles.label}>Location</Text>
                        <Text style={styles.value}>{lead?.city}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.row}>
                        <Text style={styles.label}>Status</Text>
                        <Text style={[styles.value, { color: '#EAB308' }]}>Unclaimed ⚠️</Text>
                    </View>
                </View>

                <Text style={styles.pitch}>
                    Manage your schedule, accept payments, and find new {isTrainer ? 'clients' : 'players'} instantly.
                </Text>

                <View style={{ flex: 1 }} />

                <Text style={styles.legal}>Verify ownership to go live.</Text>

                <AppleAuthentication.AppleAuthenticationButton
                    buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
                    buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
                    cornerRadius={12}
                    style={styles.appleButton}
                    onPress={handleClaim}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        alignItems: 'center',
        paddingVertical: 10,
        backgroundColor: '#111',
    },
    headerBrand: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 18,
        letterSpacing: 1
    },
    content: {
        flex: 1,
        padding: 30,
    },
    tag: {
        backgroundColor: '#222',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 100,
        marginBottom: 20
    },
    tagText: {
        color: '#84CC16',
        fontWeight: 'bold',
        fontSize: 10,
        letterSpacing: 1
    },
    heroTitle: {
        color: '#fff',
        fontSize: 40,
        fontWeight: '800',
        lineHeight: 40,
        marginBottom: 40,
    },
    previewCard: {
        backgroundColor: '#111',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#333',
        marginBottom: 30
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10
    },
    divider: {
        height: 1,
        backgroundColor: '#222',
    },
    label: {
        color: '#666',
        fontSize: 14
    },
    value: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600'
    },
    pitch: {
        color: '#999',
        fontSize: 16,
        lineHeight: 24
    },
    legal: {
        color: '#444',
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 15
    },
    appleButton: {
        width: '100%',
        height: 54,
        marginBottom: 20
    },
    successIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#222',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        alignSelf: 'center'
    },
    title: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10
    },
    subtitle: {
        color: '#888',
        textAlign: 'center',
        marginBottom: 40,
        fontSize: 16
    },
    primaryButton: {
        backgroundColor: '#84CC16',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center'
    },
    primaryButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16
    },
    statCard: {
        backgroundColor: '#111',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        marginBottom: 40,
        borderWidth: 1,
        borderColor: '#333'
    },
    statBig: {
        color: '#84CC16',
        fontSize: 42,
        fontWeight: 'bold'
    },
    statSmall: {
        color: '#666',
        fontSize: 14
    }
});

AppRegistry.registerComponent('GoodRunssClip', () => ClipApp);
