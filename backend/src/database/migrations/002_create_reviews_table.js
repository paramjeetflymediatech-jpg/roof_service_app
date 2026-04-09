// const dotenv = require("dotenv");
// dotenv.config();
// const mysql = require("mysql2/promise");

// async function runMigration() {
//   const connection = await mysql.createConnection({
//     host: process.env.MYSQL_HOST || "localhost",
//     port: process.env.MYSQL_PORT || 3306,
//     database: process.env.MYSQL_DATABASE || "roof_service",
//     user: process.env.MYSQL_USER || "root",
//     password: process.env.MYSQL_PASSWORD || "root",
//   });

//   console.log("Connected to MySQL database for reviews migration");

//   try {
//     console.log("Creating reviews table...");
//     await connection.query(`
//       CREATE TABLE IF NOT EXISTS reviews (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         google_review_id VARCHAR(255) NOT NULL UNIQUE,
//         author_name VARCHAR(255) NOT NULL,
//         author_photo VARCHAR(500) NULL,
//         rating INT NOT NULL,
//         text TEXT NULL,
//         relative_time_description VARCHAR(255) NULL,
//         time DATETIME NOT NULL,
//         is_visible BOOLEAN DEFAULT TRUE,
//         created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//         updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
//       ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
//     `);
//     console.log("✅ Reviews migration completed successfully!");
//   } catch (error) {
//     console.error("❌ Reviews migration failed:", error.message);
//     throw error;
//   } finally {
//     await connection.end();
//     console.log("Database connection closed.");
//   }
// }

// if (require.main === module) {
//   runMigration()
//     .then(() => {
//       console.log("Migration script finished.");
//       process.exit(0);
//     })
//     .catch((err) => {
//       console.error("Migration script failed:", err);
//       process.exit(1);
//     });
// }

// module.exports = runMigration;



const path = require("path");
const dotenv = require("dotenv");

// ✅ Force load .env from root (works reliably on server)
dotenv.config({ path: path.resolve(__dirname, ".env") });

const mysql = require("mysql2/promise");

async function runMigration() {
  // ✅ Debug ENV (remove after testing)
  console.log("ENV CHECK:", {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USER,
  });

  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "localhost",
    port: Number(process.env.MYSQL_PORT) || 3306,
    database: process.env.MYSQL_DATABASE || "roof_service",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "root",
  });

  console.log("✅ Connected to MySQL database for reviews migration");

  try {
    console.log("📦 Creating reviews table...");

    await connection.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        google_review_id VARCHAR(255) NOT NULL UNIQUE,
        author_name VARCHAR(255) NOT NULL,
        author_photo VARCHAR(500) NULL,
        rating INT NOT NULL,
        text TEXT NULL,
        relative_time_description VARCHAR(255) NULL,
        time DATETIME NOT NULL,
        is_visible BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB 
      DEFAULT CHARSET=utf8mb4 
      COLLATE=utf8mb4_unicode_ci
    `);

    console.log("🎉 Reviews migration completed successfully!");
  } catch (error) {
    console.error("❌ Reviews migration failed:");
    console.error(error); // full error (important for debugging)
    throw error;
  } finally {
    await connection.end();
    console.log("🔌 Database connection closed.");
  }
}

// ✅ Run only if executed directly
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log("✅ Migration script finished.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Migration script failed:", err.message);
      process.exit(1);
    });
}

module.exports = runMigration;