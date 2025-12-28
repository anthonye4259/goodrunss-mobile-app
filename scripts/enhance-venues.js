const fs = require('fs');
const path = require('path');

// Target 7 Cities
const TARGET_CITIES = [
    "New York, NY",
    "Los Angeles, CA",
    "Chicago, IL",
    "Miami, FL",
    "Atlanta, GA",
    "Houston, TX",
    "Dallas, TX"
];

// Premium Image Sets (Unsplash IDs)
const SPORT_IMAGES = {
    "Basketball": [
        "https://images.unsplash.com/photo-1505666287802-931dc83948e9?w=800&q=80",
        "https://images.unsplash.com/photo-1546519638-68e109498ee3?w=800&q=80",
        "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80"
    ],
    "Tennis": [
        "https://images.unsplash.com/photo-1622163642998-1ea367153821?w=800&q=80",
        "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&q=80",
        "https://images.unsplash.com/photo-1626245648588-1d22aa164478?w=800&q=80"
    ],
    "Pickleball": [
        "https://images.unsplash.com/photo-1629896791986-e7e0160b868a?w=800&q=80", // Placeholder (actually golf/tennis mix often used)
        "https://plus.unsplash.com/premium_photo-1681297594963-3dc881cb648d?w=800&q=80"
    ],
    "Soccer": [
        "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&q=80",
        "https://images.unsplash.com/photo-1510566337590-2fc1f21d36a2?w=800&q=80"
    ],
    "Gym": [
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
        "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800&q=80"
    ],
    "All": [
        "https://images.unsplash.com/photo-1526317666266-932c525f6e81?w=800&q=80", // Field
        "https://images.unsplash.com/photo-1552666655-e2176d504363?w=800&q=80"  // Running track
    ]
};

const AMENITIES_LIST = ["Lighting", "Restrooms", "Water Fountain", "Parking", "Bench", "Vending Machine", "Wifi"];

function getRandomExample(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function enhanceVenues() {
    const inputPath = path.join(__dirname, '../data/venues-google-places.json');
    const outputPath = path.join(__dirname, '../data/venues-enhanced.json');

    console.log(`Reading from ${inputPath}...`);

    if (!fs.existsSync(inputPath)) {
        console.error("Input file not found!");
        return;
    }

    const venues = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    console.log(`Loaded ${venues.length} venues.`);

    let enhancedCount = 0;

    const enhancedVenues = venues.map(venue => {
        // Check if venue is in one of the target cities
        // The city field might be "New York, NY" or just "New York"
        const isTargetCity = TARGET_CITIES.some(target =>
            venue.city === target || (venue.address && venue.address.includes(target.split(',')[0]))
        );

        if (isTargetCity) {
            enhancedCount++;

            // 1. Better Images
            const sportImages = SPORT_IMAGES[venue.sport] || SPORT_IMAGES["All"];
            const newImages = [
                getRandomExample(sportImages),
                getRandomExample(sportImages),
                getRandomExample(SPORT_IMAGES["All"])
            ];

            // 2. Rich Amenities
            // Randomly pick 3-5 amenities
            const numAmenities = Math.floor(Math.random() * 3) + 3;
            const myAmenities = [];
            while (myAmenities.length < numAmenities) {
                const am = getRandomExample(AMENITIES_LIST);
                if (!myAmenities.includes(am)) myAmenities.push(am);
            }

            // 3. Boost Rating
            const premiumRating = (4.0 + Math.random()).toFixed(1); // 4.0 - 5.0
            const premiumReviews = Math.floor(Math.random() * 100) + 20;

            // 4. Bookable Status (20% chance)
            const isBookable = Math.random() > 0.8;

            // 5. Crowd Level (Mock)
            const crowdLevels = ["quiet", "active", "busy", "packed"];
            const crowdLevel = crowdLevels[Math.floor(Math.random() * crowdLevels.length)];

            return {
                ...venue,
                images: newImages, // Override Google photos which might be broken/low res links
                photos: newImages,
                rating: parseFloat(premiumRating),
                reviewCount: premiumReviews,
                amenities: myAmenities,
                isBookable: isBookable,
                crowdLevel: crowdLevel,
                activePlayersNow: Math.floor(Math.random() * 20),
                // 6. Game Quality (Simplified 3-tier)
                gameQuality: ["Low", "Mediocre", "Good Runss"][Math.floor(Math.random() * 3)],
                isEnhanced: true
            };
        }
        return venue;
    });

    console.log(`Enhanced ${enhancedCount} venues in target cities.`);

    fs.writeFileSync(outputPath, JSON.stringify(enhancedVenues, null, 2));
    console.log(`Saved enhanced data to ${outputPath}`);
}

enhanceVenues();
