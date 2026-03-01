const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    role: {
        type: String,
        enum: ['super_admin', 'analyst', 'content_manager', 'support'],
        default: 'super_admin'
    }
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);
