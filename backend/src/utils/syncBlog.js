require('dotenv').config();
const { sequelize } = require('../models');
const Blog = require('../models/Blog');

const syncBlog = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to MySQL');

        console.log('Syncing Blog table...');
        await Blog.sync({ alter: true });
        console.log('✅ Blog table synced successfully');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error syncing Blog table:', error);
        process.exit(1);
    }
};

syncBlog();
