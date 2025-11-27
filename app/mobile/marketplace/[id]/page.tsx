import { MobileNav } from "@/components/mobile/mobile-nav"
import { MarketplaceItemDetailScreen } from "@/components/mobile/marketplace-item-detail-screen"

export default function MarketplaceItemDetailPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <MarketplaceItemDetailScreen />
      <MobileNav />
    </div>
  )
}
