/**
 * Recovery Score Dashboard
 * 
 * Shows overall recovery score with component breakdown
 * Integrates wearable data, soreness logs, and activity history
 */

import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { RecoveryScore, RecoveryRecommendation } from '@/lib/types/recovery-prevention'

interface RecoveryScoreDashboardProps {
  score: RecoveryScore
  onViewDetails?: () => void
  onStartWarmup?: () => void
  onLogSoreness?: () => void
}

const SCORE_COLORS = {
  excellent: ['#10B981', '#059669'], // Green
  good: ['#4ADE80', '#22C55E'], // Light green
  moderate: ['#FACC15', '#EAB308'], // Yellow
  low: ['#FB923C', '#EA580C'], // Orange
  poor: ['#F87171', '#DC2626'], // Red
}

const INTENSITY_CONFIG = {
  rest: {
    label: 'Rest Day',
    icon: 'bed',
    color: '#DC2626',
    description: 'Your body needs recovery',
  },
  light: {
    label: 'Light Activity',
    icon: 'walk',
    color: '#FB923C',
    description: 'Stick to easy movement',
  },
  moderate: {
    label: 'Moderate OK',
    icon: 'bicycle',
    color: '#FACC15',
    description: 'Normal training allowed',
  },
  high: {
    label: 'Go Hard!',
    icon: 'flame',
    color: '#22C55E',
    description: 'Your body is ready',
  },
}

function getScoreCategory(score: number): keyof typeof SCORE_COLORS {
  if (score >= 85) return 'excellent'
  if (score >= 70) return 'good'
  if (score >= 50) return 'moderate'
  if (score >= 30) return 'low'
  return 'poor'
}

export function RecoveryScoreDashboard({
  score,
  onViewDetails,
  onStartWarmup,
  onLogSoreness,
}: RecoveryScoreDashboardProps) {
  const category = getScoreCategory(score.overallScore)
  const colors = SCORE_COLORS[category]
  const intensity = INTENSITY_CONFIG[score.recommendation.intensity]

  return (
    <View className="bg-gray-900 rounded-3xl overflow-hidden mx-4 mb-4">
      {/* Main Score */}
      <LinearGradient
        colors={colors as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="p-6"
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-white/80 text-sm font-medium">TODAY'S RECOVERY</Text>
            <View className="flex-row items-baseline mt-1">
              <Text className="text-white text-6xl font-bold">{score.overallScore}</Text>
              <Text className="text-white/80 text-xl ml-1">/100</Text>
            </View>
          </View>

          {/* Intensity Indicator */}
          <View className="items-center">
            <View
              className="w-16 h-16 rounded-full items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <Ionicons name={intensity.icon as any} size={32} color="white" />
            </View>
            <Text className="text-white font-semibold mt-2">{intensity.label}</Text>
          </View>
        </View>

        {/* Recommendation */}
        <View className="mt-4 bg-white/20 rounded-xl p-3">
          <Text className="text-white font-medium">{score.recommendation.message}</Text>
        </View>
      </LinearGradient>

      {/* Component Scores */}
      <View className="p-4">
        <Text className="text-gray-400 text-xs mb-3">SCORE BREAKDOWN</Text>
        
        <View className="flex-row flex-wrap">
          <ScoreComponent label="Sleep" value={score.components.sleep} icon="moon" />
          <ScoreComponent label="Soreness" value={score.components.soreness} icon="fitness" />
          {score.components.hrv && (
            <ScoreComponent label="HRV" value={score.components.hrv} icon="heart" />
          )}
          <ScoreComponent label="Activity" value={score.components.activity} icon="barbell" />
          {score.components.stress && (
            <ScoreComponent label="Stress" value={score.components.stress} icon="pulse" />
          )}
          {score.components.hydration && (
            <ScoreComponent label="Hydration" value={score.components.hydration} icon="water" />
          )}
        </View>
      </View>

      {/* Suggested Activities */}
      {score.recommendation.suggestedActivities.length > 0 && (
        <View className="px-4 pb-4">
          <Text className="text-gray-400 text-xs mb-2">SUGGESTED TODAY</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {score.recommendation.suggestedActivities.map((activity, index) => (
              <View
                key={index}
                className="bg-gray-800 px-4 py-2 rounded-full mr-2"
              >
                <Text className="text-white text-sm">{activity}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Warnings */}
      {score.recommendation.warnings && score.recommendation.warnings.length > 0 && (
        <View className="px-4 pb-4">
          {score.recommendation.warnings.map((warning, index) => (
            <View
              key={index}
              className="flex-row items-center bg-red-500/20 rounded-xl p-3 mb-2"
            >
              <Ionicons name="warning" size={20} color="#F87171" />
              <Text className="text-red-400 ml-2 flex-1">{warning}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Action Buttons */}
      <View className="flex-row p-4 border-t border-gray-800">
        <TouchableOpacity
          onPress={onLogSoreness}
          className="flex-1 flex-row items-center justify-center bg-gray-800 py-3 rounded-xl mr-2"
        >
          <Ionicons name="body" size={20} color="#9CA3AF" />
          <Text className="text-gray-300 ml-2 font-medium">Log Soreness</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onStartWarmup}
          className="flex-1 flex-row items-center justify-center bg-orange-500 py-3 rounded-xl"
        >
          <Ionicons name="flame" size={20} color="white" />
          <Text className="text-white ml-2 font-medium">Start Warmup</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// Score Component Card
function ScoreComponent({
  label,
  value,
  icon,
}: {
  label: string
  value: number
  icon: string
}) {
  const getColor = (val: number) => {
    if (val >= 80) return '#22C55E'
    if (val >= 60) return '#FACC15'
    if (val >= 40) return '#FB923C'
    return '#F87171'
  }

  return (
    <View className="w-1/3 p-1">
      <View className="bg-gray-800 rounded-xl p-3 items-center">
        <Ionicons name={icon as any} size={20} color={getColor(value)} />
        <Text className="text-white font-bold text-lg mt-1">{value}</Text>
        <Text className="text-gray-500 text-xs">{label}</Text>
      </View>
    </View>
  )
}

// Mini Recovery Score (for use in headers/cards)
export function MiniRecoveryScore({ score }: { score: number }) {
  const category = getScoreCategory(score)
  const colors = SCORE_COLORS[category]

  return (
    <LinearGradient
      colors={colors as [string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="w-12 h-12 rounded-full items-center justify-center"
    >
      <Text className="text-white font-bold text-lg">{score}</Text>
    </LinearGradient>
  )
}

export default RecoveryScoreDashboard







