const express = require("express");
const app = express();
require("dotenv").config();

try {
  const adminRoutes = require("./src/routes/admin.routes");
  app.use("/admin", adminRoutes);
  console.log("Admin routes loaded successfully.");
  process.exit(0);
} catch (error) {
  console.error("Error loading admin routes:", error);
  process.exit(1);
}
