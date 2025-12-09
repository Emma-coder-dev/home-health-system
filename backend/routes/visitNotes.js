// backend/routes/visitNotes.js
// ============================================
const VisitNote = require('../models/VisitNote');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { patientId, clinicianId } = req.query;
    let query = {};
    if (req.user.role === 'patient') {
      query.patientId = req.user._id;
    } else if (req.user.role === 'clinician') {
      query.clinicianId = req.user._id;
    }
    if (patientId) query.patientId = patientId;
    if (clinicianId) query.clinicianId = clinicianId;
    const notes = await VisitNote.find(query)
      .populate('patientId', 'name email age condition')
      .populate('clinicianId', 'name specialization')
      .sort({ visitDate: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authMiddleware, roleMiddleware('clinician'), async (req, res) => {
  try {
    const note = new VisitNote({ ...req.body, clinicianId: req.user._id });
    await note.save();
    const populated = await VisitNote.findById(note._id)
      .populate('patientId', 'name email')
      .populate('clinicianId', 'name');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;