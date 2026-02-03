const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

// Public routes
router.get("/", userController.getallusers);

module.exports = router;
