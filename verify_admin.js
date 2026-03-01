import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

const app = initializeApp({
    credential: cert(serviceAccount)
});

const auth = getAuth(app);
const db = getFirestore(app);

async function verifyAdmin() {
    const email = 'admin@cybersafehub.com';
    const newPassword = 'admin123';

    try {
        let user;
        try {
            user = await auth.getUserByEmail(email);
            console.log('User found in Firebase Auth:', user.uid);
            await auth.updateUser(user.uid, { password: newPassword });
            console.log('Password updated successfully.');
        } catch (err) {
            if (err.code === 'auth/user-not-found') {
                user = await auth.createUser({
                    email: email,
                    password: newPassword,
                    emailVerified: true
                });
                console.log('User created in Firebase Auth:', user.uid);
            } else {
                throw err;
            }
        }

        // Ensure they are in the admins collection
        await db.collection('admins').doc(user.uid).set({
            email: user.email,
            role: 'super_admin',
            updatedAt: new Date()
        }, { merge: true });
        console.log('Admin document verified in Firestore admins collection.');

    } catch (err) {
        console.error('Error:', err);
    }
}

verifyAdmin();
