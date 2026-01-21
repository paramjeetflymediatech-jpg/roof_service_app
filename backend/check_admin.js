const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/roof_service');
        console.log('MongoDB Connected');

        const email = 'admin@roofservice.com';
        const password = 'Admin@123';

        let user = await User.findOne({ email });

        if (user) {
            console.log('Admin user exists:', user.email);
            // Verify password
            const isMatch = await user.comparePassword(password);
            console.log('Password match:', isMatch);

            if (!isMatch) {
                console.log('Updating password...');
                user.password = password;
                await user.save();
                console.log('Password updated.');
            }
        } else {
            console.log('Admin user not found. Creating...');
            user = new User({
                name: 'Admin User',
                email,
                password,
                role: 'admin',
                isActive: true
            });
            await user.save();
            console.log('Admin user created.');
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

connectDB();
