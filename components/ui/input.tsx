import React from "react"
import { TextInput, TextInputProps, StyleSheet } from "react-native"

interface InputProps extends TextInputProps {
  className?: string
}

export function Input({ className, style, ...props }: InputProps) {
  return (
    <TextInput
      style={[
        {
          backgroundColor: "#1a1a1a",
          borderRadius: 8,
          padding: 12,
          color: "#fff",
          borderWidth: 1,
          borderColor: "#333",
          fontSize: 16,
        },
        style
      ]}
      placeholderTextColor="#666"
      {...props}
    />
  )
}



