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
  // Mobile app status flow: new -> pending -> reviewed -> approved -> assigned -> in_progress -> completed
  status: {
    type: DataTypes.ENUM('pending', 'reviewed', 'paused', 'approved', 'rejected', 'assigned', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'pending',
  },
  assignedToId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id',
    },
  },
  // Employee time tracking
  inTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  outTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // Employee-entered start/end times (text, e.g. "09:00", "17:30")
  employeeStartTime: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  employeeEndTime: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  employeeNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Client images for quote request
  clientImages: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  // Completion images from employee
  completionImages: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  preferredDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'leads',
  timestamps: true,
});

// Define associations
Lead.associate = (models) => {
  Lead.belongsTo(models.Service, { foreignKey: 'serviceId', as: 'service' });
  Lead.belongsTo(models.User, { foreignKey: 'assignedToId', as: 'assignedTo' });
  Lead.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  Lead.hasMany(models.Job, { foreignKey: 'leadId', as: 'jobs' });
  Lead.hasMany(models.JobWorkSession, { foreignKey: 'leadId', as: 'workSessions' });
  Lead.hasMany(models.JobLog, { foreignKey: 'leadId', as: 'logs' });
};

module.exports = Lead;
