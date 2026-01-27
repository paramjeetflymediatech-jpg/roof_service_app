const mongoose = require('mongoose');

const SeoMetaSchema = new mongoose.Schema(
    {
        pageName: {
            type: String,
            required: [true, 'Page name is required'],
            unique: true,
            trim: true,
            lowercase: true,
        },
        pageTitle: {
            type: String,
            required: [true, 'Page title is required'],
            trim: true,
            maxlength: [100, 'Page title cannot exceed 100 characters'],
        },
        metaDescription: {
            type: String,
            required: [true, 'Meta description is required'],
            trim: true,
            maxlength: [200, 'Meta description cannot exceed 200 characters'],
        },
        metaRobots: {
            type: String,
            default: 'index, follow',
            trim: true,
        },
        ogTitle: {
            type: String,
            trim: true,
            maxlength: [100, 'OG title cannot exceed 100 characters'],
        },
        ogDescription: {
            type: String,
            trim: true,
            maxlength: [200, 'OG description cannot exceed 200 characters'],
        },
        ogImage: {
            type: String,
            trim: true,
        },
        canonicalUrl: {
            type: String,
            trim: true,
        },
        schemaMarkup: {
            type: String,
            trim: true,
        },
        googleAnalyticsId: {
            type: String,
            trim: true,
        },
        googleTagManagerId: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('SeoMeta', SeoMetaSchema);
