const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure blogs directory exists
const blogsDir = path.join(__dirname, "../../public/uploads/blogs");
if (!fs.existsSync(blogsDir)) {
  fs.mkdirSync(blogsDir, { recursive: true });
}

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (req.originalUrl.includes("profile-picture")) {
      if (req.user.role === "user") cb(null, "public/uploads/profiles/");
      else if (req.user.role === "employee")
        cb(null, "public/uploads/employees/");
      else if (req.user.role === "admin") cb(null, "public/uploads/admins/");
    } else if (req.originalUrl.includes("gallery")) {
      cb(null, "public/uploads/gallery/");
    } else if (req.originalUrl.includes("leads")) {
      cb(null, "public/uploads/leads/");
    } else if (req.originalUrl.includes("blogs")) {
      cb(null, "public/uploads/blogs/");
    } else if (
      req.originalUrl.includes("upload") ||
      req.originalUrl.includes("jobs") ||
      req.originalUrl.includes("invoices") ||
      req.originalUrl.includes("estimates")
    ) {
      // Generic upload, jobs, or invoices
      cb(null, "public/uploads/jobs/");
    } else {
      cb(null, "public/uploads/services/");
    }
  },
  filename: function (req, file, cb) {
    let prefix = "service-";
    if (req.originalUrl.includes("profile-picture")) {
      if (req.user.role === "user") prefix = "profile-";
      else if (req.user.role === "employee") prefix = "employee-";
      else if (req.user.role === "admin") prefix = "admin-";
    } else if (req.originalUrl.includes("gallery")) prefix = "gallery-";
    else if (req.originalUrl.includes("leads")) prefix = "lead-";
    else if (req.originalUrl.includes("blogs")) prefix = "blog-";
    else if (req.originalUrl.includes("invoices")) prefix = "invoice-";
    else if (req.originalUrl.includes("estimates")) prefix = "estimate-";
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
module.exports.upload = upload;
