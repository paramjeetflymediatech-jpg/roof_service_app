const express = require("express");
const router = express.Router();
const SeoMeta = require("../models/SeoMeta");
const blogController = require("../controllers/blog.controller");

// GET /api/seo/* - Get SEO meta tags for a specific page (supports nested paths)
router.get("/seo/*", async (req, res) => {
  try {
    // Extract everything after /seo/
    const pagePath = req.params[0];

    if (!pagePath) {
      return res.status(400).json({
        success: false,
        message: "Page path is required",
      });
    }

    const seoData = await SeoMeta.findOne({
      where: {
        pageName: pagePath.toLowerCase(),
      },
    });

    if (!seoData) {
      return res.status(200).json({
        success: true,
        data: {},
        message: "SEO data not found for this page",
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
    console.error("SEO API error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching SEO data",
    });
  }
});

// Blog API routes
router.get("/blogs", blogController.getApiList);
router.get("/blogs/:slug", blogController.getApiDetail);

module.exports = router;
