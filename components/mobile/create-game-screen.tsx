"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, MapPin, Users, Clock, Calendar } from "lucide-react"

export function CreateGameScreen() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    sport: "Basketball",
    court: "",
    date: "",
    time: "",
    duration: "2",
    totalPlayers: "10",
    skillLevel: "All Levels",
    description: "",
  })

  const sports = ["Basketball", "Tennis", "Soccer", "Volleyball", "Baseball", "Football"]
  const skillLevels = ["All Levels", "Beginner", "Intermediate", "Advanced"]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Creating game:", formData)
    router.push("/mobile/pickup-games")
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="glass-card border-b border-border/50 p-4 sticky top-0 z-40">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-bold text-lg flex-1">Create Pickup Game</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 max-w-md mx-auto space-y-6">
        <Card className="glass-card border-primary/30 p-6 space-y-4">
          <div className="space-y-2">
            <Label>Sport</Label>
            <div className="grid grid-cols-3 gap-2">
              {sports.map((sport) => (
                <button
                  key={sport}
                  type="button"
                  onClick={() => setFormData({ ...formData, sport })}
                  className={`p-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                    formData.sport === sport
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/50 hover:border-primary/50"
                  }`}
                >
                  {sport}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="court" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Court/Location
            </Label>
            <Input
              id="court"
              placeholder="Select or enter court name"
              value={formData.court}
              onChange={(e) => setFormData({ ...formData, court: e.target.value })}
              className="glass-card border-border/50"
              required
            />
            <Button type="button" variant="outline" size="sm" className="w-full glass-card bg-transparent">
              Choose from Nearby Courts
            </Button>
          </div>
        </Card>

        <Card className="glass-card border-primary/30 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="glass-card border-border/50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Time
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="glass-card border-border/50"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (hours)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="8"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="glass-card border-border/50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalPlayers" className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Max Players
              </Label>
              <Input
                id="totalPlayers"
                type="number"
                min="2"
                max="50"
                value={formData.totalPlayers}
                onChange={(e) => setFormData({ ...formData, totalPlayers: e.target.value })}
                className="glass-card border-border/50"
                required
              />
            </div>
          </div>
        </Card>

        <Card className="glass-card border-primary/30 p-6 space-y-4">
          <div className="space-y-2">
            <Label>Skill Level</Label>
            <div className="grid grid-cols-2 gap-2">
              {skillLevels.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData({ ...formData, skillLevel: level })}
                  className={`p-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                    formData.skillLevel === level
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/50 hover:border-primary/50"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add any details about the game..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="glass-card border-border/50 min-h-[100px]"
            />
          </div>
        </Card>

        <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90">
          Create Game
        </Button>
      </form>
    </div>
  )
}
