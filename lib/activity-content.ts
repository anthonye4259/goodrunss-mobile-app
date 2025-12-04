export type Activity =
  | "Basketball"
  | "Tennis"
  | "Pickleball"
  | "Padel"
  | "Racquetball"
  | "Volleyball"
  | "Golf"
  | "Soccer"
  | "Swimming"
  | "Pilates"
  | "Yoga"
  | "Lagree"
  | "Barre"
  | "Meditation"

export type ActivityCategory = "rec" | "studio"

export interface ActivityContent {
  category: ActivityCategory
  displayName: string
  trainerTitle: string // "Coach" or "Instructor"
  sessionType: string // "Training" or "Class"
  locationPrefix: string // "Court" or "Studio"
  groupType: string // "League" or "Group"

  // Sample trainers/instructors
  sampleTrainers: Array<{
    name: string
    rating: number
    reviews: number
    price: number
    location: string
    specialties: string[]
    bio: string
    certifications: string[]
  }>

  // Sample sessions
  sampleSessions: Array<{
    title: string
    location: string
    time: string
    participants?: number
  }>

  // Sample marketplace items
  marketplaceItems: Array<{
    name: string
    condition: string
    price: number
    seller: string
    image: string
  }>

  // Activity feed items
  activityFeed: Array<{
    type: "achievement" | "session" | "friend" | "skill"
    title: string
    description: string
    time: string
  }>
}

