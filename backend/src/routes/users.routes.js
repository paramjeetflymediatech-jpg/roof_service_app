const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { jwtAuth, isAdmin } = require("../middlewares/auth.middleware");

// Admin user management routes (full CRUD)
router.get("/", jwtAuth, isAdmin, userController.getallusers);
router.post("/", jwtAuth, isAdmin, userController.createUser);

// Authenticated user profile update (must be before /:id)
router.put("/me", jwtAuth, userController.updateMe);

router.get("/:id", jwtAuth, isAdmin, userController.getUserById);
router.put("/:id", jwtAuth, isAdmin, userController.updateUser);
router.delete("/:id", jwtAuth, isAdmin, userController.deleteUser);

module.exports = router;
