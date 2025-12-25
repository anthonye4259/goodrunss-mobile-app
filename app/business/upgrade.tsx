import React from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"

export default function UpgradeScreen() {

    const handlePurchase = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        Alert.alert(
            "Welcome to the Club! 🚀",
            "You are now a Founding Trainer. Your Verified Badge is active.",
            [{ text: "Let's Go", onPress: () => router.back() }]
        )
    }

    const BenefitItem = ({ icon, title, desc }: { icon: any, title: string, desc: string }) => (
        <View style={styles.benefitRow}>
            <View style={styles.iconBox}>
                <Ionicons name={icon} size={24} color="#7ED957" />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.benefitTitle}>{title}</Text>
                <Text style={styles.benefitDesc}>{desc}</Text>
            </View>
        </View>
    )

    return (
        <View style={styles.container}>
            <Image
                source={{ uri: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=2575&auto=format&fit=crop" }}
                style={styles.bgImage}
                blurRadius={10}
            />
            <LinearGradient colors={["rgba(0,0,0,0.6)", "#000"]} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                        <Ionicons name="close" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    <View style={styles.badgeContainer}>
                        <LinearGradient colors={['#FFD700', '#FDB931']} style={styles.badge}>
                            <Ionicons name="star" size={32} color="#000" />
                        </LinearGradient>
                        <Text style={styles.title}>Founding Trainer</Text>
                        <Text style={styles.subtitle}>Limited Pre-Launch Offer</Text>
                    </View>

                    <View style={styles.pricingCard}>
                        <Text style={styles.priceLabel}>Early Bird Price</Text>
                        <View style={styles.priceRow}>
                            <Text style={styles.currency}>$</Text>
                            <Text style={styles.amount}>49</Text>
                            <Text style={styles.period}>/lifetime</Text>
                        </View>
                        <Text style={styles.strikeThrough}>Regular $199/year</Text>
                        <View style={styles.saveBadge}>
                            <Text style={styles.saveText}>SAVE 75%</Text>
                        </View>
                    </View>

                    <View style={styles.benefitsContainer}>
                        <BenefitItem
                            icon="shield-checkmark"
                            title="Verified Badge"
                            desc="Stand out with the Blue Check on map and search results."
                        />
                        <BenefitItem
                            icon="phone-portrait"
                            title="Mobile Command Center"
                            desc="Full CRM and Booking tools right in your pocket. No laptop needed."
                        />
                        <BenefitItem
                            icon="megaphone"
                            title="Priority Listing"
                            desc="Get featured in the 'Recommended' section for 6 months."
                        />
                        <BenefitItem
                            icon="card"
                            title="0% Fees"
                            desc="keep 100% of your earnings for the first $5,000 processed."
                        />
                    </View>

                    <View style={styles.fomoBox}>
                        <Ionicons name="people" size={16} color="#FFF" />
                        <Text style={styles.fomoText}>14 other trainers in your area joined today</Text>
                    </View>

                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.payBtn} onPress={handlePurchase}>
                        <LinearGradient
                            colors={['#7ED957', '#4C9E29']}
                            style={styles.payGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.payText}>Join as Founder ($49)</Text>
                            <Ionicons name="arrow-forward" size={20} color="#000" />
                        </LinearGradient>
                    </TouchableOpacity>
                    <Text style={styles.disclaimer}>One-time payment. Secure via Stripe.</Text>
                </View>
            </SafeAreaView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000" },
    bgImage: { ...StyleSheet.absoluteFillObject, opacity: 0.5 },
    safeArea: { flex: 1 },
    header: { padding: 20 },
    closeBtn: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center', justifyContent: 'center'
    },

    content: { paddingHorizontal: 20, paddingBottom: 100 },

    badgeContainer: { alignItems: 'center', marginBottom: 30 },
    badge: {
        width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center',
        marginBottom: 16,
        shadowColor: "#FFD700", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 20
    },
    title: { fontSize: 32, fontWeight: '900', color: '#FFF', textAlign: 'center' },
    subtitle: { fontSize: 16, color: '#CCC', marginTop: 8, letterSpacing: 1, textTransform: 'uppercase' },

    pricingCard: {
        backgroundColor: 'rgba(30,30,30,0.8)', borderRadius: 24, padding: 24,
        alignItems: 'center', borderWidth: 1, borderColor: '#444', marginBottom: 32
    },
    priceLabel: { color: '#999', fontSize: 14, textTransform: 'uppercase', fontWeight: 'bold' },
    priceRow: { flexDirection: 'row', alignItems: 'flex-start', marginVertical: 8 },
    currency: { fontSize: 24, color: '#FFF', fontWeight: 'bold', marginTop: 8 },
    amount: { fontSize: 64, color: '#FFF', fontWeight: '900' },
    period: { fontSize: 16, color: '#999', alignSelf: 'flex-end', marginBottom: 12 },
    strikeThrough: { color: '#666', textDecorationLine: 'line-through', fontSize: 16 },
    saveBadge: {
        position: 'absolute', top: -12, right: 20,
        backgroundColor: '#EF4444', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12
    },
    saveText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },

    benefitsContainer: { gap: 24 },
    benefitRow: { flexDirection: 'row', gap: 16 },
    iconBox: {
        width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(126, 217, 87, 0.1)',
        alignItems: 'center', justifyContent: 'center'
    },
    benefitTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
    benefitDesc: { color: '#999', lineHeight: 20 },

    fomoBox: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        marginTop: 40, padding: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20
    },
    fomoText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },

    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: 20, paddingBottom: 40,
        backgroundColor: '#000', borderTopWidth: 1, borderTopColor: '#222'
    },
    payBtn: {
        borderRadius: 16, overflow: 'hidden', marginBottom: 12
    },
    payGradient: {
        paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8
    },
    payText: { color: '#000', fontSize: 18, fontWeight: '900', textTransform: 'uppercase' },
    disclaimer: { color: '#444', textAlign: 'center', fontSize: 10 }
})
