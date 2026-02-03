/**
 * MySQL Alter Table Migration Script
 * Adds missing columns to the leads table for roof_service_app
 *
 * Run with: node src/database/migrations/002_alter_leads_add_columns.js
 */
const dotenv = require("dotenv");
dotenv.config();
const mysql = require("mysql2/promise");

async function runAlterMigration() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "localhost",
    port: process.env.MYSQL_PORT || 3306,
    database: process.env.MYSQL_DATABASE || "roof_service",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "root",
  });

  console.log("Connected to MySQL database");

  try {
    console.log("Altering leads table to add missing columns...");

    // Add columns only if they do not exist
    const alterQueries = [
      `ALTER TABLE leads ADD COLUMN IF NOT EXISTS in_time DATETIME NULL`,
      `ALTER TABLE leads ADD COLUMN IF NOT EXISTS out_time DATETIME NULL`,
      `ALTER TABLE leads ADD COLUMN IF NOT EXISTS employee_notes TEXT NULL`,
      `ALTER TABLE leads ADD COLUMN IF NOT EXISTS client_images JSON NULL`,
      `ALTER TABLE leads ADD COLUMN IF NOT EXISTS completion_images JSON NULL`,
      `ALTER TABLE leads ADD COLUMN IF NOT EXISTS preferred_date DATETIME NULL`,
      `ALTER TABLE users MODIFY role ENUM('admin', 'user', 'employee') NOT NULL DEFAULT 'user'`
    ];

    for (const query of alterQueries) {
      await connection.query(query);
    }

    console.log("✅ Leads table updated successfully!");
  } catch (error) {
    console.error("❌ Alter table migration failed:", error.message);
    throw error;
  } finally {
    await connection.end();
    console.log("Database connection closed.");
  }
}

// Run migration if executed directly
if (require.main === module) {
  runAlterMigration()
    .then(() => {
      console.log("Alter migration script finished.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Alter migration script failed:", err);
      process.exit(1);
    });
}

module.exports = runAlterMigration;
