const express = require("express");

const serviceRoutes = require("./service.routes");
const leadRoutes = require("./lead.routes");
const apiRoutes = require("./api.routes");
const authRoutes = require("./auth.routes");

const router = express.Router();

router.use("/services", serviceRoutes);
router.use("/leads", leadRoutes);
router.use("/auth", authRoutes);
router.use("/", apiRoutes);

module.exports = router;
