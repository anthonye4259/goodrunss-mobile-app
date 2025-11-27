import { MobileNav } from "@/components/mobile/mobile-nav"
import { CourtsScreen } from "@/components/mobile/courts-screen"

export default function CourtsPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <CourtsScreen />
      <MobileNav />
    </div>
  )
}
