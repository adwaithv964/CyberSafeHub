const mongoose = require('mongoose');

const academyModuleSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    icon: { type: String, default: '📚' },          // emoji or icon name
    category: { type: String, default: 'Fundamentals' },
    difficulty: { type: String, default: 'beginner', enum: ['beginner', 'intermediate', 'advanced'] },
    route: { type: String, default: '' },             // e.g. 'phishing', 'cracker' — maps to interactive component
    published: { type: Boolean, default: false },
    isBuiltIn: { type: Boolean, default: false },        // built-in modules cannot be deleted
    order: { type: Number, default: 0 },
    usageCount: { type: Number, default: 0 },
}, { timestamps: true });

academyModuleSchema.index({ published: 1, order: 1 });

module.exports = mongoose.model('AcademyModule', academyModuleSchema);
