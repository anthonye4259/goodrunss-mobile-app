"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Star, MapPin, Phone, Mail, Globe, Clock, Users, Heart, Share2 } from "lucide-react"
import { StudioClassBookingModal } from "./studio-class-booking-modal"

const studioData = {
  id: 1,
  name: "Goodrunss Studio",
  owner: "Featured Partner",
  location: "123 Fitness Ave, Manhattan, NY 10001",
  distance: "0.5 mi",
  rating: 5.0,
  reviews: 89,
  image: "/modern-pilates-studio-interior.jpg",
  types: ["Pilates", "Yoga", "Lagree"],
  phone: "(555) 123-4567",
  email: "hello@goodrunss.studio",
  website: "goodrunss.studio",
  description:
    "Premier fitness studio offering pilates, yoga, and lagree classes. Our expert instructors create a welcoming environment for all fitness levels. Join our community and transform your practice.",
  amenities: ["Showers", "Lockers", "Retail Shop", "Parking", "Towels Provided", "Water Station"],
  hours: {
    monday: "6:00 AM - 9:00 PM",
    tuesday: "6:00 AM - 9:00 PM",
    wednesday: "6:00 AM - 9:00 PM",
    thursday: "6:00 AM - 9:00 PM",
    friday: "6:00 AM - 8:00 PM",
    saturday: "8:00 AM - 6:00 PM",
    sunday: "8:00 AM - 6:00 PM",
  },
  featured: true,
}

const upcomingClasses = [
  {
    id: 1,
    name: "Power Pilates",
    instructor: "Sarah Johnson",
    time: "Today at 6:00 PM",
    duration: "50 min",
    spots: 8,
    maxSpots: 12,
    level: "Intermediate",
    price: 35,
  },
  {
    id: 2,
    name: "Vinyasa Flow",
    instructor: "Mike Chen",
    time: "Today at 7:30 PM",
    duration: "60 min",
    spots: 5,
    maxSpots: 15,
    level: "All Levels",
    price: 25,
  },
  {
    id: 3,
    name: "Lagree Burn",
    instructor: "Jessica Park",
    time: "Tomorrow at 7:00 AM",
    duration: "45 min",
    spots: 3,
    maxSpots: 10,
    level: "Advanced",
    price: 40,
  },
  {
    id: 4,
    name: "Gentle Yoga",
    instructor: "Emily Watson",
    time: "Tomorrow at 9:00 AM",
    duration: "60 min",
    spots: 12,
    maxSpots: 15,
    level: "Beginner",
    price: 20,
  },
]

const instructors = [
  {
    id: 1,
    name: "Sarah Johnson",
    specialty: "Pilates",
    avatar: "/placeholder.svg?height=100&width=100",
    rating: 5.0,
    classes: 234,
  },
  {
    id: 2,
    name: "Mike Chen",
    specialty: "Yoga",
    avatar: "/placeholder.svg?height=100&width=100",
    rating: 4.9,
    classes: 189,
  },
  {
    id: 3,
    name: "Jessica Park",
    specialty: "Lagree",
    avatar: "/placeholder.svg?height=100&width=100",
    rating: 5.0,
    classes: 156,
  },
]

export function StudioDetailScreen() {
  const router = useRouter()
  const [isFavorite, setIsFavorite] = useState(false)
  const [bookingClass, setBookingClass] = useState<any>(null)

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="relative h-64">
        <img
          src={studioData.image || "/placeholder.svg"}
          alt={studioData.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="bg-background/80 backdrop-blur-sm"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFavorite(!isFavorite)}
              className="bg-background/80 backdrop-blur-sm"
            >
              <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
            <Button variant="ghost" size="icon" className="bg-background/80 backdrop-blur-sm">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
        {studioData.featured && (
          <div className="absolute bottom-4 left-4">
            <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0">⭐ FEATURED PARTNER</Badge>
          </div>
        )}
      </div>

      <div className="p-4 max-w-md mx-auto space-y-6">
        <div>
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">{studioData.name}</h1>
              <div className="flex flex-wrap gap-2 mb-2">
                {studioData.types.map((type) => (
                  <Badge key={type} variant="outline">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-lg font-bold">
                <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                {studioData.rating}
              </div>
              <p className="text-sm text-muted-foreground">{studioData.reviews} reviews</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <MapPin className="h-4 w-4" />
            <span>{studioData.location}</span>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">{studioData.description}</p>
        </div>

        <Tabs defaultValue="classes" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="instructors">Instructors</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
          </TabsList>

          <TabsContent value="classes" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">Upcoming Classes</h3>
              <Button variant="ghost" size="sm" className="text-primary">
                View Schedule
              </Button>
            </div>

            {upcomingClasses.map((classItem) => (
              <Card key={classItem.id} className="glass-card border-primary/30 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-lg mb-1">{classItem.name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">with {classItem.instructor}</p>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1 text-primary">
                        <Clock className="h-4 w-4" />
                        {classItem.time}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {classItem.level}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">${classItem.price}</p>
                    <p className="text-xs text-muted-foreground">{classItem.duration}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className={classItem.spots <= 3 ? "text-orange-500 font-semibold" : ""}>
                      {classItem.spots} spots left
                    </span>
                  </div>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-primary to-accent"
                    onClick={() => setBookingClass(classItem)}
                  >
                    Book Class
                  </Button>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="instructors" className="space-y-4 mt-4">
            <h3 className="font-bold">Our Instructors</h3>

            {instructors.map((instructor) => (
              <Card key={instructor.id} className="glass-card border-primary/30 p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-primary">
                    <AvatarImage src={instructor.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {instructor.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-bold">{instructor.name}</h4>
                    <p className="text-sm text-primary font-semibold">{instructor.specialty}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        {instructor.rating}
                      </div>
                      <p className="text-xs text-muted-foreground">{instructor.classes} classes taught</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="glass-card bg-transparent">
                    View
                  </Button>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="info" className="space-y-4 mt-4">
            <Card className="glass-card border-primary/30 p-4 space-y-4">
              <div>
                <h3 className="font-bold mb-3">Contact</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>{studioData.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-primary" />
                    <span>{studioData.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Globe className="h-4 w-4 text-primary" />
                    <span>{studioData.website}</span>
                  </div>
                </div>
              </div>

              <div className="h-px bg-border/50" />

              <div>
                <h3 className="font-bold mb-3">Hours</h3>
                <div className="space-y-2 text-sm">
                  {Object.entries(studioData.hours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between">
                      <span className="capitalize text-muted-foreground">{day}</span>
                      <span className="font-semibold">{hours}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px bg-border/50" />

              <div>
                <h3 className="font-bold mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {studioData.amenities.map((amenity) => (
                    <Badge key={amenity} variant="outline">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>

            <Button className="w-full bg-gradient-to-r from-primary to-accent">
              <MapPin className="h-4 w-4 mr-2" />
              Get Directions
            </Button>
          </TabsContent>
        </Tabs>
      </div>

      <StudioClassBookingModal
        classItem={bookingClass}
        studioName={studioData.name}
        isOpen={!!bookingClass}
        onClose={() => setBookingClass(null)}
      />
    </div>
  )
}
