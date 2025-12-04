import React from "react"
import { TouchableOpacity, Text, TouchableOpacityProps, StyleSheet } from "react-native"

interface ButtonProps extends TouchableOpacityProps {
  children?: React.ReactNode
  variant?: "default" | "outline" | "ghost"
  size?: "sm" | "default" | "lg"
}

export function Button({ children, variant = "default", size = "default", style, ...props }: ButtonProps) {
  const getBackgroundColor = () => {
    switch (variant) {
      case "outline": return "transparent"
      case "ghost": return "transparent"
      default: return "#84CC16"
    }
  }

  const getPadding = () => {
    switch (size) {
      case "sm": return 8
      case "lg": return 16
      default: return 12
    }
  }

  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: getBackgroundColor(),
          borderRadius: 8,
          padding: getPadding(),
          alignItems: "center",
          justifyContent: "center",
          borderWidth: variant === "outline" ? 1 : 0,
          borderColor: "#333",
        },
        style
      ]}
      {...props}
    >
      {typeof children === "string" ? (
        <Text style={{ color: variant === "default" ? "#000" : "#fff", fontWeight: "600" }}>
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  )
}



