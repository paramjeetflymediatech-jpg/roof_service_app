const express = require("express");
const router = express.Router();
const galleryController = require("../controllers/gallery.controller");
const upload = require("../middlewares/upload.middleware");

// /api/gallery
router.get("/", galleryController.getGalleryItems);
router.get("/folders", galleryController.getGalleryFolders);
router.get("/categories", galleryController.getGalleryCategories);
router.post("/", upload.single("image"), galleryController.createGalleryItem);
router.delete("/:id", galleryController.deleteGalleryItem);

module.exports = router;
