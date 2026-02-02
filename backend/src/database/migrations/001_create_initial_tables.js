/**
 * MySQL Migration Script
 * Creates initial tables for the roof_service_app
 *
 * Tables: users, leads, services, seo_metas
 *
 * Run with: node src/database/migrations/001_create_initial_tables.js
 */
const dotenv = require("dotenv");
dotenv.config();
const mysql = require("mysql2/promise");

async function runMigration() {
  // Database connection configuration
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "localhost",
    port: process.env.MYSQL_PORT || 3306,
    database: process.env.MYSQL_DATABASE || "roof_service",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "Param@1102",
  });

  console.log("Connected to MySQL database");

  try {
    // Drop existing tables in reverse order due to foreign key constraints
    console.log("Dropping existing tables (if any)...");
    await connection.query("DROP TABLE IF EXISTS seo_metas");
    await connection.query("DROP TABLE IF EXISTS sessions");
    await connection.query("DROP TABLE IF EXISTS leads");
    await connection.query("DROP TABLE IF EXISTS services");
    await connection.query("DROP TABLE IF EXISTS users");

    // Create users table
    console.log("Creating users table...");
    await connection.query(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(255) UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'user',
        is_active BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create services table
    console.log("Creating services table...");
    await connection.query(`
      CREATE TABLE services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        short_description VARCHAR(255),
        long_description TEXT,
        icon VARCHAR(255),
        featured_image_url VARCHAR(255),
        is_active BOOLEAN DEFAULT FALSE,
        base_price DECIMAL(10, 2),
        status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
        seo JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_slug (slug),
        INDEX idx_status (status),
        INDEX idx_category_id (category_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create leads table
    console.log("Creating leads table...");
    await connection.query(`
      CREATE TABLE leads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lead_type ENUM('contact', 'quote', 'callback', 'appointment') DEFAULT 'contact',
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(255),
        subject VARCHAR(255),
        message TEXT,
        address VARCHAR(255),
        city VARCHAR(255),
        province VARCHAR(255),
        service_type VARCHAR(255),
        roof_type VARCHAR(255),
        hear_about_us VARCHAR(255),
        service_id INT,
        source ENUM('website', 'mobile_app', 'other') DEFAULT 'website',
        status ENUM('new', 'in_progress', 'quoted', 'closed_won', 'closed_lost', 'spam') DEFAULT 'new',
        assigned_to_id INT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_phone (phone),
        INDEX idx_status (status),
        INDEX idx_service_id (service_id),
        INDEX idx_assigned_to_id (assigned_to_id),
        INDEX idx_created_at (created_at),
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL,
        FOREIGN KEY (assigned_to_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create seo_metas table
    console.log("Creating seo_metas table...");
    await connection.query(`
      CREATE TABLE seo_metas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        page_name VARCHAR(255) NOT NULL UNIQUE,
        page_title VARCHAR(100) NOT NULL,
        meta_description VARCHAR(200) NOT NULL,
        meta_robots VARCHAR(50) DEFAULT 'index, follow',
        og_title VARCHAR(100),
        og_description VARCHAR(200),
        og_image VARCHAR(255),
        canonical_url VARCHAR(255),
        schema_markup TEXT,
        google_analytics_id VARCHAR(255),
        google_tag_manager_id VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_page_name (page_name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create sessions table for express-session storage
    console.log("Creating sessions table...");
    await connection.query(`
      CREATE TABLE sessions (
        session_id VARCHAR(128) PRIMARY KEY,
        expires INT(11) NOT NULL,
        data TEXT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log("✅ Migration completed successfully!");
    console.log("");
    console.log("Created tables:");
    console.log("  - users");
    console.log("  - services");
    console.log("  - leads");
    console.log("  - seo_metas");
    console.log("  - sessions");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    throw error;
  } finally {
    await connection.end();
    console.log("Database connection closed.");
  }
}

// Run migration if executed directly
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log("Migration script finished.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Migration script failed:", err);
      process.exit(1);
    });
}

module.exports = runMigration;
