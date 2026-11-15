const mongoose = require('mongoose');

const medicationLogSchema = new mongoose.Schema(
  {
    elderlyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    medicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medication',
      required: true
    },
    medicationName: {
      type: String,
      required: true
    },
    dosage: {
      type: String,
      required: true
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true
    },
    scheduledTime: {
      type: String, // HH:mm (24h)
      required: true
    },
    timeSlot: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'bedtime', 'specific'],
      default: 'morning'
    },
    status: {
      type: String,
      enum: ['pending', 'taken', 'missed', 'skipped'],
      default: 'pending',
      index: true
    },
    takenAt: {
      type: Date
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    markedByName: {
      type: String,
      default: ''
    },
    markedByRole: {
      type: String,
      enum: ['elderly', 'family', 'caregiver', 'system'],
      default: 'elderly'
    },
    notes: {
      type: String,
      default: ''
    },
    reminderSent: {
      type: Boolean,
      default: false
    },
    missedAlertSent: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Compound index for finding dose logs per patient per date
medicationLogSchema.index({ elderlyId: 1, date: 1, scheduledTime: 1 });
medicationLogSchema.index({ elderlyId: 1, status: 1 });

module.exports = mongoose.model('MedicationLog', medicationLogSchema);
