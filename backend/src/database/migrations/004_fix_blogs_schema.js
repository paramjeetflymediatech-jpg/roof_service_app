const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixBlogsSchema() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST || 'localhost',
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || 'root',
        database: process.env.MYSQL_DATABASE || 'roof_service'
    });

    console.log("Connected to database. Checking 'blogs' schema...");

    try {
        // 1. Add missing columns (including 'content' which is the main crasher)
        const columnsToAdd = [
            { name: 'content', definition: 'LONGTEXT NOT NULL' },
            { name: 'excerpt', definition: 'TEXT' },
            { name: 'image', definition: 'VARCHAR(255) DEFAULT ""' },
            { name: 'author', definition: 'VARCHAR(255) DEFAULT "Admin"' },
            { name: 'tags', definition: 'JSON' },
            { name: 'meta_title', definition: 'VARCHAR(255)' },
            { name: 'meta_description', definition: 'VARCHAR(255)' },
            { name: 'meta_robots', definition: 'VARCHAR(255) DEFAULT "index, follow"' },
            { name: 'og_title', definition: 'VARCHAR(255)' },
            { name: 'og_description', definition: 'VARCHAR(255)' },
            { name: 'og_image', definition: 'VARCHAR(255)' },
            { name: 'canonical_url', definition: 'VARCHAR(255)' },
            { name: 'schema_markup', definition: 'TEXT' },
            { name: 'google_analytics_id', definition: 'VARCHAR(255)' },
            { name: 'google_tag_manager_id', definition: 'VARCHAR(255)' }
        ];

        for (const col of columnsToAdd) {
            // Check existence
            const [rows] = await connection.query(`SHOW COLUMNS FROM blogs LIKE '${col.name}'`);
            if (rows.length === 0) {
                // If not found, maybe it exists as camelCase?
                // Let's rely on Step 2 to fix renaming. For now, we only add if MISSING (and no camelCase variant found).

                // Construct camelCase version to check
                const camelName = col.name.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
                const [camelRows] = await connection.query(`SHOW COLUMNS FROM blogs LIKE '${camelName}'`);

                if (camelRows.length > 0) {
                    console.log(`Column '${camelName}' found. Will reuse/rename it in Step 2.`);
                } else {
                    console.log(`Adding missing column: ${col.name}`);
                    await connection.query(`ALTER TABLE blogs ADD COLUMN \`${col.name}\` ${col.definition}`);
                }
            } else {
                console.log(`Column ${col.name} already exists. OK.`);
            }
        }

        // 2. Fix casing (camelCase -> snake_case)
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
            { name: 'googleTagManagerId', new: 'google_tag_manager_id', type: 'VARCHAR(255)' }
        ];

        for (const item of renames) {
            const [rows] = await connection.query(`SHOW COLUMNS FROM blogs LIKE '${item.old}'`);
            if (rows.length > 0) {
                // Rename
                console.log(`Renaming ${item.old} -> ${item.new}`);
                // Check if target already exists (collision)
                const [targetRows] = await connection.query(`SHOW COLUMNS FROM blogs LIKE '${item.new}'`);
                if (targetRows.length > 0) {
                    console.warn(`Target column ${item.new} already exists! Skipping rename to avoid collision. manually check data.`);
                } else {
                    await connection.query(`ALTER TABLE blogs CHANGE \`${item.old}\` \`${item.new}\` ${item.type}`);
                }
            }
        }

        console.log("✅ Schema fix completed!");
    } catch (e) {
        console.error("❌ Error fixing schema:", e.message);
    } finally {
        await connection.end();
    }
}

if (require.main === module) {
    fixBlogsSchema();
}
