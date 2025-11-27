import { MobileNav } from "@/components/mobile/mobile-nav"
import { TrainerHomeScreen } from "@/components/mobile/trainer-home-screen"

export default function TrainerHomePage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <TrainerHomeScreen />
      <MobileNav userType="trainer" />
    </div>
  )
}
