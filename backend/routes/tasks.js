// backend/routes/tasks.js
const express = require('express');
const router = express.Router();
const DailyTask = require('../models/DailyTask');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

// Get all tasks
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { assignedTo, status, priority } = req.query;
    
    let query = {};
    
    // Clinicians see their own tasks
    if (req.user.role === 'clinician') {
      query.assignedTo = req.user._id;
    } else if (assignedTo) {
      query.assignedTo = assignedTo;
    }
    
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const tasks = await DailyTask.find(query)
      .populate('assignedTo', 'name specialization')
      .populate('patientId', 'name condition')
      .populate('createdBy', 'name')
      .sort({ dueDate: 1, priority: -1 });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single task
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const task = await DailyTask.findById(req.params.id)
      .populate('assignedTo', 'name specialization')
      .populate('patientId', 'name condition address')
      .populate('createdBy', 'name');
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check access
    const hasAccess = 
      req.user.role === 'admin' ||
      task.assignedTo._id.toString() === req.user._id.toString();
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create task (clinician/admin)
router.post('/', authMiddleware, roleMiddleware('clinician', 'admin'), async (req, res) => {
  try {
    const task = new DailyTask({
      ...req.body,
      createdBy: req.user._id
    });
    await task.save();
    
    const populated = await DailyTask.findById(task._id)
      .populate('assignedTo', 'name')
      .populate('patientId', 'name')
      .populate('createdBy', 'name');
    
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update task status
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status, completionNotes } = req.body;
    
    const task = await DailyTask.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if user can update this task
    const canUpdate = 
      req.user.role === 'admin' ||
      task.assignedTo.toString() === req.user._id.toString();
    
    if (!canUpdate) {
      return res.status(403).json({ error: 'You can only update your own tasks' });
    }

    const updateData = { status };
    if (status === 'completed') {
      updateData.completedAt = new Date();
      if (completionNotes) updateData.completionNotes = completionNotes;
    }

    const updated = await DailyTask.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('assignedTo', 'name')
     .populate('patientId', 'name')
     .populate('createdBy', 'name');
    
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update task
router.put('/:id', authMiddleware, roleMiddleware('clinician', 'admin'), async (req, res) => {
  try {
    const task = await DailyTask.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name')
     .populate('patientId', 'name')
     .populate('createdBy', 'name');
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete task (admin only)
router.delete('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const task = await DailyTask.findByIdAndDelete(req.params.id);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;