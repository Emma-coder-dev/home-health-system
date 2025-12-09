const appointmentSchema = new mongoose.Schema({
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
  appointmentType: {
    type: String,
    enum: ['home_visit', 'device_inspection', 'consultation', 'follow_up', 'emergency'],
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    default: 60
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'],
    default: 'scheduled'
  },
  purpose: String,
  notes: String,
  reminder: {
    sent: {
      type: Boolean,
      default: false
    },
    sentAt: Date
  },
  completionNotes: String,
  completedAt: Date,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellationReason: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Appointment', appointmentSchema);