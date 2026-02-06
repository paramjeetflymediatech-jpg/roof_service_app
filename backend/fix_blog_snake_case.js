const mysql = require('mysql2/promise');
require('dotenv').config();

async function toSnakeCase() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST || 'localhost',
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || 'root',
        database: process.env.MYSQL_DATABASE || 'roof_service'
    });

    console.log("Connected to database. converting columns to snake_case...");

    const renames = [
        { old: 'createdAt', new: 'created_at', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' },
        { old: 'updatedAt', new: 'updated_at', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' },
        { old: 'metaTitle', new: 'meta_title', type: 'VARCHAR(255)' },
        { old: 'metaDescription', new: 'meta_description', type: 'VARCHAR(255)' },
        { old: 'metaRobots', new: 'meta_robots', type: 'VARCHAR(255) DEFAULT \'index, follow\'' },
        { old: 'ogTitle', new: 'og_title', type: 'VARCHAR(255)' },
        { old: 'ogDescription', new: 'og_description', type: 'VARCHAR(255)' },
        { old: 'ogImage', new: 'og_image', type: 'VARCHAR(255)' },
        { old: 'canonicalUrl', new: 'canonical_url', type: 'VARCHAR(255)' },
        { old: 'schemaMarkup', new: 'schema_markup', type: 'TEXT' },
        { old: 'googleAnalyticsId', new: 'google_analytics_id', type: 'VARCHAR(255)' },
        { old: 'googleTagManagerId', new: 'google_tag_manager_id', type: 'VARCHAR(255)' }
    ];

    try {
        for (const item of renames) {
            // Check if old column exists
            const [columns] = await connection.query(`SHOW COLUMNS FROM blogs LIKE '${item.old}'`);
            if (columns.length > 0) {
                // Rename
                const query = `ALTER TABLE blogs CHANGE \`${item.old}\` \`${item.new}\` ${item.type}`;
                await connection.query(query);
                console.log(`Renamed ${item.old} -> ${item.new}`);
            } else {
                console.log(`${item.old} not found (checking if ${item.new} exists...)`);
                const [columnsNew] = await connection.query(`SHOW COLUMNS FROM blogs LIKE '${item.new}'`);
                if (columnsNew.length > 0) {
                    console.log(`  ${item.new} already exists. OK.`);
                } else {
                    console.log(`  Neither ${item.old} nor ${item.new} found. Adding ${item.new}...`);
                    await connection.query(`ALTER TABLE blogs ADD COLUMN \`${item.new}\` ${item.type}`);
                    console.log(`  Added ${item.new}`);
                }
            }
        }

        console.log("✅ Columns updated to snake_case!");
    } catch (error) {
        console.error("❌ Error updating columns:", error.message);
    } finally {
        await connection.end();
    }
}

if (require.main === module) {
    toSnakeCase();
}
