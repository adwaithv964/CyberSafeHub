const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, trim: true },
    body: { type: String, required: true },
    excerpt: { type: String, default: '' },
    category: {
        type: String,
        enum: ['news', 'guide', 'privacy', 'announcement'],
        default: 'news'
    },
    author: { type: String, required: true }, // admin email
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    publishedAt: { type: Date, default: null },
    tags: [{ type: String }],
}, { timestamps: true });

// Auto-generate slug from title if not provided
articleSchema.pre('save', function (next) {
    if (!this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 80);
    }
    next();
});

articleSchema.index({ category: 1, status: 1 });
articleSchema.index({ publishedAt: -1 });

module.exports = mongoose.model('Article', articleSchema);
