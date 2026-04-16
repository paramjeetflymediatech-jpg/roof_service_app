require('dotenv').config();
const { sequelize, User } = require('./src/models');
const bcrypt = require('bcryptjs');

async function syncAndSeed() {
  try {
    await sequelize.sync();
    console.log('✅ Tables synced successfully!');

    const adminCount = await User.count({ where: { email: 'admin@roofservice.com' } });
    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      await User.create({
        name: 'Super Admin',
        email: 'admin@roofservice.com',
        password: hashedPassword,
        role: 'admin',
        phone: '1234567890',
        isActive: true
      });
      console.log('✅ Admin user created!');
    } else {
      const admin = await User.findOne({ where: { email: 'admin@roofservice.com' } });
      admin.password = await bcrypt.hash('Admin@123', 10);
      await admin.save();
      console.log('✅ Admin user password fully reset to Admin@123');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

syncAndSeed();
