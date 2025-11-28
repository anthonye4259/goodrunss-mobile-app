
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Flame, Sparkles, TrendingUp, MapIcon, List, Search, Filter, Navigation } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface CourtActivity {
  id: number
  name: string
  distance: string
  activePlayers: number
  maxPlayers: number
  status: "empty" | "active" | "lit" | "overpacked"
  isRealTime: boolean
  peakTime?: string
  sport: string
  lat: number
  lng: number
  photo: string
}

const courtsActivity: CourtActivity[] = [
  {
    id: 1,
    name: "Downtown Sports Complex",
    distance: "0.8 mi",
    activePlayers: 18,
    maxPlayers: 20,
    status: "overpacked",
    isRealTime: true,
    sport: "Basketball",
    lat: 40.758,
    lng: -73.9855,
    photo: "/outdoor-basketball-court.jpg",
  },
  {
    id: 2,
    name: "Riverside Tennis Courts",
    distance: "1.2 mi",
    activePlayers: 12,
    maxPlayers: 16,
    status: "lit",
    isRealTime: true,
    sport: "Tennis",
    lat: 40.7489,
    lng: -73.968,
    photo: "/tennis-courts.png",
  },
  {
    id: 3,
    name: "Westside Recreation Center",
    distance: "2.1 mi",
    activePlayers: 6,
    maxPlayers: 15,
    status: "active",
    isRealTime: false,
    peakTime: "6:00 PM",
    sport: "Basketball",
    lat: 40.7614,
    lng: -73.9776,
    photo: "/outdoor-basketball-court.jpg",
  },
  {
    id: 4,
    name: "Northside Park Courts",
    distance: "2.8 mi",
    activePlayers: 2,
    maxPlayers: 12,
    status: "empty",
    isRealTime: false,
    peakTime: "7:00 PM",
    sport: "Volleyball",
    lat: 40.7829,
    lng: -73.9654,
    photo: "/outdoor-basketball-court.jpg",
  },
  {
    id: 5,
    name: "Central Fitness Complex",
    distance: "3.2 mi",
    activePlayers: 10,
    maxPlayers: 12,
    status: "active",
    isRealTime: true,
    sport: "Pickleball",
    lat: 40.7484,
    lng: -73.9857,
    photo: "/tennis-courts.png",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "empty":
      return "from-gray-400 to-gray-500"
    case "active":
      return "from-primary to-accent"
    case "lit":
      return "from-yellow-400 to-amber-500"
    case "overpacked":
      return "from-red-500 to-orange-600"
    default:
      return "from-gray-400 to-gray-500"
  }
}

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "empty":
      return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    case "active":
      return "bg-primary/20 text-primary border-primary/30"
    case "lit":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    case "overpacked":
      return "bg-red-500/20 text-red-400 border-red-500/30"
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30"
  }
}

