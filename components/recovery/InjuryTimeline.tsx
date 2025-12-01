/**
 * Injury History Timeline
 * 
 * Visual timeline of past injuries, recovery progress, and chronic conditions
 */

import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { format, differenceInDays, differenceInWeeks, differenceInMonths } from 'date-fns'
import {
  InjuryEntry,
  BODY_PART_DISPLAY_NAMES,
  INJURY_TYPE_DISPLAY_NAMES,
} from '@/lib/types/recovery-prevention'

interface InjuryTimelineProps {
  injuries: InjuryEntry[]
  onAddInjury: () => void
  onViewInjury: (injury: InjuryEntry) => void
}

const STATUS_COLORS = {
  active: { bg: 'bg-red-500/20', text: 'text-red-500', border: 'border-red-500' },
  recovering: { bg: 'bg-yellow-500/20', text: 'text-yellow-500', border: 'border-yellow-500' },
  recovered: { bg: 'bg-green-500/20', text: 'text-green-500', border: 'border-green-500' },
  chronic: { bg: 'bg-purple-500/20', text: 'text-purple-500', border: 'border-purple-500' },
}

const STATUS_ICONS = {
  active: 'alert-circle',
  recovering: 'pulse',
  recovered: 'checkmark-circle',
  chronic: 'repeat',
}

function formatRecoveryDuration(injury: InjuryEntry): string {
  const endDate = injury.dateRecovered || new Date()
  const days = differenceInDays(endDate, injury.dateOccurred)
  
  if (days < 7) return `${days} days`
  if (days < 30) return `${differenceInWeeks(endDate, injury.dateOccurred)} weeks`
  return `${differenceInMonths(endDate, injury.dateOccurred)} months`
}

export function InjuryTimeline({ injuries, onAddInjury, onViewInjury }: InjuryTimelineProps) {
  // Sort injuries by date (most recent first)
  const sortedInjuries = [...injuries].sort(
    (a, b) => new Date(b.dateOccurred).getTime() - new Date(a.dateOccurred).getTime()
  )

  // Group by status
  const activeInjuries = sortedInjuries.filter(i => i.status === 'active' || i.status === 'recovering')
  const pastInjuries = sortedInjuries.filter(i => i.status === 'recovered')
  const chronicConditions = sortedInjuries.filter(i => i.status === 'chronic')

  return (
    <View className="flex-1 bg-black">
      <ScrollView className="flex-1 px-4">
        {/* Header */}
        <View className="flex-row items-center justify-between py-4">
          <Text className="text-white text-xl font-bold">Injury History</Text>
          <TouchableOpacity
            onPress={onAddInjury}
            className="flex-row items-center bg-orange-500 px-4 py-2 rounded-full"
          >
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white font-semibold ml-1">Log Injury</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Overview */}
        <View className="flex-row mb-6">
          <StatCard
            label="Active"
            value={activeInjuries.length}
            color="#F87171"
            icon="alert-circle"
          />
          <StatCard
            label="Recovered"
            value={pastInjuries.length}
            color="#22C55E"
            icon="checkmark-circle"
          />
          <StatCard
            label="Chronic"
            value={chronicConditions.length}
            color="#A855F7"
            icon="repeat"
          />
        </View>

        {/* Active Injuries */}
        {activeInjuries.length > 0 && (
          <Section title="🔴 Active Injuries" count={activeInjuries.length}>
            {activeInjuries.map(injury => (
              <InjuryCard
                key={injury.id}
                injury={injury}
                onPress={() => onViewInjury(injury)}
              />
            ))}
          </Section>
        )}

        {/* Chronic Conditions */}
        {chronicConditions.length > 0 && (
          <Section title="🔁 Chronic Conditions" count={chronicConditions.length}>
            {chronicConditions.map(injury => (
              <InjuryCard
                key={injury.id}
                injury={injury}
                onPress={() => onViewInjury(injury)}
              />
            ))}
          </Section>
        )}

        {/* Past Injuries */}
        {pastInjuries.length > 0 && (
          <Section title="✅ Past Injuries" count={pastInjuries.length}>
            {pastInjuries.map(injury => (
              <InjuryCard
                key={injury.id}
                injury={injury}
                onPress={() => onViewInjury(injury)}
              />
            ))}
          </Section>
        )}

        {/* Empty State */}
        {injuries.length === 0 && (
          <View className="items-center py-12">
            <View className="w-20 h-20 rounded-full bg-gray-800 items-center justify-center mb-4">
              <Ionicons name="medkit" size={40} color="#4B5563" />
            </View>
            <Text className="text-white font-semibold text-lg mb-2">No Injuries Logged</Text>
            <Text className="text-gray-400 text-center mb-6">
              Track your injuries to get personalized recovery recommendations
            </Text>
            <TouchableOpacity
              onPress={onAddInjury}
              className="bg-orange-500 px-6 py-3 rounded-full"
            >
              <Text className="text-white font-semibold">Log First Injury</Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="h-20" />
      </ScrollView>
    </View>
  )
}

// Section Component
function Section({
  title,
  count,
  children,
}: {
  title: string
  count: number
  children: React.ReactNode
}) {
  return (
    <View className="mb-6">
      <View className="flex-row items-center mb-3">
        <Text className="text-gray-400 text-sm">{title}</Text>
        <View className="bg-gray-800 px-2 py-0.5 rounded-full ml-2">
          <Text className="text-gray-400 text-xs">{count}</Text>
        </View>
      </View>
      {children}
    </View>
  )
}

// Stat Card
function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string
  value: number
  color: string
  icon: string
}) {
  return (
    <View className="flex-1 bg-gray-800 rounded-xl p-3 mx-1 items-center">
      <Ionicons name={icon as any} size={24} color={color} />
      <Text className="text-white text-2xl font-bold mt-1">{value}</Text>
      <Text className="text-gray-500 text-xs">{label}</Text>
    </View>
  )
}

