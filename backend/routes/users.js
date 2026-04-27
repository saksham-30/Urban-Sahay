const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Profile = require('../models/Profile');

// GET /api/users/profile  - get current user's profile
router.get('/profile', protect, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/users/profile  - update current user's profile
router.put('/profile', protect, async (req, res) => {
  const { fullName, phone } = req.body;
  try {
    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { fullName, phone },
      { new: true }
    );
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
