const { DataTypes } = require('sequelize');
const sequelize = require('../config/mysql');
const Service = require('./Service');
const User = require('./User');

const Lead = sequelize.define('Lead', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  leadType: {
    type: DataTypes.ENUM('contact', 'quote', 'callback', 'appointment'),
    defaultValue: 'contact',
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    lowercase: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Additional quote form fields
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  province: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  serviceType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  roofType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  hearAboutUs: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  serviceId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'services',
      key: 'id',
    },
  },
  source: {
    type: DataTypes.ENUM('website', 'mobile_app', 'other'),
    defaultValue: 'website',
  },
  status: {
    type: DataTypes.ENUM('new', 'in_progress', 'quoted', 'closed_won', 'closed_lost', 'spam'),
    defaultValue: 'new',
  },
  assignedToId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'leads',
  timestamps: true,
});

// Define associations
Lead.associate = (models) => {
  Lead.belongsTo(models.Service, { foreignKey: 'serviceId', as: 'service' });
  Lead.belongsTo(models.User, { foreignKey: 'assignedToId', as: 'assignedTo' });
};

module.exports = Lead;
