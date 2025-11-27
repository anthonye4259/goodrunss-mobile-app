"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Calendar, TrendingUp, Users, Building2, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

const trainerNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/sessions", icon: Calendar, label: "Sessions" },
  { href: "/dashboard/insights", icon: TrendingUp, label: "Insights" },
  { href: "/dashboard/clients", icon: Users, label: "Clients" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
]

const facilityNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/sessions", icon: Calendar, label: "Bookings" },
  { href: "/dashboard/insights", icon: TrendingUp, label: "Insights" },
  { href: "/dashboard/courts", icon: Building2, label: "Courts" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
]

export function DashboardSidebar({ userType = "trainer" }: { userType?: "trainer" | "facility" }) {
  const pathname = usePathname()
  const navItems = userType === "trainer" ? trainerNavItems : facilityNavItems

  return (
    <aside className="w-64 bg-card/50 backdrop-blur-xl border-r border-border/50 flex flex-col glass-card">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3 mb-3 glass-card p-3 rounded-2xl border border-primary/30 glow-primary">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-xl blur-md" />
            <Image
              src="/goodrunss-logo.png"
              alt="GoodRunss"
              width={40}
              height={40}
              className="relative z-10"
              style={{ filter: "brightness(1.1)" }}
            />
          </div>
          <h1 className="text-xl font-bold gradient-text">GOODRUNSS</h1>
        </div>
        <p className="text-sm text-muted-foreground pl-1">
          {userType === "trainer" ? "Trainer Dashboard" : "Facility Dashboard"}
        </p>
      </div>

      <nav className="flex-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-primary/20 to-accent/20 text-foreground border border-primary/30 glow-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border/50">
        <div className="glass-card p-3 rounded-xl">
          <p className="text-xs text-muted-foreground mb-1">Powered by</p>
          <p className="text-sm font-semibold gradient-text">GIA Assistant</p>
        </div>
      </div>
    </aside>
  )
}
