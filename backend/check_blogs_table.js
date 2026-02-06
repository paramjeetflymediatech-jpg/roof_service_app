const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkTable() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST || 'localhost',
        user: process.env.MYSQL_USER || 'aman',
        password: process.env.MYSQL_PASSWORD || 'aman1234',
        database: process.env.MYSQL_DATABASE || 'roof_service'
    });

    try {
        const [rows] = await connection.query("SHOW COLUMNS FROM blogs");
        console.log("Current columns in blogs table:");
        console.table(rows);
    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        await connection.end();
    }
}

checkTable();
