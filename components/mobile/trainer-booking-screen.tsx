"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MapPin, Calendar, DollarSign, Clock, Award, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export function TrainerBookingScreen({ trainerId }: { trainerId: string }) {
  const router = useRouter()

  const trainer = {
    name: "Coach Mike Johnson",
    sport: "Basketball",
    rating: 4.9,
    reviews: 127,
    price: 75,
    location: "Downtown Sports Complex",
    bio: "15+ years of professional basketball coaching experience. Specialized in shooting mechanics, defensive strategies, and mental game development.",
    specialties: ["Shooting", "Defense", "Conditioning", "Game Strategy"],
    availability: ["Mon 5-8 PM", "Wed 5-8 PM", "Sat 9 AM-2 PM"],
    certifications: ["USA Basketball Certified", "CPR/First Aid", "Sports Psychology"],
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <Button size="icon" variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Trainer Profile</h1>
            <p className="text-sm text-muted-foreground">Book a session</p>
          </div>
        </div>

        {/* Trainer Profile Card */}
        <Card className="p-6 glass-card border-border/50 glow-primary">
          <div className="flex gap-4 mb-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src="/basketball-coach.png" />
              <AvatarFallback>MJ</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{trainer.name}</h2>
              <p className="text-primary font-semibold">{trainer.sport}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span className="font-semibold">{trainer.rating}</span>
                  <span className="text-sm text-muted-foreground">({trainer.reviews})</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{trainer.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">${trainer.price}/hour</span>
            </div>
          </div>
        </Card>

        {/* Bio */}
        <Card className="p-6 glass-card border-border/50">
          <h3 className="text-lg font-semibold mb-3">About</h3>
          <p className="text-muted-foreground leading-relaxed">{trainer.bio}</p>
        </Card>

        {/* Specialties */}
        <Card className="p-6 glass-card border-border/50">
          <h3 className="text-lg font-semibold mb-3">Specialties</h3>
          <div className="flex flex-wrap gap-2">
            {trainer.specialties.map((specialty) => (
              <span key={specialty} className="px-3 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                {specialty}
              </span>
            ))}
          </div>
        </Card>

        {/* Certifications */}
        <Card className="p-6 glass-card border-border/50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Certifications
          </h3>
          <div className="space-y-2">
            {trainer.certifications.map((cert) => (
              <div key={cert} className="flex items-center gap-2">
                <div className="h-2 w-2 bg-primary rounded-full" />
                <span className="text-sm">{cert}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Availability */}
        <Card className="p-6 glass-card border-border/50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Availability
          </h3>
          <div className="space-y-2">
            {trainer.availability.map((slot) => (
              <div key={slot} className="px-3 py-2 bg-muted/30 rounded-lg text-sm">
                {slot}
              </div>
            ))}
          </div>
        </Card>

        {/* Booking CTA */}
        <div className="sticky bottom-20 pt-4">
          <Button className="w-full h-14 text-lg gap-2 glow-primary-strong">
            <Calendar className="h-5 w-5" />
            Book Session - ${trainer.price}/hr
          </Button>
        </div>
      </div>
    </div>
  )
}
