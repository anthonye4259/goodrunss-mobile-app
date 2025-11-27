"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Calendar } from "lucide-react"
import { TrainerBookingModal } from "./trainer-booking-modal"
import { useUserPreferences } from "@/lib/user-preferences"
import { getActivityContent, getPrimaryActivity, type Activity } from "@/lib/activity-content"

export function TrainersScreen() {
  const router = useRouter()
  const [bookingTrainer, setBookingTrainer] = useState<any>(null)
  const { preferences } = useUserPreferences()

  const primaryActivity = getPrimaryActivity(preferences.activities) || "Basketball"
  const activityContent = getActivityContent(primaryActivity as Activity)
  const trainers = activityContent.sampleTrainers.map((trainer, index) => ({
    ...trainer,
    id: index + 1,
    sport: activityContent.displayName,
    image: trainer.name.includes("Emma")
      ? "/pilates-instructor.png"
      : trainer.name.includes("Maya")
        ? "/diverse-yoga-instructor.png"
        : trainer.name.includes("Mike")
          ? "/basketball-coach.png"
          : "/fitness-instructor.png",
  }))

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">
            Book {activityContent.category === "studio" ? "an Instructor" : "a Trainer"}
          </h1>
          <p className="text-muted-foreground">
            Find expert {activityContent.displayName.toLowerCase()}{" "}
            {activityContent.category === "studio" ? "instructors" : "coaches"} near you
          </p>
        </div>

        {/* Trainers List */}
        <div className="space-y-4">
          {trainers.map((trainer) => (
            <Card key={trainer.id} className="p-4 bg-card border-border">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={trainer.image || "/placeholder.svg"}
                    alt={trainer.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <div>
                    <h3 className="font-semibold text-lg">{trainer.name}</h3>
                    <p className="text-sm text-primary">{trainer.sport}</p>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span className="font-semibold">{trainer.rating}</span>
                      <span className="text-muted-foreground">({trainer.reviews})</span>
                    </div>
                    <span className="text-muted-foreground">•</span>
                    <span className="font-semibold">${trainer.price}/hr</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{trainer.location}</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {trainer.specialties.map((specialty) => (
                      <span key={specialty} className="px-2 py-0.5 bg-muted text-xs rounded">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button className="flex-1 gap-2" onClick={() => setBookingTrainer(trainer)}>
                  <Calendar className="h-4 w-4" />
                  Book Session
                </Button>
                <Button variant="outline" onClick={() => router.push(`/mobile/trainers/${trainer.id}`)}>
                  View Profile
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <TrainerBookingModal trainer={bookingTrainer} isOpen={!!bookingTrainer} onClose={() => setBookingTrainer(null)} />
    </div>
  )
}
