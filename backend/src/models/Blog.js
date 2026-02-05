const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    content: {
        type: String, // Can store HTML or Markdown
        required: true
    },
    excerpt: {
        type: String,
        trim: true
    },
    image: {
        type: String, // URL to the image
        default: ''
    },
    author: {
        type: String,
        default: 'Admin'
    },
    tags: [{
        type: String,
        trim: true
    }],
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'published'
    },
    metaTitle: String,
    metaDescription: String,
    metaRobots: {
        type: String,
        default: 'index, follow',
        trim: true
    },
    ogTitle: {
        type: String,
        trim: true
    },
    ogDescription: {
        type: String,
        trim: true
    },
    ogImage: {
        type: String,
        trim: true
    },
    canonicalUrl: {
        type: String,
        trim: true
    },
    schemaMarkup: {
        type: String, // Stored as stringified JSON
        trim: true
    },
    googleAnalyticsId: {
        type: String,
        trim: true
    },
    googleTagManagerId: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Blog', blogSchema);
