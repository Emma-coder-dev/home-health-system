const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  condition: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  email: String,
  phone: String,
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  assignedClinician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  devices: [{
    deviceType: {
      type: String,
      enum: ['blood_pressure_monitor', 'glucometer', 'heart_rate_monitor', 'lifeline_button']
    },
    serialNumber: String,
    installDate: Date,
    lastInspection: Date
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Patient', patientSchema);
