/**
 * Typography Utilities for GoodRunss
 * 
 * Uses Inter font for premium, modern typography
 * Import and use these styles throughout the app for consistency
 */

import { TextStyle } from "react-native"

// Font family names as loaded by expo-google-fonts
export const fonts = {
    regular: "Outfit_400Regular",
    medium: "Outfit_500Medium",
    semibold: "Outfit_600SemiBold",
    bold: "Outfit_700Bold",
} as const

// Typography scale with font families
export const typography = {
    // Display - Big hero numbers/text
    displayLarge: {
        fontFamily: fonts.bold,
        fontSize: 40,
        lineHeight: 48,
        letterSpacing: -1,
    } as TextStyle,

    displayMedium: {
        fontFamily: fonts.bold,
        fontSize: 32,
        lineHeight: 40,
        letterSpacing: -0.5,
    } as TextStyle,

    // Headlines
    h1: {
        fontFamily: fonts.bold,
        fontSize: 28,
        lineHeight: 36,
        letterSpacing: -0.5,
    } as TextStyle,

    h2: {
        fontFamily: fonts.semibold,
        fontSize: 24,
        lineHeight: 32,
        letterSpacing: -0.3,
    } as TextStyle,

    h3: {
        fontFamily: fonts.semibold,
        fontSize: 20,
        lineHeight: 28,
    } as TextStyle,

    h4: {
        fontFamily: fonts.semibold,
        fontSize: 18,
        lineHeight: 26,
    } as TextStyle,

    // Body text
    bodyLarge: {
        fontFamily: fonts.regular,
        fontSize: 16,
        lineHeight: 24,
    } as TextStyle,

    body: {
        fontFamily: fonts.regular,
        fontSize: 14,
        lineHeight: 22,
    } as TextStyle,

    bodySmall: {
        fontFamily: fonts.regular,
        fontSize: 13,
        lineHeight: 20,
    } as TextStyle,

    // Labels & Captions
    label: {
        fontFamily: fonts.medium,
        fontSize: 14,
        lineHeight: 20,
    } as TextStyle,

    labelSmall: {
        fontFamily: fonts.medium,
        fontSize: 12,
        lineHeight: 16,
    } as TextStyle,

    caption: {
        fontFamily: fonts.regular,
        fontSize: 12,
        lineHeight: 16,
    } as TextStyle,

    tiny: {
        fontFamily: fonts.medium,
        fontSize: 10,
        lineHeight: 14,
        letterSpacing: 0.5,
    } as TextStyle,

    // Buttons
    buttonLarge: {
        fontFamily: fonts.semibold,
        fontSize: 16,
        lineHeight: 24,
    } as TextStyle,

    button: {
        fontFamily: fonts.semibold,
        fontSize: 14,
        lineHeight: 20,
    } as TextStyle,

    buttonSmall: {
        fontFamily: fonts.medium,
        fontSize: 12,
        lineHeight: 16,
    } as TextStyle,
} as const

// Helper to apply font weight (for compatibility with existing code)
export const fontWeight = {
    regular: { fontFamily: fonts.regular },
    medium: { fontFamily: fonts.medium },
    semibold: { fontFamily: fonts.semibold },
    bold: { fontFamily: fonts.bold },
} as const

// Export for design tokens compatibility
export default {
    fonts,
    typography,
    fontWeight,
}
