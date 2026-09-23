const { Op } = require("sequelize");
const { SeoMeta, Blog, Service, Location, LocationService, ServiceCategory } = require("../models");

/**
 * Helper to get active server base URL
 */
const getBaseUrl = (req) => {
  const forwardedProto = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost:5001";
  return `${forwardedProto}://${host}`;
};

/**
 * GET /api/ai-gateway
 * Overview and operational status
 */
exports.getOverview = async (req, res) => {
  res.json({
    success: true,
    name: "Mainstreet Roofing AI Gateway",
    version: "1.0.0",
    description: "AI-friendly Gateway for ChatGPT Custom GPT Actions to manage SEO, Blogs, Services, and Location landing pages.",
    openApiSpecUrl: `${getBaseUrl(req)}/api/ai-gateway/openapi.json`,
    endpoints: [
      { path: "/api/ai-gateway/openapi.json", method: "GET", description: "OpenAPI 3.0.0 specification for ChatGPT Actions" },
      { path: "/api/ai-gateway/v1/seo", methods: ["GET", "POST", "PATCH", "DELETE"], description: "Manage Page SEO and Meta Tags" },
      { path: "/api/ai-gateway/v1/blogs", methods: ["GET", "POST", "PATCH", "DELETE"], description: "Manage SEO Blog Articles" },
      { path: "/api/ai-gateway/v1/services", methods: ["GET", "POST", "PATCH", "DELETE"], description: "Manage Roofing Services" },
      { path: "/api/ai-gateway/v1/service-locations", methods: ["GET", "POST", "PATCH", "DELETE"], description: "Manage Location-Specific Service Landing Pages" },
      { path: "/api/ai-gateway/v1/service-locations/sync-canonicals", methods: ["POST"], description: "Batch Sync Location Canonicals" },
    ],
  });
};

/**
 * GET /api/ai-gateway/openapi.json
 * OpenAPI 3.0.0 Specification for OpenAI Custom GPT Actions
 */
