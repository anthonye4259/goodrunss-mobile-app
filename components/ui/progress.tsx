import React from "react"
import { View, StyleSheet, ViewStyle } from "react-native"

interface ProgressProps {
  value?: number
  max?: number
  style?: ViewStyle
  indicatorStyle?: ViewStyle
}

export function Progress({ value = 0, max = 100, style, indicatorStyle }: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <View style={[styles.container, style]}>
      <View 
        style={[
          styles.indicator, 
          { width: `${percentage}%` },
          indicatorStyle
        ]} 
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 8,
    backgroundColor: "#333",
    borderRadius: 4,
    overflow: "hidden",
  },
  indicator: {
    height: "100%",
    backgroundColor: "#7ED957",
    borderRadius: 4,
  },
})
