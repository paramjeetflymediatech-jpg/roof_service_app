const express = require('express');
const router = express.Router();
const SeoMeta = require('../models/SeoMeta');

// GET /api/seo/:pageName - Get SEO meta tags for a specific page
router.get('/seo/:pageName', async (req, res) => {
    try {
        const { pageName } = req.params;

        const seoData = await SeoMeta.findOne({ pageName: pageName.toLowerCase() });

        if (!seoData) {
            return res.status(404).json({
                success: false,
                message: 'SEO data not found for this page',
            });
        }

        res.json({
            success: true,
            data: {
                pageTitle: seoData.pageTitle,
                metaDescription: seoData.metaDescription,
                metaRobots: seoData.metaRobots,
                ogTitle: seoData.ogTitle || seoData.pageTitle,
                ogDescription: seoData.ogDescription || seoData.metaDescription,
                ogImage: seoData.ogImage,
                canonicalUrl: seoData.canonicalUrl,
                schemaMarkup: seoData.schemaMarkup,
                googleAnalyticsId: seoData.googleAnalyticsId,
                googleTagManagerId: seoData.googleTagManagerId,
            },
        });
    } catch (error) {
        console.error('SEO API error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching SEO data',
        });
    }
});

module.exports = router;
