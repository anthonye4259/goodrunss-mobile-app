# 🌎 GoodRunss Global Facilities System

**The World's Operating System for Recreation & Wellness**

---

## 📖 Overview

GoodRunss is the **global platform** for discovering and booking recreational and wellness facilities worldwide. Using Google Places API, we automatically populate our database with:

### 🏀 **Courts**
Basketball • Tennis • Pickleball • Racquetball • Squash • Volleyball • Badminton

### 🏊 **Pools**
Public • Private • Hotel • College • Olympic • Lap • Community

### ⚽ **Fields**
Soccer • Football • Baseball • Softball • Rugby • Cricket • Lacrosse

### 🧘 **Studios**
Yoga • Pilates • Barre • Spin • CrossFit • Boxing • Dance • Martial Arts

### 💪 **Gyms**
Commercial • Boutique • College • Corporate • 24-Hour

### 🏞️ **Other**
Golf Courses • Running Tracks • Skateparks • Climbing Gyms • Recreation Centers

---

## 🏗️ Architecture

### **1. Type System**
📁 `lib/types/global-facilities.ts`

Comprehensive TypeScript types for ALL facility and sport types worldwide:
- `SportType` - 40+ sport types
- `FacilityType` - 35+ facility types
- `AccessType` - Public, members-only, students-only, etc.
- `Venue` - Complete venue data structure
- Google Places API mapping

### **2. Data Fetcher**
📁 `scripts/data-import/google-places-fetcher.ts`

Fetches facility data from Google Places API:
- Search by sport type and location
- Fetch detailed place information
- Convert to GoodRunss venue format
- Rate limiting and error handling
- Pre-configured for US major cities and top colleges

### **3. Firebase Importer**
📁 `scripts/data-import/firebase-importer.ts`

Imports facility data into Firestore:
- Batch imports with deduplication
- Update existing facilities
- Export/import from JSON
- Query by location and sport
- Database statistics

### **4. CLI Tool**
📁 `scripts/data-import/import-facilities.ts`

Command-line interface for importing facilities:
```bash
# Import basketball courts from major US cities
npm run import-facilities -- --sport basketball --cities us-major --import

# Import all pools from top 50 colleges
npm run import-facilities -- --sport swimming --cities us-colleges --import

# Import all sports from major cities (save to JSON only)
npm run import-facilities -- --sport all --cities us-major
```

---

## 🚀 Quick Start

### **Step 1: Install Dependencies**

```bash
cd /Users/anthonyedwards/Downloads/goodrunss-ai-mobile-app
npm install
```

This installs:
- `axios` - HTTP client for API requests
- `commander` - CLI argument parsing
- `dotenv` - Environment variable management
- `firebase-admin` - Firebase server SDK
- `ts-node` - TypeScript execution

### **Step 2: Configure Environment**

Create `.env` file in project root:

```bash
# Copy example file
cp scripts/data-import/.env.example .env

# Edit with your API keys
nano .env
```

Add your credentials:
```env
GOOGLE_PLACES_API_KEY=your_actual_api_key_here
FIREBASE_SERVICE_ACCOUNT_PATH=./path/to/serviceAccountKey.json
```

### **Step 3: Get Google Places API Key**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project or select existing
3. Enable **Places API**
4. Create API key in **Credentials**
5. Add billing (Google gives $200/month free credit)

