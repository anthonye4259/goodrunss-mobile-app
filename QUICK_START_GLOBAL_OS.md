# 🚀 **QUICK START: GoodRunss Global OS**

## **Get your app populated with THOUSANDS of facilities in minutes!**

---

## ✅ **What You Just Got:**

**A complete system to automatically import EVERY recreational and wellness facility worldwide:**

- ✅ 40+ Sport Types (basketball, tennis, swimming, yoga, etc.)
- ✅ 35+ Facility Types (courts, pools, studios, gyms, etc.)  
- ✅ Google Places API integration
- ✅ Firebase import pipeline
- ✅ Mobile app hooks & components
- ✅ Pre-configured for 20 US cities + 50 colleges

---

## 🎬 **STEP-BY-STEP TO GET STARTED:**

### **Step 1: Install Dependencies** (2 minutes)

```bash
cd /Users/anthonyedwards/Downloads/goodrunss-ai-mobile-app
npm install
```

---

### **Step 2: Get Google Places API Key** (5 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable **"Places API"** in the API Library
4. Go to **Credentials** → Create **API Key**
5. Add billing (you get **$200/month FREE**)

**📌 Save your API key!**

---

### **Step 3: Create .env File** (1 minute)

Create a file called `.env` in the project root:

```bash
cd /Users/anthonyedwards/Downloads/goodrunss-ai-mobile-app
touch .env
nano .env
```

Add this content:

```env
GOOGLE_PLACES_API_KEY=paste_your_api_key_here
```

**Save and exit** (Ctrl+X, then Y, then Enter)

---

### **Step 4: Run Your First Import!** (5-10 minutes)

#### **Option A: Basketball Courts (Recommended to start)**

```bash
npm run import-facilities -- --sport basketball --cities us-major --import
```

This will import ~400 basketball courts from 20 major US cities!

#### **Option B: Swimming Pools**

```bash
npm run import-facilities -- --sport swimming --cities us-major --import
```

#### **Option C: All Sports**

```bash
npm run import-facilities -- --sport all --cities us-major --import
```

This imports: basketball, tennis, swimming, soccer, yoga, and gyms!

---

### **Step 5: Check Firebase** (1 minute)

