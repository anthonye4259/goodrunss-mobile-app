"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Clock, MapPin, MessageCircle, CheckCircle } from "lucide-react"
import { useUserPreferences } from "@/lib/user-preferences"
import { getActivityContent } from "@/lib/activity-content"

export function MyBookingsScreen() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed">("upcoming")
  const [showCancelModal, setShowCancelModal] = useState<number | null>(null)
  const { preferences } = useUserPreferences()

  const primaryActivity = preferences.activities?.[0] || "Basketball"
  const activityContent = getActivityContent(primaryActivity)

  const bookings = [
    {
      id: 1,
      trainer: {
        name: activityContent.trainers[0].name,
        avatar: activityContent.trainers[0].image,
        sport: primaryActivity,
      },
      date: "2024-01-25",
      time: "3:00 PM - 4:00 PM",
      location: activityContent.sessions[0].location,
      status: "upcoming",
      price: activityContent.trainers[0].hourlyRate,
    },
    {
      id: 2,
      trainer: {
        name: activityContent.trainers[1]?.name || activityContent.trainers[0].name,
        avatar: activityContent.trainers[1]?.image || activityContent.trainers[0].image,
        sport: primaryActivity,
      },
      date: "2024-01-28",
      time: "10:00 AM - 11:00 AM",
      location: activityContent.sessions[1]?.location || activityContent.sessions[0].location,
      status: "upcoming",
      price: activityContent.trainers[1]?.hourlyRate || activityContent.trainers[0].hourlyRate,
    },
    {
      id: 3,
      trainer: {
        name: activityContent.trainers[0].name,
        avatar: activityContent.trainers[0].image,
        sport: primaryActivity,
      },
      date: "2024-01-20",
      time: "5:00 PM - 6:00 PM",
      location: activityContent.sessions[0].location,
      status: "completed",
      price: activityContent.trainers[0].hourlyRate,
    },
  ]

  const filteredBookings = bookings.filter((booking) => booking.status === activeTab)

  const handleCancelBooking = (bookingId: number) => {
    console.log("[v0] Cancelling booking:", bookingId)
    setShowCancelModal(null)
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="glass-card border-b border-border/50 p-4 sticky top-0 z-40">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-bold text-lg flex-1">My Bookings</h1>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-4">
        <div className="flex gap-2 p-1 glass-card border border-border/50 rounded-lg">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${
              activeTab === "upcoming"
                ? "bg-gradient-to-r from-primary to-accent text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${
              activeTab === "completed"
                ? "bg-gradient-to-r from-primary to-accent text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Completed
          </button>
        </div>

        {filteredBookings.length === 0 ? (
          <Card className="glass-card border-primary/30 p-12 text-center">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">No {activeTab} bookings</h3>
            <p className="text-muted-foreground mb-6">
              {activeTab === "upcoming"
                ? `Book a ${preferences.hasStudioActivities ? "class" : "session"} to get started`
                : "Your completed sessions will appear here"}
            </p>
            {activeTab === "upcoming" && (
              <Button
                onClick={() => router.push(preferences.hasStudioActivities ? "/mobile/studios" : "/mobile/trainers")}
                className="bg-gradient-to-r from-primary to-accent"
              >
                {preferences.hasStudioActivities ? "Find Classes" : "Find Trainers"}
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <Card key={booking.id} className="glass-card border-primary/30 p-4">
                <div className="flex gap-4">
                  <Avatar className="h-16 w-16 border-2 border-primary">
                    <AvatarImage src={booking.trainer.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {booking.trainer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold">{booking.trainer.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {booking.trainer.sport}
                        </Badge>
                      </div>
                      {booking.status === "upcoming" ? (
                        <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Upcoming</Badge>
                      ) : (
                        <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(booking.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{booking.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{booking.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <span className="font-bold text-primary">${booking.price}</span>
                      <div className="flex gap-2">
                        {booking.status === "upcoming" ? (
                          <>
                            <Button size="sm" variant="outline" className="glass-card bg-transparent">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              Message
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="glass-card text-red-500 hover:text-red-500 bg-transparent"
                              onClick={() => setShowCancelModal(booking.id)}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => router.push(`/mobile/review/${booking.id}`)}
                            className="bg-gradient-to-r from-primary to-accent"
                          >
                            Leave Review
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-xl"
            onClick={() => setShowCancelModal(null)}
          />
          <Card className="relative glass-card border-2 border-red-500/30 p-6 max-w-md w-full">
            <h3 className="font-bold text-lg mb-2">Cancel Booking?</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowCancelModal(null)} className="flex-1 glass-card">
                Keep Booking
              </Button>
              <Button
                onClick={() => handleCancelBooking(showCancelModal)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              >
                Cancel Booking
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
