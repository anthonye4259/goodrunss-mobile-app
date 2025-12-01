/**
 * GoodRunss Pre-Built Warmup Routines
 * 
 * Sport-specific and general warmup routines for injury prevention
 */

import { WarmupRoutine, WarmupExercise, BodyPart } from '../types/recovery-prevention'

// ===== BASKETBALL WARMUP =====
export const BASKETBALL_WARMUP: WarmupRoutine = {
  id: "warmup-basketball-1",
  name: "Basketball Dynamic Warmup",
  description: "Complete 10-minute warmup for basketball. Activates ankles, knees, hips, and prepares you for jumping, cutting, and quick movements.",
  sport: "basketball",
  type: "dynamic_stretch",
  duration: 10,
  targetBodyParts: ["ankle_left", "ankle_right", "knee_left", "knee_right", "hip_left", "hip_right", "quad_left", "quad_right", "hamstring_left", "hamstring_right", "calf_left", "calf_right"],
  difficulty: "beginner",
  exercises: [
    {
      id: "ex-1",
      order: 1,
      name: "Ankle Circles",
      description: "Loosens ankle joints and prepares them for lateral movements",
      instructions: [
        "Stand on one leg, holding something for balance if needed",
        "Lift the other foot and rotate your ankle in circles",
        "Do 10 circles clockwise, then 10 counter-clockwise",
        "Switch legs and repeat"
      ],
      targetBodyParts: ["ankle_left", "ankle_right"],
      duration: 60,
      difficulty: "beginner",
      tips: ["Keep circles controlled, not rushed", "Feel the full range of motion"]
    },
    {
      id: "ex-2",
      order: 2,
      name: "Leg Swings (Forward/Back)",
      description: "Dynamic hip flexor and hamstring activation",
      instructions: [
        "Stand sideways to a wall, holding it for balance",
        "Swing your outside leg forward and backward",
        "Keep your core tight and back straight",
        "Do 15 swings per leg"
      ],
      targetBodyParts: ["hip_left", "hip_right", "hamstring_left", "hamstring_right", "quad_left", "quad_right"],
      reps: 15,
      sets: 1,
      difficulty: "beginner",
      tips: ["Increase range of motion gradually", "Don't force the swing"]
    },
    {
      id: "ex-3",
      order: 3,
      name: "Leg Swings (Side to Side)",
      description: "Opens up hips and groin for lateral movements",
      instructions: [
        "Face the wall, holding it for balance",
        "Swing one leg across your body, then out to the side",
        "Keep your hips facing forward",
        "Do 15 swings per leg"
      ],
      targetBodyParts: ["hip_left", "hip_right", "groin"],
      reps: 15,
      sets: 1,
      difficulty: "beginner"
    },
    {
      id: "ex-4",
      order: 4,
      name: "Walking Lunges",
      description: "Activates quads, glutes, and hip flexors",
      instructions: [
        "Step forward into a lunge position",
        "Lower your back knee toward the ground",
        "Push through your front heel to stand",
        "Alternate legs for 10 lunges each side"
      ],
      targetBodyParts: ["quad_left", "quad_right", "glutes", "hip_left", "hip_right"],
      reps: 10,
      sets: 1,
      difficulty: "beginner",
      tips: ["Keep your front knee behind your toes", "Maintain upright posture"]
    },
    {
      id: "ex-5",
      order: 5,
      name: "High Knees",
      description: "Elevates heart rate and activates hip flexors",
      instructions: [
        "Jog in place, bringing your knees up to hip height",
        "Pump your arms opposite to your legs",
        "Stay on the balls of your feet",
        "Continue for 30 seconds"
      ],
      targetBodyParts: ["hip_left", "hip_right", "quad_left", "quad_right", "calf_left", "calf_right"],
      duration: 30,
      difficulty: "beginner"
    },
    {
      id: "ex-6",
      order: 6,
      name: "Butt Kicks",
      description: "Activates hamstrings and prepares for running",
      instructions: [
        "Jog in place, kicking your heels up to your glutes",
        "Keep your thighs relatively still",
        "Pump your arms naturally",
        "Continue for 30 seconds"
      ],
      targetBodyParts: ["hamstring_left", "hamstring_right", "quad_left", "quad_right"],
      duration: 30,
      difficulty: "beginner"
    },
    {
      id: "ex-7",
      order: 7,
      name: "Lateral Shuffles",
      description: "Prepares for defensive slides and lateral movements",
      instructions: [
        "Get into an athletic stance, knees bent",
        "Shuffle sideways for 10-15 feet",
        "Stay low, don't let your feet come together",
        "Shuffle back the other direction"
      ],
      targetBodyParts: ["hip_left", "hip_right", "quad_left", "quad_right", "ankle_left", "ankle_right"],
      duration: 45,
      difficulty: "beginner",
      tips: ["Stay low throughout", "Keep your weight on the balls of your feet"]
    },
    {
      id: "ex-8",
      order: 8,
      name: "Arm Circles",
      description: "Loosens shoulders for shooting and passing",
      instructions: [
        "Extend arms out to the sides at shoulder height",
        "Make small circles, gradually getting larger",
        "Do 15 circles forward, then 15 backward"
      ],
      targetBodyParts: ["shoulder_left", "shoulder_right"],
      reps: 15,
      sets: 2,
      difficulty: "beginner"
    },
    {
      id: "ex-9",
      order: 9,
      name: "Bodyweight Squats",
      description: "Full lower body activation",
      instructions: [
        "Stand with feet shoulder-width apart",
        "Lower your hips back and down like sitting in a chair",
        "Keep your chest up and knees tracking over toes",
        "Push through your heels to stand"
      ],
      targetBodyParts: ["quad_left", "quad_right", "glutes", "hamstring_left", "hamstring_right"],
      reps: 15,
      sets: 1,
      difficulty: "beginner"
    },
    {
      id: "ex-10",
      order: 10,
      name: "Jump Squats (Light)",
      description: "Final activation with explosive movement",
      instructions: [
        "Perform a squat as before",
        "Explode upward into a small jump",
        "Land softly with bent knees",
        "Immediately lower into the next rep"
      ],
      targetBodyParts: ["quad_left", "quad_right", "glutes", "calf_left", "calf_right"],
      reps: 10,
      sets: 1,
      difficulty: "intermediate",
      tips: ["Start with small jumps", "Focus on soft landings"]
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
}

// ===== RUNNING WARMUP =====
export const RUNNING_WARMUP: WarmupRoutine = {
  id: "warmup-running-1",
  name: "Runner's Dynamic Warmup",
  description: "5-minute warmup routine to prepare your legs, hips, and cardiovascular system for running. Reduces injury risk to knees, shins, and IT band.",
  sport: "running",
  type: "dynamic_stretch",
  duration: 5,
  targetBodyParts: ["hip_left", "hip_right", "quad_left", "quad_right", "hamstring_left", "hamstring_right", "calf_left", "calf_right", "ankle_left", "ankle_right", "it_band_left", "it_band_right"],
  difficulty: "beginner",
  exercises: [
    {
      id: "run-1",
      order: 1,
      name: "Walking Quad Pull",
      description: "Stretches quads while walking forward",
      instructions: [
        "Walk forward, pulling one heel to your glute",
        "Hold for 2 seconds while balancing",
        "Release and step forward with the other leg",
        "Alternate for 10 reps per leg"
      ],
      targetBodyParts: ["quad_left", "quad_right"],
      reps: 10,
      difficulty: "beginner"
    },
    {
      id: "run-2",
      order: 2,
      name: "Walking Hamstring Sweep",
      description: "Dynamic hamstring stretch",
      instructions: [
        "Step forward and extend your front leg straight",
        "Hinge at hips and reach toward your toes",
        "Keep your back flat",
        "Rise and step forward with the other leg"
      ],
      targetBodyParts: ["hamstring_left", "hamstring_right"],
      reps: 10,
      difficulty: "beginner"
    },
    {
      id: "run-3",
      order: 3,
      name: "Hip Circles",
      description: "Opens up hip joints for better stride",
      instructions: [
        "Stand on one leg",
        "Lift the other knee and rotate it in a circle",
        "Make large circles, opening up the hip",
        "10 circles each direction, each leg"
      ],
      targetBodyParts: ["hip_left", "hip_right"],
      reps: 10,
      difficulty: "beginner"
    },
    {
      id: "run-4",
      order: 4,
      name: "Calf Raises",
      description: "Activates calves and Achilles",
      instructions: [
        "Stand with feet hip-width apart",
        "Rise up onto the balls of your feet",
        "Lower slowly back down",
        "Repeat 15 times"
      ],
      targetBodyParts: ["calf_left", "calf_right", "achilles_left", "achilles_right"],
      reps: 15,
      difficulty: "beginner"
    },
    {
      id: "run-5",
      order: 5,
      name: "Light Jog (Build-Up)",
      description: "Gradually increases heart rate and blood flow",
      instructions: [
        "Start with a very slow jog",
        "Gradually increase pace every 15 seconds",
        "Finish at your planned running pace",
        "Continue for 60-90 seconds"
      ],
      targetBodyParts: ["quad_left", "quad_right", "hamstring_left", "hamstring_right", "calf_left", "calf_right"],
      duration: 90,
      difficulty: "beginner"
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
}

// ===== TENNIS WARMUP =====
export const TENNIS_WARMUP: WarmupRoutine = {
  id: "warmup-tennis-1",
  name: "Tennis Dynamic Warmup",
  description: "Complete warmup for tennis players focusing on shoulders, core rotation, and lower body for quick movements.",
  sport: "tennis",
  type: "dynamic_stretch",
  duration: 10,
  targetBodyParts: ["shoulder_left", "shoulder_right", "elbow_right", "wrist_right", "lower_back", "hip_left", "hip_right", "knee_left", "knee_right", "ankle_left", "ankle_right"],
  difficulty: "beginner",
  exercises: [
    {
      id: "tennis-1",
      order: 1,
      name: "Arm Circles",
      description: "Loosens shoulders for serving and groundstrokes",
      instructions: [
        "Extend arms to the sides",
        "Make small circles, gradually increasing size",
        "15 circles forward, 15 backward"
      ],
      targetBodyParts: ["shoulder_left", "shoulder_right"],
      reps: 15,
      sets: 2,
      difficulty: "beginner"
    },
    {
      id: "tennis-2",
      order: 2,
      name: "Torso Twists",
      description: "Activates core for rotation power",
      instructions: [
        "Stand with feet shoulder-width apart",
        "Hold arms at chest level",
        "Rotate torso left and right",
        "Keep hips facing forward"
      ],
      targetBodyParts: ["lower_back", "obliques", "abs"],
      reps: 20,
      difficulty: "beginner"
    },
    {
      id: "tennis-3",
      order: 3,
      name: "Wrist Circles",
      description: "Prepares wrist for racquet control",
      instructions: [
        "Extend one arm forward",
        "Circle your wrist in both directions",
        "10 circles each way, each wrist"
      ],
      targetBodyParts: ["wrist_left", "wrist_right"],
      reps: 10,
      sets: 2,
      difficulty: "beginner"
    },
    {
      id: "tennis-4",
      order: 4,
      name: "Lateral Lunges",
      description: "Prepares for side-to-side court coverage",
      instructions: [
        "Step wide to one side, bending that knee",
        "Keep the other leg straight",
        "Push back to center",
        "Alternate sides for 10 each"
      ],
      targetBodyParts: ["hip_left", "hip_right", "groin", "quad_left", "quad_right"],
      reps: 10,
      sets: 1,
      difficulty: "beginner"
    },
    {
      id: "tennis-5",
      order: 5,
      name: "Shadow Swings",
      description: "Sport-specific movement patterns without racquet",
      instructions: [
        "Mimic forehand and backhand swings",
        "Include footwork",
        "Practice serve motion at 50% speed",
        "30 seconds each stroke"
      ],
      targetBodyParts: ["shoulder_right", "lower_back", "hip_left", "hip_right"],
      duration: 90,
      difficulty: "beginner"
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
}

// ===== YOGA/GENERAL MOBILITY =====
export const MORNING_MOBILITY: WarmupRoutine = {
  id: "warmup-mobility-morning",
  name: "Morning Mobility Flow",
  description: "Gentle 5-minute routine to wake up your body and release overnight stiffness. Perfect for starting your day.",
  type: "mobility",
  duration: 5,
  targetBodyParts: ["neck", "shoulder_left", "shoulder_right", "upper_back", "lower_back", "hip_left", "hip_right", "hamstring_left", "hamstring_right"],
  difficulty: "beginner",
  exercises: [
    {
      id: "morning-1",
      order: 1,
      name: "Cat-Cow Stretches",
      description: "Gently mobilizes the spine",
      instructions: [
        "Start on hands and knees",
        "Inhale: arch your back, look up (cow)",
        "Exhale: round your back, tuck chin (cat)",
        "Flow between positions 10 times"
      ],
      targetBodyParts: ["lower_back", "upper_back", "neck"],
      reps: 10,
      difficulty: "beginner"
    },
    {
      id: "morning-2",
      order: 2,
      name: "Thread the Needle",
      description: "Opens up thoracic spine and shoulders",
      instructions: [
        "From hands and knees, reach one arm under your body",
        "Twist and lower your shoulder to the ground",
        "Hold for 5 breaths",
        "Switch sides"
      ],
      targetBodyParts: ["upper_back", "shoulder_left", "shoulder_right"],
      duration: 60,
      difficulty: "beginner"
    },
    {
      id: "morning-3",
      order: 3,
      name: "Hip Circles (Tabletop)",
      description: "Loosens hip joints",
      instructions: [
        "From hands and knees, lift one knee to the side",
        "Circle your knee forward, out, and back",
        "5 circles each direction, each leg"
      ],
      targetBodyParts: ["hip_left", "hip_right"],
      reps: 5,
      sets: 2,
      difficulty: "beginner"
    },
    {
      id: "morning-4",
      order: 4,
      name: "World's Greatest Stretch",
      description: "Full-body mobility in one movement",
      instructions: [
        "Step into a lunge position",
        "Place same-side hand on the ground",
        "Rotate opposite arm up to the ceiling",
        "Hold 3 breaths, switch sides"
      ],
      targetBodyParts: ["hip_left", "hip_right", "upper_back", "hamstring_left", "hamstring_right"],
      reps: 3,
      sets: 2,
      difficulty: "beginner"
    },
    {
      id: "morning-5",
      order: 5,
      name: "Standing Side Stretch",
      description: "Releases lateral body tension",
      instructions: [
        "Stand tall, reach both arms overhead",
        "Clasp hands and lean to one side",
        "Feel the stretch along your side",
        "Hold 20 seconds each side"
      ],
      targetBodyParts: ["obliques", "shoulder_left", "shoulder_right"],
      duration: 40,
      difficulty: "beginner"
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
}

// ===== DESK WORKER STRETCH =====
export const DESK_STRETCH: WarmupRoutine = {
  id: "warmup-desk-stretch",
  name: "Desk Worker Relief",
  description: "Quick 3-minute routine to counteract sitting. Do this every 1-2 hours to prevent back pain, tight hips, and neck strain.",
  type: "mobility",
  duration: 3,
  targetBodyParts: ["neck", "shoulder_left", "shoulder_right", "upper_back", "lower_back", "hip_left", "hip_right"],
  difficulty: "beginner",
  exercises: [
    {
      id: "desk-1",
      order: 1,
      name: "Neck Rolls",
      description: "Releases neck tension from looking at screens",
      instructions: [
        "Sit or stand tall",
        "Slowly roll your head in a circle",
        "5 circles one direction, 5 the other",
        "Keep shoulders relaxed"
      ],
      targetBodyParts: ["neck"],
      reps: 5,
      sets: 2,
      difficulty: "beginner"
    },
    {
      id: "desk-2",
      order: 2,
      name: "Shoulder Shrugs & Rolls",
      description: "Releases shoulder tension",
      instructions: [
        "Shrug shoulders up to ears, hold 3 seconds",
        "Release and roll shoulders back 5 times",
        "Roll shoulders forward 5 times"
      ],
      targetBodyParts: ["shoulder_left", "shoulder_right", "upper_back"],
      reps: 5,
      sets: 2,
      difficulty: "beginner"
    },
    {
      id: "desk-3",
      order: 3,
      name: "Seated Spinal Twist",
      description: "Releases lower back tension",
      instructions: [
        "Sit tall in your chair",
        "Twist to one side, using armrest for leverage",
        "Hold 15 seconds",
        "Repeat on other side"
      ],
      targetBodyParts: ["lower_back", "upper_back"],
      duration: 30,
      difficulty: "beginner"
    },
    {
      id: "desk-4",
      order: 4,
      name: "Seated Hip Flexor Stretch",
      description: "Counteracts tight hip flexors from sitting",
      instructions: [
        "Sit at edge of chair",
        "Extend one leg back, foot on floor",
        "Lean slightly forward to stretch hip",
        "Hold 20 seconds each side"
      ],
      targetBodyParts: ["hip_left", "hip_right"],
      duration: 40,
      difficulty: "beginner"
    },
    {
      id: "desk-5",
      order: 5,
      name: "Standing Backbend",
      description: "Opens chest and reverses hunched posture",
      instructions: [
        "Stand up and place hands on lower back",
        "Gently lean back, opening your chest",
        "Look up slightly",
        "Hold 10 seconds, repeat 3 times"
      ],
      targetBodyParts: ["lower_back", "chest", "abs"],
      duration: 30,
      difficulty: "beginner"
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
}

// ===== EXPORT ALL WARMUPS =====
export const ALL_WARMUP_ROUTINES: WarmupRoutine[] = [
  BASKETBALL_WARMUP,
  RUNNING_WARMUP,
  TENNIS_WARMUP,
  MORNING_MOBILITY,
  DESK_STRETCH,
]

// ===== GET WARMUP BY SPORT =====
export function getWarmupBySport(sport: string): WarmupRoutine | undefined {
  return ALL_WARMUP_ROUTINES.find(routine => routine.sport === sport)
}

// ===== GET WARMUPS BY TYPE =====
export function getWarmupsByType(type: string): WarmupRoutine[] {
  return ALL_WARMUP_ROUTINES.filter(routine => routine.type === type)
}

// ===== GET ALL WARMUPS =====
export function getAllWarmups(): WarmupRoutine[] {
  return ALL_WARMUP_ROUTINES
}

