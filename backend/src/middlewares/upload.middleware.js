const multer = require("multer");
const path = require("path");

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (req.originalUrl.includes("gallery")) {
      cb(null, "public/uploads/gallery/");
    } else if (req.originalUrl.includes("leads")) {
      cb(null, "public/uploads/leads/");
    } else if (
      req.originalUrl.includes("upload") ||
      req.originalUrl.includes("jobs")
    ) {
      // Generic upload or jobs
      cb(null, "public/uploads/jobs/");
    } else {
      cb(null, "public/uploads/services/");
    }
  },
  filename: function (req, file, cb) {
    let prefix = "service-";
    if (req.originalUrl.includes("gallery")) prefix = "gallery-";
    else if (req.originalUrl.includes("leads")) prefix = "lead-";
    else if (
      req.originalUrl.includes("upload") ||
      req.originalUrl.includes("jobs")
    )
      prefix = "job-";

    cb(
      null,
      prefix +
        Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname),
    );
  },
});

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// Check file type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif|webp/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}

module.exports = upload;
