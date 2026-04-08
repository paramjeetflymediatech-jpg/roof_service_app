const { DataTypes } = require('sequelize');
const sequelize = require('../config/mysql');

const Review = sequelize.define('Review', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    googleReviewId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    authorName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    authorPhoto: {
        type: DataTypes.STRING,
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
    text: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    relativeTimeDescription: {
        type: DataTypes.STRING,
        allowNull: true
    },
    time: {
        type: DataTypes.DATE,
        allowNull: false
    },
    isVisible: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'reviews',
    timestamps: true,
    underscored: true
});

module.exports = Review;
