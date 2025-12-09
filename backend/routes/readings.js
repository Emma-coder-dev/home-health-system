const express = require('express');
const router = express.Router();
const Reading = require('../models/Reading');

// Get all readings
router.get('/', async (req, res) => {
  try {
    const readings = await Reading.find().sort({ createdAt: -1 });
    res.json(readings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new reading
router.post('/', async (req, res) => {
  try {
    const reading = new Reading(req.body);
    await reading.save();
    res.status(201).json(reading);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// backend/routes/readings.js
const Reading = require('../models/Reading');
const { authMiddleware } = require('../middleware/authMiddleware');

// Get all readings
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { patientId, type, flagged } = req.query;
    
    let query = {};
    
    if (req.user.role === 'patient') {
      query.patientId = req.user._id;
    } else if (patientId) {
      query.patientId = patientId;
    }
    
    if (type) query.type = type;
    if (flagged === 'true') query.flagged = true;

    const readings = await Reading.find(query)
      .populate('patientId', 'name email age condition')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(readings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single reading
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const reading = await Reading.findById(req.params.id)
      .populate('patientId', 'name email age condition')
      .populate('reviewedBy', 'name');
    
    if (!reading) {
      return res.status(404).json({ error: 'Reading not found' });
    }

    if (req.user.role === 'patient' && reading.patientId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(reading);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new reading
router.post('/', authMiddleware, async (req, res) => {
  try {
    const patientId = req.user.role === 'patient' ? req.user._id : req.body.patientId;
    
    const reading = new Reading({
      ...req.body,
      patientId
    });
    await reading.save();
    
    const populated = await Reading.findById(reading._id)
      .populate('patientId', 'name email');
    
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Review reading (clinician only)
router.put('/:id/review', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'clinician') {
      return res.status(403).json({ error: 'Only clinicians can review readings' });
    }

    const { reviewNotes } = req.body;
    
    const reading = await Reading.findByIdAndUpdate(
      req.params.id,
      {
        reviewedBy: req.user._id,
        reviewNotes,
        reviewedAt: new Date()
      },
      { new: true }
    ).populate('patientId', 'name email')
     .populate('reviewedBy', 'name');
    
    if (!reading) {
      return res.status(404).json({ error: 'Reading not found' });
    }
    
    res.json(reading);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get flagged readings (clinician/admin)
router.get('/flagged/all', authMiddleware, async (req, res) => {
  try {
    if (!['clinician', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const readings = await Reading.find({ flagged: true })
      .populate('patientId', 'name email condition')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(readings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete reading (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete readings' });
    }

    const reading = await Reading.findByIdAndDelete(req.params.id);
    
    if (!reading) {
      return res.status(404).json({ error: 'Reading not found' });
    }
    
    res.json({ message: 'Reading deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
