/**
 * GoodRunss Post-Activity Recovery Routines
 * 
 * Sport-specific cool-down and recovery protocols
 */

import { RecoveryRoutine, RecoveryExercise } from '../types/recovery-prevention'

// ===== BASKETBALL RECOVERY =====
export const BASKETBALL_RECOVERY: RecoveryRoutine = {
  id: "recovery-basketball-1",
  name: "Basketball Cool-Down & Recovery",
  description: "15-minute post-game recovery routine. Reduces soreness, prevents ankle/knee issues, and speeds muscle recovery.",
  sport: "basketball",
  duration: 15,
  modalities: ["stretching", "foam_rolling", "hydration"],
  targetBodyParts: ["ankle_left", "ankle_right", "calf_left", "calf_right", "quad_left", "quad_right", "hamstring_left", "hamstring_right", "hip_left", "hip_right", "lower_back"],
  bestTimeToPerform: "immediately_after",
  exercises: [
    {
      id: "bball-rec-1",
      order: 1,
      name: "Light Walk",
      description: "Gradually lowers heart rate",
      instructions: [
        "Walk around the court or gym slowly",
        "Take deep breaths",
        "Let your heart rate come down naturally",
        "Continue for 2 minutes"
      ],
      targetBodyParts: ["quad_left", "quad_right", "calf_left", "calf_right"],
      duration: 120,
      difficulty: "beginner"
    },
    {
      id: "bball-rec-2",
      order: 2,
      name: "Standing Quad Stretch",
      description: "Releases tension from jumping and running",
      instructions: [
        "Stand on one leg (hold wall if needed)",
        "Pull other heel to your glutes",
        "Keep knees together",
        "Hold 30 seconds each leg"
      ],
      targetBodyParts: ["quad_left", "quad_right"],
      holdDuration: 30,
      difficulty: "beginner"
    },
    {
      id: "bball-rec-3",
      order: 3,
      name: "Standing Hamstring Stretch",
      description: "Lengthens hamstrings after intense running",
      instructions: [
        "Place one heel on a low bench or step",
        "Keep leg straight and hinge at hips",
        "Reach toward your toes",
        "Hold 30 seconds each leg"
      ],
      targetBodyParts: ["hamstring_left", "hamstring_right"],
      holdDuration: 30,
      difficulty: "beginner"
    },
    {
      id: "bball-rec-4",
      order: 4,
      name: "Hip Flexor Stretch (Kneeling)",
      description: "Critical for basketball players - reduces hip/lower back tightness",
      instructions: [
        "Kneel on one knee, other foot forward",
        "Push hips forward gently",
        "Keep torso upright",
        "Hold 30 seconds each side"
      ],
      targetBodyParts: ["hip_left", "hip_right"],
      holdDuration: 30,
      difficulty: "beginner"
    },
    {
      id: "bball-rec-5",
      order: 5,
      name: "Calf Stretch (Wall)",
      description: "Prevents Achilles tightness and calf strains",
      instructions: [
        "Face a wall, place hands on it",
        "Step one foot back, keep heel down",
        "Lean forward until you feel the stretch",
        "30 seconds straight leg, 30 bent knee, each side"
      ],
      targetBodyParts: ["calf_left", "calf_right", "achilles_left", "achilles_right"],
      holdDuration: 60,
      difficulty: "beginner"
    },
    {
      id: "bball-rec-6",
      order: 6,
      name: "Ankle Circles",
      description: "Promotes ankle mobility and blood flow",
      instructions: [
        "Sit or stand with weight off one foot",
        "Circle your ankle slowly",
        "10 circles each direction, each ankle"
      ],
      targetBodyParts: ["ankle_left", "ankle_right"],
      reps: 10,
      sets: 2,
      difficulty: "beginner"
    },
    {
      id: "bball-rec-7",
      order: 7,
      name: "Foam Roll: IT Band",
      description: "Releases IT band tension from lateral movements",
      instructions: [
        "Lie on your side on the foam roller",
        "Position roller at outer thigh",
        "Roll from hip to just above knee",
        "Spend extra time on tender spots",
        "1 minute each side"
      ],
      targetBodyParts: ["it_band_left", "it_band_right"],
      duration: 60,
      equipment: ["foam roller"],
      difficulty: "beginner"
    },
    {
      id: "bball-rec-8",
      order: 8,
      name: "Foam Roll: Quads",
      description: "Releases quad tension from jumping",
      instructions: [
        "Lie face down with roller under thighs",
        "Roll from hip to just above knee",
        "Turn slightly to hit outer and inner quad",
        "1 minute per leg"
      ],
      targetBodyParts: ["quad_left", "quad_right"],
      duration: 60,
      equipment: ["foam roller"],
      difficulty: "beginner"
    },
    {
      id: "bball-rec-9",
      order: 9,
      name: "Child's Pose",
      description: "Relaxes lower back and hips",
      instructions: [
        "Kneel on the ground, sit back on heels",
        "Reach arms forward on the ground",
        "Let your chest sink toward the floor",
        "Hold for 60 seconds, breathe deeply"
      ],
      targetBodyParts: ["lower_back", "hip_left", "hip_right"],
      holdDuration: 60,
      difficulty: "beginner"
    },
    {
      id: "bball-rec-10",
      order: 10,
      name: "Hydration & Protein",
      description: "Essential for recovery",
      instructions: [
        "Drink 16-24 oz of water or electrolyte drink",
        "Consume protein within 30 minutes (shake, bar, or meal)",
        "Aim for 20-30g protein"
      ],
      targetBodyParts: [],
      duration: 60,
      difficulty: "beginner"
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
}

// ===== RUNNING RECOVERY =====
export const RUNNING_RECOVERY: RecoveryRoutine = {
  id: "recovery-running-1",
  name: "Runner's Cool-Down",
  description: "Post-run recovery to prevent shin splints, IT band issues, and tight calves. Essential after any run over 3 miles.",
  sport: "running",
  duration: 10,
  modalities: ["stretching", "foam_rolling", "hydration"],
  targetBodyParts: ["quad_left", "quad_right", "hamstring_left", "hamstring_right", "calf_left", "calf_right", "hip_left", "hip_right", "it_band_left", "it_band_right"],
  bestTimeToPerform: "immediately_after",
  exercises: [
    {
      id: "run-rec-1",
      order: 1,
      name: "Walk (5 minutes)",
      description: "Gradually reduces heart rate",
      instructions: [
        "Walk at an easy pace for 5 minutes",
        "Let your breathing return to normal",
        "Keep moving to prevent blood pooling"
      ],
      targetBodyParts: [],
      duration: 300,
      difficulty: "beginner"
    },
    {
      id: "run-rec-2",
      order: 2,
      name: "Standing Calf Stretch",
      description: "Prevents calf tightness and Achilles issues",
      instructions: [
        "Find a wall or fence",
        "Step one foot back, heel down",
        "Lean forward for the stretch",
        "30 seconds each leg"
      ],
      targetBodyParts: ["calf_left", "calf_right"],
      holdDuration: 30,
      difficulty: "beginner"
    },
    {
      id: "run-rec-3",
      order: 3,
      name: "Pigeon Pose",
      description: "Deep hip opener for runners",
      instructions: [
        "From hands and knees, bring one knee forward",
        "Extend the other leg straight back",
        "Lower your hips toward the ground",
        "Hold 45 seconds each side"
      ],
      targetBodyParts: ["hip_left", "hip_right", "glutes"],
      holdDuration: 45,
      difficulty: "intermediate"
    },
    {
      id: "run-rec-4",
      order: 4,
      name: "Seated Hamstring Stretch",
      description: "Lengthens hamstrings after running",
      instructions: [
        "Sit with one leg extended, other bent",
        "Reach toward your toes",
        "Keep your back straight",
        "30 seconds each leg"
      ],
      targetBodyParts: ["hamstring_left", "hamstring_right"],
      holdDuration: 30,
      difficulty: "beginner"
    },
    {
      id: "run-rec-5",
      order: 5,
      name: "Foam Roll: IT Band",
      description: "Critical for preventing IT band syndrome",
      instructions: [
        "Lie on side with roller under outer thigh",
        "Roll from hip to knee slowly",
        "Pause on tender spots",
        "90 seconds each side"
      ],
      targetBodyParts: ["it_band_left", "it_band_right"],
      duration: 90,
      equipment: ["foam roller"],
      difficulty: "beginner"
    },
    {
      id: "run-rec-6",
      order: 6,
      name: "Foam Roll: Calves",
      description: "Releases calf tension",
      instructions: [
        "Sit with roller under one calf",
        "Roll from ankle to below knee",
        "Rotate leg to hit all angles",
        "60 seconds each leg"
      ],
      targetBodyParts: ["calf_left", "calf_right"],
      duration: 60,
      equipment: ["foam roller"],
      difficulty: "beginner"
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
}

// ===== STRENGTH TRAINING RECOVERY =====
export const STRENGTH_RECOVERY: RecoveryRoutine = {
  id: "recovery-strength-1",
  name: "Post-Lift Recovery",
  description: "Recovery routine after strength training. Promotes muscle recovery and reduces DOMS (delayed onset muscle soreness).",
  activityType: "strength",
  duration: 12,
  modalities: ["stretching", "foam_rolling", "nutrition", "hydration"],
  targetBodyParts: ["chest", "upper_back", "shoulder_left", "shoulder_right", "bicep_left", "bicep_right", "tricep_left", "tricep_right", "quad_left", "quad_right", "hamstring_left", "hamstring_right", "lower_back", "glutes"],
  bestTimeToPerform: "immediately_after",
  exercises: [
    {
      id: "str-rec-1",
      order: 1,
      name: "Light Cardio (3-5 min)",
      description: "Flushes metabolites and reduces lactic acid",
      instructions: [
        "Walk on treadmill or bike at very low intensity",
        "Keep heart rate elevated but comfortable",
        "3-5 minutes is sufficient"
      ],
      targetBodyParts: [],
      duration: 240,
      difficulty: "beginner"
    },
    {
      id: "str-rec-2",
      order: 2,
      name: "Doorway Chest Stretch",
      description: "Opens chest after pressing movements",
      instructions: [
        "Stand in a doorway with forearm on frame",
        "Step through gently until you feel stretch",
        "30 seconds each side"
      ],
      targetBodyParts: ["chest", "shoulder_left", "shoulder_right"],
      holdDuration: 30,
      difficulty: "beginner"
    },
    {
      id: "str-rec-3",
      order: 3,
      name: "Cat-Cow Stretch",
      description: "Releases spine after heavy lifts",
      instructions: [
        "On hands and knees",
        "Alternate between arching and rounding back",
        "10 slow repetitions"
      ],
      targetBodyParts: ["lower_back", "upper_back"],
      reps: 10,
      difficulty: "beginner"
    },
    {
      id: "str-rec-4",
      order: 4,
      name: "Lying Glute Stretch",
      description: "Releases glutes and lower back",
      instructions: [
        "Lie on back, cross one ankle over opposite knee",
        "Pull the uncrossed leg toward chest",
        "30 seconds each side"
      ],
      targetBodyParts: ["glutes", "lower_back", "hip_left", "hip_right"],
      holdDuration: 30,
      difficulty: "beginner"
    },
    {
      id: "str-rec-5",
      order: 5,
      name: "Foam Roll: Upper Back",
      description: "Releases thoracic spine after rows and pulls",
      instructions: [
        "Lie with roller under upper back",
        "Cross arms over chest",
        "Roll from shoulders to mid-back",
        "60 seconds"
      ],
      targetBodyParts: ["upper_back"],
      duration: 60,
      equipment: ["foam roller"],
      difficulty: "beginner"
    },
    {
      id: "str-rec-6",
      order: 6,
      name: "Foam Roll: Glutes",
      description: "Releases glute tension from squats and deadlifts",
      instructions: [
        "Sit on roller, cross one leg over the other",
        "Lean toward the crossed leg side",
        "Roll around the glute",
        "60 seconds each side"
      ],
      targetBodyParts: ["glutes"],
      duration: 60,
      equipment: ["foam roller"],
      difficulty: "beginner"
    },
    {
      id: "str-rec-7",
      order: 7,
      name: "Protein + Carbs",
      description: "Maximizes muscle protein synthesis",
      instructions: [
        "Consume 25-40g protein within 30 minutes",
        "Include fast carbs for glycogen replenishment",
        "Example: protein shake with banana"
      ],
      targetBodyParts: [],
      duration: 60,
      difficulty: "beginner"
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
}

// ===== YOGA/FLEXIBILITY RECOVERY =====
export const YOGA_RECOVERY: RecoveryRoutine = {
  id: "recovery-yoga-1",
  name: "Post-Yoga Relaxation",
  description: "Gentle cool-down after yoga practice. Integrates the work and prepares body for rest.",
  sport: "yoga",
  duration: 5,
  modalities: ["stretching", "rest"],
  targetBodyParts: ["lower_back", "hip_left", "hip_right", "neck", "shoulder_left", "shoulder_right"],
  bestTimeToPerform: "immediately_after",
  exercises: [
    {
      id: "yoga-rec-1",
      order: 1,
      name: "Supine Twist",
      description: "Final release for spine",
      instructions: [
        "Lie on back, knees bent",
        "Let both knees fall to one side",
        "Arms out to sides, look opposite direction",
        "2 minutes each side"
      ],
      targetBodyParts: ["lower_back", "upper_back"],
      holdDuration: 120,
      difficulty: "beginner"
    },
    {
      id: "yoga-rec-2",
      order: 2,
      name: "Happy Baby",
      description: "Releases hips and lower back",
      instructions: [
        "Lie on back",
        "Grab outside of feet, knees wide",
        "Gently pull knees toward armpits",
        "Rock side to side"
      ],
      targetBodyParts: ["hip_left", "hip_right", "lower_back"],
      holdDuration: 60,
      difficulty: "beginner"
    },
    {
      id: "yoga-rec-3",
      order: 3,
      name: "Savasana (Corpse Pose)",
      description: "Final relaxation and integration",
      instructions: [
        "Lie flat on back, arms at sides, palms up",
        "Close eyes and relax every muscle",
        "Focus on breath",
        "Stay 3-5 minutes minimum"
      ],
      targetBodyParts: [],
      holdDuration: 180,
      difficulty: "beginner"
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
}

// ===== REST DAY RECOVERY =====
export const REST_DAY_RECOVERY: RecoveryRoutine = {
  id: "recovery-rest-day",
  name: "Active Recovery Day Routine",
  description: "Light movement and stretching for rest days. Promotes blood flow and recovery without adding training stress.",
  duration: 15,
  modalities: ["stretching", "foam_rolling", "active_recovery"],
  targetBodyParts: ["neck", "shoulder_left", "shoulder_right", "upper_back", "lower_back", "hip_left", "hip_right", "quad_left", "quad_right", "hamstring_left", "hamstring_right"],
  bestTimeToPerform: "next_morning",
  exercises: [
    {
      id: "rest-1",
      order: 1,
      name: "Light Walk",
      description: "Promotes blood flow without stress",
      instructions: [
        "Take an easy 10-15 minute walk",
        "Keep pace conversational",
        "Focus on enjoying movement"
      ],
      targetBodyParts: [],
      duration: 600,
      difficulty: "beginner"
    },
    {
      id: "rest-2",
      order: 2,
      name: "Full Body Foam Roll",
      description: "Address any areas of tightness",
      instructions: [
        "Spend 30-60 seconds on each major muscle group",
        "Focus on areas that feel tight",
        "Keep pressure moderate"
      ],
      targetBodyParts: ["quad_left", "quad_right", "hamstring_left", "hamstring_right", "calf_left", "calf_right", "upper_back", "glutes"],
      duration: 300,
      equipment: ["foam roller"],
      difficulty: "beginner"
    },
    {
      id: "rest-3",
      order: 3,
      name: "Gentle Stretching Flow",
      description: "Easy stretches held longer for recovery",
      instructions: [
        "Hold each stretch 60+ seconds",
        "Focus on breathing and relaxing",
        "No forcing or bouncing",
        "Cover major muscle groups"
      ],
      targetBodyParts: ["hip_left", "hip_right", "hamstring_left", "hamstring_right", "quad_left", "quad_right", "lower_back", "shoulder_left", "shoulder_right"],
      duration: 480,
      difficulty: "beginner"
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
}

// ===== EXPORT ALL RECOVERY ROUTINES =====
export const ALL_RECOVERY_ROUTINES: RecoveryRoutine[] = [
  BASKETBALL_RECOVERY,
  RUNNING_RECOVERY,
  STRENGTH_RECOVERY,
  YOGA_RECOVERY,
  REST_DAY_RECOVERY,
]

// ===== HELPERS =====
export function getRecoveryBySport(sport: string): RecoveryRoutine | undefined {
  return ALL_RECOVERY_ROUTINES.find(routine => routine.sport === sport)
}

export function getRecoveryByActivity(activityType: string): RecoveryRoutine | undefined {
  return ALL_RECOVERY_ROUTINES.find(routine => routine.activityType === activityType)
}

export function getAllRecoveryRoutines(): RecoveryRoutine[] {
  return ALL_RECOVERY_ROUTINES
}

