import { MobileNav } from "@/components/mobile/mobile-nav"
import { ListItemScreen } from "@/components/mobile/list-item-screen"

export default function ListItemPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <ListItemScreen />
      <MobileNav />
    </div>
  )
}
