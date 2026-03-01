const admin = require('firebase-admin');
require('dotenv').config({ path: '../.env' });

const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '')
    : undefined;

if (!privateKey) {
    console.error("FIREBASE_PRIVATE_KEY is missing from .env");
    process.exit(1);
}

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
    })
});

const db = admin.firestore();

async function seedAdmin() {
    const adminEmail = 'admin@cybersafehub.com';
    const adminPassword = 'admin123';
    let userRecord;

    try {
        console.log(`Checking if user ${adminEmail} exists...`);
        userRecord = await admin.auth().getUserByEmail(adminEmail);
        console.log(`User found with UID: ${userRecord.uid}`);
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            console.log(`User not found. Creating new admin user...`);
            try {
                userRecord = await admin.auth().createUser({
                    email: adminEmail,
                    password: adminPassword,
                    displayName: 'System Administrator',
                });
                console.log(`Successfully created new user with UID: ${userRecord.uid}`);
            } catch (createError) {
                console.error("Error creating user:", createError);
                process.exit(1);
            }
        } else {
            console.error("Error fetching user:", error);
            process.exit(1);
        }
    }

    // Set custom claims (optional, but good for security rules)
    await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
    console.log(`Custom claims set for UID: ${userRecord.uid}`);

    // Add to 'admins' Firestore collection
    const adminRef = db.collection('admins').doc(userRecord.uid);
    await adminRef.set({
        email: adminEmail,
        role: 'super_admin',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    console.log(`Admin document created/updated in Firestore for ${adminEmail} with role 'super_admin'`);
    console.log("Seeding complete!");
    process.exit(0);
}

seedAdmin();
