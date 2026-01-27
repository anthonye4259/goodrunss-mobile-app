/**
 * Seed TEST12 Studio using Firebase Admin SDK
 * Run from functions directory: node seed-test-studio.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin (uses default credentials from gcloud auth)
if (!admin.apps.length) {
    admin.initializeApp({
        projectId: 'goodrunss-ai'
    });
}

const db = admin.firestore();

async function seedTestStudio() {
    console.log('🏢 Seeding TEST12 Studio to Firestore...');

    const studioId = 'test-studio-12';
    const studioData = {
        name: 'Test Studio 12',
        fullName: 'Test Studio 12 - Demo',
        brandColor: '#BCA18D',
        logoUrl: null,
        icon: 'sparkles',
        ownerId: 'test-owner',
        code: 'TEST12',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        theme: 'dark',
        industryType: 'fitness',
        settings: {
            cancellationWindow: 24,
            lateFee: 10,
            waitlistSize: 5
        },
        buttonStyle: 'rounded',
        cardStyle: 'glass',
        typography: 'modern',
        template: 'modern',
        colors: {
            primary: '#BCA18D',
            background: '#121212',
            text: '#FFFFFF',
            accent: '#D4AF37'
        },
        tabs: [
            { id: 'home', label: 'Home', icon: 'home', order: 0, isEnabled: true },
            { id: 'schedule', label: 'Schedule', icon: 'calendar', order: 1, isEnabled: true },
            { id: 'shop', label: 'Shop', icon: 'cart', order: 2, isEnabled: true },
            { id: 'bookings', label: 'Bookings', icon: 'person', order: 3, isEnabled: true },
            { id: 'videos', label: 'Library', icon: 'play-circle', order: 4, isEnabled: true },
        ]
    };

    try {
        // Check if already exists
        const existing = await db.collection('imprint_studios')
            .where('code', '==', 'TEST12')
            .limit(1)
            .get();

        if (!existing.empty) {
            console.log('✅ TEST12 studio already exists:', existing.docs[0].id);
            return existing.docs[0].id;
        }

        // Create new
        await db.collection('imprint_studios').doc(studioId).set(studioData);
        console.log('✅ Created TEST12 studio with ID:', studioId);

        // Add sample classes
        const classes = [
            {
                studioId,
                name: 'Morning Flow',
                instructor: 'Sarah Chen',
                dayOfWeek: new Date().getDay(), // Today
                time: '7:00 AM',
                duration: 60,
                maxSpots: 20,
                bookedSpots: 5,
                category: 'yoga',
                description: 'Start your day with an energizing flow',
                price: 1
            },
            {
                studioId,
                name: 'Power Hour',
                instructor: 'Marcus Johnson',
                dayOfWeek: new Date().getDay(), // Today
                time: '6:00 PM',
                duration: 60,
                maxSpots: 15,
                bookedSpots: 8,
                category: 'strength',
                description: 'High-intensity training session',
                price: 1
            },
            {
                studioId,
                name: 'Evening Stretch',
                instructor: 'Lisa Wang',
                dayOfWeek: new Date().getDay(), // Today
                time: '8:00 PM',
                duration: 45,
                maxSpots: 25,
                bookedSpots: 3,
                category: 'flexibility',
                description: 'Unwind with gentle stretching',
                price: 1
            }
        ];

        for (const classData of classes) {
            await db.collection('imprint_classes').add({
                ...classData,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log('  → Added class:', classData.name);
        }

        // Add sample plans
        const plans = [
            {
                studioId,
                name: 'Drop-In Class',
                type: 'drop_in',
                price: 25,
                credits: 1,
                description: 'Single class visit'
            },
            {
                studioId,
                name: '10-Class Pack',
                type: 'class_pack',
                price: 200,
                credits: 10,
                description: 'Save 20% with our class pack'
            },
            {
                studioId,
                name: 'Unlimited Monthly',
                type: 'membership',
                price: 149,
                credits: 999,
                interval: 'monthly',
                description: 'Unlimited classes every month'
            }
        ];

        for (const plan of plans) {
            await db.collection('imprint_plans').add({
                ...plan,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log('  → Added plan:', plan.name);
        }

        return studioId;
    } catch (error) {
        console.error('❌ Error seeding studio:', error);
        throw error;
    }
}

// Run
seedTestStudio()
    .then((id) => {
        console.log('🎉 Done! Studio ID:', id);
        process.exit(0);
    })
    .catch((err) => {
        console.error('Failed:', err);
        process.exit(1);
    });
