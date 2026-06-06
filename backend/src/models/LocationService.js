const { DataTypes } = require("sequelize");
const sequelize = require("../config/mysql");

const LocationService = sequelize.define(
  "LocationService",
  {
    locationId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: "locations",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    serviceId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: "services",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shortDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    longDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    whyChooseUs: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    seo: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: "location_services",
    timestamps: false,
    underscored: true,
  }
);

module.exports = LocationService;
