import { MobileNav } from "@/components/mobile/mobile-nav"
import { TrainerDashboardScreen } from "@/components/mobile/trainer-dashboard-screen"

export default function TrainerDashboardPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <TrainerDashboardScreen />
      <MobileNav />
    </div>
  )
}
