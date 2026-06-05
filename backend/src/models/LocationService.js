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
  },
  {
    tableName: "location_services",
    timestamps: false,
    underscored: true,
  }
);

module.exports = LocationService;
