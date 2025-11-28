
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Dumbbell, Users, ArrowRight, Sparkles, Crown } from "lucide-react"
import Image from "next/image"

export default function OnboardingPage() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<string | null>(null)

  const userTypes = [
    {
      id: "player",
      title: "Player / Practitioner",
      description: "Find courts, studios, join games, and connect with players",
      icon: User,
      gradient: "from-primary/30 to-accent/20",
    },
    {
      id: "trainer",
      title: "Trainer / Instructor / Coach",
      description: "Offer coaching, classes, and manage your training business",
      icon: Dumbbell,
      gradient: "from-accent/30 to-primary/20",
    },
    {
      id: "both",
      title: "Both",
      description: "Play recreationally and offer training services",
      icon: Users,
      gradient: "from-primary/20 to-accent/30",
    },
  ]

  const handleContinue = () => {
    if (selectedType) {
      router.push(`/mobile/onboarding/questionnaire?type=${selectedType}`)
    }
  }

  return (
    <div className="min-h-screen bg-background grid-pattern flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-12">
        <Card className="relative overflow-hidden border-2 border-amber-500/50 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 p-4">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl">
              <Crown className="h-5 w-5 text-white fill-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <p className="text-sm font-bold">30 Days Free Premium</p>
              </div>
              <p className="text-xs text-muted-foreground">Full access to all features. Cancel anytime.</p>
            </div>
          </div>
        </Card>

        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-accent/40 rounded-3xl blur-2xl glow-primary-strong" />
              <div className="relative glass-card rounded-3xl p-6 border-2 border-primary/50 glow-primary">
                <Image
                  src="/goodrunss-logo.png"
                  alt="GoodRunss"
                  width={80}
                  height={80}
                  className="relative z-10 drop-shadow-2xl mix-blend-multiply invert"
                  style={{ filter: "brightness(1.2) contrast(1.1)" }}
                />
              </div>
            </div>
          </div>
          <h1 className="text-6xl font-bold tracking-tighter bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            GOODRUNSS
          </h1>
          <p className="text-xl text-muted-foreground font-medium">Where the world plays</p>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">Choose your path</h2>
          {userTypes.map((type) => {
            const Icon = type.icon
            const isSelected = selectedType === type.id

            return (
              <Card
                key={type.id}
                className={`p-0 cursor-pointer transition-all duration-300 border-2 overflow-hidden relative group ${
                  isSelected
                    ? "glass-card border-primary glow-primary scale-[1.02]"
                    : "glass-card border-border/50 hover:border-primary/50 hover:scale-[1.01]"
                }`}
                onClick={() => setSelectedType(type.id)}
              >
                <div className={`relative h-24 bg-gradient-to-br ${type.gradient} overflow-hidden`}>
                  <div className="absolute inset-0 opacity-10 bg-[url('/sports-abstract.jpg')] bg-cover bg-center" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                  <div
                    className={`absolute bottom-4 left-6 p-3 rounded-2xl transition-all duration-300 ${
                      isSelected
                        ? "bg-primary text-primary-foreground glow-primary-strong scale-110"
                        : "bg-card/80 backdrop-blur-sm group-hover:bg-primary/20"
                    }`}
                  >
                    <Icon className="h-7 w-7" />
                  </div>
                </div>

                <div className="p-6 space-y-2">
                  <h3 className="text-xl font-bold">{type.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{type.description}</p>
                </div>

                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center glow-primary">
                      <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>

        <Button
          className={`w-full h-14 text-lg font-bold transition-all duration-300 ${
            selectedType ? "glow-primary-strong" : ""
          }`}
          disabled={!selectedType}
          onClick={handleContinue}
        >
          Continue
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  )
}
