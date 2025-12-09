const Payment = require('../models/Payment');

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
    const payments = await Payment.find(query)
      .populate('patientId', 'name email')
      .populate('processedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const payment = new Payment({ ...req.body, processedBy: req.user._id });
    await payment.save();
    const populated = await Payment.findById(payment._id)
      .populate('patientId', 'name email')
      .populate('processedBy', 'name');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.status === 'completed' && !updateData.paidDate) {
      updateData.paidDate = new Date();
    }
    const payment = await Payment.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('patientId', 'name email').populate('processedBy', 'name');
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json(payment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;