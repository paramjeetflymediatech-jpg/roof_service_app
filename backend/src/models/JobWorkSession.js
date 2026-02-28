const { DataTypes } = require('sequelize');
const sequelize = require('../config/mysql');

const JobWorkSession = sequelize.define('JobWorkSession', {
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
    leadId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'leads',
            key: 'id',
        },
    },
    startTime: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    endTime: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    duration: {
        type: DataTypes.DECIMAL(10, 4), // Store duration in decimal hours
        allowNull: true,
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'job_work_sessions',
    timestamps: true,
});

// Define associations
JobWorkSession.associate = (models) => {
    JobWorkSession.belongsTo(models.Job, { foreignKey: 'jobId', as: 'job' });
    JobWorkSession.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    JobWorkSession.belongsTo(models.Lead, { foreignKey: 'leadId', as: 'lead' });
};

module.exports = JobWorkSession;
