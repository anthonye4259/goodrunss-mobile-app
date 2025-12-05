import React from "react"
import { TextInput, TextInputProps, View, Text } from "react-native"
import { colors, borderRadius } from "@/lib/design-tokens"

interface InputProps extends TextInputProps {
  label?: string
  error?: string
}

export function Input({ label, error, style, ...props }: InputProps) {
  return (
    <View>
      {label && (
        <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 8 }}>
          {label}
        </Text>
      )}
      <TextInput
        style={[
          {
            backgroundColor: colors.bgTertiary,
            borderWidth: 1,
            borderColor: error ? colors.error : colors.borderPrimary,
            borderRadius: borderRadius.md,
            paddingVertical: 12,
            paddingHorizontal: 16,
            color: colors.textPrimary,
            fontSize: 16,
          },
          style,
        ]}
        placeholderTextColor={colors.textMuted}
        {...props}
      />
      {error && (
        <Text style={{ color: colors.error, fontSize: 12, marginTop: 4 }}>
          {error}
        </Text>
      )}
    </View>
  )
}
