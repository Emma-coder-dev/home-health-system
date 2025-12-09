// backend/models/Reading.js
const mongoose = require('mongoose');

const readingSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['blood_pressure', 'heart_rate', 'glucose', 'temperature', 'weight', 'oxygen_saturation'],
    required: true
  },
  value: {
    type: String,
    required: true
  },
  unit: String,
  automated: {
    type: Boolean,
    default: false
  },
  deviceId: String,
  alertLevel: {
    type: String,
    enum: ['normal', 'warning', 'critical'],
    default: 'normal'
  },
  flagged: {
    type: Boolean,
    default: false
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewNotes: String,
  reviewedAt: Date
}, {
  timestamps: true
});

// Automatically determine alert level based on reading values
readingSchema.pre('save', function(next) {
  if (this.type === 'blood_pressure' && this.value) {
    const [systolic, diastolic] = this.value.split('/').map(Number);
    if (systolic >= 140 || diastolic >= 90) {
      this.alertLevel = 'critical';
      this.flagged = true;
    } else if (systolic >= 130 || diastolic >= 85) {
      this.alertLevel = 'warning';
    }
  } else if (this.type === 'heart_rate') {
    const bpm = parseInt(this.value);
    if (bpm > 110 || bpm < 50) {
      this.alertLevel = 'critical';
      this.flagged = true;
    } else if (bpm > 100 || bpm < 60) {
      this.alertLevel = 'warning';
    }
  } else if (this.type === 'glucose') {
    const glucose = parseInt(this.value);
    if (glucose > 180 || glucose < 70) {
      this.alertLevel = 'critical';
      this.flagged = true;
    } else if (glucose > 140 || glucose < 80) {
      this.alertLevel = 'warning';
    }
  }
  next();
});

module.exports = mongoose.model('Reading', readingSchema);