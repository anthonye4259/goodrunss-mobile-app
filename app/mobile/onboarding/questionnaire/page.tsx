
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, ChevronRight, Watch, Activity } from "lucide-react"
import { useUserPreferences } from "@/lib/user-preferences"

const playerQuestions = [
  {
    id: "sports_interest",
    question: "Which activities do you enjoy?",
    type: "dual_category",
    categories: {
      rec: {
        title: "GoodRunss Rec",
        options: ["Basketball", "Tennis", "Pickleball", "Golf", "Soccer", "Volleyball"],
      },
      studios: {
        title: "GoodRunss Studios",
        options: ["Pilates", "Yoga", "Lagree", "Barre", "Meditation"],
      },
    },
  },
  {
    id: "wearable_info",
    question: "Track your performance metrics",
    type: "info",
    description:
      "Connect your Whoop, Apple Watch, Garmin, or other wearables to automatically track your training metrics, recovery, and performance data. GIA will use this to provide personalized insights.",
  },
]

const trainerQuestions = [
  {
    id: "expertise",
    question: "What do you specialize in?",
    type: "dual_category_single",
    categories: {
      rec: {
        title: "GoodRunss Rec",
        options: ["Basketball", "Tennis", "Pickleball", "Golf", "Soccer", "Volleyball"],
      },
      studios: {
        title: "GoodRunss Studios",
        options: ["Pilates", "Yoga", "Lagree", "Barre", "Meditation"],
      },
    },
  },
  {
    id: "experience_level",
    question: "How long have you been coaching/instructing?",
    options: ["Less than 1 year", "1-3 years", "3-5 years", "5+ years"],
  },
  {
    id: "certification",
    question: "Do you have coaching/instructing certifications?",
    options: ["Yes, certified", "Working towards certification", "No, but experienced", "Not yet"],
  },
  {
    id: "training_style",
    question: "What's your training philosophy?",
    options: [
      "Technical skill development",
      "Fitness and conditioning",
      "Mental game and strategy",
      "Holistic approach",
    ],
  },
  {
    id: "availability",
    question: "What's your typical availability?",
    options: ["Mornings (6am-12pm)", "Afternoons (12pm-6pm)", "Evenings (6pm-10pm)", "Flexible schedule"],
  },
]

const bothQuestions = [
  {
    id: "primary_focus",
    question: "What's your primary focus right now?",
    options: ["Training as a player", "Coaching others", "Both equally", "Depends on the week"],
  },
  {
    id: "sports_involvement",
    question: "Which sports are you involved in?",
    options: ["Basketball", "Pickleball", "Tennis", "Golf", "Sports Performance", "Multiple sports"],
  },
  {
    id: "skill_level",
    question: "Your skill level as a player?",
    options: ["Beginner", "Intermediate", "Advanced", "Elite"],
  },
  {
    id: "coaching_experience",
    question: "Your coaching experience?",
    options: ["Just starting", "1-3 years", "3-5 years", "5+ years"],
  },
  {
    id: "time_split",
    question: "How do you split your time?",
    options: ["Mostly playing", "Mostly coaching", "50/50 split", "Varies by season"],
  },
]

