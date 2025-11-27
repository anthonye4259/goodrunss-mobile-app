"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  ArrowLeft,
  MapPin,
  Navigation,
  Clock,
  Users,
  Star,
  Share2,
  Heart,
  CheckCircle2,
  Wifi,
  Zap,
  Droplets,
  Wind,
  Calendar,
} from "lucide-react"
import Image from "next/image"
import { SocialShareButtons } from "../social-share-buttons"
import { CourtAvailabilityWidget } from "./court-availability-widget"
import { CourtTrafficChart } from "./court-traffic-chart"
import { CourtBookingModal } from "./court-booking-modal"

export function CourtDetailScreen() {
  const router = useRouter()
  const [showShare, setShowShare] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showBooking, setShowBooking] = useState(false)

  const court = {
    id: "1",
    name: "Riverside Basketball Courts",
    address: "123 River St, Manhattan, NY 10002",
    distance: "0.5 miles",
    status: "Active",
    currentPlayers: 8,
    maxCapacity: 12,
    rating: 4.7,
    reviews: 89,
    pricePerHour: 25,
    images: ["/outdoor-basketball-court.jpg", "/weathered-basketball-hoop.png", "/court-surface.jpg"],
    amenities: [
      { icon: Zap, label: "Lighting", available: true },
      { icon: Droplets, label: "Water Fountain", available: true },
      { icon: Wifi, label: "WiFi", available: false },
      { icon: Wind, label: "Covered", available: false },
    ],
    hours: "6:00 AM - 10:00 PM",
    surface: "Outdoor Concrete",
    courts: 2,
    description:
      "Popular outdoor basketball courts along the riverside. Well-maintained with good lighting for evening play. Gets busy on weekends but usually has space during weekday mornings.",
    recentCheckIns: [
      {
        user: "Mike J.",
        time: "15 min ago",
        status: "Active",
        players: 6,
        comment: "Good run going, need 2 more for full court",
      },
      {
        user: "Sarah C.",
        time: "2 hours ago",
        status: "Empty",
        players: 0,
        comment: "Just finished, court is open",
      },
      {
        user: "David L.",
        time: "5 hours ago",
        status: "Lit",
        players: 10,
        comment: "Great games today!",
      },
    ],
  }

  const handleGetDirections = () => {
    window.open(`https://maps.google.com/?q=${encodeURIComponent(court.address)}`, "_blank")
  }

  const handleCheckIn = () => {
    const checkInUrl = `/mobile/check-in?court=${encodeURIComponent(court.name)}`
    console.log("[v0] Check In button clicked, navigating to:", checkInUrl)
    window.location.href = checkInUrl
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="glass-card border-b border-border/50 p-4 sticky top-0 z-40">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-bold text-lg">Court Details</h1>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => setShowShare(true)}>
              <Share2 className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFavorite(!isFavorite)}
              className={isFavorite ? "text-red-500" : ""}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto space-y-6 pb-24">
        {/* Image Gallery */}
        <div className="relative h-64 bg-muted">
          <Image src={court.images[0] || "/placeholder.svg"} alt={court.name} fill className="object-cover" />
          <div className="absolute bottom-4 right-4 flex gap-2">
            {court.images.slice(1).map((_, i) => (
              <div key={i} className="w-16 h-16 glass-card rounded-lg border border-border/50" />
            ))}
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Court Info */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h2 className="text-2xl font-bold gradient-text">{court.name}</h2>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{court.distance} away</span>
                </div>
              </div>
              <Badge
                className={`${
                  court.status === "Active"
                    ? "bg-green-500/20 text-green-500"
                    : court.status === "Lit"
                      ? "bg-yellow-500/20 text-yellow-500"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {court.status}
              </Badge>
            </div>

            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="font-semibold">{court.rating}</span>
                <span className="text-xs text-muted-foreground">({court.reviews})</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Users className="h-4 w-4 text-primary" />
                <span className="font-semibold">
                  {court.currentPlayers}/{court.maxCapacity}
                </span>
                <span className="text-muted-foreground">players</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              size="lg"
              onClick={() => setShowBooking(true)}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 glow-primary"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Book Court
            </Button>
            <Button size="lg" variant="outline" onClick={handleGetDirections} className="glass-card bg-transparent">
              <Navigation className="h-4 w-4 mr-2" />
              Directions
            </Button>
          </div>

          <CourtAvailabilityWidget
            courtName={court.name}
            currentCrowdLevel="medium"
            predictedCrowdLevel="low"
            bestTimeToVisit="8:00 AM"
            currentPlayers={court.currentPlayers}
            averagePlayers={10}
          />

          <CourtTrafficChart />

          {/* Quick Info */}
          <Card className="glass-card border border-border/50 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Hours</p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold">{court.hours}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Surface</p>
                <p className="text-sm font-semibold">{court.surface}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Courts</p>
                <p className="text-sm font-semibold">{court.courts} available</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Address</p>
                <p className="text-sm font-semibold">{court.address}</p>
              </div>
            </div>
          </Card>

          {/* Amenities */}
          <Card className="glass-card border border-border/50 p-6">
            <h3 className="font-bold text-lg mb-4">Amenities</h3>
            <div className="grid grid-cols-2 gap-4">
              {court.amenities.map((amenity, i) => {
                const Icon = amenity.icon
                return (
                  <div key={i} className={`flex items-center gap-2 ${amenity.available ? "" : "opacity-50"}`}>
                    {amenity.available ? (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-muted" />
                    )}
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{amenity.label}</span>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Description */}
          <Card className="glass-card border border-border/50 p-6">
            <h3 className="font-bold text-lg mb-3">About</h3>
            <p className="text-muted-foreground leading-relaxed">{court.description}</p>
          </Card>

          {/* Recent Check-ins */}
          <Card className="glass-card border border-border/50 p-6">
            <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {court.recentCheckIns.map((checkIn, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{checkIn.user[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{checkIn.user}</p>
                        <p className="text-xs text-muted-foreground">{checkIn.time}</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`${
                        checkIn.status === "Active"
                          ? "border-green-500 text-green-500"
                          : checkIn.status === "Lit"
                            ? "border-yellow-500 text-yellow-500"
                            : "border-muted text-muted-foreground"
                      }`}
                    >
                      {checkIn.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{checkIn.comment}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{checkIn.players} players</span>
                  </div>
                  {i < court.recentCheckIns.length - 1 && <div className="border-t border-border/50 pt-4" />}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Share Modal */}
      {showShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" onClick={() => setShowShare(false)} />
          <Card className="relative glass-card border-2 border-primary/30 p-6 max-w-md w-full">
            <h3 className="font-bold text-lg mb-4">Share Court</h3>
            <SocialShareButtons
              text={`Check out ${court.name} on GoodRunss! Currently ${court.status.toLowerCase()} with ${court.currentPlayers} players.`}
              size="md"
            />
            <Button variant="outline" onClick={() => setShowShare(false)} className="w-full mt-4">
              Close
            </Button>
          </Card>
        </div>
      )}

      {/* Booking Modal */}
      {showBooking && (
        <CourtBookingModal
          court={{
            id: court.id,
            name: court.name,
            pricePerHour: court.pricePerHour,
            image: court.images[0],
            address: court.address,
          }}
          isOpen={showBooking}
          onClose={() => setShowBooking(false)}
        />
      )}
    </div>
  )
}
