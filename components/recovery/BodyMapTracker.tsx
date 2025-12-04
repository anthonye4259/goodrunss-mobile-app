/**
 * Body Map Soreness Tracker
 * 
 * Interactive body visualization for logging pain, soreness, and tightness
 * Users tap body parts to log their condition
 */

import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native'
import { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import {
  BodyPart,
  Severity,
  SorenessBodyPart,
  BODY_PART_DISPLAY_NAMES,
} from '@/lib/types/recovery-prevention'

interface BodyMapTrackerProps {
  onSave: (soreness: SorenessBodyPart[]) => void
  initialData?: SorenessBodyPart[]
}

// Body part positions for the visual map (relative percentages)
const BODY_PART_POSITIONS: Record<BodyPart, { top: number; left: number; side?: 'front' | 'back' }> = {
  // Head & Neck
  neck: { top: 12, left: 50 },
  
  // Shoulders
  shoulder_left: { top: 18, left: 30 },
  shoulder_right: { top: 18, left: 70 },
  
  // Arms
  bicep_left: { top: 28, left: 22 },
  bicep_right: { top: 28, left: 78 },
  tricep_left: { top: 28, left: 22, side: 'back' },
  tricep_right: { top: 28, left: 78, side: 'back' },
  elbow_left: { top: 35, left: 18 },
  elbow_right: { top: 35, left: 82 },
  forearm_left: { top: 42, left: 15 },
  forearm_right: { top: 42, left: 85 },
  wrist_left: { top: 50, left: 12 },
  wrist_right: { top: 50, left: 88 },
  
  // Torso Front
  chest: { top: 24, left: 50 },
  abs: { top: 35, left: 50 },
  obliques: { top: 38, left: 40 },
  
  // Torso Back
  upper_back: { top: 22, left: 50, side: 'back' },
  lower_back: { top: 40, left: 50, side: 'back' },
  
  // Hips & Glutes
  hip_left: { top: 48, left: 35 },
  hip_right: { top: 48, left: 65 },
  glutes: { top: 50, left: 50, side: 'back' },
  groin: { top: 52, left: 50 },
  
  // Upper Legs
  quad_left: { top: 58, left: 38 },
  quad_right: { top: 58, left: 62 },
  hamstring_left: { top: 58, left: 38, side: 'back' },
  hamstring_right: { top: 58, left: 62, side: 'back' },
  it_band_left: { top: 60, left: 30 },
  it_band_right: { top: 60, left: 70 },
  
  // Knees
  knee_left: { top: 68, left: 40 },
  knee_right: { top: 68, left: 60 },
  
  // Lower Legs
  calf_left: { top: 78, left: 38, side: 'back' },
  calf_right: { top: 78, left: 62, side: 'back' },
  shin_left: { top: 78, left: 38 },
  shin_right: { top: 78, left: 62 },
  
  // Ankles & Feet
  achilles_left: { top: 88, left: 38, side: 'back' },
  achilles_right: { top: 88, left: 62, side: 'back' },
  ankle_left: { top: 88, left: 40 },
  ankle_right: { top: 88, left: 60 },
  foot_left: { top: 94, left: 40 },
  foot_right: { top: 94, left: 60 },
}

// Simplified body parts for front view
const FRONT_VIEW_PARTS: BodyPart[] = [
  'neck', 'shoulder_left', 'shoulder_right', 'chest', 'bicep_left', 'bicep_right',
  'elbow_left', 'elbow_right', 'forearm_left', 'forearm_right', 'wrist_left', 'wrist_right',
  'abs', 'obliques', 'hip_left', 'hip_right', 'groin',
  'quad_left', 'quad_right', 'it_band_left', 'it_band_right',
  'knee_left', 'knee_right', 'shin_left', 'shin_right',
  'ankle_left', 'ankle_right', 'foot_left', 'foot_right',
]

const BACK_VIEW_PARTS: BodyPart[] = [
  'neck', 'shoulder_left', 'shoulder_right', 'upper_back', 'tricep_left', 'tricep_right',
  'elbow_left', 'elbow_right', 'forearm_left', 'forearm_right', 'wrist_left', 'wrist_right',
  'lower_back', 'glutes', 'hip_left', 'hip_right',
  'hamstring_left', 'hamstring_right', 'it_band_left', 'it_band_right',
  'knee_left', 'knee_right', 'calf_left', 'calf_right',
  'achilles_left', 'achilles_right', 'ankle_left', 'ankle_right', 'foot_left', 'foot_right',
]

const SEVERITY_COLORS: Record<number, string> = {
  1: '#4ADE80', // Green - mild
  2: '#4ADE80',
  3: '#FACC15', // Yellow - moderate
  4: '#FACC15',
  5: '#FB923C', // Orange - significant
  6: '#FB923C',
  7: '#F87171', // Red - severe
  8: '#F87171',
  9: '#DC2626', // Dark red - very severe
  10: '#DC2626',
}

const CONDITION_TYPES = [
  { id: 'soreness', label: 'Soreness', icon: 'fitness', color: '#FB923C' },
  { id: 'tightness', label: 'Tightness', icon: 'contract', color: '#FACC15' },
  { id: 'pain', label: 'Pain', icon: 'alert-circle', color: '#F87171' },
  { id: 'injury', label: 'Injury', icon: 'medkit', color: '#DC2626' },
] as const

export function BodyMapTracker({ onSave, initialData = [] }: BodyMapTrackerProps) {
  const [viewSide, setViewSide] = useState<'front' | 'back'>('front')
  const [selectedParts, setSelectedParts] = useState<SorenessBodyPart[]>(initialData)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedBodyPart, setSelectedBodyPart] = useState<BodyPart | null>(null)
  const [tempSeverity, setTempSeverity] = useState<Severity>(5)
  const [tempCondition, setTempCondition] = useState<'soreness' | 'tightness' | 'pain' | 'injury'>('soreness')

  const currentParts = viewSide === 'front' ? FRONT_VIEW_PARTS : BACK_VIEW_PARTS

  const handleBodyPartPress = (bodyPart: BodyPart) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setSelectedBodyPart(bodyPart)
    
    // Check if already selected
    const existing = selectedParts.find(p => p.bodyPart === bodyPart)
    if (existing) {
      setTempSeverity(existing.severity)
      setTempCondition(existing.type)
    } else {
      setTempSeverity(5)
      setTempCondition('soreness')
    }
    
    setModalVisible(true)
  }

  const handleSaveBodyPart = () => {
    if (!selectedBodyPart) return

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

    const newPart: SorenessBodyPart = {
      bodyPart: selectedBodyPart,
      severity: tempSeverity,
      type: tempCondition,
    }

    setSelectedParts(prev => {
      const filtered = prev.filter(p => p.bodyPart !== selectedBodyPart)
      return [...filtered, newPart]
    })

    setModalVisible(false)
    setSelectedBodyPart(null)
  }

  const handleRemoveBodyPart = () => {
    if (!selectedBodyPart) return

    setSelectedParts(prev => prev.filter(p => p.bodyPart !== selectedBodyPart))
    setModalVisible(false)
    setSelectedBodyPart(null)
  }

  const getBodyPartColor = (bodyPart: BodyPart): string => {
    const part = selectedParts.find(p => p.bodyPart === bodyPart)
    if (part) {
      return SEVERITY_COLORS[part.severity]
    }
    return '#E5E7EB' // Gray for unselected
  }

  const handleSaveAll = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    onSave(selectedParts)
  }

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-800">
        <Text className="text-white text-lg font-bold">Log Soreness</Text>
        <TouchableOpacity
          onPress={handleSaveAll}
          className="bg-orange-500 px-4 py-2 rounded-full"
        >
          <Text className="text-white font-semibold">Save</Text>
        </TouchableOpacity>
      </View>

      {/* View Toggle */}
      <View className="flex-row justify-center py-3">
        <View className="flex-row bg-gray-800 rounded-full p-1">
          <TouchableOpacity
            onPress={() => setViewSide('front')}
            className={`px-6 py-2 rounded-full ${viewSide === 'front' ? 'bg-orange-500' : ''}`}
          >
            <Text className={`font-semibold ${viewSide === 'front' ? 'text-white' : 'text-gray-400'}`}>
              Front
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewSide('back')}
            className={`px-6 py-2 rounded-full ${viewSide === 'back' ? 'bg-orange-500' : ''}`}
          >
            <Text className={`font-semibold ${viewSide === 'back' ? 'text-white' : 'text-gray-400'}`}>
              Back
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Body Map */}
      <View className="flex-1 items-center justify-center px-4">
        <View className="relative w-64 h-96">
          {/* Body Silhouette Background */}
          <View className="absolute inset-0 bg-gray-800 rounded-3xl opacity-30" />
          
          {/* Body Part Touchpoints */}
          {currentParts.map(bodyPart => {
            const position = BODY_PART_POSITIONS[bodyPart]
            if (!position) return null
            
            // Skip if this is specifically for the other side
            if (position.side && position.side !== viewSide) return null

            return (
              <TouchableOpacity
                key={bodyPart}
                onPress={() => handleBodyPartPress(bodyPart)}
                style={{
                  position: 'absolute',
                  top: `${position.top}%`,
                  left: `${position.left}%`,
                  transform: [{ translateX: -12 }, { translateY: -12 }],
                }}
                className="w-6 h-6 rounded-full items-center justify-center"
              >
                <View
                  style={{ backgroundColor: getBodyPartColor(bodyPart) }}
                  className="w-5 h-5 rounded-full border-2 border-white shadow-lg"
                />
              </TouchableOpacity>
            )
          })}

          {/* Body Outline - Simplified SVG-like representation */}
          <View className="absolute inset-0 items-center">
            {/* Head */}
            <View className="w-10 h-10 rounded-full bg-gray-700 mt-2" />
            {/* Neck */}
            <View className="w-4 h-3 bg-gray-700" />
            {/* Torso */}
            <View className="w-20 h-24 bg-gray-700 rounded-lg" />
            {/* Legs */}
            <View className="flex-row">
              <View className="w-8 h-32 bg-gray-700 rounded-lg mr-1" />
              <View className="w-8 h-32 bg-gray-700 rounded-lg ml-1" />
            </View>
          </View>
        </View>
      </View>

      {/* Legend */}
      <View className="px-4 py-3 border-t border-gray-800">
        <Text className="text-gray-400 text-xs mb-2">TAP BODY PARTS TO LOG</Text>
        <View className="flex-row justify-between">
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-green-400 mr-1" />
            <Text className="text-gray-400 text-xs">Mild</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-yellow-400 mr-1" />
            <Text className="text-gray-400 text-xs">Moderate</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-orange-400 mr-1" />
            <Text className="text-gray-400 text-xs">Significant</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-red-500 mr-1" />
            <Text className="text-gray-400 text-xs">Severe</Text>
          </View>
        </View>
      </View>

      {/* Selected Parts Summary */}
      {selectedParts.length > 0 && (
        <View className="px-4 py-3 border-t border-gray-800">
          <Text className="text-white font-semibold mb-2">
            Logged: {selectedParts.length} area{selectedParts.length !== 1 ? 's' : ''}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {selectedParts.map(part => (
              <View
                key={part.bodyPart}
                style={{ backgroundColor: SEVERITY_COLORS[part.severity] }}
                className="px-3 py-1 rounded-full mr-2"
              >
                <Text className="text-white text-sm font-medium">
                  {BODY_PART_DISPLAY_NAMES[part.bodyPart]}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Body Part Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-gray-900 rounded-t-3xl p-6">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-white text-xl font-bold">
                {selectedBodyPart ? BODY_PART_DISPLAY_NAMES[selectedBodyPart] : ''}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Condition Type */}
            <Text className="text-gray-400 text-sm mb-2">CONDITION TYPE</Text>
            <View className="flex-row flex-wrap mb-6">
              {CONDITION_TYPES.map(type => (
                <TouchableOpacity
                  key={type.id}
                  onPress={() => setTempCondition(type.id)}
                  className={`flex-row items-center px-4 py-2 rounded-full mr-2 mb-2 ${
                    tempCondition === type.id ? 'bg-orange-500' : 'bg-gray-800'
                  }`}
                >
                  <Ionicons
                    name={type.icon as any}
                    size={16}
                    color={tempCondition === type.id ? 'white' : type.color}
                  />
                  <Text className={`ml-2 font-medium ${
                    tempCondition === type.id ? 'text-white' : 'text-gray-300'
                  }`}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Severity Slider */}
            <Text className="text-gray-400 text-sm mb-2">SEVERITY: {tempSeverity}/10</Text>
            <View className="flex-row justify-between mb-6">
              {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as Severity[]).map(level => (
                <TouchableOpacity
                  key={level}
                  onPress={() => setTempSeverity(level)}
                  className={`w-8 h-8 rounded-full items-center justify-center ${
                    tempSeverity >= level ? '' : 'opacity-30'
                  }`}
                  style={{ backgroundColor: SEVERITY_COLORS[level] }}
                >
                  <Text className="text-white text-xs font-bold">{level}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Action Buttons */}
            <View className="flex-row">
              {selectedParts.find(p => p.bodyPart === selectedBodyPart) && (
                <TouchableOpacity
                  onPress={handleRemoveBodyPart}
                  className="flex-1 bg-red-500/20 py-4 rounded-xl mr-2"
                >
                  <Text className="text-red-500 text-center font-semibold">Remove</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={handleSaveBodyPart}
                className="flex-1 bg-orange-500 py-4 rounded-xl"
              >
                <Text className="text-white text-center font-semibold">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default BodyMapTracker







