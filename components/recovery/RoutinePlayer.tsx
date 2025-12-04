/**
 * Routine Player
 * 
 * Guides users through warmup and recovery routines
 * Timer-based exercise progression with video/image support
 */

import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native'
import { useState, useEffect, useRef } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { WarmupRoutine, RecoveryRoutine, WarmupExercise, RecoveryExercise } from '@/lib/types/recovery-prevention'

type Routine = WarmupRoutine | RecoveryRoutine
type Exercise = WarmupExercise | RecoveryExercise

interface RoutinePlayerProps {
  routine: Routine
  onComplete: () => void
  onExit: () => void
}

export function RoutinePlayer({ routine, onComplete, onExit }: RoutinePlayerProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isResting, setIsResting] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const exercises = routine.exercises as Exercise[]
  const currentExercise = exercises[currentExerciseIndex]
  const progress = ((currentExerciseIndex + 1) / exercises.length) * 100

  // Calculate exercise duration
  const getExerciseDuration = (exercise: Exercise): number => {
    if (exercise.duration) return exercise.duration
    if ('holdDuration' in exercise && exercise.holdDuration) return exercise.holdDuration
    if (exercise.reps) return exercise.reps * 3 // ~3 seconds per rep
    return 30 // Default 30 seconds
  }

  useEffect(() => {
    if (currentExercise) {
      setTimeRemaining(getExerciseDuration(currentExercise))
    }
  }, [currentExerciseIndex])

  useEffect(() => {
    if (isPlaying && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(prev => prev - 1)
      }, 1000)
    } else if (isPlaying && timeRemaining === 0) {
      handleExerciseComplete()
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, timeRemaining])

  const handleExerciseComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

    const restAfter = currentExercise.restAfter || 0

    if (restAfter > 0 && !isResting) {
      // Start rest period
      setIsResting(true)
      setTimeRemaining(restAfter)
    } else if (currentExerciseIndex < exercises.length - 1) {
      // Move to next exercise
      setIsResting(false)
      setCurrentExerciseIndex(prev => prev + 1)
    } else {
      // Routine complete
      setIsPlaying(false)
      onComplete()
    }
  }

  const togglePlayPause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setIsPlaying(!isPlaying)
  }

  const skipExercise = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1)
      setIsResting(false)
    } else {
      onComplete()
    }
  }

  const previousExercise = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1)
      setIsResting(false)
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 pt-12">
        <TouchableOpacity onPress={onExit}>
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>
        <View className="items-center">
          <Text className="text-white font-semibold">{routine.name}</Text>
          <Text className="text-gray-400 text-xs">
            {currentExerciseIndex + 1} of {exercises.length}
          </Text>
        </View>
        <TouchableOpacity onPress={skipExercise}>
          <Text className="text-orange-500 font-semibold">Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View className="h-1 bg-gray-800 mx-4 rounded-full overflow-hidden">
        <View
          className="h-full bg-orange-500 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1 px-4 pt-6">
        {isResting ? (
          // Rest Screen
          <View className="items-center py-12">
            <View className="w-32 h-32 rounded-full bg-gray-800 items-center justify-center mb-6">
              <Ionicons name="pause-circle" size={64} color="#FACC15" />
            </View>
            <Text className="text-yellow-400 text-2xl font-bold mb-2">REST</Text>
            <Text className="text-gray-400 text-center">
              Take a breather before the next exercise
            </Text>
          </View>
        ) : (
          // Exercise Screen
          <>
            {/* Exercise Image Placeholder */}
            <View className="bg-gray-800 rounded-2xl h-48 items-center justify-center mb-6">
              {currentExercise.imageUrl ? (
                <Image
                  source={{ uri: currentExercise.imageUrl }}
                  className="w-full h-full rounded-2xl"
                  resizeMode="cover"
                />
              ) : (
                <View className="items-center">
                  <Ionicons name="fitness" size={64} color="#4B5563" />
                  <Text className="text-gray-500 mt-2">Exercise Animation</Text>
                </View>
              )}
            </View>

            {/* Exercise Name */}
            <Text className="text-white text-2xl font-bold text-center mb-2">
              {currentExercise.name}
            </Text>
            <Text className="text-gray-400 text-center mb-6">
              {currentExercise.description}
            </Text>

            {/* Exercise Details */}
            <View className="flex-row justify-center mb-6">
              {currentExercise.reps && (
                <View className="bg-gray-800 px-4 py-2 rounded-full mr-2">
                  <Text className="text-orange-500 font-semibold">
                    {currentExercise.reps} reps
                  </Text>
                </View>
              )}
              {currentExercise.sets && currentExercise.sets > 1 && (
                <View className="bg-gray-800 px-4 py-2 rounded-full mr-2">
                  <Text className="text-orange-500 font-semibold">
                    {currentExercise.sets} sets
                  </Text>
                </View>
              )}
              {'holdDuration' in currentExercise && currentExercise.holdDuration && (
                <View className="bg-gray-800 px-4 py-2 rounded-full">
                  <Text className="text-orange-500 font-semibold">
                    Hold {currentExercise.holdDuration}s
                  </Text>
                </View>
              )}
            </View>

            {/* Instructions */}
            <View className="bg-gray-800 rounded-2xl p-4 mb-6">
              <Text className="text-gray-400 text-sm mb-2">INSTRUCTIONS</Text>
              {currentExercise.instructions.map((instruction, index) => (
                <View key={index} className="flex-row mb-2">
                  <Text className="text-orange-500 font-bold mr-2">{index + 1}.</Text>
                  <Text className="text-white flex-1">{instruction}</Text>
                </View>
              ))}
            </View>

            {/* Tips */}
            {currentExercise.tips && currentExercise.tips.length > 0 && (
              <View className="bg-green-500/20 rounded-2xl p-4 mb-6">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="bulb" size={16} color="#22C55E" />
                  <Text className="text-green-500 text-sm ml-2">TIPS</Text>
                </View>
                {currentExercise.tips.map((tip, index) => (
                  <Text key={index} className="text-green-400 mb-1">• {tip}</Text>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Timer & Controls */}
      <View className="px-4 pb-8 pt-4 border-t border-gray-800">
        {/* Timer Display */}
        <View className="items-center mb-6">
          <Text className="text-white text-6xl font-bold font-mono">
            {formatTime(timeRemaining)}
          </Text>
          <Text className="text-gray-500 text-sm mt-1">
            {isResting ? 'Rest remaining' : 'Time remaining'}
          </Text>
        </View>

        {/* Control Buttons */}
        <View className="flex-row items-center justify-center">
          <TouchableOpacity
            onPress={previousExercise}
            className="w-14 h-14 rounded-full bg-gray-800 items-center justify-center mr-4"
            disabled={currentExerciseIndex === 0}
          >
            <Ionicons
              name="play-back"
              size={24}
              color={currentExerciseIndex === 0 ? '#4B5563' : 'white'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={togglePlayPause}
            className="w-20 h-20 rounded-full items-center justify-center"
          >
            <LinearGradient
              colors={['#F97316', '#EA580C']}
              className="w-20 h-20 rounded-full items-center justify-center"
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={36}
                color="white"
              />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={skipExercise}
            className="w-14 h-14 rounded-full bg-gray-800 items-center justify-center ml-4"
          >
            <Ionicons name="play-forward" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

// Routine Card for selection
export function RoutineCard({
  routine,
  onPress,
}: {
  routine: Routine
  onPress: () => void
}) {
  const isWarmup = 'type' in routine && routine.type

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-gray-800 rounded-2xl p-4 mb-3"
    >
      <View className="flex-row items-center">
        <View
          className={`w-12 h-12 rounded-full items-center justify-center ${
            isWarmup ? 'bg-orange-500/20' : 'bg-blue-500/20'
          }`}
        >
          <Ionicons
            name={isWarmup ? 'flame' : 'snow'}
            size={24}
            color={isWarmup ? '#F97316' : '#3B82F6'}
          />
        </View>
        <View className="flex-1 ml-3">
          <Text className="text-white font-semibold">{routine.name}</Text>
          <Text className="text-gray-400 text-sm">
            {routine.duration} min • {routine.exercises.length} exercises
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </View>

      {routine.sport && (
        <View className="flex-row mt-3">
          <View className="bg-gray-700 px-2 py-1 rounded">
            <Text className="text-gray-300 text-xs capitalize">{routine.sport}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  )
}

export default RoutinePlayer







