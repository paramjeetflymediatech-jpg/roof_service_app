const { User } = require('./src/models');
const connectDB = require('./src/config/db');
require('dotenv').config();

const checkAdmin = async () => {
    try {
        // Connect to MySQL
        await connectDB();
        console.log('MySQL Connected');

        const email = 'admin@roofservice.com';
        const password = 'Admin@123';

        let user = await User.findOne({ where: { email } });

        if (user) {
            console.log(`Admin user exists: ${user.email}`);
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
            user = await User.create({
                name: 'Admin User',
                email: email,
                password: password,
                role: 'admin',
                isActive: true
            });
            console.log('Admin user created.');
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkAdmin();
