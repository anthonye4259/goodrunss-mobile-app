/**
 * Facility Filters Component
 * 
 * Intelligent filtering system for recreational and wellness facilities
 * Allows users to filter by sport, facility type, distance, price, and more
 */

import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import {
  SportType,
  FacilityType,
  AccessType,
  SPORT_DISPLAY_NAMES,
  FACILITY_DISPLAY_NAMES,
} from '@/lib/types/global-facilities'

export interface FacilityFilterOptions {
  sports: SportType[]
  facilityTypes: FacilityType[]
  accessTypes: AccessType[]
  maxDistance?: number
  minRating?: number
  priceRange?: [number, number]
  amenities: string[]
  openNow?: boolean
}

interface FacilityFiltersProps {
  filters: FacilityFilterOptions
  onFilterChange: (filters: FacilityFilterOptions) => void
  userLocation?: { lat: number; lng: number }
}

// Popular sport categories
const SPORT_CATEGORIES = {
  'Courts': ['basketball', 'tennis', 'pickleball', 'racquetball', 'volleyball'] as SportType[],
  'Fields': ['soccer', 'football', 'baseball', 'softball', 'rugby'] as SportType[],
  'Water': ['swimming', 'water_polo', 'diving'] as SportType[],
  'Fitness': ['yoga', 'pilates', 'barre', 'spin', 'crossfit', 'boxing'] as SportType[],
  'Gyms': ['gym', 'climbing', 'martial_arts'] as SportType[],
  'Other': ['golf', 'running', 'skating', 'bowling'] as SportType[],
}

// Common amenities
const COMMON_AMENITIES = [
  'Parking',
  'Restrooms',
  'Lockers',
  'Showers',
  'WiFi',
  'Air Conditioning',
  'Lighting',
  'Seating',
  'Water Fountain',
  'Equipment Rental',
  'Childcare',
]

