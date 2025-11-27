import { MobileNav } from "@/components/mobile/mobile-nav"
import { MarketplaceScreen } from "@/components/mobile/marketplace-screen"

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <MarketplaceScreen />
      <MobileNav />
    </div>
  )
}
