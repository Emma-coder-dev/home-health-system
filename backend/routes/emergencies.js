const express = require('express');
const router = express.Router();
const Emergency = require('../models/Emergency');

// Get all emergencies
router.get('/', async (req, res) => {
  try {
    const emergencies = await Emergency.find().sort({ createdAt: -1 });
    res.json(emergencies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new emergency
router.post('/', async (req, res) => {
  try {
    const emergency = new Emergency(req.body);
    await emergency.save();
    res.status(201).json({ 
      message: 'Emergency alert sent! Help is on the way.', 
      emergency 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update emergency status (Mark as Resolved)
router.put('/:id/resolve', async (req, res) => {
  try {
    const emergency = await Emergency.findByIdAndUpdate(
      req.params.id,
      { status: 'resolved', resolvedAt: new Date() },
      { new: true }
    );
    
    if (!emergency) {
      return res.status(404).json({ error: 'Emergency not found' });
    }
    
    res.json({ 
      message: 'Emergency marked as resolved', 
      emergency 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;