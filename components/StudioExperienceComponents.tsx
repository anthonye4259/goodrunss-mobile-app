/**
 * Studio Experience UI Components
 * 
 * Visual components for:
 * - Vibe badges and selectors
 * - Reformer availability indicator
 * - No ClassPass badge
 * - Music preference chips
 */

import React from "react"
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import {
    StudioVibe,
    MusicStyle,
    VIBE_DISPLAY,
    MUSIC_DISPLAY,
    getDemandText,
    getVibeMatchLabel,
    type ReformerAvailability,
} from "@/lib/types/studio-experience"

// ============================================
// VIBE BADGE
// ============================================

interface VibeBadgeProps {
    vibe: StudioVibe
    size?: "small" | "medium" | "large"
    showDescription?: boolean
}

export function VibeBadge({ vibe, size = "medium", showDescription = false }: VibeBadgeProps) {
    const display = VIBE_DISPLAY[vibe]
    if (!display) return null

    const sizeStyles = {
        small: { padding: 6, fontSize: 11, emojiSize: 14 },
        medium: { padding: 10, fontSize: 13, emojiSize: 16 },
        large: { padding: 14, fontSize: 15, emojiSize: 20 },
    }
    const s = sizeStyles[size]

    return (
        <View style={[styles.vibeBadge, { padding: s.padding }]}>
            <Text style={{ fontSize: s.emojiSize }}>{display.emoji}</Text>
            <View style={styles.vibeBadgeText}>
                <Text style={[styles.vibeLabel, { fontSize: s.fontSize }]}>
                    {display.label}
                </Text>
                {showDescription && (
                    <Text style={styles.vibeDescription}>{display.description}</Text>
                )}
            </View>
        </View>
    )
}

// ============================================
// VIBE SELECTOR
// ============================================

interface VibeSelectorProps {
    selectedVibes: StudioVibe[]
    onToggle: (vibe: StudioVibe) => void
    maxSelections?: number
}

export function VibeSelector({ selectedVibes, onToggle, maxSelections = 3 }: VibeSelectorProps) {
    const allVibes = Object.keys(VIBE_DISPLAY) as StudioVibe[]

    const handleToggle = (vibe: StudioVibe) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

        if (selectedVibes.includes(vibe)) {
            onToggle(vibe)
        } else if (selectedVibes.length < maxSelections) {
            onToggle(vibe)
        }
    }

    return (
        <View style={styles.vibeGrid}>
            {allVibes.map(vibe => {
                const display = VIBE_DISPLAY[vibe]
                const isSelected = selectedVibes.includes(vibe)

                return (
                    <TouchableOpacity
                        key={vibe}
                        style={[
                            styles.vibeOption,
                            isSelected && styles.vibeOptionSelected,
                        ]}
                        onPress={() => handleToggle(vibe)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.vibeEmoji}>{display.emoji}</Text>
                        <Text style={[
                            styles.vibeOptionLabel,
                            isSelected && styles.vibeOptionLabelSelected,
                        ]}>
                            {display.label}
                        </Text>
                        {isSelected && (
                            <Ionicons
                                name="checkmark-circle"
                                size={18}
                                color="#7ED957"
                                style={styles.vibeCheck}
                            />
                        )}
                    </TouchableOpacity>
                )
            })}
        </View>
    )
}

// ============================================
// MUSIC CHIPS
// ============================================

interface MusicChipsProps {
    musicStyles: MusicStyle[]
    limit?: number
}

export function MusicChips({ musicStyles, limit = 3 }: MusicChipsProps) {
    const displayed = musicStyles.slice(0, limit)

    return (
        <View style={styles.musicChipsRow}>
            {displayed.map(style => {
                const display = MUSIC_DISPLAY[style]
                if (!display) return null

                return (
                    <View key={style} style={styles.musicChip}>
                        <Text style={styles.musicEmoji}>{display.emoji}</Text>
                        <Text style={styles.musicLabel}>{display.label}</Text>
                    </View>
                )
            })}
            {musicStyles.length > limit && (
                <Text style={styles.moreChips}>
                    +{musicStyles.length - limit}
                </Text>
            )}
        </View>
    )
}

// ============================================
// MUSIC SELECTOR
// ============================================

interface MusicSelectorProps {
    selectedMusic: MusicStyle[]
    onToggle: (style: MusicStyle) => void
}

