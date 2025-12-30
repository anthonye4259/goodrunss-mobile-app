/**
 * Design Tokens for GoodRunss
 * Single source of truth for colors, spacing, typography, etc.
 * 
 * MATTE COLOR PALETTE - Premium, softer aesthetic
 */

// Colors - Matte Sage Green Theme
export const colors = {
    // Primary Brand Colors - Matte Sage
    primary: '#6B9B5A',
    primaryDark: '#5A8A4A',
    primaryLight: '#7DAD6C',

    // Background Colors - Warm Blacks
    bgPrimary: '#0A0A0A',
    bgSecondary: '#121212',
    bgTertiary: '#1A1A1A',

    // Text Colors - Softer Contrast
    textPrimary: '#F0F0F0',
    textSecondary: '#8A8A8A',
    textMuted: '#666666',

    // Border Colors
    borderPrimary: '#1F1F1F',
    borderAccent: '#6B9B5A',

    // Status Colors - Muted
    success: '#6B9B5A',
    error: '#DC4444',
    warning: '#D99B3D',
    info: '#5B7DB6',

    // Utility
    black: '#000000',
    white: '#FFFFFF',
    transparent: 'transparent',
} as const;

// Spacing Scale (in pixels)
export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
} as const;

// Typography - Outfit Font Family
export const typography = {
    // Font Family
    fontFamily: {
        regular: 'Outfit_400Regular',
        medium: 'Outfit_500Medium',
        semibold: 'Outfit_600SemiBold',
        bold: 'Outfit_700Bold',
    },

    // Font Sizes
    fontSize: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 32,
        '4xl': 40,
    },

    // Font Weights
    fontWeight: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
    },

    // Line Heights
    lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
    },

    // Letter Spacing (for section headers)
    letterSpacing: {
        tight: -0.5,
        normal: 0,
        wide: 1,
        wider: 2,
    },
} as const;

// Border Radius
export const borderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    full: 9999,
} as const;

// Shadows
export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
} as const;

// Animation Durations (in milliseconds)
export const duration = {
    fast: 150,
    normal: 300,
    slow: 500,
} as const;

// Helper function to get spacing value
export const getSpacing = (size: keyof typeof spacing): number => spacing[size];

// Helper function to create rgba color
export const rgba = (hex: string, alpha: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Tailwind-compatible color classes (for className usage)
export const colorClasses = {
    // Backgrounds
    bgPrimary: 'bg-[#0A0A0A]',
    bgSecondary: 'bg-[#121212]',
    bgTertiary: 'bg-[#1A1A1A]',

    // Text
    textPrimary: 'text-[#F0F0F0]',
    textSecondary: 'text-[#8A8A8A]',
    textMuted: 'text-[#666666]',

    // Borders
    borderPrimary: 'border-[#1F1F1F]',
    borderAccent: 'border-[#6B9B5A]',

    // Primary - Matte Sage
    primary: 'bg-[#6B9B5A]',
    primaryText: 'text-[#6B9B5A]',
} as const;

export default {
    colors,
    spacing,
    typography,
    borderRadius,
    shadows,
    duration,
    rgba,
    getSpacing,
    colorClasses,
};

