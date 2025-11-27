import { SOSNeedPlayers } from "@/components/mobile/sos-need-players"
import { MobileNav } from "@/components/mobile/mobile-nav"

export default function SOSPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <SOSNeedPlayers />
      <MobileNav />
    </div>
  )
}
