const mongoose = require('mongoose');

// backend/models/EMR.js
const mongoose = require('mongoose');

const emrSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recordType: {
    type: String,
    enum: ['diagnosis', 'prescription', 'lab_result', 'vital_record', 'visit_summary', 'other'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  diagnosis: String,
  medications: [{
    name: String,
    dosage: String,
    frequency: String
  }],
  vitalSigns: {
    bloodPressure: String,
    heartRate: String,
    temperature: String,
    oxygenSaturation: String
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attachments: [{
    fileName: String,
    fileUrl: String
  }],
  isConfidential: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('EMR', emrSchema);
