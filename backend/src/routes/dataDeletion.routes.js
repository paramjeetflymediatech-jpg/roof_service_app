const express = require("express");
const router = express.Router();
const dataDeletionController = require("../controllers/dataDeletion.controller");

// POST /api/data-deletion - Submit data deletion request from web
router.post("/", dataDeletionController.submitDataDeletionRequest);

module.exports = router;
