const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const blogController = require("../controllers/blog.controller");
const leadController = require("../controllers/lead.controller");
const { isAuthenticated, isAdmin } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

// Public routes
router.get("/login", adminController.getLogin);
router.post("/login", adminController.postLogin);

// Protected routes
router.get(
  "/dashboard",
  isAuthenticated,
  isAdmin,
  adminController.getDashboard,
);
router.get("/logout", isAuthenticated, adminController.getLogout);

// User management routes
router.get("/users", isAuthenticated, isAdmin, adminController.getUserList);
router.get(
  "/users/create",
  isAuthenticated,
  isAdmin,
  adminController.getCreateUser,
);
router.get(
  "/users/new",
  isAuthenticated,
  isAdmin,
  adminController.getCreateUser,
); // Alias requesting by user
router.post(
  "/users/delete-all",
  isAuthenticated,
  isAdmin,
  adminController.deleteAllUsers,
);
router.post("/users", isAuthenticated, isAdmin, adminController.postCreateUser);
router.get(
  "/users/:id/edit",
  isAuthenticated,
  isAdmin,
  adminController.getEditUser,
);
router.post(
  "/users/:id",
  isAuthenticated,
  isAdmin,
  adminController.postUpdateUser,
);
router.post(
  "/users/:id/delete",
  isAuthenticated,
  isAdmin,
  adminController.deleteUser,
);

// Lead management routes
router.get("/leads", isAuthenticated, isAdmin, adminController.getLeadList);
router.get(
  "/leads/create",
  isAuthenticated,
  isAdmin,
  adminController.getCreateLead,
);
// Must be before /leads/:id
router.post(
  "/leads/delete-all",
  isAuthenticated,
  isAdmin,
  adminController.deleteAllLeads,
);

router.post(
  "/leads",
  isAuthenticated,
  isAdmin,
  upload.array("clientImages", 5),
  adminController.postCreateLead,
);
router.get(
  "/available-employees",
  isAuthenticated,
  isAdmin,
  leadController.getAvailableEmployees,
);

// Specific ID routes come after specific paths
router.get(
  "/leads/:id",
  isAuthenticated,
  isAdmin,
  adminController.getLeadDetail,
);

router.get(
  "/leads/:id/edit",
  isAuthenticated,
  isAdmin,
  adminController.getEditLead,
);
router.post(
  "/leads/:id",
  isAuthenticated,
  isAdmin,
  upload.array("clientImages", 5),
  adminController.postUpdateLead,
);

router.post(
  "/leads/:id/approve",
  isAuthenticated,
  isAdmin,
  adminController.approveLead,
);

router.post(
  "/leads/:id/delete",
  isAuthenticated,
  isAdmin,
  adminController.deleteLead,
);
router.post(
  "/leads/:id/assign",
  isAuthenticated,
  isAdmin,
  leadController.assignLead,
);

// SEO management routes
router.get("/seo", isAuthenticated, isAdmin, adminController.getSeoList);
router.get(
  "/seo/create",
  isAuthenticated,
  isAdmin,
  adminController.getCreateSeo,
);
router.post("/seo", isAuthenticated, isAdmin, adminController.postCreateSeo);
router.get(
  "/seo/:id/edit",
  isAuthenticated,
  isAdmin,
  adminController.getEditSeo,
);
router.post(
  "/seo/:id",
  isAuthenticated,
  isAdmin,
  adminController.postUpdateSeo,
);
router.post(
  "/seo/:id/delete",
  isAuthenticated,
  isAdmin,
  adminController.deleteSeo,
);

// Blog management routes
router.get("/blogs", isAuthenticated, isAdmin, blogController.getAdminList);
router.get("/blogs/create", isAuthenticated, isAdmin, blogController.getCreate);
router.post("/blogs", isAuthenticated, isAdmin, blogController.postCreate);
router.get("/blogs/:id/edit", isAuthenticated, isAdmin, blogController.getEdit);
router.post("/blogs/:id", isAuthenticated, isAdmin, blogController.postUpdate);
router.post(
  "/blogs/:id/delete",
  isAuthenticated,
  isAdmin,
  blogController.delete,
);

// Category management routes
router.get(
  "/categories",
  isAuthenticated,
  isAdmin,
  adminController.getCategoryList,
);
router.get(
  "/categories/create",
  isAuthenticated,
  isAdmin,
  adminController.getCreateCategory,
);
router.post(
  "/categories",
  isAuthenticated,
  isAdmin,
  adminController.postCreateCategory,
);
router.get(
  "/categories/:id/edit",
  isAuthenticated,
  isAdmin,
  adminController.getEditCategory,
);
router.post(
  "/categories/:id",
  isAuthenticated,
  isAdmin,
  adminController.postUpdateCategory,
);
router.post(
  "/categories/:id/delete",
  isAuthenticated,
  isAdmin,
  adminController.deleteCategory,
);

// Service management routes
router.get(
  "/services",
  isAuthenticated,
  isAdmin,
  adminController.getServiceList,
);
router.get(
  "/services/create",
  isAuthenticated,
  isAdmin,
  adminController.getCreateService,
);
router.post(
  "/services",
  isAuthenticated,
  isAdmin,
  upload.single("image"),
  adminController.postCreateService,
);
router.get(
  "/services/:id/edit",
  isAuthenticated,
  isAdmin,
  adminController.getEditService,
);
router.post(
  "/services/:id",
  isAuthenticated,
  isAdmin,
  upload.single("image"),
  adminController.postUpdateService,
);
router.post(
  "/services/:id/delete",
  isAuthenticated,
  isAdmin,
  adminController.deleteService,
);

// Gallery management routes
router.get(
  "/gallery",
  isAuthenticated,
  isAdmin,
  adminController.getGalleryList,
);
router.get(
  "/gallery/create",
  isAuthenticated,
  isAdmin,
  adminController.getCreateGallery,
);
router.post(
  "/gallery",
  isAuthenticated,
  isAdmin,
  upload.single("image"),
  adminController.postCreateGallery,
);
router.post(
  "/gallery/:id/delete",
  isAuthenticated,
  isAdmin,
  adminController.deleteGallery,
);

// Job management routes
router.get("/jobs", isAuthenticated, isAdmin, adminController.getJobList);
router.get("/jobs/:id", isAuthenticated, isAdmin, adminController.getJobDetail);
router.post(
  "/jobs/:id/delete",
  isAuthenticated,
  isAdmin,
  adminController.deleteJob,
);

// Data Deletion Request management routes
const deletionRequestController = require("../controllers/deletionRequest.controller");

router.get(
  "/deletion-requests",
  isAuthenticated,
  isAdmin,
  deletionRequestController.getDeletionRequestList,
);
router.get(
  "/deletion-requests/:id",
  isAuthenticated,
  isAdmin,
  deletionRequestController.getRequestDetail,
);
router.post(
  "/deletion-requests/:id/approve",
  isAuthenticated,
  isAdmin,
  deletionRequestController.approveDeletionRequest,
);
router.post(
  "/deletion-requests/:id/reject",
  isAuthenticated,
  isAdmin,
  deletionRequestController.rejectDeletionRequest,
);

module.exports = router;
