"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Calendar, Clock, Plus, ChevronLeft, ChevronRight, MapPin, DollarSign, Check, X } from "lucide-react"
import { useUserPreferences } from "@/lib/user-preferences"

type Session = {
  id: string
  clientName: string
  clientAvatar: string
  date: string
  time: string
  duration: number
  location: string
  type: "confirmed" | "pending" | "completed"
  price: number
  notes?: string
}

type TimeSlot = {
  time: string
  available: boolean
  session?: Session
}

export function TrainerScheduleScreen() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [view, setView] = useState<"day" | "week">("day")
  const { preferences } = useUserPreferences()
  const isStudioTrainer = preferences.isStudioOnly

  const sessions: Session[] = isStudioTrainer
    ? [
        {
          id: "1",
          clientName: "Emma Wilson",
          clientAvatar: "/diverse-woman-portrait.png",
          date: "2025-10-21",
          time: "09:00 AM",
          duration: 60,
          location: "Serenity Wellness Studio",
          type: "confirmed",
          price: 75,
          notes: "Focus on breathing techniques",
        },
        {
          id: "2",
          clientName: "Sarah Johnson",
          clientAvatar: "/diverse-woman-portrait.png",
          date: "2025-10-21",
          time: "11:00 AM",
          duration: 90,
          location: "Core Balance Studio",
          type: "pending",
          price: 100,
        },
        {
          id: "3",
          clientName: "Lisa Martinez",
          clientAvatar: "/diverse-woman-portrait.png",
          date: "2025-10-21",
          time: "02:00 PM",
          duration: 60,
          location: "Serenity Wellness Studio",
          type: "confirmed",
          price: 75,
          notes: "Pilates reformer session",
        },
        {
          id: "4",
          clientName: "Jessica Brown",
          clientAvatar: "/diverse-woman-portrait.png",
          date: "2025-10-21",
          time: "04:00 PM",
          duration: 60,
          location: "Zen Flow Studio",
          type: "completed",
          price: 75,
        },
      ]
    : [
        {
          id: "1",
          clientName: "Marcus Johnson",
          clientAvatar: "/man.jpg",
          date: "2025-10-21",
          time: "09:00 AM",
          duration: 60,
          location: "Venice Beach Courts",
          type: "confirmed",
          price: 75,
          notes: "Focus on shooting form",
        },
        {
          id: "2",
          clientName: "Sarah Williams",
          clientAvatar: "/diverse-woman-portrait.png",
          date: "2025-10-21",
          time: "11:00 AM",
          duration: 90,
          location: "Rucker Park",
          type: "pending",
          price: 100,
        },
        {
          id: "3",
          clientName: "David Chen",
          clientAvatar: "/man.jpg",
          date: "2025-10-21",
          time: "02:00 PM",
          duration: 60,
          location: "Venice Beach Courts",
          type: "confirmed",
          price: 75,
          notes: "Ball handling drills",
        },
        {
          id: "4",
          clientName: "Emma Davis",
          clientAvatar: "/diverse-woman-portrait.png",
          date: "2025-10-21",
          time: "04:00 PM",
          duration: 60,
          location: "Dyckman Park",
          type: "completed",
          price: 75,
        },
      ]

  const pendingSessions = sessions.filter((s) => s.type === "pending")
  const todaySessions = sessions.filter((s) => s.date === selectedDate.toISOString().split("T")[0])

  const timeSlots: TimeSlot[] = [
    { time: "06:00 AM", available: true },
    { time: "07:00 AM", available: true },
    { time: "08:00 AM", available: true },
    { time: "09:00 AM", available: false, session: sessions[0] },
    { time: "10:00 AM", available: false },
    { time: "11:00 AM", available: false, session: sessions[1] },
    { time: "12:00 PM", available: false },
    { time: "01:00 PM", available: true },
    { time: "02:00 PM", available: false, session: sessions[2] },
    { time: "03:00 PM", available: false },
    { time: "04:00 PM", available: false, session: sessions[3] },
    { time: "05:00 PM", available: false },
    { time: "06:00 PM", available: true },
    { time: "07:00 PM", available: true },
    { time: "08:00 PM", available: true },
  ]

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + days)
    setSelectedDate(newDate)
  }

  const handleAcceptSession = (sessionId: string) => {
    console.log("[v0] Accept session:", sessionId)
    // Handle accept logic
  }

  const handleDeclineSession = (sessionId: string) => {
    console.log("[v0] Decline session:", sessionId)
    // Handle decline logic
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/95 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-white">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Schedule</h1>
          <Button
            size="sm"
            className="bg-green-500 hover:bg-green-600 text-black"
            onClick={() => router.push("/mobile/schedule/add")}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 px-4 pb-4">
          <Button
            variant={view === "day" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("day")}
            className={
              view === "day" ? "bg-white text-black hover:bg-white/90" : "border-white/20 text-white hover:bg-white/10"
            }
          >
            Day
          </Button>
          <Button
            variant={view === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("week")}
            className={
              view === "week" ? "bg-white text-black hover:bg-white/90" : "border-white/20 text-white hover:bg-white/10"
            }
          >
            Week
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Pending Requests */}
        {pendingSessions.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">Pending Requests ({pendingSessions.length})</h2>
            <div className="space-y-3">
              {pendingSessions.map((session) => (
                <Card key={session.id} className="bg-white/5 border-yellow-500/30 p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={session.clientAvatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {session.clientName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold">{session.clientName}</p>
                        <Badge variant="outline" className="border-yellow-500/50 text-yellow-500">
                          Pending
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-white/60">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{session.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            {session.time} ({session.duration} min)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{session.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-3.5 w-3.5" />
                          <span className="text-green-500 font-semibold">${session.price}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-green-500 hover:bg-green-600 text-black"
                      onClick={() => handleAcceptSession(session.id)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-white/20 text-white hover:bg-white/10 bg-transparent"
                      onClick={() => handleDeclineSession(session.id)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Decline
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Date Navigator */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => changeDate(-1)} className="text-white">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <p className="text-lg font-semibold">{formatDate(selectedDate)}</p>
            <p className="text-sm text-white/60">
              {todaySessions.length} {isStudioTrainer ? "class" : "session"}
              {todaySessions.length !== 1 ? (isStudioTrainer ? "es" : "s") : ""}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => changeDate(1)} className="text-white">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Today's Schedule */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Today's Schedule</h2>
          <div className="space-y-2">
            {timeSlots.map((slot, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  slot.session
                    ? slot.session.type === "confirmed"
                      ? "bg-green-500/10 border-green-500/30"
                      : slot.session.type === "completed"
                        ? "bg-white/5 border-white/10 opacity-50"
                        : "bg-yellow-500/10 border-yellow-500/30"
                    : slot.available
                      ? "bg-white/5 border-white/10"
                      : "bg-white/5 border-white/10 opacity-30"
                }`}
              >
                <div className="w-20 text-sm text-white/60 pt-1">{slot.time}</div>
                {slot.session ? (
                  <div className="flex-1 flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={slot.session.clientAvatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {slot.session.clientName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-sm">{slot.session.clientName}</p>
                        <Badge
                          variant="outline"
                          className={
                            slot.session.type === "confirmed"
                              ? "border-green-500/50 text-green-500"
                              : slot.session.type === "completed"
                                ? "border-white/30 text-white/60"
                                : "border-yellow-500/50 text-yellow-500"
                          }
                        >
                          {slot.session.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-white/60 mb-1">
                        {slot.session.duration} min • {slot.session.location}
                      </p>
                      {slot.session.notes && <p className="text-xs text-white/80 italic">{slot.session.notes}</p>}
                    </div>
                  </div>
                ) : slot.available ? (
                  <div className="flex-1">
                    <p className="text-sm text-white/40">Available</p>
                  </div>
                ) : (
                  <div className="flex-1">
                    <p className="text-sm text-white/40">Blocked</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-white/5 border-white/10 p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{sessions.filter((s) => s.type === "confirmed").length}</p>
            <p className="text-xs text-white/60 mt-1">Confirmed</p>
          </Card>
          <Card className="bg-white/5 border-white/10 p-4 text-center">
            <p className="text-2xl font-bold text-yellow-500">{pendingSessions.length}</p>
            <p className="text-xs text-white/60 mt-1">Pending</p>
          </Card>
          <Card className="bg-white/5 border-white/10 p-4 text-center">
            <p className="text-2xl font-bold text-white">{sessions.filter((s) => s.type === "completed").length}</p>
            <p className="text-xs text-white/60 mt-1">Completed</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
