import React, { useEffect, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, Linking } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"
import { revenueCatService } from "@/lib/revenue-cat"
import Purchases, { PurchasesPackage } from "react-native-purchases"

export default function SubscriptionScreen() {
    const [offering, setOffering] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadOfferings()
    }, [])

    const loadOfferings = async () => {
        try {
            setError(null)

            // Initialize RevenueCat
            try {
                await revenueCatService.initialize()
            } catch (initError: any) {
                setError("Configuration error. Please contact support.")
                setLoading(false)
                return
            }

            // Fetch offerings
            let offerings
            try {
                offerings = await Purchases.getOfferings()
            } catch (offeringsError: any) {
                // Check for specific StoreKit errors
                const errorCode = offeringsError?.code || offeringsError?.userInfo?.code
                if (errorCode === 2 || errorCode === "STORE_PROBLEM") {
                    setError("App Store connection issue. Please try again.")
                } else if (errorCode === 1 || errorCode === "UNKNOWN") {
                    setError("Service temporarily unavailable.")
                } else {
                    setError("Could not connect to App Store.")
                }
                setLoading(false)
                return
            }

            let targetPackage: PurchasesPackage | null = null

            // 1. Try current offering first
            if (offerings.current && offerings.current.availablePackages.length > 0) {
                targetPackage = offerings.current.availablePackages.find((p: any) => p.packageType === "MONTHLY")
                if (!targetPackage) {
                    targetPackage = offerings.current.availablePackages.find((p: any) =>
                        p.identifier === "trainer_monthly" ||
                        p.identifier === "$rc_monthly" ||
                        p.identifier === "monthly"
                    )
                }
                if (!targetPackage) {
                    targetPackage = offerings.current.availablePackages[0]
                }
            }

            // 2. Fallback: Search all offerings
            if (!targetPackage) {
                for (const key of Object.keys(offerings.all)) {
                    const off = offerings.all[key]
                    if (off.availablePackages.length > 0) {
                        targetPackage = off.availablePackages.find((p: any) =>
                            p.packageType === "MONTHLY" ||
                            p.identifier === "trainer_monthly" ||
                            p.identifier === "$rc_monthly"
                        ) || off.availablePackages[0]
                        break
                    }
                }
            }

            // 3. Final Fallback: Fetch products directly
            if (!targetPackage) {
                try {
                    const productIds = ["goodrunss_29_1m", "com.goodrunss.facility.monthly"]
                    const products = await Purchases.getProducts(productIds)

                    if (products.length > 0) {
                        setOffering({
                            availablePackages: [],
                            storeProducts: products
                        })
                        setError("Subscription setup in progress. Please try again in a few minutes.")
                        setLoading(false)
                        return
                    }
                } catch (productError) {
                    // Products fetch failed - continue to show general error
                }
            }

            if (!targetPackage) {
                setError("Subscription not available. Please try again later.")
            } else {
                setOffering({ availablePackages: [targetPackage] })
            }

        } catch (e: any) {
            setError("Unable to load subscription. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleRestore = async () => {
        setProcessing(true)
        const success = await revenueCatService.restorePurchases()
        setProcessing(false)
        if (success) {
            Alert.alert("Success", "Your purchases check out. Welcome back! 🚀", [
                { text: "OK", onPress: () => router.back() }
            ])
        } else {
            Alert.alert("No Subscription Found", "We couldn't find an active pro subscription for this Apple ID.")
        }
    }

    const handlePurchase = async (pack: PurchasesPackage | null | undefined) => {
        if (!pack) {
            Alert.alert("Loading...", "Subscription is still loading. Please wait a moment and try again.")
            return
        }
        setProcessing(true)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

        try {
            const success = await revenueCatService.purchasePackage(pack)
            if (success) {
                Alert.alert("You're Pro! 🏆", "You now have full access to the Trainer SaaS tools.", [
                    { text: "Let's Work", onPress: () => router.back() }
                ])
            }
        } catch (e) {
            console.log("Purchase failed or cancelled")
            Alert.alert("Purchase Failed", "Something went wrong. Please try again.")
        } finally {
            setProcessing(false)
        }
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

    // Fallback Package if RevenueCat not configured
    // Flexible Package Selection:
    // 1. Try to find explicit MONTHLY type
    // 2. Fallback to the FIRST available package in the list (since we might have filtered specifically for it)
    const monthlyPackage = offering?.availablePackages?.find((p: any) => p.packageType === "MONTHLY")
        || offering?.availablePackages?.[0]

    return (
        <View style={styles.container}>
            <Image
                source={{ uri: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=2670&auto=format&fit=crop" }}
                style={styles.bgImage}
                blurRadius={10}
            />
            <LinearGradient colors={["rgba(0,0,0,0.6)", "#000"]} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                        <Ionicons name="close" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleRestore}>
                        <Text style={styles.restoreText}>Restore Purchases</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    <View style={styles.heroContainer}>
                        <Text style={styles.preheader}>COMPLETE COACHUP REPLACEMENT</Text>
                        <Text style={styles.title}>Run Your Entire</Text>
                        <Text style={[styles.title, { color: '#7ED957' }]}>Business on Mobile.</Text>
                    </View>

                    <View style={styles.benefitsContainer}>
                        <BenefitItem
                            icon="phone-portrait"
                            title="Mobile CRM"
                            desc="Import contacts, track clients, and log sessions in seconds."
                        />
                        <BenefitItem
                            icon="receipt"
                            title="Instant Invoicing"
                            desc="Send professional payment links via text. Get paid faster."
                        />
                        <BenefitItem
                            icon="megaphone"
                            title="Marketing Campaigns"
                            desc="Blast customized SMS offers to your client list."
                        />
                        <BenefitItem
                            icon="trending-up"
                            title="Lead Generation"
                            desc="Get matching player leads delivered daily."
                        />
                    </View>

                    <View style={styles.pricingCard}>
                        <View style={styles.popularBadge}>
                            <Text style={styles.popularText}>MOST POPULAR</Text>
                        </View>
                        <Text style={styles.planName}>Pro Trainer SaaS</Text>

                        {/* HERO PRICE START - Guideline 3.1.2 */}
                        <View style={styles.priceRow}>
                            <Text style={styles.amount}>{monthlyPackage?.product?.priceString || "$29.00"}</Text>
                            <Text style={styles.period}>/month</Text>
                        </View>
                        {/* HERO PRICE END */}

                        <Text style={styles.cancelText}>Cancel anytime. No lock-in.</Text>

                        {/* Error State */}
                        {error && (
                            <View style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                                <Text style={{ color: '#EF4444', textAlign: 'center', fontSize: 14, marginBottom: 8 }}>{error}</Text>
                                <TouchableOpacity
                                    onPress={() => { setLoading(true); loadOfferings(); }}
                                    style={{ backgroundColor: '#EF4444', borderRadius: 8, padding: 10 }}
                                >
                                    <Text style={{ color: '#FFF', textAlign: 'center', fontWeight: '600' }}>Retry</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Subscribe Button */}
                        {!error && (
                            <TouchableOpacity
                                style={[styles.payBtn, (!monthlyPackage || loading) && { opacity: 0.5 }]}
                                onPress={() => handlePurchase(monthlyPackage)}
                                disabled={processing || loading || !monthlyPackage}
                            >
                                <LinearGradient
                                    colors={['#7ED957', '#4C9E29']}
                                    style={styles.payGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    {processing || loading ? (
                                        <ActivityIndicator color="#000" />
                                    ) : (
                                        <>
                                            {/* Button Text Constraint: Must reference billing validity */}
                                            <Text style={styles.payText}>Subscribe</Text>
                                            <Ionicons name="arrow-forward" size={20} color="#000" />
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        )}

                        {/* Subordinate Trial Text */}
                        <Text style={styles.trialText}>Includes 7-Day Free Trial</Text>
                    </View>

                    <TouchableOpacity onPress={() => Linking.openURL('https://goodrunss.com/terms')}>
                        <Text style={styles.footerText}>
                            By syncing, you agree to our Terms of Service and Privacy Policy. Subscription auto-renews unless turned off in your Apple ID settings.
                        </Text>
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 10 }}>
                        <TouchableOpacity onPress={() => Linking.openURL('https://www.goodrunss.com/privacy')}>
                            <Text style={[styles.footerText, { textDecorationLine: 'underline' }]}>Privacy Policy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => Linking.openURL('https://www.goodrunss.com/terms')}>
                            <Text style={[styles.footerText, { textDecorationLine: 'underline' }]}>Terms of Use</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </SafeAreaView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000" },
    bgImage: { ...StyleSheet.absoluteFillObject, opacity: 0.4 },
    safeArea: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
    closeBtn: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center', justifyContent: 'center'
    },
    restoreText: { color: '#999', fontSize: 14, fontWeight: '600' },

    content: { paddingHorizontal: 20, paddingBottom: 60 },

    heroContainer: { marginTop: 10, marginBottom: 30 },
    preheader: { color: '#7ED957', fontWeight: 'bold', fontSize: 12, letterSpacing: 1, marginBottom: 8 },
    title: { fontSize: 36, fontWeight: '900', color: '#FFF', lineHeight: 40 },

    benefitsContainer: { gap: 24, marginBottom: 40 },
    benefitRow: { flexDirection: 'row', gap: 16 },
    iconBox: {
        width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(126, 217, 87, 0.1)',
        alignItems: 'center', justifyContent: 'center'
    },
    benefitTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
    benefitDesc: { color: '#CCC', lineHeight: 20, fontSize: 14 },

    pricingCard: {
        backgroundColor: 'rgba(30,30,30,0.9)', borderRadius: 24, padding: 24,
        borderWidth: 1, borderColor: '#7ED957', marginBottom: 24,
        shadowColor: "#7ED957", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 20
    },
    popularBadge: {
        position: 'absolute', top: -12, alignSelf: 'center',
        backgroundColor: '#7ED957', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12
    },
    popularText: { color: '#000', fontWeight: 'bold', fontSize: 10 },

    planName: { color: '#FFF', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginTop: 8 },
    priceRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', marginVertical: 12 },
    amount: { fontSize: 48, fontWeight: '900', color: '#FFF' },
    period: { fontSize: 16, color: '#999', marginBottom: 8 },
    cancelText: { color: '#999', textAlign: 'center', fontSize: 12, marginBottom: 20 },

    payBtn: { borderRadius: 16, overflow: 'hidden', marginBottom: 12 },
    payGradient: { paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    payText: { color: '#000', fontSize: 18, fontWeight: '900', textTransform: 'uppercase' },
    trialText: { color: '#666', textAlign: 'center', fontSize: 12 },

    footerText: { color: '#444', textAlign: 'center', fontSize: 10, lineHeight: 14 }
})
