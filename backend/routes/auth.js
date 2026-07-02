const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Profile = require('../models/Profile');
const ServiceProvider = require('../models/ServiceProvider');

const generateToken = (user) =>
  jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

const ensureDatabaseReady = (res) => {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({ message: 'Database is not connected. Please try again after MongoDB is restored.' });
    return false;
  }

  return true;
};

// POST /api/auth/register
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['user', 'service_provider']).withMessage('Invalid role'),
    body('fullName').notEmpty().withMessage('Full name required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    if (!ensureDatabaseReady(res)) return;

    const { email, password, role, fullName, phone, serviceType, city, description, experienceYears, hourlyRate, language } = req.body;

    try {
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: 'This email is already registered. Please sign in instead.' });

      const user = await User.create({ email, password, role });

      // Create profile data based on role
      if (role === 'service_provider') {
        await ServiceProvider.create({
          userId: user._id,
          fullName,
          phone: phone || '',
          serviceType: serviceType || '',
          city: city || '',
          language: language || 'en',
          description: description || null,
          experienceYears: experienceYears ? Number(experienceYears) : null,
          hourlyRate: hourlyRate || null,
        });
      } else {
        await Profile.create({
          userId: user._id,
          fullName,
          email,
          phone: phone || null,
          language: language || 'en',
        });
      }

      const token = generateToken(user);
      res.status(201).json({
        token,
        user: { id: user._id.toString(), email: user.email, role: user.role, language: language || 'en' },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error during registration' });
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    if (!ensureDatabaseReady(res)) return;

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ message: 'Invalid email or password. Please try again.' });

      const isMatch = await user.comparePassword(password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid email or password. Please try again.' });

      const token = generateToken(user);
      res.json({
        token,
        user: { id: user._id.toString(), email: user.email, role: user.role },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error during login' });
    }
  }
);

module.exports = router;
