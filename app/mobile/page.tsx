import { redirect } from "next/navigation"
import { MobileNav } from "@/components/mobile/mobile-nav"
import { HomeScreen } from "@/components/mobile/home-screen"

export default function MobilePage() {
  // In a real app, check if user has completed onboarding
  // For now, redirect to onboarding
  redirect("/mobile/onboarding")

  return (
    <div className="min-h-screen bg-background pb-20">
      <HomeScreen />
      <MobileNav />
    </div>
  )
}
