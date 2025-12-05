import React, { createContext, useContext, useState } from "react"
import { View, TouchableOpacity, StyleSheet } from "react-native"

interface RadioGroupContextType {
  value: string
  onValueChange: (value: string) => void
}

const RadioGroupContext = createContext<RadioGroupContextType | null>(null)

interface RadioGroupProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  style?: any
}

export function RadioGroup({ 
  value: controlledValue, 
  defaultValue, 
  onValueChange, 
  children, 
  style 
}: RadioGroupProps) {
  const [internalValue, setInternalValue] = useState(defaultValue || "")
  
  const value = controlledValue !== undefined ? controlledValue : internalValue
  
  const handleValueChange = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
  }

  return (
    <RadioGroupContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <View style={[styles.group, style]}>
        {children}
      </View>
    </RadioGroupContext.Provider>
  )
}

interface RadioGroupItemProps {
  value: string
  children?: React.ReactNode
  style?: any
}

export function RadioGroupItem({ value, children, style }: RadioGroupItemProps) {
  const context = useContext(RadioGroupContext)
  
  if (!context) {
    throw new Error("RadioGroupItem must be used within a RadioGroup")
  }

  const isSelected = context.value === value

  return (
    <TouchableOpacity
      style={[styles.item, style]}
      onPress={() => context.onValueChange(value)}
    >
      <View style={[styles.radio, isSelected && styles.radioSelected]}>
        {isSelected && <View style={styles.radioInner} />}
      </View>
      {children}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  group: {
    gap: 8,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#7ED957",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: "#7ED957",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#7ED957",
  },
})