export function FacilityFilters({ filters, onFilterChange, userLocation }: FacilityFiltersProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const toggleSport = (sport: SportType) => {
    const newSports = filters.sports.includes(sport)
      ? filters.sports.filter(s => s !== sport)
      : [...filters.sports, sport]
    onFilterChange({ ...filters, sports: newSports })
  }

  const toggleAccessType = (accessType: AccessType) => {
    const newAccessTypes = filters.accessTypes.includes(accessType)
      ? filters.accessTypes.filter(a => a !== accessType)
      : [...filters.accessTypes, accessType]
    onFilterChange({ ...filters, accessTypes: newAccessTypes })
  }

  const toggleAmenity = (amenity: string) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity]
    onFilterChange({ ...filters, amenities: newAmenities })
  }

  const setDistance = (distance: number) => {
    onFilterChange({ ...filters, maxDistance: distance })
  }

  const setMinRating = (rating: number) => {
    onFilterChange({ ...filters, minRating: rating })
  }

  const clearFilters = () => {
    onFilterChange({
      sports: [],
      facilityTypes: [],
      accessTypes: [],
      amenities: [],
    })
  }

  const activeFilterCount = 
    filters.sports.length + 
    filters.facilityTypes.length + 
    filters.accessTypes.length + 
    filters.amenities.length +
    (filters.maxDistance ? 1 : 0) +
    (filters.minRating ? 1 : 0)

  return (
    <View className="bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
        <Text className="text-lg font-bold">Filters</Text>
        {activeFilterCount > 0 && (
          <TouchableOpacity onPress={clearFilters}>
            <Text className="text-orange-500 font-semibold">
              Clear All ({activeFilterCount})
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView className="max-h-96">
        {/* Sport Categories */}
        <FilterSection
          title="Sport Type"
          count={filters.sports.length}
          expanded={expandedSection === 'sports'}
          onToggle={() => toggleSection('sports')}
        >
          {Object.entries(SPORT_CATEGORIES).map(([category, sports]) => (
            <View key={category} className="mb-4">
              <Text className="text-xs font-semibold text-gray-500 mb-2 uppercase">
                {category}
              </Text>
              <View className="flex-row flex-wrap">
                {sports.map(sport => (
                  <FilterChip
                    key={sport}
                    label={SPORT_DISPLAY_NAMES[sport]}
                    selected={filters.sports.includes(sport)}
                    onPress={() => toggleSport(sport)}
                  />
                ))}
              </View>
            </View>
          ))}
        </FilterSection>

        {/* Distance */}
        {userLocation && (
          <FilterSection
            title="Distance"
            count={filters.maxDistance ? 1 : 0}
            expanded={expandedSection === 'distance'}
            onToggle={() => toggleSection('distance')}
          >
            <View className="flex-row flex-wrap">
              {[1, 5, 10, 25, 50].map(distance => (
                <FilterChip
                  key={distance}
                  label={`${distance} km`}
                  selected={filters.maxDistance === distance}
                  onPress={() => setDistance(distance)}
                />
              ))}
            </View>
          </FilterSection>
        )}

        {/* Access Type */}
        <FilterSection
          title="Access"
          count={filters.accessTypes.length}
          expanded={expandedSection === 'access'}
          onToggle={() => toggleSection('access')}
        >
          <View className="flex-row flex-wrap">
            {(['public', 'members_only', 'day_pass', 'reservation'] as AccessType[]).map(accessType => (
              <FilterChip
                key={accessType}
                label={accessType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                selected={filters.accessTypes.includes(accessType)}
                onPress={() => toggleAccessType(accessType)}
              />
            ))}
          </View>
        </FilterSection>

        {/* Rating */}
        <FilterSection
          title="Minimum Rating"
          count={filters.minRating ? 1 : 0}
          expanded={expandedSection === 'rating'}
          onToggle={() => toggleSection('rating')}
        >
          <View className="flex-row flex-wrap">
            {[3, 3.5, 4, 4.5].map(rating => (
              <FilterChip
                key={rating}
                label={`${rating}+ ⭐`}
                selected={filters.minRating === rating}
                onPress={() => setMinRating(rating)}
              />
            ))}
          </View>
        </FilterSection>

        {/* Amenities */}
        <FilterSection
          title="Amenities"
          count={filters.amenities.length}
          expanded={expandedSection === 'amenities'}
          onToggle={() => toggleSection('amenities')}
        >
          <View className="flex-row flex-wrap">
            {COMMON_AMENITIES.map(amenity => (
              <FilterChip
                key={amenity}
                label={amenity}
                selected={filters.amenities.includes(amenity)}
                onPress={() => toggleAmenity(amenity)}
              />
            ))}
          </View>
        </FilterSection>

        {/* Open Now */}
        <FilterSection
          title="Availability"
          count={filters.openNow ? 1 : 0}
          expanded={expandedSection === 'availability'}
          onToggle={() => toggleSection('availability')}
        >
          <FilterChip
            label="Open Now"
            selected={filters.openNow || false}
            onPress={() => onFilterChange({ ...filters, openNow: !filters.openNow })}
          />
        </FilterSection>
      </ScrollView>
    </View>
  )
}

// Filter Section Component
interface FilterSectionProps {
  title: string
  count: number
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}

function FilterSection({ title, count, expanded, onToggle, children }: FilterSectionProps) {
  return (
    <View className="border-b border-gray-200">
      <TouchableOpacity
        onPress={onToggle}
        className="flex-row items-center justify-between p-4"
      >
        <View className="flex-row items-center">
          <Text className="text-base font-semibold">{title}</Text>
          {count > 0 && (
            <View className="ml-2 bg-orange-500 rounded-full px-2 py-0.5">
              <Text className="text-white text-xs font-bold">{count}</Text>
            </View>
          )}
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#666"
        />
      </TouchableOpacity>

      {expanded && (
        <View className="px-4 pb-4">
          {children}
        </View>
      )}
    </View>
  )
}

// Filter Chip Component
interface FilterChipProps {
  label: string
  selected: boolean
  onPress: () => void
}

function FilterChip({ label, selected, onPress }: FilterChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`mr-2 mb-2 px-3 py-2 rounded-full border ${
        selected
          ? 'bg-orange-500 border-orange-500'
          : 'bg-white border-gray-300'
      }`}
    >
      <Text
        className={`text-sm font-medium ${
          selected ? 'text-white' : 'text-gray-700'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  )
}

// Active Filters Display
interface ActiveFiltersProps {
  filters: FacilityFilterOptions
  onFilterChange: (filters: FacilityFilterOptions) => void
}

export function ActiveFilters({ filters, onFilterChange }: ActiveFiltersProps) {
  const hasActiveFilters =
    filters.sports.length > 0 ||
    filters.accessTypes.length > 0 ||
    filters.amenities.length > 0 ||
    filters.maxDistance ||
    filters.minRating

  if (!hasActiveFilters) return null

  const removeFilter = (type: string, value: any) => {
    if (type === 'sport') {
      onFilterChange({ ...filters, sports: filters.sports.filter(s => s !== value) })
    } else if (type === 'access') {
      onFilterChange({ ...filters, accessTypes: filters.accessTypes.filter(a => a !== value) })
    } else if (type === 'amenity') {
      onFilterChange({ ...filters, amenities: filters.amenities.filter(a => a !== value) })
    } else if (type === 'distance') {
      onFilterChange({ ...filters, maxDistance: undefined })
    } else if (type === 'rating') {
      onFilterChange({ ...filters, minRating: undefined })
    }
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="bg-white border-b border-gray-200 py-2 px-4"
    >
      {filters.sports.map(sport => (
        <ActiveFilterChip
          key={sport}
          label={SPORT_DISPLAY_NAMES[sport]}
          onRemove={() => removeFilter('sport', sport)}
        />
      ))}
      {filters.accessTypes.map(accessType => (
        <ActiveFilterChip
          key={accessType}
          label={accessType.replace(/_/g, ' ')}
          onRemove={() => removeFilter('access', accessType)}
        />
      ))}
      {filters.maxDistance && (
        <ActiveFilterChip
          label={`${filters.maxDistance} km`}
          onRemove={() => removeFilter('distance', null)}
        />
      )}
      {filters.minRating && (
        <ActiveFilterChip
          label={`${filters.minRating}+ ⭐`}
          onRemove={() => removeFilter('rating', null)}
        />
      )}
      {filters.amenities.map(amenity => (
        <ActiveFilterChip
          key={amenity}
          label={amenity}
          onRemove={() => removeFilter('amenity', amenity)}
        />
      ))}
    </ScrollView>
  )
}

// Active Filter Chip
interface ActiveFilterChipProps {
  label: string
  onRemove: () => void
}

function ActiveFilterChip({ label, onRemove }: ActiveFilterChipProps) {
  return (
    <View className="flex-row items-center bg-orange-100 border border-orange-300 rounded-full px-3 py-1.5 mr-2">
      <Text className="text-sm font-medium text-orange-700 mr-1">{label}</Text>
      <TouchableOpacity onPress={onRemove}>
        <Ionicons name="close-circle" size={16} color="#EA580C" />
      </TouchableOpacity>
    </View>
  )
}







