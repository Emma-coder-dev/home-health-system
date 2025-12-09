const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const CarePlan = require('../models/CarePlan');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { patientId, status } = req.query;
    let query = {};
    if (req.user.role === 'patient') {
      query.patientId = req.user._id;
    } else if (patientId) {
      query.patientId = patientId;
    }
    if (status) query.status = status;
    const plans = await CarePlan.find(query)
      .populate('patientId', 'name email age condition')
      .populate('createdBy', 'name specialization')
      .sort({ createdAt: -1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authMiddleware, roleMiddleware('clinician'), async (req, res) => {
  try {
    const plan = new CarePlan({ ...req.body, createdBy: req.user._id });
    await plan.save();
    const populated = await CarePlan.findById(plan._id)
      .populate('patientId', 'name email')
      .populate('createdBy', 'name');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', authMiddleware, roleMiddleware('clinician'), async (req, res) => {
  try {
    const { changes, ...updateData } = req.body;
    const plan = await CarePlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ error: 'Care plan not found' });
    plan.updates.push({ date: new Date(), updatedBy: req.user._id, changes: changes || 'Care plan updated' });
    Object.assign(plan, updateData);
    await plan.save();
    const populated = await CarePlan.findById(plan._id)
      .populate('patientId', 'name email')
      .populate('createdBy', 'name')
      .populate('updates.updatedBy', 'name');
    res.json(populated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
