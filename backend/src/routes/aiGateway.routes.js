const express = require("express");
const router = express.Router();

const aiGatewayController = require("../controllers/aiGateway.controller");
const { verifyAiGatewayAuth } = require("../middlewares/aiGateway.middleware");

// Set CORS & JSON headers specifically for AI Gateway discovery
router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-KEY");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Discovery & Schema (Public endpoints for ChatGPT GPT Actions initialization)
router.get("/", aiGatewayController.getOverview);
router.get("/openapi.json", aiGatewayController.getOpenApiSpec);

// Authenticated AI Gateway v1 Routes
// SEO
router.get("/v1/seo", verifyAiGatewayAuth, aiGatewayController.getSeoSettings);
router.post("/v1/seo", verifyAiGatewayAuth, aiGatewayController.updateSeoSetting);
router.patch("/v1/seo", verifyAiGatewayAuth, aiGatewayController.updateSeoSetting);
router.delete("/v1/seo", verifyAiGatewayAuth, aiGatewayController.deleteSeoSetting);

// Blogs
router.get("/v1/blogs", verifyAiGatewayAuth, aiGatewayController.getBlogs);
router.post("/v1/blogs", verifyAiGatewayAuth, aiGatewayController.createOrUpdateBlog);
router.patch("/v1/blogs", verifyAiGatewayAuth, aiGatewayController.createOrUpdateBlog);
router.delete("/v1/blogs", verifyAiGatewayAuth, aiGatewayController.deleteBlog);

// Services
router.get("/v1/services", verifyAiGatewayAuth, aiGatewayController.getServices);
router.post("/v1/services", verifyAiGatewayAuth, aiGatewayController.createOrUpdateService);
router.patch("/v1/services", verifyAiGatewayAuth, aiGatewayController.createOrUpdateService);
router.delete("/v1/services", verifyAiGatewayAuth, aiGatewayController.deleteService);

// Service Locations (Localized City Pages)
router.get("/v1/service-locations", verifyAiGatewayAuth, aiGatewayController.getServiceLocations);
router.post("/v1/service-locations", verifyAiGatewayAuth, aiGatewayController.createOrUpdateServiceLocation);
router.patch("/v1/service-locations", verifyAiGatewayAuth, aiGatewayController.createOrUpdateServiceLocation);
router.post("/v1/service-locations/sync-canonicals", verifyAiGatewayAuth, aiGatewayController.syncServiceLocationCanonicals);
router.delete("/v1/service-locations", verifyAiGatewayAuth, aiGatewayController.deleteServiceLocation);

module.exports = router;
