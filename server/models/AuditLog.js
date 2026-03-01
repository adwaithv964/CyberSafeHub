const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    adminEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    action: {
        type: String,
        required: true,
        // e.g. 'USER_DISABLED', 'USER_ENABLED', 'THREAT_DELETED', 'ANNOUNCEMENT_CREATED', 'ANNOUNCEMENT_DELETED', 'ADMIN_LOGIN'
    },
    target: {
        type: String, // UID, threat ID, announcement ID, etc.
        default: null
    },
    details: {
        type: String, // Human-readable detail
        default: null
    },
    ip: {
        type: String,
        default: null
    }
}, { timestamps: true });

// Auto-delete after 90 days
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
