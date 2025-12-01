import React, { ReactNode } from "react"

interface StripeProviderProps {
  children: ReactNode
}

// Stripe provider placeholder - configure with your Stripe keys when ready
export function StripeProvider({ children }: StripeProviderProps) {
  // TODO: Add Stripe configuration when ready for payments
  // import { StripeProvider as StripeProviderNative } from "@stripe/stripe-react-native"
  // return (
  //   <StripeProviderNative publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""}>
  //     {children}
  //   </StripeProviderNative>
  // )
  
  return <>{children}</>
}
