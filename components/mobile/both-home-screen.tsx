"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Users, Calendar, DollarSign, TrendingUp, Clock, Zap } from "lucide-react"

export function BothHomeScreen() {
  const [activeTab, setActiveTab] = useState("player")

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Welcome back, Jordan</h1>
          <p className="text-muted-foreground">Player & Trainer</p>
        </div>

        {/* Mode Switcher */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="player">Player Mode</TabsTrigger>
            <TabsTrigger value="trainer">Trainer Mode</TabsTrigger>
          </TabsList>

          {/* Player Mode Content */}
          <TabsContent value="player" className="space-y-6 mt-6">
            {/* Player Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 bg-card border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">8</p>
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
                    <p className="text-2xl font-bold">9.2</p>
                    <p className="text-xs text-muted-foreground">Avg Rating</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* GIA Recommendation */}
            <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary rounded-lg">
                  <Zap className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold">GIA Suggests</h3>
                  <p className="text-sm text-muted-foreground">
                    Join the advanced pickup game at Riverside Courts tonight at 7 PM
                  </p>
                </div>
              </div>
            </Card>

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
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button className="h-auto py-4 flex-col gap-2">
                <MapPin className="h-5 w-5" />
                <span>Find Courts</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent">
                <Calendar className="h-5 w-5" />
                <span>Join Game</span>
              </Button>
            </div>
          </TabsContent>

          {/* Trainer Mode Content */}
          <TabsContent value="trainer" className="space-y-6 mt-6">
            {/* Trainer Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 bg-card border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">$1.8K</p>
                    <p className="text-xs text-muted-foreground">This Month</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-card border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">16</p>
                    <p className="text-xs text-muted-foreground">Active Clients</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Today's Schedule */}
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Today's Schedule</h2>
              <Card className="p-4 bg-card border-border">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">5:00 PM - 6:00 PM</span>
                    </div>
                    <h3 className="font-semibold">Tennis Coaching</h3>
                    <p className="text-sm text-muted-foreground">with Sarah Miller</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Start
                  </Button>
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button className="h-auto py-4 flex-col gap-2">
                <Calendar className="h-5 w-5" />
                <span>Add Session</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent">
                <Users className="h-5 w-5" />
                <span>View Clients</span>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
