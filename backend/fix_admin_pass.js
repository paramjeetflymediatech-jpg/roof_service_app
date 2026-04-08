require('dotenv').config();
const { User } = require('./src/models');

async function fixPassword() {
  try {
    const admin = await User.findOne({ where: { email: 'admin@roofservice.com' } });
    if (admin) {
      admin.password = 'Admin@123';
      await admin.save();
      console.log('✅ Admin password successfully fixed and correctly hashed!');
    } else {
      console.log('Admin user not found');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixPassword();
