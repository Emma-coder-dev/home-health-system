/ backend/routes/appointments.js
// ============================================
const Appointment = require('../models/Appointment');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { patientId, clinicianId, status } = req.query;
    let query = {};
    if (req.user.role === 'patient') {
      query.patientId = req.user._id;
    } else if (req.user.role === 'clinician') {
      query.clinicianId = req.user._id;
    }
    if (patientId) query.patientId = patientId;
    if (clinicianId) query.clinicianId = clinicianId;
    if (status) query.status = status;
    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email age condition')
      .populate('clinicianId', 'name specialization')
      .sort({ scheduledDate: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authMiddleware, roleMiddleware('clinician', 'admin'), async (req, res) => {
  try {
    const appointment = new Appointment(req.body);
    await appointment.save();
    const populated = await Appointment.findById(appointment._id)
      .populate('patientId', 'name email')
      .populate('clinicianId', 'name');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status, completionNotes } = req.body;
    const updateData = { status };
    if (status === 'completed') {
      updateData.completedAt = new Date();
      if (completionNotes) updateData.completionNotes = completionNotes;
    }
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('patientId', 'name email').populate('clinicianId', 'name');
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    res.json(appointment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;