const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    elderlyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Elderly individual ID is required'],
      index: true
    },
    doctorName: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true
    },
    specialty: {
      type: String,
      trim: true,
      default: 'General Physician'
    },
    clinicLocation: {
      type: String,
      required: [true, 'Clinic or Hospital location is required'],
      trim: true
    },
    date: {
      type: String, // YYYY-MM-DD
      required: [true, 'Appointment date is required'],
      index: true
    },
    time: {
      type: String, // HH:mm
      required: [true, 'Appointment time is required']
    },
    purpose: {
      type: String,
      required: [true, 'Purpose of appointment is required'],
      trim: true
    },
    preparationNotes: {
      type: String,
      default: '',
      trim: true // e.g. "Fasting for 10 hours, bring previous blood report"
    },
    doctorPhone: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
      default: 'scheduled',
      index: true
    },
    reminderEmailSent: {
      type: Boolean,
      default: false
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

appointmentSchema.index({ elderlyId: 1, date: 1, time: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
