/**
 * Recovery Hub - Main Screen
 * 
 * Central hub for all injury prevention and recovery features
 * Integrates: Recovery Score, Warmups, Cool-downs, Soreness Tracking, Injuries, Marketplace
 */

import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native'
import { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import * as Haptics from 'expo-haptics'

// Components
import { RecoveryScoreDashboard, MiniRecoveryScore } from '@/components/recovery/RecoveryScoreDashboard'
import { RoutineCard, RoutinePlayer } from '@/components/recovery/RoutinePlayer'
import { BodyMapTracker } from '@/components/recovery/BodyMapTracker'

// Data
import { getAllWarmups } from '@/lib/data/warmup-routines'
import { getAllRecoveryRoutines } from '@/lib/data/recovery-routines'
import {
  RecoveryScore,
  SorenessBodyPart,
  WarmupRoutine,
  RecoveryRoutine,
} from '@/lib/types/recovery-prevention'

// Mock recovery score (in production, calculate from actual data)
const MOCK_RECOVERY_SCORE: RecoveryScore = {
  id: 'score-1',
  userId: 'user-1',
  date: new Date(),
  overallScore: 72,
  components: {
    sleep: 78,
    soreness: 65,
    hrv: 70,
    activity: 80,
    stress: 68,
    hydration: 75,
  },
  recommendation: {
    intensity: 'moderate',
    message: 'Your body is recovering well. You can train at moderate intensity today.',
    suggestedActivities: ['Basketball', 'Running', 'Yoga'],
    suggestedRecovery: ['foam_rolling', 'stretching', 'hydration'],
    warnings: [],
  },
  createdAt: new Date(),
}

export default function RecoveryScreen() {
  const [activeTab, setActiveTab] = useState<'home' | 'warmups' | 'recovery' | 'injuries' | 'wearables'>('home')
  const [showBodyMap, setShowBodyMap] = useState(false)
  const [showRoutinePlayer, setShowRoutinePlayer] = useState(false)
  const [selectedRoutine, setSelectedRoutine] = useState<WarmupRoutine | RecoveryRoutine | null>(null)
  const [soreness, setSoreness] = useState<SorenessBodyPart[]>([])

  const warmups = getAllWarmups()
  const recoveryRoutines = getAllRecoveryRoutines()

  const handleStartRoutine = (routine: WarmupRoutine | RecoveryRoutine) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setSelectedRoutine(routine)
    setShowRoutinePlayer(true)
  }

  const handleSaveSoreness = (newSoreness: SorenessBodyPart[]) => {
    setSoreness(newSoreness)
    setShowBodyMap(false)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  }

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <LinearGradient
        colors={['#1F2937', '#111827']}
        className="pt-12 pb-4 px-4"
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-white text-2xl font-bold">Recovery Hub</Text>
            <Text className="text-gray-400">Prevent injuries. Recover faster.</Text>
          </View>
          <MiniRecoveryScore score={MOCK_RECOVERY_SCORE.overallScore} />
        </View>
      </LinearGradient>

      {/* Tab Bar */}
      <View className="flex-row bg-gray-900 px-2 py-2">
        <TabButton
          icon="home"
          label="Home"
          active={activeTab === 'home'}
          onPress={() => setActiveTab('home')}
        />
        <TabButton
          icon="flame"
          label="Warmup"
          active={activeTab === 'warmups'}
          onPress={() => setActiveTab('warmups')}
        />
        <TabButton
          icon="snow"
          label="Recover"
          active={activeTab === 'recovery'}
          onPress={() => setActiveTab('recovery')}
        />
        <TabButton
          icon="medkit"
          label="Injuries"
          active={activeTab === 'injuries'}
          onPress={() => setActiveTab('injuries')}
        />
        <TabButton
          icon="watch"
          label="Wearables"
          active={activeTab === 'wearables'}
          onPress={() => setActiveTab('wearables')}
        />
      </View>

      {/* Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {activeTab === 'home' && (
          <HomeTab
            recoveryScore={MOCK_RECOVERY_SCORE}
            soreness={soreness}
            onLogSoreness={() => setShowBodyMap(true)}
            onStartWarmup={() => setActiveTab('warmups')}
            onQuickAction={(action) => {
              if (action === 'warmup') {
                handleStartRoutine(warmups[0])
              } else if (action === 'recovery') {
                handleStartRoutine(recoveryRoutines[0])
              }
            }}
          />
        )}

        {activeTab === 'warmups' && (
          <RoutineTab
            title="Pre-Activity Warmups"
            description="Dynamic routines to prepare your body and prevent injuries"
            routines={warmups}
            onStartRoutine={handleStartRoutine}
            icon="flame"
            iconColor="#F97316"
          />
        )}

        {activeTab === 'recovery' && (
          <RoutineTab
            title="Post-Activity Recovery"
            description="Cool-down and recovery protocols for faster healing"
            routines={recoveryRoutines}
            onStartRoutine={handleStartRoutine}
            icon="snow"
            iconColor="#3B82F6"
          />
        )}

        {activeTab === 'injuries' && (
          <InjuriesTab
            onLogInjury={() => router.push('/recovery/log-injury')}
            onLogSoreness={() => setShowBodyMap(true)}
          />
        )}

        {activeTab === 'wearables' && (
          <WearablesTab />
        )}

        <View className="h-20" />
      </ScrollView>

      {/* Body Map Modal */}
      <Modal
        visible={showBodyMap}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <BodyMapTracker
          onSave={handleSaveSoreness}
          initialData={soreness}
        />
        <TouchableOpacity
          onPress={() => setShowBodyMap(false)}
          className="absolute top-12 left-4"
        >
          <Ionicons name="close-circle" size={32} color="white" />
        </TouchableOpacity>
      </Modal>

      {/* Routine Player Modal */}
      <Modal
        visible={showRoutinePlayer}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        {selectedRoutine && (
          <RoutinePlayer
            routine={selectedRoutine}
            onComplete={() => {
              setShowRoutinePlayer(false)
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            }}
            onExit={() => setShowRoutinePlayer(false)}
          />
        )}
      </Modal>
    </View>
  )
}

