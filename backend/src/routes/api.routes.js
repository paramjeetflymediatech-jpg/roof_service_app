const express = require("express");
const router = express.Router();
const SeoMeta = require("../models/SeoMeta");
const blogController = require("../controllers/blog.controller");

// GET /api/seo/:pageName - Get SEO meta tags for a specific page
router.get("/seo/:pageName", async (req, res) => {
  try {
    const { pageName } = req.params;

    const seoData = await SeoMeta.findOne({
      where: {
        pageName: pageName.toLowerCase(),
      },
    });

    const globalSeo = await SeoMeta.findOne({
      where: {
        pageName: "global",
      },
    });

    const globalHeaderScripts = globalSeo ? globalSeo.headerScripts : "";

    if (!seoData) {
      return res.status(200).json({
        success: true,
        data: {
          globalHeaderScripts,
        },
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
        schemaMarkup:globalSeo?.schemaMarkup || seoData.schemaMarkup,
        headerScripts: seoData.headerScripts || "",
        globalHeaderScripts: globalHeaderScripts || "",
        googleAnalyticsId: globalSeo?.googleAnalyticsId || seoData.googleAnalyticsId,
        googleTagManagerId: globalSeo?.googleTagManagerId || seoData.googleTagManagerId,
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
