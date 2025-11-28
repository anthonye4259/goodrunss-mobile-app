
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, X, MapPin, Users, Calendar, Zap } from "lucide-react"
import { useRouter } from "next/navigation"

export function QuickActionsWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const actions = [
    {
      icon: MapPin,
      label: "Quick Check-in",
      color: "from-primary to-accent",
      action: () => router.push("/mobile/check-in"),
    },
    {
      icon: Users,
      label: "Find Pickup Game",
      color: "from-accent to-primary",
      action: () => router.push("/mobile/pickup-games"),
    },
    {
      icon: Calendar,
      label: "Book Trainer",
      color: "from-primary to-cyan-500",
      action: () => router.push("/mobile/trainers"),
    },
    {
      icon: Zap,
      label: "SOS - Need Players",
      color: "from-orange-500 to-red-500",
      action: () => router.push("/mobile/sos"),
    },
  ]

  return (
    <>
      <div className="fixed bottom-24 right-6 z-50">
        {isOpen && (
          <div className="absolute bottom-20 right-0 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {actions.map((action, index) => (
              <div
                key={action.label}
                className="flex items-center gap-3 animate-in fade-in slide-in-from-right duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="text-sm font-semibold text-foreground bg-background/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-border/50 whitespace-nowrap">
                  {action.label}
                </span>
                <Button
                  size="icon"
                  onClick={() => {
                    action.action()
                    setIsOpen(false)
                  }}
                  className={`h-14 w-14 rounded-full bg-gradient-to-br ${action.color} hover:opacity-90 glow-primary shadow-lg`}
                >
                  <action.icon className="h-6 w-6" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Button
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className={`h-16 w-16 rounded-full bg-gradient-to-br from-primary to-accent hover:opacity-90 glow-primary-strong shadow-2xl transition-transform ${
            isOpen ? "rotate-45" : ""
          }`}
        >
          {isOpen ? <X className="h-7 w-7" /> : <Plus className="h-7 w-7" />}
        </Button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-background/20 backdrop-blur-sm z-40 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
