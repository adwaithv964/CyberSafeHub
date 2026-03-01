const mongoose = require('mongoose');
const Admin = require('./server/models/Admin');
require('dotenv').config({ path: '.env' });

async function seedAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB via connect string.');

        const email = 'admin@cybersafehub.com';

        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            console.log('Admin already exists in MongoDB:', existingAdmin);
        } else {
            const newAdmin = new Admin({ email, role: 'super_admin' });
            await newAdmin.save();
            console.log('Successfully created admin in MongoDB:', newAdmin);
        }
    } catch (err) {
        console.error('Error during seeding admin:', err);
    } finally {
        mongoose.connection.close();
    }
}

seedAdmin();
