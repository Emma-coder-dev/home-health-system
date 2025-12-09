const LabResult = require('../models/LabResult');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { patientId } = req.query;
    let query = {};
    if (req.user.role === 'patient') {
      query.patientId = req.user._id;
    } else if (patientId) {
      query.patientId = patientId;
    }
    const results = await LabResult.find(query)
      .populate('patientId', 'name email')
      .populate('reviewedBy', 'name')
      .sort({ testDate: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authMiddleware, roleMiddleware('clinician', 'admin'), async (req, res) => {
  try {
    const result = new LabResult(req.body);
    await result.save();
    const populated = await LabResult.findById(result._id)
      .populate('patientId', 'name email')
      .populate('reviewedBy', 'name');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id/review', authMiddleware, roleMiddleware('clinician'), async (req, res) => {
  try {
    const { notes } = req.body;
    const result = await LabResult.findByIdAndUpdate(req.params.id, {
      reviewedBy: req.user._id, notes, reviewedAt: new Date()
    }, { new: true }).populate('patientId', 'name email').populate('reviewedBy', 'name');
    if (!result) return res.status(404).json({ error: 'Lab result not found' });
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;