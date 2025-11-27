# GoodRunss Mobile App - Complete File List for Cursor Integration

## 📱 Core App Structure

### Root Configuration Files
- `app.json` - Expo app configuration with icons, splash screen, build settings
- `package.json` - Dependencies (React Native, Expo Router, Stripe, Firebase, etc.)
- `tsconfig.json` - TypeScript configuration

### App Directory (`app/`)

#### Tab Navigation (`app/(tabs)/`)
- `_layout.tsx` - Dynamic tab navigation (adapts based on user type)
- `index.tsx` - Home screen with "For You" feed and quick actions
- `explore.tsx` - Browse trainers, venues, personas (rec vs studio filtering)
- `gia.tsx` - AI assistant chat interface
- `messages.tsx` - Conversations list with trainers and players
- `bookings.tsx` - Upcoming/past bookings, waitlists, sessions
- `trainer.tsx` - Trainer dashboard (only visible to trainers/instructors)
- `profile.tsx` - User profile, stats, settings, ambassador program

#### Authentication & Onboarding
- `auth.tsx` - Login/signup screen with social auth
- `index.tsx` - App entry point with guest mode
- `_layout.tsx` - Root layout with auth context
- `onboarding/index.tsx` - User type selection (player/trainer/both)
- `onboarding/questionnaire.tsx` - Sports, skills, goals questionnaire
- `language-selection.tsx` - Language picker for internationalization

#### Trainers
- `trainers/[id].tsx` - Trainer profile detail with booking
- `trainers/index.tsx` - Browse all trainers
- `public-trainer/[id].tsx` - Public trainer profile (guest view)

#### Venues
- `venues/[id].tsx` - Venue detail with court booking, check-in, facility reporting
- `venues/index.tsx` - Browse all venues
- `venues/map.tsx` - **Discovery map with all facility pins and sport filtering**

#### Bookings & Sessions
- `booking-confirmation/[id].tsx` - Booking success screen with QR code
- `sessions/[id].tsx` - Session detail and check-in

#### Social & Matching
- `social/feed.tsx` - Social feed with activity
- `social/friends.tsx` - Friends list and requests
- `find-partners/index.tsx` - GPS-based player matching
- `match-request/[playerId].tsx` - Send match invitation
- `match-requests/index.tsx` - Incoming/outgoing match requests
- `match-history/index.tsx` - Past matches and partners
- `rate-player/[matchId].tsx` - Rate match partners
- `send-psa.tsx` - Broadcast alert to nearby players
- `need-players/[venueId].tsx` - Request players at venue

#### Challenges & Gamification
- `challenges/index.tsx` - Active challenges and competitions
- `challenges/[id].tsx` - Challenge detail
- `challenges/leaderboard.tsx` - Global and friend leaderboards

#### AI Personas
- `personas/index.tsx` - Browse and purchase AI trainer personas
- `personas/[id].tsx` - Persona detail with pricing and purchase
- `personas/[id]/chat.tsx` - Chat with AI persona

#### Stats & Progress
- `rating/[sport].tsx` - Sport-specific skill ratings
- `stats/detailed.tsx` - Detailed stats dashboard with graphs

#### Settings
- `settings/index.tsx` - Main settings screen
- `settings/edit-profile.tsx` - Edit user profile
- `settings/notifications.tsx` - Notification preferences
- `settings/privacy.tsx` - Privacy settings
- `settings/payment-methods.tsx` - Manage payment methods
- `settings/subscription.tsx` - Premium subscription management
- `settings/location.tsx` - Location permissions and settings
- `settings/wearables.tsx` - Connect fitness wearables
- `settings/language-region.tsx` - Language, currency, units preferences

#### **NEW: Facility Reporting & Ambassador Program**
- `report-facility/[venueId].tsx` - **Report facility conditions (earn $1-31)**
- `facility-reports/dashboard.tsx` - **Gamification dashboard with levels, streaks, badges**
- `ambassador/apply.tsx` - **Apply for Court Captain/UGC Creator/Ambassador roles**
- `ambassador/dashboard.tsx` - **Ambassador earnings, stats, and tier progression**

#### Other Features
- `waitlist/manage.tsx` - Manage booking waitlists (trainers/facilities)
- `alerts/index.tsx` - System alerts and notifications
- `referrals.tsx` - Referral program with rewards tracking
- `paywall.tsx` - Premium feature paywall
- `for-you.tsx` - **TikTok-style personalized feed with adaptive algorithm**
- `marketplace/[id].tsx` - Marketplace product detail

#### Styles
- `globals.css` - Global styles with TailwindCSS v4 theme tokens

---

## 🧩 Components Directory (`components/`)

