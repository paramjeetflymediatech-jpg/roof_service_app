const mysql = require('mysql2/promise');
require('dotenv').config();

async function verifyState() {
    console.log("Environment:");
    console.log("Host:", process.env.MYSQL_HOST);
    console.log("User:", process.env.MYSQL_USER);
    console.log("Database:", process.env.MYSQL_DATABASE);

    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST || 'localhost',
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || 'root',
        database: process.env.MYSQL_DATABASE || 'roof_service'
    });

    try {
        console.log("\nAttempting raw query: SELECT content FROM blogs LIMIT 1");
        await connection.query("SELECT content FROM blogs LIMIT 1");
        console.log("✅ Query successful! 'content' column is accessible.");

        console.log("\nTable Structure:");
        const [rows] = await connection.query("DESCRIBE blogs");
        rows.forEach(row => {
            console.log(`- ${row.Field} (${row.Type})`);
        });

    } catch (e) {
        console.log("\n❌ Query failed!");
        console.error(e.message);
    } finally {
        await connection.end();
    }
}

if (require.main === module) {
    verifyState();
}
