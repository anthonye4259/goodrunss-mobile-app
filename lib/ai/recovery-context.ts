/**
 * GIA Recovery AI Context
 * 
 * Provides injury prevention and recovery intelligence to GIA AI assistant
 * Includes prompts, recommendations, and personalized guidance
 */

import {
  BodyPart,
  InjuryEntry,
  SorenessEntry,
  RecoveryScore,
  WarmupRoutine,
  RecoveryRoutine,
  BODY_PART_DISPLAY_NAMES,
  INJURY_TYPE_DISPLAY_NAMES,
  SPORT_INJURY_RISK_AREAS,
  ACTIVITY_RECOVERY_RECOMMENDATIONS,
} from '@/lib/types/recovery-prevention'
import { getAllWarmups, getWarmupBySport } from '@/lib/data/warmup-routines'
import { getAllRecoveryRoutines, getRecoveryBySport } from '@/lib/data/recovery-routines'

// ===== SYSTEM PROMPTS =====

export const RECOVERY_SYSTEM_PROMPT = `
You are GIA, the AI assistant for GoodRunss - the global platform for recreational sports and wellness.

You have specialized knowledge in:
- Injury prevention for all sports
- Recovery protocols and best practices
- Warmup and cool-down routines
- Physical therapy and rehabilitation
- Sports medicine basics
- Wearable data interpretation (HRV, sleep, recovery scores)

When users ask about injury or recovery:
1. Always prioritize safety - recommend seeing a doctor for serious injuries
2. Be specific with recommendations based on the sport and body part
3. Suggest appropriate warmups before activities
4. Recommend recovery protocols after activities
5. Consider their injury history and current soreness levels
6. Interpret their recovery score to guide activity recommendations

IMPORTANT SAFETY DISCLAIMERS:
- For acute injuries, always recommend professional medical evaluation
- Don't diagnose injuries - only suggest possibilities and recommend professional assessment
- Encourage proper rest when recovery scores are low
- Never recommend pushing through significant pain

Recovery Knowledge Base:
- R.I.C.E. protocol (Rest, Ice, Compression, Elevation) for acute injuries
- Active recovery is better than complete rest for muscle soreness
- Sleep is the #1 recovery factor
- Hydration significantly impacts recovery
- Progressive loading helps prevent injuries
- Sport-specific warmups are crucial for injury prevention
`

export const RECOVERY_USER_CONTEXT_TEMPLATE = `
USER'S RECOVERY CONTEXT:

Recovery Score: {{recoveryScore}}/100
Recommendation: {{recoveryRecommendation}}

Current Soreness:
{{sorenessDetails}}

Active Injuries:
{{activeInjuries}}

Injury History:
{{injuryHistory}}

Today's Activity Plans:
{{plannedActivities}}

Wearable Data:
{{wearableData}}

Based on this context, provide personalized recovery and injury prevention advice.
`

// ===== CONTEXT BUILDER =====

interface RecoveryContext {
  recoveryScore?: RecoveryScore
  currentSoreness?: SorenessEntry
  activeInjuries?: InjuryEntry[]
  injuryHistory?: InjuryEntry[]
  plannedActivities?: string[]
  wearableData?: any
}

