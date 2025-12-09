const carePlanSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  diagnosis: {
    type: String,
    required: true
  },
  goals: [{
    description: String,
    targetDate: Date,
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'achieved', 'discontinued'],
      default: 'not_started'
    }
  }],
  interventions: [{
    description: String,
    frequency: String,
    responsible: String
  }],
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date,
    prescribedBy: String
  }],
  dietaryRestrictions: String,
  exerciseRecommendations: String,
  monitoringSchedule: {
    bloodPressure: String,
    heartRate: String,
    glucose: String,
    weight: String
  },
  emergencyProtocol: String,
  reviewSchedule: {
    frequency: String,
    nextReviewDate: Date
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'discontinued'],
    default: 'active'
  },
  updates: [{
    date: Date,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changes: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('CarePlan', carePlanSchema);