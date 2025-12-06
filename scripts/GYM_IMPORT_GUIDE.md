# 🏋️ Gym Chain Import Guide

## 🎯 What This Does

Fetches and imports major gym chains to your Firebase database:
- **LA Fitness**
- **YMCA**  
- **Lifetime Fitness**
- **24 Hour Fitness**
- **Planet Fitness**
- **Gold's Gym**
- **Equinox**
- **Crunch Fitness**
- **Anytime Fitness**

Searches **15 major US cities** for each chain.

---

## 🚀 How to Run

### **Step 1: Make sure you have Google Places API key**
```bash
# Check your .env file
grep GOOGLE_PLACES_API_KEY .env
```

If not set, add it:
```bash
echo "GOOGLE_PLACES_API_KEY=your_key_here" >> .env
```

### **Step 2: Run the import script**
```bash
cd /Users/anthonyedwards/Downloads/goodrunss-ai-mobile-app
node scripts/fetch-gym-chains.js
```

---

## 📊 What Gets Imported

For each gym location:
- ✅ Name, address, city, state
- ✅ Lat/lng coordinates
- ✅ Rating & review count
- ✅ Photos (up to 5)
- ✅ Hours, phone, website
- ✅ Available sports (Basketball, Swimming, Tennis, etc.)
- ✅ Amenities

---

## ⏱️ Expected Time

- **~5-10 minutes** for all chains
- Searches 9 chains × 15 cities = 135 searches
- Rate limited to avoid API quota

---

## 📈 Expected Results

**Estimated venues:**
- LA Fitness: ~50-100 locations
- YMCA: ~100-200 locations
- Lifetime Fitness: ~30-50 locations
- 24 Hour Fitness: ~50-100 locations
- Planet Fitness: ~100-200 locations
- Others: ~200-300 locations

**Total: ~500-1,000 new gym locations!**

---

## 🔍 What Happens

```
🏢 Processing: LA Fitness
==========================================================

🔍 Searching: LA Fitness in New York, NY
✅ Found 8 locations
  ✅ Added: LA Fitness - Manhattan (Basketball, Swimming)
  ✅ Added: LA Fitness - Brooklyn (Basketball, Yoga)
  ...

🔍 Searching: LA Fitness in Los Angeles, CA
✅ Found 12 locations
  ✅ Added: LA Fitness - Downtown LA (Basketball, Tennis)
  ...
```

---

## ✨ After Import

Your app will have:
- 🏋️ **500-1,000 gym locations**
- 🗺️ **Heat map** showing activity at all gyms
- 📍 **Searchable** by city, sport, chain
- ⭐ **Real ratings** from Google

---

## 🎭 Bonus: Simulate Activity

After import, run the activity simulator:
```bash
npx ts-node scripts/seed-activity.ts
```

This adds:
- 🔥 Realistic player counts
- ⭐ AI-generated reviews
- 👥 Check-ins and alerts

---

**Ready to import?** Run the script and watch your database fill up! 🚀
