const { DataTypes } = require("sequelize");
const sequelize = require("../config/mysql");

const Estimate = sequelize.define(
  "Estimate",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    estimateNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    clientName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    clientEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    clientPhone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    clientAddress: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    expiryDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    items: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      comment: "Array of { description, rate, qty, amount }",
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    applyGst: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    applyPst: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    tax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    timeEstimate: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("Draft", "Sent", "Accepted", "Rejected"),
      defaultValue: "Draft",
    },
    createdById: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    leadId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "leads",
        key: "id",
      },
    },
  },
  {
    tableName: "estimates",
    timestamps: true,
  },
);

module.exports = Estimate;
