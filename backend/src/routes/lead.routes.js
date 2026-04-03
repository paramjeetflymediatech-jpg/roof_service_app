const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const leadController = require("../controllers/lead.controller");
const { jwtAuth, isAdmin } = require("../middlewares/auth.middleware");

// /api/leads
router.post("/", upload.array("images", 5), leadController.createLead);
router.post(
  "/create",
  upload.array("images", 5),
  leadController.createLeadByApp,
);
router.get("/", leadController.getLeads);
router.get("/:id", leadController.getLeadById);

// Admin Routes
router.put("/:id", isAdmin, leadController.updateLead);
router.put("/:id/assign", isAdmin, leadController.assignLead);

// Client Routes (pending leads only)
router.delete("/:id", leadController.deleteLead);
router.put(
  "/my/:id",
  upload.array("images", 5),
  leadController.updateMyLead,
);

module.exports = router;
