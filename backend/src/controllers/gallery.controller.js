const { Gallery } = require("../models");
const fs = require("fs");
const path = require("path");
const sequelize = require("../config/mysql");

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

// Get all gallery items with pagination
exports.getGalleryItems = async (req, res, next) => {
  try {
    const { location, category, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (location) where.location = location;
    if (category && category !== "All") where.category = category;

    const { count, rows } = await Gallery.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: offset,
    });

    res.json({
      items: rows,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (err) {
    next(err);
  }
};

// Get gallery folder/location counts
exports.getGalleryFolders = async (req, res, next) => {
  try {
    const counts = await Gallery.findAll({
      attributes: [
        "location",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["location"],
      raw: true,
    });

    const folders = counts.map((c) => ({
      name: c.location || "Unknown",
      count: parseInt(c.count),
    }));

    res.json(folders);
  } catch (err) {
    next(err);
  }
};

// Get unique categories for a location
exports.getGalleryCategories = async (req, res, next) => {
  try {
    const { location } = req.query;
    const where = {};
    if (location) where.location = location;

    const categories = await Gallery.findAll({
      attributes: [
        [sequelize.fn("DISTINCT", sequelize.col("category")), "category"],
      ],
      where,
      raw: true,
    });

    res.json(["All", ...categories.map((c) => c.category).filter(Boolean)]);
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
