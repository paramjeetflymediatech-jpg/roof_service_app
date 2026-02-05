require('dotenv').config();
const { User } = require('../models');
const connectDB = require('../config/db');

const seedAdmin = async () => {
    try {
        // Connect to MySQL
        await connectDB();
        console.log('Connected to MySQL');

        const email = 'admin@roofservice.com';

        // Check if admin already exists
        const existingAdmin = await User.findOne({ where: { email } });

        if (existingAdmin) {
            console.log('Admin user already exists!');
            console.log(`Email: ${email}`);
            process.exit(0);
        }

        // Create admin user
        await User.create({
            name: 'Admin',
            email: email,
            password: 'Admin@123',
            role: 'admin',
            isActive: true,
        });

        console.log('✅ Admin user created successfully!');
        console.log(`Email: ${email}`);
        console.log('Password: Admin@123');
        console.log('\n⚠️  Please change the password after first login!');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
