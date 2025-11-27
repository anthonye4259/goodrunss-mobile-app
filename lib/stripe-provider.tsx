import { StripeProvider as StripeProviderNative } from "@stripe/stripe-react-native"
import type { ReactNode } from "react"

// Replace with your Stripe publishable key
const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""

export function StripeProvider({ children }: { children: ReactNode }) {
  return (
    <StripeProviderNative publishableKey={STRIPE_PUBLISHABLE_KEY} merchantIdentifier="merchant.com.goodrunss">
      {children}
    </StripeProviderNative>
  )
}
