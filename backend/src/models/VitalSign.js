const mongoose = require('mongoose');

const vitalSignSchema = new mongoose.Schema(
  {
    elderlyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recordedByName: {
      type: String,
      required: true
    },
    recordedByRole: {
      type: String,
      default: 'caregiver'
    },
    date: {
      type: Date,
      default: Date.now
    },
    bloodPressureSystolic: {
      type: Number // mmHg
    },
    bloodPressureDiastolic: {
      type: Number // mmHg
    },
    bloodSugar: {
      type: Number // mg/dL
    },
    bloodSugarTiming: {
      type: String,
      enum: ['fasting', 'post_prandial', 'random', 'bedtime'],
      default: 'fasting'
    },
    pulseRate: {
      type: Number // bpm
    },
    oxygenSaturation: {
      type: Number // % SpO2
    },
    temperature: {
      type: Number // °F
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

vitalSignSchema.index({ elderlyId: 1, date: -1 });

module.exports = mongoose.model('VitalSign', vitalSignSchema);