export function MusicSelector({ selectedMusic, onToggle }: MusicSelectorProps) {
    const allStyles = Object.keys(MUSIC_DISPLAY) as MusicStyle[]

    return (
        <View style={styles.musicGrid}>
            {allStyles.map(style => {
                const display = MUSIC_DISPLAY[style]
                const isSelected = selectedMusic.includes(style)

                return (
                    <TouchableOpacity
                        key={style}
                        style={[
                            styles.musicOption,
                            isSelected && styles.musicOptionSelected,
                        ]}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                            onToggle(style)
                        }}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.musicOptionEmoji}>{display.emoji}</Text>
                        <Text style={[
                            styles.musicOptionLabel,
                            isSelected && styles.musicOptionLabelSelected,
                        ]}>
                            {display.label}
                        </Text>
                    </TouchableOpacity>
                )
            })}
        </View>
    )
}

// ============================================
// REFORMER AVAILABILITY
// ============================================

interface ReformerAvailabilityBadgeProps {
    availability: ReformerAvailability
    showDetails?: boolean
}

export function ReformerAvailabilityBadge({
    availability,
    showDetails = false
}: ReformerAvailabilityBadgeProps) {
    const { availableReformers, totalReformers, demandLevel, waitlistCount } = availability
    const demandInfo = getDemandText(demandLevel)

    const percentFull = ((totalReformers - availableReformers) / totalReformers) * 100

    return (
        <View style={styles.reformerContainer}>
            <View style={styles.reformerHeader}>
                <View style={styles.reformerIcon}>
                    <Text style={styles.reformerEmoji}>🏋️</Text>
                </View>
                <View style={styles.reformerInfo}>
                    <Text style={styles.reformerTitle}>Reformer Availability</Text>
                    <Text style={[styles.reformerStatus, { color: demandInfo.color }]}>
                        {demandInfo.text}
                    </Text>
                </View>
                <View style={[styles.reformerCount, { backgroundColor: demandInfo.color + "20" }]}>
                    <Text style={[styles.reformerCountText, { color: demandInfo.color }]}>
                        {availableReformers}/{totalReformers}
                    </Text>
                </View>
            </View>

            {/* Progress bar */}
            <View style={styles.reformerBar}>
                <View
                    style={[
                        styles.reformerBarFill,
                        { width: `${percentFull}%`, backgroundColor: demandInfo.color }
                    ]}
                />
            </View>

            {showDetails && (
                <View style={styles.reformerDetails}>
                    {waitlistCount > 0 && (
                        <View style={styles.reformerDetail}>
                            <Ionicons name="hourglass-outline" size={14} color="#9CA3AF" />
                            <Text style={styles.reformerDetailText}>
                                {waitlistCount} on waitlist
                            </Text>
                        </View>
                    )}
                    <View style={styles.reformerDetail}>
                        <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
                        <Text style={styles.reformerDetailText}>
                            Books out {availability.bookedOutDays}+ days ahead
                        </Text>
                    </View>
                </View>
            )}
        </View>
    )
}

// ============================================
// NO CLASSPASS BADGE
// ============================================

interface NoClassPassBadgeProps {
    size?: "small" | "medium"
    showText?: boolean
}

export function NoClassPassBadge({ size = "medium", showText = true }: NoClassPassBadgeProps) {
    const iconSize = size === "small" ? 14 : 18
    const fontSize = size === "small" ? 11 : 13
    const padding = size === "small" ? 6 : 10

    return (
        <View style={[styles.noClassPassBadge, { padding }]}>
            <View style={styles.noClassPassIcon}>
                <Ionicons name="close-circle" size={iconSize} color="#EF4444" />
            </View>
            {showText && (
                <Text style={[styles.noClassPassText, { fontSize }]}>
                    No ClassPass
                </Text>
            )}
            <View style={styles.noClassPassCheck}>
                <Ionicons name="checkmark-circle" size={iconSize} color="#22C55E" />
            </View>
        </View>
    )
}

/**
 * Direct Booking Preferred Badge
 */
export function DirectBookingBadge() {
    return (
        <View style={styles.directBookingBadge}>
            <Ionicons name="heart" size={14} color="#7ED957" />
            <Text style={styles.directBookingText}>Direct Booking Preferred</Text>
        </View>
    )
}

// ============================================
// VIBE MATCH INDICATOR
// ============================================

interface VibeMatchIndicatorProps {
    score: number
    showLabel?: boolean
}

