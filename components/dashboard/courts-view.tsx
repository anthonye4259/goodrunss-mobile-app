
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, MapPin, Clock, Users, TrendingUp, Sparkles, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

const courts = [
  {
    id: 1,
    name: "Downtown Basketball Court",
    location: "123 Main St, Downtown",
    type: "Basketball",
    capacity: 10,
    hourlyRate: 50,
    bookingsToday: 8,
    totalBookings: 156,
    revenue: 7800,
    status: "active",
    amenities: ["Lighting", "Parking", "Restrooms"],
    peakHours: "5-8 PM",
  },
  {
    id: 2,
    name: "Riverside Tennis Courts",
    location: "456 River Rd, Riverside",
    type: "Tennis",
    capacity: 8,
    hourlyRate: 40,
    bookingsToday: 6,
    totalBookings: 124,
    revenue: 4960,
    status: "active",
    amenities: ["Lighting", "Water Fountain", "Seating"],
    peakHours: "6-9 AM, 4-7 PM",
  },
  {
    id: 3,
    name: "Beach Volleyball Courts",
    location: "789 Beach Ave, Seaside",
    type: "Volleyball",
    capacity: 12,
    hourlyRate: 45,
    bookingsToday: 4,
    totalBookings: 89,
    revenue: 4005,
    status: "maintenance",
    amenities: ["Sand Courts", "Showers", "Parking"],
    peakHours: "10 AM - 2 PM",
  },
]

export function CourtsView() {
  const [selectedCourt, setSelectedCourt] = useState<(typeof courts)[0] | null>(null)
  const [aiInsights, setAiInsights] = useState<string>("")

  const generateAiInsights = (court: (typeof courts)[0]) => {
    setAiInsights("Analyzing court data...")
    setTimeout(() => {
      setAiInsights(`AI Insights for ${court.name}:

• Utilization Rate: ${Math.round((court.bookingsToday / 12) * 100)}% today - ${court.bookingsToday >= 8 ? "High demand" : court.bookingsToday >= 5 ? "Moderate demand" : "Low demand"}
• Revenue Performance: $${court.revenue.toLocaleString()} total revenue from ${court.totalBookings} bookings
• Peak Hours: ${court.peakHours} - Consider dynamic pricing during these times
• Booking Trends: ${court.totalBookings > 120 ? "Consistently popular" : "Growing popularity"}
• Optimization Suggestions:
  • ${court.bookingsToday < 5 ? "Offer promotional rates during off-peak hours\n  " : ""}• Average booking value: $${Math.round(court.revenue / court.totalBookings)}
  • Recommended rate: $${court.hourlyRate} (current) → $${court.hourlyRate + 5} (peak hours)
• Maintenance Status: ${court.status === "active" ? "Operational - no issues" : "Under maintenance - estimated completion 2 days"}`)
    }, 1500)
  }

  const activeCourts = courts.filter((c) => c.status === "active").length
  const totalRevenue = courts.reduce((sum, c) => sum + c.revenue, 0)
  const totalBookings = courts.reduce((sum, c) => sum + c.totalBookings, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold gradient-text">Court Management</h2>
          <p className="text-muted-foreground mt-1">Manage your facilities and track performance</p>
        </div>
        <Button className="glow-primary bg-gradient-to-r from-primary to-accent">
          <Plus className="h-4 w-4 mr-2" />
          Add New Court
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 glass-card border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Courts</p>
              <p className="text-3xl font-bold mt-2 gradient-text">{courts.length}</p>
              <p className="text-sm text-primary mt-1">{activeCourts} active</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl glow-primary">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6 glass-card border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-3xl font-bold mt-2 gradient-text">${totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-primary mt-1">From {totalBookings} bookings</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl glow-primary">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6 glass-card border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Today's Bookings</p>
              <p className="text-3xl font-bold mt-2 gradient-text">
                {courts.reduce((sum, c) => sum + c.bookingsToday, 0)}
              </p>
              <p className="text-sm text-primary mt-1">Across all courts</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl glow-primary">
              <Clock className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Courts List */}
      <Card className="glass-card border-border/50">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">All Courts</h3>
          <div className="space-y-3">
            {courts.map((court) => (
              <div
                key={court.id}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-all duration-200"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{court.name}</p>
                      <Badge variant={court.status === "active" ? "default" : "secondary"} className="text-xs">
                        {court.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {court.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {court.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Capacity: {court.capacity}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />${court.hourlyRate}/hr
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold gradient-text">{court.bookingsToday}</p>
                    <p className="text-xs text-muted-foreground">bookings today</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 bg-transparent"
                        onClick={() => {
                          setSelectedCourt(court)
                          generateAiInsights(court)
                        }}
                      >
                        <Sparkles className="h-4 w-4" />
                        AI Insights
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-card max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="gradient-text">AI-Generated Court Insights</DialogTitle>
                        <DialogDescription>
                          Performance insights powered by GIA for {selectedCourt?.name}
                        </DialogDescription>
                      </DialogHeader>
                      <ScrollArea className="max-h-[400px] pr-4">
                        <div className="space-y-4">
                          <div className="p-4 bg-muted/30 rounded-xl">
                            <h4 className="font-semibold mb-2">Court Details</h4>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <p>Type: {selectedCourt?.type}</p>
                              <p>Location: {selectedCourt?.location}</p>
                              <p>Capacity: {selectedCourt?.capacity} people</p>
                              <p>Rate: ${selectedCourt?.hourlyRate}/hour</p>
                              <p>Peak Hours: {selectedCourt?.peakHours}</p>
                              <p>Amenities: {selectedCourt?.amenities.join(", ")}</p>
                            </div>
                          </div>
                          <div className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl border border-primary/20">
                            <div className="flex items-start gap-3 mb-3">
                              <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                              <h4 className="font-semibold">GIA Analysis</h4>
                            </div>
                            <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans">
                              {aiInsights || "Click 'AI Insights' to generate analysis..."}
                            </pre>
                          </div>
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
