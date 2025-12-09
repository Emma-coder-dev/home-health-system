const mongoose = require('mongoose');

const labResultSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  testType: {
    type: String,
    required: true
  },
  testName: {
    type: String,
    required: true
  },
  results: [{
    parameter: String,
    value: String,
    normalRange: String,
    unit: String,
    flag: {
      type: String,
      enum: ['normal', 'high', 'low', 'critical']
    }
  }],
  overallStatus: {
    type: String,
    enum: ['normal', 'abnormal', 'critical'],
    default: 'normal'
  },
  labTechnician: String,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  testDate: {
    type: Date,
    required: true
  },
  resultDate: {
    type: Date,
    default: Date.now
  },
  notes: String,
  attachments: [{
    fileName: String,
    fileUrl: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('LabResult', labResultSchema);
