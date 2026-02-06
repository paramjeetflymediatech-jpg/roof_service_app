const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const leadController = require("../controllers/lead.controller");
const { jwtAuth, isAdmin } = require("../middlewares/auth.middleware");

// /api/leads
router.post("/", upload.array("images", 5), leadController.createLead);
router.get("/", jwtAuth, leadController.getLeads);
router.get("/:id", jwtAuth, leadController.getLeadById);
router.put("/:id", jwtAuth, isAdmin, leadController.updateLead);
router.put("/:id/assign", jwtAuth, isAdmin, leadController.assignLead);

module.exports = router;
