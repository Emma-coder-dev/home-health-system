// backend/routes/emr.js
// ============================================
const express = require('express');
const router = express.Router();
const EMR = require('../models/EMR');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { patientId } = req.query;
    let query = {};
    if (req.user.role === 'patient') {
      query.patientId = req.user._id;
    } else if (patientId) {
      query.patientId = patientId;
    }
    const records = await EMR.find(query)
      .populate('patientId', 'name email')
      .populate('addedBy', 'name role')
      .sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const record = await EMR.findById(req.params.id)
      .populate('patientId', 'name email age condition')
      .populate('addedBy', 'name role');
    if (!record) return res.status(404).json({ error: 'Record not found' });
    if (req.user.role === 'patient' && record.patientId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authMiddleware, roleMiddleware('clinician', 'admin'), async (req, res) => {
  try {
    const record = new EMR({ ...req.body, addedBy: req.user._id });
    await record.save();
    const populated = await EMR.findById(record._id)
      .populate('patientId', 'name email')
      .populate('addedBy', 'name role');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', authMiddleware, roleMiddleware('clinician', 'admin'), async (req, res) => {
  try {
    const record = await EMR.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('patientId', 'name email').populate('addedBy', 'name role');
    if (!record) return res.status(404).json({ error: 'Record not found' });
    res.json(record);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const record = await EMR.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'EMR record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;