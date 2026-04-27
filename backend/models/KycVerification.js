const mongoose = require('mongoose');

const kycVerificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    phoneNumber: { type: String, default: null },
    aadhaarNumber: { type: String, default: null },
    aadhaarVerified: { type: Boolean, default: false },
    selfieUrl: { type: String, default: null },
    selfieVerified: { type: Boolean, default: false },
    isFullyVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('KycVerification', kycVerificationSchema);
