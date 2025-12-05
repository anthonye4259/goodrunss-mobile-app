import { Linking, Platform, Alert } from 'react-native';

export interface Location {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
}

export class MapsService {
    private static instance: MapsService;

    static getInstance(): MapsService {
        if (!MapsService.instance) {
            MapsService.instance = new MapsService();
        }
        return MapsService.instance;
    }

    /**
     * Open native maps app with directions to a location
     */
    async openDirections(destination: Location): Promise<boolean> {
        try {
            const { latitude, longitude, name, address } = destination;

            if (Platform.OS === 'ios') {
                // Apple Maps on iOS
                const url = `maps://app?daddr=${latitude},${longitude}&dirflg=d`;
                const canOpen = await Linking.canOpenURL(url);

                if (canOpen) {
                    await Linking.openURL(url);
                    return true;
                } else {
                    // Fallback to web Apple Maps
                    const webUrl = `https://maps.apple.com/?daddr=${latitude},${longitude}`;
                    await Linking.openURL(webUrl);
                    return true;
                }
            } else {
                // Google Maps on Android
                const label = name || address || 'Destination';
                const url = `google.navigation:q=${latitude},${longitude}&mode=d`;
                const canOpen = await Linking.canOpenURL(url);

                if (canOpen) {
                    await Linking.openURL(url);
                    return true;
                } else {
                    // Fallback to web Google Maps
                    const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
                    await Linking.openURL(webUrl);
                    return true;
                }
            }
        } catch (error) {
            console.error('[MapsService] Error opening directions:', error);
            Alert.alert(
                'Unable to Open Maps',
                'Please make sure you have Maps installed on your device.'
            );
            return false;
        }
    }

    /**
     * Open maps app to view a location (without directions)
     */
    async openLocation(location: Location): Promise<boolean> {
        try {
            const { latitude, longitude, name } = location;

            if (Platform.OS === 'ios') {
                // Apple Maps
                const url = `maps://app?ll=${latitude},${longitude}&q=${encodeURIComponent(name || 'Location')}`;
                await Linking.openURL(url);
                return true;
            } else {
                // Google Maps
                const url = `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodeURIComponent(name || 'Location')})`;
                await Linking.openURL(url);
                return true;
            }
        } catch (error) {
            console.error('[MapsService] Error opening location:', error);
            return false;
        }
    }

    /**
     * Get directions URL (for sharing or opening in browser)
     */
    getDirectionsUrl(destination: Location): string {
        const { latitude, longitude } = destination;

        if (Platform.OS === 'ios') {
            return `https://maps.apple.com/?daddr=${latitude},${longitude}`;
        } else {
            return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
        }
    }

    /**
     * Calculate distance between two points (Haversine formula)
     */
    calculateDistance(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ): number {
        const R = 3959; // Earth's radius in miles
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) *
            Math.cos(this.toRad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return Math.round(distance * 10) / 10; // Round to 1 decimal
    }

    /**
     * Convert degrees to radians
     */
    private toRad(degrees: number): number {
        return (degrees * Math.PI) / 180;
    }

    /**
     * Format distance for display
     */
    formatDistance(miles: number): string {
        if (miles < 0.1) {
            return 'Nearby';
        } else if (miles < 1) {
            return `${Math.round(miles * 10) / 10} mi`;
        } else {
            return `${Math.round(miles)} mi`;
        }
    }

    /**
     * Open maps with multiple locations (show all venues on map)
     */
    async openMultipleLocations(locations: Location[]): Promise<boolean> {
        if (locations.length === 0) return false;

        if (locations.length === 1) {
            return this.openLocation(locations[0]);
        }

        try {
            if (Platform.OS === 'ios') {
                // Apple Maps doesn't support multiple pins via URL scheme well
                // Open first location
                return this.openLocation(locations[0]);
            } else {
                // Google Maps can show multiple locations
                const coords = locations
                    .map((loc) => `${loc.latitude},${loc.longitude}`)
                    .join('|');
                const url = `https://www.google.com/maps/dir/?api=1&waypoints=${coords}`;
                await Linking.openURL(url);
                return true;
            }
        } catch (error) {
            console.error('[MapsService] Error opening multiple locations:', error);
            return false;
        }
    }
}
