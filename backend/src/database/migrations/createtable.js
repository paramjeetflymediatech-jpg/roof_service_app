/**
 * MySQL Migration Script
 * Creates initial tables for the roof_service_app
 *
 * Tables: users, services, leads, seo_metas, sessions
 *
 * Run with: node src/database/migrations/001_create_initial_tables.js
 */
const dotenv = require("dotenv");
dotenv.config();
const mysql = require("mysql2/promise"); // use promise API

async function runMigration() {
  // Database connection configuration
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "localhost",
    port: process.env.MYSQL_PORT || 3306,
    database: process.env.MYSQL_DATABASE || "roof_service",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "root",
  });

  console.log("Connected to MySQL database");

  try {
    // Drop existing tables in reverse order due to foreign key constraints
    console.log("Dropping existing tables (if any)...");
    await connection.query("DROP TABLE IF EXISTS job_logs");
    await connection.query("DROP TABLE IF EXISTS jobs");
    await connection.query("DROP TABLE IF EXISTS lead_images");
    await connection.query("DROP TABLE IF EXISTS leads");
    await connection.query("DROP TABLE IF EXISTS seo_metas");
    await connection.query("DROP TABLE IF EXISTS sessions");
    await connection.query("DROP TABLE IF EXISTS services");
    await connection.query("DROP TABLE IF EXISTS users");
    await connection.query("DROP TABLE IF EXISTS blogs");
    await connection.query("DROP TABLE IF EXISTS galleries");
    await connection.query("DROP TABLE IF EXISTS service_categories");
    await connection.query("DROP TABLE IF EXISTS gallery");

    // Create users table
    console.log("Creating users table...");
    await connection.query(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(255) UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user','employee') DEFAULT 'user',
        is_active BOOLEAN DEFAULT TRUE,
        reset_password_token VARCHAR(255),
        reset_password_expire DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create leads table with all fields from your Sequelize model
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
        status ENUM('pending', 'reviewed', 'approved', 'rejected', 'assigned', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
        assigned_to_id INT,
        user_id INT,
        in_time DATETIME NULL,
        out_time DATETIME NULL,
        employee_start_time VARCHAR(20),
        employee_end_time VARCHAR(20),
        employee_notes TEXT NULL,
        client_images JSON NULL,
        completion_images JSON NULL,
        preferred_date DATETIME NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL,
        FOREIGN KEY (assigned_to_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
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
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create sessions table for express-session
    console.log("Creating sessions table...");
    await connection.query(`
      CREATE TABLE sessions (
        session_id VARCHAR(128) PRIMARY KEY,
        expires INT(11) NOT NULL,
        data TEXT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    // Create lead_images table for images associated with leads
    console.log("Creating sessions lead_images...");
    await connection.query(`
      CREATE TABLE lead_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lead_id INT NOT NULL,
        filename VARCHAR(255),
        path VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
     ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

    // Create jobs table
    console.log("Creating jobs table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lead_id INT NOT NULL,
        employee_id INT NOT NULL,
        assigned_by_id INT NULL,
        status ENUM('pending', 'accepted', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        scheduled_date DATETIME NULL,
        start_time DATETIME NULL,
        end_time DATETIME NULL,
        estimated_hours DECIMAL(5, 2) NULL,
        actual_hours DECIMAL(5, 2) NULL,
        notes TEXT NULL,
        employee_notes TEXT NULL,
        completion_notes TEXT NULL,
        before_images JSON NULL,
        after_images JSON NULL,
        materials_used JSON NULL,
        labor_cost DECIMAL(10, 2) NULL,
        material_cost DECIMAL(10, 2) NULL,
        total_cost DECIMAL(10, 2) NULL,
        client_signature VARCHAR(255) NULL,
        client_rating INT NULL,
        client_feedback TEXT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
        FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_by_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create job_logs table for tracking job status changes
    console.log("Creating job_logs table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS job_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        job_id INT NOT NULL,
        user_id INT NOT NULL,
        action VARCHAR(100) NOT NULL,
        old_status VARCHAR(50) NULL,
        new_status VARCHAR(50) NULL,
        notes TEXT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        content LONGTEXT NOT NULL,
        excerpt TEXT,
        image VARCHAR(255) DEFAULT '',
        author VARCHAR(255) DEFAULT 'Admin',
        tags JSON,
        status ENUM('draft', 'published') DEFAULT 'published',
        meta_title VARCHAR(255),
        meta_description VARCHAR(255),
        meta_robots VARCHAR(255) DEFAULT 'index, follow',
        og_title VARCHAR(255),
        og_description VARCHAR(255),
        og_image VARCHAR(255),
        canonical_url VARCHAR(255),
        schema_markup TEXT,
        google_analytics_id VARCHAR(255),
        google_tag_manager_id VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`create table if not exists gallery  (
      id INT AUTO_INCREMENT PRIMARY KEY,
      imageUrl VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(255) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    await connection.query(`create table if not exists service_categories  (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      icon VARCHAR(255) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    console.log("✅ Migration completed successfully!");
    console.log("Created tables: users, services, leads, seo_metas, sessions");
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
