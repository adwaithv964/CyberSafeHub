const mongoose = require('mongoose');

const cyberToolSchema = new mongoose.Schema({
    // Display
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    icon: { type: String, default: 'tool' },          // Icon.jsx icon name
    emoji: { type: String, default: '' },              // Optional emoji override
    color: { type: String, default: 'cyan' },          // tailwind colour word: cyan, purple, blue, green...

    // Routing
    route: { type: String, required: true, trim: true }, // e.g. /tools/metadata-washer
    isExternal: { type: Boolean, default: false },            // open in new tab if true

    // Management
    category: { type: String, default: 'utility', enum: ['scanner', 'osint', 'privacy', 'converter', 'ai', 'utility', 'crypto'] },
    isActive: { type: Boolean, default: true },            // show/hide without deleting
    isBuiltIn: { type: Boolean, default: false },           // built-in tools cannot be deleted
    order: { type: Number, default: 0 },                // display sort order (lower = first)
    badge: { type: String, default: '' },               // optional badge text e.g. "NEW", "AI"
    usageCount: { type: Number, default: 0 },                // incremented when tool is opened
}, { timestamps: true });

cyberToolSchema.index({ order: 1, isActive: 1 });

module.exports = mongoose.model('CyberTool', cyberToolSchema);
