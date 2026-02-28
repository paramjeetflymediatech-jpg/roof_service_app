const { DataTypes } = require("sequelize");
const sequelize = require("../config/mysql");

const Gallery = sequelize.define(
  "Gallery",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "gallery",
    timestamps: true,
    underscored: true,
  },
);

module.exports = Gallery;
