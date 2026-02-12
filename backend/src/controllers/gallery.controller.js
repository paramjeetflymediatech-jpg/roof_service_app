const { Gallery } = require("../models");
const fs = require("fs");
const path = require("path");

// Create new gallery item
exports.createGalleryItem = async (req, res, next) => {
  try {
    let galleryData = { ...req.body };

    if (req.file) {
      galleryData.imageUrl = `/uploads/gallery/${req.file.filename}`;
    } else if (!galleryData.imageUrl) {
      return res.status(400).json({ message: "Image is required" });
    }

    const item = await Gallery.create(galleryData);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

// Get all gallery items
exports.getGalleryItems = async (req, res, next) => {
  try {
    const items = await Gallery.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
};

// Delete gallery item
exports.deleteGalleryItem = async (req, res, next) => {
  try {
    const item = await Gallery.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    // Optional: Delete file from filesystem here if needed
    if (item.imageUrl) {
      const filePath = path.join(__dirname, "..", "public", item.imageUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await item.destroy();
    res.json({ message: "Item deleted" });
  } catch (err) {
    next(err);
  }
};
