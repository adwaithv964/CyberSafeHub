const mongoose = require('mongoose');

const VaultItemSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    type: {
        type: String,
        required: true,
        enum: ['login', 'card', 'identity', 'note']
    },
    name: {
        type: String,
        required: true
    },
    // We will store the main content as a JSON string or individual fields.
    // For simplicity in this structure, we'll use flexible 'data' object.
    // In a real app, this entire 'data' object should be encrypted client-side or server-side.
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('VaultItem', VaultItemSchema);
