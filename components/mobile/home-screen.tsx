import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Users, TrendingUp, Calendar } from "lucide-react"

export function HomeScreen() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Welcome back, Alex</h1>
          <p className="text-muted-foreground">Ready to play today?</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-muted-foreground">Games Played</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">8.5</p>
                <p className="text-xs text-muted-foreground">Avg Rating</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Upcoming Sessions */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Upcoming Sessions</h2>
          <Card className="p-4 bg-card border-border">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold">Basketball Training</h3>
                <p className="text-sm text-muted-foreground">with Coach Mike</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                  <Calendar className="h-4 w-4" />
                  <span>Tomorrow, 3:00 PM</span>
                </div>
              </div>
              <Button size="sm" variant="outline">
                View
              </Button>
            </div>
          </Card>
        </div>

        {/* Nearby Courts */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Nearby Courts</h2>
          <Card className="p-4 bg-card border-border">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="font-semibold">Downtown Sports Complex</h3>
                <p className="text-sm text-muted-foreground">0.8 miles away</p>
                <div className="flex items-center gap-2 mt-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">12 players active</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card border-border">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="font-semibold">Riverside Tennis Courts</h3>
                <p className="text-sm text-muted-foreground">1.2 miles away</p>
                <div className="flex items-center gap-2 mt-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">8 players active</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button className="h-auto py-4 flex-col gap-2">
            <MapPin className="h-5 w-5" />
            <span>Find Courts</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent">
            <Calendar className="h-5 w-5" />
            <span>Book Session</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
