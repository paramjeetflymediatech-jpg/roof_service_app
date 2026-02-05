const sequelize = require('./mysql');

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL connected successfully');
  } catch (err) {
    console.error('❌ MySQL connection error:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
