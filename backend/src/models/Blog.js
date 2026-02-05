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
        unique: true,
        validate: {
            notEmpty: true
        }
    },
    content: {
        type: DataTypes.TEXT('long'), // Can store HTML or Markdown
        allowNull: false
    },
    excerpt: {
        type: DataTypes.TEXT
    },
    image: {
        type: DataTypes.STRING, // URL to the image
        defaultValue: ''
    },
    author: {
        type: DataTypes.STRING,
        defaultValue: 'Admin'
    },
    tags: {
        type: DataTypes.JSON, // Store as JSON array if supported, or handle serialization
        defaultValue: [],
        get() {
            const rawValue = this.getDataValue('tags');
            return rawValue ? (typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue) : [];
        },
        set(value) {
            // Ensure value is an array or valid JSON string
            if (typeof value === 'string') {
                try {
                    // Check if it's already a JSON string
                    JSON.parse(value);
                    this.setDataValue('tags', value);
                } catch (e) {
                    // If it's a comma-separated string, split it
                    this.setDataValue('tags', JSON.stringify(value.split(',').map(tag => tag.trim())));
                }
            } else {
                this.setDataValue('tags', JSON.stringify(value));
            }
        }
    },
    status: {
        type: DataTypes.ENUM('draft', 'published'),
        defaultValue: 'published'
    },
    metaTitle: DataTypes.STRING,
    metaDescription: DataTypes.TEXT,
    metaRobots: {
        type: DataTypes.STRING,
        defaultValue: 'index, follow'
    },
    ogTitle: DataTypes.STRING,
    ogDescription: DataTypes.TEXT,
    ogImage: DataTypes.STRING,
    canonicalUrl: DataTypes.STRING,
    schemaMarkup: {
        type: DataTypes.TEXT // Stored as stringified JSON
    },
    googleAnalyticsId: DataTypes.STRING,
    googleTagManagerId: DataTypes.STRING
}, {
    tableName: 'blogs',
    timestamps: true
});

module.exports = Blog;
