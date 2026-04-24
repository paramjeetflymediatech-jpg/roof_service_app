const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  database: process.env.MYSQL_DATABASE || 'roof_service',
  username: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'root',
  dialect: 'mysql'
});

async function run() {
  try {
    const queryInterface = sequelize.getQueryInterface();
    await queryInterface.addColumn('estimates', 'images', {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of { filename, url }'
    });
    console.log('Column "images" added to "estimates" table successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error adding column:', error);
    process.exit(1);
  }
}

run();
