const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    sourceFile: {
        path: { type: String, required: true },
        originalName: { type: String, required: true },
        size: { type: Number, required: true },
        mime: { type: String, required: true }
    },
    targetFormat: { type: String, required: true },
    status: {
        type: String,
        enum: ['queued', 'processing', 'completed', 'failed'],
        default: 'queued',
        index: true
    },
    progress: { type: Number, default: 0 },
    result: {
        path: String,
        filename: String,
        size: Number,
        mime: String
    },
    error: {
        message: String,
        code: String,
        details: mongoose.Schema.Types.Mixed
    },
    options: {
        preserveMetadata: { type: Boolean, default: true },
        quality: { type: String, enum: ['lossless', 'high', 'balanced'], default: 'lossless' }
    },
    createdAt: { type: Date, default: Date.now, expires: 3600 }, // Auto-cleanup after 1 hour
    startedAt: Date,
    completedAt: Date
});

// Update timestamps on status change
JobSchema.pre('save', function (next) {
    if (this.isModified('status')) {
        if (this.status === 'processing' && !this.startedAt) {
            this.startedAt = new Date();
        }
        if ((this.status === 'completed' || this.status === 'failed') && !this.completedAt) {
            this.completedAt = new Date();
        }
    }
    next();
});

module.exports = mongoose.model('Job', JobSchema);
