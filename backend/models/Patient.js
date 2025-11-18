const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
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
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Patient', patientSchema);