const { DataTypes } = require('sequelize');
const sequelize = require('../config/mysql');

const Review = sequelize.define('Review', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    author_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    author_url: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    language: {
        type: DataTypes.STRING,
        allowNull: true
    },
    original_language: {
        type: DataTypes.STRING,
        allowNull: true
    },
    profile_photo_url: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    relative_time_description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    time: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    translated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isVisible: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'reviews',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['author_name', 'time']
        }
    ]
});

module.exports = Review;

