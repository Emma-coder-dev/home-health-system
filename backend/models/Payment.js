const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentType: {
    type: String,
    enum: ['consultation', 'device_monitoring', 'home_visit', 'emergency_response', 'medication', 'lab_test', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'insurance', 'bank_transfer'],
    required: true
  },
  transactionId: String,
  invoiceNumber: {
    type: String,
    unique: true
  },
  description: String,
  dueDate: Date,
  paidDate: Date,
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

paymentSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const count = await mongoose.model('Payment').countDocuments();
    this.invoiceNumber = `INV-${Date.now()}-${count + 1}`;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
