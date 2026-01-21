import Purchases, { PurchasesOffering, PurchasesPackage, CustomerInfo } from 'react-native-purchases';
import { Platform } from 'react-native';

// Keys from RevenueCat Dashboard (User needs to set these)
// Keys from RevenueCat Dashboard
const API_KEYS = {
    apple: "appl_srZUPxmRipLypYkUEFFkXNHHmXb", // Correct Production Key
    google: "goog_REPLACE_ME_WITH_PRODUCTION_KEY"
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

    public async getProducts(productIdentifiers: string[]): Promise<PurchasesPackage[]> {
        try {
            // Note: getProducts returns StoreProducts, but we need packages for purchase
            // Ideally we use offerings, but this is a fallback. 
            // RevenueCat doesn't let us easily manufacture a "Package" from a "StoreProduct" manually 
            // without it being in an offering.
            // HOWEVER, we can just return the offerings packages if found, 
            // OR if strictly needed, we might need to rely on the offering being correct.
            // If the offering is missing, it's usually a configuration error in RevenueCat Dashboard.
            // But let's try to get offerings again or return empty.

            // Actually, for purchasePackage(pack), we NEED a Package object.
            // Converting StoreProduct to Package isn't standard SDK usage.
            // Best bet: Ensure we can fetch ALl offerings and find it there.
            const offerings = await Purchases.getOfferings();
            const allPackages: PurchasesPackage[] = [];

            // Collect all packages from all offerings
            Object.values(offerings.all).forEach(offering => {
                offering.availablePackages.forEach(p => allPackages.push(p));
            });

            return allPackages.filter(p => productIdentifiers.includes(p.product.identifier));
        } catch (e) {
            console.error("Error fetching products", e);
            return [];
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
