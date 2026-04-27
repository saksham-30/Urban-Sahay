const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const KycVerification = require('../models/KycVerification');

// GET /api/kyc  - get current user's KYC status (creates record if missing)
router.get('/', protect, async (req, res) => {
  try {
    let kyc = await KycVerification.findOne({ userId: req.user.id });
    if (!kyc) {
      kyc = await KycVerification.create({ userId: req.user.id });
    }
    res.json(kyc);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/kyc  - update KYC fields
router.put('/', protect, async (req, res) => {
  const allowed = ['emailVerified', 'phoneVerified', 'phoneNumber', 'aadhaarNumber', 'aadhaarVerified', 'selfieUrl', 'selfieVerified', 'isFullyVerified'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  try {
    const kyc = await KycVerification.findOneAndUpdate(
      { userId: req.user.id },
      updates,
      { new: true, upsert: true }
    );
    res.json(kyc);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/kyc/reset  - reset all KYC verification (for demo purposes)
router.post('/reset', protect, async (req, res) => {
  try {
    const kyc = await KycVerification.findOneAndUpdate(
      { userId: req.user.id },
      {
        emailVerified: false,
        phoneVerified: false,
        aadhaarVerified: false,
        selfieVerified: false,
        isFullyVerified: false,
        selfieUrl: null,
        phoneNumber: null,
        aadhaarNumber: null,
      },
      { new: true, upsert: true }
    );
    res.json(kyc);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
