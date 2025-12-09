// backend/routes/patients.js
const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const User = require('../models/User');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

// Get all patients
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query = {};
    
    // Clinicians only see their assigned patients
    if (req.user.role === 'clinician') {
      query.assignedClinician = req.user._id;
    }

    const patients = await Patient.find(query)
      .populate('userId', 'email')
      .populate('assignedClinician', 'name specialization')
      .sort({ createdAt: -1 });
    
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single patient
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('userId', 'email')
      .populate('assignedClinician', 'name specialization email');
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Check access
    const hasAccess = 
      req.user.role === 'admin' ||
      (req.user.role === 'clinician' && patient.assignedClinician?._id.toString() === req.user._id.toString()) ||
      (req.user.role === 'patient' && patient.userId.toString() === req.user._id.toString());
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new patient (admin/clinician only)
router.post('/', authMiddleware, roleMiddleware('admin', 'clinician'), async (req, res) => {
  try {
    const { email, password, name, age, condition, address, phone, emergencyContact, assignedClinician } = req.body;

    // Create user account for patient
    const user = new User({
      email,
      password,
      name,
      role: 'patient',
      age,
      condition,
      address
    });
    await user.save();

    // Create patient profile
    const patient = new Patient({
      userId: user._id,
      name,
      age,
      condition,
      address,
      email,
      phone,
      emergencyContact,
      assignedClinician
    });
    await patient.save();

    const populated = await Patient.findById(patient._id)
      .populate('userId', 'email')
      .populate('assignedClinician', 'name');
    
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update patient
router.put('/:id', authMiddleware, roleMiddleware('admin', 'clinician'), async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('userId', 'email')
     .populate('assignedClinician', 'name');
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    res.json(patient);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Assign clinician to patient (admin only)
router.put('/:id/assign-clinician', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const { clinicianId } = req.body;
    
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { assignedClinician: clinicianId },
      { new: true }
    ).populate('assignedClinician', 'name specialization');
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Also add to clinician's assigned patients
    await User.findByIdAndUpdate(
      clinicianId,
      { $addToSet: { assignedPatients: patient.userId } }
    );
    
    res.json(patient);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete patient (admin only)
router.delete('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Also delete user account
    await User.findByIdAndDelete(patient.userId);
    
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;