require('dotenv').config();
const { sequelize } = require('../models');

const checkTables = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected');
        const [results] = await sequelize.query('SHOW TABLES');
        console.log('Tables:', results);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkTables();