### **Step 4: Get Firebase Service Account**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`goodrunss-ai`)
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Save JSON file securely (DON'T commit to git!)

### **Step 5: Run Your First Import**

```bash
# Test fetch (no import)
npm run import-facilities -- --sport basketball --cities us-major --dry-run

# Import basketball courts from 20 major US cities
npm run import-facilities -- --sport basketball --cities us-major --import

# Import swimming pools from top 50 colleges
npm run import-facilities -- --sport swimming --cities us-colleges --import

# Import ALL sports (basketball, tennis, swimming, soccer, yoga, gym)
npm run import-facilities -- --sport all --cities us-major --import
```

---

## 📊 Usage Examples

### **Import by Sport Type**

```bash
# Basketball courts
npm run import-facilities -- --sport basketball --cities us-major --import

# Tennis courts
npm run import-facilities -- --sport tennis --cities us-major --import

# Swimming pools
npm run import-facilities -- --sport swimming --cities us-major --import

# Yoga studios
npm run import-facilities -- --sport yoga --cities us-major --import

# CrossFit gyms
npm run import-facilities -- --sport crossfit --cities us-major --import
```

### **Import by Location Type**

```bash
# US major cities (20 cities)
npm run import-facilities -- --sport basketball --cities us-major --import

# US top colleges (50 universities)
npm run import-facilities -- --sport basketball --cities us-colleges --import

# Custom locations (provide JSON file)
npm run import-facilities -- --sport basketball --cities ./my-cities.json --import
```

### **Save to JSON (No Firebase Import)**

```bash
# Just fetch and save to JSON
npm run import-facilities -- --sport basketball --cities us-major --output ./data/basketball-courts.json

# Fetch all sports, save to JSON
npm run import-facilities -- --sport all --cities us-major --output ./data/all-facilities.json
```

### **Dry Run (Test Only)**

```bash
# Test the fetcher without saving anything
npm run import-facilities -- --sport basketball --cities us-major --dry-run
```

---

## 🗺️ Pre-Configured Locations

### **US Major Cities** (`--cities us-major`)
20 major US cities including:
- New York, Los Angeles, Chicago
- Houston, Phoenix, Philadelphia
- San Antonio, Dallas, San Jose
- Austin, Jacksonville, San Francisco
- Denver, Washington DC, Boston
- Seattle, Miami, Atlanta, Portland, Las Vegas

### **US Top Colleges** (`--cities us-colleges`)
50 top US universities including:
- Harvard, MIT, Princeton, Yale, Stanford
- UCLA, USC, UC Berkeley, UMich, UT Austin
- Columbia, UChicago, Duke, Brown, UPenn
- Northwestern, UW Madison, UNC, Georgia Tech
- And 30+ more top universities

### **Custom Locations**
Create your own JSON file:

```json
[
  {
    "lat": 40.7128,
    "lng": -74.0060,
    "name": "New York, NY",
    "radius": 50000
  },
  {
    "lat": 34.0522,
    "lng": -118.2437,
    "name": "Los Angeles, CA",
    "radius": 50000
  }
]
```

Then import:
```bash
npm run import-facilities -- --sport basketball --cities ./my-cities.json --import
```

---

## 🔥 Firebase Structure

### **Collection: `facilities`**

```typescript
{
  id: string                      // Firestore document ID
  name: string                    // "UCLA Recreation Center"
  description?: string            // "Basketball facility in Los Angeles"
  
  // Location
  lat: number                     // 34.0689
  lng: number                     // -118.4452
  address: string                 // "123 Main St, Los Angeles, CA 90024"
  city: string                    // "Los Angeles"
  state: string                   // "CA"
  country: string                 // "US"
  zipCode: string                 // "90024"
  
  // Classification
  facilityType: FacilityType      // "college_court"
  sportTypes: SportType[]         // ["basketball", "volleyball"]
  accessType: AccessType          // "students_only"
  
  // Organization (if applicable)
  institution?: string            // "UCLA"
  institutionType?: string        // "university"
  
  // Contact & Hours
  phoneNumber?: string
  website?: string
  hours?: OperatingHours[]
  
  // Pricing
  pricing?: VenuePricing
  
  // Amenities
  amenities: string[]             // ["Parking", "Lockers", "Showers"]
  
  // Quality & Ratings
  rating?: number                 // 4.7
  reviewCount?: number            // 89
  goodRunssRating?: number        // Our custom rating
  
  // Media
  images: string[]                // Array of image URLs
  coverImage?: string             // Main image URL
  
  // Metadata
  verified: boolean               // false (until manually verified)
  googlePlaceId?: string          // "ChIJXeSMH..."
  createdAt: Date
  updatedAt: Date
  source: string                  // "google_places"
  
  // Booking
  bookable: boolean               // false (until we add booking)
  bookingUrl?: string
}
```

---

## 🎯 Roadmap

### **Phase 1: Foundation** ✅ **(COMPLETE)**
- [x] Global type system
- [x] Google Places API fetcher
- [x] Firebase importer
- [x] CLI tool
- [x] Pre-configured US locations

### **Phase 2: Mobile App Integration** 🚧 **(IN PROGRESS)**
- [ ] Update mobile app to use new types
- [ ] Dynamic facility type filtering
- [ ] Search by sport and location
- [ ] Facility detail screens

### **Phase 3: Global Expansion** 📍 **(NEXT)**
- [ ] Add international cities
- [ ] Add more college facilities
- [ ] User-submitted facilities
- [ ] Facility verification system

### **Phase 4: Booking System** 📅 **(FUTURE)**
- [ ] Real-time availability
- [ ] Online booking
- [ ] Payment integration
- [ ] Facility management portal

---

## 💰 Cost Estimate (Google Places API)

### **Free Tier**
- $200/month free credit from Google
- **Places Nearby Search**: $32 per 1,000 requests
- **Place Details**: $17 per 1,000 requests

### **Example Costs**
**Scenario**: Import basketball courts from 20 US cities
- 20 cities × ~20 results = 400 nearby searches = **$12.80**
- 400 place details = **$6.80**
- **Total: ~$20** (covered by free credit!)

**Full Import** (all sports, 20 cities):
- 6 sports × 20 cities × 20 results = 2,400 searches = **$77**
- 2,400 place details = **$41**
- **Total: ~$118** (covered by free credit!)

### **Pro Tip**
Use `--dry-run` to test queries before importing!

---

## 🛠️ Development

### **Project Structure**

```
goodrunss-ai-mobile-app/
├── lib/
│   └── types/
│       └── global-facilities.ts       # Type definitions
├── scripts/
│   └── data-import/
│       ├── google-places-fetcher.ts   # API fetcher
│       ├── firebase-importer.ts       # Firebase importer
│       ├── import-facilities.ts       # CLI tool
│       └── .env.example               # Environment template
├── data/                              # Output JSON files
│   └── facilities.json
├── package.json                       # Dependencies & scripts
└── GLOBAL_FACILITIES_SYSTEM.md       # This file
```

### **Available Scripts**

```bash
# Import facilities
npm run import-facilities -- [options]

# Show help
npm run import-help

# Install dependencies
npm install

# Start mobile app
npm start
```

### **CLI Options**

```
Options:
  -s, --sport <type>     Sport type (basketball, swimming, or "all")
  -c, --cities <preset>  City preset (us-major, us-colleges, or JSON path)
  -i, --import           Import to Firebase (default: save to JSON only)
  -o, --output <path>    Output JSON file path (default: ./data/facilities.json)
  --dry-run              Fetch but don't save (for testing)
  --limit <number>       Limit results per city (default: 20)
  --help                 Show help
```

---

## 🤝 Contributing

### **Adding New Sports**

Edit `lib/types/global-facilities.ts`:

1. Add to `SportType`:
```typescript
export type SportType =
  | "basketball"
  | "your_new_sport"  // Add here
```

2. Add search keywords:
```typescript
export const SPORT_SEARCH_KEYWORDS: Record<SportType, string[]> = {
  your_new_sport: ["keyword1", "keyword2"],
}
```

3. Add display name:
```typescript
export const SPORT_DISPLAY_NAMES: Record<SportType, string> = {
  your_new_sport: "Your New Sport",
}
```

### **Adding New Facility Types**

Same process as sports - edit the types file!

### **Adding New Locations**

Create a JSON file with lat/lng coordinates and use `--cities` flag.

---

## 🚨 Important Notes

### **API Rate Limits**
- The fetcher includes automatic rate limiting
- Waits 100ms between requests
- Waits 500ms between cities
- Be patient - large imports take time!

### **Security**
- **NEVER** commit `.env` or service account JSON files!
- Add to `.gitignore`:
  ```
  .env
  *serviceAccount*.json
  ```

### **Firebase Rules**
Make sure your Firestore rules allow writes:
```javascript
match /facilities/{facilityId} {
  allow read: if true;
  allow write: if request.auth != null;  // Or admin only
}
```

### **Deduplication**
The importer automatically:
- Checks for existing facilities by `googlePlaceId`
- Updates existing facilities instead of creating duplicates
- Maintains `createdAt` and updates `updatedAt`

---

## 📞 Support

### **Google Places API Issues**
- [Google Places API Docs](https://developers.google.com/maps/documentation/places/web-service/overview)
- [Google Cloud Console](https://console.cloud.google.com/)

### **Firebase Issues**
- [Firebase Docs](https://firebase.google.com/docs)
- [Firestore Docs](https://firebase.google.com/docs/firestore)

### **GoodRunss Questions**
Contact your development team or refer to:
- `UNIFIED_FIREBASE_ARCHITECTURE.md`
- `SETUP_COMPLETE_GUIDE.md`

---

## ✨ Next Steps

1. **Run your first import**:
   ```bash
   npm run import-facilities -- --sport basketball --cities us-major --import
   ```

2. **Check Firebase Console**:
   Visit https://console.firebase.google.com/project/goodrunss-ai/firestore

3. **Update mobile app** to display facilities

4. **Expand globally** - add more cities and sports!

---

**Welcome to the Global OS for Recreation & Wellness!** 🌎🏀🏊⚽🧘


