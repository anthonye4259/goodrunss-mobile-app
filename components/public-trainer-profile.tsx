
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Calendar, Award, TrendingUp, Users, CheckCircle, Clock, Target, Trophy } from "lucide-react"
import { TrainerBookingModal } from "./mobile/trainer-booking-modal"

export function PublicTrainerProfile() {
  const [showBooking, setShowBooking] = useState(false)

  // This would come from the URL parameter and API in production
  const trainer = {
    id: "1",
    username: "coach-mike",
    name: "Coach Mike Johnson",
    sport: "Basketball",
    tagline: "Transform Your Game in 90 Days",
    rating: 4.9,
    reviews: 127,
    hourlyRate: 75,
    location: "Manhattan, NY",
    experience: "12 years",
    clients: 250,
    image: "/placeholder.svg?height=600&width=600",
    coverImage: "/outdoor-basketball-court.png",
    bio: "Former college basketball player with 12 years of coaching experience. Specialized in shooting mechanics, defensive strategies, and mental game development. I've helped over 250 athletes improve their game and reach their goals.",
    specialties: ["Shooting", "Defense", "Game Strategy", "Mental Training"],
    certifications: ["USA Basketball Certified", "CPR Certified", "Sports Psychology"],
    availability: ["Mon-Fri: 6am-8pm", "Sat-Sun: 8am-6pm"],
    achievements: [
      "Coached 15 players to college scholarships",
      "3x Regional Coach of the Year",
      "Former D1 College Player",
      "10+ years professional coaching",
    ],
    stats: [
      { label: "Success Rate", value: "95%", icon: Target },
      { label: "Avg Improvement", value: "40%", icon: TrendingUp },
      { label: "Client Retention", value: "92%", icon: Users },
      { label: "Championships", value: "8", icon: Trophy },
    ],
    packages: [
      {
        name: "Single Session",
        price: 75,
        duration: "1 hour",
        features: ["Personalized training", "Video analysis", "Progress tracking"],
      },
      {
        name: "5 Session Pack",
        price: 350,
        originalPrice: 375,
        duration: "5 hours",
        features: ["Everything in Single", "Custom workout plan", "Nutrition guidance", "Priority scheduling"],
        popular: true,
      },
      {
        name: "Monthly Program",
        price: 600,
        originalPrice: 750,
        duration: "12 sessions",
        features: [
          "Everything in 5-Pack",
          "Weekly check-ins",
          "24/7 message support",
          "Competition prep",
          "Mental coaching",
        ],
      },
    ],
    reviewsList: [
      {
        name: "Sarah Chen",
        rating: 5,
        date: "2 weeks ago",
        comment: "Coach Mike transformed my shooting form. Went from 35% to 52% in just 3 months!",
        avatar: "/placeholder.svg?height=100&width=100",
      },
      {
        name: "David Lee",
        rating: 5,
        date: "1 month ago",
        comment: "Best investment I've made in my game. His defensive drills are intense but effective.",
        avatar: "/placeholder.svg?height=100&width=100",
      },
      {
        name: "Emma Wilson",
        rating: 5,
        date: "2 months ago",
        comment: "Great coach with excellent communication. Really knows how to motivate players.",
        avatar: "/placeholder.svg?height=100&width=100",
      },
      {
        name: "James Rodriguez",
        rating: 5,
        date: "3 months ago",
        comment: "Helped me get a college scholarship! Forever grateful for his guidance and support.",
        avatar: "/placeholder.svg?height=100&width=100",
      },
    ],
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Cover Image */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${trainer.coverImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-20 relative z-10">
        {/* Profile Header */}
        <Card className="glass-card border-2 border-primary/30 p-6 sm:p-8 glow-primary">
          <div className="flex flex-col sm:flex-row gap-6">
            <Avatar className="h-32 w-32 border-4 border-primary mx-auto sm:mx-0">
              <AvatarImage src={trainer.image || "/placeholder.svg"} />
              <AvatarFallback className="text-2xl">MJ</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">{trainer.name}</h1>
              <p className="text-lg text-muted-foreground mb-3">{trainer.tagline}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mb-4">
                <Badge className="bg-gradient-to-r from-primary to-accent text-base px-3 py-1">{trainer.sport}</Badge>
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-primary text-primary" />
                  <span className="font-bold text-lg">{trainer.rating}</span>
                  <span className="text-sm text-muted-foreground">({trainer.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{trainer.location}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                <Button
                  size="lg"
                  onClick={() => setShowBooking(true)}
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 glow-primary"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book a Session
                </Button>
                <Button size="lg" variant="outline" className="glass-card bg-transparent">
                  View Availability
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-8">
          {trainer.stats.map((stat, i) => (
            <Card key={i} className="glass-card border-primary/30 p-6 text-center">
              <div className="flex justify-center mb-2">
                <div className="p-3 bg-primary/20 rounded-full">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <p className="text-3xl font-bold gradient-text mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* About Section */}
        <Card className="glass-card border-primary/30 p-6 sm:p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">About Me</h2>
          <p className="text-muted-foreground leading-relaxed text-lg">{trainer.bio}</p>
          <div className="grid sm:grid-cols-2 gap-6 mt-6">
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Specialties
              </h3>
              <div className="flex flex-wrap gap-2">
                {trainer.specialties.map((specialty, i) => (
                  <Badge key={i} variant="outline" className="glass-card text-sm">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Certifications
              </h3>
              <ul className="space-y-2">
                {trainer.certifications.map((cert, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    {cert}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        {/* Packages Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Training Packages</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {trainer.packages.map((pkg, i) => (
              <Card
                key={i}
                className={`glass-card p-6 relative ${
                  pkg.popular ? "border-2 border-primary glow-primary" : "border-border/50"
                }`}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent">
                    Most Popular
                  </Badge>
                )}
                <h3 className="font-bold text-xl mb-2">{pkg.name}</h3>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-bold gradient-text">${pkg.price}</span>
                  {pkg.originalPrice && (
                    <span className="text-lg text-muted-foreground line-through">${pkg.originalPrice}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-4">{pkg.duration}</p>
                <ul className="space-y-2 mb-6">
                  {pkg.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => setShowBooking(true)}
                  className={
                    pkg.popular
                      ? "w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                      : "w-full glass-card bg-transparent"
                  }
                  variant={pkg.popular ? "default" : "outline"}
                >
                  Select Package
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <Card className="glass-card border-primary/30 p-6 sm:p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Achievements
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {trainer.achievements.map((achievement, i) => (
              <div key={i} className="flex items-start gap-3 p-4 glass-card rounded-lg border border-border/50">
                <div className="p-2 bg-primary/20 rounded-full">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm flex-1">{achievement}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Reviews Section */}
        <Card className="glass-card border-primary/30 p-6 sm:p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Client Reviews
            </h2>
            <div className="flex items-center gap-2">
              <Star className="h-6 w-6 fill-primary text-primary" />
              <span className="text-2xl font-bold">{trainer.rating}</span>
              <span className="text-muted-foreground">/ 5.0</span>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {trainer.reviewsList.map((review, i) => (
              <Card key={i} className="glass-card border-border/50 p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={review.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{review.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold">{review.name}</p>
                      <div className="flex items-center gap-1">
                        {[...Array(review.rating)].map((_, j) => (
                          <Star key={j} className="h-3 w-3 fill-primary text-primary" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{review.date}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
              </Card>
            ))}
          </div>
        </Card>

        {/* Availability */}
        <Card className="glass-card border-primary/30 p-6 sm:p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            Availability
          </h2>
          <div className="space-y-2">
            {trainer.availability.map((time, i) => (
              <p key={i} className="text-muted-foreground">
                {time}
              </p>
            ))}
          </div>
        </Card>

        {/* CTA Section */}
        <Card className="glass-card border-2 border-primary/30 p-8 text-center mb-8 glow-primary">
          <h2 className="text-2xl font-bold mb-3">Ready to Transform Your Game?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join {trainer.clients}+ athletes who have improved their skills with personalized coaching from{" "}
            {trainer.name}
          </p>
          <Button
            size="lg"
            onClick={() => setShowBooking(true)}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 glow-primary text-lg px-8"
          >
            <Calendar className="h-5 w-5 mr-2" />
            Book Your First Session
          </Button>
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
    </div>
  )
}
