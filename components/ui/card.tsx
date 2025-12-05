import React from "react"
import { View, ViewProps } from "react-native"
import { colors, borderRadius } from "@/lib/design-tokens"

interface CardProps extends ViewProps {
  children?: React.ReactNode
  variant?: "default" | "glass" | "elevated"
}

export function Card({ children, variant = "default", style, ...props }: CardProps) {
  const getStyles = () => {
    switch (variant) {
      case "glass":
        return {
          backgroundColor: 'rgba(20, 20, 20, 0.8)',
          borderWidth: 1,
          borderColor: `${colors.primary}33`,
        }
      case "elevated":
        return {
          backgroundColor: colors.bgTertiary,
          borderWidth: 1,
          borderColor: colors.borderPrimary,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 4,
        }
      default:
        return {
          backgroundColor: colors.bgSecondary,
          borderWidth: 1,
          borderColor: colors.borderPrimary,
        }
    }
  }

  return (
    <View
      style={[
        {
          borderRadius: borderRadius.xl,
          padding: 16,
          ...getStyles(),
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  )
}
