const { DataTypes } = require("sequelize");
const sequelize = require("../config/mysql");
const DataDeletionRequest = sequelize.define(
  "DataDeletionRequest",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "processing", "completed", "rejected"),
      defaultValue: "pending",
      allowNull: false,
    },
    requestedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    processedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "User ID of admin who processed the request",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Admin notes or reason for rejection",
    },
  },
  {
    tableName: "data_deletion_requests",
    timestamps: true,
  },
);

module.exports = DataDeletionRequest;