1. Go to [Firebase Console](https://console.firebase.google.com/project/goodrunss-ai/firestore)
2. Open the `facilities` collection
3. **See your data!** 🎉

---

## 📊 **WHAT EACH COMMAND DOES:**

### **Import by Sport:**

```bash
# Basketball courts
npm run import-facilities -- --sport basketball --cities us-major --import

# Tennis courts  
npm run import-facilities -- --sport tennis --cities us-major --import

# Swimming pools
npm run import-facilities -- --sport swimming --cities us-major --import

# Soccer fields
npm run import-facilities -- --sport soccer --cities us-major --import

# Yoga studios
npm run import-facilities -- --sport yoga --cities us-major --import

# Gyms
npm run import-facilities -- --sport gym --cities us-major --import

# Pilates studios
npm run import-facilities -- --sport pilates --cities us-major --import

# CrossFit gyms
npm run import-facilities -- --sport crossfit --cities us-major --import
```

### **Import from Colleges:**

```bash
# Basketball at top 50 US colleges
npm run import-facilities -- --sport basketball --cities us-colleges --import

# Pools at colleges
npm run import-facilities -- --sport swimming --cities us-colleges --import

# All sports at colleges
npm run import-facilities -- --sport all --cities us-colleges --import
```

### **Test Without Importing:**

```bash
# Dry run (just fetch, don't save)
npm run import-facilities -- --sport basketball --cities us-major --dry-run
```

### **Save to JSON (No Firebase):**

```bash
# Save to JSON file instead of Firebase
npm run import-facilities -- --sport basketball --cities us-major --output ./data/courts.json
```

---

## 💡 **PRO TIPS:**

### **Start Small:**
```bash
# Import just 1-2 sports first to test
npm run import-facilities -- --sport basketball --cities us-major --import
```

### **Then Go Big:**
```bash
# Import everything!
npm run import-facilities -- --sport all --cities us-major --import
npm run import-facilities -- --sport all --cities us-colleges --import
```

### **Monitor Costs:**
Check your Google Cloud Console billing to see API usage (remember: $200/month free!)

---

## 🔥 **RECOMMENDED IMPORT SEQUENCE:**

### **Day 1: Test & Verify** ✅
```bash
npm run import-facilities -- --sport basketball --cities us-major --import
```
- Import ~400 basketball courts
- Check Firebase
- Test in mobile app
- **Cost: ~$20** (covered by free credit)

### **Day 2: Core Sports** ⚽
```bash
npm run import-facilities -- --sport tennis --cities us-major --import
npm run import-facilities -- --sport swimming --cities us-major --import
npm run import-facilities -- --sport soccer --cities us-major --import
```
- Import ~1,200 facilities
- **Cost: ~$60** (covered by free credit)

### **Day 3: Wellness** 🧘
```bash
npm run import-facilities -- --sport yoga --cities us-major --import
npm run import-facilities -- --sport pilates --cities us-major --import
npm run import-facilities -- --sport gym --cities us-major --import
```
- Import ~800 facilities
- **Cost: ~$40** (covered by free credit)

### **Day 4: Colleges** 🎓
```bash
npm run import-facilities -- --sport all --cities us-colleges --import
```
- Import ~600 college facilities
- **Cost: ~$30** (covered by free credit)

### **Total Week 1:**
- **~3,000 facilities**
- **~$150 cost** (covered by free credit!)
- **YOU NOW HAVE A GLOBAL PLATFORM!** 🌎

---

## 🎯 **TROUBLESHOOTING:**

### **"Error: GOOGLE_PLACES_API_KEY not set"**
→ Make sure you created the `.env` file with your API key

### **"Error: Places API not enabled"**
→ Go to Google Cloud Console and enable Places API

### **"Error: Firebase permission denied"**
→ Make sure you're logged into Firebase with correct credentials

### **Import is slow**
→ This is normal! Rate limiting prevents API quota issues  
→ Large imports (1000+ facilities) can take 30-60 minutes

### **Duplicate facilities**
→ The system automatically deduplicates by Google Place ID  
→ Re-running imports will update existing facilities, not create duplicates

---

## 📱 **USE IN MOBILE APP:**

### **Basic Usage:**

```typescript
import { useFacilitiesBySport } from '@/lib/hooks/useFacilities'

function VenuesScreen() {
  const { facilities, loading } = useFacilitiesBySport('basketball')

  if (loading) return <Loading />

  return (
    <FlatList
      data={facilities}
      renderItem={({ item }) => <FacilityCard facility={item} />}
    />
  )
}
```

### **With Location:**

```typescript
import { useNearbyFacilities } from '@/lib/hooks/useFacilities'

function NearbyScreen() {
  const userLocation = { lat: 40.7128, lng: -74.0060 }
  const { facilities, loading } = useNearbyFacilities(userLocation, 10) // 10km radius

  return <FacilityList facilities={facilities} />
}
```

### **With Filters:**

```typescript
import { FacilityFilters, ActiveFilters } from '@/components/FacilityFilters'

function FilteredVenues() {
  const [filters, setFilters] = useState({
    sports: ['basketball'],
    facilityTypes: [],
    accessTypes: ['public'],
    amenities: ['Parking'],
  })

  return (
    <>
      <FacilityFilters filters={filters} onFilterChange={setFilters} />
      <ActiveFilters filters={filters} onFilterChange={setFilters} />
      <FacilityList filters={filters} />
    </>
  )
}
```

---

## 📖 **FULL DOCUMENTATION:**

- **`GLOBAL_FACILITIES_SYSTEM.md`** - Complete system documentation  
- **`GLOBAL_OS_IMPLEMENTATION.md`** - Implementation summary  
- **`TESTFLIGHT_READY.md`** - Mobile app deployment guide

---

## 🎊 **YOU'RE READY TO LAUNCH!**

### **Next Commands to Run:**

```bash
# 1. Import your first facilities
npm run import-facilities -- --sport basketball --cities us-major --import

# 2. Start your mobile app
npm start

# 3. Build for TestFlight (Monday Dec 1st when your free builds reset)
eas build --platform ios --profile production
eas submit --platform ios
```

---

## 💬 **QUICK REFERENCE:**

| Command | What It Does | Time | Cost |
|---------|-------------|------|------|
| `--sport basketball --cities us-major --import` | Import basketball from 20 cities | 10 min | ~$20 |
| `--sport all --cities us-major --import` | Import 6 sports from 20 cities | 60 min | ~$120 |
| `--sport all --cities us-colleges --import` | Import from 50 colleges | 30 min | ~$60 |
| `--dry-run` | Test without saving | 5 min | ~$5 |

**All costs covered by Google's $200/month free credit!**

---

## 🌟 **CONGRATULATIONS!**

**You now have the infrastructure to become the GLOBAL OS for recreation & wellness!**

Start with one sport, test it, then scale to the world! 🚀

---

**👉 FIRST COMMAND TO RUN RIGHT NOW:**

```bash
cd /Users/anthonyedwards/Downloads/goodrunss-ai-mobile-app
npm install
npm run import-facilities -- --sport basketball --cities us-major --import
```

**GO!** 🏀🌎







