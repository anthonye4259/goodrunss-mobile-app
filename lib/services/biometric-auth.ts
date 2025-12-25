/**
 * Biometric Authentication Service
 * 
 * Uses Keychain (SecureStore) to persist credentials across reinstalls
 * and Face ID / Touch ID for secure re-authentication.
 */

import * as SecureStore from 'expo-secure-store'
import * as LocalAuthentication from 'expo-local-authentication'

const CREDENTIALS_KEY = 'goodrunss_auth_credentials'

interface StoredCredentials {
    email: string
    password: string  // Stored encrypted in Keychain
    name: string
    userId: string
}

/**
 * Check if biometric authentication is available on the device
 */
export async function isBiometricAvailable(): Promise<boolean> {
    const compatible = await LocalAuthentication.hasHardwareAsync()
    const enrolled = await LocalAuthentication.isEnrolledAsync()
    return compatible && enrolled
}

/**
 * Get the type of biometric authentication available
 */
export async function getBiometricType(): Promise<'face' | 'fingerprint' | 'none'> {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync()

    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        return 'face'
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        return 'fingerprint'
    }
    return 'none'
}

/**
 * Store credentials in Keychain (persists across reinstalls)
 */
export async function saveCredentials(
    email: string,
    password: string,
    name: string,
    userId: string
): Promise<boolean> {
    try {
        const credentials: StoredCredentials = {
            email,
            password,
            name,
            userId
        }

        await SecureStore.setItemAsync(
            CREDENTIALS_KEY,
            JSON.stringify(credentials),
            {
                keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
            }
        )

        console.log('✅ Credentials saved to Keychain')
        return true
    } catch (error) {
        console.error('Failed to save credentials:', error)
        return false
    }
}

/**
 * Check if stored credentials exist in Keychain
 */
export async function hasStoredCredentials(): Promise<boolean> {
    try {
        const stored = await SecureStore.getItemAsync(CREDENTIALS_KEY)
        return stored !== null
    } catch {
        return false
    }
}

/**
 * Get stored email (for display on login screen)
 */
export async function getStoredEmail(): Promise<string | null> {
    try {
        const stored = await SecureStore.getItemAsync(CREDENTIALS_KEY)
        if (stored) {
            const credentials: StoredCredentials = JSON.parse(stored)
            return credentials.email
        }
        return null
    } catch {
        return null
    }
}

/**
 * Get stored name (for welcome message)
 */
export async function getStoredName(): Promise<string | null> {
    try {
        const stored = await SecureStore.getItemAsync(CREDENTIALS_KEY)
        if (stored) {
            const credentials: StoredCredentials = JSON.parse(stored)
            return credentials.name
        }
        return null
    } catch {
        return null
    }
}

/**
 * Authenticate with biometrics and return stored credentials
 */
export async function authenticateWithBiometrics(): Promise<StoredCredentials | null> {
    try {
        // First check if we have stored credentials
        const stored = await SecureStore.getItemAsync(CREDENTIALS_KEY)
        if (!stored) {
            console.log('No stored credentials found')
            return null
        }

        // Prompt for biometric authentication
        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Sign in to GoodRunss',
            cancelLabel: 'Use Password',
            disableDeviceFallback: false,
            fallbackLabel: 'Use Passcode'
        })

        if (result.success) {
            const credentials: StoredCredentials = JSON.parse(stored)
            console.log('✅ Biometric authentication successful')
            return credentials
        } else {
            console.log('Biometric authentication failed or cancelled:', result.error)
            return null
        }
    } catch (error) {
        console.error('Biometric authentication error:', error)
        return null
    }
}

/**
 * Clear stored credentials (on logout or account deletion)
 */
export async function clearStoredCredentials(): Promise<void> {
    try {
        await SecureStore.deleteItemAsync(CREDENTIALS_KEY)
        console.log('✅ Credentials cleared from Keychain')
    } catch (error) {
        console.error('Failed to clear credentials:', error)
    }
}
