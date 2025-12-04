import React, { ReactNode } from "react"
import { Text, StyleSheet, TextStyle } from "react-native"

interface LabelProps {
  children: ReactNode
  htmlFor?: string // For compatibility, but not used in RN
  style?: TextStyle
}

export function Label({ children, style }: LabelProps) {
  return (
    <Text style={[styles.label, style]}>
      {children}
    </Text>
  )
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
    marginBottom: 4,
  },
})
