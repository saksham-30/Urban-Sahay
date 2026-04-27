const mongoose = require('mongoose');

const concernSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    phone: { type: String, default: '' },
    location: { type: String, required: true },
    serviceType: { type: String, required: true },
    concern: { type: String, required: true },
    urgency: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['open', 'in_progress', 'resolved'], default: 'open' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Concern', concernSchema);