exports.getOpenApiSpec = async (req, res) => {
  const baseUrl = getBaseUrl(req);

  const spec = {
    openapi: "3.1.0",
    info: {
      title: "Mainstreet Roofing AI Gateway API",
      version: "1.0.0",
      description: "API Gateway allowing ChatGPT and autonomous agents to manage SEO metadata, blogs, services, and location-specific pages.",
    },
    servers: [
      {
        url: "https://api.mainstreet-roofing.ca",
        description: "Mainstreet Roofing Production API",
      },
    ],
    paths: {
      "/api/ai-gateway/v1/seo": {
        get: {
          operationId: "getSeoSettings",
          summary: "Get SEO metadata for all pages or a specific page",
          parameters: [
            {
              name: "page_name",
              in: "query",
              required: false,
              schema: { type: "string" },
              description: "Page route name (e.g. 'global', '/', '/about', '/services', '/services/roof-repairs', etc.)",
            },
            {
              name: "search",
              in: "query",
              required: false,
              schema: { type: "string" },
              description: "Search keyword for page title or route",
            },
            {
              name: "page",
              in: "query",
              required: false,
              schema: { type: "integer", default: 1 },
              description: "Page number for pagination",
            },
            {
              name: "limit",
              in: "query",
              required: false,
              schema: { type: "integer", default: 50 },
              description: "Items per page",
            },
          ],
          responses: {
            "200": {
              description: "SEO metadata response",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/SeoResponse" },
                },
              },
            },
          },
        },
        post: {
          operationId: "updateSeoSetting",
          summary: "Create or update SEO metadata for a page route",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SeoUpsertRequest" },
              },
            },
          },
          responses: {
            "200": {
              description: "SEO setting successfully created or updated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/StandardSuccessResponse" },
                },
              },
            },
          },
        },
        patch: {
          operationId: "patchSeoSetting",
          summary: "Partially update SEO metadata for a page route",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SeoUpsertRequest" },
              },
            },
          },
          responses: {
            "200": {
              description: "SEO setting updated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/StandardSuccessResponse" },
                },
              },
            },
          },
        },
        delete: {
          operationId: "deleteSeoSetting",
          summary: "Delete SEO metadata record by page_name or ID",
          parameters: [
            {
              name: "page_name",
              in: "query",
              required: false,
              schema: { type: "string" },
            },
            {
              name: "id",
              in: "query",
              required: false,
              schema: { type: "integer" },
            },
          ],
          responses: {
            "200": {
              description: "SEO setting deleted",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/StandardSuccessResponse" },
                },
              },
            },
          },
        },
      },
      "/api/ai-gateway/v1/blogs": {
        get: {
          operationId: "getBlogs",
          summary: "List blogs or retrieve a single blog post by slug or ID",
          parameters: [
            {
              name: "slug",
              in: "query",
              required: false,
              schema: { type: "string" },
              description: "Blog slug to fetch a specific post",
            },
            {
              name: "id",
              in: "query",
              required: false,
              schema: { type: "integer" },
              description: "Blog ID",
            },
            {
              name: "search",
              in: "query",
              required: false,
              schema: { type: "string" },
              description: "Search in blog title or content",
            },
            {
              name: "status",
              in: "query",
              required: false,
              schema: { type: "string", enum: ["published", "draft", "all"] },
              description: "Filter by status",
            },
            {
              name: "page",
              in: "query",
              required: false,
              schema: { type: "integer", default: 1 },
            },
            {
              name: "limit",
              in: "query",
              required: false,
              schema: { type: "integer", default: 20 },
            },
          ],
          responses: {
            "200": {
              description: "Blog list or details response",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/BlogResponse" },
                },
              },
            },
          },
        },
        post: {
          operationId: "createOrUpdateBlog",
          summary: "Create or update a blog post with rich content and SEO tags",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BlogUpsertRequest" },
              },
            },
          },
          responses: {
            "200": {
              description: "Blog created or updated successfully",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/StandardSuccessResponse" },
                },
              },
            },
          },
        },
        patch: {
          operationId: "patchBlog",
          summary: "Partially update blog post",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BlogUpsertRequest" },
              },
            },
          },
          responses: {
            "200": {
              description: "Blog updated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/StandardSuccessResponse" },
                },
              },
            },
          },
        },
        delete: {
          operationId: "deleteBlog",
          summary: "Delete a blog post by slug or ID",
          parameters: [
            {
              name: "slug",
              in: "query",
              required: false,
              schema: { type: "string" },
            },
            {
              name: "id",
              in: "query",
              required: false,
              schema: { type: "integer" },
            },
          ],
          responses: {
            "200": {
              description: "Blog deleted",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/StandardSuccessResponse" },
                },
              },
            },
          },
        },
      },
      "/api/ai-gateway/v1/services": {
        get: {
          operationId: "getServices",
          summary: "List all roofing services or retrieve a single service",
          parameters: [
            {
              name: "slug",
              in: "query",
              required: false,
              schema: { type: "string" },
              description: "Service slug (e.g. 'torch-on-roofing', 'metal-roofing', 'roof-repairs')",
            },
            {
              name: "id",
              in: "query",
              required: false,
              schema: { type: "integer" },
            },
            {
              name: "status",
              in: "query",
              required: false,
              schema: { type: "string", enum: ["published", "draft", "all"] },
            },
          ],
          responses: {
            "200": {
              description: "List of services or service details",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ServiceResponse" },
                },
              },
            },
          },
        },
        post: {
          operationId: "createOrUpdateService",
          summary: "Create or update a service description and SEO settings",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ServiceUpsertRequest" },
              },
            },
          },
          responses: {
            "200": {
              description: "Service saved successfully",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/StandardSuccessResponse" },
                },
              },
            },
          },
        },
        patch: {
          operationId: "patchService",
          summary: "Partially update a service",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ServiceUpsertRequest" },
              },
            },
          },
          responses: {
            "200": {
              description: "Service updated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/StandardSuccessResponse" },
                },
              },
            },
          },
        },
        delete: {
          operationId: "deleteService",
          summary: "Delete a service by slug or ID",
          parameters: [
            {
              name: "slug",
              in: "query",
              required: false,
              schema: { type: "string" },
            },
            {
              name: "id",
              in: "query",
              required: false,
              schema: { type: "integer" },
            },
          ],
          responses: {
            "200": {
              description: "Service deleted",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/StandardSuccessResponse" },
                },
              },
            },
          },
        },
      },
      "/api/ai-gateway/v1/service-locations": {
        get: {
          operationId: "getServiceLocations",
          summary: "List all location-specific service pages (e.g. roof-repairs-in-abbotsford) or filter by city",
          parameters: [
            {
              name: "slug",
              in: "query",
              required: false,
              schema: { type: "string" },
              description: "Composite slug like 'roof-repairs-in-abbotsford' or 'torch-on-roofing-in-vancouver'",
            },
            {
              name: "service_slug",
              in: "query",
              required: false,
              schema: { type: "string" },
              description: "Filter by base service slug",
            },
            {
              name: "location_slug",
              in: "query",
              required: false,
              schema: { type: "string" },
              description: "Filter by city/location slug (e.g. 'abbotsford', 'vancouver', 'burnaby')",
            },
            {
              name: "include_locations_list",
              in: "query",
              required: false,
              schema: { type: "boolean" },
              description: "If true, also includes the list of all available city locations",
            },
          ],
          responses: {
            "200": {
              description: "Service locations list or item",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ServiceLocationResponse" },
                },
              },
            },
          },
        },
        post: {
          operationId: "createOrUpdateServiceLocation",
          summary: "Create or update unique localized content for a service in a specific city",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ServiceLocationUpsertRequest" },
              },
            },
          },
          responses: {
            "200": {
              description: "Service location updated successfully",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/StandardSuccessResponse" },
                },
              },
            },
          },
        },
        patch: {
          operationId: "patchServiceLocation",
          summary: "Partially update unique localized content for a service location",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ServiceLocationUpsertRequest" },
              },
            },
          },
          responses: {
            "200": {
              description: "Service location updated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/StandardSuccessResponse" },
                },
              },
            },
          },
        },
        delete: {
          operationId: "deleteServiceLocation",
          summary: "Remove location service association",
          parameters: [
            {
              name: "slug",
              in: "query",
              required: false,
              schema: { type: "string" },
            },
            {
              name: "service_slug",
              in: "query",
              required: false,
              schema: { type: "string" },
            },
            {
              name: "location_slug",
              in: "query",
              required: false,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "Service location association removed",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/StandardSuccessResponse" },
                },
              },
            },
          },
        },
      },
      "/api/ai-gateway/v1/service-locations/sync-canonicals": {
        post: {
          operationId: "syncServiceLocationCanonicals",
          summary: "Batch sync all service-location canonical URLs to standard format",
          responses: {
            "200": {
              description: "Batch synchronization result",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/StandardSuccessResponse" },
                },
              },
            },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "API-Key",
          description: "Provide AI_GATEWAY_SECRET_KEY as Bearer Token",
        },
      },
      schemas: {
        StandardSuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            data: { type: "object" },
          },
        },
        SeoItem: {
          type: "object",
          properties: {
            id: { type: "integer" },
            pageName: { type: "string", description: "Page route identifier (e.g. 'global', '/', '/about', '/services/torch-on-roofing')" },
            pageTitle: { type: "string", description: "Meta title tag (max 100 chars)" },
            metaDescription: { type: "string", description: "Meta description tag (max 200 chars)" },
            metaRobots: { type: "string", default: "index, follow" },
            ogTitle: { type: "string" },
            ogDescription: { type: "string" },
            ogImage: { type: "string" },
            keywords: { type: "string", description: "Comma-separated keywords" },
            canonicalUrl: { type: "string" },
            schemaMarkup: { type: "string", description: "JSON-LD schema markup string" },
            headerScripts: { type: "string", description: "Custom HTML/script tags for <head>" },
            faqSchema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  answer: { type: "string" },
                },
              },
            },
            googleAnalyticsId: { type: "string" },
            googleTagManagerId: { type: "string" },
          },
        },
        SeoResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            total: { type: "integer" },
            data: {
              oneOf: [
                { $ref: "#/components/schemas/SeoItem" },
                {
                  type: "array",
                  items: { $ref: "#/components/schemas/SeoItem" },
                },
              ],
            },
          },
        },
        SeoUpsertRequest: {
          type: "object",
          required: ["pageName", "pageTitle", "metaDescription"],
          properties: {
            pageName: { type: "string", description: "Unique page identifier or route (e.g. 'global', '/', '/about', '/services', '/services/torch-on-roofing', etc.)" },
            pageTitle: { type: "string", description: "SEO Page Title" },
            metaDescription: { type: "string", description: "SEO Meta Description" },
            metaRobots: { type: "string", default: "index, follow" },
            ogTitle: { type: "string" },
            ogDescription: { type: "string" },
            ogImage: { type: "string" },
            keywords: { type: "string" },
            canonicalUrl: { type: "string" },
            schemaMarkup: { type: "string" },
            headerScripts: { type: "string" },
            faqSchema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  answer: { type: "string" },
                },
              },
            },
            googleAnalyticsId: { type: "string" },
            googleTagManagerId: { type: "string" },
          },
        },
        BlogItem: {
          type: "object",
          properties: {
            id: { type: "integer" },
            title: { type: "string" },
            slug: { type: "string" },
            content: { type: "string", description: "Full HTML content of the article" },
            excerpt: { type: "string", description: "Brief 1-2 sentence summary" },
            image: { type: "string", description: "Featured image URL" },
            author: { type: "string", default: "Admin" },
            tags: { type: "array", items: { type: "string" } },
            status: { type: "string", enum: ["published", "draft"] },
            metaTitle: { type: "string" },
            metaDescription: { type: "string" },
            metaRobots: { type: "string" },
            ogTitle: { type: "string" },
            ogDescription: { type: "string" },
            ogImage: { type: "string" },
            canonicalUrl: { type: "string" },
            schemaMarkup: { type: "string" },
            createdAt: { type: "string" },
            updatedAt: { type: "string" },
          },
        },
        BlogResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            total: { type: "integer" },
            page: { type: "integer" },
            pages: { type: "integer" },
            data: {
              oneOf: [
                { $ref: "#/components/schemas/BlogItem" },
                {
                  type: "array",
                  items: { $ref: "#/components/schemas/BlogItem" },
                },
              ],
            },
          },
        },
        BlogUpsertRequest: {
          type: "object",
          required: ["title"],
          properties: {
            id: { type: "integer" },
            title: { type: "string", description: "Blog title" },
            slug: { type: "string", description: "Unique URL slug (kebab-case)" },
            content: { type: "string", description: "Formatted HTML content with <h2>, <h3>, <p>, <ul>, <li>, <strong>" },
            excerpt: { type: "string", description: "Short summary for cards and search results" },
            image: { type: "string", description: "Featured image URL" },
            author: { type: "string", default: "Admin" },
            tags: { type: "array", items: { type: "string" }, description: "Tags list" },
            status: { type: "string", enum: ["published", "draft"], default: "published" },
            metaTitle: { type: "string" },
            metaDescription: { type: "string" },
            metaRobots: { type: "string", default: "index, follow" },
            ogTitle: { type: "string" },
            ogDescription: { type: "string" },
            ogImage: { type: "string" },
            canonicalUrl: { type: "string" },
            schemaMarkup: { type: "string" },
          },
        },
        ServiceItem: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            slug: { type: "string" },
            shortDescription: { type: "string" },
            longDescription: { type: "string" },
            icon: { type: "string" },
            featuredImageUrl: { type: "string" },
            isFeatured: { type: "boolean" },
            basePrice: { type: "number" },
            status: { type: "string", enum: ["draft", "published", "archived"] },
            seo: { type: "object" },
            whyChooseUs: { type: "array", items: { type: "object" } },
            locations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer" },
                  name: { type: "string" },
                  slug: { type: "string" },
                },
              },
            },
          },
        },
        ServiceResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            total: { type: "integer" },
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/ServiceItem" },
            },
            data: { $ref: "#/components/schemas/ServiceItem" },
          },
        },
        ServiceUpsertRequest: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            slug: { type: "string" },
            shortDescription: { type: "string" },
            longDescription: { type: "string", description: "Rich HTML description of service" },
            basePrice: { type: "number" },
            status: { type: "string", enum: ["draft", "published", "archived"], default: "published" },
            seo: {
              type: "object",
              properties: {
                pageTitle: { type: "string" },
                metaDescription: { type: "string" },
                metaRobots: { type: "string", default: "index, follow" },
                ogTitle: { type: "string" },
                ogDescription: { type: "string" },
                ogImage: { type: "string" },
                canonicalUrl: { type: "string" },
                schemaMarkup: { type: "string" },
              },
            },
            whyChooseUs: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                },
              },
            },
            locationIds: { type: "array", items: { type: "integer" } },
          },
        },
        ServiceLocationItem: {
          type: "object",
          properties: {
            locationId: { type: "integer" },
            serviceId: { type: "integer" },
            locationName: { type: "string" },
            locationSlug: { type: "string" },
            serviceName: { type: "string" },
            serviceSlug: { type: "string" },
            slug: { type: "string", description: "Composite landing page slug (e.g. roof-repairs-in-abbotsford)" },
            name: { type: "string" },
            shortDescription: { type: "string" },
            longDescription: { type: "string", description: "City-specific localized HTML description" },
            whyChooseUs: { type: "array", items: { type: "object" } },
            seo: { type: "object" },
          },
        },
        ServiceLocationResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            total: { type: "integer" },
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/ServiceLocationItem" },
            },
            locations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer" },
                  name: { type: "string" },
                  slug: { type: "string" },
                },
              },
            },
            data: { $ref: "#/components/schemas/ServiceLocationItem" },
          },
        },
        ServiceLocationUpsertRequest: {
          type: "object",
          properties: {
            slug: { type: "string", description: "Composite slug like 'roof-repairs-in-abbotsford'" },
            serviceSlug: { type: "string", description: "Base service slug (e.g. 'roof-repairs')" },
            locationSlug: { type: "string", description: "City slug (e.g. 'abbotsford')" },
            name: { type: "string", description: "Custom heading or service name for location" },
            shortDescription: { type: "string" },
            longDescription: { type: "string", description: "Unique localized HTML description" },
            whyChooseUs: { type: "array", items: { type: "object" } },
            seo: {
              type: "object",
              properties: {
                pageTitle: { type: "string" },
                metaDescription: { type: "string" },
                metaRobots: { type: "string" },
                ogTitle: { type: "string" },
                ogDescription: { type: "string" },
                ogImage: { type: "string" },
                canonicalUrl: { type: "string" },
                schemaMarkup: { type: "string" },
              },
            },
          },
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  };

  res.json(spec);
};