### Core Components
- `empty-state.tsx` - Empty state with illustrations
- `animated-button.tsx` - Button with haptic feedback and animations
- `success-illustration.tsx` - Animated success checkmark
- `error-illustration.tsx` - Animated error shake
- `login-prompt-modal.tsx` - Guest mode login prompt
- `shareable-stats-card.tsx` - Social sharing stats card

### Booking & Scheduling
- `trainer-booking-modal.tsx` - Trainer booking flow with Stripe payment
- `waitlist-join-modal.tsx` - Join waitlist with time preferences

### UI Library (`components/ui/`)
- All shadcn/ui components (button, card, input, modal, etc.)

---

## 📚 Library Directory (`lib/`)

### Type Definitions
- `check-in-types.ts` - Venue, court, check-in types with `venueType: "recreational" | "studio"`
- `persona-types.ts` - AI persona types with skill graphs and actions
- `waitlist-types.ts` - Waitlist entry and notification types
- `adaptive-algorithm-types.ts` - Recommendation algorithm types
- `facility-report-types.ts` - **Facility reporting and gamification types**
- `ambassador-types.ts` - **Ambassador program roles and tiers**

### Services & Utilities
- `search-service.ts` - Search API wrapper (needs backend connection)
- `location-service.ts` - GPS and location services (needs backend connection)
- `notification-service.ts` - Push notifications (needs backend connection)
- `user-preferences.tsx` - User type and preference management
- `i18n.ts` - Internationalization with 12 languages
- `i18n-config.ts` - Language and locale configuration
- `global-format.ts` - **Currency, distance, date formatting for international users**
- `auth-context.tsx` - Authentication context with guest mode
- `utils.ts` - Utility functions (cn, etc.)

---

## 🖼️ Assets Directory (`assets/`)

- `icon.jpg` - App icon (1024x1024)
- `adaptive-icon.jpg` - Android adaptive icon
- `splash.jpg` - Splash screen
- `favicon.jpg` - Web favicon

---

## 🔌 Backend Integration Points

### API Endpoints Your Backend Needs to Provide:

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/social` - Social auth (Google, Apple)
- `GET /api/auth/me` - Get current user

#### Trainers
- `GET /api/trainers` - List trainers (with filters)
- `GET /api/trainers/:id` - Get trainer detail
- `POST /api/trainers/:id/book` - Book trainer session
- `GET /api/trainers/recommended` - Get personalized recommendations

#### Venues
- `GET /api/venues` - List venues (with filters, sport type)
- `GET /api/venues/:id` - Get venue detail
- `POST /api/venues/:id/book` - Book court
- `POST /api/venues/:id/checkin` - Check in at venue
- `GET /api/venues/map` - Get all venues for map view

#### **Facility Reporting (10 endpoints)**
- `POST /api/facilities/:id/report` - Submit facility report
- `GET /api/facilities/reports/my` - Get user's reports
- `GET /api/facilities/reports/stats` - Get gamification stats
- `GET /api/facilities/reports/leaderboard` - Get reporting leaderboard
- `POST /api/facilities/reports/:id/verify` - Verify report (admin)
- `GET /api/facilities/:id/reports` - Get all reports for facility
- `PATCH /api/facilities/reports/:id` - Update report
- `DELETE /api/facilities/reports/:id` - Delete report
- `GET /api/facilities/reports/rewards` - Get earned rewards
- `POST /api/facilities/reports/rewards/claim` - Claim rewards

#### **Ambassador Program (11 endpoints)**
- `POST /api/ambassadors/apply` - Apply for ambassador role
- `GET /api/ambassadors/my-application` - Get application status
- `GET /api/ambassadors/dashboard` - Get ambassador dashboard stats
- `GET /api/ambassadors/earnings` - Get earnings breakdown
- `POST /api/ambassadors/content` - Submit UGC content
- `GET /api/ambassadors/referrals` - Get referral stats
- `POST /api/ambassadors/events` - Create community event
- `GET /api/ambassadors/leaderboard` - Get ambassador rankings
- `POST /api/ambassadors/payouts/request` - Request payout
- `GET /api/ambassadors/tiers` - Get tier progression
- `PATCH /api/ambassadors/profile` - Update ambassador profile

#### Waitlist
- `POST /api/waitlist/join` - Join waitlist
- `GET /api/waitlist/my` - Get user's waitlists
- `DELETE /api/waitlist/:id` - Leave waitlist
- `POST /api/waitlist/notify` - Notify waitlist (trainers only)

#### Player Matching
- `GET /api/players/nearby` - GPS-based matching
- `POST /api/match-requests/send` - Send match request
- `GET /api/match-requests` - Get pending requests
- `POST /api/match-requests/:id/accept` - Accept request
- `POST /api/match-requests/:id/decline` - Decline request
- `GET /api/matches/history` - Get match history
- `POST /api/matches/:id/rate` - Rate match partner

#### Personas
- `GET /api/personas` - List AI personas
- `GET /api/personas/:id` - Get persona detail
- `POST /api/personas/:id/purchase` - Purchase persona access
- `POST /api/personas/:id/chat` - Chat with persona (AI)
- `GET /api/personas/my` - Get purchased personas

#### Stats & Gamification
- `GET /api/stats/user/:id` - Get user stats
- `GET /api/challenges` - List active challenges
- `GET /api/challenges/:id/join` - Join challenge
- `GET /api/leaderboard/:type` - Get leaderboards

#### Bookings
- `GET /api/bookings/upcoming` - Get upcoming bookings
- `GET /api/bookings/past` - Get past bookings
- `POST /api/bookings/:id/cancel` - Cancel booking
- `POST /api/bookings/:id/checkin` - Check in to booking

#### Search & Recommendations
- `GET /api/search` - Global search
- `GET /api/recommendations/for-you` - Adaptive algorithm feed
- `POST /api/interactions/like` - Like content (algorithm learning)
- `POST /api/interactions/skip` - Skip content (algorithm penalty)

#### Payments (Stripe)
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/methods` - Get saved payment methods

