const mongoose = require('mongoose');

const readingSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  automated: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Reading', readingSchema);