export function ActivityHeatMap() {
  const [viewMode, setViewMode] = useState<"map" | "list">("map")
  const [selectedCourt, setSelectedCourt] = useState<CourtActivity | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    basketball: true,
    tennis: true,
    volleyball: true,
    pickleball: true,
    empty: true,
    active: true,
    lit: true,
    overpacked: true,
  })

  const filteredCourts = courtsActivity.filter((court) => {
    const matchesSearch = court.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSport = filters[court.sport.toLowerCase() as keyof typeof filters]
    const matchesStatus = filters[court.status as keyof typeof filters]
    return matchesSearch && matchesSport && matchesStatus
  })

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card/50 border-border/50"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 bg-transparent">
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 glass-card">
            <DropdownMenuLabel>Filter by Sport</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={filters.basketball}
              onCheckedChange={(checked) => setFilters({ ...filters, basketball: checked })}
            >
              Basketball
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.tennis}
              onCheckedChange={(checked) => setFilters({ ...filters, tennis: checked })}
            >
              Tennis
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.volleyball}
              onCheckedChange={(checked) => setFilters({ ...filters, volleyball: checked })}
            >
              Volleyball
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.pickleball}
              onCheckedChange={(checked) => setFilters({ ...filters, pickleball: checked })}
            >
              Pickleball
            </DropdownMenuCheckboxItem>

            <DropdownMenuSeparator />
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={filters.empty}
              onCheckedChange={(checked) => setFilters({ ...filters, empty: checked })}
            >
              Empty
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.active}
              onCheckedChange={(checked) => setFilters({ ...filters, active: checked })}
            >
              Active
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.lit}
              onCheckedChange={(checked) => setFilters({ ...filters, lit: checked })}
            >
              Lit 🔥
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.overpacked}
              onCheckedChange={(checked) => setFilters({ ...filters, overpacked: checked })}
            >
              Overpacked
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Card className="p-2 glass-card border-2 border-border/50 flex gap-1 shrink-0">
          <Button
            size="sm"
            variant={viewMode === "map" ? "default" : "ghost"}
            onClick={() => setViewMode("map")}
            className={cn("gap-2", viewMode === "map" && "glow-primary")}
          >
            <MapIcon className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={viewMode === "list" ? "default" : "ghost"}
            onClick={() => setViewMode("list")}
            className={cn("gap-2", viewMode === "list" && "glow-primary")}
          >
            <List className="h-4 w-4" />
          </Button>
        </Card>
      </div>

      {viewMode === "map" && (
        <div className="space-y-3">
          <Card className="relative h-[50vh] glass-card border-2 border-border/50 overflow-hidden">
            <div className="absolute inset-0">
              <Image src="/city-map-with-streets-and-parks-aerial-view.jpg" alt="Map" fill className="object-cover opacity-90" />
              <div className="absolute inset-0 bg-background/20" />
            </div>

            <div className="relative w-full h-full">
              {filteredCourts.map((court, index) => {
                const positions = [
                  { top: "25%", left: "30%" },
                  { top: "45%", left: "65%" },
                  { top: "60%", left: "25%" },
                  { top: "30%", left: "70%" },
                  { top: "70%", left: "55%" },
                ]

                return (
                  <button
                    key={court.id}
                    onClick={() => {
                      setSelectedCourt(court)
                      document
                        .getElementById(`court-${court.id}`)
                        ?.scrollIntoView({ behavior: "smooth", block: "nearest" })
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-110 z-10"
                    style={positions[index]}
                  >
                    {(court.status === "lit" || court.status === "overpacked") && (
                      <div
                        className={cn(
                          "absolute inset-0 rounded-full animate-ping",
                          court.status === "overpacked" ? "bg-red-500/50" : "bg-yellow-500/50",
                        )}
                      />
                    )}

                    <div
                      className={cn(
                        "relative w-14 h-14 rounded-full border-4 border-background flex items-center justify-center bg-gradient-to-br shadow-lg",
                        getStatusColor(court.status),
                        selectedCourt?.id === court.id && "scale-125 ring-4 ring-primary/50",
                      )}
                    >
                      <span className="text-white font-bold text-sm">{court.activePlayers}</span>
                    </div>
                  </button>
                )
              })}

              <div className="absolute bottom-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
                  <div className="relative w-4 h-4 rounded-full bg-primary border-2 border-background glow-primary" />
                </div>
              </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4 z-20">
              <Card className="p-3 glass-card border-border/50">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-gray-400 to-gray-500" />
                    <span>Empty</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-accent" />
                    <span>Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500" />
                    <span>Lit 🔥</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-orange-600" />
                    <span>Overpacked</span>
                  </div>
                </div>
              </Card>
            </div>
          </Card>

          <div className="space-y-3 max-h-[40vh] overflow-y-auto">
            {filteredCourts.map((court) => (
              <Card
                key={court.id}
                id={`court-${court.id}`}
                className={cn(
                  "p-0 glass-card border-2 transition-all duration-300 hover:scale-[1.02] overflow-hidden",
                  selectedCourt?.id === court.id && "ring-2 ring-primary glow-primary",
                )}
                onClick={() => setSelectedCourt(court)}
              >
                <div className="relative h-32 overflow-hidden">
                  <Image src={court.photo || "/placeholder.svg"} alt={court.name} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

                  <div className="absolute top-3 right-3">
                    <div
                      className={cn(
                        "px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1.5 border text-xs font-bold uppercase",
                        getStatusBadgeColor(court.status),
                      )}
                    >
                      {court.status === "lit" && <Flame className="h-3 w-3" />}
                      {court.status}
                    </div>
                  </div>

                  <div className="absolute top-3 left-3">
                    <div
                      className={cn(
                        "px-2 py-1 rounded-full backdrop-blur-sm flex items-center gap-1 border text-xs font-semibold",
                        court.isRealTime
                          ? "bg-orange-500/90 border-orange-400 text-white"
                          : "bg-yellow-400/90 border-yellow-300 text-gray-900",
                      )}
                    >
                      {court.isRealTime ? <Flame className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                      {court.isRealTime ? "LIVE" : "AI"}
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-lg">{court.name}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{court.distance}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-primary/20 text-primary rounded-md text-xs font-semibold">
                        {court.sport}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Players</span>
                      <span className="font-bold">
                        {court.activePlayers}/{court.maxPlayers}
                      </span>
                    </div>
                    <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full bg-gradient-to-r transition-all duration-500",
                          getStatusColor(court.status),
                        )}
                        style={{ width: `${(court.activePlayers / court.maxPlayers) * 100}%` }}
                      />
                    </div>
                  </div>

                  {!court.isRealTime && court.peakTime && (
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-yellow-500" />
                      <span className="text-muted-foreground">Peak at</span>
                      <span className="font-semibold text-yellow-500">{court.peakTime}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link href={`/mobile/courts/check-in?court=${encodeURIComponent(court.name)}`} className="flex-1">
                      <Button className="w-full glow-primary">Check In</Button>
                    </Link>
                    <Button variant="outline" size="icon" className="shrink-0 bg-transparent">
                      <Navigation className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {viewMode === "list" && (
        <div className="space-y-3">
          {filteredCourts.map((court) => (
            <Card
              key={court.id}
              id={`court-${court.id}`}
              className="p-0 glass-card border-2 transition-all duration-300 hover:scale-[1.02] overflow-hidden"
            >
              <div className="relative h-32 overflow-hidden">
                <Image src={court.photo || "/placeholder.svg"} alt={court.name} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

                <div className="absolute top-3 right-3">
                  <div
                    className={cn(
                      "px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1.5 border text-xs font-bold uppercase",
                      getStatusBadgeColor(court.status),
                    )}
                  >
                    {court.status === "lit" && <Flame className="h-3 w-3" />}
                    {court.status}
                  </div>
                </div>

                <div className="absolute top-3 left-3">
                  <div
                    className={cn(
                      "px-2 py-1 rounded-full backdrop-blur-sm flex items-center gap-1 border text-xs font-semibold",
                      court.isRealTime
                        ? "bg-orange-500/90 border-orange-400 text-white"
                        : "bg-yellow-400/90 border-yellow-300 text-gray-900",
                    )}
                  >
                    {court.isRealTime ? <Flame className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                    {court.isRealTime ? "LIVE" : "AI"}
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-bold text-lg">{court.name}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{court.distance}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-primary/20 text-primary rounded-md text-xs font-semibold">
                      {court.sport}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Players</span>
                    <span className="font-bold">
                      {court.activePlayers}/{court.maxPlayers}
                    </span>
                  </div>
                  <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full bg-gradient-to-r transition-all duration-500",
                        getStatusColor(court.status),
                      )}
                      style={{ width: `${(court.activePlayers / court.maxPlayers) * 100}%` }}
                    />
                  </div>
                </div>

                {!court.isRealTime && court.peakTime && (
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-yellow-500" />
                    <span className="text-muted-foreground">Peak at</span>
                    <span className="font-semibold text-yellow-500">{court.peakTime}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Link href={`/mobile/courts/check-in?court=${encodeURIComponent(court.name)}`} className="flex-1">
                    <Button className="w-full glow-primary">Check In</Button>
                  </Link>
                  <Button variant="outline" size="icon" className="shrink-0 bg-transparent">
                    <Navigation className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
