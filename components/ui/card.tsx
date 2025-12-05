import React from "react"
import { View, ViewProps } from "react-native"

interface CardProps extends ViewProps {
  children?: React.ReactNode
}

export function Card({ children, className, style, ...props }: CardProps) {
  return (
    <View
      style={[{ backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16 }, style]}
      {...props}
    >
      {children}
    </View>
  )
}




