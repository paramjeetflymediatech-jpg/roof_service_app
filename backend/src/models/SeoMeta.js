const { DataTypes } = require('sequelize');
const sequelize = require('../config/mysql');

const SeoMeta = sequelize.define('SeoMeta', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  pageName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'Page name is required' },
    },
  },
  pageTitle: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Page title is required' },
      len: { args: [0, 100], msg: 'Page title cannot exceed 100 characters' },
    },
  },
  metaDescription: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Meta description is required' },
      len: { args: [0, 200], msg: 'Meta description cannot exceed 200 characters' },
    },
  },
  metaRobots: {
    type: DataTypes.STRING,
    defaultValue: 'index, follow',
  },
  ogTitle: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: { args: [0, 100], msg: 'OG title cannot exceed 100 characters' },
    },
  },
  ogDescription: {
    type: DataTypes.STRING(200),
    allowNull: true,
    validate: {
      len: { args: [0, 200], msg: 'OG description cannot exceed 200 characters' },
    },
  },
  ogImage: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  canonicalUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  schemaMarkup: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  googleAnalyticsId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  googleTagManagerId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'seo_metas',
  timestamps: true,
});

module.exports = SeoMeta;
