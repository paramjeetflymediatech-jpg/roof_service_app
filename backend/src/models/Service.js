const { DataTypes } = require("sequelize");
const sequelize = require("../config/mysql");

const Service = sequelize.define(
  "Service",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "service_categories",
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    shortDescription: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    longDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    heading: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    subHeading: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    subDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    featuredImageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    basePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("draft", "published", "archived"),
      defaultValue: "draft",
    },
    seo: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        pageTitle: "",
        metaDescription: "",
        metaRobots: "index, follow",
        ogTitle: "",
        ogDescription: "",
        ogImage: "",
        canonicalUrl: "",
        schemaMarkup: "",
        googleAnalyticsId: "",
        googleTagManagerId: "",
      },
    },
    whyChooseUs: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
  },
  {
    tableName: "services",
    timestamps: true,
  },
);

// Define associations
Service.associate = (models) => {
  Service.hasMany(models.Lead, { foreignKey: "serviceId", as: "leads" });
};

module.exports = Service;
