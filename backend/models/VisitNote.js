const visitNoteSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clinicianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  visitDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  visitType: {
    type: String,
    enum: ['routine_checkup', 'device_inspection', 'emergency_response', 'follow_up', 'assessment'],
    required: true
  },
  chiefComplaint: String,
  vitalSigns: {
    bloodPressure: String,
    heartRate: String,
    temperature: String,
    respiratoryRate: String,
    oxygenSaturation: String,
    weight: String
  },
  physicalExamination: String,
  assessment: String,
  deviceStatus: {
    bloodPressureMonitor: {
      working: Boolean,
      notes: String
    },
    glucometer: {
      working: Boolean,
      notes: String
    },
    heartRateMonitor: {
      working: Boolean,
      notes: String
    },
    lifelineButton: {
      working: Boolean,
      notes: String
    }
  },
  recommendations: String,
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: Date,
  prescriptions: [{
    medication: String,
    dosage: String,
    frequency: String,
    duration: String
  }],
  attachments: [{
    fileName: String,
    fileUrl: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('VisitNote', visitNoteSchema);