// Tab Button Component
function TabButton({
  icon,
  label,
  active,
  onPress,
}: {
  icon: string
  label: string
  active: boolean
  onPress: () => void
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-1 items-center py-2 rounded-xl ${active ? 'bg-orange-500' : ''}`}
    >
      <Ionicons
        name={icon as any}
        size={20}
        color={active ? 'white' : '#9CA3AF'}
      />
      <Text className={`text-xs mt-1 ${active ? 'text-white font-semibold' : 'text-gray-500'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  )
}

// Home Tab
function HomeTab({
  recoveryScore,
  soreness,
  onLogSoreness,
  onStartWarmup,
  onQuickAction,
}: {
  recoveryScore: RecoveryScore
  soreness: SorenessBodyPart[]
  onLogSoreness: () => void
  onStartWarmup: () => void
  onQuickAction: (action: string) => void
}) {
  return (
    <View className="px-4 pt-4">
      {/* Recovery Score */}
      <RecoveryScoreDashboard
        score={recoveryScore}
        onLogSoreness={onLogSoreness}
        onStartWarmup={onStartWarmup}
      />

      {/* Quick Actions */}
      <Text className="text-gray-400 text-xs mb-3 mt-2">QUICK ACTIONS</Text>
      <View className="flex-row mb-6">
        <QuickActionCard
          icon="flame"
          label="5-Min Warmup"
          color="#F97316"
          onPress={() => onQuickAction('warmup')}
        />
        <QuickActionCard
          icon="body"
          label="Log Soreness"
          color="#8B5CF6"
          onPress={onLogSoreness}
        />
        <QuickActionCard
          icon="snow"
          label="Cool Down"
          color="#3B82F6"
          onPress={() => onQuickAction('recovery')}
        />
      </View>

      {/* Current Soreness */}
      {soreness.length > 0 && (
        <View className="bg-gray-800 rounded-2xl p-4 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-white font-semibold">Today's Soreness</Text>
            <TouchableOpacity onPress={onLogSoreness}>
              <Text className="text-orange-500 text-sm">Update</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row flex-wrap">
            {soreness.map(s => (
              <View
                key={s.bodyPart}
                className={`px-3 py-1 rounded-full mr-2 mb-2 ${
                  s.severity <= 3 ? 'bg-green-500/20' :
                  s.severity <= 6 ? 'bg-yellow-500/20' : 'bg-red-500/20'
                }`}
              >
                <Text className={`text-sm ${
                  s.severity <= 3 ? 'text-green-400' :
                  s.severity <= 6 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {s.bodyPart.replace(/_/g, ' ')} ({s.severity}/10)
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Tips Card */}
      <View className="bg-gradient-to-r from-purple-900 to-purple-800 rounded-2xl p-4">
        <View className="flex-row items-center mb-2">
          <Ionicons name="bulb" size={20} color="#A855F7" />
          <Text className="text-purple-400 font-semibold ml-2">Recovery Tip</Text>
        </View>
        <Text className="text-white">
          Sleep is your #1 recovery tool. Aim for 7-9 hours tonight for optimal recovery.
        </Text>
      </View>
    </View>
  )
}

// Quick Action Card
function QuickActionCard({
  icon,
  label,
  color,
  onPress,
}: {
  icon: string
  label: string
  color: string
  onPress: () => void
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 bg-gray-800 rounded-xl p-4 mx-1 items-center"
    >
      <View
        className="w-10 h-10 rounded-full items-center justify-center mb-2"
        style={{ backgroundColor: `${color}20` }}
      >
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text className="text-white text-xs text-center">{label}</Text>
    </TouchableOpacity>
  )
}

// Routine Tab
function RoutineTab({
  title,
  description,
  routines,
  onStartRoutine,
  icon,
  iconColor,
}: {
  title: string
  description: string
  routines: (WarmupRoutine | RecoveryRoutine)[]
  onStartRoutine: (routine: WarmupRoutine | RecoveryRoutine) => void
  icon: string
  iconColor: string
}) {
  return (
    <View className="px-4 pt-4">
      <View className="flex-row items-center mb-2">
        <Ionicons name={icon as any} size={24} color={iconColor} />
        <Text className="text-white text-xl font-bold ml-2">{title}</Text>
      </View>
      <Text className="text-gray-400 mb-4">{description}</Text>

      {routines.map(routine => (
        <RoutineCard
          key={routine.id}
          routine={routine}
          onPress={() => onStartRoutine(routine)}
        />
      ))}
    </View>
  )
}

// Injuries Tab
function InjuriesTab({
  onLogInjury,
  onLogSoreness,
}: {
  onLogInjury: () => void
  onLogSoreness: () => void
}) {
  return (
    <View className="px-4 pt-4">
      <Text className="text-white text-xl font-bold mb-2">Injury Tracking</Text>
      <Text className="text-gray-400 mb-6">
        Track injuries and soreness for personalized recovery recommendations
      </Text>

      {/* Actions */}
      <View className="flex-row mb-6">
        <TouchableOpacity
          onPress={onLogSoreness}
          className="flex-1 bg-purple-500/20 rounded-xl p-4 mr-2"
        >
          <Ionicons name="body" size={24} color="#A855F7" />
          <Text className="text-white font-semibold mt-2">Log Soreness</Text>
          <Text className="text-gray-400 text-sm">Daily body check-in</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onLogInjury}
          className="flex-1 bg-red-500/20 rounded-xl p-4 ml-2"
        >
          <Ionicons name="medkit" size={24} color="#F87171" />
          <Text className="text-white font-semibold mt-2">Log Injury</Text>
          <Text className="text-gray-400 text-sm">Track an injury</Text>
        </TouchableOpacity>
      </View>

      {/* Empty State */}
      <View className="items-center py-8">
        <View className="w-20 h-20 rounded-full bg-gray-800 items-center justify-center mb-4">
          <Ionicons name="shield-checkmark" size={40} color="#22C55E" />
        </View>
        <Text className="text-white font-semibold text-lg">No Active Injuries</Text>
        <Text className="text-gray-400 text-center mt-2">
          Great! Keep using warmups and recovery routines to stay injury-free.
        </Text>
      </View>

      {/* PT Finder */}
      <TouchableOpacity
        onPress={() => router.push('/recovery/find-pt')}
        className="bg-gray-800 rounded-xl p-4 flex-row items-center"
      >
        <View className="w-12 h-12 rounded-full bg-blue-500/20 items-center justify-center">
          <Ionicons name="medical" size={24} color="#3B82F6" />
        </View>
        <View className="flex-1 ml-3">
          <Text className="text-white font-semibold">Find Recovery Pros</Text>
          <Text className="text-gray-400 text-sm">
            PTs, Sports Medicine, Massage, Chiro
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </TouchableOpacity>
    </View>
  )
}

// Wearables Tab
function WearablesTab() {
  const [connectedDevices, setConnectedDevices] = useState<string[]>([])

  const handleConnectDevice = (device: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    // In production, this would initiate OAuth or HealthKit permissions
    if (connectedDevices.includes(device)) {
      setConnectedDevices(connectedDevices.filter(d => d !== device))
    } else {
      setConnectedDevices([...connectedDevices, device])
    }
  }

  return (
    <View className="px-4 pt-4">
      <Text className="text-white text-xl font-bold mb-2">Wearable Devices</Text>
      <Text className="text-gray-400 mb-6">
        Connect your devices for automatic recovery tracking
      </Text>

      {/* Wearable Cards */}
      <WearableCard
        name="Apple Watch"
        icon="watch"
        color="#FF2D55"
        description="Sync HRV, sleep, heart rate, and activity data via HealthKit"
        metrics={['HRV', 'Sleep', 'Heart Rate', 'Steps', 'Workouts']}
        connected={connectedDevices.includes('apple_watch')}
        onConnect={() => handleConnectDevice('apple_watch')}
      />

      <WearableCard
        name="WHOOP"
        icon="fitness"
        color="#00DC5A"
        description="Get your recovery score, strain, and sleep performance"
        metrics={['Recovery', 'Strain', 'Sleep', 'HRV', 'RHR']}
        connected={connectedDevices.includes('whoop')}
        onConnect={() => handleConnectDevice('whoop')}
      />

      <WearableCard
        name="Oura Ring"
        icon="ellipse"
        color="#C4A052"
        description="Track readiness, sleep quality, and activity goals"
        metrics={['Readiness', 'Sleep Score', 'Activity', 'HRV', 'Temperature']}
        connected={connectedDevices.includes('oura')}
        onConnect={() => handleConnectDevice('oura')}
      />

      {/* Data Usage Info */}
      <View className="bg-gray-800 rounded-xl p-4 mt-4">
        <View className="flex-row items-center mb-2">
          <Ionicons name="shield-checkmark" size={20} color="#22C55E" />
          <Text className="text-white font-semibold ml-2">Your Data is Secure</Text>
        </View>
        <Text className="text-gray-400 text-sm">
          We only read health data to calculate your recovery score. Your data is never shared or sold.
        </Text>
      </View>

      {/* What We Track */}
      <View className="mt-6">
        <Text className="text-gray-400 text-sm mb-3">WHAT WE USE FOR RECOVERY SCORE</Text>
        <View className="flex-row flex-wrap">
          <MetricTag icon="heart" label="HRV" color="#F87171" />
          <MetricTag icon="moon" label="Sleep" color="#818CF8" />
          <MetricTag icon="pulse" label="Resting HR" color="#FB923C" />
          <MetricTag icon="flame" label="Activity" color="#22C55E" />
          <MetricTag icon="thermometer" label="Temperature" color="#06B6D4" />
          <MetricTag icon="trending-up" label="Trends" color="#FACC15" />
        </View>
      </View>
    </View>
  )
}

// Wearable Card Component
function WearableCard({
  name,
  icon,
  color,
  description,
  metrics,
  connected,
  onConnect,
}: {
  name: string
  icon: string
  color: string
  description: string
  metrics: string[]
  connected: boolean
  onConnect: () => void
}) {
  return (
    <View className={`bg-gray-800 rounded-2xl p-4 mb-3 ${connected ? 'border-2' : ''}`}
      style={connected ? { borderColor: color } : undefined}
    >
      <View className="flex-row items-center">
        <View
          className="w-14 h-14 rounded-full items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Ionicons name={icon as any} size={28} color={color} />
        </View>
        <View className="flex-1 ml-4">
          <View className="flex-row items-center">
            <Text className="text-white font-semibold text-lg">{name}</Text>
            {connected && (
              <View className="bg-green-500 px-2 py-0.5 rounded-full ml-2">
                <Text className="text-white text-xs font-semibold">Connected</Text>
              </View>
            )}
          </View>
          <Text className="text-gray-400 text-sm mt-1">{description}</Text>
        </View>
      </View>

      {/* Metrics */}
      <View className="flex-row flex-wrap mt-3">
        {metrics.map((metric, index) => (
          <View key={index} className="bg-gray-700 px-2 py-1 rounded mr-1 mb-1">
            <Text className="text-gray-300 text-xs">{metric}</Text>
          </View>
        ))}
      </View>

      {/* Connect Button */}
      <TouchableOpacity
        onPress={onConnect}
        className={`mt-4 py-3 rounded-xl ${connected ? 'bg-gray-700' : ''}`}
        style={!connected ? { backgroundColor: color } : undefined}
      >
        <Text className="text-white text-center font-semibold">
          {connected ? 'Disconnect' : 'Connect'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

// Metric Tag Component
function MetricTag({
  icon,
  label,
  color,
}: {
  icon: string
  label: string
  color: string
}) {
  return (
    <View className="flex-row items-center bg-gray-800 px-3 py-2 rounded-full mr-2 mb-2">
      <Ionicons name={icon as any} size={14} color={color} />
      <Text className="text-gray-300 text-sm ml-1">{label}</Text>
    </View>
  )
}

