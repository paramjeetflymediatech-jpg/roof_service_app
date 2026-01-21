require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@roofservice.com' });

        if (existingAdmin) {
            console.log('Admin user already exists!');
            console.log('Email: admin@roofservice.com');
            process.exit(0);
        }

        // Create admin user
        const admin = new User({
            name: 'Admin',
            email: 'admin@roofservice.com',
            password: 'Admin@123',
            role: 'admin',
            isActive: true,
        });

        await admin.save();

        console.log('✅ Admin user created successfully!');
        console.log('Email: admin@roofservice.com');
        console.log('Password: Admin@123');
        console.log('\n⚠️  Please change the password after first login!');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
