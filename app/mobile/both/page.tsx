import { MobileNav } from "@/components/mobile/mobile-nav"
import { BothHomeScreen } from "@/components/mobile/both-home-screen"

export default function BothHomePage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <BothHomeScreen />
      <MobileNav userType="both" />
    </div>
  )
}
