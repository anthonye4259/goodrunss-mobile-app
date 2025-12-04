import React, { createContext, useContext, useState, ReactNode } from "react"
import { View, TouchableOpacity, Text, StyleSheet } from "react-native"

interface TabsContextType {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = createContext<TabsContextType | null>(null)

interface TabsProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  children: ReactNode
  style?: any
}

export function Tabs({ value: controlledValue, defaultValue, onValueChange, children, style }: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue || "")
  
  const value = controlledValue !== undefined ? controlledValue : internalValue
  
  const handleValueChange = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
  }

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <View style={style}>
        {children}
      </View>
    </TabsContext.Provider>
  )
}

interface TabsListProps {
  children: ReactNode
  style?: any
}

export function TabsList({ children, style }: TabsListProps) {
  return (
    <View style={[styles.tabsList, style]}>
      {children}
    </View>
  )
}

interface TabsTriggerProps {
  value: string
  children: ReactNode
  style?: any
}

export function TabsTrigger({ value, children, style }: TabsTriggerProps) {
  const context = useContext(TabsContext)
  
  if (!context) {
    throw new Error("TabsTrigger must be used within Tabs")
  }

  const isActive = context.value === value

  return (
    <TouchableOpacity
      style={[styles.tabsTrigger, isActive && styles.tabsTriggerActive, style]}
      onPress={() => context.onValueChange(value)}
    >
      {typeof children === "string" ? (
        <Text style={[styles.tabsTriggerText, isActive && styles.tabsTriggerTextActive]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  )
}

interface TabsContentProps {
  value: string
  children: ReactNode
  style?: any
}

export function TabsContent({ value, children, style }: TabsContentProps) {
  const context = useContext(TabsContext)
  
  if (!context) {
    throw new Error("TabsContent must be used within Tabs")
  }

  if (context.value !== value) {
    return null
  }

  return <View style={style}>{children}</View>
}

const styles = StyleSheet.create({
  tabsList: {
    flexDirection: "row",
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    padding: 4,
  },
  tabsTrigger: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  tabsTriggerActive: {
    backgroundColor: "#84CC16",
  },
  tabsTriggerText: {
    color: "#888",
    fontWeight: "500",
  },
  tabsTriggerTextActive: {
    color: "#000",
  },
})
