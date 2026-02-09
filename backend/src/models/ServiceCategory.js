const { DataTypes } = require("sequelize");
const sequelize = require("../config/mysql");

const ServiceCategory = sequelize.define(
  "ServiceCategory",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "service_categories",
    timestamps: true,
  },
);

module.exports = ServiceCategory;
