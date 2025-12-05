/**
 * Design Tokens for GoodRunss
 * Single source of truth for colors, spacing, typography, etc.
 */

// Colors
export const colors = {
    // Primary Brand Colors
    primary: '#7ED957',
    primaryDark: '#6BC045',
    primaryLight: '#9FE577',

    // Background Colors
    bgPrimary: '#0A0A0A',
    bgSecondary: '#141414',
    bgTertiary: '#1A1A1A',

    // Text Colors
    textPrimary: '#FFFFFF',
    textSecondary: '#A1A1AA',
    textMuted: '#71717A',

    // Border Colors
    borderPrimary: '#27272A',
    borderAccent: '#7ED957',

    // Status Colors
    success: '#7ED957',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',

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

// Typography
export const typography = {
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
    bgSecondary: 'bg-[#141414]',
    bgTertiary: 'bg-[#1A1A1A]',

    // Text
    textPrimary: 'text-white',
    textSecondary: 'text-[#A1A1AA]',
    textMuted: 'text-[#71717A]',

    // Borders
    borderPrimary: 'border-[#27272A]',
    borderAccent: 'border-[#7ED957]',

    // Primary
    primary: 'bg-[#7ED957]',
    primaryText: 'text-[#7ED957]',
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
