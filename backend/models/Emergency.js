const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: true
  },
  message: {
    type: String,
    default: 'Emergency assistance needed!'
  },
  status: {
    type: String,
    enum: ['pending', 'resolved'],
    default: 'pending'
  },
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Emergency', emergencySchema);