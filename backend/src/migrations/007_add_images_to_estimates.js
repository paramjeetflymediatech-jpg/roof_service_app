const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('estimates', 'images', {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of { filename, url }'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('estimates', 'images');
  }
};
