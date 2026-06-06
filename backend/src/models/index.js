const { DataTypes } = require("sequelize");
const sequelize = require("../config/mysql");

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
const Estimate = require("./Estimate");
const Invoice = require("./Invoice");
const JobWorkSession = require("./JobWorkSession");
const Review = require("./Review");
const Location = require("./Location");
const LocationService = require("./LocationService");

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

// JobWorkSession associations
JobWorkSession.belongsTo(Job, { foreignKey: "jobId", as: "job" });
JobWorkSession.belongsTo(User, { foreignKey: "userId", as: "user" });
JobWorkSession.belongsTo(Lead, { foreignKey: "leadId", as: "lead" });

// Lead associations
Lead.hasMany(JobWorkSession, { foreignKey: "leadId", as: "workSessions" });

// Job associations
Job.belongsTo(Lead, { foreignKey: "leadId", as: "lead" });
Job.belongsTo(User, { foreignKey: "employeeId", as: "employee" });
Job.belongsTo(User, { foreignKey: "assignedById", as: "assignedBy" });
Job.hasMany(JobLog, { foreignKey: "jobId", as: "logs" });

// JobLog associations
JobLog.belongsTo(Job, { foreignKey: "jobId", as: "job" });
JobLog.belongsTo(User, { foreignKey: "userId", as: "user" });
JobLog.belongsTo(Lead, { foreignKey: "leadId", as: "lead" });

// Lead associations (extended)
Lead.hasMany(JobLog, { foreignKey: "leadId", as: "logs" });

// User job associations
User.hasMany(Job, { foreignKey: "employeeId", as: "employeeJobs" });
User.hasMany(Job, { foreignKey: "assignedById", as: "assignedJobs" });

Job.hasMany(JobWorkSession, { foreignKey: "jobId", as: "workSessions" });

// Lead job association
Lead.hasMany(Job, { foreignKey: "leadId", as: "jobs" });

// Estimate associations
Estimate.belongsTo(User, { foreignKey: "createdById", as: "createdBy" });
User.hasMany(Estimate, { foreignKey: "createdById", as: "estimates" });

// Lead-Estimate association
Lead.hasMany(Estimate, { foreignKey: "leadId", as: "estimates" });
Estimate.belongsTo(Lead, { foreignKey: "leadId", as: "lead" });

// Invoice associations
Invoice.belongsTo(User, { foreignKey: "createdById", as: "createdBy" });
User.hasMany(Invoice, { foreignKey: "createdById", as: "invoices" });
Invoice.belongsTo(Estimate, { foreignKey: "estimateId", as: "estimate" });
Estimate.hasMany(Invoice, { foreignKey: "estimateId", as: "invoices" });
Lead.hasMany(Invoice, { foreignKey: "leadId", as: "invoices" });
Invoice.belongsTo(Lead, { foreignKey: "leadId", as: "lead" });

// Service / Location many-to-many associations
Service.belongsToMany(Location, {
  through: LocationService,
  foreignKey: "serviceId",
  otherKey: "locationId",
  as: "locations",
});
Location.belongsToMany(Service, {
  through: LocationService,
  foreignKey: "locationId",
  otherKey: "serviceId",
  as: "services",
});

LocationService.belongsTo(Location, {
  foreignKey: "locationId",
  as: "location",
});
LocationService.belongsTo(Service, {
  foreignKey: "serviceId",
  as: "service",
});
Location.hasMany(LocationService, {
  foreignKey: "locationId",
  as: "locationServices",
});
Service.hasMany(LocationService, {
  foreignKey: "serviceId",
  as: "locationServices",
});

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
  Estimate,
  Invoice,
  JobWorkSession,
  Review,
  Location,
  LocationService,
};
