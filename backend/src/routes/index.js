const express = require("express");

const serviceRoutes = require("./service.routes");
const leadRoutes = require("./lead.routes");
const apiRoutes = require("./api.routes");
const authRoutes = require("./auth.routes");
const userRoutes = require("./users.routes");
const jobRoutes = require("./job.routes");

const router = express.Router();

router.use("/", apiRoutes);
router.use("/auth", authRoutes);
router.use("/leads", leadRoutes);
router.use("/services", serviceRoutes);
router.use("/users", userRoutes);
router.use("/jobs", jobRoutes);

module.exports = router;
