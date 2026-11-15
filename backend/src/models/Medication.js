const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema(
  {
    elderlyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Elderly individual ID is required']
    },
    name: {
      type: String,
      required: [true, 'Medication name is required'],
      trim: true
    },
    dosage: {
      type: String,
      required: [true, 'Dosage is required (e.g., 500mg, 1 tablet)'],
      trim: true
    },
    form: {
      type: String,
      enum: ['tablet', 'capsule', 'liquid', 'injection', 'inhaler', 'drops', 'patch', 'other'],
      default: 'tablet'
    },
    frequency: {
      type: String,
      enum: ['daily', 'twice_daily', 'three_times_daily', 'four_times_daily', 'as_needed', 'weekly', 'custom'],
      default: 'daily'
    },
    // Array of 24h format times e.g. ["08:00", "20:00"]
    times: [
      {
        type: String,
        required: true,
        match: [/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Please provide a valid time in HH:mm format']
      }
    ],
    // Time slots categorization for elderly ease of understanding: Morning, Afternoon, Evening, Bedtime
    timeSlots: [
      {
        type: String,
        enum: ['morning', 'afternoon', 'evening', 'bedtime', 'specific']
      }
    ],
    instructions: {
      type: String,
      default: 'Take with a glass of water after food',
      trim: true
    },
    pillColor: {
      type: String,
      enum: ['blue', 'white', 'yellow', 'red', 'green', 'orange', 'purple', 'pink', 'brown'],
      default: 'blue'
    },
    pillShape: {
      type: String,
      enum: ['round', 'oval', 'capsule', 'square', 'drop'],
      default: 'round'
    },
    prescribingDoctor: {
      type: String,
      trim: true,
      default: ''
    },
    purpose: {
      type: String,
      trim: true,
      default: '' // e.g. "For High Blood Pressure", "For Diabetes"
    },
    stockCount: {
      type: Number,
      default: 30
    },
    lowStockThreshold: {
      type: Number,
      default: 7
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
    },
    remindersEnabled: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient querying of patient medications
medicationSchema.index({ elderlyId: 1, isActive: 1 });

module.exports = mongoose.model('Medication', medicationSchema);