/**
 * ============================================================================
 * SEO ENDPOINTS (/api/ai-gateway/v1/seo)
 * ============================================================================
 */

exports.getSeoSettings = async (req, res, next) => {
  try {
    const { page_name, search, page = 1, limit = 50 } = req.query;

    if (page_name) {
      const normalizedPage = page_name.trim().toLowerCase();
      const seoRecord = await SeoMeta.findOne({
        where: { pageName: normalizedPage },
      });

      if (!seoRecord) {
        // Return 200 with fallback to global if available
        const globalSeo = await SeoMeta.findOne({ where: { pageName: "global" } });
        return res.json({
          success: true,
          found: false,
          data: globalSeo || null,
          message: `SEO setting for '${page_name}' not found; returned global fallback.`,
        });
      }

      return res.json({
        success: true,
        found: true,
        data: seoRecord,
      });
    }

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { pageName: { [Op.like]: `%${search}%` } },
        { pageTitle: { [Op.like]: `%${search}%` } },
        { metaDescription: { [Op.like]: `%${search}%` } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const offset = (pageNum - 1) * limitNum;

    const { count, rows } = await SeoMeta.findAndCountAll({
      where: whereClause,
      order: [["pageName", "ASC"]],
      limit: limitNum,
      offset,
    });

    res.json({
      success: true,
      total: count,
      page: pageNum,
      pages: Math.ceil(count / limitNum),
      data: rows,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateSeoSetting = async (req, res, next) => {
  try {
    const body = req.body;
    const rawPageName = body.pageName || body.page_name;

    if (!rawPageName) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: pageName (or page_name)",
      });
    }

    const pageName = rawPageName.trim().toLowerCase();

    const payload = {
      pageName,
      pageTitle: body.pageTitle || body.page_title || body.title || pageName,
      metaDescription: body.metaDescription || body.meta_description || body.description || "",
      metaRobots: body.metaRobots || body.meta_robots || "index, follow",
      ogTitle: body.ogTitle || body.og_title || body.pageTitle || body.title || null,
      ogDescription: body.ogDescription || body.og_description || body.metaDescription || null,
      ogImage: body.ogImage || body.og_image || null,
      keywords: body.keywords || null,
      canonicalUrl: body.canonicalUrl || body.canonical_url || null,
      schemaMarkup: typeof body.schemaMarkup === "object" ? JSON.stringify(body.schemaMarkup) : body.schemaMarkup || null,
      headerScripts: body.headerScripts || body.header_scripts || null,
      faqSchema: body.faqSchema || body.faq_schema || [],
      googleAnalyticsId: body.googleAnalyticsId || body.google_analytics_id || null,
      googleTagManagerId: body.googleTagManagerId || body.google_tag_manager_id || null,
    };

    const [record, created] = await SeoMeta.findOrCreate({
      where: { pageName },
      defaults: payload,
    });

    if (!created) {
      await record.update(payload);
    }

    // Smart sync: If this is a localized service page (e.g. services/roof-repairs-in-abbotsford or /services/roof-repairs-in-abbotsford)
    if (pageName.includes("-in-")) {
      const cleanSlug = pageName.replace(/^\/?(services\/)?/, "").replace(/^\//, "");
      const [srvSlug, locSlug] = cleanSlug.split("-in-");
      if (srvSlug && locSlug) {
        const [srv, loc] = await Promise.all([
          Service.findOne({ where: { slug: srvSlug } }),
          Location.findOne({ where: { slug: locSlug } }),
        ]);

        if (srv && loc) {
          const locService = await LocationService.findOne({
            where: { serviceId: srv.id, locationId: loc.id },
          });

          if (locService) {
            const currentSeo = locService.seo || {};
            await locService.update({
              seo: {
                ...currentSeo,
                pageTitle: payload.pageTitle,
                metaDescription: payload.metaDescription,
                metaRobots: payload.metaRobots,
                ogTitle: payload.ogTitle,
                ogDescription: payload.ogDescription,
                canonicalUrl: payload.canonicalUrl,
                schemaMarkup: payload.schemaMarkup,
              },
            });
          }
        }
      }
    }

    res.json({
      success: true,
      action: created ? "created" : "updated",
      message: `SEO setting for '${pageName}' ${created ? "created" : "updated"} successfully.`,
      data: record,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteSeoSetting = async (req, res, next) => {
  try {
    const { page_name, id } = req.query;

    if (!page_name && !id) {
      return res.status(400).json({
        success: false,
        message: "page_name or id parameter is required",
      });
    }

    const whereClause = id ? { id: parseInt(id, 10) } : { pageName: page_name.trim().toLowerCase() };
    const deletedCount = await SeoMeta.destroy({ where: whereClause });

    if (!deletedCount) {
      return res.status(404).json({
        success: false,
        message: "SEO setting record not found",
      });
    }

    res.json({
      success: true,
      message: "SEO setting deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ============================================================================
 * BLOGS ENDPOINTS (/api/ai-gateway/v1/blogs)
 * ============================================================================
 */

exports.getBlogs = async (req, res, next) => {
  try {
    const { slug, id, search, status = "all", page = 1, limit = 20 } = req.query;

    if (slug || id) {
      const whereClause = id ? { id: parseInt(id, 10) } : { slug: slug.trim() };
      const blog = await Blog.findOne({ where: whereClause });

      if (!blog) {
        return res.status(404).json({ success: false, message: "Blog post not found" });
      }

      return res.json({
        success: true,
        data: blog,
      });
    }

    const whereClause = {};
    if (status && status !== "all") {
      whereClause.status = status;
    }
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { slug: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const offset = (pageNum - 1) * limitNum;

    const { count, rows } = await Blog.findAndCountAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      limit: limitNum,
      offset,
    });

    res.json({
      success: true,
      total: count,
      page: pageNum,
      pages: Math.ceil(count / limitNum),
      data: rows,
    });
  } catch (err) {
    next(err);
  }
};

exports.createOrUpdateBlog = async (req, res, next) => {
  try {
    const body = req.body;
    let { title, slug, content, excerpt, image, author, tags, status, metaTitle, metaDescription, metaRobots, ogTitle, ogDescription, ogImage, canonicalUrl, schemaMarkup } = body;

    if (!title && !slug && !body.id) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: title or slug or id",
      });
    }

    // Generate slug from title if not provided
    if (!slug && title) {
      slug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
    }

    const payload = {
      ...(title && { title }),
      ...(slug && { slug }),
      ...(content !== undefined && { content }),
      ...(excerpt !== undefined && { excerpt }),
      ...(image !== undefined && { image }),
      ...(author && { author }),
      ...(tags && { tags }),
      ...(status && { status }),
      ...(metaTitle !== undefined && { metaTitle }),
      ...(metaDescription !== undefined && { metaDescription }),
      ...(metaRobots !== undefined && { metaRobots }),
      ...(ogTitle !== undefined && { ogTitle }),
      ...(ogDescription !== undefined && { ogDescription }),
      ...(ogImage !== undefined && { ogImage }),
      ...(canonicalUrl !== undefined && { canonicalUrl }),
      ...(schemaMarkup !== undefined && { schemaMarkup: typeof schemaMarkup === "object" ? JSON.stringify(schemaMarkup) : schemaMarkup }),
    };

    let blog = null;
    let created = false;

    if (body.id) {
      blog = await Blog.findByPk(body.id);
      if (blog) {
        await blog.update(payload);
      }
    }

    if (!blog && slug) {
      blog = await Blog.findOne({ where: { slug } });
      if (blog) {
        await blog.update(payload);
      }
    }

    if (!blog) {
      if (!title || !content) {
        return res.status(400).json({
          success: false,
          message: "New blog post requires both 'title' and 'content'",
        });
      }
      blog = await Blog.create({
        ...payload,
        status: status || "published",
        author: author || "Admin",
      });
      created = true;
    }

    res.json({
      success: true,
      action: created ? "created" : "updated",
      message: `Blog post '${blog.title}' ${created ? "created" : "updated"} successfully.`,
      data: blog,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteBlog = async (req, res, next) => {
  try {
    const { slug, id } = req.query;

    if (!slug && !id) {
      return res.status(400).json({ success: false, message: "slug or id parameter is required" });
    }

    const whereClause = id ? { id: parseInt(id, 10) } : { slug: slug.trim() };
    const deletedCount = await Blog.destroy({ where: whereClause });

    if (!deletedCount) {
      return res.status(404).json({ success: false, message: "Blog post not found" });
    }

    res.json({
      success: true,
      message: "Blog post deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ============================================================================
 * SERVICES ENDPOINTS (/api/ai-gateway/v1/services)
 * ============================================================================
 */

exports.getServices = async (req, res, next) => {
  try {
    const { slug, id, status = "all" } = req.query;

    if (slug || id) {
      const whereClause = id ? { id: parseInt(id, 10) } : { slug: slug.trim() };
      const service = await Service.findOne({
        where: whereClause,
        include: [
          { model: Location, as: "locations", attributes: ["id", "name", "slug"] },
          { model: ServiceCategory, as: "category", attributes: ["id", "name", "slug"] },
        ],
      });

      if (!service) {
        return res.status(404).json({ success: false, message: "Service not found" });
      }

      return res.json({
        success: true,
        data: service,
      });
    }

    const whereClause = {};
    if (status && status !== "all") {
      whereClause.status = status;
    }

    const items = await Service.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      include: [
        { model: Location, as: "locations", attributes: ["id", "name", "slug"] },
        { model: ServiceCategory, as: "category", attributes: ["id", "name", "slug"] },
      ],
    });

    res.json({
      success: true,
      total: items.length,
      items,
    });
  } catch (err) {
    next(err);
  }
};

exports.createOrUpdateService = async (req, res, next) => {
  try {
    const body = req.body;
    let { id, name, slug, shortDescription, longDescription, basePrice, status, seo, whyChooseUs, locationIds } = body;

    // Smart compatibility: If a composite slug like "roof-repairs-in-abbotsford" is passed to createOrUpdateService
    if (slug && slug.includes("-in-")) {
      const parts = slug.split("-in-");
      const baseSrvSlug = parts[0];
      const baseLocSlug = parts[1];

      const [serviceRecord, locationRecord] = await Promise.all([
        Service.findOne({ where: { slug: baseSrvSlug } }),
        Location.findOne({ where: { slug: baseLocSlug } }),
      ]);

      if (serviceRecord && locationRecord) {
        const [locService, created] = await LocationService.findOrCreate({
          where: { serviceId: serviceRecord.id, locationId: locationRecord.id },
          defaults: {
            serviceId: serviceRecord.id,
            locationId: locationRecord.id,
            name: name || `${serviceRecord.name} in ${locationRecord.name}`,
            shortDescription: shortDescription || serviceRecord.shortDescription,
            longDescription: longDescription || serviceRecord.longDescription,
            whyChooseUs: whyChooseUs || serviceRecord.whyChooseUs,
            seo: seo || serviceRecord.seo,
          },
        });

        if (!created) {
          await locService.update({
            ...(name && { name }),
            ...(shortDescription !== undefined && { shortDescription }),
            ...(longDescription !== undefined && { longDescription }),
            ...(whyChooseUs && { whyChooseUs }),
            ...(seo && { seo }),
          });
        }

        return res.json({
          success: true,
          action: created ? "created" : "updated",
          routedTo: "location_services",
          message: `Localized landing page '${slug}' safely updated in location_services table. Base service remains untouched.`,
          data: {
            slug,
            service: serviceRecord.name,
            location: locationRecord.name,
          },
        });
      }
    }

    if (!name && !slug && !id) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: name, slug, or id",
      });
    }

    if (!slug && name) {
      slug = name
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
    }

    const payload = {
      ...(name && { name }),
      ...(slug && { slug }),
      ...(shortDescription !== undefined && { shortDescription }),
      ...(longDescription !== undefined && { longDescription }),
      ...(basePrice !== undefined && { basePrice }),
      ...(status && { status }),
      ...(seo && { seo }),
      ...(whyChooseUs && { whyChooseUs }),
    };

    let service = null;
    let created = false;

    if (id) {
      service = await Service.findByPk(id);
      if (service) {
        await service.update(payload);
      }
    }

    if (!service && slug) {
      service = await Service.findOne({ where: { slug } });
      if (service) {
        await service.update(payload);
      }
    }

    if (!service) {
      if (!name) {
        return res.status(400).json({ success: false, message: "New service requires 'name'" });
      }
      service = await Service.create({
        ...payload,
        status: status || "published",
      });
      created = true;
    }

    if (Array.isArray(locationIds)) {
      await service.setLocations(locationIds);
    }

    res.json({
      success: true,
      action: created ? "created" : "updated",
      message: `Service '${service.name}' ${created ? "created" : "updated"} successfully.`,
      data: service,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteService = async (req, res, next) => {
  try {
    const { slug, id } = req.query;

    if (!slug && !id) {
      return res.status(400).json({ success: false, message: "slug or id parameter is required" });
    }

    const whereClause = id ? { id: parseInt(id, 10) } : { slug: slug.trim() };
    const deletedCount = await Service.destroy({ where: whereClause });

    if (!deletedCount) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    res.json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ============================================================================
 * SERVICE LOCATIONS ENDPOINTS (/api/ai-gateway/v1/service-locations)
 * ============================================================================
 */

exports.getServiceLocations = async (req, res, next) => {
  try {
    const { slug, service_slug, location_slug, include_locations_list } = req.query;

    const includeOptions = [
      { model: Location, as: "location", attributes: ["id", "name", "slug", "description", "image"] },
      { model: Service, as: "service", attributes: ["id", "name", "slug", "shortDescription", "longDescription", "featuredImageUrl"] },
    ];

    let items = await LocationService.findAll({
      include: includeOptions,
    });

    let serialized = items.map((item) => {
      const plain = item.get({ plain: true });
      const srv = plain.service || {};
      const loc = plain.location || {};
      const compositeSlug = srv.slug && loc.slug ? `${srv.slug}-in-${loc.slug}` : "";

      return {
        locationId: plain.locationId,
        serviceId: plain.serviceId,
        locationName: loc.name || "",
        locationSlug: loc.slug || "",
        serviceName: srv.name || "",
        serviceSlug: srv.slug || "",
        slug: compositeSlug,
        canonicalUrl: `https://www.mainstreet-roofing.ca/services/${compositeSlug}`,
        name: plain.name || `${srv.name} in ${loc.name}`,
        shortDescription: plain.shortDescription || srv.shortDescription || "",
        longDescription: plain.longDescription || srv.longDescription || "",
        whyChooseUs: plain.whyChooseUs || [],
        seo: plain.seo || {},
      };
    });

    if (slug) {
      const target = slug.trim().toLowerCase();
      const match = serialized.find((s) => s.slug.toLowerCase() === target);
      if (!match) {
        return res.status(404).json({ success: false, message: `Service location for '${slug}' not found` });
      }
      return res.json({ success: true, data: match });
    }

    if (service_slug) {
      serialized = serialized.filter((s) => s.serviceSlug.toLowerCase() === service_slug.trim().toLowerCase());
    }

    if (location_slug) {
      serialized = serialized.filter((s) => s.locationSlug.toLowerCase() === location_slug.trim().toLowerCase());
    }

    let locationsList = [];
    if (include_locations_list === "true" || include_locations_list === true) {
      locationsList = await Location.findAll({
        attributes: ["id", "name", "slug"],
        order: [["name", "ASC"]],
      });
    }

    res.json({
      success: true,
      total: serialized.length,
      items: serialized,
      ...(locationsList.length > 0 && { locations: locationsList }),
    });
  } catch (err) {
    next(err);
  }
};

exports.createOrUpdateServiceLocation = async (req, res, next) => {
  try {
    const body = req.body;
    let { slug, serviceSlug, service_slug, locationSlug, location_slug, name, shortDescription, short_description, longDescription, long_description, description, whyChooseUs, why_choose_us, seo } = body;

    const sSlug = serviceSlug || service_slug;
    const lSlug = locationSlug || location_slug;
    const sDesc = shortDescription || short_description;
    const lDesc = longDescription || long_description || description;
    const whyUs = whyChooseUs || why_choose_us;

    let targetServiceSlug = sSlug;
    let targetLocationSlug = lSlug;

    if (slug && slug.includes("-in-")) {
      const parts = slug.split("-in-");
      targetServiceSlug = targetServiceSlug || parts[0];
      targetLocationSlug = targetLocationSlug || parts[1];
    }

    if (!targetServiceSlug || !targetLocationSlug) {
      return res.status(400).json({
        success: false,
        message: "Missing target service and location. Provide 'slug' (e.g. roof-repairs-in-abbotsford) or 'serviceSlug' and 'locationSlug'.",
      });
    }

    const [service, location] = await Promise.all([
      Service.findOne({ where: { slug: targetServiceSlug } }),
      Location.findOne({ where: { slug: targetLocationSlug } }),
    ]);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: `Service with slug '${targetServiceSlug}' not found. Please create the base service first.`,
      });
    }

    if (!location) {
      return res.status(404).json({
        success: false,
        message: `Location with slug '${targetLocationSlug}' not found. Please verify available cities.`,
      });
    }

    const [locService, created] = await LocationService.findOrCreate({
      where: { serviceId: service.id, locationId: location.id },
      defaults: {
        serviceId: service.id,
        locationId: location.id,
        name: name || `${service.name} in ${location.name}`,
        shortDescription: sDesc || service.shortDescription,
        longDescription: lDesc || service.longDescription,
        whyChooseUs: whyUs || service.whyChooseUs,
        seo: seo || service.seo,
      },
    });

    if (!created) {
      await locService.update({
        ...(name && { name }),
        ...(sDesc !== undefined && { shortDescription: sDesc }),
        ...(lDesc !== undefined && { longDescription: lDesc }),
        ...(whyUs && { whyChooseUs: whyUs }),
        ...(seo && { seo }),
      });
    }

    const compositeSlug = `${service.slug}-in-${location.slug}`;

    res.json({
      success: true,
      action: created ? "created" : "updated",
      message: `Location service '${compositeSlug}' ${created ? "created" : "updated"} successfully.`,
      data: {
        slug: compositeSlug,
        canonicalUrl: `https://www.mainstreet-roofing.ca/services/${compositeSlug}`,
        serviceId: service.id,
        locationId: location.id,
        serviceName: service.name,
        locationName: location.name,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.syncServiceLocationCanonicals = async (req, res, next) => {
  try {
    const items = await LocationService.findAll({
      include: [
        { model: Location, as: "location" },
        { model: Service, as: "service" },
      ],
    });

    let syncCount = 0;

    for (const item of items) {
      if (item.service && item.location) {
        const canonical = `https://www.mainstreet-roofing.ca/services/${item.service.slug}-in-${item.location.slug}`;
        const currentSeo = item.seo || {};

        if (currentSeo.canonicalUrl !== canonical) {
          await item.update({
            seo: {
              ...currentSeo,
              canonicalUrl: canonical,
              pageTitle: currentSeo.pageTitle || `${item.service.name} in ${item.location.name} BC | Mainstreet Roofing`,
              metaDescription: currentSeo.metaDescription || `Professional ${item.service.name} services in ${item.location.name}, BC. Expert roofers, guaranteed quality.`,
            },
          });
          syncCount++;
        }
      }
    }

    res.json({
      success: true,
      message: `Canonicals synchronized for ${syncCount} of ${items.length} service locations.`,
      totalLocations: items.length,
      updatedCount: syncCount,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteServiceLocation = async (req, res, next) => {
  try {
    const { slug, service_slug, location_slug } = req.query;

    let sSlug = service_slug;
    let lSlug = location_slug;

    if (slug && slug.includes("-in-")) {
      const parts = slug.split("-in-");
      sSlug = sSlug || parts[0];
      lSlug = lSlug || parts[1];
    }

    if (!sSlug || !lSlug) {
      return res.status(400).json({ success: false, message: "service_slug and location_slug are required" });
    }

    const [srv, loc] = await Promise.all([
      Service.findOne({ where: { slug: sSlug } }),
      Location.findOne({ where: { slug: lSlug } }),
    ]);

    if (!srv || !loc) {
      return res.status(404).json({ success: false, message: "Service or Location not found" });
    }

    const deleted = await LocationService.destroy({
      where: { serviceId: srv.id, locationId: loc.id },
    });

    res.json({
      success: true,
      message: `Location service association deleted (${deleted} record)`,
    });
  } catch (err) {
    next(err);
  }
};
