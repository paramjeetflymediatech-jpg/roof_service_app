require('dotenv').config();
const { sequelize, User, Service, Lead, Job, JobLog, Blog, SeoMeta } = require('../models');

const syncDb = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to MySQL');

        // Sync models in order of dependency
        console.log('Syncing Users...');
        await User.sync({ alter: true });

        console.log('Syncing Services...');
        await Service.sync({ alter: true });

        console.log('Syncing Blogs...');
        await Blog.sync({ alter: true });

        console.log('Syncing SeoMeta...');
        await SeoMeta.sync({ alter: true });

        console.log('Syncing Leads...');
        await Lead.sync({ alter: true });

        console.log('Syncing Jobs...');
        await Job.sync({ alter: true });

        console.log('Syncing JobLogs...');
        await JobLog.sync({ alter: true });

        console.log('✅ Database synchronized successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error synchronizing database:');
        console.error(error.message);
        if (error.original) {
            console.error('Original SQL Error:', error.original);
        }
        process.exit(1);
    }
};

syncDb();
