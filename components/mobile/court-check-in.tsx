
import type React from "react"

import { useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ChevronRight, Users, Share2, UserPlus, Trophy, Baby, Camera, X, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface CourtCheckInProps {
  courtName: string
  onCheckIn?: (data: CheckInData) => void
}

interface CheckInData {
  trafficLevel: number
  players?: number
  skillLevel?: string
  ages?: string
  runss?: string
  shareToFeed: boolean
  photo?: string
}

export function CourtCheckIn({ courtName, onCheckIn }: CourtCheckInProps) {
  console.log("[v0] CourtCheckIn component rendering for:", courtName)

  const router = useRouter()
  const [trafficLevel, setTrafficLevel] = useState(50)
  const [shareToFeed, setShareToFeed] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [players, setPlayers] = useState<number>(1)
  const [skillLevel, setSkillLevel] = useState<string>("")
  const [ages, setAges] = useState<string>("")
  const [runss, setRunss] = useState<string>("")
  const [photo, setPhoto] = useState<string | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getTrafficLabel = (value: number) => {
    if (value < 33) return "Not Busy"
    if (value < 66) return "Moderate"
    return "Busy"
  }

  const getTrafficColor = (value: number) => {
    if (value < 33) return "text-primary"
    if (value < 66) return "text-yellow-500"
    return "text-orange-500"
  }

  const handleCheckIn = () => {
    const data: CheckInData = {
      trafficLevel,
      players,
      skillLevel,
      ages,
      runss,
      shareToFeed,
      photo: photo || undefined,
    }

    onCheckIn?.(data)

    // Show success and navigate back
    alert(`Checked in to ${courtName}! Traffic level: ${getTrafficLabel(trafficLevel)}`)
    router.back()
  }

  const skillLevels = ["Beginner", "Intermediate", "Advanced", "Expert"]
  const ageRanges = ["Under 18", "18-25", "26-35", "36-45", "46+"]
  const runssOptions = ["Casual", "Competitive", "Training", "Tournament"]

  const handleTakePhoto = () => {
    fileInputRef.current?.click()
  }

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhoto(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemovePhoto = () => {
    setPhoto(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="min-h-screen bg-primary p-6 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <Image
            src="/goodrunss-logo.png"
            alt="GoodRunss"
            width={32}
            height={32}
            className="mix-blend-screen brightness-0 invert"
          />
          <span className="text-xl font-bold text-background">GOODRUNSS</span>
        </div>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-background">Hi! Check in this court for GoodRunss</h1>
        </div>

        {/* Court Name */}
        <Card className="p-4 bg-background/95 backdrop-blur-sm border-none">
          <p className="font-semibold text-foreground">{courtName}</p>
        </Card>

        {/* Camera Section */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-background">COURT PHOTO (OPTIONAL)</p>

          {!photo ? (
            <Button
              onClick={handleTakePhoto}
              variant="outline"
              className="w-full bg-background/20 backdrop-blur-sm border-background/30 text-background hover:bg-background/30 h-32"
            >
              <div className="flex flex-col items-center gap-2">
                <Camera className="h-8 w-8" />
                <span className="font-medium">Take Photo of Court</span>
                <span className="text-xs opacity-80">Help others see current conditions</span>
              </div>
            </Button>
          ) : (
            <div className="relative rounded-lg overflow-hidden border-2 border-background/30">
              <Image
                src={photo || "/placeholder.svg"}
                alt="Court photo"
                width={400}
                height={300}
                className="w-full h-48 object-cover"
              />
              <button
                onClick={handleRemovePhoto}
                className="absolute top-2 right-2 p-2 bg-background/90 rounded-full hover:bg-background transition-colors"
              >
                <X className="h-4 w-4 text-foreground" />
              </button>
              <div className="absolute bottom-2 left-2 px-3 py-1 bg-background/90 rounded-full flex items-center gap-1">
                <ImageIcon className="h-3 w-3 text-primary" />
                <span className="text-xs font-medium text-foreground">Photo added</span>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoCapture}
            className="hidden"
          />
        </div>

        {/* Traffic Slider */}
        <div className="space-y-4">
          <Slider
            value={[trafficLevel]}
            onValueChange={(value) => setTrafficLevel(value[0])}
            max={100}
            step={1}
            className="w-full [&_[role=slider]]:bg-background [&_[role=slider]]:border-background"
          />
          <div className="flex justify-between text-sm">
            <span className={cn("font-medium text-background", trafficLevel < 33 && "font-bold underline")}>
              Not Busy
            </span>
            <span
              className={cn(
                "font-medium text-background",
                trafficLevel >= 33 && trafficLevel < 66 && "font-bold underline",
              )}
            >
              Moderate
            </span>
            <span className={cn("font-medium text-background", trafficLevel >= 66 && "font-bold underline")}>Busy</span>
          </div>
        </div>

        {/* Expandable Sections */}
        <div className="space-y-2">
          {/* PLAYERS */}
          <div className="space-y-2">
            <button
              onClick={() => setExpandedSection(expandedSection === "PLAYERS" ? null : "PLAYERS")}
              className="w-full flex items-center justify-between p-4 bg-background/20 backdrop-blur-sm rounded-lg border border-background/30 text-background font-medium hover:bg-background/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>PLAYERS</span>
                {players > 0 && <span className="text-sm">({players})</span>}
              </div>
              <ChevronRight
                className={cn("h-5 w-5 transition-transform", expandedSection === "PLAYERS" && "rotate-90")}
              />
            </button>
            {expandedSection === "PLAYERS" && (
              <Card className="p-4 bg-background/95 backdrop-blur-sm border-none space-y-3 animate-in slide-in-from-top-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Number of players</span>
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPlayers(Math.max(1, players - 1))}
                      className="h-8 w-8 p-0"
                    >
                      -
                    </Button>
                    <span className="text-lg font-bold w-8 text-center">{players}</span>
                    <Button size="sm" variant="outline" onClick={() => setPlayers(players + 1)} className="h-8 w-8 p-0">
                      +
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* SKILL LEVEL */}
          <div className="space-y-2">
            <button
              onClick={() => setExpandedSection(expandedSection === "SKILL LEVEL" ? null : "SKILL LEVEL")}
              className="w-full flex items-center justify-between p-4 bg-background/20 backdrop-blur-sm rounded-lg border border-background/30 text-background font-medium hover:bg-background/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                <span>SKILL LEVEL</span>
                {skillLevel && <span className="text-sm">({skillLevel})</span>}
              </div>
              <ChevronRight
                className={cn("h-5 w-5 transition-transform", expandedSection === "SKILL LEVEL" && "rotate-90")}
              />
            </button>
            {expandedSection === "SKILL LEVEL" && (
              <Card className="p-4 bg-background/95 backdrop-blur-sm border-none space-y-2 animate-in slide-in-from-top-2">
                {skillLevels.map((level) => (
                  <button
                    key={level}
                    onClick={() => setSkillLevel(level)}
                    className={cn(
                      "w-full p-3 rounded-lg text-left transition-colors",
                      skillLevel === level
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "bg-muted/50 hover:bg-muted",
                    )}
                  >
                    {level}
                  </button>
                ))}
              </Card>
            )}
          </div>

          {/* AGES */}
          <div className="space-y-2">
            <button
              onClick={() => setExpandedSection(expandedSection === "AGES" ? null : "AGES")}
              className="w-full flex items-center justify-between p-4 bg-background/20 backdrop-blur-sm rounded-lg border border-background/30 text-background font-medium hover:bg-background/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Baby className="h-5 w-5" />
                <span>AGES</span>
                {ages && <span className="text-sm">({ages})</span>}
              </div>
              <ChevronRight className={cn("h-5 w-5 transition-transform", expandedSection === "AGES" && "rotate-90")} />
            </button>
            {expandedSection === "AGES" && (
              <Card className="p-4 bg-background/95 backdrop-blur-sm border-none space-y-2 animate-in slide-in-from-top-2">
                {ageRanges.map((range) => (
                  <button
                    key={range}
                    onClick={() => setAges(range)}
                    className={cn(
                      "w-full p-3 rounded-lg text-left transition-colors",
                      ages === range
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "bg-muted/50 hover:bg-muted",
                    )}
                  >
                    {range}
                  </button>
                ))}
              </Card>
            )}
          </div>

          {/* RUNSS */}
          <div className="space-y-2">
            <button
              onClick={() => setExpandedSection(expandedSection === "RUNSS" ? null : "RUNSS")}
              className="w-full flex items-center justify-between p-4 bg-background/20 backdrop-blur-sm rounded-lg border border-background/30 text-background font-medium hover:bg-background/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                <span>RUNSS</span>
                {runss && <span className="text-sm">({runss})</span>}
              </div>
              <ChevronRight
                className={cn("h-5 w-5 transition-transform", expandedSection === "RUNSS" && "rotate-90")}
              />
            </button>
            {expandedSection === "RUNSS" && (
              <Card className="p-4 bg-background/95 backdrop-blur-sm border-none space-y-2 animate-in slide-in-from-top-2">
                {runssOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => setRunss(option)}
                    className={cn(
                      "w-full p-3 rounded-lg text-left transition-colors",
                      runss === option
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "bg-muted/50 hover:bg-muted",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </Card>
            )}
          </div>
        </div>

        {/* Invite Players */}
        <Button
          variant="outline"
          className="w-full bg-background/20 backdrop-blur-sm border-background/30 text-background hover:bg-background/30"
        >
          <Users className="h-5 w-5 mr-2" />
          INVITE PLAYERS
        </Button>

        {/* Share to Feed */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-background">POST TO YOUR LIVE FEED</p>
          <button
            onClick={() => setShareToFeed(!shareToFeed)}
            className={cn(
              "w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all",
              shareToFeed
                ? "bg-background text-foreground border-background"
                : "bg-background/20 backdrop-blur-sm text-background border-background/30",
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                  shareToFeed ? "border-primary bg-primary" : "border-background",
                )}
              >
                {shareToFeed && <div className="w-2 h-2 rounded-full bg-background" />}
              </div>
              <span className="font-medium">SHARE WITH OTHER PLAYERS</span>
            </div>
            <Share2 className="h-5 w-5" />
          </button>
        </div>

        {/* Check In Button */}
        <Button
          onClick={handleCheckIn}
          className="w-full h-14 bg-background text-primary hover:bg-background/90 font-bold text-lg rounded-full"
        >
          CHECK IN
        </Button>
      </div>
    </div>
  )
}