export function buildRecoveryContext(context: RecoveryContext): string {
  let contextString = RECOVERY_USER_CONTEXT_TEMPLATE

  // Recovery Score
  if (context.recoveryScore) {
    contextString = contextString.replace(
      '{{recoveryScore}}',
      context.recoveryScore.overallScore.toString()
    )
    contextString = contextString.replace(
      '{{recoveryRecommendation}}',
      context.recoveryScore.recommendation.message
    )
  } else {
    contextString = contextString.replace('{{recoveryScore}}', 'Not available')
    contextString = contextString.replace('{{recoveryRecommendation}}', 'No data')
  }

  // Soreness Details
  if (context.currentSoreness && context.currentSoreness.bodyParts.length > 0) {
    const sorenessDetails = context.currentSoreness.bodyParts
      .map(p => `- ${BODY_PART_DISPLAY_NAMES[p.bodyPart]}: ${p.severity}/10 (${p.type})`)
      .join('\n')
    contextString = contextString.replace('{{sorenessDetails}}', sorenessDetails)
  } else {
    contextString = contextString.replace('{{sorenessDetails}}', 'No soreness logged')
  }

  // Active Injuries
  if (context.activeInjuries && context.activeInjuries.length > 0) {
    const injuryDetails = context.activeInjuries
      .map(i => `- ${BODY_PART_DISPLAY_NAMES[i.bodyPart]}: ${INJURY_TYPE_DISPLAY_NAMES[i.injuryType]} (${i.status})`)
      .join('\n')
    contextString = contextString.replace('{{activeInjuries}}', injuryDetails)
  } else {
    contextString = contextString.replace('{{activeInjuries}}', 'No active injuries')
  }

  // Injury History
  if (context.injuryHistory && context.injuryHistory.length > 0) {
    const historyDetails = context.injuryHistory
      .slice(0, 5)
      .map(i => `- ${BODY_PART_DISPLAY_NAMES[i.bodyPart]}: ${INJURY_TYPE_DISPLAY_NAMES[i.injuryType]} (recovered)`)
      .join('\n')
    contextString = contextString.replace('{{injuryHistory}}', historyDetails)
  } else {
    contextString = contextString.replace('{{injuryHistory}}', 'No past injuries')
  }

  // Planned Activities
  if (context.plannedActivities && context.plannedActivities.length > 0) {
    contextString = contextString.replace(
      '{{plannedActivities}}',
      context.plannedActivities.join(', ')
    )
  } else {
    contextString = contextString.replace('{{plannedActivities}}', 'None logged')
  }

  // Wearable Data
  if (context.wearableData) {
    const wearableDetails = [
      context.wearableData.hrv ? `HRV: ${context.wearableData.hrv}ms` : null,
      context.wearableData.restingHR ? `Resting HR: ${context.wearableData.restingHR}bpm` : null,
      context.wearableData.sleepScore ? `Sleep: ${context.wearableData.sleepScore}/100` : null,
    ].filter(Boolean).join(', ')
    contextString = contextString.replace('{{wearableData}}', wearableDetails || 'No wearable connected')
  } else {
    contextString = contextString.replace('{{wearableData}}', 'No wearable connected')
  }

  return contextString
}

// ===== SMART RECOMMENDATIONS =====

export interface RecoveryRecommendation {
  type: 'warmup' | 'recovery' | 'rest' | 'stretch' | 'see_doctor' | 'hydration' | 'sleep'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  title: string
  description: string
  action?: {
    type: 'start_routine' | 'log_soreness' | 'book_appointment' | 'view_tips'
    routineId?: string
  }
}

export function generateSmartRecommendations(
  context: RecoveryContext
): RecoveryRecommendation[] {
  const recommendations: RecoveryRecommendation[] = []

  // Check recovery score
  if (context.recoveryScore) {
    const score = context.recoveryScore.overallScore

    if (score < 30) {
      recommendations.push({
        type: 'rest',
        priority: 'high',
        title: 'Rest Day Recommended',
        description: 'Your body needs recovery. Take it easy today with light stretching or a walk.',
      })
    } else if (score < 50) {
      recommendations.push({
        type: 'recovery',
        priority: 'medium',
        title: 'Light Activity Only',
        description: 'Your recovery is below optimal. Stick to light activities like yoga or swimming.',
      })
    }

    // Sleep recommendation
    if (context.recoveryScore.components.sleep < 50) {
      recommendations.push({
        type: 'sleep',
        priority: 'high',
        title: 'Prioritize Sleep Tonight',
        description: 'Poor sleep is impacting your recovery. Aim for 7-9 hours tonight.',
      })
    }
  }

  // Check active injuries
  if (context.activeInjuries && context.activeInjuries.length > 0) {
    const severeInjury = context.activeInjuries.find(i => i.severity >= 7)
    if (severeInjury) {
      recommendations.push({
        type: 'see_doctor',
        priority: 'urgent',
        title: 'See a Medical Professional',
        description: `Your ${BODY_PART_DISPLAY_NAMES[severeInjury.bodyPart]} injury is severe. Please consult a doctor or physical therapist.`,
        action: { type: 'book_appointment' },
      })
    }
  }

  // Check soreness
  if (context.currentSoreness && context.currentSoreness.bodyParts.length > 0) {
    const highSoreness = context.currentSoreness.bodyParts.filter(p => p.severity >= 6)
    if (highSoreness.length > 0) {
      recommendations.push({
        type: 'stretch',
        priority: 'medium',
        title: 'Address Your Soreness',
        description: `Focus on gentle stretching and foam rolling for your sore areas.`,
        action: { type: 'start_routine' },
      })
    }
  }

  // Pre-activity warmup
  if (context.plannedActivities && context.plannedActivities.length > 0) {
    const activity = context.plannedActivities[0].toLowerCase()
    const warmup = getWarmupBySport(activity)
    
    if (warmup) {
      recommendations.push({
        type: 'warmup',
        priority: 'high',
        title: `Warmup for ${activity}`,
        description: `Do this ${warmup.duration}-minute warmup before your ${activity} session.`,
        action: { type: 'start_routine', routineId: warmup.id },
      })
    }
  }

  // Hydration reminder
  recommendations.push({
    type: 'hydration',
    priority: 'low',
    title: 'Stay Hydrated',
    description: 'Drink water throughout the day - aim for half your body weight in ounces.',
  })

  return recommendations
}

