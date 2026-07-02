const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const ServiceProvider = require('../models/ServiceProvider');

// GET /api/providers/profile  - current provider's own profile
router.get('/profile', protect, async (req, res) => {
  try {
    const provider = await ServiceProvider.findOne({ userId: req.user.id });
    if (!provider) return res.status(404).json({ message: 'Provider profile not found' });
    res.json(provider);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/providers/profile  - update current provider's profile
router.put('/profile', protect, async (req, res) => {
  const { fullName, description, experienceYears, hourlyRate, serviceType, city, serviceRadius, language } = req.body;
  try {
    const updates = {};
    if (typeof fullName === 'string') updates.fullName = fullName;
    if (typeof description !== 'undefined') updates.description = description;
    if (typeof experienceYears !== 'undefined') updates.experienceYears = experienceYears;
    if (typeof hourlyRate !== 'undefined') updates.hourlyRate = hourlyRate;
    if (typeof serviceType === 'string') updates.serviceType = serviceType;
    if (typeof city === 'string') updates.city = city;
    if (typeof serviceRadius !== 'undefined') updates.serviceRadius = serviceRadius;
    if (typeof language === 'string') updates.language = language;

    const provider = await ServiceProvider.findOneAndUpdate(
      { userId: req.user.id },
      updates,
      { new: true }
    );
    if (!provider) return res.status(404).json({ message: 'Provider profile not found' });
    res.json(provider);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/providers?serviceType=Plumber&city=Mumbai  - search providers
router.get('/', async (req, res) => {
  try {
    const { serviceType, city } = req.query;
    const filter = { isAvailable: true };
    if (serviceType) filter.serviceType = { $regex: serviceType, $options: 'i' };
    if (city) filter.city = { $regex: city, $options: 'i' };

    const providers = await ServiceProvider.find(filter).sort({ rating: -1 }).limit(50);
    res.json(providers);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/providers/:userId  - get a provider by userId
router.get('/:userId', async (req, res) => {
  try {
    const provider = await ServiceProvider.findOne({ userId: req.params.userId });
    if (!provider) return res.status(404).json({ message: 'Provider not found' });
    res.json(provider);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
