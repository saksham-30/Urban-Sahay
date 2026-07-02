const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    fullName: { type: String, required: true },
    email: { type: String },
    phone: { type: String, default: null },
    language: { type: String, enum: ['en', 'hi', 'mr'], default: 'en' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Profile', profileSchema);
