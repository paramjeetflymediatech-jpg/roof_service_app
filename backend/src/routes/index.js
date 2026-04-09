const express = require("express");

const serviceRoutes = require("./service.routes");
const leadRoutes = require("./lead.routes");
const apiRoutes = require("./api.routes");
const authRoutes = require("./auth.routes");
const userRoutes = require("./users.routes");
const jobRoutes = require("./job.routes");
const galleryRoutes = require("./gallery.routes");
const categoryRoutes = require("./category.routes");
const uploadRoutes = require("./upload.routes");
const dataDeletionRoutes = require("./dataDeletion.routes");
const pdfRoutes = require("./pdf.routes");
const estimateApiRoutes = require("./estimate.api.routes");
const invoiceApiRoutes = require("./invoice.api.routes");
const reviewRoutes = require("./review.routes");
const timesheetRoutes = require("./timesheet.routes");

const { jwtAuth, checkAccountStatus } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use("/", apiRoutes);
router.use("/auth", authRoutes);

// Apply checkAccountStatus after authentication to restrict pending_deletion accounts
router.use("/leads", jwtAuth, checkAccountStatus, leadRoutes);
router.use("/services", serviceRoutes);
router.use("/users", jwtAuth, checkAccountStatus, userRoutes);
router.use("/jobs", jwtAuth, checkAccountStatus, jobRoutes);
router.use("/gallery", galleryRoutes);
router.use("/categories", categoryRoutes);
router.use("/upload", jwtAuth, checkAccountStatus, uploadRoutes);
router.use("/data-deletion", dataDeletionRoutes);
router.use("/", pdfRoutes);
router.use("/estimates", jwtAuth, checkAccountStatus, estimateApiRoutes);
router.use("/invoices", jwtAuth, checkAccountStatus, invoiceApiRoutes);
router.use("/reviews", reviewRoutes);
router.use("/timesheets", jwtAuth, checkAccountStatus, timesheetRoutes);

module.exports = router;
