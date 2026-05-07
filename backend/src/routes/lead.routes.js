const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const leadController = require("../controllers/lead.controller");
const { jwtAuth, isAdmin,checkAccountStatus } = require("../middlewares/auth.middleware");

// /api/leads
router.post("/", upload.array("images", 5), leadController.createLead);
router.post(
  "/create",
  jwtAuth,
  checkAccountStatus,
  upload.array("images", 5),
  leadController.createLeadByApp,
);
router.get("/",jwtAuth, checkAccountStatus, leadController.getLeads);
router.get("/:id",jwtAuth, checkAccountStatus, leadController.getLeadById);

// Admin Routes
router.put("/:id",jwtAuth, checkAccountStatus, isAdmin, leadController.updateLead);
router.put("/:id/assign",jwtAuth, checkAccountStatus, isAdmin, leadController.assignLead);

// Client Routes (pending leads only)
router.delete("/:id", jwtAuth, checkAccountStatus,leadController.deleteLead);
router.put(
  "/my/:id",jwtAuth, checkAccountStatus,
  upload.array("images", 5),
  leadController.updateMyLead,
);

module.exports = router;
