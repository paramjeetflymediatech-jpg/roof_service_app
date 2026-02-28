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

const router = express.Router();

router.use("/", apiRoutes);
router.use("/auth", authRoutes);
router.use("/leads", leadRoutes);
router.use("/services", serviceRoutes);
router.use("/users", userRoutes);
router.use("/jobs", jobRoutes);
router.use("/gallery", galleryRoutes);
router.use("/categories", categoryRoutes);
router.use("/upload", uploadRoutes);
router.use("/data-deletion", dataDeletionRoutes);
router.use("/", pdfRoutes);
router.use("/estimates", estimateApiRoutes);
router.use("/invoices", invoiceApiRoutes);

module.exports = router;
