import { HomeScreen } from "@/components/mobile/home-screen"
import { MobileNav } from "@/components/mobile/mobile-nav"
import { QuickActionsWidget } from "@/components/mobile/quick-actions-widget"

export default function MobileHomePage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <HomeScreen />
      <MobileNav />
      <QuickActionsWidget />
    </div>
  )
}
