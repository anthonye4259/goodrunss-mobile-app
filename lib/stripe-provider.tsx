import React, { ReactNode } from "react"
import { StripeProvider as StripeProviderNative } from "@stripe/stripe-react-native"

interface StripeProviderProps {
  children: ReactNode
}

const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""

// Stripe provider - now configured with production keys!
export function StripeProvider({ children }: StripeProviderProps) {
  if (!STRIPE_PUBLISHABLE_KEY) {
    console.warn("Stripe publishable key not found. Payment features will be disabled.")
    return <>{children}</>
  }

  return (
    <StripeProviderNative publishableKey={STRIPE_PUBLISHABLE_KEY}>
      {children}
    </StripeProviderNative>
  )
}
