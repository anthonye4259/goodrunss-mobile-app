
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Sparkles,
  Calendar,
  TrendingUp,
  Bell,
  DollarSign,
  Users,
  Target,
  Clock,
  Award,
  MessageSquare,
  BarChart3,
  MapPin,
  ArrowRight,
} from "lucide-react"
import { useState } from "react"
import { PremiumBadge } from "./premium-badge"

interface Automation {
  icon: any
  title: string
  description: string
  impact: string
  category: "scheduling" | "insights" | "engagement" | "optimization"
  isPremium?: boolean
}

const trainerAutomations: Automation[] = [
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description:
      "Automatically suggests optimal session times based on client availability and your peak performance hours.",
    impact: "Save 5 hours/week",
    category: "scheduling",
    isPremium: false,
  },
  {
    icon: Bell,
    title: "Automated Reminders",
    description: "Sends personalized session reminders and prep tips to clients 24 hours before training.",
    impact: "95% attendance rate",
    category: "engagement",
    isPremium: false,
  },
  {
    icon: TrendingUp,
    title: "Revenue Forecasting",
    description: "Predicts monthly revenue trends and suggests pricing adjustments to maximize earnings.",
    impact: "+23% revenue growth",
    category: "insights",
    isPremium: true,
  },
  {
    icon: Users,
    title: "Client Retention Analysis",
    description: "Identifies at-risk clients and recommends personalized engagement strategies.",
    impact: "40% better retention",
    category: "insights",
    isPremium: true,
  },
  {
    icon: DollarSign,
    title: "Dynamic Pricing",
    description: "Adjusts session prices based on demand, time slots, and market conditions.",
    impact: "+18% per session",
    category: "optimization",
    isPremium: true,
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description: "Tracks client progress and generates detailed improvement reports automatically.",
    impact: "Instant insights",
    category: "insights",
    isPremium: true,
  },
  {
    icon: MessageSquare,
    title: "Follow-up Automation",
    description: "Sends post-session feedback requests and progress updates to keep clients engaged.",
    impact: "3x more feedback",
    category: "engagement",
    isPremium: false,
  },
  {
    icon: Clock,
    title: "Peak Time Detection",
    description: "Analyzes booking patterns to identify your most profitable time slots.",
    impact: "Find hidden revenue",
    category: "optimization",
    isPremium: true,
  },
]

const playerAutomations: Automation[] = [
  {
    icon: Target,
    title: "Personalized Recommendations",
    description: "Suggests trainers, courts, and sessions based on your skill level and goals.",
    impact: "Perfect matches",
    category: "optimization",
    isPremium: false,
  },
  {
    icon: MapPin,
    title: "Court Availability Predictions",
    description: "Predicts when your favorite courts will be available based on historical data.",
    impact: "85% accuracy",
    category: "insights",
    isPremium: true,
  },
  {
    icon: TrendingUp,
    title: "Skill Progress Tracking",
    description: "Automatically tracks your improvement and celebrates milestones.",
    impact: "2x faster improvement",
    category: "insights",
    isPremium: true,
  },
  {
    icon: Users,
    title: "Smart Trainer Matching",
    description: "Finds the perfect trainer match based on your goals, budget, and schedule.",
    impact: "4.9★ avg rating",
    category: "optimization",
    isPremium: false,
  },
  {
    icon: Bell,
    title: "Session Prep Reminders",
    description: "Sends personalized warm-up tips and equipment reminders before each session.",
    impact: "Never miss prep",
    category: "engagement",
    isPremium: false,
  },
  {
    icon: Award,
    title: "Achievement Tracking",
    description: "Recognizes your progress with automated badges and milestone celebrations.",
    impact: "Stay motivated",
    category: "engagement",
    isPremium: true,
  },
  {
    icon: Clock,
    title: "Optimal Practice Times",
    description: "Suggests the best times to practice based on court traffic and weather.",
    impact: "Less wait time",
    category: "optimization",
    isPremium: true,
  },
  {
    icon: Users,
    title: "Friend Activity Alerts",
    description: "Notifies you when friends check in at nearby courts for spontaneous games.",
    impact: "More social play",
    category: "engagement",
    isPremium: false,
  },
]

