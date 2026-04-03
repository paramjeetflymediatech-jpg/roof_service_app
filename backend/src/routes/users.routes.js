const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { jwtAuth, isAdmin } = require("../middlewares/auth.middleware");

// Admin user management routes (full CRUD)
router.get("/", isAdmin, userController.getallusers);
router.post("/", isAdmin, userController.createUser);

// Authenticated user profile update (must be before /:id)
router.put("/me", userController.updateMe);

// Upload profile picture (must be before /:id)
const { upload } = require("../middlewares/upload.middleware");
router.post(
  "/me/profile-picture",
  upload.single("profilePicture"),
  userController.uploadProfilePicture,
);

// Delete own account and all associated data
router.delete("/me", userController.deleteMyAccount);

// Account deletion flow (Apple Guideline compliant)
router.post("/me/request-deletion", userController.requestAccountDeletion);
router.post("/me/cancel-deletion", userController.cancelAccountDeletion);

router.get("/:id", userController.getUserById);
router.put("/:id", isAdmin, userController.updateUser);
router.delete("/:id", isAdmin, userController.deleteUser);

module.exports = router;
