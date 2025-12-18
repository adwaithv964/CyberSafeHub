const mongoose = require('mongoose');

const SecretSchema = new mongoose.Schema({
    encryptedData: {
        type: String,
        required: true
    },
    // We store a hash of the key/password. 
    // The client sends the key/password, we hash it and compare.
    // If it matches, we return the data and DELETE the record.
    authHash: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400 // Hard limit: Auto-delete after 24 hours if not viewed
    }
});

module.exports = mongoose.model('Secret', SecretSchema);
