
import { useState } from "react"
import { Mic, Volume2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

type VoiceState = "idle" | "listening" | "active" | "speaking"

export function GiaVoiceActivation() {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle")
  const [isEnabled, setIsEnabled] = useState(true)
  const [transcript, setTranscript] = useState<string[]>([])

  const stateMessages = {
    idle: "Click or say 'Hey GIA'",
    listening: "🎤 Listening...",
    active: "✨ Processing...",
    speaking: "🔊 GIA is responding...",
  }

  const handleOrbClick = () => {
    if (!isEnabled) return

    if (voiceState === "idle") {
      setVoiceState("listening")
      setTranscript((prev) => [...prev, "User: [Voice activated]"])

      // Simulate listening → processing → speaking flow
      setTimeout(() => {
        setVoiceState("active")
        setTranscript((prev) => [...prev, 'User: "What courts are active right now?"'])
      }, 2000)

      setTimeout(() => {
        setVoiceState("speaking")
        setTranscript((prev) => [
          ...prev,
          'GIA: "I found 3 active courts near you. Carnegie Mellon Court has 8 players right now..."',
        ])
      }, 4000)

      setTimeout(() => {
        setVoiceState("idle")
      }, 7000)
    }
  }

  const handleTestVoice = () => {
    setTranscript([])
    handleOrbClick()
  }

  return (
    <div className="glass-card rounded-3xl p-8 border border-primary/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-1">Voice Assistant</h3>
          <p className="text-sm text-muted-foreground">Talk to GIA hands-free</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestVoice}
            className="glass-card border-primary/30 bg-transparent"
          >
            Test Voice
          </Button>
          <button
            onClick={() => setIsEnabled(!isEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isEnabled ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Voice Orb */}
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative">
          {/* Ripple effects */}
          {voiceState !== "idle" && (
            <>
              <div className="absolute inset-0 -m-8 rounded-full bg-primary/20 animate-ping" />
              <div className="absolute inset-0 -m-12 rounded-full bg-primary/10 animate-ping animation-delay-300" />
              <div className="absolute inset-0 -m-16 rounded-full bg-primary/5 animate-ping animation-delay-600" />
            </>
          )}

          {/* Main Orb */}
          <button
            onClick={handleOrbClick}
            disabled={!isEnabled}
            className={`relative w-[200px] h-[200px] rounded-full flex items-center justify-center transition-all duration-300 ${
              !isEnabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105"
            }`}
            style={{
              background: "linear-gradient(135deg, #7ed957 0%, #5fb83d 100%)",
              boxShadow:
                voiceState !== "idle"
                  ? "0 0 60px rgba(126, 217, 87, 0.6), 0 0 120px rgba(126, 217, 87, 0.3)"
                  : "0 0 40px rgba(126, 217, 87, 0.4)",
            }}
          >
            {/* Pulsing overlay */}
            {voiceState === "listening" && <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />}
            {voiceState === "active" && (
              <div
                className="absolute inset-0 rounded-full bg-white/30 animate-pulse"
                style={{ animationDuration: "0.5s" }}
              />
            )}
            {voiceState === "speaking" && (
              <div
                className="absolute inset-0 rounded-full bg-white/10 animate-pulse"
                style={{ animationDuration: "1s" }}
              />
            )}

            {/* Icon */}
            <div className="relative z-10">
              {voiceState === "idle" && <Sparkles className="w-16 h-16 text-white" />}
              {voiceState === "listening" && <Mic className="w-16 h-16 text-white animate-pulse" />}
              {voiceState === "active" && (
                <Sparkles className="w-16 h-16 text-white animate-spin" style={{ animationDuration: "2s" }} />
              )}
              {voiceState === "speaking" && <Volume2 className="w-16 h-16 text-white animate-pulse" />}
            </div>
          </button>
        </div>

        {/* State Message */}
        <p className="mt-8 text-lg font-medium text-foreground">{stateMessages[voiceState]}</p>
      </div>

      {/* Transcript Display */}
      {transcript.length > 0 && (
        <div className="mt-8 glass-card rounded-2xl p-6 border border-primary/10 max-h-[300px] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-foreground">Transcript</h4>
            <button
              onClick={() => setTranscript([])}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="space-y-3">
            {transcript.map((line, index) => {
              const isUser = line.startsWith("User:")
              return (
                <div key={index} className={`text-sm ${isUser ? "text-muted-foreground" : "text-primary font-medium"}`}>
                  {line}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Voice Commands Help */}
      <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
        <p className="text-xs font-semibold text-foreground mb-2">Try saying:</p>
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div>"Hey GIA, find active courts"</div>
          <div>"Show my progress"</div>
          <div>"Book a trainer"</div>
          <div>"What's my next session?"</div>
        </div>
      </div>
    </div>
  )
}
