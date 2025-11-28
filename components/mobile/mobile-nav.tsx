
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, MapPin, ShoppingBag, Calendar, User, Users, Dumbbell, GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUserPreferences } from "@/lib/user-preferences"

interface MobileNavProps {
  userType?: "player" | "trainer" | "both"
}

export function MobileNav({ userType = "player" }: MobileNavProps) {
  const pathname = usePathname()
  const { preferences } = useUserPreferences()

  const getNavItems = () => {
    switch (userType) {
      case "player":
        const secondNavItem =
          preferences.isStudioUser && !preferences.isRecUser
            ? { href: "/mobile/trainers", icon: GraduationCap, label: "Instructors" }
            : { href: "/mobile/courts", icon: MapPin, label: "Courts" }

        return [
          { href: "/mobile/player", icon: Home, label: "Home" },
          secondNavItem,
          { href: "/mobile/studios", icon: Dumbbell, label: "Studios" },
          { href: "/mobile/marketplace", icon: ShoppingBag, label: "Shop" },
          { href: "/mobile/profile", icon: User, label: "Profile" },
        ]
      case "trainer":
        return [
          { href: "/mobile/trainer", icon: Home, label: "Home" },
          { href: "/mobile/schedule", icon: Calendar, label: "Schedule" },
          { href: "/mobile/marketplace", icon: ShoppingBag, label: "Marketplace" },
          { href: "/mobile/clients", icon: Users, label: "Clients" },
          { href: "/mobile/profile", icon: User, label: "Profile" },
        ]
      case "both":
        return [
          { href: "/mobile/both", icon: Home, label: "Home" },
          { href: "/mobile/courts", icon: MapPin, label: "Courts" },
          { href: "/mobile/marketplace", icon: ShoppingBag, label: "Marketplace" },
          { href: "/mobile/schedule", icon: Calendar, label: "Schedule" },
          { href: "/mobile/profile", icon: User, label: "Profile" },
        ]
      default:
        return []
    }
  }

  const navItems = getNavItems()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-border/50 z-50">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
