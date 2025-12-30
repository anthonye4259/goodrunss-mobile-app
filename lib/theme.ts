/**
 * GoodRunss Design System
 * Centralized theme tokens for consistent styling across the app
 * 
 * MATTE SAGE GREEN THEME - Premium, softer aesthetic
 */

// ============================================
// COLORS - Matte Sage Theme
// ============================================

export const colors = {
    // Backgrounds - Warm Blacks
    bg: {
        primary: "#0A0A0A",
        secondary: "#101010",
        card: "#141414",
        elevated: "#1A1A1A",
    },

    // Brand Colors - Matte Sage
    primary: "#6B9B5A",      // Matte sage green (main CTA)
    primaryDark: "#5A8A4A",  // Darker sage
    secondary: "#8B5CF6",    // Purple (GIA)
    accent: "#5B7DB6",       // Muted blue (info)

    // Text - Softer Contrast
    text: {
        primary: "#F0F0F0",
        secondary: "#8A8A8A",
        muted: "#666666",
        disabled: "#444444",
    },

    // Borders
    border: {
        default: "#1F1F1F",
        subtle: "#252525",
        highlight: "rgba(107, 155, 90, 0.3)",
    },

    // Status Colors - Muted
    status: {
        success: "#6B9B5A",
        warning: "#D99B3D",
        error: "#DC4444",
        info: "#5B7DB6",
    },

    // Activity Levels
    activity: {
        quiet: "#6B9B5A",
        active: "#C9A33D",
        busy: "#D97430",
        packed: "#DC4444",
    },

    // Overlays - Using Matte Sage
    overlay: {
        light: "rgba(255, 255, 255, 0.08)",
        dark: "rgba(0, 0, 0, 0.5)",
        primary: "rgba(107, 155, 90, 0.15)",
        secondary: "rgba(139, 92, 246, 0.15)",
    },
}

// ============================================
// TYPOGRAPHY - Outfit Font
// ============================================

export const typography = {
    fontFamily: {
        regular: "Outfit_400Regular",
        medium: "Outfit_500Medium",
        semibold: "Outfit_600SemiBold",
        bold: "Outfit_700Bold",
    },
    fontSize: {
        xs: 10,
        sm: 12,
        md: 14,
        lg: 16,
        xl: 18,
        "2xl": 20,
        "3xl": 24,
        "4xl": 28,
        "5xl": 32,
        hero: 56,
    },
    lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
    },
    letterSpacing: {
        tight: -0.5,
        normal: 0,
        wide: 1,
        wider: 2,
    },
}

// ============================================
// SPACING
// ============================================

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    "2xl": 24,
    "3xl": 32,
    "4xl": 40,
}

// ============================================
// BORDER RADIUS
// ============================================

export const borderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    "2xl": 24,
    full: 999,
}

// ============================================
// SHADOWS (for iOS)
// ============================================

export const shadows = {
    sm: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
    },
    md: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
    },
    lg: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
}

// ============================================
// GRADIENTS - Matte Theme
// ============================================

export const gradients = {
    background: ["#0A0A0A", "#121212"],
    hero: ["#0D1A0A", "#0A0A0A", "#1A0A20"],
    primary: ["#7DAD6C", "#5A8A4A"],
    secondary: ["#8B5CF6", "#6D28D9"],
    card: ["rgba(255,255,255,0.04)", "rgba(255,255,255,0.02)"],
}

// ============================================
// COMMON COMPONENT STYLES
// ============================================

export const commonStyles = {
    card: {
        backgroundColor: colors.bg.card,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border.default,
        padding: spacing.lg,
    },
    button: {
        primary: {
            backgroundColor: colors.primary,
            borderRadius: borderRadius.md,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.xl,
        },
        secondary: {
            backgroundColor: colors.overlay.primary,
            borderRadius: borderRadius.md,
            borderWidth: 1,
            borderColor: colors.border.highlight,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.xl,
        },
    },
    input: {
        backgroundColor: colors.bg.elevated,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border.default,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        color: colors.text.primary,
        fontSize: typography.fontSize.md,
    },
}

// Default export
const theme = {
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
    gradients,
    commonStyles,
}

export default theme

