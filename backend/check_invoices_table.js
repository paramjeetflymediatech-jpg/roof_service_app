require('dotenv').config();
console.log('MYSQL_USER:', process.env.MYSQL_USER);
const { sequelize } = require('./src/models');
async function checkTable() {
  try {
    const [results] = await sequelize.query('DESCRIBE invoices');
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkTable();
