import React from "react"
import { TouchableOpacity, Text, TouchableOpacityProps, ActivityIndicator, View } from "react-native"
import { colors } from "@/lib/design-tokens"
import * as Haptics from "expo-haptics"

interface ButtonProps extends TouchableOpacityProps {
  children?: React.ReactNode
  variant?: "primary" | "secondary" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
  loading?: boolean
  icon?: React.ReactNode
  fullWidth?: boolean
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  fullWidth = false,
  disabled,
  onPress,
  ...props
}: ButtonProps) {
  const handlePress = (e: any) => {
    if (!disabled && !loading && onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      onPress(e)
    }
  }

  const getBackgroundColor = () => {
    switch (variant) {
      case "secondary":
      case "ghost":
        return "transparent"
      case "danger":
        return colors.error
      default:
        return colors.primary
    }
  }

  const getPadding = () => {
    switch (size) {
      case "sm":
        return 8
      case "lg":
        return 16
      default:
        return 12
    }
  }

  const getTextColor = () => {
    switch (variant) {
      case "primary":
        return colors.black
      case "danger":
        return colors.white
      case "ghost":
        return colors.primary
      default:
        return colors.white
    }
  }

  return (
    <TouchableOpacity
      style={{
        backgroundColor: getBackgroundColor(),
        borderRadius: 12,
        paddingVertical: getPadding(),
        paddingHorizontal: getPadding() * 2,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: variant === "secondary" ? 1 : 0,
        borderColor: colors.borderPrimary,
        opacity: disabled || loading ? 0.5 : 1,
        flexDirection: "row",
        width: fullWidth ? "100%" : undefined,
      }}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? colors.black : colors.white} />
      ) : (
        <>
          {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
          {typeof children === "string" ? (
            <Text style={{ color: getTextColor(), fontWeight: "600", fontSize: size === "sm" ? 14 : size === "lg" ? 18 : 16 }}>
              {children}
            </Text>
          ) : (
            children
          )}
        </>
      )}
    </TouchableOpacity>
  )
}
