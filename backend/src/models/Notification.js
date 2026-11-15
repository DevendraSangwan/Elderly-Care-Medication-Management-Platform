const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    elderlyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    elderlyName: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: [
        'medication_reminder',
        'medication_missed',
        'medication_taken',
        'consecutive_missed',
        'appointment_reminder',
        'sos_alert',
        'care_activity',
        'refill_reminder',
        'system'
      ],
      required: true,
      index: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    emailSent: {
      type: Boolean,
      default: false
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
