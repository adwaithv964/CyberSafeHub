const mongoose = require('mongoose');

const platformStatSchema = new mongoose.Schema({
    date: {
        type: String, // YYYY-MM-DD format
        required: true,
        unique: true,
        index: true
    },
    filesCleaned: {
        type: Number,
        default: 0
    },
    pdfsConverted: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('PlatformStat', platformStatSchema);
