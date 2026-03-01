/**
 * seedAcademyModules.js
 * Seeds the 5 built-in interactive Cyber Academy modules into MongoDB.
 * Safe to call on every server start — upserts by route ID so it's idempotent.
 */
const AcademyModule = require('../models/AcademyModule');

const BUILT_IN_MODULES = [
    { route: 'phishing', title: 'Phishing Simulation', description: 'Train your eyes to spot fake emails, sketchy links, and CEO fraud.', icon: '🎣', category: 'Phishing', difficulty: 'beginner', order: 1, published: true, isBuiltIn: true },
    { route: 'cracker', title: 'Password Cracker', description: 'Visualize how fast a hacker can brute-force your passwords.', icon: '🔓', category: 'Fundamentals', difficulty: 'beginner', order: 2, published: true, isBuiltIn: true },
    { route: 'crypto', title: 'Encryption Lab', description: 'Experiment with Caesar Ciphers, AES, and Hashing algorithms.', icon: '🔐', category: 'Cryptography', difficulty: 'intermediate', order: 3, published: true, isBuiltIn: true },
    { route: 'stego', title: 'Steganography Studio', description: 'Learn how to hide secret messages inside standard image files.', icon: '🖼️', category: 'Privacy', difficulty: 'intermediate', order: 4, published: true, isBuiltIn: true },
    { route: 'incident', title: 'Incident Response RPG', description: 'Simulate a live cyber attack. You are the Admin. Can you save the servers?', icon: '⚔️', category: 'Incident Response', difficulty: 'advanced', order: 5, published: true, isBuiltIn: true },
];

async function seedAcademyModules() {
    try {
        for (const m of BUILT_IN_MODULES) {
            await AcademyModule.findOneAndUpdate(
                { route: m.route },
                m,
                { upsert: true, setDefaultsOnInsert: true }
            );
        }
        console.log(`[Academy] Seeded ${BUILT_IN_MODULES.length} built-in academy modules.`);
    } catch (err) {
        console.error('[Academy] Seed error:', err.message);
    }
}

module.exports = seedAcademyModules;
