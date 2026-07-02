const mongoose = require('mongoose');

const serviceProviderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    fullName: { type: String, required: true },
    serviceType: { type: String, required: true },
    city: { type: String, required: true },
    phone: { type: String, required: true },
    language: { type: String, enum: ['en', 'hi', 'mr'], default: 'en' },
    description: { type: String, default: null },
    experienceYears: { type: Number, default: null },
    hourlyRate: { type: String, default: null },
    rating: { type: Number, default: 5.0 },
    totalReviews: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    serviceRadius: { type: Number, default: 10 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ServiceProvider', serviceProviderSchema);
