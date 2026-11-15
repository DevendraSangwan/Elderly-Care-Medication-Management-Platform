const mongoose = require('mongoose');

const careActivitySchema = new mongoose.Schema(
  {
    elderlyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    authorName: {
      type: String,
      required: true
    },
    authorRole: {
      type: String,
      enum: ['elderly', 'family', 'caregiver', 'system'],
      default: 'caregiver'
    },
    activityType: {
      type: String,
      enum: [
        'medication_taken',
        'medication_missed',
        'medication_added',
        'medication_updated',
        'appointment_scheduled',
        'appointment_completed',
        'vitals_recorded',
        'care_note',
        'sos_alert',
        'profile_updated'
      ],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

careActivitySchema.index({ elderlyId: 1, createdAt: -1 });

module.exports = mongoose.model('CareActivity', careActivitySchema);
