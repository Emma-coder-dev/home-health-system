// backend/routes/patients.js - FIXED
const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const User = require('../models/User');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

// Get all patients
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Get all users with role 'patient'
    const patientUsers = await User.find({ role: 'patient' }).select('-password');
    
    // Map to patient format
    const patients = patientUsers.map(user => ({
      _id: user._id,
      userId: user._id,
      name: user.name,
      age: user.age,
      condition: user.condition,
      address: user.address,
      email: user.email,
      isActive: user.isActive,
      createdAt: user.createdAt
    }));
    
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single patient
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user || user.role !== 'patient') {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const patient = {
      _id: user._id,
      userId: user._id,
      name: user.name,
      age: user.age,
      condition: user.condition,
      address: user.address,
      email: user.email,
      isActive: user.isActive,
      createdAt: user.createdAt
    };

    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new patient (admin/clinician only)
router.post('/', authMiddleware, roleMiddleware('admin', 'clinician'), async (req, res) => {
  try {
    const { email, password, name, age, condition, address, phone } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create user account for patient
    const user = new User({
      email,
      password: password || 'patient123', // Default password
      name,
      role: 'patient',
      age,
      condition,
      address
    });
    await user.save();

    const patient = {
      _id: user._id,
      userId: user._id,
      name: user.name,
      age: user.age,
      condition: user.condition,
      address: user.address,
      email: user.email,
      isActive: user.isActive
    };
    
    res.status(201).json(patient);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update patient
router.put('/:id', authMiddleware, roleMiddleware('admin', 'clinician'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete patient (admin only)
router.delete('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;