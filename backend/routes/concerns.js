const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Concern = require('../models/Concern');

// POST /api/concerns  - raise a concern
router.post('/', protect, async (req, res) => {
  const { name, phone, location, serviceType, concern, urgency } = req.body;
  if (!name || !location || !serviceType || !concern) {
    return res.status(400).json({ message: 'name, location, serviceType and concern are required' });
  }
  try {
    const newConcern = await Concern.create({
      userId: req.user.id,
      name,
      phone: phone || '',
      location,
      serviceType,
      concern,
      urgency: urgency || 'medium',
    });
    res.status(201).json(newConcern);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/concerns  - list current user's concerns
router.get('/', protect, async (req, res) => {
  try {
    const concerns = await Concern.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(concerns);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