export function GiaAutomationsShowcase({ userType = "player" }: { userType?: "player" | "trainer" }) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const automations = userType === "trainer" ? trainerAutomations : playerAutomations

  const categories = [
    { id: "all", label: "All Features" },
    { id: "scheduling", label: "Scheduling" },
    { id: "insights", label: "Insights" },
    { id: "engagement", label: "Engagement" },
    { id: "optimization", label: "Optimization" },
  ]

  const filteredAutomations =
    selectedCategory === "all" ? automations : automations.filter((a) => a.category === selectedCategory)

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card/95 to-card/90 border-2 border-primary/30 p-12 glass-card">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl glow-primary" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl glow-cyan" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-full mb-6 glow-primary">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">AI-POWERED AUTOMATION</span>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="gradient-text">GIA does the work.</span>
            <br />
            <span className="text-foreground">You focus on {userType === "trainer" ? "training" : "playing"}.</span>
          </h2>

          <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl">
            {userType === "trainer"
              ? "Automate scheduling, insights, and client management. GIA handles the business so you can focus on what you do best."
              : "Get personalized recommendations, track your progress, and never miss a game. GIA makes every session better."}
          </p>

          <div className="flex gap-4">
            <Button size="lg" className="glow-primary text-base">
              <Sparkles className="h-5 w-5 mr-2" />
              Chat with GIA
            </Button>
            <Button size="lg" variant="outline" className="glass-card text-base bg-transparent">
              See All Features
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {userType === "trainer" ? (
          <>
            <Card className="p-6 glass-card border-border/50 text-center hover:border-primary/50 transition-all">
              <p className="text-4xl font-bold gradient-text mb-2">5hrs</p>
              <p className="text-sm text-muted-foreground">saved per week</p>
            </Card>
            <Card className="p-6 glass-card border-border/50 text-center hover:border-primary/50 transition-all">
              <p className="text-4xl font-bold gradient-text mb-2">+23%</p>
              <p className="text-sm text-muted-foreground">revenue growth</p>
            </Card>
            <Card className="p-6 glass-card border-border/50 text-center hover:border-primary/50 transition-all">
              <p className="text-4xl font-bold gradient-text mb-2">95%</p>
              <p className="text-sm text-muted-foreground">attendance rate</p>
            </Card>
            <Card className="p-6 glass-card border-border/50 text-center hover:border-primary/50 transition-all">
              <p className="text-4xl font-bold gradient-text mb-2">40%</p>
              <p className="text-sm text-muted-foreground">better retention</p>
            </Card>
          </>
        ) : (
          <>
            <Card className="p-6 glass-card border-border/50 text-center hover:border-primary/50 transition-all">
              <p className="text-4xl font-bold gradient-text mb-2">2x</p>
              <p className="text-sm text-muted-foreground">faster improvement</p>
            </Card>
            <Card className="p-6 glass-card border-border/50 text-center hover:border-primary/50 transition-all">
              <p className="text-4xl font-bold gradient-text mb-2">85%</p>
              <p className="text-sm text-muted-foreground">prediction accuracy</p>
            </Card>
            <Card className="p-6 glass-card border-border/50 text-center hover:border-primary/50 transition-all">
              <p className="text-4xl font-bold gradient-text mb-2">4.9★</p>
              <p className="text-sm text-muted-foreground">trainer matches</p>
            </Card>
            <Card className="p-6 glass-card border-border/50 text-center hover:border-primary/50 transition-all">
              <p className="text-4xl font-bold gradient-text mb-2">100%</p>
              <p className="text-sm text-muted-foreground">personalized</p>
            </Card>
          </>
        )}
      </div>

      {/* Category Filters */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <Button
            key={category.id}
            size="lg"
            variant={selectedCategory === category.id ? "default" : "outline"}
            onClick={() => setSelectedCategory(category.id)}
            className={`${selectedCategory === category.id ? "glow-primary" : "glass-card"} whitespace-nowrap`}
          >
            {category.label}
          </Button>
        ))}
      </div>

      {/* Automations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAutomations.map((automation, i) => {
          const Icon = automation.icon
          return (
            <Card
              key={i}
              className={`p-6 glass-card border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] hover:glow-primary group cursor-pointer ${
                automation.isPremium ? "border-amber-500/30" : ""
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-primary/30 to-accent/30 rounded-xl group-hover:glow-primary-strong transition-all">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-lg">{automation.title}</h4>
                      {automation.isPremium && <PremiumBadge variant="compact" />}
                    </div>
                    <span className="text-xs px-3 py-1 bg-primary/20 rounded-full text-primary font-semibold whitespace-nowrap">
                      {automation.impact}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{automation.description}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Bottom CTA */}
      <Card className="p-8 glass-card border-2 border-primary/50 glow-primary text-center">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold mb-3">Ready to experience GIA?</h3>
          <p className="text-muted-foreground mb-6">
            Join thousands of {userType === "trainer" ? "trainers" : "players"} who are already using AI to level up
            their game.
          </p>
          <Button size="lg" className="glow-primary-strong">
            <Sparkles className="h-5 w-5 mr-2" />
            Start Free Trial
          </Button>
        </div>
      </Card>
    </div>
  )
}
