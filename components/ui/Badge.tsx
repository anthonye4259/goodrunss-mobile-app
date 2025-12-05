import React from "react"
import { View, Text, ViewProps } from "react-native"
import { colors, borderRadius } from "@/lib/design-tokens"

type BadgeVariant = "default" | "success" | "warning" | "error" | "info"

interface BadgeProps extends ViewProps {
    children: React.ReactNode
    variant?: BadgeVariant
}

export function Badge({ children, variant = "default", style, ...props }: BadgeProps) {
    const getColors = () => {
        switch (variant) {
            case "success":
                return { bg: `${colors.success}33`, text: colors.success }
            case "warning":
                return { bg: `${colors.warning}33`, text: colors.warning }
            case "error":
                return { bg: `${colors.error}33`, text: colors.error }
            case "info":
                return { bg: `${colors.info}33`, text: colors.info }
            default:
                return { bg: `${colors.primary}33`, text: colors.primary }
        }
    }

    const badgeColors = getColors()

    return (
        <View
            style={[
                {
                    backgroundColor: badgeColors.bg,
                    borderRadius: borderRadius.full,
                    paddingVertical: 4,
                    paddingHorizontal: 12,
                    alignSelf: "flex-start",
                },
                style,
            ]}
            {...props}
        >
            <Text style={{ color: badgeColors.text, fontSize: 12, fontWeight: "600" }}>
                {children}
            </Text>
        </View>
    )
}
