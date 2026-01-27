/**
 * Seed TEST12 Studio into Firestore using Admin SDK
 * Run from functions folder with: npx ts-node src/seed-test-studio.ts
 * Or: node --loader ts-node/esm src/seed-test-studio.ts
 */

const admin = require('firebase-admin');

// Initialize Admin SDK (uses default credentials in GCP or GOOGLE_APPLICATION_CREDENTIALS env)
if (!admin.apps.length) {
    admin.initializeApp({
        projectId: 'goodrunss-ai'
    });
}

const db = admin.firestore();

async function seedTestStudio() {
    console.log('🏢 Seeding TEST12 Studio to Firestore (Admin SDK)...');

    const studioId = 'test-studio-12';
    const studioData = {
        name: 'Test Studio 12',
        fullName: 'Test Studio 12 - Demo',
        brandColor: '#BCA18D',
        logoUrl: null,
        icon: 'sparkles',
        ownerId: 'test-owner',
        code: 'TEST12',  // This is what getStudioByCode looks for
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

        // Add some sample classes
        const classes = [
            {
                studioId,
                name: 'Morning Flow',
                instructor: 'Sarah Chen',
                dayOfWeek: 1,
                time: '7:00 AM',
                duration: 60,
                spots: 20,
                waitlistEnabled: true,
                description: 'Start your day with an energizing flow',
                price: 25
            },
            {
                studioId,
                name: 'Power Hour',
                instructor: 'Marcus Johnson',
                dayOfWeek: 2,
                time: '6:00 PM',
                duration: 60,
                spots: 15,
                waitlistEnabled: true,
                description: 'High-intensity training session',
                price: 30
            }
        ];

        for (const classData of classes) {
            await db.collection('imprint_classes').add({
                ...classData,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }
        console.log('✅ Added sample classes');

        return studioId;
    } catch (error) {
        console.error('❌ Error seeding studio:', error);
        throw error;
    }
}

// Run the seeding
seedTestStudio()
    .then((id) => {
        console.log('🎉 Done! Studio ID:', id);
        process.exit(0);
    })
    .catch((err) => {
        console.error('Failed:', err);
        process.exit(1);
    });
