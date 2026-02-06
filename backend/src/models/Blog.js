const { DataTypes } = require('sequelize');
const sequelize = require('../config/mysql');

const Blog = sequelize.define('Blog', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    content: {
        type: DataTypes.TEXT('long'), // Use LONGTEXT for potentially large HTML/Markdown content
        allowNull: false
    },
    excerpt: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    author: {
        type: DataTypes.STRING,
        defaultValue: 'Admin'
    },
    tags: {
        type: DataTypes.JSON, // Storing tags as JSON array
        allowNull: true,
        defaultValue: []
    },
    status: {
        type: DataTypes.ENUM('draft', 'published'),
        defaultValue: 'published'
    },
    metaTitle: {
        type: DataTypes.STRING,
        allowNull: true
    },
    metaDescription: {
        type: DataTypes.STRING,
        allowNull: true
    },
    metaRobots: {
        type: DataTypes.STRING,
        defaultValue: 'index, follow'
    },
    ogTitle: {
        type: DataTypes.STRING,
        allowNull: true
    },
    ogDescription: {
        type: DataTypes.STRING,
        allowNull: true
    },
    ogImage: {
        type: DataTypes.STRING,
        allowNull: true
    },
    canonicalUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    schemaMarkup: {
        type: DataTypes.TEXT, // Stored as stringified JSON
        allowNull: true
    },
    googleAnalyticsId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    googleTagManagerId: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'blogs',
    timestamps: true
});

module.exports = Blog;
