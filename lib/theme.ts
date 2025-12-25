/**
 * GoodRunss Design System
 * Centralized theme tokens for consistent styling across the app
 */

// ============================================
// COLORS
// ============================================

export const colors = {
    // Backgrounds
    bg: {
        primary: "#0A0A0A",
        secondary: "#111111",
        card: "#141414",
        elevated: "#1A1A1A",
    },

    // Brand Colors
    primary: "#7ED957",      // Lime green (main CTA)
    primaryDark: "#22C55E",  // Darker lime
    secondary: "#8B5CF6",    // Purple (GIA)
    accent: "#3B82F6",       // Blue (info)

    // Text
    text: {
        primary: "#FFFFFF",
        secondary: "#9CA3AF",
        muted: "#6B7280",
        disabled: "#4B5563",
    },

    // Borders
    border: {
        default: "#1F1F1F",
        subtle: "#2A2A2A",
        highlight: "rgba(126, 217, 87, 0.3)",
    },

    // Status Colors
    status: {
        success: "#22C55E",
        warning: "#FBBF24",
        error: "#EF4444",
        info: "#3B82F6",
    },

    // Activity Levels
    activity: {
        quiet: "#22C55E",
        active: "#EAB308",
        busy: "#F97316",
        packed: "#EF4444",
    },

    // Overlays
    overlay: {
        light: "rgba(255, 255, 255, 0.1)",
        dark: "rgba(0, 0, 0, 0.5)",
        primary: "rgba(126, 217, 87, 0.15)",
        secondary: "rgba(139, 92, 246, 0.15)",
    },
}

// ============================================
// TYPOGRAPHY
// ============================================

export const typography = {
    fontFamily: {
        regular: "Inter_400Regular",
        medium: "Inter_500Medium",
        semibold: "Inter_600SemiBold",
        bold: "Inter_700Bold",
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
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    md: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    lg: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
    },
}

// ============================================
// GRADIENTS
// ============================================

export const gradients = {
    background: ["#0A0A0A", "#141414"],
    hero: ["#0D1F0A", "#0A0A0A", "#1A0A2E"],
    primary: ["#7ED957", "#22C55E"],
    secondary: ["#8B5CF6", "#6D28D9"],
    card: ["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"],
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
