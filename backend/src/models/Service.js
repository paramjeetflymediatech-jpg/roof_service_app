const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema(
  {
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCategory' },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    shortDescription: String,
    longDescription: String,
    icon: String,
    featuredImageUrl: String,
    isFeatured: { type: Boolean, default: false },
    basePrice: Number,
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', ServiceSchema);