---

## 🌍 Environment Variables Needed

Create `.env` file:

\`\`\`env
# Backend API
API_URL=http://localhost:3000  # Your Cursor backend URL
API_KEY=your_api_key

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Firebase (for chat)
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...

# Google Maps
GOOGLE_MAPS_API_KEY=...

# AI (for personas)
OPENAI_API_KEY=...  # or your AI provider

# ElevenLabs (optional, for voice personas)
ELEVENLABS_API_KEY=...
\`\`\`

---

## 📦 Installation Steps for Cursor

1. **Copy all v0 files** into a `mobile/` folder in your Cursor project
2. **Install dependencies:**
   \`\`\`bash
   cd mobile
   npm install
   \`\`\`
3. **Create `.env` file** with above variables
4. **Update API calls** in `lib/` services to point to your backend
5. **Test locally:**
   \`\`\`bash
   npx expo start
   \`\`\`

---

## 🔄 Key Integration Tasks

### Replace Mock Data with Backend Calls

Example - Update `app/(tabs)/explore.tsx`:

**Before (v0 mock):**
\`\`\`typescript
const [trainers, setTrainers] = useState(mockTrainers)
\`\`\`

**After (Cursor backend):**
\`\`\`typescript
const [trainers, setTrainers] = useState([])

useEffect(() => {
  fetch(`${process.env.API_URL}/api/trainers`)
    .then(res => res.json())
    .then(data => setTrainers(data))
}, [])
\`\`\`

### Files That MUST Be Updated with Backend Calls:
1. `app/(tabs)/explore.tsx` - Trainers and venues data
2. `app/(tabs)/index.tsx` - Home feed data
3. `app/for-you.tsx` - Recommendation algorithm
4. `app/trainers/[id].tsx` - Trainer details
5. `app/venues/[id].tsx` - Venue details
6. `app/(tabs)/bookings.tsx` - User bookings
7. `app/(tabs)/messages.tsx` - Conversations
8. `app/find-partners/index.tsx` - Nearby players
9. `app/report-facility/[venueId].tsx` - **Facility reporting**
10. `app/ambassador/dashboard.tsx` - **Ambassador stats**
11. `components/trainer-booking-modal.tsx` - Booking submission
12. `lib/search-service.ts` - Search API
13. `lib/location-service.ts` - GPS services
14. `lib/notification-service.ts` - Push notifications

---

## ✅ Testing Checklist After Integration

- [ ] Auth flow works (login/register/guest mode)
- [ ] Browse trainers loads real data
- [ ] Browse venues loads real data
- [ ] Booking trainers creates records in backend
- [ ] Booking courts creates records in backend
- [ ] **Facility reporting submits to backend**
- [ ] **Ambassador application submits successfully**
- [ ] Messages sync with backend/Firebase
- [ ] Match requests work end-to-end
- [ ] Waitlist notifications trigger
- [ ] AI personas fetch from backend
- [ ] Stats display real user data
- [ ] Payments process through Stripe
- [ ] Push notifications work
- [ ] Map shows all venues from backend
- [ ] **Adaptive algorithm learns from likes/skips**

---

## 📝 Notes

- **Guest mode is enabled** - Users can browse without login
- **Dynamic tabs** - Trainer tab only shows for trainers/instructors
- **Rec vs Studios** - Venue filtering based on user preferences
- **Global-friendly** - Multi-language, multi-currency support
- **10 facility reporting endpoints** integrated
- **11 ambassador program endpoints** integrated
- **Adaptive algorithm** for personalized recommendations
- **Waitlist system** for fully booked slots

---

## 🚀 Ready to Copy!

All files are ready in v0. Copy this entire structure into your Cursor project and update API endpoints to connect to your backend.
