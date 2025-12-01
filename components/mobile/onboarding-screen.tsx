
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowRight, Upload, MapPin, Dumbbell, Users } from "lucide-react"
import { useUserPreferences } from "@/lib/user-preferences"

export function OnboardingScreen() {
  const router = useRouter()
  const { setPreferences } = useUserPreferences()
  const [step, setStep] = useState(1)
  const [userType, setUserType] = useState<"player" | "practitioner" | "trainer" | "instructor" | "both" | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    activities: [] as string[], // Changed from sports to activities to include both
    skillLevel: "",
    bio: "",
  })

  const recSports = ["Basketball", "Tennis", "Soccer", "Volleyball", "Swimming", "Baseball", "Football"]
  const studioActivities = ["Pilates", "Yoga", "Lagree", "Barre", "Meditation"]
  const skillLevels = ["Beginner", "Intermediate", "Advanced", "Pro"]

  const handleNext = () => {
    if (step === 1 && userType) {
      setStep(2)
    } else if (step === 2 && formData.name && formData.location) {
      setStep(3)
    } else if (step === 3 && formData.activities.length > 0) {
      const hasStudioActivities = formData.activities.some((a) => studioActivities.includes(a))
      const hasRecSports = formData.activities.some((a) => recSports.includes(a))

      setPreferences({
        activities: formData.activities,
        isStudioUser: hasStudioActivities,
        isRecUser: hasRecSports,
        userType,
      })

      console.log("[v0] Onboarding complete:", { userType, ...formData, hasStudioActivities, hasRecSports })

      if (userType === "player" || userType === "practitioner") {
        router.push("/mobile/player")
      } else if (userType === "trainer" || userType === "instructor") {
        router.push("/mobile/trainer")
      } else {
        router.push("/mobile/both")
      }
    }
  }

  const toggleActivity = (activity: string) => {
    setFormData((prev) => ({
      ...prev,
      activities: prev.activities.includes(activity)
        ? prev.activities.filter((a) => a !== activity)
        : [...prev.activities, activity],
    }))
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all ${
                i <= step ? "bg-gradient-to-r from-primary to-accent" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold gradient-text">Welcome to GoodRunss</h1>
              <p className="text-muted-foreground">Let's get you set up. What brings you here?</p>
            </div>

            <div className="space-y-3">
              <Card
                onClick={() => setUserType("player")}
                className={`glass-card p-6 cursor-pointer transition-all hover:scale-[1.02] ${
                  userType === "player" ? "border-2 border-primary glow-primary" : "border-border/50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-full">
                    <Users className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">I'm a Player / Practitioner</h3>
                    <p className="text-sm text-muted-foreground">
                      Find courts, studios, track activities, connect with others
                    </p>
                  </div>
                </div>
              </Card>

              <Card
                onClick={() => setUserType("trainer")}
                className={`glass-card p-6 cursor-pointer transition-all hover:scale-[1.02] ${
                  userType === "trainer" ? "border-2 border-primary glow-primary" : "border-border/50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-500/20 rounded-full">
                    <Dumbbell className="h-6 w-6 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">I'm a Trainer / Instructor / Coach</h3>
                    <p className="text-sm text-muted-foreground">
                      Manage clients, schedule sessions, grow your business
                    </p>
                  </div>
                </div>
              </Card>

              <Card
                onClick={() => setUserType("both")}
                className={`glass-card p-6 cursor-pointer transition-all hover:scale-[1.02] ${
                  userType === "both" ? "border-2 border-primary glow-primary" : "border-border/50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/20 rounded-full">
                    <div className="flex gap-1">
                      <Users className="h-5 w-5 text-purple-500" />
                      <Dumbbell className="h-5 w-5 text-purple-500" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">Both</h3>
                    <p className="text-sm text-muted-foreground">I participate and teach others</p>
                  </div>
                </div>
              </Card>
            </div>

            <Button
              size="lg"
              onClick={handleNext}
              disabled={!userType}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              Continue
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold gradient-text">Tell us about yourself</h1>
              <p className="text-muted-foreground">This helps us personalize your experience</p>
            </div>

            <Card className="glass-card border-primary/30 p-6 space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-primary">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>
                      {formData.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-0 right-0 p-2 bg-primary rounded-full border-2 border-background">
                    <Upload className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="glass-card border-border/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Location
                </Label>
                <Input
                  id="location"
                  placeholder="New York, NY"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="glass-card border-border/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio (Optional)</Label>
                <Input
                  id="bio"
                  placeholder="Tell us a bit about yourself..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="glass-card border-border/50"
                />
              </div>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1 glass-card">
                Back
              </Button>
              <Button
                size="lg"
                onClick={handleNext}
                disabled={!formData.name || !formData.location}
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                Continue
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold gradient-text">What are you into?</h1>
              <p className="text-muted-foreground">Select all activities you're interested in</p>
            </div>

            <Card className="glass-card border-primary/30 p-6 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-1 bg-gradient-to-b from-primary to-accent rounded-full" />
                  <Label className="text-lg font-bold">GoodRunss Rec</Label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {recSports.map((sport) => (
                    <button
                      key={sport}
                      onClick={() => toggleActivity(sport)}
                      className={`p-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                        formData.activities.includes(sport)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/50 hover:border-primary/50"
                      }`}
                    >
                      {sport}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
                  <Label className="text-lg font-bold">GoodRunss Studios</Label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {studioActivities.map((activity) => (
                    <button
                      key={activity}
                      onClick={() => toggleActivity(activity)}
                      className={`p-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                        formData.activities.includes(activity)
                          ? "border-purple-500 bg-purple-500/10 text-purple-500"
                          : "border-border/50 hover:border-purple-500/50"
                      }`}
                    >
                      {activity}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Skill Level</Label>
                <div className="grid grid-cols-2 gap-2">
                  {skillLevels.map((level) => (
                    <button
                      key={level}
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
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1 glass-card">
                Back
              </Button>
              <Button
                size="lg"
                onClick={handleNext}
                disabled={formData.activities.length === 0}
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                Get Started
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
