const { DataTypes } = require('sequelize');
const sequelize = require('../config/mysql');

const JobLog = sequelize.define('JobLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  jobId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'jobs',
      key: 'id',
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  action: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  oldStatus: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  newStatus: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'job_logs',
  timestamps: true,
  updatedAt: false, // Only track creation time for logs
});

// Define associations
JobLog.associate = (models) => {
  JobLog.belongsTo(models.Job, { foreignKey: 'jobId', as: 'job' });
  JobLog.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
};

module.exports = JobLog;
