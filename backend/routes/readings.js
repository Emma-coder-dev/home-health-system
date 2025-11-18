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

module.exports = router;