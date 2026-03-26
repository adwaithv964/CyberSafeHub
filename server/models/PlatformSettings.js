const mongoose = require('mongoose');

const platformSettingsSchema = new mongoose.Schema({
    // Only one document should exist for these settings
    settingsKey: { type: String, default: 'global', unique: true },
    
    // Contains flags where TRUE = Accessible (Active), FALSE = Maintenance Mode
    maintenanceData: {
        type: Map,
        of: Boolean,
        default: {
            'network': true,
            'scanners': true,
            'scanners_malware': true,
            'scanners_phishing': true,
            'scanners_breach': true,
            'vault': true,
            'assistant': true,
            'healthcheck': true,
            'tools': true,
            'tools_metadata': true,
            'tools_wifi': true,
            'tools_share': true,
            'tools_converter': true,
            'tools_auditor': true,
            'tools_policy': true,
            'academy': true,
            'academy_phishing': true,
            'academy_cracker': true,
            'academy_crypto': true,
            'academy_stego': true,
            'academy_incident': true,
            'news': true,
            'privacy': true,
            'emergency': true
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('PlatformSettings', platformSettingsSchema);
