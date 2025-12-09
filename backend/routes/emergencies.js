// backend/routes/emergencies.js
const express = require('express');
const router = express.Router();
const Emergency = require('../models/Emergency');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

// Get all emergencies
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, patientId } = req.query;
    
    let query = {};
    
    // Patients only see their own emergencies
    if (req.user.role === 'patient') {
      query.patientId = req.user._id;
    } else if (patientId) {
      query.patientId = patientId;
    }
    
    if (status) query.status = status;

    const emergencies = await Emergency.find(query)
      .populate('patientId', 'name email age condition address')
      .populate('respondedBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(emergencies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single emergency
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id)
      .populate('patientId', 'name email age condition address phone')
      .populate('respondedBy', 'name specialization');
    
    if (!emergency) {
      return res.status(404).json({ error: 'Emergency not found' });
    }

    // Check access
    const hasAccess = 
      req.user.role === 'admin' ||
      req.user.role === 'clinician' ||
      emergency.patientId._id.toString() === req.user._id.toString();
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(emergency);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new emergency (patients can trigger their own)
router.post('/', authMiddleware, async (req, res) => {
  try {
    // If patient is creating, use their own ID
    const patientId = req.user.role === 'patient' ? req.user._id : req.body.patientId;
    const patientName = req.user.role === 'patient' ? req.user.name : req.body.patientName;
    
    const emergency = new Emergency({
      patientId,
      patientName,
      emergencyType: req.body.emergencyType || 'lifeline_button',
      message: req.body.message || 'Emergency assistance needed!',
      severity: req.body.severity || 'high',
      location: req.user.address || req.body.location
    });
    await emergency.save();
    
    const populated = await Emergency.findById(emergency._id)
      .populate('patientId', 'name email');
    
    res.status(201).json({
      message: 'Emergency alert sent! Help is on the way.',
      emergency: populated
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Acknowledge emergency (clinician only)
router.put('/:id/acknowledge', authMiddleware, roleMiddleware('clinician'), async (req, res) => {
  try {
    const emergency = await Emergency.findByIdAndUpdate(
      req.params.id,
      {
        status: 'acknowledged',
        respondedBy: req.user._id,
        acknowledgedAt: new Date()
      },
      { new: true }
    ).populate('patientId', 'name email')
     .populate('respondedBy', 'name');
    
    if (!emergency) {
      return res.status(404).json({ error: 'Emergency not found' });
    }
    
    res.json({ 
      message: 'Emergency acknowledged', 
      emergency 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update emergency status to responding (clinician only)
router.put('/:id/responding', authMiddleware, roleMiddleware('clinician'), async (req, res) => {
  try {
    const emergency = await Emergency.findByIdAndUpdate(
      req.params.id,
      {
        status: 'responding',
        respondedBy: req.user._id
      },
      { new: true }
    ).populate('patientId', 'name email address')
     .populate('respondedBy', 'name');
    
    if (!emergency) {
      return res.status(404).json({ error: 'Emergency not found' });
    }
    
    res.json({ 
      message: 'Status updated to responding', 
      emergency 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Resolve emergency (clinician only)
router.put('/:id/resolve', authMiddleware, roleMiddleware('clinician'), async (req, res) => {
  try {
    const { resolutionNotes, actionsTaken } = req.body;
    
    const emergency = await Emergency.findById(req.params.id);
    if (!emergency) {
      return res.status(404).json({ error: 'Emergency not found' });
    }

    // Calculate response time
    const responseTime = Math.round((new Date() - emergency.createdAt) / 60000); // in minutes

    const updated = await Emergency.findByIdAndUpdate(
      req.params.id,
      {
        status: 'resolved',
        resolvedAt: new Date(),
        resolutionNotes,
        actionsTaken,
        responseTime,
        respondedBy: req.user._id
      },
      { new: true }
    ).populate('patientId', 'name email')
     .populate('respondedBy', 'name');
    
    res.json({ 
      message: 'Emergency marked as resolved', 
      emergency: updated 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Mark as false alarm (clinician only)
router.put('/:id/false-alarm', authMiddleware, roleMiddleware('clinician'), async (req, res) => {
  try {
    const emergency = await Emergency.findByIdAndUpdate(
      req.params.id,
      {
        status: 'false_alarm',
        resolvedAt: new Date(),
        respondedBy: req.user._id
      },
      { new: true }
    ).populate('patientId', 'name email')
     .populate('respondedBy', 'name');
    
    if (!emergency) {
      return res.status(404).json({ error: 'Emergency not found' });
    }
    
    res.json({ 
      message: 'Emergency marked as false alarm', 
      emergency 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get emergency statistics (admin only)
router.get('/stats/summary', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const totalEmergencies = await Emergency.countDocuments();
    const activeEmergencies = await Emergency.countDocuments({ 
      status: { $in: ['pending', 'acknowledged', 'responding'] } 
    });
    const resolvedEmergencies = await Emergency.countDocuments({ status: 'resolved' });
    
    const avgResponseTime = await Emergency.aggregate([
      { $match: { status: 'resolved', responseTime: { $exists: true } } },
      { $group: { _id: null, avgTime: { $avg: '$responseTime' } } }
    ]);

    res.json({
      totalEmergencies,
      activeEmergencies,
      resolvedEmergencies,
      averageResponseTime: avgResponseTime[0]?.avgTime || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;