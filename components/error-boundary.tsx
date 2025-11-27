import type React from "react"
import { Component, type ReactNode } from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[v0] Error caught by boundary:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <LinearGradient colors={["#0A0A0A", "#141414"]} className="flex-1 items-center justify-center px-6">
          <View className="items-center">
            <View className="bg-red-500/20 rounded-full w-20 h-20 items-center justify-center mb-6">
              <Ionicons name="alert-circle" size={48} color="#FF6B6B" />
            </View>
            <Text className="text-foreground font-bold text-2xl mb-2 text-center">Something went wrong</Text>
            <Text className="text-muted-foreground text-center mb-6">
              We encountered an unexpected error. Please try again.
            </Text>
            <TouchableOpacity
              className="bg-primary rounded-xl px-8 py-4"
              onPress={() => this.setState({ hasError: false, error: null })}
            >
              <Text className="text-background font-bold">Try Again</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      )
    }

    return this.props.children
  }
}
