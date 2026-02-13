const { DataTypes } = require("sequelize");
const sequelize = require("../config/mysql");

// Import models
// Import models
const User = require("./User");
const Lead = require("./Lead");
const Service = require("./Service");
const SeoMeta = require("./SeoMeta");
const Job = require("./Job");
const JobLog = require("./JobLog");
const Blog = require("./Blog");
const ServiceCategory = require("./ServiceCategory");
const Gallery = require("./Gallery");
const DataDeletionRequest = require("./DataDeletionRequest");

// Define associations
// Lead associations
Lead.belongsTo(Service, { foreignKey: "serviceId", as: "service" });
Lead.belongsTo(User, { foreignKey: "assignedToId", as: "assignedTo" });
Lead.belongsTo(User, { foreignKey: "userId", as: "user" });

// Service / ServiceCategory associations
ServiceCategory.hasMany(Service, { foreignKey: "categoryId", as: "services" });
Service.belongsTo(ServiceCategory, {
  foreignKey: "categoryId",
  as: "category",
});

// Service / User associations
Service.hasMany(Lead, { foreignKey: "serviceId", as: "leads" });
User.hasMany(Lead, { foreignKey: "assignedToId", as: "assignedLeads" });
User.hasMany(Lead, { foreignKey: "userId", as: "userLeads" });

// Job associations
Job.belongsTo(Lead, { foreignKey: "leadId", as: "lead" });
Job.belongsTo(User, { foreignKey: "employeeId", as: "employee" });
Job.belongsTo(User, { foreignKey: "assignedById", as: "assignedBy" });
Job.hasMany(JobLog, { foreignKey: "jobId", as: "logs" });

// JobLog associations
JobLog.belongsTo(Job, { foreignKey: "jobId", as: "job" });
JobLog.belongsTo(User, { foreignKey: "userId", as: "user" });

// User job associations
User.hasMany(Job, { foreignKey: "employeeId", as: "employeeJobs" });
User.hasMany(Job, { foreignKey: "assignedById", as: "assignedJobs" });

// Lead job association
Lead.hasMany(Job, { foreignKey: "leadId", as: "jobs" });

// Export sequelize and models
module.exports = {
  sequelize,
  User,
  Lead,
  Service,
  SeoMeta,
  Job,
  JobLog,
  Blog,
  ServiceCategory,
  Gallery,
  DataDeletionRequest,
};
