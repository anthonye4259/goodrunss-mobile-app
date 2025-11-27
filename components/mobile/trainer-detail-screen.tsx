"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Star,
  MapPin,
  Calendar,
  DollarSign,
  Award,
  TrendingUp,
  Users,
  MessageCircle,
  Share2,
  Heart,
} from "lucide-react"
import { TrainerBookingModal } from "./trainer-booking-modal"
import { SocialShareButtons } from "../social-share-buttons"

export function TrainerDetailScreen() {
  const router = useRouter()
  const [showBooking, setShowBooking] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  const trainer = {
    id: "1",
    name: "Coach Mike Johnson",
    sport: "Basketball",
    rating: 4.9,
    reviews: 127,
    hourlyRate: 75,
    location: "Manhattan, NY",
    distance: "2.3 miles",
    experience: "12 years",
    clients: 250,
    image: "/placeholder.svg?height=400&width=400",
    bio: "Former college basketball player with 12 years of coaching experience. Specialized in shooting mechanics, defensive strategies, and mental game development. I've helped over 250 athletes improve their game and reach their goals.",
    specialties: ["Shooting", "Defense", "Game Strategy", "Mental Training"],
    certifications: ["USA Basketball Certified", "CPR Certified", "Sports Psychology"],
    availability: ["Mon-Fri: 6am-8pm", "Sat-Sun: 8am-6pm"],
    achievements: [
      "Coached 15 players to college scholarships",
      "3x Regional Coach of the Year",
      "Former D1 College Player",
    ],
    reviewsList: [
      {
        name: "Sarah Chen",
        rating: 5,
        date: "2 weeks ago",
        comment: "Coach Mike transformed my shooting form. Went from 35% to 52% in just 3 months!",
      },
      {
        name: "David Lee",
        rating: 5,
        date: "1 month ago",
        comment: "Best investment I've made in my game. His defensive drills are intense but effective.",
      },
      {
        name: "Emma Wilson",
        rating: 4,
        date: "2 months ago",
        comment: "Great coach with excellent communication. Really knows how to motivate players.",
      },
    ],
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Back Button */}
      <div className="glass-card border-b border-border/50 p-4 sticky top-0 z-40">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-bold text-lg">Trainer Profile</h1>
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

      <div className="p-4 max-w-md mx-auto space-y-6 pb-24">
        {/* Profile Header */}
        <Card className="glass-card border-2 border-primary/30 p-6 glow-primary">
          <div className="flex gap-4">
            <Avatar className="h-24 w-24 border-2 border-primary">
              <AvatarImage src={trainer.image || "/placeholder.svg"} />
              <AvatarFallback>MJ</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold gradient-text">{trainer.name}</h2>
              <Badge className="mt-1 bg-gradient-to-r from-primary to-accent">{trainer.sport}</Badge>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span className="font-semibold">{trainer.rating}</span>
                  <span className="text-xs text-muted-foreground">({trainer.reviews})</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{trainer.distance}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/50">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold gradient-text">
                <DollarSign className="h-5 w-5" />
                {trainer.hourlyRate}
              </div>
              <p className="text-xs text-muted-foreground mt-1">per hour</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold gradient-text">{trainer.experience}</div>
              <p className="text-xs text-muted-foreground mt-1">experience</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold gradient-text">{trainer.clients}+</div>
              <p className="text-xs text-muted-foreground mt-1">clients</p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            size="lg"
            onClick={() => setShowBooking(true)}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 glow-primary"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Book Session
          </Button>
          <Button size="lg" variant="outline" className="glass-card hover:border-primary/50 bg-transparent">
            <MessageCircle className="h-4 w-4 mr-2" />
            Message
          </Button>
        </div>

        {/* About */}
        <Card className="glass-card border border-border/50 p-6">
          <h3 className="font-bold text-lg mb-3">About</h3>
          <p className="text-muted-foreground leading-relaxed">{trainer.bio}</p>
        </Card>

        {/* Specialties */}
        <Card className="glass-card border border-border/50 p-6">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Specialties
          </h3>
          <div className="flex flex-wrap gap-2">
            {trainer.specialties.map((specialty, i) => (
              <Badge key={i} variant="outline" className="glass-card">
                {specialty}
              </Badge>
            ))}
          </div>
        </Card>

        {/* Certifications */}
        <Card className="glass-card border border-border/50 p-6">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Certifications
          </h3>
          <ul className="space-y-2">
            {trainer.certifications.map((cert, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                {cert}
              </li>
            ))}
          </ul>
        </Card>

        {/* Achievements */}
        <Card className="glass-card border border-border/50 p-6">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Achievements
          </h3>
          <ul className="space-y-2">
            {trainer.achievements.map((achievement, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                {achievement}
              </li>
            ))}
          </ul>
        </Card>

        {/* Availability */}
        <Card className="glass-card border border-border/50 p-6">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Availability
          </h3>
          <div className="space-y-2">
            {trainer.availability.map((time, i) => (
              <p key={i} className="text-sm text-muted-foreground">
                {time}
              </p>
            ))}
          </div>
        </Card>

        {/* Reviews */}
        <Card className="glass-card border border-border/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Reviews ({trainer.reviewsList.length})
            </h3>
            <Button variant="link" className="text-primary">
              See All
            </Button>
          </div>
          <div className="space-y-4">
            {trainer.reviewsList.map((review, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{review.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{review.name}</p>
                      <p className="text-xs text-muted-foreground">{review.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(review.rating)].map((_, j) => (
                      <Star key={j} className="h-3 w-3 fill-primary text-primary" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{review.comment}</p>
                {i < trainer.reviewsList.length - 1 && <div className="border-t border-border/50 pt-4" />}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Booking Modal */}
      {showBooking && (
        <TrainerBookingModal
          trainer={{
            id: trainer.id,
            name: trainer.name,
            sport: trainer.sport,
            hourlyRate: trainer.hourlyRate,
            image: trainer.image,
          }}
          isOpen={showBooking}
          onClose={() => setShowBooking(false)}
        />
      )}

      {/* Share Modal */}
      {showShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" onClick={() => setShowShare(false)} />
          <Card className="relative glass-card border-2 border-primary/30 p-6 max-w-md w-full">
            <h3 className="font-bold text-lg mb-4">Share Trainer Profile</h3>
            <SocialShareButtons
              text={`Check out ${trainer.name} on GoodRunss! ${trainer.sport} trainer with ${trainer.rating}⭐ rating.`}
              size="md"
            />
            <Button variant="outline" onClick={() => setShowShare(false)} className="w-full mt-4">
              Close
            </Button>
          </Card>
        </div>
      )}
    </div>
  )
}
