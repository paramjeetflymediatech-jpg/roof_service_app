const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixTimestamps() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST || 'localhost',
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || 'root',
        database: process.env.MYSQL_DATABASE || 'roof_service'
    });

    console.log("Connected to database. Fixing timestamp columns...");

    try {
        // Check if created_at exists
        const [columns] = await connection.query("SHOW COLUMNS FROM blogs LIKE 'created_at'");
        if (columns.length > 0) {
            await connection.query("ALTER TABLE blogs CHANGE created_at createdAt DATETIME DEFAULT CURRENT_TIMESTAMP");
            console.log("Renamed created_at to createdAt");
        } else {
            console.log("created_at not found (maybe already renamed)");
        }

        // Check if updated_at exists
        const [columns2] = await connection.query("SHOW COLUMNS FROM blogs LIKE 'updated_at'");
        if (columns2.length > 0) {
            await connection.query("ALTER TABLE blogs CHANGE updated_at updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
            console.log("Renamed updated_at to updatedAt");
        } else {
            console.log("updated_at not found (maybe already renamed)");
        }

        console.log("✅ Timestamp columns fixed!");
    } catch (error) {
        console.error("❌ Error fixing timestamps:", error.message);
    } finally {
        await connection.end();
    }
}

if (require.main === module) {
    fixTimestamps();
}
