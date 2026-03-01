const mongoose = require('mongoose');

const threatLogSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['malware', 'phishing'],
        required: true,
        index: true
    },
    target: {
        type: String, // e.g., filename or URL
        required: true
    },
    details: {
        type: [String], // Array of threat names/signatures
        default: []
    },
    timestamp: {
        type: Date,
        default: Date.now,
        expires: 2592000 // Automatically delete after 30 days (optional, keeps db clean)
    }
}, { timestamps: true });

module.exports = mongoose.model('ThreatLog', threatLogSchema);
