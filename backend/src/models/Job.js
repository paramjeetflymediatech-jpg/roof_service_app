const { DataTypes } = require("sequelize");
const sequelize = require("../config/mysql");

const Job = sequelize.define(
  "Job",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    leadId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "leads",
        key: "id",
      },
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    assignedById: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "assigned_by_id",
      references: {
        model: "users",
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "accepted",
        "in_progress",
        "paused",
        "completed",
        "cancelled",
      ),
      defaultValue: "pending",
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high", "urgent"),
      defaultValue: "medium",
    },
    scheduledDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    timeSlot: {
      type: DataTypes.ENUM("morning", "afternoon", "evening"),
      allowNull: true,
      field: "time_slot",
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    estimatedHours: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    actualHours: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    employeeNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    completionNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    beforeImages: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    afterImages: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    materialsUsed: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    laborCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    materialCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    totalCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    clientSignature: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    clientRating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
    },
    clientFeedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "jobs",
    timestamps: true,
  },
);

// Define associations
Job.associate = (models) => {
  Job.belongsTo(models.Lead, { foreignKey: "leadId", as: "lead" });
  Job.belongsTo(models.User, { foreignKey: "employeeId", as: "employee" });
  Job.belongsTo(models.User, { foreignKey: "assignedById", as: "assignedBy" });
  Job.hasMany(models.JobLog, { foreignKey: "jobId", as: "logs" });
  Job.hasMany(models.JobWorkSession, {
    foreignKey: "jobId",
    as: "workSessions",
  });
};

module.exports = Job;
