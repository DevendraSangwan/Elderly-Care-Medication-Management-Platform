const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  relationship: { type: String, required: true },
  phone: { type: String, required: true },
  isPrimary: { type: Boolean, default: false }
});

const elderlyProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    dateOfBirth: {
      type: Date
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
      default: 'female'
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
      default: 'O+'
    },
    allergies: [
      {
        type: String,
        trim: true
      }
    ],
    medicalConditions: [
      {
        type: String,
        trim: true
      }
    ],
    emergencyContacts: [emergencyContactSchema],
    primaryPhysician: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      clinic: { type: String, default: '' },
      email: { type: String, default: '' }
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zip: { type: String, default: '' }
    },
    notes: {
      type: String,
      default: ''
    },
    caregiverNotes: [
      {
        authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        authorName: { type: String, required: true },
        authorRole: { type: String, default: 'caregiver' },
        note: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    authorizedUsers: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['family', 'caregiver'] },
        permissions: [{ type: String, default: 'full' }],
        addedAt: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ElderlyProfile', elderlyProfileSchema);