export default function QuestionnairePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userType = searchParams.get("type") || "player"
  const { setPreferences } = useUserPreferences()

  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [additionalInfo, setAdditionalInfo] = useState("")

  const allQuestions =
    userType === "player" ? playerQuestions : userType === "trainer" ? trainerQuestions : bothQuestions
  const totalSteps = allQuestions.length + 1

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      let selectedActivities: string[] = []
      let primaryActivity: string | undefined

      if (userType === "player") {
        selectedActivities = answers["sports_interest"]?.split(",").filter(Boolean) || []
      } else if (userType === "trainer") {
        const expertise = answers["expertise"]
        if (expertise) {
          selectedActivities = [expertise]
          primaryActivity = expertise
        }
      }

      const studioActivities = ["Pilates", "Yoga", "Lagree", "Barre", "Meditation"]
      const recActivities = ["Basketball", "Tennis", "Pickleball", "Golf", "Soccer", "Volleyball"]

      const hasStudioActivities = selectedActivities.some((activity) => studioActivities.includes(activity))
      const hasRecActivities = selectedActivities.some((activity) => recActivities.includes(activity))

      setPreferences({
        activities: selectedActivities,
        isStudioUser: hasStudioActivities,
        isRecUser: hasRecActivities,
        userType: userType as any,
        primaryActivity,
      })

      localStorage.setItem("userType", userType)
      localStorage.setItem("userAnswers", JSON.stringify(answers))
      localStorage.setItem("additionalInfo", additionalInfo)
      router.push(`/mobile/${userType}`)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const currentQuestion = allQuestions[currentStep]
  const isLastStep = currentStep === totalSteps - 1
  const canProceed = isLastStep || currentQuestion?.type === "info" || answers[currentQuestion?.id]

  return (
    <div className="min-h-screen bg-background grid-pattern flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              Question {currentStep + 1} of {totalSteps}
            </span>
            <span className="font-semibold text-primary">{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
          </div>
          <div className="h-2.5 bg-muted/50 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className="h-full bg-gradient-to-r from-primary via-primary to-primary/80 transition-all duration-500 ease-out glow-primary"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <Card className="p-8 glass-card border-2">
          {!isLastStep ? (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold leading-tight">{currentQuestion.question}</h2>
              {currentQuestion.type === "info" ? (
                <div className="space-y-6">
                  <div className="glass-card p-6 border-2 border-primary/30 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                        <Watch className="h-6 w-6 text-primary" />
                      </div>
                      <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                        <Activity className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <p className="text-base leading-relaxed text-foreground/90">{currentQuestion.description}</p>
                    <div className="pt-2 space-y-2">
                      <p className="text-sm font-semibold text-primary">Supported Devices:</p>
                      <div className="flex flex-wrap gap-2">
                        {["Whoop", "Apple Watch", "Garmin", "Fitbit", "Oura Ring"].map((device) => (
                          <span
                            key={device}
                            className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium"
                          >
                            {device}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    You can connect your devices later in Settings
                  </p>
                </div>
              ) : currentQuestion.type === "dual_category" ? (
                <div className="space-y-6">
                  {Object.entries(currentQuestion.categories).map(([key, category]) => (
                    <div key={key} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className={`h-1 w-12 rounded-full ${key === "rec" ? "bg-primary" : "bg-accent"}`} />
                        <h3 className="text-lg font-bold">{category.title}</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {category.options.map((option) => {
                          const currentAnswers = answers[currentQuestion.id]?.split(",") || []
                          const isSelected = currentAnswers.includes(option)
                          return (
                            <div
                              key={option}
                              className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer text-center ${
                                isSelected
                                  ? "glass-card border-primary glow-primary"
                                  : "bg-card/50 border-border/50 hover:border-primary/50 hover:bg-card/80"
                              }`}
                              onClick={() => {
                                const newAnswers = isSelected
                                  ? currentAnswers.filter((a) => a !== option)
                                  : [...currentAnswers, option]
                                handleAnswer(currentQuestion.id, newAnswers.join(","))
                              }}
                            >
                              <span className="font-medium text-sm">{option}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : currentQuestion.type === "dual_category_single" ? (
                <div className="space-y-6">
                  {Object.entries(currentQuestion.categories).map(([key, category]) => (
                    <div key={key} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className={`h-1 w-12 rounded-full ${key === "rec" ? "bg-primary" : "bg-accent"}`} />
                        <h3 className="text-lg font-bold">{category.title}</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {category.options.map((option) => {
                          const isSelected = answers[currentQuestion.id] === option
                          return (
                            <div
                              key={option}
                              className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer text-center ${
                                isSelected
                                  ? "glass-card border-primary glow-primary"
                                  : "bg-card/50 border-border/50 hover:border-primary/50 hover:bg-card/80"
                              }`}
                              onClick={() => handleAnswer(currentQuestion.id, option)}
                            >
                              <span className="font-medium text-sm">{option}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <RadioGroup
                  value={answers[currentQuestion.id] || ""}
                  onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
                >
                  <div className="space-y-3">
                    {currentQuestion.options.map((option) => {
                      const isSelected = answers[currentQuestion.id] === option
                      return (
                        <div
                          key={option}
                          className={`flex items-center space-x-4 p-5 rounded-xl border-2 transition-all duration-300 cursor-pointer group ${
                            isSelected
                              ? "glass-card border-primary glow-primary"
                              : "bg-card/50 border-border/50 hover:border-primary/50 hover:bg-card/80"
                          }`}
                        >
                          <RadioGroupItem value={option} id={option} className="border-2" />
                          <Label htmlFor={option} className="flex-1 cursor-pointer font-medium">
                            {option}
                          </Label>
                        </div>
                      )
                    })}
                  </div>
                </RadioGroup>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-3">
                <h2 className="text-2xl font-bold">Anything else GIA should know?</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {userType === "player"
                    ? "Share your preferences, injury history, or specific goals..."
                    : userType === "trainer"
                      ? "Tell us about your coaching style, specialties, or unique approach..."
                      : "Share anything about your playing or coaching that helps GIA assist you better..."}
                </p>
              </div>
              <Textarea
                placeholder={
                  userType === "player"
                    ? "e.g., I'm recovering from a knee injury, prefer morning sessions..."
                    : userType === "trainer"
                      ? "e.g., I specialize in youth development, focus on fundamentals..."
                      : "e.g., I play competitively but also coach on weekends..."
                }
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                className="min-h-32 bg-background/50 backdrop-blur-sm border-2 focus:border-primary transition-colors"
              />
            </div>
          )}
        </Card>

        <div className="flex gap-4">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1 h-12 glass-card border-2 hover:border-primary/50 bg-transparent"
            >
              <ChevronLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!canProceed}
            className={`flex-1 h-12 font-semibold transition-all duration-300 ${canProceed ? "glow-primary" : ""}`}
          >
            {isLastStep ? "Get Started" : "Next"}
            {!isLastStep && <ChevronRight className="h-5 w-5 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
