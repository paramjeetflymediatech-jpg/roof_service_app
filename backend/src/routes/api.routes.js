const express = require("express");
const router = express.Router();
const SeoMeta = require("../models/SeoMeta");
const blogController = require("../controllers/blog.controller");

// GET /api/seo/:pageName - Get SEO meta tags for a specific page
router.get("/seo/:pageName", async (req, res) => {
  try {
    const { pageName } = req.params;

    // const seoData = await SeoMeta.findOne({ pageName: pageName.toLowerCase() });
    const seoData = await SeoMeta.findOne({ pageName: pageName.toLowerCase() });
    console.log(seoData)

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
