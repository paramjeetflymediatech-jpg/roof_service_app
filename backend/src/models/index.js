const { DataTypes } = require('sequelize');
const sequelize = require('../config/mysql');

// Import models
const User = require('./User');
const Lead = require('./Lead');
const Service = require('./Service');
const SeoMeta = require('./SeoMeta');

// Define associations
// Lead associations
Lead.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });
Lead.belongsTo(User, { foreignKey: 'assignedToId', as: 'assignedTo' });

// Service associations
Service.hasMany(Lead, { foreignKey: 'serviceId', as: 'leads' });
User.hasMany(Lead, { foreignKey: 'assignedToId', as: 'assignedLeads' });

// Export sequelize and models
module.exports = {
  sequelize,
  User,
  Lead,
  Service,
  SeoMeta
};
