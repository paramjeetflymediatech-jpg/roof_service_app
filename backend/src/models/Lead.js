const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema(
  {
    leadType: {
      type: String,
      enum: ['contact', 'quote', 'callback', 'appointment'],
      default: 'contact',
    },
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    subject: { type: String },
    message: { type: String },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    source: {
      type: String,
      enum: ['website', 'mobile_app', 'other'],
      default: 'website',
    },
    status: {
      type: String,
      enum: ['new', 'in_progress', 'quoted', 'closed_won', 'closed_lost', 'spam'],
      default: 'new',
    },
    assignedToId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lead', LeadSchema);