export function VibeMatchIndicator({ score, showLabel = true }: VibeMatchIndicatorProps) {
    const match = getVibeMatchLabel(score)

    return (
        <View style={[styles.vibeMatchContainer, { borderColor: match.color }]}>
            <Text style={styles.vibeMatchEmoji}>{match.emoji}</Text>
            <Text style={[styles.vibeMatchScore, { color: match.color }]}>
                {score}%
            </Text>
            {showLabel && (
                <Text style={[styles.vibeMatchLabel, { color: match.color }]}>
                    {match.label}
                </Text>
            )}
        </View>
    )
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
    // Vibe Badge
    vibeBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#252525",
        borderRadius: 12,
        gap: 8,
    },
    vibeBadgeText: {
        flex: 1,
    },
    vibeLabel: {
        color: "#FFFFFF",
        fontWeight: "600",
    },
    vibeDescription: {
        fontSize: 11,
        color: "#9CA3AF",
        marginTop: 2,
    },

    // Vibe Selector
    vibeGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    vibeOption: {
        width: "48%",
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 14,
        borderWidth: 2,
        borderColor: "transparent",
        gap: 10,
    },
    vibeOptionSelected: {
        borderColor: "#7ED957",
        backgroundColor: "rgba(126, 217, 87, 0.1)",
    },
    vibeEmoji: {
        fontSize: 24,
    },
    vibeOptionLabel: {
        flex: 1,
        fontSize: 13,
        color: "#9CA3AF",
        fontWeight: "500",
    },
    vibeOptionLabelSelected: {
        color: "#FFFFFF",
    },
    vibeCheck: {
        marginLeft: "auto",
    },

    // Music Chips
    musicChipsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        alignItems: "center",
    },
    musicChip: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#252525",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 4,
    },
    musicEmoji: {
        fontSize: 12,
    },
    musicLabel: {
        fontSize: 12,
        color: "#D1D5DB",
    },
    moreChips: {
        fontSize: 12,
        color: "#7ED957",
        fontWeight: "600",
    },

    // Music Selector
    musicGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    musicOption: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderWidth: 1.5,
        borderColor: "#333",
        gap: 6,
    },
    musicOptionSelected: {
        borderColor: "#7ED957",
        backgroundColor: "rgba(126, 217, 87, 0.1)",
    },
    musicOptionEmoji: {
        fontSize: 14,
    },
    musicOptionLabel: {
        fontSize: 13,
        color: "#9CA3AF",
    },
    musicOptionLabelSelected: {
        color: "#FFFFFF",
        fontWeight: "600",
    },

    // Reformer Availability
    reformerContainer: {
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: "#333",
    },
    reformerHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    reformerIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#252525",
        justifyContent: "center",
        alignItems: "center",
    },
    reformerEmoji: {
        fontSize: 18,
    },
    reformerInfo: {
        flex: 1,
        marginLeft: 10,
    },
    reformerTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    reformerStatus: {
        fontSize: 12,
        marginTop: 1,
    },
    reformerCount: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    reformerCountText: {
        fontSize: 13,
        fontWeight: "700",
    },
    reformerBar: {
        height: 6,
        backgroundColor: "#333",
        borderRadius: 3,
        overflow: "hidden",
    },
    reformerBarFill: {
        height: "100%",
        borderRadius: 3,
    },
    reformerDetails: {
        marginTop: 10,
        gap: 6,
    },
    reformerDetail: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    reformerDetailText: {
        fontSize: 12,
        color: "#9CA3AF",
    },

    // No ClassPass Badge
    noClassPassBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#333",
        gap: 4,
    },
    noClassPassIcon: {},
    noClassPassText: {
        color: "#9CA3AF",
        fontWeight: "500",
        textDecorationLine: "line-through",
        textDecorationColor: "#EF4444",
    },
    noClassPassCheck: {},

    // Direct Booking
    directBookingBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(126, 217, 87, 0.1)",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 4,
    },
    directBookingText: {
        fontSize: 12,
        color: "#7ED957",
        fontWeight: "500",
    },

    // Vibe Match
    vibeMatchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1.5,
        gap: 6,
    },
    vibeMatchEmoji: {
        fontSize: 14,
    },
    vibeMatchScore: {
        fontSize: 14,
        fontWeight: "700",
    },
    vibeMatchLabel: {
        fontSize: 12,
        fontWeight: "500",
    },
})

export default {
    VibeBadge,
    VibeSelector,
    MusicChips,
    MusicSelector,
    ReformerAvailabilityBadge,
    NoClassPassBadge,
    DirectBookingBadge,
    VibeMatchIndicator,
}
