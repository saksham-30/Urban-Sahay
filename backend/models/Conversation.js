const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    jobContext: { type: String, default: null },
  },
  { timestamps: true }
);

// Prevent duplicate conversations between same two users
conversationSchema.index({ customerId: 1, providerId: 1 }, { unique: true });

module.exports = mongoose.model('Conversation', conversationSchema);
