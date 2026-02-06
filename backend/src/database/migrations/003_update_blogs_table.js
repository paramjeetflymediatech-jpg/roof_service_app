const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateBlogsTable() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST || 'localhost',
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || 'root',
        database: process.env.MYSQL_DATABASE || 'roof_service'
    });

    console.log("Connected to database. Updating blogs table...");

    try {
        const queries = [
            "ALTER TABLE blogs ADD COLUMN IF NOT EXISTS content LONGTEXT NOT NULL", // content is required in model
            "ALTER TABLE blogs ADD COLUMN IF NOT EXISTS excerpt TEXT",
            "ALTER TABLE blogs ADD COLUMN IF NOT EXISTS image VARCHAR(255) DEFAULT ''",
            "ALTER TABLE blogs ADD COLUMN IF NOT EXISTS author VARCHAR(255) DEFAULT 'Admin'",
            "ALTER TABLE blogs ADD COLUMN IF NOT EXISTS tags JSON",
            "ALTER TABLE blogs MODIFY COLUMN status ENUM('draft', 'published') DEFAULT 'published'",
            "ALTER TABLE blogs ADD COLUMN IF NOT EXISTS metaTitle VARCHAR(255)",
            "ALTER TABLE blogs ADD COLUMN IF NOT EXISTS metaDescription VARCHAR(255)",
            "ALTER TABLE blogs ADD COLUMN IF NOT EXISTS metaRobots VARCHAR(255) DEFAULT 'index, follow'",
            "ALTER TABLE blogs ADD COLUMN IF NOT EXISTS ogTitle VARCHAR(255)",
            "ALTER TABLE blogs ADD COLUMN IF NOT EXISTS ogDescription VARCHAR(255)",
            "ALTER TABLE blogs ADD COLUMN IF NOT EXISTS ogImage VARCHAR(255)",
            "ALTER TABLE blogs ADD COLUMN IF NOT EXISTS canonicalUrl VARCHAR(255)",
            "ALTER TABLE blogs ADD COLUMN IF NOT EXISTS schemaMarkup TEXT",
            "ALTER TABLE blogs ADD COLUMN IF NOT EXISTS googleAnalyticsId VARCHAR(255)",
            "ALTER TABLE blogs ADD COLUMN IF NOT EXISTS googleTagManagerId VARCHAR(255)"
        ];

        for (const query of queries) {
            try {
                await connection.query(query);
                console.log(`Executed: ${query.substring(0, 50)}...`);
            } catch (err) {
                // Ignore duplicate column errors or minor issues, but log them
                if (err.code !== 'ER_DUP_FIELDNAME') {
                    console.warn(`Warning executing query: ${err.message}`);
                }
            }
        }

        console.log("✅ Blogs table updated successfully!");
    } catch (error) {
        console.error("❌ Error updating blogs table:", error.message);
    } finally {
        await connection.end();
    }
}

if (require.main === module) {
    updateBlogsTable();
}
