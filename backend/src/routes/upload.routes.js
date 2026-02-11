const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload.middleware");

// POST /api/upload
router.post("/", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Return the file path (relative to public)
    // The middleware saves to public/uploads/jobs/
    // We want to return /uploads/jobs/filename
    const filePath = `/uploads/jobs/${req.file.filename}`;

    res.json({
      success: true,
      data: {
        url: filePath,
        fileName: req.file.filename,
        originalName: req.file.originalname,
      },
      message: "File uploaded successfully",
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      message: "File upload failed",
    });
  }
});

module.exports = router;