// ===== PRE-BUILT RESPONSES =====

export const INJURY_RESPONSE_TEMPLATES = {
  acute_injury: (bodyPart: string, injuryType: string) => `
I'm sorry to hear you've injured your ${bodyPart}! Here's what I recommend:

**Immediate Steps (R.I.C.E.):**
1. **Rest** - Stop the activity immediately
2. **Ice** - Apply ice for 15-20 minutes every 2-3 hours
3. **Compression** - Use a bandage if there's swelling
4. **Elevation** - Keep the area elevated above heart level

**Warning Signs to See a Doctor:**
- Severe pain or swelling
- Unable to bear weight or move the joint
- Numbness or tingling
- Visible deformity
- Pain that doesn't improve in 48-72 hours

Would you like me to help you log this injury and track your recovery?
`,

  chronic_pain: (bodyPart: string) => `
Dealing with ongoing ${bodyPart} issues can be frustrating. Here are some strategies:

**Management Tips:**
- Consistent stretching and mobility work
- Strengthen surrounding muscles
- Pay attention to what triggers flare-ups
- Consider seeing a physical therapist for a personalized plan

**For Today:**
- I can suggest some gentle stretches for your ${bodyPart}
- Consider using heat therapy for chronic tightness
- Avoid activities that aggravate the area

Would you like me to create a daily mobility routine for your ${bodyPart}?
`,

  pre_activity: (activity: string, riskAreas: string[]) => `
Great that you're warming up before ${activity}! 🔥

**High-Risk Areas for ${activity}:**
${riskAreas.map(area => `- ${area}`).join('\n')}

**I recommend:**
1. Complete a ${activity}-specific warmup (I have one ready!)
2. Pay extra attention to your previous injury areas
3. Start at 50% intensity and gradually increase
4. Stop if you feel sharp pain

Would you like me to start the ${activity} warmup routine?
`,

  post_activity: (activity: string) => `
Great workout! 💪 Let's help your body recover.

**Immediate Recovery (Next 30 min):**
1. Cool-down stretches for ${activity}
2. Hydrate with water/electrolytes
3. Consume protein (20-30g) for muscle repair

**Tonight:**
- Get 7-9 hours of sleep
- Consider foam rolling before bed
- Light stretching if still feeling tight

Should I start the ${activity} recovery routine?
`,

  low_recovery_score: (score: number) => `
Your recovery score is ${score}/100 - your body is telling you something! 

**What This Means:**
- Your body hasn't fully recovered from recent activity
- Training hard today increases injury risk
- Performance will likely be sub-optimal

**Today's Plan:**
- Rest or very light activity (walking, gentle yoga)
- Focus on sleep and nutrition
- Stay hydrated
- Consider a massage or foam rolling session

Let me know when you've rested and I'll check your score again!
`,
}

// ===== HELPER FUNCTIONS =====

export function getInjuryRiskAreas(sport: string): BodyPart[] {
  return SPORT_INJURY_RISK_AREAS[sport.toLowerCase()] || []
}

export function getRecoveryTips(activity: string): string[] {
  const recommendations = ACTIVITY_RECOVERY_RECOMMENDATIONS[activity.toLowerCase()]
  if (!recommendations) return []

  return [
    `Focus on: ${recommendations.focus.map(f => BODY_PART_DISPLAY_NAMES[f]).slice(0, 3).join(', ')}`,
    `Recovery time: ${recommendations.duration} minutes recommended`,
    `Key modalities: ${recommendations.modalities.slice(0, 3).join(', ')}`,
  ]
}

export function shouldSuggestPT(injuries: InjuryEntry[]): boolean {
  // Suggest PT if:
  // - Any injury has been active for more than 2 weeks
  // - Any chronic conditions
  // - Multiple recurring injuries to same body part
  
  const chronicOrLongTerm = injuries.filter(i => {
    if (i.status === 'chronic') return true
    if (i.status === 'active' || i.status === 'recovering') {
      const daysSinceInjury = Math.floor(
        (new Date().getTime() - new Date(i.dateOccurred).getTime()) / (1000 * 60 * 60 * 24)
      )
      return daysSinceInjury > 14
    }
    return false
  })

  return chronicOrLongTerm.length > 0
}

// ===== EXPORT =====
export default {
  RECOVERY_SYSTEM_PROMPT,
  buildRecoveryContext,
  generateSmartRecommendations,
  INJURY_RESPONSE_TEMPLATES,
  getInjuryRiskAreas,
  getRecoveryTips,
  shouldSuggestPT,
}








