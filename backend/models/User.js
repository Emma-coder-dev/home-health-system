const mongoose = require('mongoose');

// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['patient', 'clinician', 'admin'],
    required: true
  },
  // Patient-specific fields
  age: {
    type: Number,
    required: function() { return this.role === 'patient'; }
  },
  condition: {
    type: String,
    required: function() { return this.role === 'patient'; }
  },
  address: {
    type: String,
    required: function() { return this.role === 'patient'; }
  },
  // Clinician-specific fields
  specialization: {
    type: String,
    required: function() { return this.role === 'clinician'; }
  },
  licenseNumber: {
    type: String,
    required: function() { return this.role === 'clinician'; }
  },
  assignedPatients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Password reset
  resetToken: String,
  resetTokenExpiry: Date,
  // Account status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
