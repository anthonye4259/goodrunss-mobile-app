import Purchases, { PurchasesOffering, PurchasesPackage, CustomerInfo } from 'react-native-purchases';
import { Platform } from 'react-native';

// Keys from RevenueCat Dashboard (User needs to set these)
const API_KEYS = {
    apple: "test_TJNBixMPtnFLzrVWsWZhBOtCUQf",
    google: "goog_YOUR_GOOGLE_API_KEY"
};

export class RevenueCatService {
    private static instance: RevenueCatService;
    private isInitialized = false;

    private constructor() { }

    public static getInstance(): RevenueCatService {
        if (!RevenueCatService.instance) {
            RevenueCatService.instance = new RevenueCatService();
        }
        return RevenueCatService.instance;
    }

    public async initialize(userId?: string) {
        if (this.isInitialized) return;

        if (Platform.OS === 'ios') {
            await Purchases.configure({ apiKey: API_KEYS.apple, appUserID: userId });
        } else if (Platform.OS === 'android') {
            await Purchases.configure({ apiKey: API_KEYS.google, appUserID: userId });
        }

        this.isInitialized = true;
    }

    public async getOfferings(): Promise<PurchasesOffering | null> {
        try {
            const offerings = await Purchases.getOfferings();
            if (offerings.current !== null) {
                return offerings.current;
            }
            return null;
        } catch (e) {
            console.error("Error fetching offerings", e);
            return null;
        }
    }

    public async purchasePackage(pack: PurchasesPackage): Promise<boolean> {
        try {
            const { customerInfo } = await Purchases.purchasePackage(pack);
            return this.isPro(customerInfo);
        } catch (e: any) {
            if (!e.userCancelled) {
                console.error("Purchase error", e);
            }
            return false;
        }
    }

    public async restorePurchases(): Promise<boolean> {
        try {
            const customerInfo = await Purchases.restorePurchases();
            return this.isPro(customerInfo);
        } catch (e) {
            console.error("Restore error", e);
            return false;
        }
    }

    public async getCustomerInfo(): Promise<CustomerInfo | null> {
        try {
            return await Purchases.getCustomerInfo();
        } catch (e) {
            return null;
        }
    }

    public isPro(customerInfo: CustomerInfo): boolean {
        // Check for "pro" entitlement
        if (customerInfo.entitlements.active["pro"]) {
            return true;
        }
        return false;
    }
}

export const revenueCatService = RevenueCatService.getInstance();