export const ACTIVITY_CONTENT: Record<Activity, ActivityContent> = {
  Basketball: {
    category: "rec",
    displayName: "Basketball",
    trainerTitle: "Coach",
    sessionType: "Training",
    locationPrefix: "Court",
    groupType: "League",
    sampleTrainers: [
      {
        name: "Coach Mike Johnson",
        rating: 4.9,
        reviews: 127,
        price: 75,
        location: "Downtown Sports Complex",
        specialties: ["Shooting", "Defense", "Conditioning"],
        bio: "15+ years of professional basketball coaching experience. Specialized in shooting mechanics, defensive strategies, and mental game development.",
        certifications: ["USA Basketball Certified", "CPR/First Aid", "Sports Psychology"],
      },
    ],
    sampleSessions: [
      { title: "Basketball Skills Training", location: "Rucker Park", time: "Tomorrow, 3:00 PM" },
      { title: "Pickup Game", location: "Downtown Courts", time: "Today, 6:00 PM", participants: 8 },
    ],
    marketplaceItems: [
      {
        name: "Wilson Basketball - Like New",
        condition: "Like New",
        price: 25,
        seller: "Mike Johnson",
        image: "/basketball-action.png",
      },
    ],
    activityFeed: [
      {
        type: "achievement",
        title: "Achievement Unlocked!",
        description: "Completed 10 training sessions",
        time: "2 hours ago",
      },
      {
        type: "session",
        title: "Session Completed",
        description: "Basketball training with Coach Mike",
        time: "Yesterday",
      },
      {
        type: "skill",
        title: "Skill Improved",
        description: "Your shooting accuracy increased by 15%",
        time: "3 days ago",
      },
    ],
  },

  Tennis: {
    category: "rec",
    displayName: "Tennis",
    trainerTitle: "Coach",
    sessionType: "Training",
    locationPrefix: "Court",
    groupType: "League",
    sampleTrainers: [
      {
        name: "Coach Sarah Williams",
        rating: 4.8,
        reviews: 94,
        price: 85,
        location: "Riverside Tennis Courts",
        specialties: ["Serve", "Footwork", "Strategy"],
        bio: "Former college tennis player with 10+ years coaching experience. Specialized in serve technique, court positioning, and match strategy.",
        certifications: ["USPTA Certified", "CPR/First Aid", "Sports Nutrition"],
      },
    ],
    sampleSessions: [
      { title: "Tennis Technique Session", location: "Riverside Courts", time: "Tomorrow, 2:00 PM" },
      { title: "Doubles Match", location: "Central Park Courts", time: "Saturday, 10:00 AM", participants: 4 },
    ],
    marketplaceItems: [
      {
        name: "Wilson Pro Staff Racket",
        condition: "Good",
        price: 85,
        seller: "Sarah Chen",
        image: "/tennis-racket.png",
      },
    ],
    activityFeed: [
      {
        type: "achievement",
        title: "Achievement Unlocked!",
        description: "Completed 10 tennis sessions",
        time: "2 hours ago",
      },
      {
        type: "session",
        title: "Session Completed",
        description: "Tennis training with Coach Sarah",
        time: "Yesterday",
      },
      { type: "skill", title: "Skill Improved", description: "Your serve speed increased by 12%", time: "3 days ago" },
    ],
  },

  Pilates: {
    category: "studio",
    displayName: "Pilates",
    trainerTitle: "Instructor",
    sessionType: "Class",
    locationPrefix: "Studio",
    groupType: "Group",
    sampleTrainers: [
      {
        name: "Instructor Emma Rodriguez",
        rating: 4.9,
        reviews: 156,
        price: 65,
        location: "Serenity Wellness Studio",
        specialties: ["Reformer", "Mat Work", "Core Strength"],
        bio: "Certified Pilates instructor with 8+ years experience. Specialized in reformer techniques, injury rehabilitation, and building core strength.",
        certifications: ["PMA Certified", "Balanced Body Certified", "Pre/Postnatal Specialist"],
      },
    ],
    sampleSessions: [
      { title: "Reformer Pilates", location: "Serenity Wellness Studio", time: "Tomorrow, 9:00 AM", participants: 6 },
      { title: "Mat Pilates Flow", location: "Harmony Studio", time: "Today, 5:30 PM", participants: 8 },
    ],
    marketplaceItems: [
      {
        name: "Pilates Reformer - Home Edition",
        condition: "Like New",
        price: 450,
        seller: "Emma Rodriguez",
        image: "/pilates-reformer.png",
      },
      {
        name: "Pilates Ring & Resistance Bands",
        condition: "New",
        price: 35,
        seller: "Wellness Shop",
        image: "/pilates-ring.jpg",
      },
    ],
    activityFeed: [
      {
        type: "achievement",
        title: "Achievement Unlocked!",
        description: "Completed 10 Pilates sessions",
        time: "2 hours ago",
      },
      {
        type: "session",
        title: "Class Completed",
        description: "Reformer Pilates with Instructor Emma",
        time: "Yesterday",
      },
      { type: "skill", title: "Progress Made", description: "Your core strength improved by 18%", time: "3 days ago" },
    ],
  },

  Yoga: {
    category: "studio",
    displayName: "Yoga",
    trainerTitle: "Instructor",
    sessionType: "Class",
    locationPrefix: "Studio",
    groupType: "Group",
    sampleTrainers: [
      {
        name: "Instructor Maya Patel",
        rating: 5.0,
        reviews: 203,
        price: 60,
        location: "Zen Flow Yoga Studio",
        specialties: ["Vinyasa", "Meditation", "Breathwork"],
        bio: "RYT-500 certified yoga instructor with 12+ years experience. Specialized in vinyasa flow, meditation practices, and pranayama breathwork.",
        certifications: ["RYT-500", "Meditation Teacher", "Ayurveda Practitioner"],
      },
    ],
    sampleSessions: [
      { title: "Vinyasa Flow", location: "Zen Flow Yoga Studio", time: "Tomorrow, 7:00 AM", participants: 12 },
      { title: "Restorative Yoga", location: "Peace Studio", time: "Tonight, 7:00 PM", participants: 8 },
    ],
    marketplaceItems: [
      {
        name: "Manduka Pro Yoga Mat",
        condition: "Like New",
        price: 85,
        seller: "Maya Patel",
        image: "/rolled-yoga-mat.png",
      },
      { name: "Yoga Blocks & Strap Set", condition: "New", price: 25, seller: "Zen Shop", image: "/yoga-blocks.jpg" },
    ],
    activityFeed: [
      {
        type: "achievement",
        title: "Achievement Unlocked!",
        description: "Completed 10 yoga sessions",
        time: "2 hours ago",
      },
      {
        type: "session",
        title: "Class Completed",
        description: "Vinyasa Flow with Instructor Maya",
        time: "Yesterday",
      },
      { type: "skill", title: "Progress Made", description: "Your flexibility improved by 22%", time: "3 days ago" },
    ],
  },

  Lagree: {
    category: "studio",
    displayName: "Lagree",
    trainerTitle: "Instructor",
    sessionType: "Class",
    locationPrefix: "Studio",
    groupType: "Group",
    sampleTrainers: [
      {
        name: "Instructor Alex Chen",
        rating: 4.8,
        reviews: 89,
        price: 70,
        location: "Lagree Fitness Studio",
        specialties: ["Megaformer", "Strength", "Endurance"],
        bio: "Certified Lagree instructor with 5+ years experience. Specialized in Megaformer training, building muscular endurance, and high-intensity workouts.",
        certifications: ["Lagree Certified", "Personal Training", "Nutrition Coach"],
      },
    ],
    sampleSessions: [
      { title: "Lagree Megaformer", location: "Lagree Fitness Studio", time: "Tomorrow, 6:00 AM", participants: 10 },
      { title: "Lagree Strength", location: "Core Studio", time: "Today, 12:00 PM", participants: 8 },
    ],
    marketplaceItems: [
      {
        name: "Lagree Resistance Bands",
        condition: "New",
        price: 45,
        seller: "Alex Chen",
        image: "/resistance-bands-exercise.png",
      },
    ],
    activityFeed: [
      {
        type: "achievement",
        title: "Achievement Unlocked!",
        description: "Completed 10 Lagree sessions",
        time: "2 hours ago",
      },
      { type: "session", title: "Class Completed", description: "Megaformer with Instructor Alex", time: "Yesterday" },
      {
        type: "skill",
        title: "Progress Made",
        description: "Your muscular endurance improved by 20%",
        time: "3 days ago",
      },
    ],
  },

  Barre: {
    category: "studio",
    displayName: "Barre",
    trainerTitle: "Instructor",
    sessionType: "Class",
    locationPrefix: "Studio",
    groupType: "Group",
    sampleTrainers: [
      {
        name: "Instructor Sophie Laurent",
        rating: 4.9,
        reviews: 142,
        price: 65,
        location: "Ballet Barre Studio",
        specialties: ["Classical Barre", "Cardio Barre", "Flexibility"],
        bio: "Former professional dancer with 10+ years teaching barre. Specialized in classical barre technique, cardio fusion, and flexibility training.",
        certifications: ["Barre Certified", "Dance Education", "Pilates Foundation"],
      },
    ],
    sampleSessions: [
      { title: "Classical Barre", location: "Ballet Barre Studio", time: "Tomorrow, 8:00 AM", participants: 12 },
      { title: "Cardio Barre Fusion", location: "Grace Studio", time: "Today, 5:00 PM", participants: 10 },
    ],
    marketplaceItems: [
      {
        name: "Portable Barre System",
        condition: "Like New",
        price: 120,
        seller: "Sophie Laurent",
        image: "/barre-equipment.jpg",
      },
    ],
    activityFeed: [
      {
        type: "achievement",
        title: "Achievement Unlocked!",
        description: "Completed 10 barre sessions",
        time: "2 hours ago",
      },
      {
        type: "session",
        title: "Class Completed",
        description: "Classical Barre with Instructor Sophie",
        time: "Yesterday",
      },
      { type: "skill", title: "Progress Made", description: "Your balance improved by 25%", time: "3 days ago" },
    ],
  },

  Meditation: {
    category: "studio",
    displayName: "Meditation",
    trainerTitle: "Instructor",
    sessionType: "Session",
    locationPrefix: "Studio",
    groupType: "Group",
    sampleTrainers: [
      {
        name: "Instructor David Kim",
        rating: 5.0,
        reviews: 178,
        price: 55,
        location: "Mindful Space Studio",
        specialties: ["Mindfulness", "Breathwork", "Stress Relief"],
        bio: "Certified meditation teacher with 15+ years practice. Specialized in mindfulness meditation, breathwork techniques, and stress management.",
        certifications: [
          "Meditation Teacher Certified",
          "Mindfulness-Based Stress Reduction",
          "Breathwork Facilitator",
        ],
      },
    ],
    sampleSessions: [
      {
        title: "Mindfulness Meditation",
        location: "Mindful Space Studio",
        time: "Tomorrow, 7:00 AM",
        participants: 15,
      },
      { title: "Guided Breathwork", location: "Peace Center", time: "Tonight, 6:30 PM", participants: 10 },
    ],
    marketplaceItems: [
      {
        name: "Meditation Cushion Set",
        condition: "New",
        price: 65,
        seller: "David Kim",
        image: "/meditation-cushion.png",
      },
    ],
    activityFeed: [
      {
        type: "achievement",
        title: "Achievement Unlocked!",
        description: "Completed 10 meditation sessions",
        time: "2 hours ago",
      },
      {
        type: "session",
        title: "Session Completed",
        description: "Mindfulness with Instructor David",
        time: "Yesterday",
      },
      { type: "skill", title: "Progress Made", description: "Your stress levels decreased by 30%", time: "3 days ago" },
    ],
  },

  Pickleball: {
    category: "rec",
    displayName: "Pickleball",
    trainerTitle: "Coach",
    sessionType: "Training",
    locationPrefix: "Court",
    groupType: "League",
    sampleTrainers: [
      {
        name: "Coach Tom Anderson",
        rating: 4.7,
        reviews: 68,
        price: 65,
        location: "Community Pickleball Courts",
        specialties: ["Dinking", "Serve", "Strategy"],
        bio: "Professional pickleball coach with 6+ years experience. Specialized in dinking techniques, serve strategies, and competitive play.",
        certifications: ["PPR Certified", "IPTPA Certified", "CPR/First Aid"],
      },
    ],
    sampleSessions: [{ title: "Pickleball Fundamentals", location: "Community Courts", time: "Tomorrow, 10:00 AM" }],
    marketplaceItems: [
      {
        name: "Selkirk Paddle - Pro Series",
        condition: "Good",
        price: 95,
        seller: "Tom Anderson",
        image: "/pickleball-paddle.jpg",
      },
    ],
    activityFeed: [
      {
        type: "session",
        title: "Session Completed",
        description: "Pickleball training with Coach Tom",
        time: "Yesterday",
      },
    ],
  },

  Golf: {
    category: "rec",
    displayName: "Golf",
    trainerTitle: "Coach",
    sessionType: "Lesson",
    locationPrefix: "Course",
    groupType: "League",
    sampleTrainers: [
      {
        name: "Coach James Wilson",
        rating: 4.9,
        reviews: 112,
        price: 95,
        location: "Pebble Creek Golf Club",
        specialties: ["Swing Mechanics", "Putting", "Course Management"],
        bio: "PGA certified golf instructor with 15+ years experience. Specialized in swing analysis, putting techniques, and course strategy.",
        certifications: ["PGA Certified", "TrackMan Certified", "Titleist Performance Institute"],
      },
    ],
    sampleSessions: [{ title: "Golf Swing Analysis", location: "Pebble Creek Golf Club", time: "Tomorrow, 1:00 PM" }],
    marketplaceItems: [
      {
        name: "Callaway Driver - Epic Series",
        condition: "Like New",
        price: 250,
        seller: "James Wilson",
        image: "/golf-driver.png",
      },
    ],
    activityFeed: [
      {
        type: "session",
        title: "Lesson Completed",
        description: "Golf swing analysis with Coach James",
        time: "Yesterday",
      },
    ],
  },

  Soccer: {
    category: "rec",
    displayName: "Soccer",
    trainerTitle: "Coach",
    sessionType: "Training",
    locationPrefix: "Field",
    groupType: "League",
    sampleTrainers: [
      {
        name: "Coach David Chen",
        rating: 4.7,
        reviews: 156,
        price: 70,
        location: "Westside Recreation Center",
        specialties: ["Dribbling", "Passing", "Tactics"],
        bio: "Former professional soccer player with 10+ years coaching experience. Specialized in technical skills, tactical awareness, and team play.",
        certifications: ["UEFA B License", "US Soccer Certified", "Sports Psychology"],
      },
    ],
    sampleSessions: [{ title: "Soccer Skills Training", location: "Westside Fields", time: "Tomorrow, 4:00 PM" }],
    marketplaceItems: [
      {
        name: "Adidas Soccer Ball - Match Quality",
        condition: "New",
        price: 35,
        seller: "David Chen",
        image: "/classic-soccer-ball.png",
      },
    ],
    activityFeed: [
      {
        type: "session",
        title: "Session Completed",
        description: "Soccer training with Coach David",
        time: "Yesterday",
      },
    ],
  },

  Padel: {
    category: "rec",
    displayName: "Padel",
    trainerTitle: "Coach",
    sessionType: "Training",
    locationPrefix: "Court",
    groupType: "League",
    sampleTrainers: [
      {
        name: "Coach Carlos Mendez",
        rating: 4.9,
        reviews: 78,
        price: 80,
        location: "Padel World NYC",
        specialties: ["Doubles Strategy", "Wall Play", "Power Shots"],
        bio: "Professional padel coach with 10+ years experience. Specialized in doubles strategy, wall techniques, and competitive play.",
        certifications: ["World Padel Tour Certified", "FIP Instructor", "CPR/First Aid"],
      },
    ],
    sampleSessions: [{ title: "Padel Fundamentals", location: "Padel World NYC", time: "Tomorrow, 6:00 PM" }],
    marketplaceItems: [
      {
        name: "Bullpadel Vertex Pro Racket",
        condition: "Like New",
        price: 180,
        seller: "Carlos Mendez",
        image: "/padel-racket.png",
      },
    ],
    activityFeed: [
      {
        type: "session",
        title: "Session Completed",
        description: "Padel training with Coach Carlos",
        time: "Yesterday",
      },
    ],
  },

  Racquetball: {
    category: "rec",
    displayName: "Racquetball",
    trainerTitle: "Coach",
    sessionType: "Training",
    locationPrefix: "Court",
    groupType: "League",
    sampleTrainers: [
      {
        name: "Coach Ryan Brooks",
        rating: 4.8,
        reviews: 65,
        price: 70,
        location: "Downtown Racquet Club",
        specialties: ["Serves", "Kill Shots", "Court Positioning"],
        bio: "Former pro racquetball player with 12+ years coaching experience. Specialized in power serves, kill shot techniques, and competitive strategy.",
        certifications: ["USA Racquetball Certified", "Level 2 Instructor", "CPR/First Aid"],
      },
    ],
    sampleSessions: [{ title: "Racquetball Skills Clinic", location: "Downtown Racquet Club", time: "Tomorrow, 7:00 PM" }],
    marketplaceItems: [
      {
        name: "HEAD Graphene Racquet",
        condition: "Good",
        price: 85,
        seller: "Ryan Brooks",
        image: "/racquetball-racket.png",
      },
    ],
    activityFeed: [
      {
        type: "session",
        title: "Session Completed",
        description: "Racquetball training with Coach Ryan",
        time: "Yesterday",
      },
    ],
  },

  Volleyball: {
    category: "rec",
    displayName: "Volleyball",
    trainerTitle: "Coach",
    sessionType: "Training",
    locationPrefix: "Court",
    groupType: "League",
    sampleTrainers: [
      {
        name: "Coach Lisa Martinez",
        rating: 4.8,
        reviews: 92,
        price: 70,
        location: "Beach Volleyball Courts",
        specialties: ["Serving", "Blocking", "Team Play"],
        bio: "Professional volleyball coach with 8+ years experience. Specialized in serving techniques, blocking strategies, and team coordination.",
        certifications: ["USA Volleyball Certified", "Beach Volleyball Specialist", "CPR/First Aid"],
      },
    ],
    sampleSessions: [{ title: "Volleyball Fundamentals", location: "Beach Courts", time: "Tomorrow, 5:00 PM" }],
    marketplaceItems: [
      {
        name: "Mikasa Volleyball - Pro Touch",
        condition: "Good",
        price: 40,
        seller: "Lisa Martinez",
        image: "/volleyball-game.png",
      },
    ],
    activityFeed: [
      {
        type: "session",
        title: "Session Completed",
        description: "Volleyball training with Coach Lisa",
        time: "Yesterday",
      },
    ],
  },

  Swimming: {
    category: "rec",
    displayName: "Swimming",
    trainerTitle: "Coach",
    sessionType: "Lesson",
    locationPrefix: "Pool",
    groupType: "Team",
    sampleTrainers: [
      {
        name: "Coach Michael Torres",
        rating: 4.9,
        reviews: 184,
        price: 80,
        location: "Olympic Aquatic Center",
        specialties: ["Freestyle", "Stroke Technique", "Open Water"],
        bio: "Former Olympic trial swimmer with 12+ years coaching experience. Specialized in stroke mechanics, competitive training, and open water swimming.",
        certifications: ["USA Swimming Certified", "Red Cross Lifeguard", "ASCA Level 3"],
      },
      {
        name: "Coach Sarah Chen",
        rating: 4.8,
        reviews: 156,
        price: 70,
        location: "Community Pool & Beach",
        specialties: ["Beginners", "Water Safety", "Triathlon"],
        bio: "Certified swim instructor specializing in adult beginners, water safety, and triathlon training. Patient and encouraging approach.",
        certifications: ["American Red Cross WSI", "Lifeguard Certified", "Triathlon Coach"],
      },
    ],
    sampleSessions: [
      { title: "Lap Swimming Technique", location: "Olympic Aquatic Center", time: "Tomorrow, 6:00 AM" },
      { title: "Open Water Training", location: "Santa Monica Beach", time: "Saturday, 7:00 AM", participants: 8 },
      { title: "Adult Learn to Swim", location: "Community Pool", time: "Today, 5:30 PM", participants: 4 },
    ],
    marketplaceItems: [
      {
        name: "TYR Competition Goggles",
        condition: "New",
        price: 35,
        seller: "Michael Torres",
        image: "/swim-goggles.png",
      },
      {
        name: "Speedo Training Fins",
        condition: "Like New",
        price: 45,
        seller: "Sarah Chen",
        image: "/swim-fins.png",
      },
    ],
    activityFeed: [
      {
        type: "achievement",
        title: "Achievement Unlocked!",
        description: "Swam 10 miles this month",
        time: "2 hours ago",
      },
      {
        type: "session",
        title: "Lesson Completed",
        description: "Freestyle technique with Coach Michael",
        time: "Yesterday",
      },
      {
        type: "skill",
        title: "Skill Improved",
        description: "Your lap time improved by 8%",
        time: "3 days ago",
      },
    ],
  },
}

export function getActivityContent(activity: Activity): ActivityContent {
  return ACTIVITY_CONTENT[activity]
}

export function getPrimaryActivity(activities: string[]): Activity | null {
  if (activities.length === 0) return null
  return activities[0] as Activity
}

export function isStudioActivity(activity: string): boolean {
  const studioActivities = ["Pilates", "Yoga", "Lagree", "Barre", "Meditation"]
  return studioActivities.includes(activity)
}

export function isRecActivity(activity: string): boolean {
  const recActivities = ["Basketball", "Tennis", "Pickleball", "Padel", "Racquetball", "Volleyball", "Golf", "Soccer", "Swimming"]
  return recActivities.includes(activity)
}