// Injury Card
function InjuryCard({
  injury,
  onPress,
}: {
  injury: InjuryEntry
  onPress: () => void
}) {
  const statusStyle = STATUS_COLORS[injury.status]
  const statusIcon = STATUS_ICONS[injury.status]

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`bg-gray-800 rounded-xl p-4 mb-3 border-l-4 ${statusStyle.border}`}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          {/* Body Part & Type */}
          <Text className="text-white font-semibold text-lg">
            {BODY_PART_DISPLAY_NAMES[injury.bodyPart]}
          </Text>
          <Text className="text-gray-400 text-sm">
            {INJURY_TYPE_DISPLAY_NAMES[injury.injuryType]}
          </Text>

          {/* Date & Duration */}
          <View className="flex-row items-center mt-2">
            <Ionicons name="calendar" size={14} color="#9CA3AF" />
            <Text className="text-gray-500 text-sm ml-1">
              {format(new Date(injury.dateOccurred), 'MMM d, yyyy')}
            </Text>
            <Text className="text-gray-600 mx-2">•</Text>
            <Text className="text-gray-500 text-sm">
              {formatRecoveryDuration(injury)}
            </Text>
          </View>

          {/* Description */}
          {injury.description && (
            <Text className="text-gray-400 text-sm mt-2" numberOfLines={2}>
              {injury.description}
            </Text>
          )}
        </View>

        {/* Status Badge & Severity */}
        <View className="items-end">
          <View className={`flex-row items-center px-2 py-1 rounded-full ${statusStyle.bg}`}>
            <Ionicons name={statusIcon as any} size={14} color={statusStyle.text.replace('text-', '#')} />
            <Text className={`${statusStyle.text} text-xs ml-1 capitalize`}>
              {injury.status}
            </Text>
          </View>
          
          {/* Severity */}
          <View className="flex-row items-center mt-2">
            <Text className="text-gray-500 text-xs mr-1">Severity:</Text>
            <View className="flex-row">
              {Array.from({ length: 10 }).map((_, i) => (
                <View
                  key={i}
                  className={`w-2 h-2 rounded-full mr-0.5 ${
                    i < injury.severity
                      ? injury.severity <= 3
                        ? 'bg-green-500'
                        : injury.severity <= 6
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                      : 'bg-gray-700'
                  }`}
                />
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Treatment Tags */}
      {injury.treatment && injury.treatment.length > 0 && (
        <View className="flex-row flex-wrap mt-3">
          {injury.treatment.slice(0, 3).map((treatment, index) => (
            <View key={index} className="bg-gray-700 px-2 py-1 rounded mr-1 mb-1">
              <Text className="text-gray-300 text-xs">{treatment}</Text>
            </View>
          ))}
          {injury.treatment.length > 3 && (
            <View className="bg-gray-700 px-2 py-1 rounded">
              <Text className="text-gray-300 text-xs">+{injury.treatment.length - 3}</Text>
            </View>
          )}
        </View>
      )}

      {/* Indicators */}
      <View className="flex-row mt-3">
        {injury.doctorVisited && (
          <View className="flex-row items-center mr-3">
            <Ionicons name="medical" size={14} color="#60A5FA" />
            <Text className="text-blue-400 text-xs ml-1">Doctor</Text>
          </View>
        )}
        {injury.physicalTherapy && (
          <View className="flex-row items-center">
            <Ionicons name="fitness" size={14} color="#A855F7" />
            <Text className="text-purple-400 text-xs ml-1">PT</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}

export default InjuryTimeline

