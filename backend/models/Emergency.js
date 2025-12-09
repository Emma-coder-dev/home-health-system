const mongoose = require('mongoose');

// backend/models/Emergency.js
// UPDATED - Enhanced with better tracking
const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  emergencyType: {
    type: String,
    enum: ['lifeline_button', 'critical_reading', 'fall_detected', 'manual_alert', 'other'],
    default: 'lifeline_button'
  },
  message: {
    type: String,
    default: 'Emergency assistance needed!'
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'high'
  },
  status: {
    type: String,
    enum: ['pending', 'acknowledged', 'responding', 'resolved', 'false_alarm'],
    default: 'pending'
  },
  location: String,
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  acknowledgedAt: Date,
  responseTime: Number, // in minutes
  resolvedAt: Date,
  resolutionNotes: String,
  actionsTaken: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Emergency', emergencySchema);
